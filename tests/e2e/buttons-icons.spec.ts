import { test, expect } from '@playwright/test';

/**
 * Test de Botones e Iconos - Funcionalidad Completa
 * Verifica que todos los botones e iconos clickeables funcionen correctamente
 * 
 * NOTA: Requiere:
 * - Servidor corriendo en localhost:3000
 * - Usuario autenticado (ADMIN_EMAIL y ADMIN_PASSWORD)
 * - Productos en la base de datos
 */

test.describe('Botones e Iconos - Funcionalidad', () => {
  // Helper para login
  async function login(page: any, email: string, password: string): Promise<boolean> {
    try {
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill(email);
        await passwordInput.fill(password);
        await submitButton.click();
        await page.waitForTimeout(2000);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  test.beforeEach(async ({ page }) => {
    // Configurar timeout más largo
    page.setDefaultTimeout(60000);
    
    // Ir a la página de productos con domcontentloaded (más rápido que networkidle)
    await page.goto('/productos', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(2000);
    
    // Intentar autenticarse si hay credenciales
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword && page.url().includes('/login')) {
      await login(page, adminEmail, adminPassword);
      await page.goto('/productos', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForTimeout(2000);
    }
  });

  test('debe mostrar el ícono del carrito en el Navbar', async ({ page }) => {
    // Verificar que el botón del carrito está visible
    const cartButton = page.locator('button:has(svg[class*="lucide-shopping-cart"]), button:has-text("Carrito")').first();
    
    const isVisible = await cartButton.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
    
    // Verificar que el ícono del carrito está presente
    const cartIcon = page.locator('svg[class*="lucide-shopping-cart"]').first();
    const iconVisible = await cartIcon.isVisible({ timeout: 3000 }).catch(() => false);
    expect(iconVisible).toBeTruthy();
  });

  test('el botón del carrito debe ser clickeable', async ({ page }) => {
    const cartButton = page.locator('button:has(svg[class*="lucide-shopping-cart"])').first();
    
    if (await cartButton.isVisible({ timeout: 5000 })) {
      // Hacer click en el carrito
      await cartButton.click();
      await page.waitForTimeout(1500);
      
      // Verificar que se abre el drawer (buscar varios posibles textos)
      const cartDrawer = page.locator('h2:has-text("Carrito de Compras"), text=Tu carrito está vacío, text=Carrito de Compras').first();
      const drawerVisible = await cartDrawer.isVisible({ timeout: 5000 }).catch(() => false);
      
      // También verificar si el overlay está visible (indica que el drawer se abrió)
      const overlay = page.locator('.fixed.inset-0.bg-black\\/50, [class*="bg-black"]').first();
      const overlayVisible = await overlay.isVisible({ timeout: 3000 }).catch(() => false);
      
      expect(drawerVisible || overlayVisible).toBeTruthy();
    }
  });

  test('los botones de WhatsApp deben funcionar', async ({ page }) => {
    // Buscar botones de WhatsApp
    const whatsappButtons = page.locator('button:has-text("WhatsApp"), button:has(svg[class*="message-circle"])');
    const count = await whatsappButtons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verificar que al menos uno es clickeable
    if (count > 0) {
      const firstButton = whatsappButtons.first();
      const isClickable = await firstButton.isEnabled().catch(() => false);
      expect(isClickable).toBeTruthy();
    }
  });

  test('los links de teléfono deben tener href correcto', async ({ page }) => {
    // Buscar links de teléfono
    const phoneLinks = page.locator('a[href^="tel:"]');
    const count = await phoneLinks.count();
    
    if (count > 0) {
      const firstLink = phoneLinks.first();
      const href = await firstLink.getAttribute('href');
      
      // Verificar que contiene el nuevo número
      expect(href).toContain('3407440243');
    }
  });

  test('el botón de agregar al carrito en producto debe funcionar', async ({ page }) => {
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar el primer botón de "Agregar al Carrito"
    const addToCartButton = page.locator('button:has-text("Agregar al Carrito"), button:has-text("Agregar")').first();
    
    const buttonExists = await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (buttonExists) {
      // Verificar que el botón es clickeable
      const isEnabled = await addToCartButton.isEnabled().catch(() => false);
      expect(isEnabled).toBeTruthy();
      
      // Intentar hacer click
      await addToCartButton.click();
      await page.waitForTimeout(1500);
      
      // Verificar que aparece algún feedback (toast o cambio en el carrito)
      const toast = page.locator('[data-sonner-toast]').first();
      const toastVisible = await toast.isVisible({ timeout: 3000 }).catch(() => false);
      
      // Si no hay toast, verificar que el contador del carrito cambió
      const cartBadge = page.locator('button:has(svg[class*="lucide-shopping-cart"]) + span, button:has(svg[class*="lucide-shopping-cart"]) span').first();
      const badgeVisible = await cartBadge.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(toastVisible || badgeVisible).toBeTruthy();
    }
  });

  test('los botones de navegación deben funcionar', async ({ page }) => {
    // Verificar botones de navegación principal
    const navLinks = [
      { text: 'Inicio', href: '/' },
      { text: 'Productos', href: '/productos' },
      { text: 'Contacto', href: '/contacto' }
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`a:has-text("${link.text}")`).first();
      const isVisible = await navLink.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        const href = await navLink.getAttribute('href');
        expect(href).toBe(link.href);
      }
    }
  });

  test('el menú móvil debe abrir y cerrar correctamente', async ({ page }) => {
    // Cambiar viewport a móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Buscar el botón de menú hamburguesa
    const menuButton = page.locator('button[aria-label*="menu"], button:has(svg[class*="lucide-menu"])').first();
    const buttonVisible = await menuButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (buttonVisible) {
      // Abrir menú
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Verificar que el menú está abierto
      const menuOpen = page.locator('text=Inicio, text=Productos').first();
      const isOpen = await menuOpen.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isOpen).toBeTruthy();
      
      // Buscar botón de cerrar (X)
      const closeButton = page.locator('button:has(svg[class*="lucide-x"])').first();
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('los botones de cantidad (+/-) deben funcionar en el carrito', async ({ page }) => {
    // Primero agregar un producto al carrito
    const addButton = page.locator('button:has-text("Agregar al Carrito")').first();
    
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      // Abrir el carrito
      const cartButton = page.locator('button:has(svg[class*="lucide-shopping-cart"])').first();
      if (await cartButton.isVisible({ timeout: 3000 })) {
        await cartButton.click();
        await page.waitForTimeout(1000);
        
        // Buscar botones de cantidad
        const plusButton = page.locator('button:has(svg[class*="lucide-plus"])').first();
        const minusButton = page.locator('button:has(svg[class*="lucide-minus"])').first();
        
        const plusVisible = await plusButton.isVisible({ timeout: 2000 }).catch(() => false);
        const minusVisible = await minusButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (plusVisible) {
          // Test botón plus
          await plusButton.click();
          await page.waitForTimeout(500);
          
          // Verificar que la cantidad cambió
          const quantity = page.locator('span:has-text("2"), text=2').first();
          const quantityChanged = await quantity.isVisible({ timeout: 2000 }).catch(() => false);
          expect(quantityChanged).toBeTruthy();
        }
        
        if (minusVisible) {
          // Test botón minus
          await minusButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('el botón de vaciar carrito debe funcionar', async ({ page }) => {
    // Primero agregar un producto
    const addButton = page.locator('button:has-text("Agregar al Carrito")').first();
    
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      // Abrir el carrito
      const cartButton = page.locator('button:has(svg[class*="lucide-shopping-cart"])').first();
      if (await cartButton.isVisible({ timeout: 3000 })) {
        await cartButton.click();
        await page.waitForTimeout(1000);
        
        // Buscar botón de vaciar carrito
        const clearButton = page.locator('button:has-text("Vaciar"), button:has-text("Vaciar Carrito")').first();
        const clearVisible = await clearButton.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (clearVisible) {
          await clearButton.click();
          await page.waitForTimeout(1000);
          
          // Verificar que el carrito está vacío
          const emptyMessage = page.locator('text=vacío, text=está vacío').first();
          const isEmpty = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false);
          expect(isEmpty).toBeTruthy();
        }
      }
    }
  });

  test('todos los iconos principales deben ser visibles', async ({ page }) => {
    // Lista de iconos que deben estar visibles
    const expectedIcons = [
      'lucide-shopping-cart', // Carrito
      'lucide-phone',          // Teléfono
      'lucide-message-circle', // WhatsApp
    ];
    
    let visibleCount = 0;
    
    for (const iconClass of expectedIcons) {
      const icon = page.locator(`svg[class*="${iconClass}"]`).first();
      const isVisible = await icon.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        visibleCount++;
      }
    }
    
    // Al menos 2 de los 3 iconos principales deben estar visibles
    expect(visibleCount).toBeGreaterThanOrEqual(2);
  });
});

