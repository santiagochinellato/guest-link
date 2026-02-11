# Guía de Contribución

Gracias por tu interés en contribuir a Guest Link. Esta guía te ayudará a entender cómo contribuir de manera efectiva.

## Configuración del Entorno

### Requisitos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd guest-link

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

## Flujo de Trabajo

### 1. Crear una Rama

```bash
git checkout -b feature/nombre-de-la-funcionalidad
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer Cambios

- Sigue las convenciones de código (ver `COMPONENT_ARCHITECTURE.md`)
- Escribe tests para nuevas funcionalidades
- Asegúrate de que todos los tests pasen: `npm test`
- Verifica que no haya errores de linter: `npm run lint`

### 3. Commits

Usa mensajes de commit descriptivos:

```bash
git commit -m "feat: agregar componente WifiCard"
git commit -m "fix: corregir parsing de fechas en CheckInAccess"
git commit -m "refactor: modularizar GuestViewModal"
```

**Convenciones de commits:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `chore:` Tareas de mantenimiento

### 4. Push y Pull Request

```bash
git push origin feature/nombre-de-la-funcionalidad
```

Luego crea un Pull Request en GitHub con:
- Descripción clara de los cambios
- Referencias a issues relacionados (si aplica)
- Screenshots (si hay cambios visuales)

## Estándares de Código

### TypeScript

- Usa tipos explícitos, evita `any`
- Define interfaces para props de componentes
- Usa tipos union para valores específicos

```typescript
// ✅ Bueno
interface ButtonProps {
  label: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}

// ❌ Malo
function Button(props: any) { ... }
```

### React

- Usa componentes funcionales
- Extrae lógica compleja a hooks personalizados
- Usa `React.memo` para componentes que renderizan listas grandes
- Usa `useMemo`` y `useCallback` cuando sea apropiado

```typescript
// ✅ Bueno
export const Component = memo(function Component({ items }: Props) {
  const filtered = useMemo(() => items.filter(...), [items]);
  return <div>{filtered.map(...)}</div>;
});

// ❌ Malo
export function Component({ items }: Props) {
  return <div>{items.filter(...).map(...)}</div>;
}
```

### Estilos

- Usa Tailwind CSS para estilos
- Usa `cn()` para combinar clases condicionalmente
- Mantén estilos consistentes con el design system

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-styles",
  isActive && "active-styles",
  className
)}>
```

## Testing

### Escribir Tests

- Tests para utilidades y hooks son obligatorios
- Tests para componentes complejos son recomendados
- Usa nombres descriptivos: `should return X when Y`

```typescript
describe("formatDate", () => {
  it("should format valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("15");
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

## Estructura de Archivos

### Nuevos Componentes

```
src/components/
└── feature/
    ├── ComponentName.tsx
    ├── ComponentName.test.tsx
    └── types.ts (si es necesario)
```

### Nuevos Hooks

```
src/hooks/
├── useHookName.ts
└── useHookName.test.ts
```

### Nuevas Utilidades

```
src/lib/utils/
├── utility-name.ts
└── utility-name.test.ts
```

## Code Review

### Antes de Solicitar Review

- [ ] Todos los tests pasan
- [ ] No hay errores de linter
- [ ] El código sigue las convenciones
- [ ] Se agregaron tests para nuevas funcionalidades
- [ ] La documentación está actualizada (si aplica)

### Durante el Review

- Sé receptivo a feedback
- Explica decisiones de diseño si es necesario
- Haz cambios solicitados de manera oportuna

## Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado ya
2. Intenta reproducir el bug en la última versión
3. Recolecta información relevante

### Template de Bug Report

```markdown
**Descripción**
Descripción clara del bug

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento Esperado**
Qué debería pasar

**Comportamiento Actual**
Qué pasa actualmente

**Screenshots**
Si aplica

**Entorno**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 1.0.0]
```

## Solicitar Funcionalidades

### Template de Feature Request

```markdown
**Problema que Resuelve**
Descripción del problema

**Solución Propuesta**
Cómo debería funcionar

**Alternativas Consideradas**
Otras soluciones consideradas

**Contexto Adicional**
Cualquier otra información relevante
```

## Preguntas

Si tienes preguntas, puedes:
- Abrir un issue con la etiqueta `question`
- Contactar al equipo de desarrollo

## Recursos

- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - Arquitectura del proyecto
- [README.md](./README.md) - Documentación principal
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)

¡Gracias por contribuir! 🎉

