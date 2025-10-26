const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductsData() {
  console.log('🔧 CORRIGIENDO DATOS DE PRODUCTOS');
  console.log('==================================');

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

    // 2. Obtener categorías para mapeo
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError);
      return;
    }

    // Crear mapa de categorías por nombre
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    console.log('📋 Categorías disponibles:', Object.keys(categoryMap));

    // 3. Procesar cada producto
    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const updates = {};

        // Arreglar precios (multiplicar por 1000 si son muy bajos)
        if (product.price < 1000) {
          updates.price = Math.round(product.price * 1000);
        }
        if (product.wholesale_price < 1000) {
          updates.wholesale_price = Math.round(product.wholesale_price * 1000);
        }

        // Asignar categoría basada en el nombre del producto
        if (!product.category_id) {
          let categoryId = null;
          
          if (product.name.toLowerCase().includes('remera')) {
            categoryId = categoryMap['remeras'];
          } else if (product.name.toLowerCase().includes('short') || product.name.toLowerCase().includes('pantalon')) {
            categoryId = categoryMap['pantalones'];
          } else if (product.name.toLowerCase().includes('conjunto')) {
            categoryId = categoryMap['conjuntos'];
          } else if (product.name.toLowerCase().includes('vestido')) {
            categoryId = categoryMap['vestidos'];
          } else if (product.name.toLowerCase().includes('calzado') || product.name.toLowerCase().includes('zapato')) {
            categoryId = categoryMap['calzado'];
          } else if (product.name.toLowerCase().includes('bebe') || product.name.toLowerCase().includes('bebé')) {
            categoryId = categoryMap['bebés'];
          }

          if (categoryId) {
            updates.category_id = categoryId;
          }
        }

        // Actualizar producto si hay cambios
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);

          if (updateError) {
            console.error(`❌ Error actualizando ${product.name}:`, updateError);
            errors++;
          } else {
            updated++;
            console.log(`✅ Actualizado: ${product.name}`);
            if (updates.price) console.log(`   Precio: $${product.price} → $${updates.price}`);
            if (updates.category_id) console.log(`   Categoría: Sin categoría → ${categories.find(c => c.id === updates.category_id)?.name}`);
          }
        }

      } catch (err) {
        console.error(`❌ Error procesando ${product.name}:`, err);
        errors++;
      }
    }

    console.log('\n🎉 CORRECCIÓN COMPLETADA');
    console.log(`✅ Productos actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);

  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  }
}

fixProductsData();
