# Arquitectura de Componentes

Este documento describe la arquitectura, convenciones y patrones de diseño utilizados en el proyecto Guest Link.

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── [lang]/            # Rutas internacionalizadas
│   └── api/               # API routes
├── components/
│   ├── admin/             # Componentes del panel de administración
│   │   ├── GuestViewModal/    # Modal de vista del huésped (modularizado)
│   │   └── ReservationDetailCard/  # Card de detalle de reserva (modularizado)
│   ├── guest/             # Componentes de la vista del huésped
│   │   ├── modules/       # Módulos específicos (WifiCard, CheckInAccess, etc.)
│   │   └── views/         # Vistas principales
│   └── ui/                # Componentes UI reutilizables (shadcn/ui)
├── hooks/                 # Custom hooks
├── lib/
│   ├── actions/           # Server actions
│   │   └── properties/    # Acciones de propiedades (modularizado)
│   └── utils/             # Utilidades compartidas
├── types/                 # Definiciones de tipos TypeScript
└── db/                    # Esquemas y configuración de base de datos
```

## Principios de Diseño

### 1. Atomic Design

Los componentes siguen principios de diseño atómico:

- **Átomos**: Componentes básicos reutilizables (`Button`, `Input`, etc.)
- **Moléculas**: Combinaciones simples de átomos (`ContactSection`, `TokenSection`)
- **Organismos**: Componentes complejos (`GuestViewModal`, `ReservationDetailCard`)
- **Templates**: Layouts y estructuras de página
- **Pages**: Páginas completas

### 2. Separación de Responsabilidades

Cada componente tiene una responsabilidad única:

- **UI Components**: Solo renderizado y presentación
- **Hooks**: Lógica de estado y efectos
- **Server Actions**: Lógica del servidor y acceso a datos
- **Utils**: Funciones puras y helpers

### 3. Modularización

Los componentes grandes se dividen en módulos más pequeños:

```
GuestViewModal/
├── helpers.ts              # Utilidades (formatDate, getAccessCode, etc.)
├── types.ts                # Tipos compartidos
├── useGuestViewModal.ts    # Hook con lógica del modal
├── ContactSection.tsx      # Sección de contacto
├── TokenSection.tsx        # Sección de token
├── ShareMessageSection.tsx # Sección de mensaje
├── GuestViewContent.tsx    # Contenido principal
└── index.tsx               # Componente principal (orquestador)
```

## Convenciones de Naming

### Archivos y Carpetas

- **Componentes**: PascalCase (`GuestViewModal.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useReservationState.ts`)
- **Utils**: camelCase (`dates.ts`, `guest-info.ts`)
- **Types**: camelCase (`types.ts`, `dtos.ts`)
- **Server Actions**: camelCase (`properties.ts`, `reservations.ts`)

### Componentes React

- **Componentes funcionales**: PascalCase
- **Props interfaces**: `ComponentNameProps`
- **Hooks personalizados**: `use` + PascalCase

### Ejemplo:

```typescript
// Componente
export function GuestViewModal({ ... }: GuestViewModalProps) { ... }

// Hook
export function useReservationState({ ... }: UseReservationStateProps) { ... }

// Props
interface GuestViewModalProps { ... }
```

## Patrones de Diseño

### 1. Custom Hooks para Lógica Compleja

Cuando un componente tiene lógica compleja, se extrae a un hook:

```typescript
// ❌ Antes: Lógica en el componente
function GuestViewModal() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  // ... mucha lógica
}

// ✅ Después: Lógica en hook
function GuestViewModal() {
  const { token, email, setEmail, ... } = useGuestViewModal({ ... });
}
```

### 2. Memoización para Rendimiento

Componentes que renderizan listas grandes usan `React.memo` y `useMemo`:

```typescript
export const RecommendationsDetail = memo(function RecommendationsDetail({ ... }) {
  const filteredRecommendations = useMemo(() => {
    return recommendations?.filter(r => r.categoryType === activeCategory) || [];
  }, [recommendations, activeCategory]);
  
  // ...
});
```

### 3. Server Actions Modulares

Las server actions grandes se dividen en módulos especializados:

```
properties/
├── helpers.ts      # Funciones auxiliares compartidas
├── get.ts          # Funciones de lectura
├── create.ts       # Creación de propiedades
├── update.ts       # Actualización
├── delete.ts       # Eliminación
└── index.ts        # Re-exportaciones (compatibilidad)
```

### 4. Utilidades Centralizadas

Funciones comunes se centralizan en archivos de utilidades:

```typescript
// src/lib/utils/dates.ts
export function parseDate(dateStr: string): Date | null { ... }
export function formatReservationDate(dateStr: string): string { ... }
export function getTimeBasedGreeting(): string { ... }
```

## Estructura de Componentes

### Componente Simple

```typescript
"use client";

import { cn } from "@/lib/utils";

interface ComponentProps {
  title: string;
  className?: string;
}

export function Component({ title, className }: ComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h1>{title}</h1>
    </div>
  );
}
```

### Componente con Estado

```typescript
"use client";

import { useState, useMemo } from "react";

interface ComponentProps {
  items: Item[];
}

export function Component({ items }: ComponentProps) {
  const [filter, setFilter] = useState("");
  
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {filteredItems.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}
```

### Componente con Hook Personalizado

```typescript
"use client";

import { useCustomHook } from "@/hooks/useCustomHook";

interface ComponentProps {
  id: number;
}

export function Component({ id }: ComponentProps) {
  const { data, loading, error } = useCustomHook(id);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data.name}</div>;
}
```

## Manejo de Estado

### Estado Local

Para estado simple del componente:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Estado Compartido (Context)

Para estado compartido entre componentes:

```typescript
// Crear contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para usar contexto
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

### Server State (Server Actions)

Para datos del servidor:

```typescript
"use server";

export async function getProperty(id: number) {
  // Lógica del servidor
  return { success: true, data: property };
}
```

## Testing

### Estructura de Tests

Los tests se ubican junto a los archivos que prueban:

```
src/
├── hooks/
│   ├── useReservationState.ts
│   └── useReservationState.test.ts
├── lib/
│   └── utils/
│       ├── dates.ts
│       └── dates.test.ts
```

### Convenciones de Testing

- Usar `describe` para agrupar tests relacionados
- Usar `it` o `test` para casos individuales
- Nombres descriptivos: `should return X when Y`
- Usar mocks para dependencias externas

```typescript
import { describe, it, expect } from "vitest";
import { formatDate } from "./dates";

describe("formatDate", () => {
  it("should format valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("15");
  });
  
  it("should return original string for invalid date", () => {
    const result = formatDate("invalid");
    expect(result).toBe("Invalid Date");
  });
});
```

## Mejores Prácticas

### 1. TypeScript

- ✅ Usar tipos explícitos para props
- ✅ Evitar `any` (usar `unknown` si es necesario)
- ✅ Usar interfaces para objetos complejos
- ✅ Usar tipos union para valores específicos

### 2. Performance

- ✅ Usar `React.memo` para componentes que reciben props estables
- ✅ Usar `useMemo` para cálculos costosos
- ✅ Usar `useCallback` para funciones pasadas como props
- ✅ Evitar crear objetos/arrays en el render

### 3. Accesibilidad

- ✅ Usar elementos semánticos HTML
- ✅ Agregar `aria-label` cuando sea necesario
- ✅ Manejar estados de focus
- ✅ Soporte para teclado

### 4. Código Limpio

- ✅ Eliminar código comentado
- ✅ Eliminar `console.log` de debug en producción
- ✅ Mantener funciones pequeñas y enfocadas
- ✅ Usar nombres descriptivos

## Migración y Refactorización

### Componentes Refactorizados

Los siguientes componentes grandes fueron refactorizados en módulos más pequeños:

1. **`properties.ts`** (840 líneas → módulos)
   - `helpers.ts` - Utilidades compartidas
   - `get.ts` - Funciones de lectura
   - `create.ts` - Creación
   - `update.ts` - Actualización
   - `delete.ts` - Eliminación

2. **`GuestViewModal.tsx`** (804 líneas → módulos)
   - `helpers.ts` - Utilidades
   - `useGuestViewModal.ts` - Hook con lógica
   - `ContactSection.tsx` - Sección de contacto
   - `TokenSection.tsx` - Sección de token
   - `ShareMessageSection.tsx` - Sección de mensaje

3. **`ReservationDetailCard.tsx`** (771 líneas → módulos)
   - `helpers.ts` - Utilidades
   - `Header.tsx` - Header
   - `DatesCard.tsx` - Card de fechas
   - `ContactCard.tsx` - Card de contacto
   - `PaymentCard.tsx` - Card de pagos
   - Y más...

### Mantener Compatibilidad

Los archivos principales mantienen re-exportaciones para compatibilidad hacia atrás:

```typescript
// properties.ts
export { getProperty, createProperty, ... } from "./properties/get";
```

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/)

