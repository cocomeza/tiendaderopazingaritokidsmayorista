// Script para ver todos los campos de productos disponibles
const { createClient } = require('@supabase/supabase-js')

// Leer variables de entorno directamente del archivo .env.local
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    // Ignorar comentarios y líneas vacías
    if (line.trim().startsWith('#') || line.trim() === '') return
    
    const equalIndex = line.indexOf('=')
    if (equalIndex > 0) {
      const key = line.substring(0, equalIndex).trim()
      const value = line.substring(equalIndex + 1).trim()
      envVars[key] = value
    }
  })
  
  return envVars
}

const env = loadEnvFile()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProductFields() {
  try {
    console.log('🔍 Verificando campos disponibles en productos...')
    
    // Obtener un producto completo para ver todos los campos
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (products && products.length > 0) {
      const product = products[0]
      console.log('\n📋 Campos disponibles en productos:')
      console.log('=====================================')
      
      Object.keys(product).forEach(key => {
        const value = product[key]
        const type = Array.isArray(value) ? 'array' : typeof value
        console.log(`${key}: ${type} = ${JSON.stringify(value)}`)
      })
      
      console.log('\n📊 Ejemplo de producto completo:')
      console.log('================================')
      console.log(JSON.stringify(product, null, 2))
    } else {
      console.log('⚠️  No se encontraron productos')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

checkProductFields()
