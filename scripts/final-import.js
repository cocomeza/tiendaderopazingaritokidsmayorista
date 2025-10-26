// Script final para importar productos desde CSV
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqbG1ycGhsdHBzaWJremZjZ3Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNTYyNywiZXhwIjoyMDc2ODAxNjI3fQ.ZKGtvuOgzRPjlq0PVXEXY-6drzLUieTw90ErVT1uEPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importProducts() {
  console.log('🚀 Iniciando importación completa de productos...');
  
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

  // Función para mapear categorías
  function mapCategory(tiendaNubeCategory) {
    if (!tiendaNubeCategory) return null;
    
    const lowerCategory = tiendaNubeCategory.toLowerCase();
    
    if (lowerCategory.includes('remera') || lowerCategory.includes('camiseta')) return 'remeras';
    if (lowerCategory.includes('pantalon') || lowerCategory.includes('short') || lowerCategory.includes('bermuda')) return 'pantalones';
    if (lowerCategory.includes('vestido') || lowerCategory.includes('falda')) return 'vestidos';
    if (lowerCategory.includes('conjunto')) return 'conjuntos';
    if (lowerCategory.includes('ropa interior') || lowerCategory.includes('media')) return 'ropa-interior';
    if (lowerCategory.includes('accesorio') || lowerCategory.includes('gorro') || lowerCategory.includes('bufanda')) return 'accesorios';
    if (lowerCategory.includes('calzado') || lowerCategory.includes('zapato') || lowerCategory.includes('zapatilla')) return 'calzado';
    if (lowerCategory.includes('bebé')) return 'bebes';
    
    return 'remeras'; // Por defecto
  }

  // Función para extraer colores
  function extractColors(rows) {
    const colors = new Set();
    rows.forEach(row => {
      if (row['Valor de propiedad 1'] && row['Nombre de propiedad 1'] === 'Color') {
        colors.add(row['Valor de propiedad 1']);
      }
    });
    return Array.from(colors);
  }

  // Función para extraer tallas
  function extractSizes(rows) {
    const sizes = new Set();
    rows.forEach(row => {
      if (row['Valor de propiedad 2'] && row['Nombre de propiedad 2'] === 'Talle') {
        sizes.add(row['Valor de propiedad 2']);
      }
    });
    return Array.from(sizes);
  }

  // Función para determinar género
  function determineGender(category, name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('niña') || lowerName.includes('femenino')) return 'niñas';
    if (lowerName.includes('niño') || lowerName.includes('masculino')) return 'niños';
    if (lowerName.includes('adulto')) return 'unisex';
    
    return 'unisex';
  }

  // Función para determinar rango de edad
  function determineAgeRange(category, name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('bebé')) return '0-2';
    if (lowerName.includes('niño') || lowerName.includes('niña')) return '3-12';
    if (lowerName.includes('adulto')) return '13+';
    
    return '3-12';
  }

  // Procesar cada grupo de productos
  let processed = 0;
  const totalProducts = Object.keys(productGroups).length;
  
  for (const [productName, productRows] of Object.entries(productGroups)) {
    const firstRow = productRows[0];
    
    // Extraer información del producto
    const categorySlug = mapCategory(firstRow['Categorías']);
    const colors = extractColors(productRows);
    const sizes = extractSizes(productRows);
    const gender = determineGender(categorySlug, productName);
    const ageRange = determineAgeRange(categorySlug, productName);
    
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
      category_id: null, // Se puede asociar después con categorías
      subcategory: firstRow['Categorías'] || '',
      sizes: sizes.length > 0 ? sizes : ['Único'],
      colors: colors.length > 0 ? colors : ['Varios'],
      gender: gender,
      age_range: ageRange,
      season: 'todo-el-año',
      material: 'Algodón',
      care_instructions: 'Lavar en agua fría',
      featured: false,
      active: totalStock > 0,
      images: [],
      tags: [],
      weight: parseFloat(firstRow['Peso (kg)']?.replace(',', '.') || '0.1'),
      dimensions: `${firstRow['Ancho (cm)'] || 0}x${firstRow['Alto (cm)'] || 0}x${firstRow['Profundidad (cm)'] || 0} cm`
    };

    products.push(product);
    processed++;
    
    if (processed % 50 === 0) {
      console.log(`✅ Procesados ${processed}/${totalProducts} productos...`);
    }
  }

  console.log(`📤 Insertando ${products.length} productos en Supabase...`);

  // Insertar productos en lotes
  const batchSize = 50;
  let imported = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        console.error('❌ Error al importar lote:', error.message);
        continue;
      }

      imported += batch.length;
      console.log(`✅ Importados ${imported}/${products.length} productos...`);
    } catch (err) {
      console.error('❌ Error inesperado:', err.message);
    }
  }

  console.log(`🎉 Importación completada! ${imported} productos importados exitosamente.`);
  
  // Verificar que se insertaron correctamente
  const { data: insertedProducts, error: checkError } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .limit(5);

  if (!checkError && insertedProducts) {
    console.log('📋 Primeros productos insertados:');
    insertedProducts.forEach(p => console.log(`- ${p.name}: $${p.price} (Stock: ${p.stock})`));
  }
}

// Ejecutar la importación
importProducts().catch(console.error);
