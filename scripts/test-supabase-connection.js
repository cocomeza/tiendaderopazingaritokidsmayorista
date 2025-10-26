// Script para probar la conexión con Supabase y verificar productos
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Probando conexión con Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n📊 Verificando tablas...')
    
    // Verificar si existe la tabla products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, wholesale_price, stock, active')
      .limit(5)

    if (productsError) {
      console.error('❌ Error al consultar productos:', productsError.message)
      return
    }

    console.log('✅ Conexión exitosa!')
    console.log(`📦 Productos encontrados: ${products?.length || 0}`)
    
    if (products && products.length > 0) {
      console.log('\n📋 Primeros productos:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
      })
    } else {
      console.log('⚠️  No hay productos en la base de datos')
    }

    // Verificar categorías
    console.log('\n🏷️  Verificando categorías...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5)

    if (categoriesError) {
      console.log('⚠️  Error al consultar categorías:', categoriesError.message)
    } else {
      console.log(`✅ Categorías encontradas: ${categories?.length || 0}`)
      if (categories && categories.length > 0) {
        categories.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat.name}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testConnection()
