# Guía Sprint 1 Reducida – Hostly
## Solo Setup + Días 1-3 (Dashboard con Métricas)

> **Alcance:** Setup inicial + Posthog analytics + Dashboard con métricas por propiedad.  
> **Excluido en esta fase:** Automatizaciones email/WhatsApp, Chat IA Host Virtual.

---

## Workflow con Cursor Pro

1. Lee la sección del feature
2. Copia el prompt sugerido
3. Pégalo en Cursor Composer (Cmd+I)
4. Revisa el código generado
5. Ajusta si es necesario con Chat (Cmd+L)
6. Prueba en desarrollo
7. Commit
8. Siguiente paso

---

## Setup inicial

### Paso 0.1: Actualizar `.cursorrules`

Agrega estas secciones a tu `.cursorrules`:

```markdown
## NAVEGACIÓN DASHBOARD

Rutas actuales:
- /{lang}/dashboard → Home con grid de propiedades y métricas
- /{lang}/dashboard/properties → Lista de propiedades
- /{lang}/dashboard/properties/[id]/edit → Editor de propiedad
- /{lang}/dashboard/reservations → Reservas
- /{lang}/stay/[slug] → Vista huésped (pública)

## ANALYTICS (Posthog)

Eventos a trackear:
- guest_guide_viewed (property_id, device)
- wifi_password_copied (property_id)
- recommendation_clicked (property_id, recommendation_name, category)
- map_opened (property_id)
- rules_viewed (property_id)
- transport_viewed (property_id)

Usar src/lib/posthog.ts (cliente) y src/types/analytics.ts (tipos).
```

### Paso 0.2: Instalar dependencias

```bash
npm install posthog-js
```

### Paso 0.3: Variables de entorno

Agregar a `.env.local`:

```env
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_tu_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_API_KEY=phx_tu_personal_api_key
POSTHOG_PROJECT_ID=tu_project_id
```

> **Nota:** `POSTHOG_API_KEY` es una Personal API Key (phx_) desde Posthog → Project Settings → Personal API Keys. `POSTHOG_PROJECT_ID` está en Project Settings.

---

## Día 1: Setup Analytics (Posthog)

### 1.1 Crear cliente Posthog

**PROMPT para Cursor Composer:**

```
Crea src/lib/posthog.ts con un cliente de Posthog para analytics.

Requisitos:
- Singleton que funcione en cliente (typeof window !== 'undefined')
- Init solo si window está disponible
- Usar NEXT_PUBLIC_POSTHOG_KEY del env
- api_host: https://eu.i.posthog.com (o https://app.posthog.com si usas US)
- capture_pageview: false (lo hacemos manualmente)
- Export: posthog (cliente) y función initPosthog()

Crea src/types/analytics.ts con tipos para eventos:
- GuestGuideViewedEvent { property_id: number; device: 'mobile' | 'desktop' }
- WifiPasswordCopiedEvent { property_id: number }
- RecommendationClickedEvent { property_id: number; recommendation_name: string; category: string }
- MapOpenedEvent { property_id: number }
```

### 1.2 Trackear eventos en vista huésped

**PROMPT para Cursor Composer:**

```
Integra tracking de Posthog en la vista huésped.

1. En src/app/[lang]/stay/[slug]/page.tsx:
   - No trackear aquí (es server). El tracking va en el cliente.

2. En src/components/guest/guest-view.tsx:
   - Importa posthog (o usePosthog si creas un hook)
   - En useEffect al montar: track 'guest_guide_viewed' con property_id (property.id) y device (detectar con navigator.userAgent o window.innerWidth)
   - Pasar property.id al componente

3. En src/components/guest/modules/WifiGlassCard.tsx:
   - Agregar prop opcional: propertyId?: number
   - En handleCopy: si propertyId existe, track 'wifi_password_copied' con property_id

4. En src/components/guest/views/recommendations/RecommendationCard.tsx (o donde se rendericen recomendaciones):
   - Agregar props: propertyId, onRecommendationClick?
   - Al hacer click (es un <a>): track 'recommendation_clicked' con property_id, recommendation_name (place.title), category (place.categoryType)

5. En módulos que abren mapa (LocationButton, TransportDrawer, etc):
   - Track 'map_opened' cuando el usuario abre el mapa

Asegúrate de que guest-view pase propertyId a los módulos que lo necesitan.
```

### 1.3 Verificación

1. `npm run dev`
2. Abre `/es/stay/[slug-de-tu-propiedad]`
3. Copia contraseña WiFi, clickea una recomendación
4. En Posthog → Live Events verifica que aparecen los eventos

**Commit:** `feat: add posthog analytics tracking`

---

## Día 2: API de analytics + server action

### 2.1 Crear server action

**PROMPT para Cursor Composer:**

```
Crea src/lib/actions/analytics.ts con getPropertyAnalytics(propertyId: number).

Conecta con Posthog API:
- POST https://eu.i.posthog.com/api/projects/{project_id}/query (o app.posthog.com)
- Header: Authorization: Bearer ${POSTHOG_API_KEY}
- Query eventos de los últimos 30 días filtrados por property_id

Retorna PropertyAnalytics:
{
  totalViews: number
  avgTimeOnPage: number  // segundos (estimar)
  mobilePercent: number  // 0-100
  topActions: Array<{ action: string; count: number; percentage: number }>
  topRecommendations: Array<{ name: string; category: string; clicks: number }>
  viewsTimeline: Array<{ date: string; views: number }>
}

Maneja errores y retorna estructura vacía si la API falla.
Usa Zod para validar respuestas si es necesario.
```

### 2.2 Crear tipo PropertyAnalytics

**PROMPT para Cursor Chat:**

```
En src/types/analytics.ts agrega:

export interface PropertyAnalytics {
  totalViews: number
  avgTimeOnPage: number
  mobilePercent: number
  topActions: Array<{ action: string; count: number; percentage: number }>
  topRecommendations: Array<{
    id?: number
    name: string
    category: string
    clicks: number
    firstClicked?: string
    lastClicked?: string
    address?: string
    rating?: number
    priceRange?: number
  }>
  viewsTimeline: Array<{ date: string; views: number }>
}
```

**Commit:** `feat: add analytics server action with posthog integration`

---

## Día 3: Dashboard home UI

### 3.1 Crear PropertyCardWithMetrics

**PROMPT para Cursor Composer:**

```
Crea src/components/admin/PropertyCardWithMetrics.tsx

Muestra:
- Imagen de portada (coverImageUrl o placeholder)
- Nombre, dirección corta
- Badge "ACTIVE" (verde)

Métricas (3 en fila):
- 👁️ {totalViews} vistas
- ⏱️ {avgTimeOnPage} tiempo promedio (formato "8:34" o "0:00")
- 📱 {mobilePercent}% mobile

Accesos rápidos (grid 2x2 o lista):
- 📝 Editar guía → /{lang}/dashboard/properties/[id]/edit
- 📊 Ver analytics → /{lang}/dashboard/properties/[id]/analytics (crear página)
- 🔗 Copiar link (toast confirmación)
- 📱 Generar QR → /{lang}/dashboard/qr-builder (o ruta existente)
- 👁️ Vista huésped → /{lang}/stay/[slug] (nueva pestaña)

Estilo: card border rounded-xl hover:shadow-lg, brand-void, brand-copper para acciones.
Skeleton loading mientras carga analytics.

Props: { property: Property; analytics: PropertyAnalytics | null; isLoading?: boolean; lang: string }
```

### 3.2 Crear UpcomingReservations

**PROMPT para Cursor Composer:**

```
Crea src/components/admin/UpcomingReservations.tsx

Card que muestra reservas con checkIn o checkOut en próximos 7 días.

Cada item: Badge (Check-in verde / Check-out azul), hora, nombre huésped, propiedad.
Ordenar cronológicamente. Máximo 5, luego link "Ver todas en Reservas".
Empty state si no hay reservas.

Usar getReservations o similar de src/lib/actions/reservations.ts.
```

### 3.3 Refactorizar dashboard page

**PROMPT para Cursor Composer:**

```
Refactoriza src/app/[lang]/(admin)/dashboard/page.tsx

Layout:
1. Header: "Dashboard" + botón "+ Nueva Propiedad" (link a /{lang}/dashboard/properties/new)
2. Stats: mantener o ajustar las 3 cards actuales (Total Views, Active Properties, Sync Status)
3. Grid de PropertyCardWithMetrics (1 col mobile, 2 tablet, 3 desktop)
4. Sección "Próximas Reservas" con UpcomingReservations

Para cada propiedad: fetch analytics con getPropertyAnalytics, Suspense + Skeleton.
El grid reemplaza o complementa PropertiesGrid según diseño.

Rutas: usar params.lang para los links (ej. /${lang}/dashboard/...)
```

### 3.4 (Opcional) Página de analytics por propiedad

**PROMPT para Cursor Chat:**

```
Crea src/app/[lang]/(admin)/dashboard/properties/[id]/analytics/page.tsx

Página que muestra métricas detalladas de una propiedad:
- Gráfico de vistas (viewsTimeline)
- Top recomendaciones
- Top acciones
- Tiempo promedio, % mobile

Usar getPropertyAnalytics(id). Diseño coherente con el dashboard.
```

**Commit:** `feat: add dashboard home with property metrics cards`

---

## Checklist final Sprint 1 reducido

- [x] Posthog instalado y configurado
- [x] Cliente posthog.ts y tipos analytics.ts
- [x] Tracking en guest-view, WifiGlassCard, RecommendationCard, mapa
- [x] Server action getPropertyAnalytics
- [x] PropertyCardWithMetrics
- [x] UpcomingReservations
- [x] Dashboard refactorizado con grid de métricas
- [x] Página analytics por propiedad
- [x] Redirect / → /es/dashboard
- [x] QR builder con pre-carga por propiedad (query params)

---

## Notas de rutas del proyecto

- Dashboard: `/[lang]/(admin)/dashboard/` → URL: `/es/dashboard`, `/en/dashboard`
- Propiedades: `/[lang]/(admin)/dashboard/properties/`
- Stay: `/[lang]/stay/[slug]`
- El `lang` viene de `params` en server components
