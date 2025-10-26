#!/usr/bin/env node

/**
 * Script simple para testear responsividad manualmente
 * Abre el navegador con diferentes tamaños de ventana
 */

const puppeteer = require('puppeteer');

const BREAKPOINTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 1366, name: 'iPad Pro' },
  { width: 1366, height: 768, name: 'Laptop' },
  { width: 1920, height: 1080, name: 'Desktop' }
];

const PAGES = [
  { url: '/', name: 'Home' },
  { url: '/productos', name: 'Productos' },
  { url: '/sobre-nosotros', name: 'Sobre Nosotros' },
  { url: '/contacto', name: 'Contacto' },
  { url: '/admin', name: 'Admin Dashboard' },
  { url: '/admin/productos', name: 'Admin Productos' },
  { url: '/admin/precios', name: 'Admin Precios' }
];

async function testResponsive() {
  console.log('🚀 Iniciando test manual de responsividad...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  console.log('📱 Testeando diferentes breakpoints...\n');
  
  for (const pageConfig of PAGES) {
    console.log(`\n📄 === ${pageConfig.name} ===`);
    
    for (const breakpoint of BREAKPOINTS) {
      console.log(`\n📱 ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      await page.setViewport({
        width: breakpoint.width,
        height: breakpoint.height
      });
      
      try {
        await page.goto(`http://localhost:3003${pageConfig.url}`, {
          waitUntil: 'networkidle2',
          timeout: 10000
        });
        
        // Esperar a que cargue completamente
        await page.waitForTimeout(2000);
        
        // Verificar elementos clave
        const checks = await page.evaluate(() => {
          const issues = [];
          
          // Verificar que no hay scroll horizontal
          if (document.documentElement.scrollWidth > window.innerWidth) {
            issues.push('Scroll horizontal detectado');
          }
          
          // Verificar botones muy pequeños
          const buttons = document.querySelectorAll('button, [role="button"]');
          buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
              issues.push(`Botón muy pequeño: ${btn.textContent?.trim() || 'sin texto'} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
            }
          });
          
          // Verificar texto que se sale
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (rect.width > 0 && style.overflow === 'visible' && el.scrollWidth > rect.width) {
              const text = el.textContent?.trim();
              if (text && text.length > 20) {
                issues.push(`Texto desbordado: "${text.substring(0, 30)}..."`);
              }
            }
          });
          
          return issues;
        });
        
        if (checks.length === 0) {
          console.log('  ✅ Sin issues detectados');
        } else {
          console.log('  ⚠️  Issues encontrados:');
          checks.forEach(issue => console.log(`    - ${issue}`));
        }
        
        // Pausa para inspección manual
        console.log('  👀 Revisa visualmente la página...');
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Test completado! Presiona Ctrl+C para cerrar el navegador.');
  
  // Mantener abierto para inspección manual
  await new Promise(() => {});
}

// Manejar cierre
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando navegador...');
  process.exit(0);
});

testResponsive().catch(console.error);
