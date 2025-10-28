# 🧪 Tests - Documentación Completa

Guía para ejecutar y entender los tests del proyecto.

---

## 📋 Tipos de Tests

El proyecto incluye 3 tipos de tests:

1. **E2E Tests** - Tests de flujo completo con Playwright
2. **Accessibility Tests** - Tests de accesibilidad con axe-core
3. **Load Tests** - Tests de carga con k6

---

## 🚀 Comandos Rápidos

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Tests en modo UI (interactivo)
npm run test:e2e:ui

# Tests en modo visible (headed)
npm run test:e2e:headed

# Tests de accesibilidad
npm run test:accessibility

# Tests de carga
npm run test:load

# Todos los tests
npm run test:all

# Ver reportes
npm run report:show
```

---

## 📁 Estructura de Tests

```
tests/
├── e2e/                    # Tests de extremo a extremo
│   ├── homepage.spec.ts    # Tests de página principal
│   ├── auth.spec.ts        # Tests de autenticación
│   └── productos.spec.ts   # Tests de productos
├── accessibility/          # Tests de accesibilidad
│   └── axe-test.ts
└── load/                  # Tests de carga
    └── k6-script.js
```

---

## 🎯 Tests E2E

### ¿Qué se testea?

- ✅ Navegación entre páginas
- ✅ Funcionalidad de autenticación
- ✅ Catálogo de productos
- ✅ Responsive design
- ✅ Elementos interactivos

### Ejecutar Tests

```bash
# Todos los tests
npm run test:e2e

# Solo tests de homepage
npx playwright test tests/e2e/homepage.spec.ts

# Tests en Chrome
npx playwright test --project=chromium
```

---

## ♿ Tests de Accesibilidad

### ¿Qué se testea?

- ✅ Contraste de colores
- ✅ Navegación por teclado
- ✅ ARIA labels
- ✅ Estructura semántica
- ✅ Lectores de pantalla

### Ejecutar Tests

```bash
npm run test:accessibility
```

---

## 📊 Tests de Carga

### ¿Qué se testea?

- ✅ Performance bajo carga
- ✅ Tiempo de respuesta
- ✅ Tasa de errores
- ✅ Throughput
- ✅ Concurrent users

### Ejecutar Tests

```bash
npm run test:load
```

---

## 🔧 Configuración de Playwright

El archivo `playwright.config.ts` contiene:

- Navegadores: Chromium, Firefox, WebKit
- Timeouts configurables
- Screenshots en errores
- Videos de tests

---

## 📝 Escribir Nuevos Tests

### Test E2E Básico

```typescript
import { test, expect } from '@playwright/test'

test('mi test', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

### Test de Accesibilidad

```typescript
import { test } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test('accesibilidad', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

---

## 🐛 Troubleshooting

### Error: "Browser not found"
**Solución:** Ejecuta `npx playwright install`

### Tests fallan aleatoriamente
**Solución:** Aumenta timeout en `playwright.config.ts`

### Error en CI/CD
**Solución:** Instala browsers: `npx playwright install --with-deps`

---

## 📈 CI/CD Integration

### GitHub Actions (Ejemplo)

```yaml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 📚 Más Información

- [Playwright Documentation](https://playwright.dev)
- [Axe-core](https://github.com/dequelabs/axe-core)
- [k6 Documentation](https://k6.io/docs)

---

**Tests configurados y funcionando.** ✅

