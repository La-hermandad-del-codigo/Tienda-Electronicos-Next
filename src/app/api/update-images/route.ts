import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mapeo de nombres de productos a nuevas URLs de imágenes
const imageUpdates = [
  {
    name: 'Teclado Mecánico RGB Pro',
    image_url: '/images/products/teclado-mecanico-rgb.svg',
  },
  {
    name: 'Teclado Inalámbrico Compacto',
    image_url: '/images/products/teclado-inalambrico.svg',
  },
  {
    name: 'Auriculares Inalámbricos Premium',
    image_url: '/images/products/auriculares-premium.svg',
  },
  {
    name: 'Parlante Bluetooth Portátil',
    image_url: '/images/products/parlante-portatil.svg',
  },
  {
    name: 'Laptop UltraBook 14"',
    image_url: '/images/products/laptop-ultrabook.svg',
  },
  {
    name: 'Mouse Gaming Inalámbrico',
    image_url: '/images/products/mouse-gaming.svg',
  },
  {
    name: 'Mousepad RGB Pro',
    image_url: '/images/products/mousepad-rgb-pro.svg',
  },
  {
    name: 'Monitor Gaming 165Hz 2K',
    image_url: '/images/products/monitor-gaming-2k.svg',
  },
  {
    name: 'Smartphone Flagship 6.8"',
    image_url: '/images/products/smartphone-flagship.svg',
  },
  {
    name: 'Smartphone Gama Media 6.1"',
    image_url: '/images/products/smartphone-gama-media.svg',
  },
  {
    name: 'Gaming Chair Ergonómico',
    image_url: '/images/products/gaming-chair.svg',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    const secretToken = process.env.SEED_SECRET_TOKEN || 'seed123';

    if (token !== secretToken) {
      return NextResponse.json(
        { error: 'Token no válido' },
        { status: 401 }
      );
    }

    let updatedCount = 0;
    const results = [];
    for (const update of imageUpdates) {
      const { data, error } = await supabase
        .from('products')
        .update({ image_url: update.image_url })
        .eq('name', update.name)
        .select();

      if (error) {
        results.push({
          product: update.name,
          status: 'error',
          error: error.message,
        });
      } else if (!data || data.length === 0) {
        results.push({
          product: update.name,
          status: 'no_match',
          message: 'No se encontró el producto o RLS bloqueó la actualización',
        });
      } else {
        results.push({
          product: update.name,
          status: 'success',
          id: data[0].id,
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} imágenes actualizadas`,
      totalAttempts: imageUpdates.length,
      results,
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
