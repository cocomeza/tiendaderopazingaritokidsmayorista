const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProductsWithCategories() {
  console.log('🔧 ACTUALIZANDO PRODUCTOS CON CATEGORÍAS');
  console.log('=========================================');

  try {
    // 1. Obtener todos los productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError);
      return;
    }

    console.log(`📦 Procesando ${products.length} productos...`);

    // 2. Obtener categorías
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
      return;
    }

    // Crear mapa de categorías
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    console.log('📋 Categorías disponibles:', Object.keys(categoryMap));

    // 3. Actualizar productos con categorías
    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        let categoryId = null;
        
        // Asignar categoría basada en el nombre del producto
        if (product.name.toLowerCase().includes('remera')) {
          categoryId = categoryMap['remeras'];
        } else if (product.name.toLowerCase().includes('short') || product.name.toLowerCase().includes('pantalon')) {
          categoryId = categoryMap['pantalones'];
        } else if (product.name.toLowerCase().includes('conjunto')) {
          categoryId = categoryMap['conjuntos'];
        } else if (product.name.toLowerCase().includes('vestido')) {
          categoryId = categoryMap['vestidos'];
        } else if (product.name.toLowerCase().includes('calzado') || product.name.toLowerCase().includes('zapato') || product.name.toLowerCase().includes('zapa')) {
          categoryId = categoryMap['calzado'];
        } else if (product.name.toLowerCase().includes('bebe') || product.name.toLowerCase().includes('bebé') || product.name.toLowerCase().includes('body')) {
          categoryId = categoryMap['bebés'];
        } else if (product.name.toLowerCase().includes('gorro') || product.name.toLowerCase().includes('gorra') || product.name.toLowerCase().includes('mochila')) {
          categoryId = categoryMap['accesorios'];
        } else if (product.name.toLowerCase().includes('jean') || product.name.toLowerCase().includes('bermuda')) {
          categoryId = categoryMap['pantalones'];
        }

        // Solo actualizar si encontramos una categoría
        if (categoryId) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ category_id: categoryId })
            .eq('id', product.id);

          if (updateError) {
            console.error(`❌ Error actualizando ${product.name}:`, updateError);
            errors++;
          } else {
            updated++;
            const categoryName = categories.find(c => c.id === categoryId)?.name;
            console.log(`✅ ${product.name} → ${categoryName}`);
          }
        }

      } catch (err) {
        console.error(`❌ Error procesando ${product.name}:`, err);
        errors++;
      }
    }

    console.log('\n🎉 ACTUALIZACIÓN COMPLETADA');
    console.log(`✅ Productos actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);

    // 4. Verificar resultado
    const { data: productsWithCategories, error: verifyError } = await supabase
      .from('products')
      .select('id, name, category_id')
      .not('category_id', 'is', null)
      .limit(10);

    if (!verifyError && productsWithCategories) {
      console.log('\n📊 Productos con categorías asignadas:');
      productsWithCategories.forEach(p => {
        const categoryName = categories.find(c => c.id === p.category_id)?.name;
        console.log(`   - ${p.name} (${categoryName})`);
      });
    }

  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  }
}

updateProductsWithCategories();
