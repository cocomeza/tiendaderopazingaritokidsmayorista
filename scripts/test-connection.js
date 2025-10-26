// Script para probar la conexión con Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjU2MjcsImV4cCI6MjA3NjgwMTYyN30.FExQYsd4T2PxFbxVUC3oB0pPa4xrOdW1bAnHlH8Vfyg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  
  try {
    // Probar conexión básica
    console.log('1. Probando conexión básica...');
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, stock, active')
      .eq('active', true)
      .limit(5);

    if (error) {
      console.error('❌ Error en conexión:', error.message);
      console.error('Detalles:', error);
      return;
    }

    console.log('✅ Conexión exitosa!');
    console.log(`📦 Productos encontrados: ${data.length}`);
    
    if (data.length > 0) {
      console.log('📋 Primeros productos:');
      data.forEach(p => {
        console.log(`- ${p.name}: $${p.price} (Stock: ${p.stock}, Activo: ${p.active})`);
      });
    }

    // Probar conteo total
    console.log('\n2. Probando conteo total...');
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error en conteo:', countError.message);
    } else {
      console.log(`📊 Total de productos en la base de datos: ${count}`);
    }

    // Probar productos activos
    console.log('\n3. Probando productos activos...');
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (activeError) {
      console.error('❌ Error en conteo activos:', activeError.message);
    } else {
      console.log(`✅ Productos activos: ${activeCount}`);
    }

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    console.error('Stack:', err.stack);
  }
}

testConnection().catch(console.error);
