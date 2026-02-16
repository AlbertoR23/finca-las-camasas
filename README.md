# DataVE - Sistema de Gestión de Granja de Búfalos 🐃

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.89.0-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📋 Descripción

Sistema integral para la gestión de granjas de búfalos, permitiendo el control de:

- **Animales**: Registro completo con genealogía y seguimiento individual
- **Producción**: Control diario de leche y peso
- **Salud**: Plan sanitario con vacunas y alertas automáticas
- **Finanzas**: Gestión de ingresos/gastos con conversión USD/BS (tasa BCV)
- **Alertas**: Notificaciones vía Telegram para vacunas vencidas

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con separación clara de capas:

```
/
├── app/                    # Next.js App Router (rutas y páginas)
├── src/
│   ├── core/              # Capa de dominio (entidades, casos de uso)
│   ├── infrastructure/     # Capa de infraestructura (repositorios, servicios)
│   └── presentation/       # Capa de presentación (componentes, hooks)
├── types/                  # Tipos globales TypeScript
├── utils/                  # Utilidades (cliente Supabase)
├── public/                 # Archivos estáticos
├── e2e/                    # Tests end-to-end con Playwright
└── scripts/                # Scripts de utilidad
```

## 🚀 Tecnologías

### Frontend

- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Estilos**: Tailwind CSS 4.1.18
- **Componentes**: Radix UI (accesibilidad)
- **Gráficos**: Recharts 3.6.0
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand + React Query
- **Animaciones**: Framer Motion

### Backend

- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **API**: REST + Supabase Realtime

### Herramientas

- **Lenguaje**: TypeScript 5
- **Linting**: ESLint 9
- **Formateo**: Prettier
- **Testing**: Jest + Playwright
- **Git Hooks**: Husky + lint-staged

## 📦 Instalación

### Prerrequisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Cuenta en Supabase
- (Opcional) Bot de Telegram

### Pasos de instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tuusuario/finca-bufalos-datave.git
cd finca-bufalos-datave
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Configurar Supabase**

```bash
# Generar tipos de TypeScript desde Supabase
npm run db:generate

# (Opcional) Ejecutar seed de datos de prueba
npm run db:seed
```

5. **Iniciar en desarrollo**

```bash
npm run dev
# Abrir http://localhost:3000
```

## 🔧 Configuración

### Variables de entorno (`.env.local`)

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# Telegram (opcional - para alertas)
TELEGRAM_BOT_TOKEN=tu_token_de_telegram
TELEGRAM_CHAT_ID=tu_chat_id_de_telegram
```

### Scripts disponibles

| Comando                 | Descripción                                 |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Inicia servidor de desarrollo con Turbopack |
| `npm run build`         | Construye para producción                   |
| `npm run start`         | Inicia servidor de producción               |
| `npm run lint`          | Ejecuta ESLint                              |
| `npm run format`        | Formatea código con Prettier                |
| `npm run type-check`    | Verifica tipos TypeScript                   |
| `npm run test`          | Ejecuta tests unitarios                     |
| `npm run test:e2e`      | Ejecuta tests end-to-end                    |
| `npm run test:coverage` | Genera reporte de cobertura                 |
| `npm run analyze`       | Analiza tamaño del bundle                   |
| `npm run validate`      | Valida todo (types + lint + tests)          |

## 🧪 Testing

### Tests unitarios (Jest)

```bash
npm run test           # Ejecutar tests
npm run test:watch    # Modo watch
npm run test:coverage # Reporte de cobertura
```

### Tests end-to-end (Playwright)

```bash
npm run test:e2e       # Ejecutar E2E tests
npm run test:e2e:ui    # Modo interactivo
```

## 📁 Estructura de Archivos Detallada

```
finca-bufalos-datave/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── bcv/                   # Endpoint tasa BCV
│   │   └── telegram/               # Webhook Telegram
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Página principal (delgada)
├── src/
│   ├── core/                       # Capa de dominio
│   │   ├── entities/               # Entidades del negocio
│   │   ├── use-cases/              # Casos de uso
│   │   └── repositories/           # Interfaces de repositorio
│   ├── infrastructure/              # Capa de infraestructura
│   │   ├── repositories/           # Implementaciones (Supabase)
│   │   ├── services/               # Servicios externos
│   │   └── config/                 # Configuración
│   └── presentation/                # Capa de presentación
│       ├── components/              # Componentes UI
│       ├── hooks/                   # Custom hooks
│       ├── pages/                   # Páginas
│       └── styles/                  # Estilos
├── types/                           # Tipos globales
├── utils/                           # Utilidades
├── e2e/                             # Tests E2E
├── scripts/                          # Scripts de utilidad
├── public/                           # Archivos estáticos
├── .env.example                      # Ejemplo variables entorno
├── .eslintrc.json                    # Configuración ESLint
├── .prettierrc                       # Configuración Prettier
├── jest.config.js                    # Configuración Jest
├── playwright.config.ts              # Configuración Playwright
└── package.json                      # Dependencias
```

## 🔍 Validación del Proyecto

Para verificar que todo está correctamente configurado:

```bash
# 1. Verificar tipos TypeScript
npm run type-check

# 2. Ejecutar linter
npm run lint

# 3. Ejecutar tests
npm run test

# 4. Todo junto
npm run validate
```

## 🚀 Despliegue

### Vercel (recomendado)

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE)

## 📧 Contacto

Tu Nombre - [@tuitter](https://twitter.com/tuitter) - email@ejemplo.com

Link del proyecto: [https://github.com/tuusuario/finca-bufalos-datave](https://github.com/tuusuario/finca-bufalos-datave)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
