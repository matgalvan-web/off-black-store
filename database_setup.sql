
-- CREACIÓN DE TABLAS PARA OFF-BLACK STORE

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ============================================================

-- 2. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
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

-- ============================================================

-- 3. TABLA DE CARRITO
CREATE TABLE IF NOT EXISTS cart_items (
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

-- ============================================================

-- 4. TABLA DE ÓRDENES
CREATE TABLE IF NOT EXISTS orders (
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


-- 1. ENUM para estado de orden
DO $$ BEGIN
  CREATE TYPE estado_orden AS ENUM ('pending', 'paid', 'shipped', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Columna rol en usuarios (default 'cliente')
ALTER TABLE users ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'cliente';

-- 3. Campos de pago en órdenes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referencia_pago VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pagado_en TIMESTAMP;

-- 3b. Campos de Mercado Pago
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_status VARCHAR(100);

-- Convertir status de VARCHAR a ENUM
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN status TYPE estado_orden USING status::estado_orden;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'::estado_orden;


-- 4. Función auxiliar que devuelve el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT rol FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- 5. Políticas RLS diferenciadas por rol

-- Órdenes: eliminar política genérica y crear dos diferenciadas
DROP POLICY IF EXISTS "Users can access their own orders" ON orders;

CREATE POLICY "Clientes ven sus propias ordenes" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins ven todas las ordenes" ON orders
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admins pueden actualizar ordenes" ON orders
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Admins pueden eliminar ordenes" ON orders
  FOR DELETE USING (get_user_role() = 'admin');

-- Productos: permitir lectura pública, escritura solo admins
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Todos pueden leer productos" ON products
  FOR SELECT USING (true);
CREATE POLICY "Admins pueden modificar productos" ON products
  FOR ALL USING (get_user_role() = 'admin');

-- Usuarios: admins pueden leer todos
CREATE POLICY "Admins pueden leer usuarios" ON users
  FOR SELECT USING (get_user_role() = 'admin');

-- 6. Stored procedure crear_orden_completa
-- Valida stock, crea la orden y descuenta stock en una única transacción.
-- Si el stock es insuficiente, lanza excepción y hace rollback automático.
CREATE OR REPLACE FUNCTION crear_orden_completa(
  p_user_id UUID,
  p_items JSONB,
  p_total DECIMAL,
  p_shipping_address JSONB DEFAULT NULL,
  p_metodo_pago VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_cantidad INTEGER;
  v_stock INTEGER;
  v_product_name TEXT;
  v_order_id UUID;
  v_order JSONB;
BEGIN
  -- Validar stock para cada ítem antes de crear nada
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_cantidad   := (v_item->>'cantidad')::INTEGER;

    SELECT stock, nombre INTO v_stock, v_product_name
    FROM products WHERE id = v_product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto % no encontrado', v_product_id;
    END IF;

    IF v_stock < v_cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, solicitado: %',
        v_product_name, v_stock, v_cantidad;
    END IF;
  END LOOP;

  -- Crear la orden
  INSERT INTO orders (user_id, items, total, shipping_address, status, metodo_pago)
  VALUES (p_user_id, p_items, p_total, p_shipping_address, 'pending', p_metodo_pago)
  RETURNING id INTO v_order_id;

  -- Descontar stock de cada producto
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_cantidad   := (v_item->>'cantidad')::INTEGER;

    UPDATE products
    SET stock = stock - v_cantidad, updated_at = NOW()
    WHERE id = v_product_id;
  END LOOP;

  SELECT to_jsonb(o) INTO v_order FROM orders o WHERE o.id = v_order_id;
  RETURN v_order;
END;
$$;


