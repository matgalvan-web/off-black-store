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
│   │   └── seed-products/      # POST /api/seed-products
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

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/register` | Registra un nuevo usuario en Supabase Auth y crea su perfil |
| POST | `/api/create-order` | Crea una orden con los ítems del carrito y limpia el carrito |
| POST | `/api/create-preference` | Genera una preferencia de pago en MercadoPago |
| POST | `/api/seed-products` | Carga los productos locales en la base de datos |

## Flujo de pago

1. El usuario agrega productos al carrito (guardado en localStorage)
2. En el checkout ingresa nombre, dirección y teléfono
3. Se crea la orden en Supabase con estado `pending`
4. Se genera una preferencia en MercadoPago y se redirige al usuario
5. MercadoPago redirige a `/pago/exitoso`, `/pago/fallido` o `/pago/pendiente`

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
