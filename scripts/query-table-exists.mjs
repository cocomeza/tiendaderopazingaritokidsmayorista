import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_schema, table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'product_variants')

  if (error) {
    console.error('error', error)
    process.exit(1)
  }

  console.log(data)
}

main().catch((err) => {
  console.error('Error general', err)
  process.exit(1)
})
