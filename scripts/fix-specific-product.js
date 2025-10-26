const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hjlmrphltpsibkzfcgvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw'
);

async function fixSpecificProduct() {
  console.log('🔧 Corrigiendo producto específico...\n');

  try {
    // Buscar el producto específico
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%Harley%');

    if (error) {
      console.error('Error obteniendo productos:', error);
      return;
    }

    console.log('Productos encontrados:');
    products.forEach(p => console.log(`- ${p.name}`));

    // Actualizar el producto específico
    const productToFix = products.find(p => p.name.includes('Harley'));
    if (productToFix) {
      const fixedName = productToFix.name.replace(/Ni[^a-zA-Z]/g, 'Niño');
      console.log(`\n✅ Corrigiendo: "${productToFix.name}" → "${fixedName}"`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ name: fixedName })
        .eq('id', productToFix.id);

      if (updateError) {
        console.error('Error actualizando:', updateError);
      } else {
        console.log('✅ Producto actualizado correctamente');
      }
    }

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

fixSpecificProduct();
