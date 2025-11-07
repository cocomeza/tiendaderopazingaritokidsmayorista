import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'zingaritokids@gmail.com'
const ADMIN_PASSWORD = 'AdminZingarito2025!'

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Debes definir SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY antes de ejecutar el script.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔐 Creando/actualizando usuario admin...')

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  if (listError) {
    console.error('❌ Error buscando usuario:', listError.message)
    process.exit(1)
  }

  const userMatch = existingUsers?.users?.find((user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())

  let userId = userMatch?.id

  if (userId) {
    console.log('ℹ️ Usuario ya existe, actualizando contraseña y marcándolo confirmado...')

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      email_confirm: true
    })

    if (updateError) {
      console.error('❌ Error actualizando el usuario:', updateError.message)
      process.exit(1)
    }
  } else {
    console.log('🆕 Creando usuario admin...')

    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true
    })

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message)
      process.exit(1)
    }

    userId = createData.user?.id
  }

  if (!userId) {
    console.error('❌ No se obtuvo el ID del usuario admin')
    process.exit(1)
  }

  console.log('📇 Creando/actualizando perfil de admin...')

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Admin Zingarito',
      is_admin: true,
      is_active: true
    })

  if (profileError) {
    console.error('❌ Error creando perfil:', profileError.message)
    process.exit(1)
  }

  console.log('✅ Usuario admin listo. Email:', ADMIN_EMAIL)
}

main().catch((err) => {
  console.error('❌ Error inesperado:', err)
  process.exit(1)
})

