// Script completo para importar productos desde CSV de Tienda Nube
// Incluye normalización de tallas/colores y mapeo de todos los campos
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjlmrphltpsibkzfcgvu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tallas estándar para normalización
const STANDARD_SIZES = {
  '1': '1BB',
  '1 BB': '1BB',
  '1b': '1BB',
  '1B': '1BB',
  '2': '2BB',
  '2 BB': '2BB',
  '2b': '2BB',
  '2B': '2BB',
  '3': '3BB',
  '3 BB': '3BB',
  '3b': '3BB',
  '3B': '3BB',
  '4': '4',
  '4 BB': '4BB',
  '4b': '4BB',
  '4B': '4BB',
  '5': '5',
  '5 BB': '5BB',
  '5b': '5BB',
  '5B': '5BB'
};

// Función para normalizar tallas
function normalizeSize(size) {
  if (!size) return null;
  const trimmed = size.trim();
  return STANDARD_SIZES[trimmed] || trimmed.toUpperCase();
}

// Función para normalizar colores
function normalizeColor(color) {
  if (!color) return null;
  const trimmed = color.trim();
  // Capitalizar primera letra
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// Función para parsear categorías jerárquicas
function parseCategory(categoryString) {
  if (!categoryString) return null;
  
  const parts = categoryString.split('>').map(p => p.trim()).filter(p => p);
  return {
    level1: parts[0] || null,
    level2: parts[1] || null,
    level3: parts[2] || null,
    full: categoryString
  };
}

// Función para obtener o crear categoría
async function getOrCreateCategory(categoryName, parentId = null) {
  if (!categoryName) return null;

  // Buscar categoría existente
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .eq('parent_id', parentId || null)
    .single();

  if (existing) {
    return existing.id;
  }

  // Crear nueva categoría
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      parent_id: parentId,
      active: true
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creando categoría ${categoryName}:`, error.message);
    return null;
  }

  return newCategory.id;
}

async function importProducts() {
  console.log('🚀 Iniciando importación completa de productos...\n');
  
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

  console.log(`📊 Procesando ${rows.length} filas del CSV...\n`);

  // Agrupar productos por "Identificador de URL"
  const productGroups = {};
  rows.forEach(row => {
    const urlId = row['Identificador de URL'];
    const name = row['Nombre'];
    
    if (!urlId && !name) return;
    
    const key = urlId || name;
    if (!productGroups[key]) {
      productGroups[key] = [];
    }
    productGroups[key].push(row);
  });

  console.log(`📦 Encontrados ${Object.keys(productGroups).length} productos únicos...\n`);

  // Procesar cada grupo de productos
  let processed = 0;
  const totalProducts = Object.keys(productGroups).length;
  
  for (const [productKey, productRows] of Object.entries(productGroups)) {
    const firstRow = productRows[0];
    
    // Parsear categoría
    const categoryInfo = parseCategory(firstRow['Categorías']);
    
    // Obtener o crear categorías
    let categoryId = null;
    if (categoryInfo) {
      if (categoryInfo.level1) {
        const level1Id = await getOrCreateCategory(categoryInfo.level1);
        if (level1Id && categoryInfo.level2) {
          const level2Id = await getOrCreateCategory(categoryInfo.level2, level1Id);
          if (level2Id && categoryInfo.level3) {
            categoryId = await getOrCreateCategory(categoryInfo.level3, level2Id);
          } else {
            categoryId = level2Id;
          }
        } else {
          categoryId = level1Id;
        }
      }
    }

    // Extraer y normalizar colores
    const colorsSet = new Set();
    productRows.forEach(row => {
      if (row['Valor de propiedad 1'] && row['Nombre de propiedad 1'] === 'Color') {
        const normalized = normalizeColor(row['Valor de propiedad 1']);
        if (normalized) colorsSet.add(normalized);
      }
    });
    const colors = Array.from(colorsSet);

    // Extraer y normalizar tallas
    const sizesSet = new Set();
    productRows.forEach(row => {
      if (row['Valor de propiedad 2'] && row['Nombre de propiedad 2'] === 'Talle') {
        const normalized = normalizeSize(row['Valor de propiedad 2']);
        if (normalized) sizesSet.add(normalized);
      }
    });
    const sizes = Array.from(sizesSet);

    // Calcular stock total
    const totalStock = productRows.reduce((sum, row) => {
      const stock = parseInt(row['Stock']) || 0;
      return sum + stock;
    }, 0);

    // Precios
    const price = parseFloat(firstRow['Precio']?.replace(',', '.') || '0');
    const wholesalePrice = parseFloat(firstRow['Precio promocional']?.replace(',', '.') || price * 0.8);
    const costPrice = parseFloat(firstRow['Costo']?.replace(',', '.') || null);

    // Dimensiones y peso
    const weightKg = parseFloat(firstRow['Peso (kg)']?.replace(',', '.') || null);
    const heightCm = parseFloat(firstRow['Alto (cm)']?.replace(',', '.') || null);
    const widthCm = parseFloat(firstRow['Ancho (cm)']?.replace(',', '.') || null);
    const depthCm = parseFloat(firstRow['Profundidad (cm)']?.replace(',', '.') || null);

    // Tags
    const tags = firstRow['Tags'] 
      ? firstRow['Tags'].split(',').map(t => t.trim()).filter(t => t)
      : [];

    // Determinar género y rango de edad
    const gender = firstRow['Sexo'] 
      ? normalizeColor(firstRow['Sexo']).toLowerCase()
      : null;
    const ageRange = firstRow['Rango de edad'] || null;

    // Producto activo
    const active = firstRow['Mostrar en tienda'] === 'SI';

    // Envío sin cargo
    const freeShipping = firstRow['Envío sin cargo'] === 'SI';

    const product = {
      name: firstRow['Nombre'],
      description: firstRow['Descripción'] || null,
      sku: firstRow['SKU'] || null,
      price: price,
      wholesale_price: wholesalePrice,
      cost_price: costPrice,
      stock: totalStock,
      low_stock_threshold: 5,
      category_id: categoryId,
      sizes: sizes.length > 0 ? sizes : [],
      colors: colors.length > 0 ? colors : [],
      images: [],
      active: active,
      // Campos nuevos
      weight_kg: weightKg,
      height_cm: heightCm,
      width_cm: widthCm,
      depth_cm: depthCm,
      barcode: firstRow['Código de barras'] || null,
      mpn: firstRow['MPN (Número de pieza del fabricante)'] || null,
      brand: firstRow['Marca'] || null,
      tags: tags,
      seo_title: firstRow['Título para SEO'] || null,
      seo_description: firstRow['Descripción para SEO'] || null,
      gender: gender,
      age_range: ageRange,
      free_shipping: freeShipping,
      property_3_name: firstRow['Nombre de propiedad 3'] || null,
      property_3_value: firstRow['Valor de propiedad 3'] || null,
      url_identifier: firstRow['Identificador de URL'] || null
    };

    products.push(product);
    processed++;
    
    if (processed % 50 === 0) {
      console.log(`✅ Procesados ${processed}/${totalProducts} productos...`);
    }
  }

  console.log(`\n📤 Insertando ${products.length} productos en Supabase...\n`);

  // Insertar productos en lotes
  const batchSize = 50;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('products')
        .insert(batch);

      if (error) {
        console.error(`❌ Error al importar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
        errors++;
        continue;
      }

      imported += batch.length;
      console.log(`✅ Importados ${imported}/${products.length} productos...`);
    } catch (err) {
      console.error(`❌ Error inesperado en lote ${Math.floor(i / batchSize) + 1}:`, err.message);
      errors++;
    }
  }

  console.log(`\n🎉 Importación completada!`);
  console.log(`✅ ${imported} productos importados exitosamente`);
  if (errors > 0) {
    console.log(`⚠️ ${errors} lotes con errores`);
  }
}

// Ejecutar la importación
importProducts().catch(console.error);

