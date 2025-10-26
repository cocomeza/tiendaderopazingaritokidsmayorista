const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjlmrphltpsibkzfcgvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw'
);

async function fixEncoding() {
  console.log('🔧 Corrigiendo codificación de caracteres...\n');

  try {
    // Obtener todos los productos
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name');

    if (error) {
      console.error('Error obteniendo productos:', error);
      return;
    }

    console.log(`📦 Procesando ${products.length} productos...`);

    let updatedCount = 0;

    for (const product of products) {
      let originalName = product.name;
      let fixedName = product.name;

      // Corregir caracteres mal codificados comunes
      fixedName = fixedName
        .replace(/Nio/g, 'Niño')
        .replace(/nio/g, 'niño')
        .replace(/Nios/g, 'Niños')
        .replace(/nios/g, 'niños');

      if (originalName !== fixedName) {
        console.log(`✅ Corrigiendo: "${originalName}" → "${fixedName}"`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ name: fixedName })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Error actualizando ${product.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Corrección completada: ${updatedCount} productos actualizados`);

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

fixEncoding();
