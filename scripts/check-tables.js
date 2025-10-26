// Script para verificar las tablas existentes en Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Verificando tablas en Supabase...');
  
  try {
    // Verificar tabla products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count(*)')
      .limit(1);

    if (productsError) {
      console.error('❌ Error con tabla products:', productsError.message);
    } else {
      console.log('✅ Tabla products: OK');
    }

    // Verificar tabla categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);

    if (categoriesError) {
      console.error('❌ Error con tabla categories:', categoriesError.message);
    } else {
      console.log('✅ Tabla categories: OK');
    }

    // Verificar tabla profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error con tabla profiles:', profilesError.message);
    } else {
      console.log('✅ Tabla profiles: OK');
    }

    // Contar productos
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar productos:', countError.message);
    } else {
      console.log(`📦 Total de productos en la base de datos: ${productCount}`);
    }

    // Mostrar algunos productos de ejemplo
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, price, stock, active')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error al obtener productos de ejemplo:', sampleError.message);
    } else {
      console.log('📋 Productos de ejemplo:');
      sampleProducts.forEach(p => {
        console.log(`- ${p.name}: $${p.price} (Stock: ${p.stock}, Activo: ${p.active})`);
      });
    }

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

checkTables().catch(console.error);
