const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createFavoritesTable() {
  console.log('🔧 CREANDO TABLA DE FAVORITOS')
  console.log('================================')

  const sqlCommands = [
    // Crear tabla de favoritos
    `CREATE TABLE IF NOT EXISTS favorites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );`,
    
    // Crear índices para mejor rendimiento
    `CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);`,
    
    // Habilitar RLS (Row Level Security)
    `ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;`,
    
    // Eliminar políticas existentes si las hay
    `DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;`,
    `DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;`,
    `DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;`,
    
    // Crear políticas RLS
    `CREATE POLICY "Users can view their own favorites" ON favorites
      FOR SELECT USING (auth.uid() = user_id);`,
    
    `CREATE POLICY "Users can insert their own favorites" ON favorites
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    
    `CREATE POLICY "Users can delete their own favorites" ON favorites
      FOR DELETE USING (auth.uid() = user_id);`
  ]

  console.log(`📝 Ejecutando ${sqlCommands.length} comandos SQL...\n`)

  for (let i = 0; i < sqlCommands.length; i++) {
    console.log(`⏳ Ejecutando comando ${i + 1}/${sqlCommands.length}...`)
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: sqlCommands[i] })
      
      if (error) {
        console.log(`❌ Error en comando ${i + 1}:`, error.message)
      } else {
        console.log(`✅ Comando ${i + 1} ejecutado correctamente`)
      }
    } catch (err) {
      console.log(`❌ Error en comando ${i + 1}:`, err.message)
    }
  }

  // Verificar que la tabla se creó correctamente
  console.log('\n🔍 Verificando tabla de favoritos...')
  
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error verificando tabla:', error.message)
      return
    }

    console.log('✅ Tabla de favoritos creada correctamente')
    console.log('🎉 La funcionalidad de favoritos está lista para usar')
    
  } catch (error) {
    console.error('❌ Error verificando tabla:', error.message)
  }
}

createFavoritesTable()
