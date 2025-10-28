/**
 * Script para verificar usuarios en la base de datos
 * Este script lista todos los usuarios en auth.users y sus perfiles correspondientes
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsers() {
  console.log('\n🔍 Verificando usuarios en la base de datos...\n')
  
  try {
    // 1. Verificar usuarios en auth.users usando SQL
    console.log('📋 Usuarios en auth.users:')
    const { data: users, error: usersError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          id, 
          email, 
          created_at, 
          confirmed_at, 
          last_sign_in_at,
          raw_user_meta_data->>'full_name' as full_name,
          raw_user_meta_data->>'phone' as phone,
          raw_user_meta_data->>'company_name' as company_name
        FROM auth.users 
        ORDER BY created_at DESC
      `
    })
    
    // Si no funciona el RPC, usar query directa
    let usersList = []
    if (usersError || !users) {
      console.log('⚠️ Intentando método alternativo...')
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) {
        console.error('Error consultando auth.users:', error)
        console.log('\n⚠️ No se puede acceder a auth.users')
        console.log('Continuando con la verificación de perfiles...\n')
      } else {
        usersList = data.users || []
      }
    } else {
      usersList = users || []
    }
    
    console.log(`Total: ${usersList.length} usuarios\n`)
    usersList.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Creado: ${user.created_at}`)
      console.log(`   Confirmado: ${user.confirmed_at || 'No'}`)
      console.log(`   Último acceso: ${user.last_sign_in_at || 'Nunca'}`)
      if (user.raw_user_meta_data) {
        console.log(`   Metadatos:`, user.raw_user_meta_data)
      } else if (user.full_name || user.phone || user.company_name) {
        console.log(`   Nombre: ${user.full_name || 'N/A'}`)
        console.log(`   Teléfono: ${user.phone || 'N/A'}`)
        console.log(`   Empresa: ${user.company_name || 'N/A'}`)
      }
      console.log('')
    })
    
    // 2. Verificar perfiles en la tabla profiles
    console.log('📋 Perfiles en la tabla profiles:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('Error consultando profiles:', profilesError)
      return
    }
    
    console.log(`Total: ${profiles?.length || 0} perfiles\n`)
    profiles?.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`)
      console.log(`   Email: ${profile.email}`)
      console.log(`   Nombre: ${profile.full_name || 'Sin nombre'}`)
      console.log(`   Empresa: ${profile.company_name || 'Sin empresa'}`)
      console.log(`   Teléfono: ${profile.phone || 'Sin teléfono'}`)
      console.log(`   CUIT: ${profile.cuit || 'Sin CUIT'}`)
      console.log(`   Es Admin: ${profile.is_admin ? 'Sí' : 'No'}`)
      console.log(`   Activo: ${profile.is_active ? 'Sí' : 'No'}`)
      console.log(`   Creado: ${profile.created_at}`)
      console.log(`   Actualizado: ${profile.updated_at}`)
      console.log('')
    })
    
    // 3. Verificar usuarios sin perfil
    if (usersList && profiles) {
      console.log('📊 Resumen:')
      console.log(`   Usuarios en auth.users: ${usersList.length}`)
      console.log(`   Perfiles en profiles: ${profiles.length}`)
      
      const userIds = new Set(usersList.map(u => u.id))
      const profileIds = new Set(profiles.map(p => p.id))
      
      const usersWithoutProfile = usersList.filter(u => !profileIds.has(u.id))
      const profilesWithoutUser = profiles.filter(p => !userIds.has(p.id))
      
      if (usersWithoutProfile.length > 0) {
        console.log(`\n⚠️ Usuarios sin perfil (${usersWithoutProfile.length}):`)
        usersWithoutProfile.forEach(user => {
          console.log(`   - ${user.email} (${user.id})`)
        })
      }
      
      if (profilesWithoutUser.length > 0) {
        console.log(`\n⚠️ Perfiles sin usuario (${profilesWithoutUser.length}):`)
        profilesWithoutUser.forEach(profile => {
          console.log(`   - ${profile.email} (${profile.id})`)
        })
      }
      
      if (usersWithoutProfile.length === 0 && profilesWithoutUser.length === 0) {
        console.log('\n✅ Todos los usuarios tienen perfil correspondiente')
      }
    }
    
    // 4. Verificar políticas RLS
    console.log('\n📋 Políticas RLS en la tabla profiles:')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' })
      .single()
    
    if (policiesError) {
      console.log('No se pueden consultar las políticas automáticamente')
      console.log('Ejecuta manualmente en el SQL Editor:')
      console.log(`
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'profiles';
      `)
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

checkUsers()
  .then(() => {
    console.log('\n✅ Verificación completada\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })

