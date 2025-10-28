# 🚀 Instalación de Suite de Tests - Zingarito Kids

## 📦 Instalación Paso a Paso

### 1. Instalar Dependencias de Playwright

```bash
npm install --save-dev @playwright/test @axe-core/playwright playwright-lighthouse
```

### 2. Instalar Navegadores de Playwright

```bash
npx playwright install
```

O instalar navegadores específicos:

```bash
# Solo Chrome
npx playwright install chromium

# Con dependencias del sistema (Linux)
npx playwright install-deps
```

### 3. Instalar k6 (Tests de Carga)

#### Windows (con Chocolatey)
```bash
choco install k6
```

#### macOS (con Homebrew)
```bash
brew install k6
```

#### Linux
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# O con snap
sudo snap install k6
```

### 4. Verificar Instalación

```bash
# Verificar Playwright
npx playwright --version

# Verificar k6
k6 version
```

## 🎯 Scripts Disponibles

Después de la instalación, puedes usar:

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests en modo UI (interactivo)
npm run test:e2e:ui

# Ejecutar tests con navegador visible
npm run test:e2e:headed

# Ejecutar tests de accesibilidad
npm run test:accessibility

# Ejecutar tests de performance
npm run test:performance

# Ejecutar tests de carga
npm run test:load

# Ejecutar TODOS los tests
npm run test:all

# Ver reporte HTML
npm run report:show
```

## 🐛 Solución de Problemas Comunes

### Error: "Port 9222 already in use"

```bash
# En Windows
netstat -ano | findstr :9222
taskkill /PID <PID> /F

# En Linux/Mac
lsof -ti:9222 | xargs kill -9
```

### Error: "Playwright browsers not installed"

```bash
npx playwright install
```

### Error: "k6 command not found"

- Windows: Verificar que k6 está en PATH después de instalación con Chocolatey
- macOS: Usar `brew install k6` y verificar PATH
- Linux: Verificar que k6 está en /usr/bin/k6

### Error: "Module not found: @axe-core/playwright"

```bash
npm install --save-dev @axe-core/playwright
```

## 📁 Estructura de Carpetas Creada

```
tests/
├── e2e/
│   ├── homepage.spec.ts
│   ├── productos.spec.ts
│   └── auth.spec.ts
├── accessibility/
│   └── axe-test.ts
├── performance/
│   └── lighthouse-test.ts
├── load/
│   └── k6-script.js
└── setup/
    └── test-helpers.ts

test-results/          # Se crea al ejecutar tests
├── playwright-report/
├── lighthouse/
├── accessibility-report.json
└── screenshots/
```

## 🎬 Ejecutar Primera Vez

1. **Asegúrate de que el servidor esté corriendo:**
   ```bash
   npm run dev
   ```

2. **En otra terminal, ejecuta los tests:**
   ```bash
   npm run test:e2e
   ```

3. **Ver reporte:**
   ```bash
   npm run report:show
   ```

## 📊 Reportes Generados

Después de ejecutar los tests, encontrarás:

- **Playwright:** `test-results/playwright-report/index.html`
- **Accesibilidad:** `test-results/accessibility-report.json`
- **Lighthouse:** `test-results/lighthouse/lighthouse-report-*.html`
- **Screenshots:** `test-results/screenshots/`
- **Videos:** `test-results/video/` (solo de tests fallidos)

## ✅ Checklist de Instalación

- [ ] `@playwright/test` instalado
- [ ] `@axe-core/playwright` instalado
- [ ] `playwright-lighthouse` instalado
- [ ] Navegadores de Playwright instalados
- [ ] k6 instalado y funcionando
- [ ] Scripts agregados al package.json
- [ ] `.gitignore` actualizado (test-results/)
- [ ] Servidor Next.js corriendo en :3000

## 🔧 Configuración Avanzada

### Ejecutar tests en CI/CD

Crear archivo `.github/workflows/tests.yml`:

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
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

## 📝 Próximos Pasos

1. Ejecutar `npm run test:all` para validar el setup
2. Revisar reportes en `test-results/`
3. Ajustar umbrales según necesidades
4. Agregar más tests para nuevas features
5. Integrar en pipeline de CI/CD

## 💡 Tipos de Tests

### E2E (End-to-End)
- Navegación entre páginas
- Interacciones de usuario
- Verificación de UI

### Accesibilidad
- Cumplimiento WCAG 2.1
- Contraste de colores
- ARIA labels

### Performance
- Velocidad de carga
- Lighthouse scores
- Métricas de Core Web Vitals

### Carga
- Usuarios concurrentes
- Tiempo de respuesta
- Tasa de errores

## 🎓 Recursos

- [Playwright Documentation](https://playwright.dev/)
- [Axe-Core Docs](https://github.com/dequelabs/axe-core)
- [k6 Documentation](https://k6.io/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

