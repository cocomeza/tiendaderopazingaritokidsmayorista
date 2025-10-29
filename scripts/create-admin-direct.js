/**
 * Script para crear usuario admin directamente
 * USO: node scripts/create-admin-direct.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Primero necesitamos la SERVICE_ROLE_KEY para poder crear usuarios
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.log('\n❌ No tienes la SERVICE_ROLE_KEY configurada.\n')
  console.log('📝 Para obtenerla:')
  console.log('1. Ve a https://supabase.com/dashboard')
  console.log('2. Selecciona tu proyecto (hjlmrphltpsibkzfcgvu)')
  console.log('3. Ve a Settings > API')
  console.log('4. Copia el "service_role" key (la secreta)')
  console.log('5. Agrégala a .env.local como:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui\n')
  
  console.log('🔗 O ve directamente a:')
  console.log('https://supabase.com/dashboard/project/hjlmrphltpsibkzfcgvu/settings/api\n')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_KEY)

async function createAdminUser() {
  console.log('\n🔧 Creando usuario administrador...\n')

  const email = 'admin@zingarito.com'
  const password = 'AdminZingarito2025!' // Contraseña por defecto

  try {
    // Obtener todos los usuarios primero
    console.log('1️⃣ Verificando usuario en Authentication...')
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    let adminUser = users.find(u => u.email === email)

    if (adminUser) {
      console.log('✅ Usuario ya existe en Authentication')
      console.log(`   ID: ${adminUser.id}`)
    } else {
      console.log('🆕 Creando nuevo usuario...')
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (authError) {
        console.error('❌ Error:', authError.message)
        return
      }

      adminUser = userData.user
      console.log('✅ Usuario creado en Authentication')
      console.log(`   ID: ${adminUser.id}`)
    }

    if (!adminUser) {
      console.error('❌ No se pudo encontrar el usuario')
      return
    }

    console.log(`\n2️⃣ Creando perfil en tabla profiles...`)
    
    // Primero verificar si existe
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single()

    let profileError = null

    if (existingProfile) {
      // Actualizar si existe
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', adminUser.id)
      profileError = error
      console.log('   Actualizando perfil existente...')
    } else {
      // Crear si no existe
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: adminUser.id,
          email: email,
          full_name: 'Administrador Principal',
          is_admin: true
        })
      profileError = error
      console.log('   Creando nuevo perfil...')
    }

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError.message)
      return
    }

    console.log('✅ Perfil de administrador creado')

    // Verificar
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profile && profile.is_admin) {
      console.log('\n🎉 ¡USUARIO ADMIN CREADO EXITOSAMENTE!\n')
      console.log('📧 Email:', email)
      console.log('🔑 Contraseña:', password)
      console.log('👤 Nombre:', profile.full_name)
      console.log('✅ Admin:', profile.is_admin)
      console.log('\n👉 Ahora puedes iniciar sesión en:')
      console.log('   http://localhost:3000/admin/login\n')
      console.log('⚠️  IMPORTANTE: Cambia la contraseña después de iniciar sesión\n')
    } else {
      console.log('⚠️  El usuario fue creado pero hay un problema con el perfil')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Intenta ejecutar manualmente el SQL en Supabase Dashboard > SQL Editor:')
    console.log(`
UPDATE profiles 
SET is_admin = true 
WHERE email = '${email}';
`)
  }
}

createAdminUser()

