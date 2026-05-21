// Runner script to insert local products into Supabase `products` table
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    env[k] = v;
  }
}

const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const origin = new URL(SUPABASE_URL).origin;
const productosModule = await import('../app/data/productos.js');
const productos = productosModule.productos || [];

if (!Array.isArray(productos) || productos.length === 0) {
  console.error('No products found in app/data/productos.js');
  process.exit(1);
}

const rows = productos.map(p => ({
  nombre: p.nombre || '',
  descripcion: p.descripcion || '',
  precio: p.precio || 0,
  imagen: p.imagen || '',
  colores: p.colores || [],
  talles: p.talles || [],
  stock: p.stock || 10,
  created_at: new Date().toISOString()
}));

console.log(`Inserting ${rows.length} products into ${origin}/rest/v1/products`);

const res = await fetch(origin + '/rest/v1/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE,
    'Authorization': `Bearer ${SERVICE_ROLE}`,
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(rows)
});

const text = await res.text();
if (!res.ok) {
  console.error('Insert failed', res.status, text);
  process.exit(1);
}

console.log('Insert successful. Response:', text);
process.exit(0);
