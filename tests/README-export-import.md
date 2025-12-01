# Tests de Exportación e Importación CSV

Este documento describe los tests automatizados para la funcionalidad de exportación e importación de productos en formato CSV.

## 📋 Estructura de Tests

### Tests Unitarios (`tests/unit/csv-export-import.test.ts`)
Tests para funciones puras y lógica de procesamiento CSV:
- ✅ Creación y parsing de CSV
- ✅ Validación de formato
- ✅ Manejo de valores especiales (comas, comillas)
- ✅ Generación de productos mock
- ✅ Validación de estructura exportada

### Tests E2E (`tests/e2e/inventario-export-import.spec.ts`)
Tests de extremo a extremo que prueban el flujo completo:
- ✅ Exportación de productos a CSV
- ✅ Importación de productos desde CSV
- ✅ Creación de productos nuevos
- ✅ Actualización de productos existentes
- ✅ Validación de formato CSV
- ✅ Manejo de errores

### Helpers (`tests/helpers/csv-helpers.ts`)
Funciones auxiliares para los tests:
- `createTestCSV()` - Crear CSV de prueba
- `createCSVFile()` - Crear File mock de CSV
- `parseCSV()` - Parsear CSV simple
- `createMockProducts()` - Generar productos de prueba
- `validateExportedCSV()` - Validar estructura CSV

## 🚀 Cómo Ejecutar los Tests

### Tests Unitarios (Jest)
```bash
# Ejecutar todos los tests unitarios
npm run test

# Ejecutar solo tests de CSV
npm run test -- csv-export-import

# Modo watch (ejecuta tests al cambiar archivos)
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Tests E2E (Playwright)
```bash
# Ejecutar todos los tests e2e
npm run test:e2e

# Ejecutar solo tests de inventario
npm run test:e2e -- inventario-export-import

# Modo UI (interfaz gráfica)
npm run test:e2e:ui

# Modo headed (ver el navegador)
npm run test:e2e:headed
```

## ⚙️ Configuración Requerida

### Variables de Entorno para Tests E2E
Crea un archivo `.env.test` con las credenciales de admin:

```env
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=tu_password_admin
```

O exporta las variables antes de ejecutar:
```bash
export ADMIN_EMAIL=admin@test.com
export ADMIN_PASSWORD=tu_password_admin
npm run test:e2e
```

## 📝 Casos de Prueba Cubiertos

### Exportación
- ✅ Exporta productos a CSV con todas las columnas
- ✅ Genera SKU automático si falta
- ✅ Formato compatible con Excel (BOM UTF-8)
- ✅ Maneja valores con comas y comillas

### Importación
- ✅ Crea productos nuevos cuando el SKU no existe
- ✅ Actualiza productos existentes por SKU
- ✅ Valida headers requeridos (SKU, Nombre)
- ✅ Procesa campos opcionales (Categoría, Stock, Precios)
- ✅ Maneja valores numéricos (enteros y decimales)
- ✅ Maneja valores con comas y comillas
- ✅ Muestra mensajes de error claros
- ✅ Registra cambios en historial de stock

### Validación
- ✅ Valida formato CSV correcto
- ✅ Detecta headers faltantes
- ✅ Maneja archivos vacíos
- ✅ Maneja valores nulos/vacíos

## 🐛 Troubleshooting

### Los tests e2e fallan con "Login failed"
1. Verifica que las credenciales de admin sean correctas
2. Asegúrate de que el servidor de desarrollo esté corriendo (`npm run dev`)
3. Verifica que la ruta `/admin/login` sea correcta

### Los tests unitarios fallan con "Module not found"
1. Ejecuta `npm install` para instalar dependencias
2. Verifica que `jest.config.js` esté configurado correctamente
3. Asegúrate de que los mocks en `jest.setup.js` estén actualizados

### Los tests de descarga fallan
1. Asegúrate de que Playwright tenga permisos para descargar archivos
2. Verifica que el botón de exportar esté visible y funcional
3. Aumenta el timeout si es necesario: `page.waitForEvent('download', { timeout: 60000 })`

## 📊 Cobertura Esperada

Los tests deberían cubrir:
- ✅ 100% de las funciones de helpers CSV
- ✅ 90%+ de la lógica de exportación
- ✅ 90%+ de la lógica de importación
- ✅ Casos de error comunes
- ✅ Validaciones de formato

## 🔄 Mantenimiento

### Agregar Nuevos Tests
1. Para tests unitarios: agregar en `tests/unit/csv-export-import.test.ts`
2. Para tests e2e: agregar en `tests/e2e/inventario-export-import.spec.ts`
3. Para nuevos helpers: agregar en `tests/helpers/csv-helpers.ts`

### Actualizar Tests Existentes
Si cambias la funcionalidad de exportación/importación:
1. Actualiza los tests correspondientes
2. Verifica que los mocks reflejen los cambios
3. Ejecuta los tests para asegurar que pasen

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/)

