# GUEST-LINK (HOSTLY) PROJECT RULES - v2.0 OPTIMIZED

## 🎯 CONTEXTO ACTUAL DEL PROYECTO

**Estado:** Implementando Sprint 1 - Día 8 (Chat IA con Claude API)
**Versión:** v2.0 en desarrollo
**Features activos:** Dashboard, Analytics (Posthog), Automatizaciones (en progreso)
**Próximo:** Chat IA Host Virtual 24/7

---

## 📚 STACK PRINCIPAL

### Core Framework
- **Next.js 16.1.4** (App Router) - Server Components por defecto
- **React 19** - `use` hook, `useActionState`, `useOptimistic`
- **TypeScript 5** - Strict mode, NO usar `any`
- **Tailwind CSS v4** - CSS variables en globals.css (sin config file)

### Database & Auth
- **Drizzle ORM** + **PostgreSQL** (puerto 5434 Docker)
- **NextAuth v5 beta** (Drizzle adapter)

### UI Components
- **Shadcn/ui** + **Radix UI** - Componentes base
- **Framer Motion v12** - Animaciones (respeta reducedMotion)
- **Lucide React** - Iconos ÚNICAMENTE
- **React Hook Form + Zod** - Formularios y validación

### APIs y Servicios Externos
- **Google Maps/Places/Transit API** - Mapas y geolocalización
- **Maplibre GL** - Renderizado de mapas
- **Foursquare + Overpass (OSM)** - Datos alternativos
- **Posthog** - Analytics y tracking
- **Anthropic Claude API** - Chat IA (implementando ahora)
- **Resend** - Emails transaccionales (próximo)
- **Twilio** - WhatsApp/SMS (próximo)

### Internacionalización
- **next-intl** - i18n con español (es), inglés (en), portugués (pt)
- Rutas: `/[lang]/...`
- Archivos: `src/i18n/locales/{es,en,pt}.json`

---

## 🗂️ ESTRUCTURA DE ARCHIVOS (ACTUALIZADA)

```
src/
├── app/
│   ├── [lang]/
│   │   ├── (admin)/dashboard/
│   │   │   ├── page.tsx              # Home con métricas por propiedad
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx          # Lista de propiedades
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/         # Editor con tabs
│   │   │   │   │   ├── analytics/    # Métricas (Posthog)
│   │   │   │   │   └── automations/  # Config automatizaciones
│   │   │   │   └── new/              # Crear propiedad
│   │   │   ├── reservations/
│   │   │   │   └── page.tsx          # Lista/calendario reservas
│   │   │   └── qr-builder/           # Generador QR/Flyer
│   │   ├── (guest)/
│   │   │   └── stay/[slug]/page.tsx  # Vista huésped pública
│   │   ├── login/ y register/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── reservations/sync/         # Sync desde extensión
│       ├── chat/route.ts              # ⭐ NUEVO: Chat IA endpoint
│       └── cron/                      # Cron jobs automatizaciones
│           ├── send-pre-arrival/
│           ├── send-checkout-reminder/
│           └── send-review-request/
├── components/
│   ├── admin/
│   │   ├── PropertyCardWithMetrics.tsx   # ⭐ NUEVO: Card con analytics
│   │   ├── UpcomingReservations.tsx      # ⭐ NUEVO: Timeline reservas
│   │   └── AutomationSettings.tsx        # ⭐ NUEVO: Config emails
│   ├── guest/
│   │   ├── guest-view.tsx
│   │   └── ChatWidget.tsx                # ⭐ IMPLEMENTANDO AHORA
│   └── ui/                                # Shadcn components
├── db/
│   └── schema.ts                          # ⭐ Tablas nuevas:
│                                          # - chatLogs, automationLogs,
│                                          # - accessDevices (futuro eWeLink)
├── lib/
│   ├── actions/                           # Server Actions
│   │   ├── analytics.ts                   # ⭐ NUEVO: getPropertyAnalytics
│   │   └── ...
│   ├── ai/                                # ⭐ NUEVO: Claude API
│   │   ├── client.ts                      # Cliente Anthropic
│   │   └── prompts/
│   │       └── virtual-host.ts            # System prompts
│   ├── automations/                       # ⭐ NUEVO: Email/WhatsApp
│   │   └── guest-communication.ts
│   ├── email.ts                           # ⭐ NUEVO: Resend client
│   ├── whatsapp.ts                        # ⭐ NUEVO: Twilio client
│   ├── posthog.ts                         # ⭐ NUEVO: Analytics client
│   └── services/                          # APIs externas (Google, etc)
├── emails/templates/                      # ⭐ NUEVO: React Email templates
│   ├── PreArrivalEmail.tsx
│   ├── CheckoutReminderEmail.tsx
│   └── ReviewRequestEmail.tsx
└── types/
    ├── analytics.ts                       # ⭐ NUEVO: Types Posthog
    └── ai.ts                              # ⭐ NUEVO: Types Chat IA
```

---

## 🎨 CONVENCIONES DE CÓDIGO

### Componentes React

#### Server vs Client Components
```typescript
// ✅ CORRECTO: Server Component por defecto (sin 'use client')
export default function PropertyList() {
  const properties = await getProperties() // Async en server
  return <div>...</div>
}

// ✅ CORRECTO: Client solo si necesita interactividad
'use client'
export function ChatWidget() {
  const [messages, setMessages] = useState([])
  return <div>...</div>
}

// ❌ INCORRECTO: 'use client' en layouts o páginas principales
'use client' // NO HACER ESTO en layouts
export default function DashboardLayout() {}
```

#### Regla de oro
- **Layouts y páginas:** Server Components
- **Hojas (leafs) interactivos:** Client Components
- **Si usas hooks o eventos:** `'use client'`
- **Si haces fetch de DB:** Server Component

---

### Server Actions

```typescript
// ✅ Estructura correcta de Server Action
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'

// Schema de validación
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
})

export async function createUser(formData: FormData) {
  try {
    // 1. Validar input
    const data = schema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
    })
    
    // 2. Operación DB
    const result = await db.insert(users).values(data).returning()
    
    // 3. Revalidar cache
    revalidatePath('/dashboard/users')
    
    // 4. Retornar tipado
    return { success: true, data: result[0] }
  } catch (error) {
    // 5. Error handling explícito
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    return { success: false, error: 'Database error' }
  }
}
```

**Ubicación:** `src/lib/actions/{nombre}.ts`  
**Siempre:** validación Zod → operación → revalidate → return tipado

---

### TypeScript Estricto

```typescript
// ✅ CORRECTO
interface PropertyCardProps {
  property: Property
  analytics: PropertyAnalytics | null
}

// ✅ CORRECTO: unknown para datos externos
const data = await response.json() as unknown
const validated = schema.parse(data)

// ❌ INCORRECTO: Never usar any
const data: any = await fetch() // NO HACER
```

---

### Estilos (Tailwind CSS v4)

```typescript
// ✅ CORRECTO: cn() para clases condicionales
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  "dark:dark-classes"
)}>

// ✅ CORRECTO: Responsive mobile-first
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ INCORRECTO: Estilos inline
<div style={{ color: 'red' }}> // NO HACER
```

**NO usar:** `tailwind.config.js` (usamos CSS variables en `globals.css`)

---

### Internacionalización (i18n)

```typescript
// ✅ CORRECTO: useTranslations en client components
'use client'
import { useTranslations } from 'next-intl'

export function WifiCard() {
  const t = useTranslations('property')
  return <p>{t('wifi.password')}</p>
}

// ✅ CORRECTO: getTranslations en server components
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('dashboard')
  return <h1>{t('title')}</h1>
}

// ❌ INCORRECTO: Strings hardcodeadas
<p>WiFi Password</p> // NO HACER
```

**Keys:** snake_case → `property.wifi.password`

---

## 🚀 FEATURES EN DESARROLLO (Sprint 1 - Día 8)

### Chat IA con Claude API

**Objetivo:** Responder automáticamente consultas de huéspedes 24/7

#### Archivos a crear/modificar:

1. **`src/lib/ai/client.ts`**
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function getChatResponse(
  message: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...conversationHistory, { role: 'user', content: message }],
  })
  
  return response.content[0].text
}
```

2. **`src/lib/ai/prompts/virtual-host.ts`**
```typescript
import { Property } from '@/types'

export function buildSystemPrompt(property: Property): string {
  return `
Eres el asistente virtual de "${property.name}" en ${property.city}.

INFORMACIÓN:
- WiFi: ${property.wifiSsid} / ${property.wifiPassword}
- Check-in: ${property.checkInTime} | Check-out: ${property.checkOutTime}
- Código acceso: ${property.accessCode || 'No disponible'}

REGLAS: ${property.houseRules?.join(', ')}

LUGARES CERCANOS: ${property.recommendations?.map(r => r.name).join(', ')}

Responde conciso y amigable. Si no sabes, di "Consulta al host".
Responde en el idioma del mensaje.
`
}
```

3. **`src/app/api/chat/route.ts`**
```typescript
import { NextRequest } from 'next/server'
import { getChatResponse } from '@/lib/ai/client'
import { buildSystemPrompt } from '@/lib/ai/prompts/virtual-host'
import { db } from '@/db'

export async function POST(request: NextRequest) {
  const { message, propertySlug, conversationHistory } = await request.json()
  
  // Get property
  const property = await db.query.properties.findFirst({
    where: eq(properties.slug, propertySlug),
    with: { recommendations: true }
  })
  
  if (!property) return Response.json({ error: 'Not found' }, { status: 404 })
  
  // Get AI response
  const systemPrompt = buildSystemPrompt(property)
  const aiResponse = await getChatResponse(message, systemPrompt, conversationHistory)
  
  // Log (optional)
  await db.insert(chatLogs).values({
    propertyId: property.id,
    message,
    response: aiResponse,
  })
  
  return Response.json({ response: aiResponse })
}
```

4. **`src/components/guest/ChatWidget.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget({ propertySlug }: { propertySlug: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        propertySlug,
        conversationHistory: messages
      })
    })
    
    const data = await response.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    setIsLoading(false)
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-brand-void rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-brand-void text-white rounded-t-xl">
        <h3 className="font-semibold">🤖 Host Virtual</h3>
        <p className="text-sm opacity-80">Disponible 24/7</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                msg.role === 'user'
                  ? 'bg-brand-copper text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="p-2 bg-brand-copper text-white rounded-lg hover:bg-brand-void transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

5. **Agregar a `src/db/schema.ts`:**
```typescript
export const chatLogs = pgTable('chat_logs', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id),
  conversationId: uuid('conversation_id').defaultRandom(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  userIp: varchar('user_ip', { length: 50 }),
  wasHelpful: boolean('was_helpful'),
})
```

6. **Integrar en vista huésped:**
```typescript
// src/components/guest/guest-view.tsx
import { ChatWidget } from './ChatWidget'

export function GuestView({ property }) {
  return (
    <div>
      {/* ... resto del contenido ... */}
      
      {/* Chat Widget */}
      <ChatWidget propertySlug={property.slug} />
    </div>
  )
}
```

---

## 📊 ANALYTICS (Posthog)

### Eventos a trackear

```typescript
// src/lib/posthog.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
  })
}

// Vista huésped - trackear estos eventos:
posthog.capture('guest_guide_viewed', { property_id, device })
posthog.capture('wifi_password_copied', { property_id })
posthog.capture('recommendation_clicked', { property_id, recommendation_name, category })
posthog.capture('map_opened', { property_id })
posthog.capture('chat_opened', { property_id }) // ⭐ NUEVO
posthog.capture('chat_message_sent', { property_id }) // ⭐ NUEVO
```

---

## ⚡ OPTIMIZACIÓN Y ECONOMÍA

### Principios para economizar tokens con Cursor

1. **Contexto mínimo necesario:**
   - Solo incluye archivos relevantes con `@archivo`
   - Usa `@.cursorrules` + archivos específicos, no todo el proyecto

2. **Prompts claros y concisos:**
   ```
   ❌ MAL: "Crea un componente para el chat que tenga mensajes y un input y que se vea bien"
   
   ✅ BIEN: "Crea ChatWidget.tsx en src/components/guest/
   Props: propertySlug
   Features: lista de mensajes, input, botón enviar, fetch a /api/chat
   Sigue estructura de ejemplo en .cursorrules"
   ```

3. **Iteración incremental:**
   - NO pidas todo de una vez
   - Divide en pasos: primero API route, luego componente, luego integración

4. **Reutiliza código existente:**
   ```
   "Crea sendWhatsAppMessage en src/lib/whatsapp.ts
   Similar a sendPreArrivalEmail pero con Twilio"
   ```

5. **Referencias a patterns existentes:**
   ```
   "@src/components/admin/PropertyCardWithMetrics.tsx
   Crea ChatLogCard similar pero para mostrar conversaciones"
   ```

---

## 🚫 PROHIBITED PATTERNS

### NO HACER (anti-patterns)

```typescript
// ❌ 'use client' en layouts
'use client' // NO
export default function RootLayout() {}

// ❌ any type
const data: any = await fetch() // NO

// ❌ API routes para CRUD simple (usa Server Actions)
// app/api/properties/create/route.ts // NO (usa Server Action)

// ❌ Fetch sin error handling
const data = await fetch(url).then(r => r.json()) // NO

// ❌ Strings hardcodeadas
<p>Welcome</p> // NO (usa i18n)

// ❌ Importar todo Google Maps
import GoogleMap from '@react-google-maps/api' // NO (lazy load)

// ❌ console.log en producción
console.log('Debug:', data) // NO (usa logger apropiado)
```

---

## ✅ GOOD PATTERNS

### SÍ HACER (best practices)

```typescript
// ✅ Server Component con async/await
export default async function Page() {
  const data = await getData()
  return <div>{data}</div>
}

// ✅ Client Component leaf con 'use client'
'use client'
export function InteractiveButton() {
  const [clicked, setClicked] = useState(false)
  return <button onClick={() => setClicked(true)}>...</button>
}

// ✅ Server Action con validación
'use server'
export async function updateUser(formData: FormData) {
  const data = schema.parse(...)
  const result = await db.update(...)
  revalidatePath('/dashboard')
  return { success: true, data: result }
}

// ✅ i18n en componentes
const t = useTranslations('dashboard')
return <h1>{t('title')}</h1>

// ✅ Error handling robusto
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  if (error instanceof SpecificError) {
    return { success: false, error: 'Specific message' }
  }
  return { success: false, error: 'Generic error' }
}

// ✅ Lazy loading de componentes pesados
const MapComponent = lazy(() => import('@/components/MapComponent'))
```

---

## 🔐 SECURITY

- **NextAuth session validation** en rutas admin
- **syncApiKey** único (UUID) por propiedad
- **Rate limiting** en API routes (especialmente /api/chat)
- **Sanitizar inputs** antes de DB
- **CORS** configurado para extensión
- **API keys** solo en server (env variables)

---

## 🎯 PRIORIDADES AL GENERAR CÓDIGO

1. **Funcionalidad correcta** - Que funcione según spec
2. **Type safety** - TypeScript estricto, sin `any`
3. **Performance** - Server Components, lazy loading
4. **i18n** - Soporte es/en/pt completo
5. **Accesibilidad** - WCAG AA mínimo
6. **Código legible** - Nombres claros, comentarios en lógica compleja

---

## 📝 VARIABLES DE ENTORNO REQUERIDAS

```env
# Base
DATABASE_URL=postgresql://...
NEXT_PUBLIC_URL=http://localhost:3000

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Google
GOOGLE_MAPS_API_KEY=...
GOOGLE_PLACES_API_KEY=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
POSTHOG_API_KEY=...

# AI (⭐ IMPLEMENTANDO AHORA)
ANTHROPIC_API_KEY=...

# Email (próximo)
RESEND_API_KEY=...

# WhatsApp (próximo)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...

# Cron
CRON_SECRET=...
```

---

## 🧪 TESTING

```bash
# Development
npm run dev

# Build
npm run build

# Database
npm run db:migrate
npm run db:push
npm run db:seed

# Docker
docker-compose up  # PostgreSQL en puerto 5434
```

---

## 💡 TIPS PARA CURSOR

### Para el Día 8 (Chat IA)

**Prompt sugerido para Cursor Composer:**
```
@.cursorrules @src/types @src/db/schema.ts

Implementa Chat IA según Día 8 de .cursorrules:

1. Crea src/lib/ai/client.ts con getChatResponse
2. Crea src/lib/ai/prompts/virtual-host.ts con buildSystemPrompt
3. Crea src/app/api/chat/route.ts (POST endpoint)
4. Crea src/components/guest/ChatWidget.tsx
5. Agrega tabla chatLogs a schema.ts
6. Integra ChatWidget en guest-view.tsx

Usa Anthropic SDK, valida con Zod, maneja errores.
```

**Prompt para ajustes:**
```
@src/components/guest/ChatWidget.tsx

Agrega:
- Scroll automático a último mensaje
- Botón "Nueva conversación"
- Guardar historial en localStorage
```

---

## 🚀 PRÓXIMOS FEATURES (NO IMPLEMENTAR AÚN)

- **Calendario de reservas** (react-big-calendar)
- **Control eWeLink** (cerraduras smart)
- **Gestión de limpieza** (coordinación equipo)
- **Analytics predictivo** (ML insights)
- **Tour virtual 360°** (Pannellum)

**Ver:** `INVENTARIO_FEATURES_Y_ROADMAP_V2.md` para detalles completos

---

## 📚 REFERENCIAS IMPORTANTES

- [Guía implementación Cursor](./GUIA_IMPLEMENTACION_CURSOR_PRO.md)
- [Análisis UX/UI](./ANALISIS_UX_UI_ROADMAP.md)
- [Inventario features](./INVENTARIO_FEATURES_Y_ROADMAP_V2.md)

---

**ÚLTIMA ACTUALIZACIÓN:** Día 8 Sprint 1 - Implementando Chat IA
**VERSIÓN:** v2.0.0-dev
**MANTENER ESTE ARCHIVO ACTUALIZADO** con cada feature nuevo implementado
