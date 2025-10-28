# 🧪 Suite de Pruebas Automáticas - Zingarito Kids

Suite completa de pruebas para la tienda Zingarito Kids desarrollada con Next.js, Tailwind CSS y Supabase.

## 📋 Contenido

Este proyecto incluye:

- **Tests E2E** con Playwright (usabilidad y flujo de usuario)
- **Tests de Accesibilidad** con axe-core (WCAG compliance)
- **Tests de Performance** con Lighthouse (velocidad y optimización)
- **Tests de Carga** con k6 (rendimiento bajo estrés)

## 🚀 Instalación

```bash
# Instalar dependencias de desarrollo
npm install --save-dev @playwright/test @axe-core/playwright playwright-lighthouse

# Instalar Playwright browsers
npx playwright install
```

## 📁 Estructura de Tests

```
tests/
├── e2e/                    # Pruebas end-to-end
│   ├── homepage.spec.ts   # Tests de página principal
│   ├── productos.spec.ts  # Tests de productos
│   └── auth.spec.ts        # Tests de autenticación
├── accessibility/          # Pruebas de accesibilidad
│   └── axe-test.ts        # Tests con axe-core
├── performance/            # Pruebas de performance
│   └── lighthouse-test.ts # Tests con Lighthouse
├── load/                   # Pruebas de carga
│   └── k6-script.js       # Script de k6
└── setup/                  # Helpers y utilities
    └── test-helpers.ts     # Funciones auxiliares
```

## 🎯 Cómo Ejecutar Tests

### Tests E2E (Playwright)

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar tests en modo UI
npm run test:e2e:ui

# Ejecutar tests en Chrome solamente
npx playwright test --project=chromium

# Ejecutar un test específico
npx playwright test tests/e2e/homepage.spec.ts

# Ver reporte HTML
npx playwright show-report
```

### Tests de Accesibilidad

```bash
# Ejecutar tests de accesibilidad
npm run test:accessibility

# Ver reporte JSON
cat test-results/accessibility-report.json
```

### Tests de Performance (Lighthouse)

```bash
# Ejecutar tests de performance
npm run test:performance

# Ver reportes HTML en
# test-results/lighthouse/lighthouse-report-*.html
```

### Tests de Carga (k6)

```bash
# Ejecutar tests de carga
npm run test:load

# Ejecutar con más usuarios
k6 run --vus 100 --duration 60s tests/load/k6-script.js
```

## 📊 Scripts Disponibles

Agregar al `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:accessibility": "playwright test tests/accessibility/",
    "test:performance": "playwright test tests/performance/",
    "test:load": "k6 run tests/load/k6-script.js",
    "test:all": "npm run test:e2e && npm run test:accessibility && npm run test:performance"
  }
}
```

## 🎨 Tipos de Tests Incluidos

### 1. Tests E2E (End-to-End)

**Archivo:** `tests/e2e/*.spec.ts`

Verifica:
- ✅ Navegación por el sitio
- ✅ Visualización de productos
- ✅ Interacciones de usuario
- ✅ Sin errores en consola
- ✅ Responsive design

### 2. Tests de Accesibilidad

**Archivo:** `tests/accessibility/axe-test.ts`

Verifica:
- ✅ Cumplimiento WCAG 2.1
- ✅ Contraste de colores
- ✅ Etiquetas ARIA
- ✅ Navegación por teclado
- ✅ Lectores de pantalla

### 3. Tests de Performance

**Archivo:** `tests/performance/lighthouse-test.ts`

Mide:
- ✅ LCP (Largest Contentful Paint)
- ✅ FCP (First Contentful Paint)
- ✅ CLS (Cumulative Layout Shift)
- ✅ TTI (Time to Interactive)
- ✅ Score de Performance

### 4. Tests de Carga

**Archivo:** `tests/load/k6-script.js`

Simula:
- ✅ 50 usuarios concurrentes
- ✅ Durante 30 segundos
- ✅ Peticiones a endpoints clave
- ✅ Latencia y tasa de errores

## 📈 Métricas y Umbrales

### Performance
- Performance Score: ≥ 50
- LCP: < 2.5s
- FCP: < 1.8s
- CLS: < 0.1

### Accesibilidad
- Score: ≥ 80
- Zero WCAG violations

### Carga
- Response time (p95): < 2s
- Error rate: < 10%

## 🔧 Configuración

### playwright.config.ts
```typescript
baseURL: 'http://localhost:3000'
```

### k6-script.js
```javascript
stages: [
  { duration: '10s', target: 10 },
  { duration: '20s', target: 50 },
  { duration: '30s', target: 50 },
]
```

## 📝 Reportes

Los reportes se guardan en:

- **Playwright:** `test-results/playwright-report/index.html`
- **Accessibility:** `test-results/accessibility-report.json`
- **Lighthouse:** `test-results/lighthouse/lighthouse-report-*.html`
- **k6:** Salida en consola

## 🐛 Debugging

### Ver tests en modo UI
```bash
npm run test:e2e:ui
```

### Ejecutar test específico
```bash
npx playwright test tests/e2e/homepage.spec.ts --headed
```

### Ver screenshots de fallos
```bash
# Las capturas se guardan en test-results/
```

## 🚨 Troubleshooting

**Error: "Port 9222 already in use"**
```bash
lsof -ti:9222 | xargs kill -9
```

**Lighthouse no funciona**
```bash
# Asegurarse de que el puerto 9222 está libre
# Si no, cambiar el puerto en lighthouse-test.ts
```

**k6 no está instalado**
```bash
# Windows
choco install k6

# macOS
brew install k6

# Linux
curl https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz -L | tar xvz
```

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Axe-Core Docs](https://github.com/dequelabs/axe-core)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [k6 Docs](https://k6.io/docs/)

## ✅ CI/CD

Para integrar en GitHub Actions o CI:

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
      - run: npx playwright install
      - run: npm run test:all
```

## 🎯 Buenas Prácticas

1. **Ejecutar tests antes de commit**
   ```bash
   npm run test:all
   ```

2. **Ver reportes regularmente**
   ```bash
   npx playwright show-report
   ```

3. **Mantener umbrales actualizados**
   - Ajustar según métricas reales
   - No ser demasiado estrictos al inicio

4. **Agregar tests para nuevas features**
   - Cada nueva página debe tener tests E2E
   - Verificar accesibilidad en cada deploy

## 📧 Contacto

Para problemas con los tests, revisar:
- Console logs
- Screenshots en `test-results/screenshots/`
- Videos de tests fallidos en `test-results/video/`

