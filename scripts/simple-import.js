// Script simple para importar productos
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

console.log('🔗 Conectando a Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function importProducts() {
  console.log('🚀 Iniciando importación de productos...');
  
  const products = [];
  const csvPath = 'C:\\Users\\mezac\\Downloads\\productostiendanube-4402339-17610784561605526131.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV no encontrado:', csvPath);
    return;
  }

  // Leer y procesar el CSV
  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Procesando ${rows.length} filas del CSV...`);

  // Agrupar productos por nombre
  const productGroups = {};
  rows.forEach(row => {
    const name = row['Nombre'];
    if (!name) return;
    
    if (!productGroups[name]) {
      productGroups[name] = [];
    }
    productGroups[name].push(row);
  });

  console.log(`📦 Encontrados ${Object.keys(productGroups).length} productos únicos...`);

  // Procesar cada grupo de productos (solo los primeros 10 para prueba)
  const productNames = Object.keys(productGroups).slice(0, 10);
  
  for (const productName of productNames) {
    const productRows = productGroups[productName];
    const firstRow = productRows[0];
    
    // Extraer información del producto
    const category = 'Ropa'; // Categoría por defecto
    const colors = ['Blanco', 'Negro']; // Colores por defecto
    const sizes = ['S', 'M', 'L', 'XL']; // Tallas por defecto
    
    // Calcular stock total
    const totalStock = productRows.reduce((sum, row) => {
      const stock = parseInt(row['Stock']) || 0;
      return sum + stock;
    }, 0);

    // Precio
    const price = parseFloat(firstRow['Precio']?.replace(',', '.') || '1000');
    const wholesalePrice = price * 0.8; // 20% de descuento mayorista

    const product = {
      name: productName,
      description: firstRow['Descripción'] || `Producto ${productName}`,
      sku: firstRow['SKU'] || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      price: price,
      wholesale_price: wholesalePrice,
      stock: totalStock,
      low_stock_threshold: 5,
      category: category,
      subcategory: firstRow['Categorías'] || '',
      sizes: sizes,
      colors: colors,
      gender: 'unisex',
      age_range: null,
      featured: false,
      active: totalStock > 0,
      images: [],
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(product);
    console.log(`✅ Producto preparado: ${productName} - Stock: ${totalStock}`);
  }

  console.log(`📤 Insertando ${products.length} productos en Supabase...`);

  // Insertar productos uno por uno para mejor control
  let imported = 0;
  
  for (const product of products) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product]);

      if (error) {
        console.error('❌ Error al importar producto:', product.name, error.message);
        continue;
      }

      imported++;
      console.log(`✅ Importado ${imported}/${products.length}: ${product.name}`);
    } catch (err) {
      console.error('❌ Error inesperado:', err.message);
    }
  }

  console.log(`🎉 Importación completada! ${imported} productos importados exitosamente.`);
}

// Ejecutar la importación
importProducts().catch(console.error);
