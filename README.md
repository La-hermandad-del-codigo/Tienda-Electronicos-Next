# Tienda Electrónicos Next

> E-commerce de electrónica construido con **Next.js 15+**, **TypeScript** y **Supabase**, desplegado en **Vercel**.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Directorios](#estructura-de-directorios)
- [Módulos y Componentes](#módulos-y-componentes)
- [Base de Datos (Supabase)](#base-de-datos-supabase)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo Local](#desarrollo-local)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Repositorio](#repositorio)

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | ^16.x |
| Lenguaje | TypeScript | ^5.9 |
| UI | React 19 + Lucide Icons | ^19.x |
| BaaS / DB | [Supabase](https://supabase.com) (PostgreSQL + Auth) | ^2.97 |
| SSR Auth | `@supabase/ssr` | ^0.8 |
| Linting | ESLint + `eslint-config-next` | ^9.x |
| Despliegue | [Vercel](https://vercel.com) | — |

---

## Arquitectura del Proyecto

```
Browser → Vercel Edge (Next.js App Router)
              │
              ├─ Server Components  ──────────────→ Supabase (PostgreSQL)
              │      (fetching, auth validation)          │
              │                                           ├─ Tabla: products
              └─ Client Components  ←── React Hooks       ├─ Tabla: orders
                    (cart, checkout,                      ├─ Tabla: order_items
                     toast, scroll)                       └─ Auth (email/password)
```

- **App Router**: Todas las rutas están bajo `src/app/`. Cada segmento de ruta puede contener `page.tsx` como componente de servidor.
- **Autenticación SSR**: Se usa `@supabase/ssr` para manejar sesiones seguras con cookies en el servidor.
- **Estado global del carrito**: Gestionado con Context API a través de `CartContext`.
- **Persistencia local**: El carrito se persiste en `localStorage` para usuarios no autenticados.

---

## Estructura de Directorios

```
src/
├── app/                     # Rutas (App Router)
│   ├── page.tsx             # Página principal / catálogo
│   ├── layout.tsx           # Layout raíz (fuentes, providers)
│   ├── admin/               # Panel de administración
│   ├── auth/                # Callbacks de autenticación
│   ├── login/               # Página de login / registro
│   ├── orders/              # Historial de pedidos del usuario
│   └── comerciante/         # Vista de comerciante
│
├── components/
│   ├── cart/
│   │   ├── CartDrawer.tsx        # Panel lateral del carrito
│   │   └── PaymentGateway.tsx    # Flujo de pago simulado
│   ├── layout/
│   │   └── Navbar.tsx            # Barra de navegación
│   ├── products/
│   │   ├── ProductCard.tsx       # Tarjeta de producto individual
│   │   └── ProductGrid.tsx       # Grid de productos con infinite scroll
│   └── ui/
│       ├── AdminRegisterModal.tsx # Modal de registro de admin
│       ├── ConfirmDialog.tsx      # Diálogo de confirmación genérico
│       ├── EmptyState.tsx         # Estado vacío reutilizable
│       ├── Modal.tsx              # Modal base
│       ├── ProcessIndicator.tsx   # Indicador de procesos en curso
│       ├── SkeletonCard.tsx       # Skeleton loader para productos
│       └── Toast.tsx              # Notificaciones toast
│
├── contexts/
│   └── CartContext.tsx       # Context + Provider del carrito
│
├── hooks/
│   ├── useCart.ts            # Lógica de carrito (add, remove, clear)
│   ├── useCheckout.ts        # Flujo de checkout y creación de orden
│   ├── useInfiniteScroll.ts  # Paginación por scroll infinito
│   ├── useOrderHistory.ts    # Consulta del historial de pedidos
│   ├── useProducts.ts        # Fetching y filtrado de productos
│   └── useToast.ts           # Estado y control de notificaciones
│
├── lib/
│   └── supabase/             # Cliente de Supabase (browser + server)
│
├── types/
│   └── index.ts              # Tipos globales (Product, Order, etc.)
│
└── utils/
    ├── checkoutPanel.ts      # Helpers para el panel de checkout
    ├── idGenerator.ts        # Generador de IDs únicos
    └── localStorage.ts       # Wrappers para localStorage
```

---

## Módulos y Componentes

### Autenticación
- Login y registro de usuarios con **Supabase Auth** (email/password).
- Acceso al perfil de administrador mediante modal protegido (`AdminRegisterModal`).
- Rutas protegidas validadas en servidor con `@supabase/ssr`.

### Catálogo y Productos
- `useProducts`: Fetching de productos desde Supabase con soporte de filtrado por búsqueda.
- `useInfiniteScroll`: Carga paginada de productos al hacer scroll.
- `SkeletonCard`: Loaders de esqueleto mientras se cargan los datos.

### Carrito de Compras
- `CartContext` + `useCart`: Añadir, eliminar y limpiar productos. Cantidad por producto.
- `CartDrawer`: Panel lateral animado con resumen del carrito.
- Persistencia en `localStorage` para sesiones sin autenticación.

### Checkout y Pagos
- `useCheckout`: Crea las órdenes en Supabase (`orders` + `order_items`).
- `PaymentGateway`: Simula el flujo de pasarela de pago con validación de datos de tarjeta.
- Solo usuarios autenticados pueden completar una compra.

### Historial de Pedidos
- `useOrderHistory`: Consulta las órdenes del usuario autenticado con sus items.
- Vista en `/orders` para que el usuario revise su historial completo.

---

## Base de Datos (Supabase)

El proyecto utiliza **PostgreSQL** gestionado por Supabase. Las migraciones de esquema relevantes se encuentran en los archivos `.sql` en la raíz del proyecto:

| Archivo | Descripción |
|---|---|
| `role_system_update.sql` | Sistema de roles (usuario, admin, comerciante) |
| `supabase_comments_schema.sql` | Esquema de comentarios de productos |

### Tablas principales

| Tabla | Descripción |
|---|---|
| `products` | Catálogo de productos electrónicos |
| `orders` | Órdenes de compra por usuario |
| `order_items` | Ítems de cada orden (producto, cantidad, precio) |

### Row Level Security (RLS)
Todas las tablas tienen **RLS habilitado** en Supabase. Los usuarios solo pueden leer y modificar sus propios datos. Los administradores tienen acceso extendido según el sistema de roles.

---

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

> **Nota:** Las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente (browser). Nunca agregues claves de servicio (`service_role`) con ese prefijo.

---

## Desarrollo Local

### Requisitos

- Node.js **>= 18.x**
- npm **>= 9.x**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/La-hermandad-del-codigo/Tienda-Electronicos-Next.git
cd Tienda-Electronicos-Next

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo en http://localhost:3000
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción (requiere build previo)
npm run lint     # Ejecutar ESLint
```

---

## Despliegue en Vercel

El proyecto está configurado para despliegue automático en **Vercel** desde la rama principal.

### Pasos para configurar el despliegue

1. Importar el repositorio en [vercel.com/new](https://vercel.com/new).
2. Configurar las variables de entorno en **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vercel detecta automáticamente Next.js y aplica la configuración óptima.
4. Cada push a `main` dispara un nuevo despliegue de producción.

> El framework preset de Vercel para Next.js gestiona automáticamente las **Edge Functions**, **SSR** y el **CDN** para assets estáticos.

---

## Repositorio

- **GitHub**: [La-hermandad-del-codigo/Tienda-Electronicos-Next](https://github.com/La-hermandad-del-codigo/Tienda-Electronicos-Next)
- **Issues**: [Reportar un bug](https://github.com/La-hermandad-del-codigo/Tienda-Electronicos-Next/issues)
