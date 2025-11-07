// Script para analizar categorías del CSV de Tienda Nube
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');

const csvPath = 'C:\\Users\\mezac\\Downloads\\productostiendanube-4402339-17610784561605526131.csv';

async function analyzeCategories() {
  console.log('🔍 Analizando categorías del CSV...\n');
  
  const rows = [];
  const categoryMap = new Map();
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Total de filas procesadas: ${rows.length}\n`);

  // Extraer todas las categorías únicas
  rows.forEach(row => {
    const categoria = row['Categorías'];
    if (categoria && categoria.trim() !== '') {
      // Las categorías vienen en formato: "ADULTOS > ROPA" o "BEBES > ROPA > Bodys"
      const parts = categoria.split('>').map(p => p.trim()).filter(p => p);
      
      if (parts.length > 0) {
        // Contar productos por categoría
        const key = categoria;
        categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
      }
    }
  });

  console.log('📂 CATEGORÍAS ENCONTRADAS:\n');
  console.log('='.repeat(80));
  
  // Agrupar por nivel
  const level1 = new Set();
  const level2 = new Map();
  const level3 = new Map();
  
  categoryMap.forEach((count, fullPath) => {
    const parts = fullPath.split('>').map(p => p.trim()).filter(p => p);
    
    if (parts.length >= 1) {
      level1.add(parts[0]);
    }
    
    if (parts.length >= 2) {
      const key = `${parts[0]} > ${parts[1]}`;
      level2.set(key, (level2.get(key) || 0) + count);
    }
    
    if (parts.length >= 3) {
      const key = fullPath;
      level3.set(key, count);
    }
  });

  console.log('\n🎯 NIVEL 1 (Categorías Principales):');
  console.log('-'.repeat(80));
  Array.from(level1).sort().forEach(cat => {
    console.log(`  • ${cat}`);
  });

  console.log(`\n📁 Total: ${level1.size} categorías principales\n`);

  console.log('\n🎯 NIVEL 2 (Subcategorías):');
  console.log('-'.repeat(80));
  Array.from(level2.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([cat, count]) => {
      console.log(`  • ${cat} (${count} productos)`);
    });

  console.log(`\n📁 Total: ${level2.size} subcategorías\n`);

  if (level3.size > 0) {
    console.log('\n🎯 NIVEL 3 (Sub-subcategorías):');
    console.log('-'.repeat(80));
    Array.from(level3.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([cat, count]) => {
        console.log(`  • ${cat} (${count} productos)`);
      });
    console.log(`\n📁 Total: ${level3.size} sub-subcategorías\n`);
  }

  // Generar estructura SQL sugerida
  console.log('\n💡 ESTRUCTURA SQL SUGERIDA:\n');
  console.log('-- Categorías principales');
  Array.from(level1).sort().forEach((cat, index) => {
    console.log(`INSERT INTO categories (name, group_type, age_range, display_order, active)`);
    console.log(`VALUES ('${cat}', 'age', '${cat.toUpperCase()}', ${index + 1}, true);`);
  });

  console.log('\n✅ Análisis completado!');
}

analyzeCategories().catch(console.error);

