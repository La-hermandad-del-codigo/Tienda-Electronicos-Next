/**
 * Guía de Imágenes por Categoría
 * 
 * Este archivo contiene el mapeo completo de imágenes representativas
 * para cada categoría de producto. Cada imagen está optimizada para
 * tarjetas de producto con una calidad de 500x500px.
 * 
 * Las imágenes provienen de Unsplash (unsplash.com), que ofrece
 * imágenes de alta calidad con licencia de uso libre.
 */

import { CATEGORY_IMAGES, getDefaultImageForCategory } from '../utils/categoryImages';

export interface CategoryImageInfo {
  category: string;
  imageUrl: string;
  description: string;
  source: string;
}

/**
 * Información detallada sobre cada imagen de categoría
 */
export const CATEGORY_IMAGE_INFO: CategoryImageInfo[] = [
  {
    category: 'Laptops',
    imageUrl: CATEGORY_IMAGES['Laptops'],
    description: 'Laptop moderna de aluminio, ideal para mostrar portátiles de alta gama',
    source: 'Unsplash',
  },
  {
    category: 'Smartphones',
    imageUrl: CATEGORY_IMAGES['Smartphones'],
    description: 'Teléfono inteligente moderno, perfecto para representar dispositivos móviles',
    source: 'Unsplash',
  },
  {
    category: 'Audio',
    imageUrl: CATEGORY_IMAGES['Audio'],
    description: 'Auriculares premium, ideal para productos de audio de calidad',
    source: 'Unsplash',
  },
  {
    category: 'Teclados',
    imageUrl: CATEGORY_IMAGES['Teclados'],
    description: 'Teclado mecánico de gaming, representa periféricos de entrada',
    source: 'Unsplash',
  },
  {
    category: 'Monitores',
    imageUrl: CATEGORY_IMAGES['Monitores'],
    description: 'Monitor gaming de alta resolución, perfecto para pantallas',
    source: 'Unsplash',
  },
  {
    category: 'Accesorios',
    imageUrl: CATEGORY_IMAGES['Accesorios'],
    description: 'Cables y accesorios tecnológicos variados, representa periféricos y complementos',
    source: 'Unsplash',
  },
  {
    category: 'Tablets',
    imageUrl: CATEGORY_IMAGES['Tablets'],
    description: 'Tablet moderna, ideal para dispositivos portátiles tipo tablet',
    source: 'Unsplash',
  },
  {
    category: 'Gaming',
    imageUrl: CATEGORY_IMAGES['Gaming'],
    description: 'Setup gamer con consola, representa hardware de gaming',
    source: 'Unsplash',
  },
];

/**
 * Componente para demostración de imágenes de categorías
 * (Útil para revisar visualmente todas las imágenes disponibles)
 */
export const CategoryImageGallery: React.FC = () => {
  return (
    <div className="category-image-gallery">
      <h2>Galería de Imágenes por Categoría</h2>
      <p className="gallery-description">
        Estas son las imágenes representativas utilizadas en las tarjetas de productos.
        Se sugieren automáticamente al crear un producto de una categoría específica.
      </p>
      
      <div className="gallery-grid">
        {CATEGORY_IMAGE_INFO.map((item) => (
          <div key={item.category} className="gallery-item">
            <div className="gallery-image-wrapper">
              <img src={item.imageUrl} alt={item.category} />
            </div>
            <div className="gallery-info">
              <h3>{item.category}</h3>
              <p>{item.description}</p>
              <small>Fuente: {item.source}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryImageGallery;
