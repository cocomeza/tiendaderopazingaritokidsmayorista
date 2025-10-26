const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrices() {
  console.log('💰 ACTUALIZANDO PRECIOS ARGENTINOS');
  console.log('===================================');

  try {
    // Obtener todos los productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError);
      return;
    }

    console.log(`📦 Procesando ${products.length} productos...`);

    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const updates = {};

        // Solo actualizar precios que sean menores a 1000 (asumiendo que están en formato incorrecto)
        if (product.price < 1000) {
          updates.price = Math.round(product.price * 1000);
        }
        if (product.wholesale_price < 1000) {
          updates.wholesale_price = Math.round(product.wholesale_price * 1000);
        }
        if (product.cost_price && product.cost_price < 1000) {
          updates.cost_price = Math.round(product.cost_price * 1000);
        }

        // Asignar categoría basada en el nombre del producto
        if (!product.category_id) {
          let categoryId = null;
          
          if (product.name.toLowerCase().includes('remera')) {
            categoryId = 'c161adf4-290e-4491-a751-c8a2080c34e2'; // Remeras
          } else if (product.name.toLowerCase().includes('short') || product.name.toLowerCase().includes('pantalon')) {
            categoryId = '7d3ef5ea-5be4-4699-b07a-17584e69b027'; // Pantalones
          } else if (product.name.toLowerCase().includes('conjunto')) {
            categoryId = 'd752a188-28b1-45ee-b202-75f6d396e444'; // Conjuntos
          } else if (product.name.toLowerCase().includes('vestido')) {
            categoryId = '87602903-29ea-4074-9a58-cff293b8e18e'; // Vestidos
          } else if (product.name.toLowerCase().includes('calzado') || product.name.toLowerCase().includes('zapato')) {
            categoryId = 'afbdb530-9210-4dbe-8399-5fcdb6645e2b'; // Calzado
          } else if (product.name.toLowerCase().includes('bebe') || product.name.toLowerCase().includes('bebé')) {
            categoryId = '81f1e5b3-fe0e-4304-a96a-7b09f2927cc4'; // Bebés
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
            if (updates.price) {
              console.log(`✅ ${product.name}: $${product.price} → $${updates.price}`);
            }
            if (updates.category_id) {
              console.log(`✅ ${product.name}: Categoría asignada`);
            }
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

  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  }
}

updatePrices();
