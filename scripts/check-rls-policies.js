/**
 * Script para verificar las políticas RLS en la tabla profiles
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  console.log('\n🔍 Verificando políticas RLS...\n')
  
  try {
    // Verificar si la tabla profiles existe
    console.log('1. Verificando si la tabla profiles existe...')
    const { data: tableExists, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.error('❌ La tabla profiles no existe o hay un error:', tableError.message)
      console.log('\n💡 Ejecuta las migraciones primero')
      return
    }
    console.log('✅ La tabla profiles existe\n')
    
    // Consultar políticas usando SQL directo
    console.log('2. Verificando políticas RLS...')
    const { data: policies, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          policyname,
          cmd,
          permissive,
          roles
        FROM pg_policies
        WHERE tablename = 'profiles'
        ORDER BY cmd, policyname;
      `
    })
    
    if (error) {
      // Si no funciona RPC, usar consulta SQL directa
      const { data: policiesData, error: policiesError } = await supabase
        .from('_realtime')
        .select('channel')
        .limit(0)
      
      console.log('\n⚠️ No se puede consultar políticas automáticamente')
      console.log('\nEjecuta este SQL en el dashboard de Supabase:\n')
      console.log(`
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
      `)
      return
    }
    
    if (policies && policies.length > 0) {
      console.log(`✅ Se encontraron ${policies.length} políticas:`)
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd}, ${p.permissive})`)
      })
    } else {
      console.log('⚠️ No se encontraron políticas RLS')
      console.log('💡 Esto es un problema. Necesitas crear las políticas.')
    }
    
    console.log('\n3. Verificando estado de RLS en la tabla profiles...')
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles';
      `
    })
    
    if (!rlsError && rlsStatus && rlsStatus.length > 0) {
      const status = rlsStatus[0].rowsecurity
      console.log(`   RLS está: ${status ? 'HABILITADO ✓' : 'DESHABILITADO ✗'}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkPolicies()
  .then(() => {
    console.log('\n✅ Verificación completada\n')
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
  })

