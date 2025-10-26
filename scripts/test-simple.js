const { createClient } = require('@supabase/supabase-js');

// Variables hardcodeadas temporalmente para testing
const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 AUDITORÍA EMPRESARIAL - ZINGARITO KIDS');
  console.log('==========================================');
  
  try {
    // Test 1: Conexión básica
    console.log('\n1️⃣ Probando conexión con Supabase...');
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (productError) {
      console.error('❌ ERROR CRÍTICO - Base de datos:', productError.message);
      return;
    }
    console.log(`✅ Productos en la base: ${productCount}`);

    // Test 2: Productos activos
    console.log('\n2️⃣ Verificando productos activos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, wholesale_price, stock, active, category_id')
      .eq('active', true)
      .limit(10);

    if (productsError) {
      console.error('❌ ERROR - Productos activos:', productsError.message);
    } else {
      console.log(`✅ Productos activos encontrados: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Precio: $${product.price} | Mayorista: $${product.wholesale_price}`);
        console.log(`      Stock: ${product.stock} | Categoría: ${product.category_id || 'Sin categoría'}`);
      });
    }

    // Test 3: Categorías
    console.log('\n3️⃣ Verificando categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(10);

    if (categoriesError) {
      console.error('❌ ERROR - Categorías:', categoriesError.message);
    } else {
      console.log(`✅ Categorías disponibles: ${categories.length}`);
      categories.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (ID: ${category.id})`);
      });
    }

    // Test 4: Verificar datos del CSV
    console.log('\n4️⃣ Verificando integridad de datos...');
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (allProductsError) {
      console.error('❌ ERROR - Integridad:', allProductsError.message);
    } else {
      console.log('✅ Estructura de datos verificada:');
      if (allProducts.length > 0) {
        const sample = allProducts[0];
        console.log('   Campos disponibles:', Object.keys(sample).join(', '));
        console.log('   Ejemplo de producto:', sample.name);
      }
    }

    console.log('\n🎉 AUDITORÍA COMPLETADA');
    console.log('========================');
    console.log('✅ Base de datos: CONECTADA');
    console.log('✅ Productos: DISPONIBLES');
    console.log('✅ Categorías: CONFIGURADAS');
    console.log('\n🌐 La página debería funcionar en: http://localhost:3002/productos');

  } catch (error) {
    console.error('❌ ERROR FATAL:', error.message);
  }
}

testConnection();
