// Script para verificar el esquema de la base de datos
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Verificando esquema de la base de datos...');
  
  try {
    // Intentar hacer una consulta simple para ver la estructura
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al consultar tabla products:', error.message);
      
      // Intentar crear la tabla si no existe
      console.log('🔧 Intentando crear la tabla products...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS products (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          name text NOT NULL,
          description text,
          sku text UNIQUE,
          price numeric(10, 2) NOT NULL CHECK (price >= 0),
          wholesale_price numeric(10, 2) CHECK (wholesale_price >= 0),
          stock integer DEFAULT 0 CHECK (stock >= 0),
          low_stock_threshold integer DEFAULT 10,
          category text,
          subcategory text,
          sizes text[],
          colors text[],
          gender text CHECK (gender IN ('niños', 'niñas', 'bebes', 'unisex', null)),
          age_range text,
          featured boolean DEFAULT false,
          active boolean DEFAULT true,
          images text[],
          tags text[],
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('❌ Error al crear tabla:', createError.message);
      } else {
        console.log('✅ Tabla products creada exitosamente');
      }
    } else {
      console.log('✅ Tabla products existe');
      console.log('📋 Estructura de la tabla:');
      if (data && data.length > 0) {
        console.log('Columnas disponibles:', Object.keys(data[0]));
      }
    }
    
    // Verificar si hay productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Error al consultar productos:', productsError.message);
    } else {
      console.log(`📦 Productos encontrados: ${products.length}`);
      if (products.length > 0) {
        console.log('Primeros productos:');
        products.forEach(p => console.log(`- ${p.name}: $${p.price} (Stock: ${p.stock})`));
      }
    }
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

checkSchema().catch(console.error);
