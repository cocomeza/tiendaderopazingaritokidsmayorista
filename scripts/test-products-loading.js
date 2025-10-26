const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjlmrphltpsibkzfcgvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw'
);

async function testProductsLoading() {
  console.log('🔍 Verificando carga de productos...\n');

  try {
    // Simular la misma consulta que hace la página
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, price, wholesale_price, stock, category_id, active')
      .eq('active', true)
      .limit(20);

    console.log('📦 Resultado de productos:');
    console.log('   Error:', productsError);
    console.log('   Cantidad:', productsData ? productsData.length : 0);
    
    if (productsData && productsData.length > 0) {
      console.log('   Primeros 3 productos:');
      productsData.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
      });
    }

    // Verificar categorías
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    console.log('\n📋 Resultado de categorías:');
    console.log('   Error:', categoriesError);
    console.log('   Cantidad:', categoriesData ? categoriesData.length : 0);
    
    if (categoriesData && categoriesData.length > 0) {
      console.log('   Categorías:');
      categoriesData.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testProductsLoading();
