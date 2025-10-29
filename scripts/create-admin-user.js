/**
 * Script para crear usuario administrador en Supabase
 * 
 * Ejecuta: node scripts/create-admin-user.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local')
  console.log('\n📝 Para obtenerla:')
  console.log('1. Ve a tu proyecto en Supabase (https://supabase.com)')
  console.log('2. Ve a Settings > API')
  console.log('3. Copia el "service_role" key (secreta)')
  console.log('4. Agrégala a .env.local como: SUPABASE_SERVICE_ROLE_KEY=tu_key_aqui')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('\n🔧 Verificando usuarios existentes en Supabase...\n')

  try {
    // Listar usuarios existentes
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Error al listar usuarios:', listError)
      return
    }

    console.log(`📊 Usuarios encontrados: ${users.users.length}\n`)

    if (users.users.length === 0) {
      console.log('⚠️  No hay usuarios registrados en Supabase.')
      console.log('\n📝 Para crear un usuario admin:')
      console.log('1. Regístrate en la aplicación como cliente normal')
      console.log('2. Copia el email que usaste')
      console.log('3. Ejecuta este script para promover ese usuario a admin')
      console.log('\nO usa el panel de Supabase para crear un usuario manualmente.')
      return
    }

    console.log('👥 Usuarios existentes:')
    users.users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Creado: ${new Date(user.created_at).toLocaleString()}`)
    })

    // Verificar perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('\n❌ Error al obtener perfiles:', profilesError)
      return
    }

    console.log('\n📋 Perfiles existentes:')
    if (profiles.length === 0) {
      console.log('⚠️  No hay perfiles en la tabla profiles')
    } else {
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.email}`)
        console.log(`   Admin: ${profile.is_admin ? '✅ Sí' : '❌ No'}`)
      })
    }

    // Mostrar instrucciones
    console.log('\n📝 Para promover un usuario a admin:')
    console.log('\nMétodo 1: SQL en Supabase')
    console.log('1. Ve a tu proyecto Supabase > SQL Editor')
    console.log('2. Ejecuta este SQL (reemplaza EMAIL con tu email):')
    console.log(`
      UPDATE profiles 
      SET is_admin = true 
      WHERE email = 'TU_EMAIL_AQUI';
    `)

    console.log('\nMétodo 2: Desde este script')
    console.log('1. Edita este script')
    console.log('2. Descomenta la sección al final que crea el admin')
    console.log('3. Reemplaza "tu@email.com" con tu email real')
    console.log('4. Ejecuta el script nuevamente')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Ejecutar
createAdminUser()

