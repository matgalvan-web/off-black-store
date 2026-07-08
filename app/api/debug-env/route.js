export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    service_key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) || 'NOT SET',
    anon_key_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anon_key_prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) || 'NOT SET',
  });
}
