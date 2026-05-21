-- Seed script to insert products into Supabase `products` table
-- Adds a numeric legacy_id column and inserts sample rows matching local data

-- Add legacy_id column if not exists
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS legacy_id INTEGER;

-- Insert products (example subset). Adjust or paste full list.
INSERT INTO public.products (nombre, descripcion, precio, imagen, colores, talles, stock, legacy_id, created_at)
VALUES
('CAMPERA ROMPEVIENTOS', '', 200000, '/Imagenes/camperamarron.png.webp', '[{"nombre":"Marrón","imagen":"/Imagenes/camperamarron.png.webp"},{"nombre":"Negro","imagen":"/Imagenes/camperanegra.png.webp"}]'::jsonb, ARRAY['S','M','L','XL']::text[], 10, 1, NOW()),
('JEAN GRIS', '', 150000, '/Imagenes/jeangris.png.webp', '[{"nombre":"Gris","imagen":"/Imagenes/jeangris.png.webp"}]'::jsonb, ARRAY['S','M','L','XL']::text[], 10, 2, NOW()),
('GUANTES DE INVIERNO', '', 30000, '/Imagenes/guantesfrio.png.webp', '[{"nombre":"Negro","imagen":"/Imagenes/guantesfrio.png.webp"}]'::jsonb, ARRAY[]::text[], 20, 6, NOW()),
('OJOTAS', '', 65000, '/Imagenes/ojotasazul.png.webp', '[{"nombre":"Azul","imagen":"/Imagenes/ojotasazul.png.webp"},{"nombre":"Blanco","imagen":"/Imagenes/ojotasblancaspng.webp"},{"nombre":"Verde","imagen":"/Imagenes/ojotasverdes.png.webp"}]'::jsonb, ARRAY['37','38','39','40','41','42','43','44','45']::text[], 30, 12, NOW()),
('PACK DE MEDIAS', '', 40000, '/Imagenes/packmediaspng.webp', '[{"nombre":"Negro","imagen":"/Imagenes/packmediaspng.webp"}]'::jsonb, ARRAY['37','38','39','40','41','42','43','44','45']::text[], 50, 15, NOW());

-- Note: run this in Supabase SQL editor. Extend with full product list as needed.
