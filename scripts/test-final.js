require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando variables:');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('KEY:', supabaseKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  
  try {
    // Test 1: Contar productos
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (productError) {
      console.error('❌ Error contando productos:', productError);
    } else {
      console.log(`✅ Productos en la base: ${productCount}`);
    }

    // Test 2: Contar categorías
    const { count: categoryCount, error: categoryError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoryError) {
      console.error('❌ Error contando categorías:', categoryError);
    } else {
      console.log(`✅ Categorías en la base: ${categoryCount}`);
    }

    // Test 3: Obtener algunos productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, wholesale_price, stock, active')
      .eq('active', true)
      .limit(5);

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError);
    } else {
      console.log('✅ Productos activos:');
      products.forEach(product => {
        console.log(`   - ${product.name}: $${product.wholesale_price} (stock: ${product.stock})`);
      });
    }

    // Test 4: Obtener categorías
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
    } else {
      console.log('✅ Categorías disponibles:');
      categories.forEach(category => {
        console.log(`   - ${category.name} (${category.id})`);
      });
    }

    console.log('\n🎉 ¡Conexión exitosa! La página debería funcionar ahora.');
    console.log('🌐 Ve a: http://localhost:3002/productos');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testConnection();
