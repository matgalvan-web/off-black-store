# OFF-BLACK Store

Tienda online de indumentaria construida con Next.js 14, Supabase y MercadoPago.

## Tecnologías

- **Next.js 14** — App Router, rutas dinámicas, API Routes
- **React 18** — Context API para auth y carrito
- **Supabase** — base de datos PostgreSQL, autenticación, Row Level Security
- **MercadoPago** — integración de pagos (sandbox)
- **CSS** — estilos globales, diseño responsive

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)

## Instalación local

```bash
# 1. Clonar el repo y entrar a la carpeta
cd off-black-store

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env.local
# Completar los valores en .env.local

# 4. Configurar la base de datos (ver SUPABASE_SETUP.md)

# 5. Iniciar el servidor de desarrollo
npm run dev
```

La app corre en `http://localhost:3000`.

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
MP_ACCESS_TOKEN=<access-token-de-mercadopago>
```

Las variables `NEXT_PUBLIC_*` son accesibles desde el navegador. `SUPABASE_SERVICE_ROLE_KEY` y `MP_ACCESS_TOKEN` solo se usan en el servidor.

## Estructura del proyecto

```
off-black-store/
├── app/
│   ├── api/                    # API Routes (servidor)
│   │   ├── register/           # POST /api/register
│   │   ├── create-order/       # POST /api/create-order
│   │   ├── create-preference/  # POST /api/create-preference
│   │   ├── seed-products/      # POST /api/seed-products
│   │   ├── admin/
│   │   │   ├── orders/         # GET /api/admin/orders
│   │   │   │   └── [id]/       # PATCH, DELETE /api/admin/orders/[id]
│   │   │   └── products/       # GET, POST /api/admin/products
│   │   │       └── [id]/       # PATCH, DELETE /api/admin/products/[id]
│   │   └── pagos/
│   │       ├── confirmar/      # POST /api/pagos/confirmar
│   │       └── webhook/        # POST /api/pagos/webhook
│   ├── components/             # Componentes React
│   ├── context/                # AuthContext, CartContext
│   ├── data/                   # productos.js (fuente local)
│   ├── historia/               # Página /historia
│   ├── pago/                   # Páginas de resultado de pago
│   │   ├── exitoso/
│   │   ├── fallido/
│   │   └── pendiente/
│   ├── producto/[id]/          # Página de detalle de producto
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── supabaseClient.js       # Inicialización del cliente Supabase
│   └── supabaseOperations.js   # Funciones de base de datos
├── supabase/
│   └── seed_products.sql       # Datos iniciales de productos
├── database_setup.sql          # Schema completo con RLS
├── SUPABASE_SETUP.md           # Guía de configuración de Supabase
└── .env.example                # Plantilla de variables de entorno
```

## Funcionalidades

- Catálogo de productos con búsqueda en tiempo real
- Carrito de compras persistente (localStorage)
- Autenticación de usuarios (registro e inicio de sesión)
- Selección de color y talle por producto
- Checkout con datos de envío
- Integración completa con MercadoPago (sandbox y producción)
- Páginas de resultado de pago (exitoso, fallido, pendiente)
- Panel de administración con gestión de órdenes y CRUD completo de productos
- Roles de usuario (cliente / admin) con Row Level Security en Supabase
- Webhook para actualización automática del estado de órdenes

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/register` | Registra un nuevo usuario en Supabase Auth y crea su perfil |
| POST | `/api/create-order` | Crea una orden con los ítems del carrito |
| POST | `/api/create-preference` | Genera una preferencia de pago en MercadoPago |
| POST | `/api/pagos/confirmar` | Confirma el pago con MercadoPago y actualiza la orden |
| POST | `/api/pagos/webhook` | Webhook para notificaciones de MercadoPago |
| GET | `/api/admin/orders` | Lista todas las órdenes (solo admin) |
| PATCH | `/api/admin/orders/[id]` | Actualiza el estado de una orden (solo admin) |
| DELETE | `/api/admin/orders/[id]` | Elimina una orden (solo admin) |
| GET | `/api/admin/products` | Lista todos los productos de Supabase (solo admin) |
| POST | `/api/admin/products` | Crea un nuevo producto (solo admin) |
| PATCH | `/api/admin/products/[id]` | Edita un producto existente (solo admin) |
| DELETE | `/api/admin/products/[id]` | Elimina un producto (solo admin) |

Los endpoints `/api/admin/*` usan el cliente Supabase con `SUPABASE_SERVICE_ROLE_KEY` para saltear las políticas RLS y operar como superusuario. Solo son accesibles desde el servidor (API Routes de Next.js).

## Flujo de pago

1. El usuario agrega productos al carrito (guardado en localStorage)
2. En el checkout ingresa nombre, dirección y teléfono
3. Se crea la orden en Supabase con estado `pending`
4. Se genera una preferencia en MercadoPago y se redirige al usuario
5. El usuario completa el pago en el checkout seguro de MercadoPago
6. MercadoPago redirige a `/pago/exitoso`, `/pago/fallido` o `/pago/pendiente`
7. La página de éxito llama a `/api/pagos/confirmar` para actualizar el estado de la orden a `paid`
8. MercadoPago también notifica al webhook `/api/pagos/webhook` como confirmación adicional

## Deploy en Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com)
2. Configurar las variables de entorno en **Settings → Environment Variables**
3. Vercel detecta Next.js automáticamente y hace el deploy

Cada push a `main` genera un deploy automático. Cada PR genera una URL de preview.

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm start        # Servidor de producción
npm run lint     # Verificar errores de código
```

## Base de datos

Ver [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para instrucciones detalladas de configuración de tablas, políticas RLS y datos iniciales.
