# Informe del Proyecto Guest Link (Hostly)

## Idea del proyecto

**Guest Link** (también llamado Hostly en los assets) es una aplicación web para **anfitriones de alojamientos vacacionales** (Airbnb, Booking, etc.) que permite crear y gestionar **guías digitales** para sus huéspedes. 

El flujo principal es:

1. **Propietarios/admin**: Crean propiedades, añaden WiFi, reglas de casa, recomendaciones de restaurantes/atracciones, transporte público, contactos de emergencia, etc.
2. **Huéspedes**: Acceden a una página pública por slug (ej. `/es/stay/mi-casa-bariloche`) y ven toda la información útil durante su estancia.

Incluye también:
- **Sincronización de reservas** desde extensiones de navegador (Booking/Airbnb) mediante una API key por propiedad
- **Generación de QR** para compartir la guía fácilmente
- **Impresión de flyers** para la propiedad

---

## Stack técnico

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** + PostCSS
- **Radix UI** (accordion, dialog, popover, switch, tabs)
- **Shadcn/ui** (componentes configurables vía `components.json`)
- **Framer Motion** (animaciones)
- **Lucide React** (iconos)
- **React Hook Form** + **Zod** (formularios y validación)
- **next-intl** (internacionalización: es, en, pt)
- **next-themes** (modo oscuro)
- **Maplibre GL** / **react-map-gl** / **@vis.gl/react-google-maps** (mapas)
- **Google Places API** (autocompletado de direcciones, lugares)
- **QR Code** (qrcode.react, next-qrcode)
- **html2canvas** + **jsPDF** (exportar flyers a PDF)
- **Lenis** (scroll suave)
- **Vaul** (drawers)

### Backend / API
- **Next.js Route Handlers** (API Routes)
- **NextAuth 5** (autenticación con Drizzle adapter)
- **Server Actions** (server-side mutations)

### Base de datos
- **PostgreSQL** (Postgres 15 Alpine vía Docker)
- **Drizzle ORM** + **drizzle-kit** (migraciones)
- **pg** / **postgres** (drivers)

### Servicios externos
- **Google Maps / Places API**
- **Google Transit API** (para transporte público, ej. Bariloche)
- **Foursquare** (descubrimiento de lugares, scripts)
- **Supabase** (parcialmente integrado; aparece en dependencias y `supabase.ts`)
- **Overpass** (OpenStreetMap, para datos geo en `overpass.ts`)

### DevOps / entorno
- **Docker Compose** (PostgreSQL en puerto 5434)
- **ESLint** (config Next.js)
- **Babel React Compiler** (plugin para optimización)

---

## Estructura del proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── [lang]/             # Rutas con idioma (es, en, pt)
│   │   ├── (admin)/        # Área privada: dashboard
│   │   │   └── dashboard/
│   │   │       ├── properties/    # CRUD propiedades
│   │   │       ├── qr-builder/    # Generador QR
│   │   │       ├── reservations/  # Reservas
│   │   │       └── settings/
│   │   ├── (guest)/        # Layout huéspedes
│   │   ├── flyer/          # Flyer imprimible
│   │   ├── stay/[slug]/    # Vista huésped por propiedad
│   │   ├── login/
│   │   └── register/
│   └── api/                # API Routes
│       ├── auth/[...nextauth]/
│       ├── reservations/sync/     # Sincronización reservas
│       ├── reservations/verify/   # Verificar API key (GET)
│       └── ...
├── components/             # Componentes React
│   ├── admin/              # Panel admin
│   ├── guest/              # Vista huésped
│   └── ui/                 # Componentes base
├── db/
│   ├── schema.ts           # Esquema Drizzle
│   ├── index.ts
│   └── seed-demo.ts
├── lib/
│   ├── actions/            # Server Actions
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── reservations.ts
│   │   └── sync.ts
│   ├── services/           # Integraciones externas
│   │   ├── google-places.ts
│   │   ├── google-transit.ts
│   │   ├── foursquare.ts
│   │   └── places-service.ts
│   └── i18n/
├── i18n/locales/           # Traducciones (es, en, pt)
├── hooks/
└── types/
```

---

## Modelo de datos (Drizzle)

- **users** – Usuarios (NextAuth + roles)
- **accounts**, **sessions**, **verificationTokens** – Auth
- **properties** – Propiedades (nombre, slug, dirección, WiFi, horarios, `syncApiKey`, etc.)
- **categories** – Categorías de recomendaciones (restaurantes, outdoor, kids, etc.)
- **recommendations** – Recomendaciones (restaurantes, lugares) con datos de Google/OSM
- **reservations** – Reservas (Booking/Airbnb) sincronizadas desde extensión
- **syncLogs** – Logs de sincronización
- **emergencyContacts** – Contactos de emergencia por propiedad
- **transportInfo** – Taxi, bus, alquiler, etc.
- **busLines**, **busStops**, **busRouteStops** – Transporte público (líneas, paradas, rutas) – usado en Bariloche

---

## Flujos principales

1. **Admin**: Login → Dashboard → Crear/editar propiedad → Añadir categorías y recomendaciones → Generar QR → Configurar sync de reservas
2. **Huésped**: Recibe link (o escanea QR) → `/es/stay/{slug}` → Ve WiFi, reglas, recomendaciones, mapa, transporte, emergencias
3. **Sync reservas**: Extensión de navegador usa `syncApiKey` → API `/api/reservations/sync` guarda reservas
4. **Verificación de key**: `GET /api/reservations/verify?key=XXX` valida la API key

---

## Internacionalización

- Idiomas: español (es), inglés (en), portugués (pt)
- Archivos en `src/i18n/locales/`
- `next-intl` para rutas y traducciones

---

## Notas para desarrollo

- Base de datos: `docker-compose up` → Postgres en `localhost:5434`, DB `guestlink`
- Migraciones: `npm run db:migrate` o `drizzle-kit push`
- Seed: `npm run db:seed`
- Puerto dev: `npm run dev` → 3000
- Variables de entorno típicas: `DATABASE_URL`, credenciales de Google (Places, Maps), NextAuth

---

## Cambios recientes (según git status)

- Dashboard con `SyncStatusCard`
- API `/api/reservations/verify`
- Acciones de sync en `lib/actions/sync.ts`
- Script `get-sync-key.ts`
- Modificaciones en schema, propiedades y página de dashboard

---

## Resumen ejecutivo para Claude

Guest Link es una web app Next.js 16 + React 19 + TypeScript para anfitriones de alojamientos vacacionales. Permite crear guías digitales para huéspedes (WiFi, reglas, recomendaciones, transporte, emergencias) y sincronizar reservas desde Booking/Airbnb mediante una extensión. Stack: Next.js App Router, Drizzle + PostgreSQL, NextAuth, Radix/Shadcn, Google Maps/Places, i18n (es/en/pt).
