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

  try {
    // Verificar si la tabla ya existe
    console.log('🔍 Verificando si la tabla ya existe...')
    const { data: existingTable, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1)

    if (!checkError) {
      console.log('✅ La tabla de favoritos ya existe')
      return
    }

    console.log('📝 La tabla no existe, creándola...')
    
    // Crear la tabla usando una migración SQL directa
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
      
      ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
      DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
      DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
      
      CREATE POLICY "Users can view their own favorites" ON favorites
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own favorites" ON favorites
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own favorites" ON favorites
        FOR DELETE USING (auth.uid() = user_id);
    `

    // Usar el método de migración directa
    const { error: migrationError } = await supabase
      .from('_migrations')
      .insert({
        version: 'create_favorites_table',
        statements: createTableSQL,
        name: 'Create favorites table'
      })

    if (migrationError) {
      console.log('⚠️ Error con migración, intentando método alternativo...')
      
      // Método alternativo: crear tabla directamente
      const { error: directError } = await supabase
        .from('favorites')
        .select('*')
        .limit(0)

      if (directError && directError.message.includes('relation "favorites" does not exist')) {
        console.log('❌ La tabla de favoritos no existe y no se pudo crear automáticamente')
        console.log('📋 Por favor, ejecuta manualmente este SQL en tu panel de Supabase:')
        console.log('\n' + createTableSQL + '\n')
        return
      }
    }

    // Verificar que la tabla se creó correctamente
    console.log('\n🔍 Verificando tabla de favoritos...')
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Error verificando tabla:', error.message)
      console.log('📋 Por favor, ejecuta manualmente este SQL en tu panel de Supabase:')
      console.log('\n' + createTableSQL + '\n')
      return
    }

    console.log('✅ Tabla de favoritos creada correctamente')
    console.log('🎉 La funcionalidad de favoritos está lista para usar')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.log('📋 Por favor, ejecuta manualmente este SQL en tu panel de Supabase:')
    console.log(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
      
      ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own favorites" ON favorites
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own favorites" ON favorites
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own favorites" ON favorites
        FOR DELETE USING (auth.uid() = user_id);
    `)
  }
}

createFavoritesTable()

