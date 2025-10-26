const puppeteer = require('puppeteer')

async function testFavoritesFrontend() {
  console.log('🧪 PROBANDO FAVORITOS DESDE EL FRONTEND')
  console.log('=====================================')

  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar el navegador para debugging
    defaultViewport: null,
    args: ['--start-maximized']
  })

  try {
    const page = await browser.newPage()
    
    // Navegar a la página de productos
    console.log('1️⃣ Navegando a la página de productos...')
    await page.goto('http://localhost:3003/productos', { waitUntil: 'networkidle2' })
    
    // Esperar a que carguen los productos
    await page.waitForSelector('[data-testid="product-card"], .group', { timeout: 10000 })
    console.log('✅ Página de productos cargada')

    // Buscar el botón de favoritos (corazón)
    console.log('2️⃣ Buscando botones de favoritos...')
    const heartButtons = await page.$$('button:has(svg[class*="Heart"])')
    
    if (heartButtons.length === 0) {
      console.log('⚠️ No se encontraron botones de favoritos')
      
      // Buscar alternativamente por el ícono de corazón
      const heartIcons = await page.$$('svg[class*="Heart"]')
      console.log(`🔍 Encontrados ${heartIcons.length} íconos de corazón`)
      
      if (heartIcons.length > 0) {
        // Buscar el botón padre
        const parentButtons = await page.$$('button')
        console.log(`🔍 Encontrados ${parentButtons.length} botones en total`)
        
        // Buscar botones que contengan el ícono de corazón
        for (let i = 0; i < parentButtons.length; i++) {
          const button = parentButtons[i]
          const heartIcon = await button.$('svg[class*="Heart"]')
          if (heartIcon) {
            console.log(`✅ Encontrado botón de favoritos en posición ${i}`)
            heartButtons.push(button)
            break
          }
        }
      }
    }

    if (heartButtons.length === 0) {
      console.log('❌ No se pudieron encontrar botones de favoritos')
      
      // Tomar screenshot para debugging
      await page.screenshot({ path: 'debug-no-favorites.png', fullPage: true })
      console.log('📸 Screenshot guardado como debug-no-favorites.png')
      return
    }

    console.log(`✅ Encontrados ${heartButtons.length} botones de favoritos`)

    // Hacer clic en el primer botón de favoritos
    console.log('3️⃣ Haciendo clic en el primer botón de favoritos...')
    await heartButtons[0].click()
    
    // Esperar un momento para que se procese
    await page.waitForTimeout(2000)

    // Verificar si apareció algún mensaje de toast o notificación
    console.log('4️⃣ Verificando notificaciones...')
    const toastElements = await page.$$('[data-sonner-toast], .toast, [role="alert"]')
    console.log(`🔔 Encontradas ${toastElements.length} notificaciones`)

    // Verificar si el usuario está autenticado
    console.log('5️⃣ Verificando estado de autenticación...')
    const loginButton = await page.$('a[href*="login"], button:has-text("Iniciar sesión")')
    const userMenu = await page.$('[data-testid="user-menu"], .user-menu')
    
    if (loginButton && !userMenu) {
      console.log('⚠️ Usuario no autenticado - redirigiendo a login')
      
      // Verificar si se redirigió a login
      await page.waitForTimeout(3000)
      const currentUrl = page.url()
      console.log(`📍 URL actual: ${currentUrl}`)
      
      if (currentUrl.includes('/auth/login')) {
        console.log('✅ Redirección a login funcionando correctamente')
      } else {
        console.log('❌ No se redirigió a login como se esperaba')
      }
    } else {
      console.log('✅ Usuario autenticado - probando funcionalidad de favoritos')
      
      // Verificar si el botón cambió de estado
      const heartIcon = await heartButtons[0].$('svg[class*="Heart"]')
      if (heartIcon) {
        const classes = await heartIcon.evaluate(el => el.className)
        console.log(`🎨 Clases del ícono: ${classes}`)
        
        if (classes.includes('fill-current')) {
          console.log('✅ El producto se agregó a favoritos (ícono lleno)')
        } else {
          console.log('⚠️ El ícono no cambió de estado')
        }
      }
    }

    // Navegar a la página de favoritos
    console.log('6️⃣ Navegando a la página de favoritos...')
    await page.goto('http://localhost:3003/favoritos', { waitUntil: 'networkidle2' })
    
    // Verificar si hay productos en favoritos
    const favoriteProducts = await page.$$('[data-testid="product-card"], .group')
    console.log(`❤️ Productos en favoritos: ${favoriteProducts.length}`)

    if (favoriteProducts.length > 0) {
      console.log('✅ La funcionalidad de favoritos está funcionando correctamente')
    } else {
      console.log('⚠️ No se encontraron productos en favoritos')
    }

    // Tomar screenshot final
    await page.screenshot({ path: 'favorites-test-result.png', fullPage: true })
    console.log('📸 Screenshot final guardado como favorites-test-result.png')

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
    
    // Tomar screenshot del error
    try {
      await page.screenshot({ path: 'favorites-test-error.png', fullPage: true })
      console.log('📸 Screenshot del error guardado como favorites-test-error.png')
    } catch (screenshotError) {
      console.error('❌ Error tomando screenshot:', screenshotError.message)
    }
  } finally {
    await browser.close()
  }
}

testFavoritesFrontend()

