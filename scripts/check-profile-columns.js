require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
  console.log('\n🔍 Verificando columnas de la tabla profiles...\n')
  
  try {
    // Intentar obtener un perfil existente para ver qué columnas tiene
    const { data: sample, error: sampleError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
      .single()

    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('Error:', sampleError)
      return
    }

    if (sample) {
      console.log('✅ Columnas encontradas en profiles:')
      console.log(Object.keys(sample).join(', '))
      console.log('\n📋 Detalles:')
      Object.keys(sample).forEach(key => {
        console.log(`   - ${key}: ${typeof sample[key]}`)
      })
    } else {
      console.log('⚠️ No hay perfiles en la base de datos para verificar columnas')
      console.log('Intentando crear un perfil de prueba...')
      
      // Intentar crear con campos básicos
      const testData = {
        id: '00000000-0000-0000-0000-000000000000', // UUID de prueba
        email: 'test@test.com',
        full_name: 'Test',
        phone: '1234567890',
        company_name: 'Test Company'
      }
      
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([testData])
      
      if (insertError) {
        console.error('Error al insertar:', insertError.message)
        console.error('Código:', insertError.code)
      } else {
        console.log('✅ Perfil de prueba creado')
        await supabaseAdmin.from('profiles').delete().eq('id', testData.id)
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkColumns()

