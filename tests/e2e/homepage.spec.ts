import { test, expect } from '@playwright/test';

/**
 * Test de navegación en la página principal
 * Verifica que la página cargue correctamente y los elementos importantes estén visibles
 */
test.describe('Página Principal - Zingarito Kids', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar el logo y título', async ({ page }) => {
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Verificar que el logo esté presente (con timeout extendido)
    const logo = page.locator('text=ZINGARITO').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
    
    const kids = page.locator('text=KIDS').first();
    await expect(kids).toBeVisible({ timeout: 10000 });
  });

  test('debe tener navegación principal', async ({ page }) => {
    // Verificar enlaces de navegación
    await expect(page.locator('a:has-text("Inicio")')).toBeVisible();
    await expect(page.locator('a:has-text("Productos")')).toBeVisible();
    await expect(page.locator('a:has-text("Nosotros")')).toBeVisible();
    await expect(page.locator('a:has-text("Contacto")')).toBeVisible();
  });

  test('debe navegar a productos', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Hacer clic en el enlace de productos (en el menú de navegación)
    const productLink = page.locator('nav a:has-text("Productos")').first();
    await productLink.click({ timeout: 5000 });
    
    // Esperar a que navegue y cargue la nueva página
    await page.waitForLoadState('networkidle');
    
    // Verificar que navegó correctamente
    await expect(page).toHaveURL(/.*productos/, { timeout: 10000 });
  });

  test('debe tener información de contacto', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verificar número de teléfono (en la barra superior de contacto)
    await expect(page.locator('text=/3407/i').first()).toBeVisible({ timeout: 5000 });
    
    // Verificar WhatsApp
    await expect(page.locator('text=/WhatsApp/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('no debe mostrar errores en consola', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });
});

