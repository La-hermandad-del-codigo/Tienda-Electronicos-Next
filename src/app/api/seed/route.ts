import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Productos con imágenes actualizadas
const productsToSeed = [
  // TECLADOS 🎹
  {
    name: 'Teclado Mecánico RGB Pro',
    description: 'Teclado mecánico de alta gama con switches cherry MX y RGB personalizable. Ideal para gaming y programación.',
    price: 149.99,
    stock: 15,
    category: 'Teclados',
    image_url: '/images/products/teclado-mecanico-rgb.svg',
  },
  {
    name: 'Teclado Inalámbrico Compacto',
    description: 'Teclado compacto bluetooth con batería de larga duración. Perfecto para escritorios minimalistas y portabilidad.',
    price: 79.99,
    stock: 22,
    category: 'Teclados',
    image_url: '/images/products/teclado-inalambrico.svg',
  },

  // AUDIO 🎧
  {
    name: 'Auriculares Inalámbricos Premium',
    description: 'Auriculares over-ear con cancelación activa de ruido and sonido de alta fidelidad. 30 horas de batería.',
    price: 249.99,
    stock: 18,
    category: 'Audio',
    image_url: '/images/products/auriculares-premium.svg',
  },
  {
    name: 'Parlante Bluetooth Portátil',
    description: 'Parlante portátil con sonido 360° and resistencia al agua IPX7. Ideal para viajes and uso en exteriores.',
    price: 99.99,
    stock: 28,
    category: 'Audio',
    image_url: '/images/products/parlante-portatil.svg',
  },

  // TABLETS 📟
  {
    name: 'Tablet 12" Pro con Stylus',
    description: 'Tablet de 12 pulgadas con pantalla OLED, stylus incluido y procesador de última generación. Ideal para diseño y productividad.',
    price: 799.99,
    stock: 10,
    category: 'Tablets',
    image_url: '/images/products/tablet-12-pro-stylus.svg',
  },
  {
    name: 'Tablet 10" Compacta',
    description: 'Tablet versátil de 10 pulgadas con batería de 8000 mAh. Perfecta para multimedia, lectura y navegación.',
    price: 349.99,
    stock: 32,
    category: 'Tablets',
    image_url: '/images/products/tablet-10-compacta.svg',
  },

  // LAPTOPS 💻
  {
    name: 'Laptop UltraBook 14"',
    description: 'Laptop ultrafina de 14 pulgadas con procesador Intel i7, 16GB RAM y SSD 512GB. Peso: 1.2kg. Ideal para viajeros.',
    price: 1099.99,
    stock: 8,
    category: 'Laptops',
    image_url: '/images/products/laptop-ultrabook.svg',
  },
  {
    name: 'Laptop Gaming 15.6"',
    description: 'Laptop gaming con GPU NVIDIA RTX 4060, procesador i9, 32GB RAM. Pantalla 165Hz para gaming competitivo.',
    price: 1699.99,
    stock: 12,
    category: 'Laptops',
    image_url: '/images/products/laptop-gaming.svg',
  },

  // ACCESORIOS 🖱️
  {
    name: 'Mouse Gaming Inalámbrico',
    description: 'Mouse gaming con sensor PMW3389 and batería de 70 horas. Ergonómico and altamente preciso para competencia.',
    price: 59.99,
    stock: 40,
    category: 'Accesorios',
    image_url: '/images/products/mouse-gaming.svg',
  },
  {
    name: 'Mousepad RGB Pro',
    description: 'Mousepad XL con iluminación RGB sincronizable and base antideslizante. Perfecto para gaming and trabajo profesional.',
    price: 39.99,
    stock: 50,
    category: 'Accesorios',
    image_url: '/images/products/mousepad-rgb-pro.svg',
  },

  // GAMING 🎮
  {
    name: 'Consola Gaming de Última Generación',
    description: 'Consola de última generación con 1TB SSD, 4K HDR 120fps. Incluye 2 controles and gamepass 3 meses.',
    price: 499.99,
    stock: 6,
    category: 'Gaming',
    image_url: '/images/products/consola-gaming.svg',
  },
  {
    name: 'Gaming Chair Ergonómico',
    description: 'Silla gamer profesional con soporte lumbar ajustable, reposabrazo 3D and materiales premium. Garantía 5 años.',
    price: 299.99,
    stock: 14,
    category: 'Gaming',
    image_url: '/images/products/gaming-chair.svg',
  },

  // SMARTPHONES 📱
  {
    name: 'Smartphone Flagship 6.8"',
    description: 'Smartphone flagship con pantalla AMOLED 6.8", 256GB almacenamiento, batería 5000mAh and cámara 50MP. Waterproof IP68.',
    price: 999.99,
    stock: 20,
    category: 'Smartphones',
    image_url: '/images/products/smartphone-flagship.svg',
  },
  {
    name: 'Smartphone Gama Media 6.1"',
    description: 'Smartphone versátil con pantalla 6.1", 128GB almacenamiento, batería 4500mAh and excelente relación precio-rendimiento.',
    price: 479.99,
    stock: 35,
    category: 'Smartphones',
    image_url: '/images/products/smartphone-gama-media.svg',
  },

  // MONITORES 🖥️
  {
    name: 'Monitor Gaming 165Hz 2K',
    description: 'Monitor gaming 27" con resolución 2K, tasa de refresco 165Hz, tiempo de respuesta 1ms. Incluye soportes.panel IPS.',
    price: 399.99,
    stock: 11,
    category: 'Monitores',
    image_url: '/images/products/monitor-gaming-2k.svg',
  },
  {
    name: 'Monitor Ultrawide 34"',
    description: 'Monitor ultrawide 34" 3440x1440 con curva 1800R y calibración profesional. Ideal para multitarea y edición.',
    price: 699.99,
    stock: 7,
    category: 'Monitores',
    image_url: '/images/products/monitor-ultrawide.svg',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { action, token } = await request.json();

    const secretToken = process.env.SEED_SECRET_TOKEN || 'seed123';

    if (token !== secretToken) {
      return NextResponse.json(
        { error: 'Token no válido' },
        { status: 401 }
      );
    }

    if (action === 'clean-and-seed') {
      // Eliminar todos los productos
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.error('Error al eliminar:', deleteError);
        return NextResponse.json(
          { error: 'Error al eliminar productos: ' + deleteError.message },
          { status: 500 }
        );
      }

      // Insertar nuevos productos
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(productsToSeed)
        .select();

      if (insertError) {
        console.error('Error al insertar:', insertError);
        return NextResponse.json(
          { error: 'Error al insertar productos: ' + insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Productos reinsertados exitosamente',
        count: data?.length || 0,
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
