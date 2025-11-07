require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjU2MjcsImV4cCI6MjA3NjgwMTYyN30.FExQYsd4T2PxFbxVUC3oB0pPa4xrOdW1bAnHlH8Vfyg'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local')
  console.log('\n📝 Para obtenerla:')
  console.log('1. Ve a https://supabase.com/dashboard')
  console.log('2. Selecciona tu proyecto')
  console.log('3. Ve a Settings > API')
  console.log('4. Copia el "service_role" key (la secreta)')
  console.log('5. Agrégala a .env.local como: SUPABASE_SERVICE_ROLE_KEY=tu_key_aqui\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Generar email único para cada test
const timestamp = Date.now()
const testEmail = `test-cliente-${timestamp}@test.com`
const testPassword = 'Test123456'
const testFullName = `Cliente Test ${timestamp}`
const testPhone = '3407440243'
const testCompanyName = `Empresa Test ${timestamp}`
const testCuit = '20123456789' // Sin guiones
const testBillingAddress = 'Calle Test 123'
const testLocality = 'Rosario'
const testSalesType = 'online'
const testAges = 'niños'

let testUserId = null

async function cleanup() {
  if (testUserId) {
    try {
      // Eliminar perfil
      await supabaseAdmin.from('profiles').delete().eq('id', testUserId)
      // Eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(testUserId)
      console.log('✅ Usuario de prueba eliminado')
    } catch (error) {
      console.error('⚠️ Error al limpiar:', error.message)
    }
  }
}

// Manejar cierre del script
process.on('SIGINT', async () => {
  await cleanup()
  process.exit(0)
})

process.on('exit', async () => {
  await cleanup()
})

async function testRegistroCliente() {
  console.log('\n🧪 TEST AUTOMATIZADO: Registro de Cliente\n')
  console.log('=' .repeat(60))
  
  let testsPassed = 0
  let testsFailed = 0

  // TEST 1: Registro de usuario
  console.log('\n📝 TEST 1: Registro de usuario en Supabase Auth')
  console.log('-'.repeat(60))
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName
        }
      }
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('No se creó el usuario en Auth')
    }

    testUserId = authData.user.id
    console.log('✅ Usuario creado en Auth')
    console.log(`   ID: ${testUserId}`)
    console.log(`   Email: ${testEmail}`)
    testsPassed++
  } catch (error) {
    console.error('❌ Error en registro de usuario:', error.message)
    testsFailed++
    return { passed: testsPassed, failed: testsFailed }
  }

  // TEST 2: Crear perfil del cliente
  console.log('\n📝 TEST 2: Crear perfil del cliente en la base de datos')
  console.log('-'.repeat(60))
  try {
    // Usar solo las columnas que existen en la BD real
    const profileData = {
      id: testUserId,
      email: testEmail,
      full_name: testFullName,
      phone: testPhone,
      address: testBillingAddress, // Usar address en lugar de billing_address
      city: testLocality || 'Rosario', // Usar city en lugar de locality
      is_admin: false,
      is_wholesale_client: true,
      is_active: true
    }

    const { data: profileDataResult, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (profileError) {
      throw profileError
    }

    if (!profileDataResult) {
      throw new Error('No se creó el perfil')
    }

    console.log('✅ Perfil creado en la base de datos')
    console.log(`   Nombre: ${profileDataResult.full_name}`)
    console.log(`   Email: ${profileDataResult.email}`)
    console.log(`   Teléfono: ${profileDataResult.phone}`)
    console.log(`   Dirección: ${profileDataResult.address || 'No especificada'}`)
    console.log(`   Ciudad: ${profileDataResult.city || 'No especificada'}`)
    console.log(`   Cliente Mayorista: ${profileDataResult.is_wholesale_client ? 'Sí' : 'No'}`)
    testsPassed++
  } catch (error) {
    console.error('❌ Error al crear perfil:', error.message)
    console.error('   Detalles:', error)
    testsFailed++
    return { passed: testsPassed, failed: testsFailed }
  }

  // TEST 3: Verificar que el perfil existe en la base de datos
  console.log('\n📝 TEST 3: Verificar que el perfil existe en la base de datos')
  console.log('-'.repeat(60))
  try {
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (!profile) {
      throw new Error('Perfil no encontrado en la base de datos')
    }

    // Verificar campos obligatorios
    if (profile.email !== testEmail) {
      throw new Error(`Email no coincide: esperado ${testEmail}, obtenido ${profile.email}`)
    }
    if (profile.full_name !== testFullName) {
      throw new Error(`Nombre no coincide: esperado ${testFullName}, obtenido ${profile.full_name}`)
    }
    if (profile.phone !== testPhone) {
      throw new Error(`Teléfono no coincide: esperado ${testPhone}, obtenido ${profile.phone}`)
    }
    if (profile.address !== testBillingAddress) {
      throw new Error(`Dirección no coincide: esperado ${testBillingAddress}, obtenido ${profile.address}`)
    }
    if (profile.is_wholesale_client !== true) {
      throw new Error(`Cliente mayorista no está marcado correctamente`)
    }

    console.log('✅ Perfil verificado en la base de datos')
    console.log(`   Todos los campos coinciden correctamente`)
    testsPassed++
  } catch (error) {
    console.error('❌ Error al verificar perfil:', error.message)
    testsFailed++
    return { passed: testsPassed, failed: testsFailed }
  }

  // TEST 4: Verificar que el cliente aparece en la consulta de admin
  console.log('\n📝 TEST 4: Verificar que el cliente aparece en consulta de admin')
  console.log('-'.repeat(60))
  try {
    // Simular la consulta que hace el panel de admin
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (customersError) {
      throw customersError
    }

    const testCustomer = customers.find(c => c.id === testUserId)
    if (!testCustomer) {
      throw new Error('Cliente no encontrado en la lista de clientes')
    }

    // Verificar que no es admin
    if (testCustomer.is_admin === true) {
      throw new Error('El cliente está marcado como admin')
    }

    console.log('✅ Cliente encontrado en la lista de clientes')
    console.log(`   Total de clientes en BD: ${customers.length}`)
    console.log(`   Cliente de prueba está en la lista`)
    testsPassed++
  } catch (error) {
    console.error('❌ Error al verificar en lista de clientes:', error.message)
    testsFailed++
    return { passed: testsPassed, failed: testsFailed }
  }

  // TEST 5: Verificar que el cliente puede iniciar sesión
  console.log('\n📝 TEST 5: Verificar que el cliente puede iniciar sesión')
  console.log('-'.repeat(60))
  try {
    // Cerrar sesión anterior si existe
    await supabase.auth.signOut()

    // Intentar iniciar sesión
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      throw loginError
    }

    if (!loginData.user) {
      throw new Error('No se pudo iniciar sesión')
    }

    console.log('✅ Cliente puede iniciar sesión correctamente')
    console.log(`   Sesión iniciada para: ${loginData.user.email}`)
    testsPassed++
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.message)
    testsFailed++
  }

  // TEST 6: Verificar registro con campos mínimos
  console.log('\n📝 TEST 6: Verificar registro con campos mínimos')
  console.log('-'.repeat(60))
  try {
    const testEmailMin = `test-cliente-min-${timestamp}@test.com`
    
    // Crear usuario con campos mínimos
    const { data: authDataMin, error: authErrorMin } = await supabase.auth.signUp({
      email: testEmailMin,
      password: testPassword,
    })

    if (authErrorMin) {
      throw authErrorMin
    }

    if (!authDataMin.user) {
      throw new Error('No se creó el usuario con campos mínimos')
    }

    const profileDataMin = {
      id: authDataMin.user.id,
      email: testEmailMin,
      full_name: `Cliente Mínimo ${timestamp}`,
      phone: testPhone,
      is_admin: false,
      is_wholesale_client: true,
      is_active: true
    }

    const { data: profileMin, error: profileErrorMin } = await supabaseAdmin
      .from('profiles')
      .insert([profileDataMin])
      .select()
      .single()

    if (profileErrorMin) {
      throw profileErrorMin
    }

    console.log('✅ Registro con campos mínimos funciona correctamente')
    console.log(`   Nombre: ${profileMin.full_name}`)
    console.log(`   Email: ${profileMin.email}`)
    
    // Limpiar usuario de prueba
    await supabaseAdmin.from('profiles').delete().eq('id', authDataMin.user.id)
    await supabaseAdmin.auth.admin.deleteUser(authDataMin.user.id)
    
    testsPassed++
  } catch (error) {
    console.error('❌ Error en registro con campos mínimos:', error.message)
    testsFailed++
  }

  // RESUMEN
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE TESTS')
  console.log('='.repeat(60))
  console.log(`✅ Tests pasados: ${testsPassed}`)
  console.log(`❌ Tests fallidos: ${testsFailed}`)
  console.log(`📈 Total: ${testsPassed + testsFailed}`)
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!')
    console.log('\n✅ El registro de clientes funciona correctamente')
    console.log('✅ Los datos se guardan en la base de datos')
    console.log('✅ Los clientes aparecen en el panel de administración')
    console.log('\n💡 Puedes verificar manualmente en: http://localhost:3000/admin/clientes')
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON')
    console.log('Revisa los errores arriba para más detalles')
  }

  console.log('\n' + '='.repeat(60))
  
  return { passed: testsPassed, failed: testsFailed }
}

// Ejecutar tests
testRegistroCliente()
  .then(async (results) => {
    await cleanup()
    process.exit(results.failed > 0 ? 1 : 0)
  })
  .catch(async (error) => {
    console.error('\n❌ Error fatal en los tests:', error)
    await cleanup()
    process.exit(1)
  })

