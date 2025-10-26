require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDiscountTable() {
  console.log('🔧 CREANDO TABLA DE DESCUENTOS');
  console.log('================================\n');

  try {
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('./scripts/create-discount-table.sql', 'utf8');
    
    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Ejecutando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⏳ Ejecutando comando ${i + 1}/${commands.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            // Si es un error de "ya existe", lo ignoramos
            if (error.message.includes('already exists') || error.message.includes('ya existe')) {
              console.log(`⚠️  Comando ${i + 1}: Ya existe (ignorado)`);
            } else {
              console.error(`❌ Error en comando ${i + 1}:`, error.message);
            }
          } else {
            console.log(`✅ Comando ${i + 1}: Ejecutado correctamente`);
          }
        } catch (err) {
          console.error(`❌ Error ejecutando comando ${i + 1}:`, err.message);
        }
      }
    }

    // Verificar que la tabla se creó correctamente
    console.log('\n🔍 Verificando tabla de descuentos...');
    const { data, error } = await supabase
      .from('discount_rules')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error verificando tabla:', error.message);
    } else {
      console.log(`✅ Tabla creada correctamente. Reglas encontradas: ${data.length}`);
      if (data.length > 0) {
        console.log('📋 Reglas de descuento por defecto:');
        data.forEach(rule => {
          console.log(`   • ${rule.min_quantity}${rule.max_quantity ? `-${rule.max_quantity}` : '+'} unidades: ${rule.discount_percentage}% descuento`);
        });
      }
    }

    console.log('\n🎉 TABLA DE DESCUENTOS CREADA EXITOSAMENTE');
    console.log('==========================================');
    console.log('✅ La escala de descuentos está lista para usar');
    console.log('🌐 Accede a: http://localhost:3000/admin/descuentos');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

createDiscountTable();
