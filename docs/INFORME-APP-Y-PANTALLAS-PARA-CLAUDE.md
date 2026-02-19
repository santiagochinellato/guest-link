# Informe: App Hostly (guest-link) y pantallas del panel

Este documento describe la aplicación, su propósito y el diseño/funcionamiento de las tres pantallas principales del panel de administración (**Panel de control**, **My Hostly**, **Reservas**) para que un revisor (p. ej. Claude) pueda entender el contexto sin tener que leer todo el código. Al final se indica qué archivos conviene adjuntar al compartir el proyecto.

---

## 1. Resumen de la app

| Campo | Descripción |
|-------|-------------|
| **Nombre del proyecto** | guest-link (producto: **Hostly** — "The city, simplified") |
| **Propósito** | Panel de administración para anfitriones que gestionan propiedades de alquiler: **guías digitales para huéspedes** (WiFi, reglas, recomendaciones, emergencias, transporte, acceso), **reservas** y **métricas de uso** de la guía. |
| **Stack** | Next.js (App Router), React, TypeScript, Drizzle (PostgreSQL), PostHog (analíticas en la app huésped), Tailwind CSS, Framer Motion, Radix UI. |
| **Rutas base** | `/[lang]/dashboard` (admin); `/[lang]/stay/[slug]` (vista huésped de la guía). |
| **Usuarios** | Anfitriones/propietarios que configuran una o varias propiedades y comparten un link de guía con sus huéspedes. |

La app huésped (fuera del panel) muestra la guía por propiedad: WiFi, mapa/ubicación, reglas, transporte, emergencias, recomendaciones, etc. Esa interacción se trackea con PostHog para mostrar en el panel estadísticas de uso (secciones más consultadas, horario pico, recomendaciones más clicadas).

---

## 2. Estructura del dashboard (panel admin)

- **Layout**: `src/app/[lang]/(admin)/layout.tsx`  
  Contenedor flex: sidebar (solo desktop) + área de contenido. En móvil hay barra superior y menú en sheet.

- **Sidebar (desktop)**: `src/components/admin/sidebar.tsx`  
  Colapsable (Framer Motion), logo Hostly, ítems de navegación:
  - **Panel de control** → `/dashboard` (redirige a propiedades)
  - **My Hostly** → `/dashboard/my-hostly`
  - **Reservas** → `/dashboard/reservations`  
  Footer: usuario (avatar, nombre, email) y menú con “Cerrar sesión”.

- **Sidebar móvil**: `src/components/admin/mobile-sidebar.tsx`  
  Mismos ítems, usado dentro del Sheet del header móvil.

- **Área de contenido**: envuelta en `src/components/admin/admin-scroll-area.tsx` (Lenis para scroll suave). Las páginas del dashboard renderizan dentro de esta área.

---

## 3. Panel de control (pantalla principal)

- **Ruta**: `/[lang]/dashboard`  
  En `src/app/[lang]/(admin)/dashboard/page.tsx` hay un `redirect` a `/[lang]/dashboard/properties`. Es decir, la “home” del panel es la lista de propiedades.

- **Pantalla real**: **Propiedades** — ruta `/[lang]/dashboard/properties`.

### Página: Propiedades

- **Archivo**: `src/app/[lang]/(admin)/dashboard/properties/page.tsx`
- **Datos** (server):
  - `getProperties()` — lista de propiedades (id, name, slug, address, status, coverImageUrl, wifi, houseRules, checkIn/checkOut).
  - Por cada propiedad: `getPropertyAnalytics(id)` (vistas, tiempo, % mobile).
  - `getReservationsOverviewByProperty()` — reserva actual / próxima por propiedad (para chips en la card).

- **UI**:
  - Título “Propiedades” y descripción.
  - Botón “Agregar Propiedad” → `/[lang]/dashboard/properties/new`.
  - Si no hay propiedades: **empty state** con mensaje y CTA a crear la primera.
  - Si hay propiedades:
    - **Barra de resumen**: 3 bloques (Propiedades total, Ocupadas hoy, Vistas totales).
    - **Grid de cards** (1/2/3 columnas según breakpoint).

- **Card**: `src/components/admin/PropertyCardWithMetrics.tsx`  
  Por cada propiedad muestra:
  - Imagen de portada, badge de estado (Activa/Borrador).
  - Chip de ocupación sobre la imagen (ej. “Ocupada · hasta fecha” o “Próxima · fecha”) si hay reserva.
  - Nombre y dirección.
  - Indicadores de completitud (Imagen, WiFi, Dirección, Reglas) en píldoras.
  - Snippet de reserva (actual o próxima) con link a reservas de esa propiedad.
  - Métricas: Vistas, Tiempo, % Mobile (desde analytics).
  - Botones principales: Editar, Reservas (link a `/dashboard/reservations/properties/[id]`).
  - Dropdown (⋮): Analytics, Copiar link huésped, QR, Vista huésped.
  - Popover “Edición rápida”: WiFi SSID/contraseña, check-in/check-out (acción `updatePropertyQuick`).

---

## 4. My Hostly

- **Ruta**: `/[lang]/dashboard/my-hostly`
- **Archivo**: `src/app/[lang]/(admin)/dashboard/my-hostly/page.tsx`

### Datos

- `getProperties()` para listar propiedades.
- Por cada propiedad:
  - `getProperty(id)` — datos completos (para calcular completitud de secciones).
  - `getPropertyAnalytics(id)` — vistas totales.
  - `getPropertyGuestUsage(id)` — desde PostHog: secciones más consultadas, horario pico de consulta, recomendaciones más seleccionadas.

### UI

- Título “My Hostly” y descripción (vista general de propiedades, completitud de la guía y uso por huéspedes).
- Si no hay propiedades: mensaje y sugerencia de crear una.
- Si hay propiedades: **una card por propiedad** en lista vertical.

### Card: HostlyPropertyCard

- **Archivo**: `src/components/admin/HostlyPropertyCard.tsx`
- **Contenido**:
  - Imagen de portada, badge de estado.
  - Franja inferior en la imagen: “Completitud de la guía” + “X/8 secciones listas” + barra de progreso (Framer Motion).
  - Nombre de la propiedad y dirección (y ciudad/país si hay).
  - **Bloque 1 — Secciones de la guía** (plegable, cerrado por defecto):  
    Checklist de 8 secciones (Información básica, Ubicación, WiFi, Recomendaciones, Transporte, Emergencias, Reglas de la casa, Acceso y parking). Cada ítem enlaza al editor de la propiedad con el tab correspondiente (`?tab=basic`, `?tab=location`, etc.). Se muestra “Listo” o “Completar” según completitud.
  - **Bloque 2 — Uso de la app del huésped** (plegable, cerrado por defecto):  
    - Secciones más consultadas (porcentaje y conteo).
    - Horario promedio de consulta (ej. “18:00” o “Sin datos todavía”).
    - Recomendaciones más seleccionadas (nombre + clics).  
    Si no hay datos de PostHog, se muestra un mensaje amigable.
  - Línea de resumen: “Esta propiedad suma N vistas en total.”
  - Botones: **Editar propiedad** (→ `/dashboard/properties/[id]/edit`), **Copiar link huésped**, **Ver reservas** (→ `/dashboard/reservations/properties/[id]`).

---

## 5. Reservas

- **Ruta**: `/[lang]/dashboard/reservations`
- **Archivo**: `src/app/[lang]/(admin)/dashboard/reservations/page.tsx`

### Datos

- `getReservationsOverviewByProperty()` — por cada propiedad: reserva actual, próxima, siguientes; usado para las cards por propiedad.
- `getReservations()` — listado plano de reservas (para listas o calendario si se usan).
- Orden de propiedades: primero las que tienen reserva actual o próximas, por fecha de próximo check-in; el resto por nombre.

### UI

- Título “Reservas” y descripción (“Próximas reservas, tus propiedades y calendario”).
- Botón de export (ExportReservationsButton).
- **Sección “Tus propiedades”**: una card por propiedad.
- **Sección “Próximas reservas”**: componente UpcomingReservations (puede estar comentado en la implementación actual; la intención es mostrar próximas reservas de forma destacada).
- Calendario (ReservationsCalendar) y listado “Todas las reservas” pueden estar comentados; la estructura de la página está pensada para incluir estos bloques.

### Card por propiedad: PropertyReservationCard

- **Archivo**: `src/components/admin/PropertyReservationCard.tsx`
- Muestra: imagen de la propiedad, nombre, dirección.
- Bloques: **Reserva actual** (si hay), **Próxima reserva**, **Siguientes reservas** (hasta 3 más). En cada línea: huésped (nombre y número de huéspedes), plataforma (icono Booking/Airbnb), fechas, precio.
- Botones: Ver reservas (→ listado de esa propiedad), Generar check-in (modal para token de huésped), Sincronizar (estado “Sincronizado” / “Volver a sincronizar”).

### Subruta: reservas de una propiedad

- **Ruta**: `/[lang]/dashboard/reservations/properties/[id]`
- **Archivo**: `src/app/[lang]/(admin)/dashboard/reservations/properties/[id]/page.tsx`
- Contenido: título de la propiedad, búsqueda, filtros, botón nueva reserva, export, y vista de reservas (tabla + opción calendario) con ReservationsView / ReservationsTable.

---

## 6. Flujos de datos (resumen)

| Área | Funciones principales | Ubicación |
|------|----------------------|-----------|
| Propiedades | `getProperties()`, `getProperty(id)` | `src/lib/actions/properties/get.ts` (y barrel `properties.ts`) |
| Analíticas (vistas) | `getPropertyAnalytics(id)` | `src/lib/actions/analytics.ts` |
| Uso huésped (PostHog) | `getPropertyGuestUsage(id)` | `src/lib/analytics/posthog.ts` |
| Reservas | `getReservationsOverviewByProperty()`, `getReservations(filters)`, `getReservationsTokenStatus()` | `src/lib/actions/reservations.ts` |
| Actualización rápida propiedad | `updatePropertyQuick(id, data)` | `src/lib/actions/properties/update.ts` |

Tipos de analíticas y uso huésped: `src/types/analytics.ts` (PropertyAnalytics, PropertyGuestUsage, GuestUsageSection, etc.).

---

## 7. Archivos a incluir para Claude

Al compartir el proyecto con Claude para revisar diseño o rediseño de estas pantallas, incluye al menos los siguientes archivos (rutas relativas al repo).

### Páginas (rutas)

| Archivo | Descripción |
|---------|-------------|
| `src/app/[lang]/(admin)/layout.tsx` | Layout del dashboard (sidebar + contenido). |
| `src/app/[lang]/(admin)/dashboard/page.tsx` | Redirección de “Panel de control” a propiedades. |
| `src/app/[lang]/(admin)/dashboard/properties/page.tsx` | Pantalla Propiedades (grid de cards, resumen, empty state). |
| `src/app/[lang]/(admin)/dashboard/my-hostly/page.tsx` | Pantalla My Hostly (una card por propiedad con datos completos y uso). |
| `src/app/[lang]/(admin)/dashboard/reservations/page.tsx` | Pantalla Reservas (cards por propiedad + próximas reservas). |

### Componentes de las tres pantallas

| Archivo | Descripción |
|---------|-------------|
| `src/components/admin/sidebar.tsx` | Sidebar desktop (nav Panel de control, My Hostly, Reservas; usuario; colapsable con Framer Motion). |
| `src/components/admin/mobile-sidebar.tsx` | Mismo menú para móvil (sheet). |
| `src/components/admin/PropertyCardWithMetrics.tsx` | Card de propiedad en “Propiedades”: métricas, completitud, reserva, edición rápida, dropdown. |
| `src/components/admin/HostlyPropertyCard.tsx` | Card en My Hostly: completitud 8 secciones, bloques plegables (secciones + uso huésped), acciones. |
| `src/components/admin/PropertyReservationCard.tsx` | Card en Reservas: reserva actual, próxima, siguientes; botones Ver reservas, Generar check-in, Sincronizar. |
| `src/components/admin/UpcomingReservations.tsx` | Bloque “Próximas reservas” en la página de Reservas. |

### Datos y tipos

| Archivo | Descripción |
|---------|-------------|
| `src/lib/actions/properties/get.ts` | getProperties, getProperty (y loadPropertyWithRelations para datos completos). |
| `src/lib/actions/analytics.ts` | getPropertyAnalytics (vistas desde DB). |
| `src/lib/analytics/posthog.ts` | getPropertyGuestUsage (secciones más consultadas, horario pico, recomendaciones desde PostHog). |
| `src/lib/actions/reservations.ts` | getReservations, getReservationsOverviewByProperty y tipos (ReservationsOverviewByPropertyItem, etc.). |
| `src/types/analytics.ts` | PropertyAnalytics, PropertyGuestUsage, GuestUsageSection, GuestSectionKey. |

### Opcional (si Claude va a proponer cambios de UI o estilos)

| Archivo | Descripción |
|---------|-------------|
| `src/components/ui/card.tsx` | Componente Card usado en las cards. |
| `src/components/ui/button.tsx` | Botones. |
| `src/components/ui/badge.tsx` | Badges de estado. |
| `tailwind.config.ts` o `tailwind.config.mjs` | Si existe; variables de marca (brand-void, brand-copper) para colores. |

---

## Preguntas sugeridas para Claude

Después de compartir este informe y los archivos listados, puedes pedir a Claude, por ejemplo:

- Rediseño visual de las tres pantallas manteniendo la misma información y flujos.
- Consistencia entre Panel de control (Propiedades), My Hostly y Reservas (nomenclatura, jerarquía visual, patrones de cards).
- Mejoras de accesibilidad (focus, contraste, etiquetas, estructura de encabezados).
- Simplificación o reordenación del contenido en cada card para reducir ruido o priorizar acciones.
- Propuesta de layout alternativo (p. ej. si My Hostly debería ser la home del panel en lugar de Propiedades).
