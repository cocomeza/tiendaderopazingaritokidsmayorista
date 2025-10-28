import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Tests de accesibilidad con axe-core
 * Verifica que el sitio cumpla con estándares WCAG
 * Ejecutar: npx playwright test tests/accessibility/
 */
test.describe('Accesibilidad', () => {
  test('página principal debe ser accesible', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('página de productos debe ser accesible', async ({ page }) => {
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('página de contacto debe ser accesible', async ({ page }) => {
    await page.goto('/contacto');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('formulario de login debe ser accesible', async ({ page }) => {
    await page.goto('/auth/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('generar reporte de accesibilidad completo', async ({ page }) => {
    const pages = ['/', '/productos', '/contacto', '/sobre-nosotros'];
    const results: Record<string, any> = {};

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const scanResults = await new AxeBuilder({ page }).analyze();
      
      results[path] = {
        violations: scanResults.violations,
        incomplete: scanResults.incomplete,
        passes: scanResults.passes.length,
        violationsCount: scanResults.violations.length,
      };
    }

    // Guardar reporte en archivo JSON
    const fs = require('fs');
    fs.writeFileSync(
      'test-results/accessibility-report.json',
      JSON.stringify(results, null, 2)
    );

    console.log('Reporte de accesibilidad generado en test-results/accessibility-report.json');
  });
});

