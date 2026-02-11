# Guest Link

Plataforma digital para gestión de propiedades y experiencia de huéspedes. Permite a los propietarios crear guías digitales personalizadas y compartirlas con sus huéspedes.

## 🚀 Características

- **Guías Digitales Personalizadas**: Crea guías completas con información de la propiedad, recomendaciones locales, WiFi, reglas y más
- **Vista Dinámica del Huésped**: La vista se adapta según el estado de la reserva (antes del check-in, día de check-in, durante la estadía, después del check-out)
- **Recomendaciones Inteligentes**: Sistema de recomendaciones filtradas por categoría y tiempo del día
- **Gestión de Reservas**: Panel de administración completo para gestionar propiedades y reservas
- **Multi-idioma**: Soporte para español, inglés y portugués
- **Tokens de Acceso**: Sistema seguro de tokens para compartir guías con huéspedes

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: NextAuth 5
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel (recomendado)

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🚦 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd guest-link

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/guestlink

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📁 Estructura del Proyecto

```
guest-link/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [lang]/            # Rutas internacionalizadas
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── admin/             # Componentes del panel admin
│   │   ├── guest/             # Componentes de vista huésped
│   │   └── ui/                # Componentes UI reutilizables
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   └── utils/             # Utilidades compartidas
│   ├── types/                 # Tipos TypeScript
│   └── db/                    # Esquemas de base de datos
├── public/                    # Archivos estáticos
└── tests/                     # Tests (si aplica)
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage
```

Actualmente hay **65 tests** cubriendo:
- Utilidades de fechas y parsing
- Hooks personalizados (`useReservationState`, `useGuestData`)
- Helpers de server actions
- Componentes críticos

## 🏗️ Arquitectura

El proyecto sigue principios de **Atomic Design** y **Separación de Responsabilidades**:

- **Componentes Modulares**: Componentes grandes divididos en módulos más pequeños
- **Hooks Personalizados**: Lógica compleja extraída a hooks reutilizables
- **Server Actions Modulares**: Acciones del servidor organizadas por funcionalidad
- **Utilidades Centralizadas**: Funciones comunes en archivos compartidos

Ver [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) para más detalles.

## 📚 Documentación

- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - Arquitectura y convenciones
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de contribución

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción

# Testing
npm test             # Ejecutar tests
npm run test:watch   # Modo watch
npm run test:coverage # Con coverage

# Base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Drizzle Studio

# Linting
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores automáticamente
```

## 🎯 Funcionalidades Principales

### Panel de Administración

- Gestión de propiedades (crear, editar, eliminar)
- Configuración de guías digitales
- Gestión de reservas
- Sistema de recomendaciones
- Configuración de reglas y acceso
- Pre-check-in instructions

### Vista del Huésped

- Vista adaptativa según estado de reserva
- Información de acceso (códigos, pasos)
- WiFi con QR code
- Recomendaciones filtradas por tiempo del día
- Reglas de la propiedad
- Contacto de emergencia
- Ubicación con Google Maps

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y desplegará

### Otros Proveedores

El proyecto puede desplegarse en cualquier plataforma que soporte Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contribuir

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

## 📝 Licencia

[Especificar licencia]

## 👥 Equipo

[Información del equipo]

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org) - Framework React
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Drizzle ORM](https://orm.drizzle.team) - ORM para TypeScript
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS

---

Hecho con ❤️ para mejorar la experiencia de los huéspedes
