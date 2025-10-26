const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjlmrphltpsibkzfcgvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw'
);

async function checkProducts() {
  console.log('🔍 Verificando productos con caracteres especiales...\n');

  try {
    // Buscar productos con ñ
    const { data: productsWithN, error: errorN } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%ñ%');

    if (errorN) {
      console.error('Error buscando ñ:', errorN);
    } else {
      console.log(`📝 Productos con ñ encontrados: ${productsWithN.length}`);
      productsWithN.forEach(p => console.log(`   - ${p.name}`));
    }

    // Buscar productos con "niños"
    const { data: productsWithNinos, error: errorNinos } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%niños%');

    if (errorNinos) {
      console.error('Error buscando niños:', errorNinos);
    } else {
      console.log(`\n👶 Productos con "niños" encontrados: ${productsWithNinos.length}`);
      productsWithNinos.forEach(p => console.log(`   - ${p.name}`));
    }

    // Buscar algunos productos de ejemplo
    const { data: sampleProducts, error: errorSample } = await supabase
      .from('products')
      .select('id, name')
      .limit(10);

    if (errorSample) {
      console.error('Error obteniendo muestra:', errorSample);
    } else {
      console.log('\n📦 Muestra de productos:');
      sampleProducts.forEach(p => console.log(`   - ${p.name}`));
    }

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

checkProducts();
