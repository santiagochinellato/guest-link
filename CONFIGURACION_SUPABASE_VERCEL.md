# Configuración Supabase (nuevo proyecto) + Vercel

Proyecto Supabase: **sfdbjaykqqdwaiezsxxr**

## 1. Obtener datos del nuevo proyecto en Supabase

En [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto **sfdbjaykqqdwaiezsxxr**:

### API (Project Settings → API)
- **Project URL**: `https://sfdbjaykqqdwaiezsxxr.supabase.co` (ya lo tienes)
- **anon public**: clave pública para el cliente (cópiala)
- **service_role**: clave secreta para el servidor (cópiala; no la expongas en el front)

### Database (Project Settings → Database)
- **Connection string** → **URI**: usa la que tenga "Session pooler" o "Transaction pooler" (puerto 6543).  
  Formato típico:  
  `postgres://postgres.sfdbjaykqqdwaiezsxxr:[TU_PASSWORD]@aws-0-XX.pooler.supabase.com:6543/postgres?sslmode=require`  
  Sustituye `[TU_PASSWORD]` por la contraseña de la base (la que tienes: `JSpv19ueLqQePlmd`).  
  Si tu región es otra, el host puede ser `aws-0-eu-west-1.pooler.supabase.com` o similar; copia la URI tal cual desde el panel.

---

## 2. Configurar `.env.local` (desarrollo)

En la raíz del repo, en `.env.local`:

- **Base local** (seguir usando Docker para desarrollo):
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/guestlink`

- **Nuevo Supabase** (producción / subida de datos):
  - `POSTGRES_URL` = Connection string URI del paso 1 (Database)
  - `POSTGRES_URL_NON_POOLING` = la misma URI o la de "Direct connection" si la usas
  - `NEXT_PUBLIC_SUPABASE_URL=https://sfdbjaykqqdwaiezsxxr.supabase.co`
  - `SUPABASE_URL=https://sfdbjaykqqdwaiezsxxr.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY` = valor de **service_role** del paso 1 (API)

Opcional (si alguna parte del código usa la clave anon):
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = valor de **anon public** del paso 1 (API)

Con esto, en local la app sigue usando `DATABASE_URL` (Docker) y los scripts pueden usar `POSTGRES_URL` para el nuevo Supabase.

---

## 3. Crear esquema y subir datos locales al nuevo Supabase

En la raíz del proyecto, con Docker levantado y datos en la base local:

```bash
# 1. Crear tablas en el nuevo Supabase (usa POSTGRES_URL de .env.local)
npm run db:push

# 2. Copiar datos desde local al nuevo Supabase
npm run db:sync-to-supabase
```

El script `db:sync-to-supabase` lee de `DATABASE_URL` (local) y escribe en `POSTGRES_URL` (nuevo Supabase).

---

## 4. Variables en Vercel

En Vercel → tu proyecto → **Settings** → **Environment Variables**, define (para Production, Preview y Development si quieres):

| Variable | Valor |
|----------|--------|
| `POSTGRES_URL` | La misma Connection string URI del nuevo Supabase (Database) |
| `POSTGRES_URL_NON_POOLING` | La misma URI o la conexión directa |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sfdbjaykqqdwaiezsxxr.supabase.co` |
| `SUPABASE_URL` | `https://sfdbjaykqqdwaiezsxxr.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** del nuevo proyecto (API) |
| `AUTH_SECRET` | El que ya usas (p. ej. el de 32 bytes en base64) |

Opcional:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = **anon public** del nuevo proyecto (API)

Luego **Redeploy** el proyecto en Vercel para que use las nuevas variables.

---

## 5. Comprobar

- **Local**: `npm run dev` → la app sigue usando la base local (`DATABASE_URL`).
- **Vercel**: tras el redeploy, el dashboard y las pantallas que lean de la base deberían mostrar los mismos datos que subiste con `db:sync-to-supabase`.

Si algo falla por conexión a la base, revisa que la URI en `POSTGRES_URL` sea exactamente la del panel de Supabase (Database) y que la región/host coincidan.
