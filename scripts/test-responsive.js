#!/usr/bin/env node

/**
 * Script automatizado para testear responsividad
 * Testea diferentes breakpoints y dispositivos
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuración de breakpoints y dispositivos
const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' }
};

// Páginas a testear
const PAGES_TO_TEST = [
  { url: '/', name: 'Home' },
  { url: '/productos', name: 'Productos' },
  { url: '/sobre-nosotros', name: 'Sobre Nosotros' },
  { url: '/contacto', name: 'Contacto' },
  { url: '/admin', name: 'Admin Dashboard' },
  { url: '/admin/productos', name: 'Admin Productos' },
  { url: '/admin/precios', name: 'Admin Precios' }
];

// Tests de responsividad
const RESPONSIVE_TESTS = [
  {
    name: 'Text Overflow',
    test: async (page) => {
      const elements = await page.$$('*');
      const overflowIssues = [];
      
      for (const element of elements) {
        const text = await element.evaluate(el => el.textContent);
        if (text && text.length > 100) {
          const rect = await element.boundingBox();
          if (rect && rect.width > 0) {
            const computedStyle = await element.evaluate(el => {
              const style = window.getComputedStyle(el);
              return {
                overflow: style.overflow,
                textOverflow: style.textOverflow,
                whiteSpace: style.whiteSpace
              };
            });
            
            if (computedStyle.overflow === 'visible' && computedStyle.textOverflow === 'clip') {
              overflowIssues.push({
                element: await element.evaluate(el => el.tagName),
                text: text.substring(0, 50) + '...',
                rect: rect
              });
            }
          }
        }
      }
      
      return overflowIssues;
    }
  },
  {
    name: 'Button Accessibility',
    test: async (page) => {
      const buttons = await page.$$('button, [role="button"]');
      const issues = [];
      
      for (const button of buttons) {
        const rect = await button.boundingBox();
        if (rect && (rect.width < 44 || rect.height < 44)) {
          issues.push({
            element: 'button',
            size: { width: rect.width, height: rect.height },
            text: await button.evaluate(el => el.textContent?.trim())
          });
        }
      }
      
      return issues;
    }
  },
  {
    name: 'Image Responsiveness',
    test: async (page) => {
      const images = await page.$$('img');
      const issues = [];
      
      for (const image of images) {
        const rect = await image.boundingBox();
        const naturalSize = await image.evaluate(img => ({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }));
        
        if (rect && naturalSize.naturalWidth > 0) {
          const aspectRatio = rect.width / rect.height;
          const naturalAspectRatio = naturalSize.naturalWidth / naturalSize.naturalHeight;
          
          if (Math.abs(aspectRatio - naturalAspectRatio) > 0.1) {
            issues.push({
              element: 'img',
              src: await image.evaluate(img => img.src),
              displaySize: { width: rect.width, height: rect.height },
              naturalSize: naturalSize,
              aspectRatioDiff: Math.abs(aspectRatio - naturalAspectRatio)
            });
          }
        }
      }
      
      return issues;
    }
  },
  {
    name: 'Grid Layout',
    test: async (page) => {
      const grids = await page.$$('[class*="grid"]');
      const issues = [];
      
      for (const grid of grids) {
        const rect = await grid.boundingBox();
        const children = await grid.$$(':scope > *');
        
        if (rect && children.length > 0) {
          const childRects = await Promise.all(
            children.map(child => child.boundingBox())
          );
          
          const validRects = childRects.filter(rect => rect !== null);
          
          if (validRects.length > 0) {
            const minWidth = Math.min(...validRects.map(r => r.width));
            const maxWidth = Math.max(...validRects.map(r => r.width));
            
            if (maxWidth - minWidth > 50) {
              issues.push({
                element: 'grid',
                childrenCount: validRects.length,
                widthVariation: maxWidth - minWidth,
                minWidth,
                maxWidth
              });
            }
          }
        }
      }
      
      return issues;
    }
  }
];

class ResponsiveTester {
  constructor(baseUrl = 'http://localhost:3003') {
    this.baseUrl = baseUrl;
    this.results = {};
  }

  async runTests() {
    console.log('🚀 Iniciando tests de responsividad...\n');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      for (const pageConfig of PAGES_TO_TEST) {
        console.log(`📄 Testeando página: ${pageConfig.name}`);
        this.results[pageConfig.name] = {};
        
        for (const [breakpointName, breakpoint] of Object.entries(BREAKPOINTS)) {
          console.log(`  📱 ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
          
          const page = await browser.newPage();
          await page.setViewport({
            width: breakpoint.width,
            height: breakpoint.height
          });
          
          try {
            await page.goto(`${this.baseUrl}${pageConfig.url}`, {
              waitUntil: 'networkidle2',
              timeout: 30000
            });
            
            // Esperar a que las animaciones terminen
            await page.waitForTimeout(2000);
            
            const pageResults = {};
            
            for (const test of RESPONSIVE_TESTS) {
              try {
                const testResults = await test.test(page);
                pageResults[test.name] = testResults;
                
                if (testResults.length > 0) {
                  console.log(`    ⚠️  ${test.name}: ${testResults.length} issues encontrados`);
                } else {
                  console.log(`    ✅ ${test.name}: OK`);
                }
              } catch (error) {
                console.log(`    ❌ ${test.name}: Error - ${error.message}`);
                pageResults[test.name] = { error: error.message };
              }
            }
            
            this.results[pageConfig.name][breakpointName] = pageResults;
            
          } catch (error) {
            console.log(`    ❌ Error cargando página: ${error.message}`);
            this.results[pageConfig.name][breakpointName] = { error: error.message };
          } finally {
            await page.close();
          }
        }
        
        console.log('');
      }
      
    } finally {
      await browser.close();
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('📊 Generando reporte de responsividad...\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(),
      details: this.results
    };
    
    // Guardar reporte JSON
    const reportPath = path.join(__dirname, 'responsive-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generar reporte HTML
    this.generateHTMLReport(report);
    
    console.log('✅ Reporte generado exitosamente!');
    console.log(`📄 JSON: ${reportPath}`);
    console.log(`🌐 HTML: ${path.join(__dirname, 'responsive-report.html')}`);
  }

  generateSummary() {
    const summary = {
      totalPages: PAGES_TO_TEST.length,
      totalBreakpoints: Object.keys(BREAKPOINTS).length,
      totalTests: RESPONSIVE_TESTS.length,
      issuesByPage: {},
      issuesByBreakpoint: {},
      issuesByTest: {}
    };
    
    // Contar issues por página
    for (const [pageName, pageResults] of Object.entries(this.results)) {
      let pageIssues = 0;
      for (const [breakpointName, breakpointResults] of Object.entries(pageResults)) {
        if (breakpointResults.error) continue;
        
        for (const [testName, testResults] of Object.entries(breakpointResults)) {
          if (Array.isArray(testResults)) {
            pageIssues += testResults.length;
          }
        }
      }
      summary.issuesByPage[pageName] = pageIssues;
    }
    
    // Contar issues por breakpoint
    for (const breakpointName of Object.keys(BREAKPOINTS)) {
      let breakpointIssues = 0;
      for (const pageResults of Object.values(this.results)) {
        if (pageResults[breakpointName] && !pageResults[breakpointName].error) {
          for (const testResults of Object.values(pageResults[breakpointName])) {
            if (Array.isArray(testResults)) {
              breakpointIssues += testResults.length;
            }
          }
        }
      }
      summary.issuesByBreakpoint[breakpointName] = breakpointIssues;
    }
    
    // Contar issues por test
    for (const test of RESPONSIVE_TESTS) {
      let testIssues = 0;
      for (const pageResults of Object.values(this.results)) {
        for (const breakpointResults of Object.values(pageResults)) {
          if (breakpointResults.error) continue;
          if (breakpointResults[test.name] && Array.isArray(breakpointResults[test.name])) {
            testIssues += breakpointResults[test.name].length;
          }
        }
      }
      summary.issuesByTest[test.name] = testIssues;
    }
    
    return summary;
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Responsividad - Zingarito Kids</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #8b5cf6; }
        .issues-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .issues-table th, .issues-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .issues-table th { background: #f8f9fa; font-weight: 600; }
        .status-ok { color: #10b981; font-weight: bold; }
        .status-warning { color: #f59e0b; font-weight: bold; }
        .status-error { color: #ef4444; font-weight: bold; }
        .breakpoint-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 20px 0; }
        .breakpoint-item { padding: 10px; background: #f8f9fa; border-radius: 6px; text-align: center; }
        .page-section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .test-results { margin: 15px 0; }
        .test-result { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .test-result.ok { background: #d1fae5; color: #065f46; }
        .test-result.warning { background: #fef3c7; color: #92400e; }
        .test-result.error { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Reporte de Responsividad - Zingarito Kids</h1>
        <p><strong>Generado:</strong> ${new Date(report.timestamp).toLocaleString('es-AR')}</p>
        
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="summary">
            <div class="summary-card">
                <h3>Páginas Testeadas</h3>
                <div class="number">${report.summary.totalPages}</div>
            </div>
            <div class="summary-card">
                <h3>Breakpoints</h3>
                <div class="number">${report.summary.totalBreakpoints}</div>
            </div>
            <div class="summary-card">
                <h3>Tests Ejecutados</h3>
                <div class="number">${report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Issues Totales</h3>
                <div class="number">${Object.values(report.summary.issuesByPage).reduce((a, b) => a + b, 0)}</div>
            </div>
        </div>
        
        <h2>📱 Issues por Breakpoint</h2>
        <div class="breakpoint-grid">
            ${Object.entries(report.summary.issuesByBreakpoint).map(([breakpoint, issues]) => `
                <div class="breakpoint-item">
                    <strong>${breakpoint}</strong><br>
                    <span class="${issues === 0 ? 'status-ok' : 'status-warning'}">${issues} issues</span>
                </div>
            `).join('')}
        </div>
        
        <h2>🔍 Detalles por Página</h2>
        ${Object.entries(report.details).map(([pageName, pageResults]) => `
            <div class="page-section">
                <h3>${pageName}</h3>
                ${Object.entries(pageResults).map(([breakpointName, breakpointResults]) => `
                    <div class="test-results">
                        <h4>${breakpointName}</h4>
                        ${breakpointResults.error ? `
                            <div class="test-result error">❌ Error: ${breakpointResults.error}</div>
                        ` : Object.entries(breakpointResults).map(([testName, testResults]) => `
                            <div class="test-result ${Array.isArray(testResults) && testResults.length === 0 ? 'ok' : 'warning'}">
                                ${Array.isArray(testResults) ? 
                                    (testResults.length === 0 ? '✅' : '⚠️') + ` ${testName}: ${testResults.length} issues` :
                                    '❌ ' + testName + ': ' + testResults.error
                                }
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(__dirname, 'responsive-report.html');
    fs.writeFileSync(htmlPath, html);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const tester = new ResponsiveTester();
  tester.runTests().catch(console.error);
}

module.exports = ResponsiveTester;
