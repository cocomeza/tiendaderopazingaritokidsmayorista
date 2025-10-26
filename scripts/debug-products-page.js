const puppeteer = require('puppeteer')

async function debugProductsPage() {
  console.log('🔍 DEBUGGING PÁGINA DE PRODUCTOS')
  console.log('================================')

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  })

  try {
    const page = await browser.newPage()
    
    // Capturar errores de consola
    page.on('console', msg => {
      console.log(`🖥️ CONSOLE ${msg.type()}: ${msg.text()}`)
    })
    
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`)
    })

    // Navegar a la página de productos
    console.log('1️⃣ Navegando a la página de productos...')
    await page.goto('http://localhost:3003/productos', { waitUntil: 'networkidle2' })
    
    // Esperar un poco más
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Verificar el título de la página
    const title = await page.title()
    console.log(`📄 Título de la página: ${title}`)
    
    // Verificar si hay errores en la página
    const errorElements = await page.$$('[data-testid="error"], .error, [role="alert"]')
    console.log(`🚨 Elementos de error encontrados: ${errorElements.length}`)
    
    // Buscar cualquier elemento que contenga "producto" o "product"
    const productElements = await page.$$('*')
    let productCount = 0
    for (const element of productElements) {
      const text = await element.evaluate(el => el.textContent || '')
      if (text.toLowerCase().includes('producto') || text.toLowerCase().includes('product')) {
        productCount++
      }
    }
    console.log(`🔍 Elementos que contienen "producto": ${productCount}`)
    
    // Buscar elementos con clases específicas
    const cardElements = await page.$$('.group, [class*="card"], [class*="Card"]')
    console.log(`🃏 Elementos tipo card encontrados: ${cardElements.length}`)
    
    // Buscar imágenes
    const images = await page.$$('img')
    console.log(`🖼️ Imágenes encontradas: ${images.length}`)
    
    // Buscar botones
    const buttons = await page.$$('button')
    console.log(`🔘 Botones encontrados: ${buttons.length}`)
    
    // Buscar SVG (íconos)
    const svgs = await page.$$('svg')
    console.log(`🎨 SVGs encontrados: ${svgs.length}`)
    
    // Verificar el contenido del body
    const bodyText = await page.evaluate(() => document.body.textContent)
    console.log(`📝 Contenido del body (primeros 200 caracteres): ${bodyText.substring(0, 200)}...`)
    
    // Verificar si hay elementos de carga
    const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], .animate-spin')
    console.log(`⏳ Elementos de carga encontrados: ${loadingElements.length}`)
    
    // Tomar screenshot
    await page.screenshot({ path: 'debug-products-page.png', fullPage: true })
    console.log('📸 Screenshot guardado como debug-products-page.png')

  } catch (error) {
    console.error('❌ Error durante el debugging:', error.message)
  } finally {
    await browser.close()
  }
}

debugProductsPage()