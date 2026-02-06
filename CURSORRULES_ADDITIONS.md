# Contenido para agregar a .cursorrules

Copia y pega estas secciones en tu archivo `.cursorrules` existente:

---

## NAVEGACIÓN DASHBOARD

Rutas del proyecto:
- `/{lang}/dashboard` → Home con grid de propiedades y métricas
- `/{lang}/dashboard/properties` → Lista de propiedades
- `/{lang}/dashboard/properties/[id]/edit` → Editor de propiedad
- `/{lang}/dashboard/properties/new` → Nueva propiedad
- `/{lang}/dashboard/reservations` → Reservas
- `/{lang}/dashboard/qr-builder` → Generador de QR/Flyer
- `/{lang}/stay/[slug]` → Vista huésped (pública, sin auth)

Layout admin: Sidebar w-64 (w-20 colapsado), contenido en AdminScrollArea.

---

## ANALYTICS (Posthog)

Eventos a trackear en vista huésped:
- `guest_guide_viewed` → property_id, device (mobile|desktop)
- `wifi_password_copied` → property_id
- `recommendation_clicked` → property_id, recommendation_name, category
- `map_opened` → property_id
- `rules_viewed` → property_id (cuando abre reglas)
- `transport_viewed` → property_id (cuando abre transporte)

Archivos: `src/lib/posthog.ts` (cliente), `src/types/analytics.ts` (tipos).

---

## FUTURO (no implementar aún)

- Automatizaciones: emails Resend, WhatsApp Twilio, cron jobs
- Chat IA: Claude API, widget en vista huésped
- Ver guía completa (Días 4-14) cuando se implementen
