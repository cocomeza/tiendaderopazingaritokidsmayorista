// Script para verificar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO');
console.log('====================================');

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltante');

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL completa:', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Key (primeros 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');
}
