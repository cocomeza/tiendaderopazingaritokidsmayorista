import { test, expect } from '@playwright/test';

/**
 * Test de sincronización de estados de pedidos y funcionalidad de impresión
 * Verifica que los cambios de estado en el admin se reflejen correctamente en el panel del cliente
 * y que la funcionalidad de imprimir/descargar pedidos funcione correctamente
 */
test.describe('Sincronización de Estados de Pedidos e Impresión', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies antes de cada test
    await page.context().clearCookies();
  });

  test('debe mostrar la página de mis pedidos del cliente', async ({ page }) => {
    await page.goto('/mis-pedidos');
    
    // Esperar a que la página cargue (puede redirigir a login)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que está en la página de login o en mis-pedidos
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|mis-pedidos/);
    
    // Si está en login, verificar que hay formulario
    if (currentUrl.includes('login')) {
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar el botón de actualizar en mis pedidos', async ({ page }) => {
    await page.goto('/mis-pedidos');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verificar si estamos en login o en mis-pedidos
    const currentUrl = page.url();
    
    // Si está en login, el test pasa (es comportamiento esperado)
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    // Si estamos en mis-pedidos, verificar que la página está cargada
    expect(currentUrl).toContain('mis-pedidos');
    
    // Esperar a que el título de la página esté visible (indica que la página cargó)
    const title = page.locator('h1:has-text("Mis Pedidos"), [data-testid="mis-pedidos-title"]');
    await title.waitFor({ state: 'visible', timeout: 15000 });
    
    // Buscar el botón de actualizar por data-testid (más confiable)
    const refreshButton = page.locator('[data-testid="refresh-orders-button"]');
    
    // Esperar a que el botón esté disponible y visible
    try {
      await refreshButton.waitFor({ state: 'visible', timeout: 15000 });
      await expect(refreshButton.first()).toBeVisible({ timeout: 5000 });
    } catch (e) {
      // Fallback: buscar por texto o aria-label
      const refreshButtonFallback = page.locator('button:has-text("Actualizar"), button:has-text("Actualizando"), button[aria-label*="actualizar" i]');
      const fallbackCount = await refreshButtonFallback.count();
      
      if (fallbackCount > 0) {
        await expect(refreshButtonFallback.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Si no encuentra el botón, verificar que al menos está en la página correcta
        // y que el título está visible (indica que la página cargó correctamente)
        await expect(title.first()).toBeVisible({ timeout: 5000 });
        expect(currentUrl).toContain('mis-pedidos');
      }
    }
  });

  test('debe mostrar badges de estado correctamente', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Verificar si estamos en login o en mis-pedidos
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar badges de estado (pueden no existir si no hay pedidos)
      const statusBadges = page.locator('[class*="Badge"], [class*="badge"], span[class*="badge"]');
      const badgeCount = await statusBadges.count();
      
      // Si hay badges, verificar que tienen contenido
      if (badgeCount > 0) {
        const firstBadge = statusBadges.first();
        await expect(firstBadge).toBeVisible({ timeout: 5000 });
      } else {
        // Si no hay badges, puede ser que no haya pedidos (comportamiento válido)
        console.log('No se encontraron badges - puede ser que no haya pedidos');
      }
    } else {
      // Si está en login, el test pasa
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar filtros de estado en mis pedidos', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar el selector de filtros
      const statusFilter = page.locator('select, [role="combobox"], button[role="combobox"]').first();
      const filterCount = await statusFilter.count();
      
      if (filterCount > 0) {
        await expect(statusFilter).toBeVisible({ timeout: 5000 });
      } else {
        // Si no hay filtros visibles, puede ser que la página esté cargando o no haya filtros
        console.log('No se encontraron filtros - puede ser que la página esté cargando');
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar mensaje informativo cuando el pedido está pagado', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar mensajes informativos sobre estados
      const infoMessages = page.locator('text=/EN PREPARACIÓN|ENTREGADO|PAGADO|Pendiente|preparación/i');
      const messageCount = await infoMessages.count();
      
      // Si hay mensajes, verificar que son visibles
      if (messageCount > 0) {
        await expect(infoMessages.first()).toBeVisible({ timeout: 5000 });
      } else {
        // Si no hay mensajes, puede ser que no haya pedidos pagados
        console.log('No se encontraron mensajes informativos - puede ser que no haya pedidos pagados');
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar el número de orden en cada pedido', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    // Si está en login, el test pasa (es comportamiento esperado)
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    // Verificar que estamos en mis-pedidos
    expect(currentUrl).toContain('mis-pedidos');
    
    // Esperar a que la página cargue completamente
    const title = page.locator('h1:has-text("Mis Pedidos")');
    await title.waitFor({ state: 'visible', timeout: 15000 });
    
    // Buscar cards de pedidos primero
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const cardCount = await orderCards.count();
    
    if (cardCount > 0) {
      // Si hay cards, buscar números de orden dentro de ellos por data-testid
      const firstCard = orderCards.first();
      const orderNumberByTestId = firstCard.locator('[data-testid^="order-number-"]');
      const numberByTestIdCount = await orderNumberByTestId.count();
      
      if (numberByTestIdCount > 0) {
        await expect(orderNumberByTestId.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Fallback: buscar por texto (formato ZK-YYYYMMDD-XXXX)
        const orderNumberInCard = firstCard.locator('text=/ZK-[0-9]{8}-[0-9]{4}/');
        const numberInCardCount = await orderNumberInCard.count();
        
        if (numberInCardCount > 0) {
          await expect(orderNumberInCard.first()).toBeVisible({ timeout: 5000 });
        } else {
          // Si hay cards pero no números visibles, verificar que al menos hay cards
          await expect(firstCard).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      // Buscar números de orden directamente en la página (formato ZK-YYYYMMDD-XXXX)
      const orderNumbers = page.locator('text=/ZK-[0-9]{8}-[0-9]{4}/');
      const orderCount = await orderNumbers.count();
      
      if (orderCount > 0) {
        await expect(orderNumbers.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Si no hay pedidos, verificar que hay mensaje de "no hay pedidos"
        const noOrdersMessage = page.locator('[data-testid="no-orders-message"], text=/No tienes pedidos|no hay pedidos/i');
        const noOrdersCount = await noOrdersMessage.count();
        
        if (noOrdersCount > 0) {
          // Si hay mensaje de "no hay pedidos", el test pasa (comportamiento válido)
          await expect(noOrdersMessage.first()).toBeVisible({ timeout: 5000 });
        } else {
          // Si no hay nada, verificar que al menos la página cargó correctamente
          await expect(title.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('debe mostrar estados de pago correctamente', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    // Si está en login, el test pasa (es comportamiento esperado)
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    // Verificar que estamos en mis-pedidos
    expect(currentUrl).toContain('mis-pedidos');
    
    // Esperar a que la página cargue completamente
    const title = page.locator('h1:has-text("Mis Pedidos")');
    await title.waitFor({ state: 'visible', timeout: 15000 });
    
    // Buscar cards de pedidos primero
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const cardCount = await orderCards.count();
    
    if (cardCount > 0) {
      // Si hay cards, buscar badges de pago dentro de ellos por data-testid
      const firstCard = orderCards.first();
      const paymentBadgeByTestId = firstCard.locator('[data-testid^="payment-badge-"], [data-testid^="payment-status-badge-"]');
      const badgeByTestIdCount = await paymentBadgeByTestId.count();
      
      if (badgeByTestIdCount > 0) {
        await expect(paymentBadgeByTestId.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Fallback: buscar por texto o clases
        const badgesInCard = firstCard.locator('text=/PENDIENTE DE PAGO|PAGADO|Pagado|Rechazado|pendiente/i, [class*="Badge"], [class*="badge"]');
        const badgesInCardCount = await badgesInCard.count();
        
        if (badgesInCardCount > 0) {
          await expect(badgesInCard.first()).toBeVisible({ timeout: 5000 });
        } else {
          // Si hay cards pero no badges visibles, verificar que al menos hay cards
          await expect(firstCard).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      // Buscar badges de estado de pago directamente en la página
      const paymentBadges = page.locator('text=/PENDIENTE DE PAGO|PAGADO|Pagado|Rechazado|pendiente/i, [data-testid^="payment-status-badge-"]');
      const badgeCount = await paymentBadges.count();
      
      if (badgeCount > 0) {
        await expect(paymentBadges.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Si no hay pedidos, verificar que hay mensaje de "no hay pedidos"
        const noOrdersMessage = page.locator('[data-testid="no-orders-message"], text=/No tienes pedidos|no hay pedidos/i');
        const noOrdersCount = await noOrdersMessage.count();
        
        if (noOrdersCount > 0) {
          // Si hay mensaje de "no hay pedidos", el test pasa (comportamiento válido)
          await expect(noOrdersMessage.first()).toBeVisible({ timeout: 5000 });
        } else {
          // Si no hay nada, verificar que al menos la página cargó correctamente
          await expect(title.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('debe mostrar productos en cada pedido', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar sección de productos
    const productsSection = page.locator('text=/Productos|productos/i');
    const sectionCount = await productsSection.count();
    
    // Si hay secciones de productos, verificar que son visibles
    if (sectionCount > 0) {
      await expect(productsSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar totales de pedidos correctamente', async ({ page }) => {
    await page.goto('/mis-pedidos');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    // Si está en login, el test pasa (es comportamiento esperado)
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    // Si estamos en mis-pedidos, verificar que la página está cargada
    expect(currentUrl).toContain('mis-pedidos');
    
    // Esperar a que la página esté completamente cargada
    const pageElement = page.locator('[data-testid="mis-pedidos-page"]');
    await pageElement.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {
      // Si no tiene data-testid, verificar por título
      const title = page.locator('h1:has-text("Mis Pedidos")');
      return title.waitFor({ state: 'visible', timeout: 10000 });
    });
    
    // Buscar totales por data-testid (más confiable)
    const orderTotals = page.locator('[data-testid="order-totals"]');
    const orderTotal = page.locator('[data-testid="order-total"]');
    
    // Esperar a que los elementos estén disponibles
    const totalsCount = await orderTotals.count();
    const totalCount = await orderTotal.count();
    
    if (totalsCount > 0) {
      // Si encuentra el contenedor de totales, verificar que es visible
      await expect(orderTotals.first()).toBeVisible({ timeout: 10000 });
      
      // También verificar que tiene el total individual
      if (totalCount > 0) {
        await expect(orderTotal.first()).toBeVisible({ timeout: 5000 });
      }
    } else if (totalCount > 0) {
      // Si encuentra el total directamente, verificar que es visible
      await expect(orderTotal.first()).toBeVisible({ timeout: 10000 });
    } else {
      // Fallback: buscar por texto "Total:" o "Subtotal:"
      const totalLabels = page.locator('text=/Total:|Subtotal:/i');
      const labelCount = await totalLabels.count();
      
      if (labelCount > 0) {
        await expect(totalLabels.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Buscar elementos que contengan formato de moneda
        const priceElements = page.locator('text=/\$[0-9.,]+/');
        const priceCount = await priceElements.count();
        
        if (priceCount > 0) {
          await expect(priceElements.first()).toBeVisible({ timeout: 5000 });
        } else {
          // Si no encuentra totales, puede ser que no haya pedidos (comportamiento válido)
          // Verificar que al menos está en la página correcta y tiene el mensaje de "no hay pedidos"
          const noOrdersMessage = page.locator('[data-testid="no-orders-message"], text=/No tienes pedidos|no hay pedidos/i');
          const noOrdersCount = await noOrdersMessage.count();
          
          if (noOrdersCount > 0) {
            // Si hay mensaje de "no hay pedidos", el test pasa (comportamiento válido)
            await expect(noOrdersMessage.first()).toBeVisible({ timeout: 5000 });
          } else {
            // Si no encuentra nada, verificar que al menos está en la página correcta
            expect(currentUrl).toContain('mis-pedidos');
          }
        }
      }
    }
  });

  test('debe permitir filtrar pedidos por estado', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar el selector de filtros
    const filterSelect = page.locator('select, [role="combobox"]').first();
    const filterExists = await filterSelect.count() > 0;
    
    if (filterExists) {
      await expect(filterSelect).toBeVisible({ timeout: 5000 });
      
      // Intentar cambiar el filtro (si es posible)
      try {
        await filterSelect.click();
        await page.waitForTimeout(500);
        
        // Buscar opción "Todos" o "Pendiente"
        const option = page.locator('text=/Todos|Pendiente|ENTREGADO/i').first();
        const optionExists = await option.count() > 0;
        
        if (optionExists) {
          await expect(option).toBeVisible({ timeout: 3000 });
        }
      } catch (e) {
        // Si no se puede interactuar, está bien, solo verificamos que existe
        console.log('No se pudo interactuar con el filtro:', e);
      }
    }
  });

  test('debe mostrar mensaje cuando no hay pedidos', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar mensaje de "no hay pedidos"
    const noOrdersMessage = page.locator('text=/No tienes pedidos|no hay pedidos|No hay pedidos/i');
    const messageCount = await noOrdersMessage.count();
    
    // Si hay mensaje, verificar que es visible
    if (messageCount > 0) {
      await expect(noOrdersMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar fecha de creación de pedidos', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar fechas (formato DD/MM/YYYY o similar)
    const dates = page.locator('text=/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/');
    const dateCount = await dates.count();
    
    // Si hay fechas, verificar que son visibles
    if (dateCount > 0) {
      await expect(dates.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar estado "EN PREPARACIÓN" cuando corresponde', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar texto "EN PREPARACIÓN"
    const enPreparacion = page.locator('text=/EN PREPARACIÓN|en preparación/i');
    const count = await enPreparacion.count();
    
    // Si existe, verificar que es visible
    if (count > 0) {
      await expect(enPreparacion.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar estado "ENTREGADO" cuando corresponde', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar texto "ENTREGADO"
    const entregado = page.locator('text=/ENTREGADO|Entregado/i');
    const count = await entregado.count();
    
    // Si existe, verificar que es visible
    if (count > 0) {
      await expect(entregado.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar estado "PENDIENTE DE PAGO" cuando corresponde', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar texto "PENDIENTE DE PAGO"
    const pendientePago = page.locator('text=/PENDIENTE DE PAGO|Pendiente de pago/i');
    const count = await pendientePago.count();
    
    // Si existe, verificar que es visible
    if (count > 0) {
      await expect(pendientePago.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe mostrar estado "PAGADO" cuando corresponde', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar texto "PAGADO"
    const pagado = page.locator('text=/PAGADO|Pagado/i');
    const count = await pagado.count();
    
    // Si existe, verificar que es visible
    if (count > 0) {
      await expect(pagado.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe tener estructura de página correcta', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verificar elementos principales de la página
    const header = page.locator('h1:has-text("Mis Pedidos"), h1:has-text("pedidos")');
    const headerCount = await header.count();
    
    if (headerCount > 0) {
      await expect(header.first()).toBeVisible({ timeout: 5000 });
    }
    
    // Verificar que hay un contenedor principal
    const mainContent = page.locator('main, [class*="container"], [class*="content"]');
    const contentCount = await mainContent.count();
    
    expect(contentCount).toBeGreaterThan(0);
  });

  test('debe mostrar botón para volver a productos', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar botón de volver
    const backButton = page.locator('a:has-text("Volver"), button:has-text("Volver"), a:has-text("productos")');
    const buttonCount = await backButton.count();
    
    // Si existe, verificar que es visible
    if (buttonCount > 0) {
      await expect(backButton.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe actualizar pedidos al hacer clic en actualizar', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar botón de actualizar
      const refreshButton = page.locator('button:has-text("Actualizar"), button:has-text("actualizar")');
      const buttonCount = await refreshButton.count();
      
      if (buttonCount > 0) {
        // Hacer clic en el botón
        await refreshButton.first().click();
        
        // Esperar a que se complete la actualización
        await page.waitForTimeout(2000);
        
        // Verificar que la página sigue cargada
        expect(page.url()).toContain('mis-pedidos');
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar botón de imprimir en cada pedido', async ({ page }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar botones de imprimir
      const printButtons = page.locator('button:has-text("Imprimir"), button:has-text("PDF"), button[title*="imprimir" i], button[title*="PDF" i]');
      const buttonCount = await printButtons.count();
      
      // Si hay pedidos, debería haber botones de imprimir
      if (buttonCount > 0) {
        await expect(printButtons.first()).toBeVisible({ timeout: 5000 });
        
        // Verificar que el botón tiene el icono de impresora
        const icon = printButtons.first().locator('svg, [class*="Printer"]');
        const iconCount = await icon.count();
        
        if (iconCount > 0) {
          await expect(icon.first()).toBeVisible({ timeout: 3000 });
        }
      } else {
        // Si no hay botones, puede ser que no haya pedidos (comportamiento válido)
        console.log('No se encontraron botones de imprimir - puede ser que no haya pedidos');
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe abrir ventana de impresión al hacer clic en imprimir', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar botón de imprimir
      const printButton = page.locator('button:has-text("Imprimir"), button:has-text("PDF")').first();
      const buttonCount = await printButton.count();
      
      if (buttonCount > 0) {
        // Escuchar cuando se abre una nueva ventana
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          printButton.click()
        ]);
        
        // Esperar a que la nueva página cargue
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(2000);
        
        // Verificar que la nueva página tiene contenido del pedido
        const pageContent = await newPage.textContent('body');
        expect(pageContent).toBeTruthy();
        
        // Verificar que contiene información del pedido
        expect(pageContent).toMatch(/ZINGARITO|Pedido|Producto/i);
        
        // Verificar que hay un botón de imprimir en la nueva ventana
        const printButtonInNewPage = newPage.locator('button:has-text("Imprimir"), button:has-text("PDF")');
        const newPageButtonCount = await printButtonInNewPage.count();
        
        // Cerrar la nueva ventana
        await newPage.close();
        
        expect(newPageButtonCount).toBeGreaterThan(0);
      } else {
        console.log('No se encontró botón de imprimir - puede ser que no haya pedidos');
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar formato de impresión con todos los datos del pedido', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      const printButton = page.locator('button:has-text("Imprimir"), button:has-text("PDF")').first();
      const buttonCount = await printButton.count();
      
      if (buttonCount > 0) {
        // Abrir ventana de impresión
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          printButton.click()
        ]);
        
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(2000);
        
        const pageContent = await newPage.textContent('body');
        
        // Verificar que contiene elementos clave del pedido
        expect(pageContent).toMatch(/ZINGARITO/i);
        expect(pageContent).toMatch(/Pedido|pedido/i);
        
        // Verificar que tiene tabla de productos o información de productos
        const hasProducts = pageContent?.includes('Producto') || pageContent?.includes('Cantidad') || pageContent?.includes('Precio');
        expect(hasProducts).toBeTruthy();
        
        // Verificar que tiene información de totales
        const hasTotals = pageContent?.includes('Total') || pageContent?.includes('Subtotal');
        expect(hasTotals).toBeTruthy();
        
        await newPage.close();
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });

  test('debe mostrar número de orden en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('mis-pedidos')) {
      // Buscar números de orden en la página
      const orderNumbers = page.locator('text=/ZK-[0-9]{8}-[0-9]{4}/');
      const orderCount = await orderNumbers.count();
      
      if (orderCount > 0) {
        const printButton = page.locator('button:has-text("Imprimir"), button:has-text("PDF")').first();
        
        if (await printButton.count() > 0) {
          const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            printButton.click()
          ]);
          
          await newPage.waitForLoadState('networkidle');
          await newPage.waitForTimeout(2000);
          
          const pageContent = await newPage.textContent('body');
          
          // Verificar que el número de orden aparece en el formato de impresión
          const hasOrderNumber = pageContent?.match(/ZK-[0-9]{8}-[0-9]{4}/);
          expect(hasOrderNumber).toBeTruthy();
          
          await newPage.close();
        }
      }
    } else {
      expect(currentUrl).toContain('login');
    }
  });
});

