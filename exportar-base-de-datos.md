# 📤 Exportar Base de Datos para Migración

## 🎯 Exportar DESDE Supabase Actual

### Opción 1: Exportar vía Dashboard (Recomendado)

1. Ve a tu proyecto actual en Supabase: https://supabase.com/dashboard
2. Selecciona el proyecto actual
3. Ve a **Database** → **Backups**
4. Click en **"New backup"** → **"Custom"**
5. Selecciona todas las tablas
6. Click en **"Download backup"**
7. Descargarás un archivo `.sql` con toda la base de datos

### Opción 2: Exportar Manualmente

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este script para ver todas las tablas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

3. Para cada tabla, ejecuta:

```sql
-- Exportar estructura
\d+ nombre_tabla;

-- Exportar datos
SELECT * FROM nombre_tabla;
```

---

## 🎯 Importar A Nueva Cuenta de Supabase

### Paso 1: Crear Proyecto Nuevo

1. Ve a https://supabase.com/dashboard
2. Click en **"New project"**
3. Configura:
   - Database Password: (guarda esta contraseña)
   - Region: (selecciona la que prefieras)
   - Name: zingarito-kids-nuevo

### Paso 2: Ejecutar Migraciones Base

1. Ve a **SQL Editor** en el proyecto NUEVO
2. Ejecuta primero el contenido de: `supabase/migrations/001_initial_schema.sql`
3. Esto creará la estructura base de tablas

### Paso 3: Importar Datos

1. Ve a **SQL Editor**
2. Pega el contenido del backup descargado
3. Ejecuta

---

## 📋 Checklist de Migración

### ANTES de Importar

- [ ] Backup descargado del proyecto antiguo
- [ ] Nuevo proyecto creado en Supabase
- [ ] Acceso a ambos proyectos (viejo y nuevo)

### DESPUÉS de Importar

- [ ] Verificar que todas las tablas existen
- [ ] Contar registros en cada tabla (debe coincidir)
- [ ] Ejecutar queries de prueba
- [ ] Actualizar variables de entorno en Vercel

---

## 🔧 Actualizar Variables de Entorno en Vercel

Después de migrar, actualiza en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita:
   - `NEXT_PUBLIC_SUPABASE_URL` → nueva URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → nueva clave anon
4. Save
5. Redeploy

---

## ⚠️ Importante

- Haz backup ANTES de cualquier cambio
- Verifica que los datos sean correctos antes de eliminar el proyecto viejo
- Espera 24-48 horas después de verificar para eliminar el proyecto antiguo

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el backup sea válido
2. Ejecuta las queries de verificación
3. Revisa los logs de importación

