const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjlmrphltpsibkzfcgvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw'
);

async function fixAllEncoding() {
  console.log('🔧 Corrigiendo todos los productos con problemas de codificación...\n');

  try {
    // Buscar productos con caracteres mal codificados
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name');

    if (error) {
      console.error('Error obteniendo productos:', error);
      return;
    }

    let updatedCount = 0;

    for (const product of products) {
      let originalName = product.name;
      let fixedName = product.name;

      // Corregir caracteres mal codificados
      fixedName = fixedName
        .replace(/Ni[^a-zA-Z]/g, 'Niño')  // Corregir "Nio" -> "Niño"
        .replace(/ni[^a-zA-Z]/g, 'niño')  // Corregir "nio" -> "niño"
        .replace(/Nios/g, 'Niños')
        .replace(/nios/g, 'niños')
        .replace(/Edicion/g, 'Edición')
        .replace(/edicion/g, 'edición');

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

fixAllEncoding();
