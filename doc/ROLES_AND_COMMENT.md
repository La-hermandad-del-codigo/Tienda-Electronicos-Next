# Documentación Técnica: Sistema de Roles y Comentarios

Este documento sirve como registro y guía sobre la implementación, refinamiento y depuración (debugging) del sistema de roles (Administrador y Comerciante) y del sistema de comentarios en el proyecto Tienda Electrónicos Next.

## 1. Arquitectura de Roles

La aplicación utiliza tres roles principales gestionados a través de la tabla `profiles` en Supabase:
- `user`: Usuario estándar con permisos de sólo lectura y compra.
- `comerciante`: Vendedor que puede crear sus propios productos y administrarlos.
- `admin`: Moderador general de la plataforma con permisos para eliminar cualquier producto o comentario.

### Control de Acceso (Frontend vs Backend)

#### Frontend (Next.js / React)
La seguridad a nivel de UI se gestiona exponiendo banderas booleanas desde el **`AuthContext.tsx`**.
```typescript
const isAdmin = profile?.role === 'admin';
const isComerciante = profile?.role === 'comerciante';
```
Estos valores se pasan a los componentes (como `ProductList.tsx` o `CommentSection.tsx`) para ocultar intrínsecamente botones sensibles:
- **Botón "+ Nuevo Producto"**: Sólo visible para `isComerciante`.
- **Botón "Editar Producto"**: Sólo visible si `isComerciante` y `product.created_by === currentUserId`.
- **Botón "Eliminar Producto/Comentario"**: Visible si `isAdmin` **o** si el usuario es el creador original.

#### Backend (Políticas RLS en Supabase)
Toda regla del Frontend está respaldada rígidamente por Row Level Security (RLS) en la base de datos de Supabase. El frontend por sí solo es vulnerable; el verdadero candado ocurre aquí:
- **INSERT** (`products`): Restringido estrictamente a perfiles con el rol `comerciante`. Los admins no pueden crear productos.
- **UPDATE** (`products`): Solo el creador original (`auth.uid() = created_by`) teniendo rol `comerciante`.
- **DELETE** (`products` y `product_comments`): Permitido a nivel global para el rol `admin`, o a nivel restringido para el creador propietario del registro.

---

## 2. Debugging de Roles: Resolución de Problemas

Durante la implementación surgieron tres casos críticos de depuración:

### Caso A: Error al Asignar el Rol "comerciante" en la Base de Datos
- **Síntoma**: Al intentar actualizar una cuenta de prueba a comerciante, no aparecían los botones de UI y Supabase rechazaba la inyección del rol.
- **Diagnóstico**: La tabla `profiles` poseía un `CHECK CONSTRAINT` heredado (`profiles_role_check`) que limitaba el texto de la columna `role` exclusivamente a `('user', 'admin')`.
- **Solución**:
  Se ejecutó un parche en SQL para destruir la restricción y recrearla integrando el nuevo rol:
  ```sql
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'comerciante'));
  ```

### Caso B: Error de Tipos (Type Cast) en el RLS
- **Síntoma**: Un administrador o comerciante recibía un error al intentar eliminar productos a pesar de cumplir las reglas lógicas (Botón UI visible).
- **Diagnóstico**: Se identificó un error en Supabase `operator does not exist: uuid = text` generado internamente al evaluar `created_by = auth.uid()` en las cláusulas USING de la política DELETE.
- **Solución**:
  Se reestructuró la política temporalmente para asegurar de que el tipo de validación en la comprobación del rol se hiciera utilizando el mismo formato esperado (sin cast asimétricos conflictivos) desde las directivas base hasta resolver exitosamente el chequeo interno con el UUID en la base principal.

### Caso C: Violación de Foreign Key (Llave Foránea) al Eliminar
- **Síntoma**: Mensaje de error rojo en la UI indicando `violates foreign key constraint "order_items_product_id_fkey"`.
- **Diagnóstico**: Un producto no puede ser borrado de la tabla `products` si ese mismo `id` está siendo referenciado en el historial u órdenes interrelacionadas (`order_items`, `cart_items`).
- **Solución**: Se actualizó el esquema relacional en Supabase para habilitar el Borrado en Cascada (`ON DELETE CASCADE`). Al borrar un producto, en lugar de bloquear la acción, la BD ahora limpia automáticamente sus rastros en carritos u órdenes vinculadas.
  ```sql
  ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
  ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  ```

---

## 3. Implementación del Sistema de Comentarios

El sistema de comentarios permite interactuar sobre los productos, e incluye una gestión jerárquica para eliminar contenido ofensivo o de prueba.

### Visualización Invocando a Supabase Realtime
Los comentarios (`product_comments`) se cargan en `CommentSection.tsx` llamando a la API y suscribiéndose a los canales de Supabase Realtime (`postgres_changes`) para que la pantalla refresque inmediatamente.
- **Optimización de Borrado**: Se descubrió un defecto donde el borrado (DELETE) de un comentario no refrescaba la UI automáticamente con el evento Realtime si la tabla carecía de identidad completa de réplica (replica identity full).
- **Mitigación Híbrida**: Se incluyó una llamada manual directa `fetchComments()` dentro de la promesa `handleDeleteComment` en caso de éxito para obligar al DOM a sincronizarse sin demoras para la experiencia de administrador o usuario eliminando su propio contenido.

### Componentización y Props Seguros
`CommentSection.tsx` determina el estado del rol invocando a `const { isAdmin } = useAuth()`.
Este valor numérico, junto al ID de sesión activa del navegante (`currentUserId`), se inyecta como `props` hacia cada hijo `<CommentItem />`.
El componente hijo decide aisladamente si debe renderizar un micro-botón de basura para la ejecución de retroceso llamando al callback superior `onDelete()`.