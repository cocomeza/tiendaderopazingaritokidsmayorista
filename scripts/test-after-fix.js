// Script para probar la conexión después de arreglar las políticas
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjU2MjcsImV4cCI6MjA3NjgwMTYyN30.FExQYsd4T2PxFbxVUC3oB0pPa4xrOdW1bAnHlH8Vfyg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAfterFix() {
  console.log('🔍 Probando conexión después del fix...');
  
  try {
    // Probar productos
    console.log('1. Probando productos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, active')
      .eq('active', true)
      .limit(10);

    if (productsError) {
      console.error('❌ Error en productos:', productsError.message);
      return;
    }

    console.log('✅ Productos cargados correctamente!');
    console.log(`📦 Productos encontrados: ${products.length}`);
    
    if (products.length > 0) {
      console.log('📋 Primeros productos:');
      products.forEach(p => {
        console.log(`- ${p.name}: $${p.price} (Stock: ${p.stock})`);
      });
    }

    // Probar categorías
    console.log('\n2. Probando categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error en categorías:', categoriesError.message);
    } else {
      console.log('✅ Categorías cargadas correctamente!');
      console.log(`📂 Categorías encontradas: ${categories.length}`);
      if (categories.length > 0) {
        categories.forEach(c => console.log(`- ${c.name}`));
      }
    }

    // Probar conteo total
    console.log('\n3. Probando conteo total...');
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (countError) {
      console.error('❌ Error en conteo:', countError.message);
    } else {
      console.log(`📊 Total de productos activos: ${count}`);
    }

    console.log('\n🎉 ¡Todo funcionando correctamente!');
    console.log('✅ La aplicación debería cargar los productos ahora');

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testAfterFix().catch(console.error);
