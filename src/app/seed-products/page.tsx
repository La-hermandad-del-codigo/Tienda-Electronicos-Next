'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Productos a insertar: 2 por categoría
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
    description: 'Auriculares over-ear con cancelación activa de ruido y sonido de alta fidelidad. 30 horas de batería.',
    price: 249.99,
    stock: 18,
    category: 'Audio',
    image_url: '/images/products/auriculares-premium.svg',
  },
  {
    name: 'Parlante Bluetooth Portátil',
    description: 'Parlante portátil con sonido 360° y resistencia al agua IPX7. Ideal para viajes y uso en exteriores.',
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
    description: 'Mouse gaming con sensor PMW3389 y batería de 70 horas. Ergonómico y altamente preciso para competencia.',
    price: 59.99,
    stock: 40,
    category: 'Accesorios',
    image_url: '/images/products/mouse-gaming.svg',
  },
  {
    name: 'Mousepad RGB Pro',
    description: 'Mousepad XL con iluminación RGB sincronizable y base antideslizante. Perfecto para gaming and trabajo profesional.',
    price: 39.99,
    stock: 50,
    category: 'Accesorios',
    image_url: '/images/products/mousepad-rgb-pro.svg',
  },

  // GAMING 🎮
  {
    name: 'Consola Gaming de Última Generación',
    description: 'Consola de última generación con 1TB SSD, 4K HDR 120fps. Incluye 2 controles y gamepass 3 meses.',
    price: 499.99,
    stock: 6,
    category: 'Gaming',
    image_url: '/images/products/consola-gaming.svg',
  },
  {
    name: 'Gaming Chair Ergonómico',
    description: 'Silla gamer profesional con soporte lumbar ajustable, reposabrazo 3D y materiales premium. Garantía 5 años.',
    price: 299.99,
    stock: 14,
    category: 'Gaming',
    image_url: '/images/products/gaming-chair.svg',
  },

  // SMARTPHONES 📱
  {
    name: 'Smartphone Flagship 6.8"',
    description: 'Smartphone flagship con pantalla AMOLED 6.8", 256GB almacenamiento, batería 5000mAh y cámara 50MP. Waterproof IP68.',
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
    description: 'Monitor gaming 27" con resolución 2K, tasa de refresco 165Hz, tiempo de respuesta 1ms. Incluye soporte. Panel IPS.',
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

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [alreadySeeded, setAlreadySeeded] = useState(false);

  useEffect(() => {
    // Verificar si ya se han sembrado los productos
    checkIfSeeded();
  }, []);

  const checkIfSeeded = async () => {
    try {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (count && count >= 16) {
        setAlreadySeeded(true);
        setMessage(`✅ Ya existen ${count} productos. El seed podría causar duplicados.`);
      }
    } catch (err) {
      console.error('Error checking seed status:', err);
    }
  };

  const handleSeed = async () => {
    setStatus('loading');
    setMessage('🌱 Insertando 16 productos...');

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productsToSeed)
        .select();

      if (error) {
        setStatus('error');
        setMessage(`❌ Error: ${error.message}`);
        return;
      }

      setStatus('success');
      const byCategory: Record<string, number> = {};
      data.forEach((product: any) => {
        byCategory[product.category] = (byCategory[product.category] || 0) + 1;
      });

      let summary = '✅ 16 productos insertados exitosamente:\n\n';
      Object.entries(byCategory).forEach(([cat, count]) => {
        summary += `${cat}: ${count} productos\n`;
      });
      setMessage(summary);
    } catch (err) {
      setStatus('error');
      setMessage(`❌ Error inesperado: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  return (
    <div className="seed-container">
      <div className="seed-card">
        <h1>🌱 Sembrador de Productos</h1>
        <p className="subtitle">Insertar 16 productos nuevos (2 por categoría)</p>

        <div className="category-list">
          <h2>Categorías a insertar:</h2>
          <ul>
            <li>🎹 Teclados (2 productos)</li>
            <li>🎧 Audio (2 productos)</li>
            <li>📟 Tablets (2 productos)</li>
            <li>💻 Laptops (2 productos)</li>
            <li>🖱️ Accesorios (2 productos)</li>
            <li>🎮 Gaming (2 productos)</li>
            <li>📱 Smartphones (2 productos)</li>
            <li>🖥️ Monitores (2 productos)</li>
          </ul>
        </div>

        {alreadySeeded && (
          <div className="warning-box">
            ⚠️ Advertencia: Ya existen muchos productos. Ejecutar seed podría crear duplicados.
          </div>
        )}

        <div className="status-message">
          {status === 'loading' && <div className="spinner"></div>}
          {message && (
            <pre className={`message ${status}`}>
              {message}
            </pre>
          )}
        </div>

        <div className="button-group">
          <button
            onClick={handleSeed}
            disabled={status === 'loading'}
            className={`btn-seed ${status === 'success' ? 'btn-success' : ''}`}
          >
            {status === 'loading' ? '⏳ Insertando...' : '🚀 Ejecutar Seed'}
          </button>
          <a href="/" className="btn-back">
            ← Volver al Inicio
          </a>
        </div>
      </div>

      <style jsx>{`
        .seed-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .seed-card {
          background: white;
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 100%;
        }

        h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          color: #333;
          text-align: center;
        }

        .subtitle {
          margin: 0 0 2rem 0;
          text-align: center;
          color: #666;
          font-size: 0.95rem;
        }

        .category-list {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .category-list h2 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #333;
        }

        .category-list ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style: none;
        }

        .category-list li {
          padding: 0.4rem 0;
          color: #555;
          font-size: 0.95rem;
        }

        .warning-box {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          color: #856404;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .status-message {
          margin-bottom: 1.5rem;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .message {
          margin: 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9rem;
          line-height: 1.6;
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          word-break: break-words;
          color: #333;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-seed {
          background: #667eea;
          color: white;
          flex: 1;
          max-width: 300px;
        }

        .btn-seed:hover:not(:disabled) {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-seed:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-seed.btn-success {
          background: #28a745;
        }

        .btn-back {
          padding: 0.75rem 1.5rem;
          background: #6c757d;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-back:hover {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4);
        }

        @media (max-width: 600px) {
          .seed-card {
            padding: 1.5rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          .button-group {
            flex-direction: column;
          }

          .btn-seed {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
