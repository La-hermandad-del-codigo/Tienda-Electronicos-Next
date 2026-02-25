# 🖼️ Tabla Rápida de Imágenes por Categoría

## Acceso Directo a URLs

Copia y pega estas URLs directamente en el campo de "URL de imagen" cuando sea necesario:

```
LAPTOPS
/images/products/laptop-gaming.svg

SMARTPHONES  
/images/products/smartphone-flagship.svg

AUDIO
/images/products/auriculares-premium.svg

TECLADOS
/images/products/teclado-mecanico-rgb.svg

MONITORES
/images/products/monitor-gaming-2k.svg

ACCESORIOS
/images/products/mousepad-rgb-pro.svg

TABLETS
/images/products/tablet-12-pro-stylus.svg

GAMING
/images/products/consola-gaming.svg
```

---

## Tabla Markdown

| Categoría | URL de Imagen | Preview Directo |
|-----------|---|---|
| **Laptops** | `/images/products/laptop-gaming.svg` | ![Laptops](/images/products/laptop-gaming.svg) |
| **Smartphones** | `/images/products/smartphone-flagship.svg` | ![Smartphones](/images/products/smartphone-flagship.svg) |
| **Audio** | `/images/products/auriculares-premium.svg` | ![Audio](/images/products/auriculares-premium.svg) |
| **Teclados** | `/images/products/teclado-mecanico-rgb.svg` | ![Teclados](/images/products/teclado-mecanico-rgb.svg) |
| **Monitores** | `/images/products/monitor-gaming-2k.svg` | ![Monitores](/images/products/monitor-gaming-2k.svg) |
| **Accesorios** | `/images/products/mousepad-rgb-pro.svg` | ![Accesorios](/images/products/mousepad-rgb-pro.svg) |
| **Tablets** | `/images/products/tablet-12-pro-stylus.svg` | ![Tablets](/images/products/tablet-12-pro-stylus.svg) |
| **Gaming** | `/images/products/consola-gaming.svg` | ![Gaming](/images/products/consola-gaming.svg) |

---

## Código JSON (Si lo necesitas importar)

```json
{
  "categoryImages": {
    "Laptops": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
    "Smartphones": "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop",
    "Audio": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    "Teclados": "https://images.unsplash.com/photo-1587829191301-1e5b97a1a95f?w=500&h=500&fit=crop",
    "Monitores": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
    "Accesorios": "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=500&h=500&fit=crop",
    "Tablets": "/images/products/tablet-12-pro-stylus.jpg",
    "Gaming": "https://images.unsplash.com/photo-1581591437281-460bfbe1220a?w=500&h=500&fit=crop"
  }
}
```

---

## Información de Descarga

Si prefieres **descargar las imágenes localmente** en lugar de usar URLs externas:

1. Haz clic derecho en cada preview anterior
2. Selecciona "Guardar imagen"
3. Colócalas en: `public/images/categories/`
4. Actualiza las URLs en `src/utils/categoryImages.ts`

Ejemplo de nueva ruta local:
```typescript
export const CATEGORY_IMAGES: Record<string, string> = {
  'Laptops': '/images/categories/laptops.jpg',
  'Smartphones': '/images/categories/smartphones.jpg',
  // ... resto de categorías
};
```

---

## Notas Importantes

⚠️ Las imágenes tienen parámetros `?w=500&h=500&fit=crop` que las redimensionan automáticamente.  
⚠️ Sin estos parámetros, las imágenes pueden ser muy grandes.  
⚠️ Unsplash automáticamente cachea las imágenes en el navegador.  
⚠️ Si cambias una URL, borra el caché del navegador para ver cambios.  

---

## Verificación de Imágenes

Para verificar que una imagen carga correctamente:

1. Copia la URL
2. Pégalo en una pestaña del navegador
3. Si se ve la imagen, está funcionando ✅
4. Si ves un error, prueba con otra URL de Unsplash

---

**Última actualización:** 23 de Febrero, 2026
