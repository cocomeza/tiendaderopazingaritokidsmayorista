// Script para importar productos desde CSV de Tienda Nube
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para mapear categorías de Tienda Nube a nuestras categorías
function mapCategory(tiendaNubeCategory) {
  const categoryMap = {
    'ADULTOS': 'Adultos',
    'NIÑOS': 'Niños',
    'ROPA': 'Ropa',
    'Pantalones-bermudas': 'Pantalones',
    'Remeras': 'Remeras',
    'Vestidos': 'Vestidos',
    'Conjuntos': 'Conjuntos',
    'Accesorios': 'Accesorios',
    'Calzado': 'Calzado',
    'Bebés': 'Bebés'
  };

  if (!tiendaNubeCategory) return 'Otros';
  
  // Buscar coincidencias parciales
  for (const [key, value] of Object.entries(categoryMap)) {
    if (tiendaNubeCategory.includes(key)) {
      return value;
    }
  }
  
  return 'Otros';
}

// Función para extraer colores únicos
function extractColors(rows) {
  const colors = new Set();
  rows.forEach(row => {
    if (row['Valor de propiedad 1'] && row['Nombre de propiedad 1'] === 'Color') {
      colors.add(row['Valor de propiedad 1']);
    }
  });
  return Array.from(colors);
}

// Función para extraer tallas únicas
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
  const lowerCategory = category.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (lowerCategory.includes('adultos') || lowerName.includes('adulto')) {
    return 'adultos';
  } else if (lowerName.includes('niña') || lowerName.includes('femenino')) {
    return 'niñas';
  } else if (lowerName.includes('niño') || lowerName.includes('masculino')) {
    return 'niños';
  }
  
  return 'unisex';
}

// Función para determinar rango de edad
function determineAgeRange(category, name) {
  const lowerCategory = category.toLowerCase();
  const lowerName = name.toLowerCase();
  
  if (lowerCategory.includes('bebé') || lowerName.includes('bebé')) {
    return '0-2';
  } else if (lowerName.includes('niño') || lowerName.includes('niña')) {
    return '3-12';
  } else if (lowerName.includes('adulto')) {
    return '13+';
  }
  
  return null;
}

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

  // Procesar cada grupo de productos
  for (const [productName, productRows] of Object.entries(productGroups)) {
    const firstRow = productRows[0];
    
    // Extraer información del producto
    const category = mapCategory(firstRow['Categorías']);
    const colors = extractColors(productRows);
    const sizes = extractSizes(productRows);
    const gender = determineGender(category, productName);
    const ageRange = determineAgeRange(category, productName);
    
    // Calcular stock total
    const totalStock = productRows.reduce((sum, row) => {
      const stock = parseInt(row['Stock']) || 0;
      return sum + stock;
    }, 0);

    // Precio (usar el precio de la primera fila)
    const price = parseFloat(firstRow['Precio']?.replace(',', '.') || '0');
    const wholesalePrice = price * 0.8; // 20% de descuento mayorista

    const product = {
      name: productName,
      description: firstRow['Descripción'] || '',
      sku: firstRow['SKU'] || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      price: price,
      wholesale_price: wholesalePrice,
      stock: totalStock,
      low_stock_threshold: 5,
      category: category,
      subcategory: firstRow['Categorías'] || '',
      sizes: sizes,
      colors: colors,
      gender: gender,
      age_range: ageRange,
      featured: false,
      active: totalStock > 0, // Solo activar si hay stock
      images: [], // Por ahora sin imágenes
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    products.push(product);
  }

  console.log(`✅ Procesados ${products.length} productos para importar...`);

  // Insertar productos en lotes
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    console.log(`📤 Importando lote ${Math.floor(i / batchSize) + 1}...`);
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch);

    if (error) {
      console.error('❌ Error al importar lote:', error);
      continue;
    }

    imported += batch.length;
    console.log(`✅ Importados ${imported}/${products.length} productos...`);
  }

  console.log(`🎉 Importación completada! ${imported} productos importados exitosamente.`);
}

// Ejecutar la importación
importProducts().catch(console.error);
