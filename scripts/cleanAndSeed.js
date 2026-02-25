/**
 * Script para limpiar todos los productos y recargar los 16 correctos
 * Ejecución: node scripts/cleanAndSeed.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Leer variables de entorno desde .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Productos correctos: 2 por categoría (16 total)
const productsToSeed = [
  // TECLADOS 🎹
  {
    name: 'Teclado Mecánico RGB Pro',
    description: 'Teclado mecánico de alta gama con switches cherry MX y RGB personalizable. Ideal para gaming y programación.',
    price: 149.99,
    stock: 15,
    category: 'Teclados',
    image_url: 'https://images.unsplash.com/photo-1587829191301-1e5b97a1a95f?w=400&h=250&fit=crop',
  },
  {
    name: 'Teclado Inalámbrico Compacto',
    description: 'Teclado compacto bluetooth con batería de larga duración. Perfecto para escritorios minimalistas y portabilidad.',
    price: 79.99,
    stock: 22,
    category: 'Teclados',
    image_url: 'https://images.unsplash.com/photo-1595432707802-6b2626ef1c91?w=400&h=250&fit=crop',
  },

  // AUDIO 🎧
  {
    name: 'Auriculares Inalámbricos Premium',
    description: 'Auriculares over-ear con cancelación activa de ruido y sonido de alta fidelidad. 30 horas de batería.',
    price: 249.99,
    stock: 18,
    category: 'Audio',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop',
  },
  {
    name: 'Parlante Bluetooth Portátil',
    description: 'Parlante portátil con sonido 360° y resistencia al agua IPX7. Ideal para viajes y uso en exteriores.',
    price: 99.99,
    stock: 28,
    category: 'Audio',
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=250&fit=crop',
  },

  // TABLETS 📟
  {
    name: 'Tablet 12" Pro con Stylus',
    description: 'Tablet de 12 pulgadas con pantalla OLED, stylus incluido y procesador de última generación. Ideal para diseño y productividad.',
    price: 799.99,
    stock: 10,
    category: 'Tablets',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
  },
  {
    name: 'Tablet 10" Compacta',
    description: 'Tablet versátil de 10 pulgadas con batería de 8000 mAh. Perfecta para multimedia, lectura y navegación.',
    price: 349.99,
    stock: 32,
    category: 'Tablets',
    image_url: 'https://images.unsplash.com/photo-1526765260-b78b56dd0c94?w=400&h=250&fit=crop',
  },

  // LAPTOPS 💻
  {
    name: 'Laptop UltraBook 14"',
    description: 'Laptop ultrafina de 14 pulgadas con procesador Intel i7, 16GB RAM y SSD 512GB. Peso: 1.2kg. Ideal para viajeros.',
    price: 1099.99,
    stock: 8,
    category: 'Laptops',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=250&fit=crop',
  },
  {
    name: 'Laptop Gaming 15.6"',
    description: 'Laptop gaming con GPU NVIDIA RTX 4060, procesador i9, 32GB RAM. Pantalla 165Hz para gaming competitivo.',
    price: 1699.99,
    stock: 12,
    category: 'Laptops',
    image_url: 'https://images.unsplash.com/photo-1588872657840-218e412ee5ff?w=400&h=250&fit=crop',
  },

  // ACCESORIOS 🖱️
  {
    name: 'Mouse Gaming Inalámbrico',
    description: 'Mouse gaming con sensor PMW3389 y batería de 70 horas. Ergonómico y altamente preciso para competencia.',
    price: 59.99,
    stock: 40,
    category: 'Accesorios',
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=250&fit=crop',
  },
  {
    name: 'Mousepad RGB Pro',
    description: 'Mousepad XL con iluminación RGB sincronizable y base antideslizante. Perfecto para gaming y trabajo profesional.',
    price: 39.99,
    stock: 50,
    category: 'Accesorios',
    image_url: 'https://images.unsplash.com/photo-1631672258318-d5c22db4c696?w=400&h=250&fit=crop',
  },

  // GAMING 🎮
  {
    name: 'Consola Gaming de Última Generación',
    description: 'Consola de última generación con 1TB SSD, 4K HDR 120fps. Incluye 2 controles y gamepass 3 meses.',
    price: 499.99,
    stock: 6,
    category: 'Gaming',
    image_url: 'https://images.unsplash.com/photo-1581591437281-460bfbe1220a?w=400&h=250&fit=crop',
  },
  {
    name: 'Gaming Chair Ergonómico',
    description: 'Silla gamer profesional con soporte lumbar ajustable, reposabrazo 3D y materiales premium. Garantía 5 años.',
    price: 299.99,
    stock: 14,
    category: 'Gaming',
    image_url: 'https://images.unsplash.com/photo-1585377969291-3c2141b303aa?w=400&h=250&fit=crop',
  },

  // SMARTPHONES 📱
  {
    name: 'Smartphone Flagship 6.8"',
    description: 'Smartphone flagship con pantalla AMOLED 6.8", 256GB almacenamiento, batería 5000mAh y cámara 50MP. Waterproof IP68.',
    price: 999.99,
    stock: 20,
    category: 'Smartphones',
    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=250&fit=crop',
  },
  {
    name: 'Smartphone Gama Media 6.1"',
    description: 'Smartphone versátil con pantalla 6.1", 128GB almacenamiento, batería 4500mAh y excelente relación precio-rendimiento.',
    price: 479.99,
    stock: 35,
    category: 'Smartphones',
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=250&fit=crop',
  },

  // MONITORES 🖥️
  {
    name: 'Monitor Gaming 165Hz 2K',
    description: 'Monitor gaming 27" con resolución 2K, tasa de refresco 165Hz, tiempo de respuesta 1ms. Incluye soportes.panel IPS.',
    price: 399.99,
    stock: 11,
    category: 'Monitores',
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=250&fit=crop',
  },
  {
    name: 'Monitor Ultrawide 34"',
    description: 'Monitor ultrawide 34" 3440x1440 con curva 1800R y calibración profesional. Ideal para multitarea y edición.',
    price: 699.99,
    stock: 7,
    category: 'Monitores',
    image_url: 'https://images.unsplash.com/photo-1421185042872-d5c866cad3b0?w=400&h=250&fit=crop',
  },
];

async function cleanAndSeed() {
  try {
    console.log('🗑️  Eliminando todos los productos existentes...\n');

    // Eliminar todos los productos
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Elimina todos

    if (deleteError) {
      console.error('❌ Error al eliminar productos:', deleteError.message);
      process.exit(1);
    }

    console.log('✅ Productos eliminados\n');
    
    console.log('🌱 Insertando 16 productos correctos...\n');

    const { data, error } = await supabase
      .from('products')
      .insert(productsToSeed)
      .select();

    if (error) {
      console.error('❌ Error al insertar productos:', error.message);
      process.exit(1);
    }

    console.log('✅ Productos insertados exitosamente:');
    console.log(`   Total de productos: ${data.length}`);
    console.log('\n📊 Resumen por categoría:');

    const byCategory = {};
    data.forEach(product => {
      byCategory[product.category] = (byCategory[product.category] || 0) + 1;
    });

    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} productos`);
    });

    console.log('\n✨ ¡Base de datos limpia y recargada correctamente!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inesperado:', err);
    process.exit(1);
  }
}

cleanAndSeed();
