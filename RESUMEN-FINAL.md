# ✅ Proyecto Simplificado y Organizado

## 🎉 Cambios Realizados

### ✅ Archivos Eliminados
- 42 archivos .md duplicados eliminados
- Documentación consolidada en `docs/`
- Archivos SQL temporales movidos a `scripts-sql/`

### ✅ Nueva Estructura
```
tiendaderopazingaritokids/
├── README.md              # 📖 Empieza aquí
├── docs/                  # 📚 Toda la documentación
│   ├── instalacion.md
│   ├── database.md
│   ├── tests.md
│   ├── deploy.md
│   └── features.md
├── supabase/migrations/   # 🗄️ Migraciones oficiales
├── scripts-sql/          # Scripts temporales
├── app/                  # Código de la app
├── components/           # Componentes React
└── lib/                  # Utilidades
```

---

## 🗄️ Exportar Base de Datos para Migrar

### Método 1: Exportar desde Supabase (Recomendado)

1. Ve a tu proyecto actual: https://supabase.com/dashboard
2. Selecciona el proyecto antiguo
3. Ve a **Database** → **Backups**
4. Click **"New backup"**
5. Tipo: **Custom backup**
6. Selecciona todas las tablas
7. Click **"Download backup"**
8. Descargarás un archivo `.sql` con TODA tu base de datos

### Método 2: Exportar Solo Estructura

Si solo quieres la estructura sin datos:

```sql
-- En Supabase SQL Editor, ejecuta:
pg_dump --host=db.hjlmrphltpsibkzfcgvu.supabase.co \
  --port=5432 \
  --username=postgres \
  --format=custom \
  --schema-only \
  --file=schema.dump
```

---

## 🚀 Importar a Nueva Cuenta de Supabase

### Paso 1: Crear Proyecto Nuevo

1. Ve a https://supabase.com/dashboard
2. Click **"New project"**
3. Configura:
   - Name: `zingarito-kids-nuevo`
   - Database Password: (guarda esta contraseña)
   - Region: (tu región preferida)

### Paso 2: Configurar Estructura

1. Ve a **SQL Editor** en el proyecto NUEVO
2. Ejecuta las migraciones de `supabase/migrations/` en orden:
   ```
   001_initial_schema.sql
   007_ensure_profile_insert_policy.sql
   008_fix_profile_policies.sql
   009_add_performance_indexes.sql
   ```

### Paso 3: Importar Datos

1. Ve a **SQL Editor**
2. Abre el archivo `.sql` que descargaste en Método 1
3. Copia y pega el contenido
4. Click **"Run"**

### Paso 4: Verificar

Ejecuta en SQL Editor:

```sql
-- Verificar que todas las tablas existen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros
SELECT 
  'profiles' as tabla, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites;
```

---

## 🔄 Actualizar Variables en Vercel

Después de migrar, actualiza en Vercel:

1. Ve a https://vercel.com
2. Tu proyecto → Settings → Environment Variables
3. Edita:
   - `NEXT_PUBLIC_SUPABASE_URL` → nueva URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → nueva clave anon
4. Save
5. Ve a Deployments → Redeploy

---

## 📝 Archivos Importantes

### Documentación
- `README.md` - Documentación principal
- `docs/instalacion.md` - Guía de instalación
- `docs/database.md` - Configuración de Supabase
- `docs/deploy.md` - Deploy en Vercel
- `docs/tests.md` - Tests
- `docs/features.md` - Características

### Base de Datos
- `supabase/migrations/` - Migraciones oficiales
- `scripts-sql/` - Scripts temporales (pueden ignorarse)
- `exportar-base-de-datos.md` - Instrucciones de migración

---

## ✅ Estado del Proyecto

- ✅ Proyecto simplificado (42 archivos eliminados)
- ✅ Documentación organizada en `docs/`
- ✅ README principal actualizado
- ✅ Estructura clara y profesional
- ✅ Listo para usar

---

**¡Proyecto limpio y organizado!** 🎉

