require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDiscounts() {
  console.log('🔧 CONFIGURANDO ESCALA DE DESCUENTOS');
  console.log('=====================================\n');

  try {
    // Primero verificar si la tabla existe
    const { data: existingData, error: checkError } = await supabase
      .from('discount_rules')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('📝 La tabla discount_rules no existe. Creándola...');
      
      // Crear la tabla manualmente
      const createTableSQL = `
        CREATE TABLE discount_rules (
          id SERIAL PRIMARY KEY,
          min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
          max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity > min_quantity),
          discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 50),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL });
      if (createError) {
        console.error('❌ Error creando tabla:', createError.message);
        return;
      }
      console.log('✅ Tabla discount_rules creada');
    }

    // Insertar reglas de descuento por defecto
    const defaultRules = [
      { min_quantity: 5, max_quantity: 9, discount_percentage: 5.00, is_active: true },
      { min_quantity: 10, max_quantity: 24, discount_percentage: 10.00, is_active: true },
      { min_quantity: 25, max_quantity: 49, discount_percentage: 15.00, is_active: true },
      { min_quantity: 50, max_quantity: 99, discount_percentage: 20.00, is_active: true },
      { min_quantity: 100, max_quantity: null, discount_percentage: 25.00, is_active: true }
    ];

    console.log('📝 Insertando reglas de descuento por defecto...');
    
    // Limpiar reglas existentes
    const { error: deleteError } = await supabase
      .from('discount_rules')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('❌ Error eliminando reglas existentes:', deleteError.message);
    }

    // Insertar nuevas reglas
    const { data, error: insertError } = await supabase
      .from('discount_rules')
      .insert(defaultRules)
      .select();

    if (insertError) {
      console.error('❌ Error insertando reglas:', insertError.message);
      return;
    }

    console.log('✅ Reglas de descuento insertadas correctamente');
    
    // Mostrar las reglas creadas
    const { data: rules, error: selectError } = await supabase
      .from('discount_rules')
      .select('*')
      .order('min_quantity');

    if (selectError) {
      console.error('❌ Error obteniendo reglas:', selectError.message);
    } else {
      console.log('\n📋 Escala de descuentos configurada:');
      rules.forEach(rule => {
        const range = rule.max_quantity 
          ? `${rule.min_quantity}-${rule.max_quantity} unidades`
          : `${rule.min_quantity}+ unidades`;
        console.log(`   • ${range}: ${rule.discount_percentage}% descuento`);
      });
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('============================');
    console.log('✅ La escala de descuentos está lista');
    console.log('🌐 Accede al panel admin: http://localhost:3000/admin/descuentos');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

setupDiscounts();
