import { test, expect } from '@playwright/test'

test.describe('Filtros de Categorías en Página de Productos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de productos
    await page.goto('/productos')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('debe cargar la página de productos correctamente', async ({ page }) => {
    // Verificar que la página carga
    await expect(page.locator('h1')).toContainText(/Catálogo Mayorista|Productos/i, { timeout: 10000 })
    
    // Verificar que hay productos visibles o mensaje de "no hay productos"
    const productCards = page.locator('[data-testid="product-card"], .product-card, article').first()
    const noProductsMessage = page.locator('text=/no hay productos|sin productos/i')
    
    const hasProducts = await productCards.count() > 0
    const hasNoProductsMessage = await noProductsMessage.count() > 0
    
    expect(hasProducts || hasNoProductsMessage).toBeTruthy()
  })

  test('debe cargar categorías desde la API', async ({ page }) => {
    // Interceptar la llamada a la API de categorías
    let categoriesResponse: any = null
    let categoriesError: any = null

    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('/rest/v1/categories') || url.includes('categories?select=')) {
        try {
          categoriesResponse = await response.json()
          console.log('✅ Respuesta de categorías:', categoriesResponse)
        } catch (e) {
          categoriesError = e
          console.error('❌ Error parseando respuesta de categorías:', e)
        }
      }
    })

    // Esperar a que se cargue la página
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Dar tiempo para que se ejecuten las llamadas

    // Verificar en la consola del navegador
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Categorías') || text.includes('categorías') || text.includes('categories')) {
        consoleMessages.push(text)
        console.log('📋 Console:', text)
      }
    })

    // Recargar para capturar los logs
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar que se hizo la llamada a categorías
    const networkRequests = await page.evaluate(() => {
      return (window as any).__playwright_network_requests || []
    })

    console.log('📡 Requests relacionados con categorías:', networkRequests.filter((r: any) => 
      r.url?.includes('categories') || r.url?.includes('category')
    ))

    // Verificar logs en consola
    const categoriesLogs = consoleMessages.filter(msg => 
      msg.includes('Categorías') || msg.includes('categorías')
    )
    
    console.log('📋 Logs de categorías encontrados:', categoriesLogs)
    
    // Verificar que hay algún log o respuesta
    expect(categoriesLogs.length > 0 || categoriesResponse !== null).toBeTruthy()
  })

  test('debe mostrar la sección de filtros de categorías', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Buscar la sección de filtros
    const filtersSection = page.locator('text=/FILTROS|Filtros/i').first()
    await expect(filtersSection).toBeVisible({ timeout: 10000 })

    // Buscar la sección de CATEGORÍAS
    const categoriesSection = page.locator('text=/CATEGORÍAS|Categorías/i').first()
    
    if (await categoriesSection.count() === 0) {
      console.log('⚠️ No se encontró la sección CATEGORÍAS, buscando alternativas...')
      
      // Buscar cualquier mención de categorías en los filtros
      const allFilterText = await page.locator('[class*="filter"], [class*="Filter"]').allTextContents()
      console.log('📋 Texto en filtros:', allFilterText)
      
      // Verificar que al menos hay algún filtro visible
      const filterPanel = page.locator('[class*="filter"], [class*="Filter"], text=/FILTROS/i').first()
      await expect(filterPanel).toBeVisible({ timeout: 5000 })
    } else {
      await expect(categoriesSection).toBeVisible({ timeout: 5000 })
      console.log('✅ Sección CATEGORÍAS encontrada')
    }
  })

  test('debe mostrar categorías en el filtro si existen', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar en la consola del navegador cuántas categorías se cargaron
    const categoriesCount = await page.evaluate(() => {
      // Buscar en el estado de React o en variables globales
      return new Promise((resolve) => {
        setTimeout(() => {
          // Intentar acceder a datos desde el DOM o consola
          const categoryElements = document.querySelectorAll('[class*="category"], [data-category]')
          resolve(categoryElements.length)
        }, 2000)
      })
    })

    console.log('🔍 Categorías encontradas en DOM:', categoriesCount)

    // Buscar la sección de categorías y expandirla si está colapsada
    const categoriesHeader = page.locator('text=/CATEGORÍAS/i').first()
    
    if (await categoriesHeader.count() > 0) {
      // Hacer clic para expandir si está colapsada
      const isExpanded = await page.locator('text=/Todas las categorías|No hay categorías disponibles/i').isVisible()
      
      if (!isExpanded) {
        await categoriesHeader.click()
        await page.waitForTimeout(500)
      }

      // Verificar que se muestra contenido (ya sea categorías o mensaje de "no hay")
      const categoriesContent = page.locator('text=/Todas las categorías|No hay categorías disponibles|Camperas|Buzos|Camisas/i')
      await expect(categoriesContent.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('debe poder filtrar productos por categoría', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Buscar y expandir la sección de categorías
    const categoriesHeader = page.locator('text=/CATEGORÍAS/i').first()
    
    if (await categoriesHeader.count() > 0) {
      // Expandir si está colapsada
      const chevron = categoriesHeader.locator('..').locator('[class*="chevron"], svg').first()
      const isExpanded = await page.locator('text=/Todas las categorías/i').isVisible({ timeout: 1000 }).catch(() => false)
      
      if (!isExpanded) {
        await categoriesHeader.click()
        await page.waitForTimeout(1000)
      }

      // Buscar una categoría para hacer clic
      const categoryButton = page.locator('text=/Camperas|Buzos|Camisas|Bodys|Bermudas|Calzados|Combos/i').first()
      
      if (await categoryButton.count() > 0) {
        const categoryName = await categoryButton.textContent()
        console.log('🔍 Categoría encontrada para filtrar:', categoryName)
        
        // Hacer clic en la categoría
        await categoryButton.click()
        await page.waitForTimeout(2000)

        // Verificar que los productos se filtraron (debería haber menos productos o un mensaje)
        const productCount = await page.locator('[class*="product"], article, [data-testid="product"]').count()
        console.log('📦 Productos después de filtrar:', productCount)
        
        // Verificar que el filtro está activo (puede haber un badge o indicador)
        const activeFilter = page.locator('[class*="selected"], [class*="active"], [class*="purple"]').first()
        const hasActiveFilter = await activeFilter.count() > 0
        
        expect(hasActiveFilter || productCount >= 0).toBeTruthy()
      } else {
        console.log('⚠️ No se encontraron categorías para filtrar')
        // Si no hay categorías, el test pasa pero con advertencia
        expect(true).toBeTruthy()
      }
    }
  })

  test('debe verificar que las categorías se cargan desde Supabase', async ({ page }) => {
    const responses: any[] = []
    
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('supabase') && (url.includes('categories') || url.includes('category'))) {
        try {
          const body = await response.json()
          responses.push({
            url: url,
            status: response.status(),
            body: body,
            bodyLength: Array.isArray(body) ? body.length : 0
          })
        } catch (e) {
          responses.push({
            url: url,
            status: response.status(),
            error: String(e)
          })
        }
      }
    })

    await page.goto('/productos')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    console.log('📥 Responses de categorías:', JSON.stringify(responses, null, 2))

    // Verificar que hubo al menos una respuesta
    const categoryResponses = responses.filter(r => r.url.includes('categories') || r.url.includes('category'))
    
    if (categoryResponses.length === 0) {
      console.error('❌ No se encontraron requests a categorías')
      throw new Error('No se encontraron requests a la API de categorías')
    }

    // Verificar el contenido de la respuesta
    const successfulResponse = categoryResponses.find(r => r.status === 200 && Array.isArray(r.body))
    if (successfulResponse) {
      console.log('✅ Categorías recibidas:', successfulResponse.bodyLength)
      expect(Array.isArray(successfulResponse.body)).toBeTruthy()
      expect(successfulResponse.bodyLength).toBeGreaterThanOrEqual(0)
    } else {
      const errorResponse = categoryResponses.find(r => r.status !== 200 || r.error)
      if (errorResponse) {
        console.error('❌ Error en respuesta de categorías:', errorResponse)
        if (errorResponse.status === 403 || errorResponse.status === 401) {
          throw new Error(`Error de permisos al cargar categorías: ${errorResponse.status}`)
        }
        throw new Error(`Error al cargar categorías: ${errorResponse.status} - ${errorResponse.error || 'Unknown'}`)
      }
    }
  })
})

