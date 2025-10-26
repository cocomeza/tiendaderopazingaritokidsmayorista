const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
  console.log('🔍 VERIFICANDO PRODUCTOS EN LA BASE DE DATOS')
  console.log('==========================================')
  
  try {
    // 1. Contar todos los productos
    console.log('1️⃣ Contando todos los productos...')
    const { count: totalCount, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('❌ Error contando productos:', totalError.message)
      return
    }

    console.log(`📊 Total de productos en la BD: ${totalCount}`)

    // 2. Contar productos activos
    console.log('\n2️⃣ Contando productos activos...')
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (activeError) {
      console.error('❌ Error contando productos activos:', activeError.message)
      return
    }

    console.log(`📊 Productos activos: ${activeCount}`)

    // 3. Contar productos inactivos
    console.log('\n3️⃣ Contando productos inactivos...')
    const { count: inactiveCount, error: inactiveError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', false)

    if (inactiveError) {
      console.error('❌ Error contando productos inactivos:', inactiveError.message)
      return
    }

    console.log(`📊 Productos inactivos: ${inactiveCount}`)

    // 4. Verificar algunos productos inactivos
    console.log('\n4️⃣ Mostrando algunos productos inactivos...')
    const { data: inactiveProducts, error: inactiveDataError } = await supabase
      .from('products')
      .select('id, name, active')
      .eq('active', false)
      .limit(5)

    if (inactiveDataError) {
      console.error('❌ Error obteniendo productos inactivos:', inactiveDataError.message)
    } else {
      console.log('📋 Ejemplos de productos inactivos:')
      inactiveProducts.forEach(product => {
        console.log(`   - ${product.name} (ID: ${product.id}) - Activo: ${product.active}`)
      })
    }

    // 5. Verificar productos sin campo active
    console.log('\n5️⃣ Verificando productos sin campo active...')
    const { data: nullActiveProducts, error: nullActiveError } = await supabase
      .from('products')
      .select('id, name, active')
      .is('active', null)
      .limit(5)

    if (nullActiveError) {
      console.error('❌ Error obteniendo productos sin active:', nullActiveError.message)
    } else {
      console.log(`📊 Productos sin campo active: ${nullActiveProducts.length}`)
      if (nullActiveProducts.length > 0) {
        console.log('📋 Ejemplos:')
        nullActiveProducts.forEach(product => {
          console.log(`   - ${product.name} (ID: ${product.id}) - Activo: ${product.active}`)
        })
      }
    }

    // 6. Resumen
    console.log('\n📊 RESUMEN:')
    console.log('===========')
    console.log(`Total productos: ${totalCount}`)
    console.log(`Productos activos: ${activeCount}`)
    console.log(`Productos inactivos: ${inactiveCount}`)
    console.log(`Productos sin campo active: ${nullActiveProducts?.length || 0}`)
    console.log(`Diferencia: ${totalCount - activeCount} productos no se muestran`)

    if (totalCount - activeCount > 0) {
      console.log('\n💡 SOLUCIÓN:')
      console.log('============')
      console.log('Para mostrar todos los productos, puedes:')
      console.log('1. Marcar los productos inactivos como activos (active = true)')
      console.log('2. O quitar el filtro .eq("active", true) del código')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

checkProducts()

