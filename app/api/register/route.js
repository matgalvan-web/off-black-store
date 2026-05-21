import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '').trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or service role key in environment variables');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('Invalid Supabase URL in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    const userData = data?.user || data;

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message || 'Error al crear usuario' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error: dbError } = await supabaseAdmin.from('users').insert([
      {
        id: userData.id,
        name,
        email,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message || 'Error al crear perfil' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, user: { id: userData.id, email, name } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || 'Error inesperado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
