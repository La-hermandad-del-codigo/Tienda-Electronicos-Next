import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { token, id, image_url } = await request.json();
    const secretToken = process.env.SEED_SECRET_TOKEN || 'seed123';

    if (token !== secretToken) {
      return NextResponse.json({ error: 'Token no válido' }, { status: 401 });
    }

    if (!id || !image_url) {
      return NextResponse.json({ error: 'Faltan parámetros id o image_url' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ image_url })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
