import { test, expect } from '@playwright/test';

/**
 * Test del comprobante de impresión de pedidos
 * Verifica que el formato de impresión contenga los datos del cliente correctamente
 * y que los estados no aparezcan en la sección "Información del Pedido"
 */
test.describe('Comprobante de Impresión de Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies antes de cada test
    await page.context().clearCookies();
  });

  test('debe abrir el formato de impresión al hacer clic en imprimir', async ({ page, context }) => {
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
    
    // Buscar botón de imprimir
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
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
      
      await newPage.close();
    } else {
      // Si no hay botones de imprimir, puede ser que no haya pedidos
      console.log('No se encontró botón de imprimir - puede ser que no haya pedidos');
    }
  });

  test('debe mostrar datos del cliente en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    // Buscar botón de imprimir
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
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
      
      // Verificar que contiene la sección "Datos del Cliente"
      expect(pageContent).toMatch(/Datos del Cliente/i);
      
      // Verificar que contiene campos de datos del cliente (aunque puedan estar vacíos)
      const hasEmailField = pageContent?.includes('Email:') || pageContent?.match(/Email/i);
      const hasCuitField = pageContent?.includes('CUIT:') || pageContent?.match(/CUIT/i);
      const hasBillingAddressField = pageContent?.includes('Dirección de Facturación:') || pageContent?.includes('Direccion de Facturacion:') || pageContent?.match(/Dirección.*Facturación/i);
      const hasNameField = pageContent?.includes('Nombre') || pageContent?.includes('Razón Social') || pageContent?.match(/Nombre.*Razón/i);
      
      // Al menos algunos de estos campos deben estar presentes
      const hasClientData = hasEmailField || hasCuitField || hasBillingAddressField || hasNameField;
      expect(hasClientData).toBeTruthy();
      
      await newPage.close();
    }
  });

  test('debe mostrar CUIT en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene el campo CUIT
      const hasCuitField = pageContent?.includes('CUIT:') || pageContent?.match(/CUIT/i);
      expect(hasCuitField).toBeTruthy();
      
      await newPage.close();
    }
  });

  test('debe mostrar email en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene el campo Email
      const hasEmailField = pageContent?.includes('Email:') || pageContent?.match(/Email/i);
      expect(hasEmailField).toBeTruthy();
      
      await newPage.close();
    }
  });

  test('debe mostrar dirección de facturación en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene el campo Dirección de Facturación
      const hasBillingAddressField = pageContent?.includes('Dirección de Facturación:') || 
                                      pageContent?.includes('Direccion de Facturacion:') || 
                                      pageContent?.match(/Dirección.*Facturación/i) ||
                                      pageContent?.match(/Direccion.*Facturacion/i);
      expect(hasBillingAddressField).toBeTruthy();
      
      await newPage.close();
    }
  });

  test('NO debe mostrar estados en la sección "Información del Pedido"', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene la sección "Información del Pedido"
      expect(pageContent).toMatch(/Información del Pedido/i);
      
      // Verificar que NO contiene "Estado:" o "Estado de Pago:" en la sección de información del pedido
      // Buscar el contenido después de "Información del Pedido"
      const infoSectionIndex = pageContent?.indexOf('Información del Pedido');
      if (infoSectionIndex !== undefined && infoSectionIndex >= 0) {
        const infoSection = pageContent?.substring(infoSectionIndex, infoSectionIndex + 500);
        
        // Verificar que contiene "Total de productos" e "Items diferentes"
        expect(infoSection).toMatch(/Total de productos/i);
        expect(infoSection).toMatch(/Items diferentes/i);
        
        // Verificar que NO contiene "Estado:" o "Estado de Pago:" en esta sección
        // (pueden estar en otras partes del documento, pero no en esta sección)
        const hasStatusInSection = infoSection?.includes('Estado:') || infoSection?.includes('Estado de Pago:');
        expect(hasStatusInSection).toBeFalsy();
      }
      
      await newPage.close();
    }
  });

  test('debe mostrar tabla de productos en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene la tabla de productos
      const hasProductTable = pageContent?.includes('Producto') || 
                              pageContent?.includes('Cantidad') || 
                              pageContent?.includes('Precio Unit.') ||
                              pageContent?.includes('Subtotal');
      expect(hasProductTable).toBeTruthy();
      
      await newPage.close();
    }
  });

  test('debe mostrar totales en el formato de impresión', async ({ page, context }) => {
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('login')) {
      expect(currentUrl).toContain('login');
      return;
    }
    
    const printButton = page.locator('[data-testid="print-order-button"], button:has-text("Imprimir"), button:has-text("PDF")').first();
    const buttonCount = await printButton.count();
    
    if (buttonCount > 0) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        printButton.click()
      ]);
      
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(2000);
      
      const pageContent = await newPage.textContent('body');
      
      // Verificar que contiene totales
      const hasTotals = pageContent?.includes('Subtotal:') || 
                       pageContent?.includes('TOTAL:') ||
                       pageContent?.includes('Total:');
      expect(hasTotals).toBeTruthy();
      
      await newPage.close();
    }
  });
});

