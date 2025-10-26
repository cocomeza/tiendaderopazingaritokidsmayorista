// Script simple para probar la conexión con Supabase
const { createClient } = require('@supabase/supabase-js')

// Leer variables de entorno directamente del archivo .env.local
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })
  
  return envVars
}

const env = loadEnvFile()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
    console.log('\n📊 Verificando productos...')
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, wholesale_price, stock, active')
      .limit(10)

    if (productsError) {
      console.error('❌ Error al consultar productos:', productsError.message)
      console.error('Detalles:', productsError)
      return
    }

    console.log('✅ Conexión exitosa!')
    console.log(`📦 Productos encontrados: ${products?.length || 0}`)
    
    if (products && products.length > 0) {
      console.log('\n📋 Productos disponibles:')
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   Precio: $${product.price}`)
        console.log(`   Mayorista: $${product.wholesale_price}`)
        console.log(`   Stock: ${product.stock}`)
        console.log(`   Activo: ${product.active}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No hay productos en la base de datos')
      console.log('💡 Necesitas insertar productos en Supabase')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testConnection()
