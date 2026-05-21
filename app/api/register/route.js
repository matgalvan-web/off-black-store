const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '').trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or service role key in environment variables');
}

let adminUserUrl;
let adminDbUrl;

try {
  const base = new URL(supabaseUrl);
  adminUserUrl = new URL('/auth/v1/admin/users', base).toString();
  adminDbUrl = new URL('/rest/v1/users', base).toString();
} catch (error) {
  throw new Error('Invalid Supabase URL in environment variables');
}

const authHeaders = {
  'Content-Type': 'application/json',
  apikey: supabaseServiceRoleKey,
  Authorization: `Bearer ${supabaseServiceRoleKey}`,
};

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const createUserResponse = await fetch(adminUserUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      }),
    });

    const createUserData = await createUserResponse.json();

    if (!createUserResponse.ok) {
      const errorMessage =
        createUserData?.error?.message || createUserData?.msg || createUserData?.message || JSON.stringify(createUserData);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: createUserResponse.status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData =
      createUserData?.user ||
      createUserData?.data?.user ||
      createUserData?.data ||
      createUserData ||
      null;

    const userId = userData?.id || userData?.user?.id || userData?.data?.id || null;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No se recibió ID de usuario desde Supabase' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const insertProfileResponse = await fetch(adminDbUrl, {
      method: 'POST',
      headers: {
        ...authHeaders,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([
        {
          id: userId,
          name,
          email,
          created_at: new Date().toISOString(),
        },
      ]),
    });

    if (!insertProfileResponse.ok) {
      const dbErrorData = await insertProfileResponse.json();
      const errorMessage =
        dbErrorData?.message || dbErrorData?.error || JSON.stringify(dbErrorData);
      return new Response(JSON.stringify({ error: 'Error al crear perfil: ' + errorMessage }), {
        status: insertProfileResponse.status || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, user: { id: userId, email, name } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || String(error) || 'Error inesperado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
