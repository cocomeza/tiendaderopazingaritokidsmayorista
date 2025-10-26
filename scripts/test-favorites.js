const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFavoritesFunctionality() {
  console.log('🧪 PROBANDO FUNCIONALIDAD DE FAVORITOS')
  console.log('=====================================')

  try {
    // 1. Verificar que la tabla existe
    console.log('1️⃣ Verificando tabla de favoritos...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Error accediendo a la tabla:', tableError.message)
      return
    }
    console.log('✅ Tabla de favoritos accesible')

    // 2. Verificar que hay productos disponibles
    console.log('\n2️⃣ Verificando productos disponibles...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('active', true)
      .limit(5)

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError.message)
      return
    }

    if (!products || products.length === 0) {
      console.log('⚠️ No hay productos activos disponibles')
      return
    }

    console.log(`✅ ${products.length} productos disponibles:`)
    products.forEach(product => {
      console.log(`   - ${product.name} (ID: ${product.id})`)
    })

    // 3. Verificar usuarios disponibles
    console.log('\n3️⃣ Verificando usuarios disponibles...')
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(3)

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No hay usuarios registrados')
      return
    }

    console.log(`✅ ${users.length} usuarios disponibles:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`)
    })

    // 4. Probar inserción de favorito (simulación)
    console.log('\n4️⃣ Probando inserción de favorito...')
    const testUserId = users[0].id
    const testProductId = products[0].id

    console.log(`   Usuario: ${testUserId}`)
    console.log(`   Producto: ${testProductId}`)

    // Verificar si ya existe
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', testUserId)
      .eq('product_id', testProductId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error verificando favorito existente:', checkError.message)
      return
    }

    if (existingFavorite) {
      console.log('✅ Favorito ya existe, probando eliminación...')
      
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', testUserId)
        .eq('product_id', testProductId)

      if (deleteError) {
        console.error('❌ Error eliminando favorito:', deleteError.message)
        return
      }
      console.log('✅ Favorito eliminado correctamente')
    }

    // Insertar nuevo favorito
    const { error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id: testUserId,
        product_id: testProductId
      })

    if (insertError) {
      console.error('❌ Error insertando favorito:', insertError.message)
      return
    }
    console.log('✅ Favorito insertado correctamente')

    // 5. Verificar que se puede leer
    console.log('\n5️⃣ Verificando lectura de favoritos...')
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', testUserId)

    if (favoritesError) {
      console.error('❌ Error leyendo favoritos:', favoritesError.message)
      return
    }

    console.log(`✅ ${favorites.length} favoritos encontrados para el usuario`)
    favorites.forEach(fav => {
      console.log(`   - Producto ID: ${fav.product_id}`)
    })

    console.log('\n🎉 ¡Todas las pruebas pasaron! La funcionalidad de favoritos está funcionando correctamente.')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testFavoritesFunctionality()

