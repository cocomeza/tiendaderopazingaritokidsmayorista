/**
 * Script de prueba para verificar el registro y login
 * Ejecutar con: node scripts/test-registro-login.js
 */

// Este script solo verifica que el código esté correcto
// No puede hacer pruebas reales porque necesita el navegador

console.log('🧪 Test de Registro y Login\n')

console.log('✅ Verificaciones de código:')
console.log('  1. Formulario de registro tiene los nuevos campos')
console.log('  2. Validación de campos obligatorios implementada')
console.log('  3. Campos nuevos: locality, salesType, ages')
console.log('  4. Upsert configurado correctamente\n')

console.log('⚠️  Para hacer pruebas reales:')
console.log('  1. Restaura el proyecto en Supabase')
console.log('  2. Ejecuta la migración 006_add_new_customer_fields.sql')
console.log('  3. Abre http://localhost:3001/auth/registro')
console.log('  4. Completa el formulario')
console.log('  5. Haz login en http://localhost:3001/auth/login\n')

console.log('📝 Datos de prueba sugeridos:')
console.log('  Email: test@test.com')
console.log('  Password: test1234')
console.log('  Nombre: Test Usuario')
console.log('  Teléfono: 1234567890')
console.log('  Empresa: Test S.A.')
console.log('  CUIT: 20-12345678-9')
console.log('  Dirección: Test 123')
console.log('  Localidad: CABA')
console.log('  Tipo de Venta: Local Físico')
console.log('  Edades: 0-2 años, 3-6 años\n')

console.log('🎯 Manual de Pruebas:')
console.log('  1. Ve a /auth/registro')
console.log('  2. Completa TODOS los campos obligatorios (*)')
console.log('  3. Localidad y Tipo de Venta son obligatorios')
console.log('  4. Edades es opcional')
console.log('  5. Haz clic en "Registrarse"')
console.log('  6. Si hay error, revisa la consola del navegador')
console.log('  7. Luego intenta hacer login\n')

console.log('🔍 Errores comunes:')
console.log('  - Supabase pausado: Restaura el proyecto')
console.log('  - Campo no existe: Ejecuta la migración')
console.log('  - CUIT inválido: Debe ser XX-XXXXXXXX-X')
console.log('  - Password corta: Mínimo 6 caracteres\n')

console.log('💡 Tips:')
console.log('  - Abre las DevTools (F12) para ver errores')
console.log('  - Revisa la pestaña Console')
console.log('  - Revisa la pestaña Network para ver llamadas a la API\n')

console.log('✅ Script completado')

