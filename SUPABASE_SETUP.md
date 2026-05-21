# Guía de Configuración de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa los datos:
   - Name: `off-black-store`
   - Password: (guarda esta contraseña)
   - Region: (elige la más cercana a ti)
5. Espera a que el proyecto se cree

## Paso 2: Obtener Credenciales

1. En el panel de Supabase, ve a "Settings" > "API"
2. Copia `Project URL` y `anon public key`
3. Reemplaza en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=TU_PROJECT_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
   ```

> En el servidor se acepta también `SUPABASE_URL` como nombre de variable.
> Usa la `SERVICE_ROLE_KEY` solo en el servidor. Nunca la expongas en el frontend.

## Paso 3: Crear Tablas

Ve a "SQL Editor" en Supabase y ejecuta estos queries:

### Tabla de Usuarios
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Tabla de Productos
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  imagen TEXT,
  colores JSONB DEFAULT '[]',
  talles TEXT[] DEFAULT ARRAY[]::TEXT[],
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);
```

### Tabla de Carrito
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  color VARCHAR(100),
  size VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);
```

### Tabla de Órdenes
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Paso 4: Insertar Productos de Ejemplo

Si tienes datos existentes de productos, puedes insertarlos aquí. Ejemplo:

```sql
INSERT INTO products (nombre, descripcion, precio, imagen, colores, talles, stock) VALUES
('Remera Negra', 'Remera clásica OFF-BLACK', 45.99, 'https://...', '["Negro", "Blanco"]', ARRAY['S', 'M', 'L', 'XL'], 50),
('Pantalón Cargo', 'Pantalón cargo de calidad', 89.99, 'https://...', '["Negro"]', ARRAY['28', '30', '32', '34', '36'], 30);
```

## Paso 5: Verificar Conexión

1. Copia las credenciales en `.env.local`
2. Reinicia el servidor: `npm run dev`
3. La autenticación debería usar Supabase automáticamente

## Estructura de Datos

- **users**: Almacena información de usuarios autenticados
- **products**: Catálogo de productos con colores y talles
- **cart_items**: Carrito de compra del usuario
- **orders**: Historial de órdenes realizadas

## Row Level Security (RLS)

Las políticas de seguridad aseguran que:
- Los usuarios solo vean sus propios datos
- Solo puedan acceder a información autorizada
- Las lecturas públicas de productos estén permitidas

## Notas Importantes

- Las credenciales `NEXT_PUBLIC_SUPABASE_*` son públicas (por eso empiezan con `NEXT_PUBLIC_`)
- No guardes credenciales secretas en archivos públicos
- Los usuarios se autentican directamente con Supabase Auth
- Las contraseñas se almacenan de forma segura en Supabase

## Pasos Siguientes

1. Completa `.env.local` con tus credenciales
2. Crea las tablas en Supabase
3. Inserta datos de productos
4. Prueba la autenticación en la app
