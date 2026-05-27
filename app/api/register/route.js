function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '').trim();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { error: 'Missing Supabase URL or service role key in environment variables' };
  }

  let origin;
  try {
    origin = new URL(supabaseUrl).origin;
  } catch (error) {
    return { error: 'Invalid Supabase URL in environment variables' };
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
  };

  return {
    adminUserUrl: origin + '/auth/v1/admin/users',
    adminDbUrl: origin + '/rest/v1/users',
    authHeaders,
  };
}

export async function POST(request) {
  try {
    const config = getSupabaseConfig();
    if (config.error) {
      return new Response(JSON.stringify({ error: config.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { adminUserUrl, adminDbUrl, authHeaders } = config;
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
