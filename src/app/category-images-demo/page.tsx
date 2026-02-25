'use client';

import React from 'react';
import { CATEGORY_IMAGE_INFO } from '@/utils/categoryImageReference';

/**
 * Página de demostración de imágenes por categoría
 * Útil para revisar visualmente todas las imágenes antes de usarlas
 */
export default function CategoryImagesDemo() {
  return (
    <div className="category-images-demo">
      <div className="demo-container">
        <header className="demo-header">
          <h1>📸 Galería de Imágenes Representativas</h1>
          <p className="demo-subtitle">
            Las siguientes imágenes se utilizan automáticamente como sugerencia
            al crear productos en cada categoría.
          </p>
        </header>

        <div className="gallery-grid">
          {CATEGORY_IMAGE_INFO.map((item) => (
            <div key={item.category} className="gallery-card">
              <div className="card-image-wrapper">
                <img 
                  src={item.imageUrl} 
                  alt={item.category}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gbG9hZGVkYTwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              
              <div className="card-content">
                <h2>{item.category}</h2>
                <p className="card-description">{item.description}</p>
                <div className="card-info">
                  <small>Fuente: {item.source}</small>
                </div>
                <div className="card-url">
                  <code className="url-text">{item.imageUrl.substring(0, 50)}...</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="demo-info">
          <h2>ℹ️ Información sobre las Imágenes</h2>
          
          <div className="info-box">
            <h3>✅ Ventajas del Sistema</h3>
            <ul>
              <li>Imágenes de alta calidad sin costo</li>
              <li>No requiere almacenamiento local</li>
              <li>Carga automática según la categoría</li>
              <li>Licencia de uso libre garantizada</li>
              <li>Fácil personalización si es necesario</li>
            </ul>
          </div>

          <div className="info-box">
            <h3>🛠️ Cómo Funciona</h3>
            <ol>
              <li>Selecciona una <strong>categoría</strong> al crear un producto</li>
              <li>Haz clic en el botón <strong>"💡 Sugerir"</strong></li>
              <li>La imagen se cargará automáticamente</li>
              <li>Verás una <strong>vista previa</strong></li>
              <li>Puedes usar la sugerencia o proporcionar tu propia URL</li>
            </ol>
          </div>

          <div className="info-box">
            <h3>📋 Especificaciones Técnicas</h3>
            <ul>
              <li><strong>Resolución</strong>: 500x500px (optimizada)</li>
              <li><strong>Formato</strong>: JPEG (alta compresión)</li>
              <li><strong>Fuente</strong>: Unsplash</li>
              <li><strong>Almacenamiento</strong>: URLs externas (CDN)</li>
              <li><strong>Licencia</strong>: Gratuita para uso comercial</li>
            </ul>
          </div>

          <div className="info-box">
            <h3>🔍 Archivos del Sistema</h3>
            <code className="file-path">src/utils/categoryImages.ts</code>
            <p>Mapeo de categorías a URLs de imágenes</p>
            
            <code className="file-path">src/components/products/ProductForm.tsx</code>
            <p>Formulario con selector de imágenes automático</p>
            
            <code className="file-path">src/styles/globals.css</code>
            <p>Estilos para preview y selector</p>
          </div>
        </section>
      </div>

      <style jsx>{`
        .category-images-demo {
          width: 100%;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 2rem 1rem;
        }

        .demo-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #eee;
        }

        .demo-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .demo-subtitle {
          font-size: 1rem;
          color: #666;
          margin: 0;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .gallery-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          border-color: #3b82f6;
        }

        .card-image-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #e5e7eb;
        }

        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-card:hover .card-image-wrapper img {
          transform: scale(1.05);
        }

        .card-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-content h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #333;
        }

        .card-description {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
          flex: 1;
        }

        .card-info {
          margin-bottom: 0.75rem;
        }

        .card-info small {
          color: #999;
          font-size: 0.8rem;
        }

        .card-url {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .url-text {
          display: block;
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #666;
          word-break: break-all;
          font-family: 'Courier New', monospace;
        }

        .demo-info {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #eee;
        }

        .demo-info h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .info-box {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 1.5rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .info-box h3 {
          margin-top: 0;
          color: #1e40af;
          font-size: 1.1rem;
        }

        .info-box ul,
        .info-box ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #333;
        }

        .info-box li {
          margin-bottom: 0.5rem;
        }

        .info-box p {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.95rem;
        }

        .file-path {
          display: block;
          background: #1f2937;
          color: #10b981;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .demo-container {
            padding: 1.5rem;
          }

          .demo-header h1 {
            font-size: 1.75rem;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .demo-info {
            margin-top: 2rem;
            padding-top: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
