import { createClient } from '@supabase/supabase-js'

const PRODUCT_NAME = process.argv[2] || 'Remera Jordan - Bebe'

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
    .select('id, name')
    .ilike('name', PRODUCT_NAME)
    .single()

  if (productError) {
    console.error('productError', productError)
    process.exit(1)
  }

  console.log(`Producto encontrado: ${product.name} (${product.id})`)

  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, size, color, stock, active')
    .eq('product_id', product.id)
    .order('size', { ascending: true })

  if (variantsError) {
    console.error('variantsError', variantsError)
    process.exit(1)
  }

  console.log(`Total variantes: ${variants.length}`)

  const summary = variants.reduce((acc, variant) => {
    const size = variant.size?.trim() || '—'
    const color = variant.color?.trim() || '—'
    const key = `${size} :: ${color}`
    acc[key] = (acc[key] || 0) + (variant.stock ?? 0)
    return acc
  }, {})

  console.log('Stock por talle y color:')
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })
}

main().catch((err) => {
  console.error('Error general', err)
  process.exit(1)
})
