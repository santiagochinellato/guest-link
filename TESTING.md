# Guía de Testing

Esta guía describe la estrategia de testing del proyecto Guest Link.

## Configuración

El proyecto usa **Vitest** como test runner y **Testing Library** para testing de componentes React.

### Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con coverage
npm run test:coverage

# UI interactiva
npm run test:ui
```

## Estructura de Tests

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
└── components/
    └── guest/
        └── modules/
            ├── WifiCard.tsx
            └── WifiCard.test.tsx
```

## Cobertura Actual

### Tests Implementados

- ✅ **Utilidades de fechas** (`dates.test.ts`) - 16 tests
- ✅ **Hooks personalizados**:
  - `useReservationState.test.ts` - 17 tests
  - `useGuestData.test.ts` - 13 tests
- ✅ **Helpers de propiedades** (`helpers.test.ts`) - 9 tests
- ✅ **Helpers de GuestViewModal** (`helpers.test.ts`) - 10 tests
- ✅ **Componentes críticos**:
  - `CheckInAccess.test.tsx` - 7 tests
  - `WifiCard.test.tsx` - 9 tests
- ✅ **Utils adicionales**:
  - `guest-info.test.ts` - 7 tests
  - `ReservationDetailCard/helpers.test.ts` - 8 tests

**Total: 99 tests** ✅

### Thresholds de Cobertura

El proyecto tiene thresholds mínimos configurados:

- **Lines**: 60%
- **Functions**: 60%
- **Branches**: 50%
- **Statements**: 60%

## Escribir Nuevos Tests

### Test de Utilidad

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "./my-utils";

describe("myFunction", () => {
  it("should return expected value for valid input", () => {
    const result = myFunction("input");
    expect(result).toBe("expected");
  });

  it("should handle edge cases", () => {
    const result = myFunction("");
    expect(result).toBeNull();
  });
});
```

### Test de Hook

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMyHook } from "./useMyHook";

describe("useMyHook", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe("initial");
  });
});
```

### Test de Componente

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should handle user interactions", () => {
    render(<MyComponent />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

## Mocks y Stubs

### Mock de Módulos

```typescript
import { vi } from "vitest";

vi.mock("./my-module", () => ({
  myFunction: vi.fn(() => "mocked"),
}));
```

### Mock de APIs

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "test" }),
  })
);
```

### Mock de Hooks de Next.js

```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
```

## CI/CD

### GitHub Actions

El proyecto tiene dos workflows de CI:

1. **`.github/workflows/ci.yml`**: Tests y build en cada push/PR
2. **`.github/workflows/test-coverage.yml`**: Reporte de coverage

### Coverage Reports

Los reports de coverage se generan en:
- `coverage/lcov.info` - Para Codecov
- `coverage/html/` - Reporte HTML local

## Mejores Prácticas

### 1. Nombres Descriptivos

```typescript
// ✅ Bueno
it("should return formatted date for valid ISO string", () => { ... });

// ❌ Malo
it("test formatDate", () => { ... });
```

### 2. Un Test, Una Aserción (cuando sea posible)

```typescript
// ✅ Bueno
it("should format date correctly", () => {
  const result = formatDate("2024-01-15");
  expect(result).toContain("15");
  expect(result).toContain("ene");
});

// ❌ Malo (múltiples casos en un test)
it("should handle all date formats", () => {
  expect(formatDate("2024-01-15")).toBe("...");
  expect(formatDate("2024-12-25")).toBe("...");
  // ...
});
```

### 3. Usar `describe` para Agrupar

```typescript
describe("formatDate", () => {
  describe("valid dates", () => {
    it("should format ISO strings", () => { ... });
    it("should format date objects", () => { ... });
  });

  describe("invalid dates", () => {
    it("should return original string", () => { ... });
  });
});
```

### 4. Limpiar Después de Tests

```typescript
import { beforeEach, afterEach } from "vitest";

beforeEach(() => {
  // Setup
});

afterEach(() => {
  // Cleanup
  vi.clearAllMocks();
});
```

## Debugging Tests

### Modo Watch

```bash
npm run test:watch
```

### UI Interactiva

```bash
npm run test:ui
```

### Ejecutar Test Específico

```bash
npm test -- CheckInAccess
```

### Verbose Output

```bash
npm test -- --reporter=verbose
```

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

