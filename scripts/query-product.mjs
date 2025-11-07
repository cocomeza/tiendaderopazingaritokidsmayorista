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

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, sizes, colors, stock')
    .ilike('name', PRODUCT_NAME)
    .single()

  if (productError) {
    console.error('productError', productError)
    process.exit(1)
  }

  console.log('Producto:', product)
}

main().catch((err) => {
  console.error('Error general', err)
  process.exit(1)
})
