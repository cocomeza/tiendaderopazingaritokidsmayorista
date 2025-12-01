# Tests Unitarios - Exportación/Importación CSV

## Ejecutar Tests

```bash
# Todos los tests unitarios
npm run test

# Solo tests de CSV
npm run test -- csv-export-import

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

## Estructura

- `csv-export-import.test.ts` - Tests principales de funcionalidad CSV
- `../helpers/csv-helpers.ts` - Funciones auxiliares para tests

## Cobertura

Los tests cubren:
- ✅ Creación y parsing de CSV
- ✅ Validación de formato
- ✅ Manejo de valores especiales
- ✅ Generación de datos mock
- ✅ Validación de estructura

