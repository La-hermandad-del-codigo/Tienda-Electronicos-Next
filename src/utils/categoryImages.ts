/**
 * Mapeo de categorías a imágenes representativas
 * Usa URLs de Unsplash (licencia de uso libre)
 */

export const CATEGORY_IMAGES: Record<string, string> = {
  'Laptops': '/images/products/laptop-gaming.svg',
  'Smartphones': '/images/products/smartphone-flagship.svg',
  'Audio': '/images/products/auriculares-premium.svg',
  'Teclados': '/images/products/teclado-mecanico-rgb.svg',
  'Monitores': '/images/products/monitor-gaming-2k.svg',
  'Accesorios': '/images/products/mousepad-rgb-pro.svg',
  'Tablets': '/images/products/tablet-12-pro-stylus.svg',
  'Gaming': '/images/products/consola-gaming.svg',
};

/**
 * Obtiene la URL de imagen recomendada para una categoría
 * @param category - Nombre de la categoría
 * @returns URL de la imagen o undefined si la categoría no existe
 */
export function getDefaultImageForCategory(category: string): string | undefined {
  return CATEGORY_IMAGES[category];
}

/**
 * Obtiene todas las categorías con sus imágenes
 * @returns Objeto con el mapeo completo
 */
export function getAllCategoryImages(): Record<string, string> {
  return { ...CATEGORY_IMAGES };
}
