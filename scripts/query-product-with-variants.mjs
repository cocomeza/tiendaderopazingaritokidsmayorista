import { createClient } from '@supabase/supabase-js'

const PRODUCT_NAME = process.argv.slice(2).join(' ') || 'Remera Jordan - Bebe'

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, product_variants(id, size, color, stock, active)')
    .ilike('name', PRODUCT_NAME)
    .single()

  if (error) {
    console.error('error', error)
    process.exit(1)
  }

  console.dir(data, { depth: null })
}

main().catch((err) => {
  console.error('Error general', err)
  process.exit(1)
})
