# OFF-BLACK Store - Next.js

Tienda online de OFF-BLACK migrada a Next.js 14 con App Router.

## 🚀 Instalación

```bash
cd off-black-store
npm install
npm run dev
```

## 📁 Estructura

```
off-black-store/
├── app/
│   ├── components/     # Componentes React
│   │   ├── Header.js
│   │   ├── Hero.js
│   │   ├── FeaturedCollections.js
│   │   ├── Lookbook.js
│   │   ├── Productos.js
│   │   ├── ProductModal.js
│   │   └── Footer.js
│   ├── data/           # Datos de productos
│   │   └── productos.js
│   ├── globals.css     # Estilos globales
│   ├── layout.js       # Layout raíz
│   └── page.js         # Página principal
├── public/
│   └── Imagenes/       # Imágenes del proyecto
├── package.json
└── next.config.js
```

## 🛠️ Tecnologías

- **Next.js 14** - App Router
- **React 18**
- **CSS** - Estilos globales con diseño industrial oscuro

## ⚙️ Scripts

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm start` - Iniciar servidor de producción