// Script para probar la inserción de un producto
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Probando inserción de producto de prueba...');
  
  // Producto de prueba simple
  const testProduct = {
    name: 'Producto de Prueba',
    description: 'Este es un producto de prueba',
    sku: 'TEST-001',
    price: 1000,
    wholesale_price: 800,
    stock: 10,
    active: true
  };

  try {
    console.log('📤 Insertando producto de prueba...');
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (error) {
      console.error('❌ Error al insertar:', error.message);
      console.error('Detalles del error:', error);
    } else {
      console.log('✅ Producto insertado exitosamente!');
      console.log('📋 Datos insertados:', data);
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testInsert().catch(console.error);
