/**
 * Script para promover un usuario a administrador
 * Uso: node scripts/make-admin.js EMAIL
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MTcyNDcsImV4cCI6MjA0NDk5MzI0N30.jGIQi0XxFxJ2Nqhyz8a8_8Q3j_GfT5J7V1K7L8V9L0c'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function promoteToAdmin(email) {
  console.log(`\n🔧 Promoviendo ${email} a administrador...\n`)

  try {
    // Obtener todos los perfiles
    const { data: profiles, error: listError } = await supabase
      .from('profiles')
      .select('*')

    if (listError) {
      console.error('❌ Error al obtener perfiles:', listError)
      return
    }

    console.log('🔍 Buscando usuario:', email)
    console.log('\n📋 Todos los usuarios:')
    profiles.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.email} (Admin: ${p.is_admin})`)
    })

    // Buscar el usuario
    const profile = profiles.find(p => p.email === email)

    if (!profile) {
      console.error('\n❌ No se encontró el usuario:', email)
      return
    }

    console.log(`\n✅ Usuario encontrado: ${profile.email}`)

    // Actualizar a admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ Error al actualizar:', updateError)
      return
    }

    console.log('✅ Usuario promovido a administrador exitosamente!')
    console.log(`📧 Email: ${profile.email}`)
    console.log(`🆔 ID: ${profile.id}`)
    console.log('\n🎉 Ahora puedes iniciar sesión en /admin/login con este email\n')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const email = process.argv[2] || 'boton.creativo.ar@gmail.com'
promoteToAdmin(email)

