# Guest Link Design System

## Colores (Tailwind / CSS Variables)

### Brand Colors (custom)
```css
/* src/app/globals.css - @theme */
--color-brand-void: #0f2a3d;        /* Azul oscuro - fondo principal */
--color-brand-void-light: #1e3a52;  /* Hover sobre azul */

--color-brand-copper: #d97706;      /* Acento principal - botones */
--color-brand-copper-fg: #ffffff;   /* Texto sobre botones cobre */

--color-brand-concrete: #64748b;    /* Neutros */
--color-brand-paper: #f8fafc;       /* Fondo general */
```

### Shadcn Variables (modo claro `:root` y oscuro `.dark`)
- **background / foreground**: oklch para fondo y texto
- **card, popover**: superficies elevadas
- **primary, secondary**: botones y estados
- **muted, accent**: fondos sutiles
- **destructive**: errores/eliminar
- **border, input, ring**: bordes y focus

Uso: `bg-brand-copper`, `text-brand-void`, `dark:bg-brand-void`, etc.

---

## Tipografía

- **Sans (body)**: Inter + Plus Jakarta Sans (`--font-inter`, `--font-jakarta`)
- **Display**: Playfair Display (`--font-playfair`)
- **Mono**: Roboto Mono (`--font-roboto-mono`)

Definidas en `src/app/layout.tsx` con `next/font/google`.

Escala: `text-sm` (0.875rem) → `text-base` → `text-lg` → `text-xl` → `text-2xl` → `text-4xl`

---

## Espaciado y layout

- **Contenedores**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Cards**: `p-6 rounded-xl border border-gray-100 dark:border-gray-800`
- **Grids**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Radius base**: `--radius: 0.625rem` (usado en sm, md, lg, xl)

---

## Componentes base (Shadcn / Radix)

### Button
Variants: `default` (brand-copper) | `destructive` | `outline` | `secondary` | `ghost` | `link`  
Sizes: `default` | `sm` | `lg` | `icon`

```tsx
<Button variant="default">Acción principal</Button>
<Button variant="outline">Secundario</Button>
```

### Input, Label, Textarea
- Radix + Tailwind
- `ring-ring` en focus

### Dialog, Sheet, Popover
- Modal centrado
- Shadcn new-york style

### Accordion, Tabs, Switch
- Radix primitives con estilos Tailwind

### Toasts
- **Sonner** (posición por defecto)
- Usado en `<Toaster />` en layout raíz

### Otros
- `Badge`, `Card`, `Skeleton`, `Drawer` (Vaul), `theme-toggle`

---

## Iconos

- **Librería**: Lucide React
- Tamaño estándar: `w-5 h-5` o `size={20}`
- Color: `currentColor` o explícito (`text-brand-copper`, `text-gray-500`)

---

## Animaciones

### Framer Motion
- Welcome screen: `fadeIn`, `scale`, `opacity`, `y` (stagger)
- Duración típica: 0.3–1s

### Tailwind / tw-animate
- `animate-in fade-in slide-in-from-bottom-2 duration-200`
- `animate-spin` para loaders
- Accordion: `accordion-down` / `accordion-up`

### Transiciones
- Sidebar: `transition-all duration-300`
- Cards: `hover:shadow-md transition-colors`

### Accesibilidad
- `prefers-reduced-motion` se respeta cuando se usa correctamente

---

## Layout patterns

### Dashboard admin
- **Sidebar**: fijo izquierda, `w-64` expandido / `w-20` colapsado
- **Header**: sticky con breadcrumbs
- **Content**: `max-w-7xl` centrado, `px-2 md:px-8 py-6`
- Sidebar: `bg-white dark:bg-brand-void`

### Vista huésped (`GuestView`)
- Hero con imagen (`h-[50vh]`, `object-cover`)
- Secciones con `bg` alternado (white / gray-50)
- Cards: `shadow-sm hover:shadow-md`, `rounded-xl`
- Mapa en sección dedicada (MapLibre / react-map-gl)

### Forms
- Layout: label + input en columna (`space-y-2`)
- Errores: `text-sm text-destructive`
- Submit: `w-full` en mobile, `w-auto` en desktop

---

## Archivos de referencia

Para dar contexto completo a Claude, incluir:

1. **package.json** – dependencias
2. **src/app/globals.css** – tema, variables, estilos base
3. **src/components/ui/** – componentes Shadcn:
   - `button.tsx`, `input.tsx`, `label.tsx`
   - `card.tsx`, `dialog.tsx`, `accordion.tsx`
   - `index.ts` (exports)

4. **components.json** – config Shadcn: style `new-york`, baseColor `neutral`, iconLibrary `lucide`
