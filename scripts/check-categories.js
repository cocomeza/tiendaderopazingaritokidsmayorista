require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjU2MjcsImV4cCI6MjA3NjgwMTYyN30.FExQYsd4T2PxFbxVUC3oB0pPa4xrOdW1bAnHlH8Vfyg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCategories() {
  console.log('\n🔍 Verificando categorías en la base de datos...\n')

  try {
    // Intentar cargar categorías (sin parent_id primero)
    let { data, error } = await supabase
      .from('categories')
      .select('id, name, active')
      .order('name')

    // Si no hay error, intentar con parent_id para ver si existe
    if (!error) {
      const { data: dataWithParent, error: errorWithParent } = await supabase
        .from('categories')
        .select('id, name, parent_id, active')
        .order('name')
      
      if (!errorWithParent) {
        data = dataWithParent
        console.log('✅ La columna parent_id existe en la tabla')
      } else {
        console.log('⚠️ La columna parent_id NO existe en la tabla')
      }
    }

    if (error) {
      console.error('❌ Error:', error)
      console.error('Código:', error.code)
      console.error('Mensaje:', error.message)
      console.error('Detalles:', error.details)
      console.error('Hint:', error.hint)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No hay categorías en la base de datos')
      console.log('\n💡 Necesitas crear categorías primero.')
      return
    }

    console.log(`✅ Encontradas ${data.length} categorías:\n`)
    
    // Verificar si parent_id existe
    const hasParentId = data.some(cat => 'parent_id' in cat)
    
    if (hasParentId) {
      const mainCategories = data.filter(cat => !cat.parent_id)
      const subcategories = data.filter(cat => cat.parent_id)
      
      console.log(`📁 Categorías principales: ${mainCategories.length}`)
      mainCategories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id}, Active: ${cat.active})`)
      })
      
      console.log(`\n📂 Subcategorías: ${subcategories.length}`)
      subcategories.forEach(cat => {
        const parent = data.find(p => p.id === cat.parent_id)
        console.log(`   - ${cat.name} (Parent: ${parent?.name || 'N/A'}, Active: ${cat.active})`)
      })
    } else {
      // Si no hay parent_id, todas son categorías principales
      console.log(`📁 Todas las categorías (sin jerarquía): ${data.length}`)
      data.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id}, Active: ${cat.active})`)
      })
    }

    // Verificar categorías activas
    const activeCategories = data.filter(cat => cat.active === true)
    console.log(`\n✅ Categorías activas: ${activeCategories.length}`)
    
    if (activeCategories.length === 0) {
      console.log('\n⚠️ ADVERTENCIA: No hay categorías activas!')
      console.log('   Esto puede causar problemas con las políticas RLS.')
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

checkCategories()

