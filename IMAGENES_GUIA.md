# 📸 Guía de Imágenes Representativas por Categoría

## Descripción General

El sistema incluye imágenes representativas de alta calidad para cada categoría de producto. Estas imágenes se sugieren automáticamente al crear un nuevo producto, ayudando a mantener una consistencia visual en el catálogo.

## Categorías y sus Imágenes

| Categoría | Descripción | Tipo de Imagen |
|-----------|------------|---|
| **Laptops** | Laptop moderna de aluminio | Computadora portátil premium |
| **Smartphones** | Teléfono inteligente moderno | Dispositivo móvil de última generación |
| **Audio** | Auriculares de calidad premium | Auriculares/parlantes de audio |
| **Teclados** | Teclado mecánico gaming | Periférico de entrada mecánico |
| **Monitores** | Monitor gaming de alta resolución | Pantalla desktop 4K/gaming |
| **Accesorios** | Mouse y periféricos varios | Accesorios de computadora |
| **Tablets** | Tablet moderna | Dispositivo portátil tipo tablet |
| **Gaming** | Consola/setup gamer | Hardware y setup de gaming |

## Características Técnicas

### Especificaciones de Imágenes
- **Resolución**: 500x500px (optimizada)
- **Formato**: JPEG (alta compresión)
- **Fuente**: Unsplash (licencia gratuita)
- **Almacenamiento**: URLs externas (no requiere espacio local)
- **Carga**: Lazy loading automático en tarjetas

### Ventajas del Sistema
✅ Imágenes de alta calidad sin costo  
✅ No ocupa espacio en el servidor  
✅ Proceso de carga automático por categoría  
✅ Fácil customización si es necesario  
✅ Licencia de uso libre garantizada  

## Cómo Usar

### 1. Crear un Producto con Imagen Sugerida

Al crear un nuevo producto en el admin:

1. Selecciona la **categoría** del producto
2. Haz clic en el botón **"💡 Sugerir"** junto al campo de URL de imagen
3. Se cargará automáticamente la imagen representativa de esa categoría
4. Verás una **vista previa** de la imagen
5. Puedes modificarla o proporcionar tu propia URL

### 2. Usar una Imagen Personalizada

Si deseas usar una imagen diferente:

1. Copia la URL de una imagen externa
2. Pégala en el campo "URL de imagen"
3. Presiona Tab o haz clic fuera del campo para ver la vista previa
4. El formato debe ser una URL completa (https://...)

### 3. Acceder a las Imágenes Programáticamente

```typescript
import { getDefaultImageForCategory, CATEGORY_IMAGES } from '@/utils/categoryImages';

// Obtener imagen para una categoría específica
const imageUrl = getDefaultImageForCategory('Laptops');

// Obtener todas las imágenes
const allImages = CATEGORY_IMAGES;

// Ejemplo de uso en un componente
const CategoryCard = ({ category }) => {
  const imageUrl = getDefaultImageForCategory(category);
  return <img src={imageUrl} alt={category} />;
};
```

## Archivos del Sistema

| Archivo | Descripción |
|---------|------------|
| `src/utils/categoryImages.ts` | Mapeo de categorías a URLs de imágenes |
| `src/utils/categoryImageReference.tsx` | Referencia visual de todas las imágenes |
| `src/components/products/ProductForm.tsx` | Formulario actualizado con selector de imágenes |
| `src/styles/globals.css` | Estilos para preview y selector de imágenes |

## Personalización

### Para cambiar una imagen de categoría:

```typescript
// En src/utils/categoryImages.ts
export const CATEGORY_IMAGES: Record<string, string> = {
  'Laptops': 'https://tu-nueva-url-aqui.com/imagen.jpg',
  // ... resto de categorías
};
```

Para encontrar nuevas imágenes, visita:
- **Unsplash**: https://unsplash.com (recomendado)
- **Pixabay**: https://pixabay.com
- **Pexels**: https://pexels.com

Todos estos sitios ofrecen imágenes de licencia libre para uso comercial.

## Notas Importantes

⚠️ **Licencia**: Todas las imágenes actuales tienen licencia de uso libre  
⚠️ **CDN**: El rendimiento depende de Unsplash CDN  
⚠️ **URLs Hacker**: Se recomienda usar URLs HTTPS siempre  
⚠️ **Fallback**: Si alguna imagen no carga, se mostará un placeholder automático  

## Soporte y Troubleshooting

### Imagen no se carga
- Verifica que la URL sea válida y accesible
- Comprueba tu conexión a internet
- Intenta con otra imagen de Unsplash

### Quiero agregar más imágenes
- Edita `src/utils/categoryImages.ts`
- Agrega nuevas categorías con sus URLs
- Las imágenes se cargarán automáticamente

### Necesito imágenes de mejor calidad
- Las imágenes de Unsplash pueden cambiar de URL
- Considera descargar las imágenes y guardarlas localmente en `public/images/`
- Actualiza las URLs en `categoryImages.ts` para apuntar a las rutas locales

## Resumen Técnico de Implementación

```
ProductForm.tsx
    ↓
    Importa: getDefaultImageForCategory()
    ↓
    Usuario selecciona categoría
    ↓
    Usuario hace clic en "💡 Sugerir"
    ↓
    applySuggestedImage() obtiene la URL
    ↓
    setFormData actualiza image_url
    ↓
    <ImagePreview> muestra la imagen
    ↓
    Submit envía el producto con la imagen
```

---

**Última actualización**: 23 de febrero de 2026  
**Versión del sistema**: 1.0  
**Licencia de imágenes**: Unsplash (Gratuita)
