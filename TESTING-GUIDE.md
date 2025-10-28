# 🧪 Guía Completa de Testing - Zingarito Kids

## 📖 Índice

1. [Introducción](#introducción)
2. [Tipos de Tests](#tipos-de-tests)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Cómo Ejecutar Tests](#cómo-ejecutar-tests)
5. [Interpretar Resultados](#interpretar-resultados)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Esta suite de tests cubre:

- ✅ **Usabilidad técnica** - Verifica que el usuario pueda navegar y usar el sitio
- ✅ **Accesibilidad** - Asegura WCAG 2.1 compliance
- ✅ **Performance** - Mide velocidad y optimización
- ✅ **Carga** - Simula usuarios concurrentes

---

## 📋 Tipos de Tests

### 1. Tests E2E (End-to-End)

**Herramienta:** Playwright  
**Lugar:** `tests/e2e/`

**Qué verifica:**
- Navegación por el sitio
- Visualización de productos
- Funcionalidad de autenticación
- Responsive design
- Errores de consola

**Ejemplo de uso:**
```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar en modo UI (interactivo)
npm run test:e2e:ui

# Ejecutar solo tests de homepage
npx playwright test tests/e2e/homepage.spec.ts
```

### 2. Tests de Accesibilidad

**Herramienta:** axe-core  
**Lugar:** `tests/accessibility/`

**Qué verifica:**
- Contraste de colores
- Etiquetas ARIA
- Navegación por teclado
- Lectores de pantalla

**Ejemplo de uso:**
```bash
npm run test:accessibility
```

### 3. Tests de Performance

**Herramienta:** Lighthouse CI  
**Lugar:** `tests/performance/`

**Qué mide:**
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- CLS (Cumulative Layout Shift)
- Performance Score

**Ejemplo de uso:**
```bash
npm run test:performance
```

### 4. Tests de Carga

**Herramienta:** k6  
**Lugar:** `tests/load/`

**Qué simula:**
- 50 usuarios concurrentes
- Durante 30 segundos
- Latencia y tasa de errores

**Ejemplo de uso:**
```bash
npm run test:load
```

---

## 📁 Estructura de Carpetas

```
tests/
├── e2e/                      # Tests End-to-End
│   ├── homepage.spec.ts     # Tests de página principal
│   ├── productos.spec.ts    # Tests de productos
│   └── auth.spec.ts         # Tests de autenticación
│
├── accessibility/            # Tests de accesibilidad
│   └── axe-test.ts          # Tests con axe-core
│
├── performance/             # Tests de performance
│   └── lighthouse-test.ts  # Tests con Lighthouse
│
├── load/                    # Tests de carga
│   └── k6-script.js        # Script de k6
│
└── setup/                   # Helpers
    └── test-helpers.ts     # Funciones auxiliares

test-results/                # Resultados (se crea al ejecutar)
├── playwright-report/       # Reportes Playwright
├── lighthouse/             # Reportes Lighthouse
├── accessibility-report.json
└── screenshots/            # Capturas de pantalla
```

---

## 🎬 Cómo Ejecutar Tests

### Opción 1: Todos los Tests

```bash
npm run test:all
```

### Opción 2: Por Categoría

```bash
# Solo tests E2E
npm run test:e2e

# Solo accesibilidad
npm run test:accessibility

# Solo performance
npm run test:performance

# Solo carga
npm run test:load
```

### Opción 3: Modo Interactivo

```bash
# Ejecutar con UI
npm run test:e2e:ui

# Ejecutar con navegador visible
npm run test:e2e:headed
```

### Opción 4: Test Específico

```bash
# Test específico
npx playwright test tests/e2e/homepage.spec.ts

# Solo Chrome
npx playwright test --project=chromium

# Solo Mobile
npx playwright test --project="Mobile Chrome"
```

---

## 📊 Interpretar Resultados

### Playwright Report

```bash
npm run report:show
```

**Qué ver:**
- Tests ejecutados
- Tests pasados/fallidos
- Screenshots
- Videos (si falló)
- Timeline de ejecución

### Accesibilidad Report

**Archivo:** `test-results/accessibility-report.json`

**Qué buscar:**
- `violations`: Problemas encontrados
- `passes`: Tests que pasaron
- `incomplete`: Tests que necesitan revisión manual

### Lighthouse Report

**Archivo:** `test-results/lighthouse/lighthouse-report-*.html`

**Qué buscar:**
- **Performance Score**: ≥ 50
- **Accessibility Score**: ≥ 80
- **Best Practices**: ≥ 70
- **SEO**: ≥ 80

### k6 Output

**Salida en consola:**

```
✓ status is 200: 98%
✓ response time < 2s: 95%

checks.........................: 100% 19600
data_received..................: 12 MB
data_sent......................: 2.1 MB
http_req_duration..............: avg=156ms min=45ms median=120ms max=2100ms p(95)=450ms
http_req_failed................: 2.00%
iterations.....................: 9800
```

---

## 🐛 Troubleshooting

### Problema 1: "Port 9222 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :9222
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:9222 | xargs kill -9
```

### Problema 2: "Playwright browsers not installed"

**Solución:**
```bash
npx playwright install
```

### Problema 3: "k6 command not found"

**Solución:**
```bash
# Windows
choco install k6

# macOS
brew install k6

# Linux
sudo snap install k6
```

### Problema 4: Lighthouse no genera reportes

**Solución:**
```bash
# Cambiar puerto en lighthouse-test.ts
port: 9223  # En lugar de 9222
```

### Problema 5: Tests fallan en CI

**Solución:**
- Ajustar timeouts en `playwright.config.ts`
- Aumentar `expect(timeout)` en tests
- Verificar que el servidor está corriendo

---

## 🎯 Umbrales Recomendados

### Performance
```
Performance Score: ≥ 50
LCP: < 2.5s
FCP: < 1.8s
CLS: < 0.1
```

### Accesibilidad
```
WCAG 2.1 AA: Pass
Violations: 0
```

### Carga
```
Response Time (p95): < 2s
Error Rate: < 10%
```

---

## 📝 Agregar Nuevos Tests

### Test E2E Nuevo

```typescript
// tests/e2e/mi-nueva-pagina.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mi Nueva Página', () => {
  test('debe cargar correctamente', async ({ page }) => {
    await page.goto('/mi-nueva-pagina');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Test de Accesibilidad

```typescript
// tests/accessibility/mi-pagina.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('debe ser accesible', async ({ page }) => {
  await page.goto('/mi-pagina');
  
  const results = await new AxeBuilder({ page }).analyze();
  
  expect(results.violations).toEqual([]);
});
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:all
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

---

## 📞 Soporte

Si tienes problemas:

1. Ver logs en consola
2. Revisar screenshots en `test-results/screenshots/`
3. Ver videos en `test-results/video/`
4. Verificar que el servidor está en :3000

---

## 🎓 Recursos

- [Playwright Docs](https://playwright.dev/)
- [Axe-Core Docs](https://github.com/dequelabs/axe-core)
- [k6 Docs](https://k6.io/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

