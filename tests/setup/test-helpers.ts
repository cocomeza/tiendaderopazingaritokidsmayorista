/**
 * Helpers y utilities para tests
 */

/**
 * Esperar a que una imagen cargue completamente
 */
export async function waitForImage(page: any, selector: string) {
  await page.waitForSelector(selector);
  await page.evaluate((selector) => {
    const img = document.querySelector(selector);
    if (img) {
      return new Promise((resolve, reject) => {
        if ((img as HTMLImageElement).complete) {
          resolve(null);
        } else {
          (img as HTMLImageElement).onload = () => resolve(null);
          (img as HTMLImageElement).onerror = reject;
        }
      });
    }
  }, selector);
}

/**
 * Obtener errores de la consola
 */
export async function getConsoleErrors(page: any): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Verificar que no hay errores en la consola
 */
export async function expectNoConsoleErrors(page: any) {
  const errors = await getConsoleErrors(page);
  expect(errors).toHaveLength(0);
}

/**
 * Tomar screenshot en diferentes tamaños de pantalla
 */
export async function testResponsive(page: any, testName: string) {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.screenshot({ 
      path: `test-results/screenshots/${testName}-${viewport.name}.png` 
    });
  }
}

