# Debug Report — Tienda Electrónicos Next

> Registro exhaustivo de todos los problemas identificados, su diagnóstico y las soluciones aplicadas durante el desarrollo del proyecto. Organizado por módulo/área.

---

## Índice

1. [Base de Datos — Supabase](#1-base-de-datos--supabase)
2. [Sistema de Roles](#2-sistema-de-roles)
3. [Sistema de Comentarios (`product_comments`)](#3-sistema-de-comentarios-product_comments)
4. [Carrito de Compras (`useCart`)](#4-carrito-de-compras-usecart)
5. [Pasarela de Pago (`PaymentGateway` + `useCheckout`)](#5-pasarela-de-pago-paymentgateway--usecheckout)
6. [Historial de Órdenes (`useOrderHistory`)](#6-historial-de-órdenes-useorderhistory)
7. [Autenticación (Supabase Auth + SSR)](#7-autenticación-supabase-auth--ssr)
8. [Rendimiento y UX](#8-rendimiento-y-ux)

---

## 1. Base de Datos — Supabase

### BUG-DB-01 — `CHECK CONSTRAINT` bloqueaba el rol `comerciante`

| Campo | Detalle |
|---|---|
| **Área** | `profiles` table — Supabase |
| **Síntoma** | Al intentar asignar `role = 'comerciante'` a un perfil, Supabase rechazaba el UPDATE con un error de constraint. Los botones de UI para comerciante tampoco aparecían. |
| **Diagnóstico** | La tabla `profiles` tenía un `CHECK CONSTRAINT` heredado (`profiles_role_check`) que sólo permitía los valores `('user', 'admin')`. |
| **Solución** | Eliminar y recrear el constraint incluyendo el nuevo rol: |

```sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'comerciante'));
```

---

### BUG-DB-02 — Violación de Foreign Key al eliminar un producto

| Campo | Detalle |
|---|---|
| **Área** | `order_items` / `cart_items` → `products` |
| **Síntoma** | Al intentar eliminar un producto desde la UI de comerciante/admin, la operación fallaba con: `violates foreign key constraint "order_items_product_id_fkey"`. |
| **Diagnóstico** | `order_items.product_id` referenciaba `products.id` con comportamiento por defecto (`RESTRICT`). Al eliminar el producto padre, la BD bloqueaba la operación para proteger la integridad referencial. |
| **Solución** | Cambiar la FK a `ON DELETE CASCADE` para que la BD elimine automáticamente los registros huérfanos: |

```sql
-- order_items
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- cart_items
ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
```

> ⚠️ **Implicación**: Al borrar un producto, su rastro en el historial de órdenes (`order_items`) también se elimina. Evaluar si en producción se prefiere un borrado lógico (soft delete con columna `deleted_at`).

---

### BUG-DB-03 — Type Cast incorrecto en política RLS de DELETE

| Campo | Detalle |
|---|---|
| **Área** | RLS policy — tabla `products` |
| **Síntoma** | Un admin o comerciante recibía error al eliminar un producto a pesar de que el botón de UI estaba visible. Error interno de Supabase: `operator does not exist: uuid = text`. |
| **Diagnóstico** | En la cláusula `USING` de la política DELETE, la comparación `created_by = auth.uid()` generaba un cast asimétrico entre tipos `uuid` y `text` según la definición de columna. |
| **Solución** | Reestructurar las políticas para separar la verificación de rol de la verificación de propiedad, evitando comparaciones de tipo mixto: |

```sql
CREATE POLICY "Permitir eliminación a administradores y comerciantes dueños" 
ON public.products FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
  OR
  (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'comerciante'
    )
  )
);
```

---

## 2. Sistema de Roles

### BUG-ROLES-01 — UI mostraba botones sin validación de rol real

| Campo | Detalle |
|---|---|
| **Área** | Frontend — `AuthContext.tsx`, `ProductList.tsx` |
| **Síntoma** | Los botones de "Nuevo Producto" o "Eliminar" aparecían o desaparecían de forma inconsistente según el estado de hidratación del cliente. |
| **Diagnóstico** | El `profile` del usuario se cargaba de forma asíncrona. Si algún componente se renderizaba antes de que el perfil estuviera disponible, las booleanas `isAdmin` e `isComerciante` eran `false` por defecto y nunca se actualizaban. |
| **Solución** | Asegurar que `AuthContext` cargue el perfil antes de renderizar la UI protegida. Implementar un estado `isLoading` en el contexto y mostrar un indicador mientras se resuelve la sesión. |

**Patrón correcto en `AuthContext.tsx`:**
```typescript
const isAdmin = profile?.role === 'admin';
const isComerciante = profile?.role === 'comerciante';

// Exponer loading state para evitar render prematuro
return (
  <AuthContext.Provider value={{ user, profile, isAdmin, isComerciante, isLoading }}>
    {children}
  </AuthContext.Provider>
);
```

---

### BUG-ROLES-02 — `promote_to_comerciante` fallaba cuando el perfil no tenía email indexado

| Campo | Detalle |
|---|---|
| **Área** | RPC — Supabase |
| **Síntoma** | Llamar al RPC `promote_to_comerciante(user_email)` no actualizaba el rol porque la tabla `profiles` no almacenaba directamente el email (se normaliza en `auth.users`). |
| **Diagnóstico** | La función buscaba por `profiles.email` pero la columna puede no existir o estar desincronizada con `auth.users.email`. |
| **Solución** | Asignar el rol directamente desde el panel de Supabase Table Editor, o refactorizar la función para cruzar con `auth.users`: |

```sql
CREATE OR REPLACE FUNCTION promote_to_comerciante(user_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'comerciante'
  WHERE id = (SELECT id FROM auth.users WHERE email = user_email LIMIT 1);
END;
$$;
```

---

## 3. Sistema de Comentarios (`product_comments`)

### BUG-COM-01 — DELETE no refrescaba la UI en Realtime

| Campo | Detalle |
|---|---|
| **Área** | `CommentSection.tsx` — Supabase Realtime |
| **Síntoma** | Al borrar un comentario siendo admin o dueño, el comentario desaparecía de la base de datos pero seguía visible en la UI hasta que el usuario recargaba la página. |
| **Diagnóstico** | El canal Realtime de `postgres_changes` para eventos `DELETE` requiere que la tabla tenga `REPLICA IDENTITY FULL` para emitir el evento correctamente. Sin esta configuración, el evento se ignora silenciosamente. |
| **Solución** | Mitigación híbrida: forzar un refetch manual del lado del cliente después de un `DELETE` exitoso en lugar de depender exclusivamente del evento Realtime: |

```typescript
const handleDeleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('product_comments')
    .delete()
    .eq('id', commentId);

  if (!error) {
    // Mitigación: no esperar al evento Realtime
    await fetchComments();
  }
};
```

**Fix permanente (en Supabase SQL editor):**
```sql
ALTER TABLE public.product_comments REPLICA IDENTITY FULL;
```

---

### BUG-COM-02 — Política de borrado no incluía a administradores

| Campo | Detalle |
|---|---|
| **Área** | RLS — `product_comments` |
| **Síntoma** | Un usuario con rol `admin` intentaba eliminar un comentario ofensivo y recibía un error 403 de Supabase. |
| **Diagnóstico** | La política original de DELETE solo verificaba `user_id = auth.uid()` (dueño del comentario), sin contemplar el rol admin. |
| **Solución** | Eliminar la política original y recrearla incluyendo a administradores: |

```sql
DROP POLICY IF EXISTS "Permitir borrado a dueños del comentario" ON public.product_comments;

CREATE POLICY "Permitir borrado a dueños y administradores" 
ON public.product_comments FOR DELETE 
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

---

## 4. Carrito de Compras (`useCart`)

### BUG-CART-01 — Carrito no sincronizaba al eliminar un producto del catálogo

| Campo | Detalle |
|---|---|
| **Área** | `useCart.ts` — `syncCartWithProducts` |
| **Síntoma** | Si un comerciante eliminaba un producto que ya estaba en el carrito de un usuario, el carrito seguía mostrando el item eliminado con datos desactualizados. |
| **Diagnóstico** | El carrito se persiste en `localStorage` con un snapshot del producto en el momento de añadirlo. Si el producto se elimina de la BD, el carrito no recibe notificación. |
| **Solución** | Implementar `syncCartWithProducts()`: al cargar el catálogo (`useProducts`), pasar la lista actualizada al hook del carrito para depurar items huérfanos: |

```typescript
// En useCart.ts
const syncCartWithProducts = useCallback((updatedProducts: Product[]) => {
  setItems(prev => {
    const updated = prev
      .map(item => {
        const product = updatedProducts.find(p => p.id === item.product.id);
        if (!product) return null; // Producto eliminado → remover del carrito
        return { ...item, product };
      })
      .filter(Boolean) as CartItem[];
    saveToStorage(STORAGE_KEY, updated);
    return updated;
  });
}, []);
```

---

### BUG-CART-02 — Hidratación del carrito causaba flash de contenido vacío (SSR)

| Campo | Detalle |
|---|---|
| **Área** | `useCart.ts` — Hidratación `localStorage` |
| **Síntoma** | Al cargar la página, el icono del carrito mostraba brevemente `0` ítems antes de mostrar el conteo real. |
| **Diagnóstico** | El hook inicializa `items` como `[]` en el servidor (SSR). `localStorage` solo existe en el cliente, por lo que el dato real se carga en el `useEffect`, causando un parpadeo visual. |
| **Solución** | Usar el flag `isLoaded` para condicionar el renderizado del badge del carrito hasta que la hidratación esté completa: |

```typescript
// En el componente Navbar:
{isLoaded && cartCount > 0 && (
  <span className="cart-badge">{cartCount}</span>
)}
```

---

## 5. Pasarela de Pago (`PaymentGateway` + `useCheckout`)

### BUG-PAY-01 — Decremento de stock fallaba silenciosamente por RLS

| Campo | Detalle |
|---|---|
| **Área** | `useCheckout.ts` — `supabase.rpc('decrement_stock')` |
| **Síntoma** | El pago se procesaba y la orden se creaba correctamente, pero el stock de los productos no se decrementaba. No aparecía ningún error en la UI. |
| **Diagnóstico** | Una función RPC con `SECURITY DEFINER` es necesaria para que el cliente pueda modificar el stock sin necesidad de tener permisos de `UPDATE` directos sobre `products`. Si la función no existe o tiene `SECURITY INVOKER`, la política RLS de Update bloquea la operación sin lanzar excepción. |
| **Solución** | Verificar que la función `decrement_stock` exista en Supabase con `SECURITY DEFINER`. Ejemplo: |

```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;
END;
$$;
```

> El error era silencioso porque en `useCheckout.ts` el resultado del RPC no se verificaba con un `if (error)`.

**Fix en `useCheckout.ts`:**
```typescript
const { error: rpcError } = await supabase.rpc('decrement_stock', {
  p_product_id: item.product.id,
  p_quantity: item.quantity,
});
if (rpcError) console.warn('Stock no decrementado:', rpcError.message);
```

---

### BUG-PAY-02 — Botón de pago accesible para usuarios no autenticados

| Campo | Detalle |
|---|---|
| **Área** | `PaymentGateway.tsx` — `handlePay` |
| **Síntoma** | Un usuario no autenticado podía abrir el `CartDrawer`, llegar al `PaymentGateway` y pulsar "Pagar", causando que `user.id` fuera `undefined` y lanzando un error de runtime. |
| **Diagnóstico** | El guard `if (!validateForm() || !user) return;` previene el crash, pero la UI no informaba al usuario por qué el pago no avanzaba. |
| **Solución** | Redirigir al login antes de abrir el `PaymentGateway`, o mostrar un mensaje explícito si `!user`: |

```typescript
const handlePay = async () => {
  if (!user) {
    // Mostrar toast o redirigir
    showToast('Debes iniciar sesión para completar la compra', 'error');
    return;
  }
  if (!validateForm()) return;
  setShowProcessing(true);
  await startCheckout(user.id, items, cartTotal, 'card_simulated');
};
```

---

### BUG-PAY-03 — Estado de pago no se reseteaba al cerrar el modal

| Campo | Detalle |
|---|---|
| **Área** | `PaymentGateway.tsx` — `handleClose` |
| **Síntoma** | Si el usuario cerraba el modal durante el procesamiento y lo volvía a abrir, el indicador de pasos aparecía en estado `success`/`error` del intento anterior. |
| **Diagnóstico** | El componente llama a `reset()` al cerrar, pero `setShowProcessing(false)` también debe ejecutarse para volver a la pantalla del formulario. El flujo estaba correcto, pero si `handleClose` era invocado mientras `processing === true`, el botón de cierre ni siquiera era visible (`{!processing && <button...>}`). |
| **Solución** | El comportamiento es intencional: el modal no se puede cerrar durante el procesamiento. Documentar este UX decision. Si se desea interrumpir, añadir un botón "Cancelar" que llame a `reset()` y `handleClose()` con confirmación. |

---

## 6. Historial de Órdenes (`useOrderHistory`)

### BUG-ORD-01 — Doble fetch de items N+1 

| Campo | Detalle |
|---|---|
| **Área** | `useOrderHistory.ts` |
| **Síntoma** | Con muchas órdenes, el hook realizaba primero un fetch de `orders` y luego uno de `order_items`. Con más de 100 órdenes esto podría causar lentitud. |
| **Diagnóstico** | Se implementó correctamente usando `.in('order_id', orderIds)` en un único query de `order_items`, evitando N queries individuales. La arquitectura actual es correcta para el escenario de uso. |
| **Estado** | ✅ Resuelto — No hay problema activo. Anotado por documentación. |

---

### BUG-ORD-02 — `total` llegaba como `string` desde Supabase

| Campo | Detalle |
|---|---|
| **Área** | `useOrderHistory.ts` — mapeo de `ordersData` |
| **Síntoma** | El total de las órdenes se mostraba como `"25.99"` (con comillas) en la UI cuando se concatenaba con texto. |
| **Diagnóstico** | Supabase devuelve campos `numeric` de PostgreSQL como `string` en la respuesta JSON para evitar pérdida de precisión en JavaScript. |
| **Solución** | Casteo explícito al mapear: |

```typescript
const ordersWithItems: OrderRecord[] = ordersData.map((order) => ({
  ...order,
  total: Number(order.total), // Cast explícito
  items: ...
}));
```

---

## 7. Autenticación (Supabase Auth + SSR)

### BUG-AUTH-01 — Sesión no persistía entre navegaciones con App Router

| Campo | Detalle |
|---|---|
| **Área** | `@supabase/ssr` — configuración de middleware |
| **Síntoma** | El usuario se deslogueaba al navegar entre rutas del App Router de Next.js. |
| **Diagnóstico** | `@supabase/ssr` requiere un `middleware.ts` en la raíz del proyecto para refrescar las cookies de sesión en cada request. Sin él, las cookies expiran y el servidor no puede reconstruir la sesión. |
| **Solución** | Asegurarse de que existe un `middleware.ts` que refresque la sesión: |

```typescript
// middleware.ts (raíz del proyecto)
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* get/set/remove wrappers */ } }
  );
  await supabase.auth.getSession(); // Refresca el token
  return response;
}
```

---

### BUG-AUTH-02 — Callback de OAuth/magic link devolvía 404

| Campo | Detalle |
|---|---|
| **Área** | `src/app/auth/` — ruta callback |
| **Síntoma** | Al usar magic links o proveedores OAuth, el usuario era redirigido a `/auth/callback` pero obtenía un 404. |
| **Diagnóstico** | La ruta `src/app/auth/callback/route.ts` no existía o no manejaba el intercambio del `code` por una sesión. |
| **Solución** | Crear el route handler de callback: |

```typescript
// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL('/', request.url));
}
```

---

## 8. Rendimiento y UX

### BUG-UX-01 — Infinite Scroll disparaba múltiples fetches simultáneos

| Campo | Detalle |
|---|---|
| **Área** | `useInfiniteScroll.ts` |
| **Síntoma** | Al hacer scroll rápido hacia abajo, se lanzaban múltiples peticiones a Supabase de forma simultánea, duplicando productos en la lista. |
| **Diagnóstico** | El `IntersectionObserver` disparaba el callback varias veces antes de que el primer fetch completara, sin un guard de estado `loading`. |
| **Solución** | Añadir un flag `isFetching` (ref, no state, para no causar re-renders) que bloquee llamadas concurrentes: |

```typescript
const isFetching = useRef(false);

const loadMore = useCallback(async () => {
  if (isFetching.current || !hasMore) return;
  isFetching.current = true;
  try {
    await fetchNextPage();
  } finally {
    isFetching.current = false;
  }
}, [hasMore, fetchNextPage]);
```

---

### BUG-UX-02 — `SkeletonCard` aparecía brevemente en cada re-render de filtros

| Campo | Detalle |
|---|---|
| **Área** | `useProducts.ts` — estado `isLoading` |
| **Síntoma** | Al escribir en el campo de búsqueda, el grid mostraba skeletons en cada keystroke, creando un parpadeo molesto. |
| **Diagnóstico** | El estado `isLoading` se ponía en `true` inmediatamente al cambiar el input, antes de iniciar el debounce. |
| **Solución** | Aplicar debounce al término de búsqueda antes de actualizar el estado de loading y disparar el fetch: |

```typescript
// Debounce de 300ms antes de actualizar query
const [debouncedSearch, setDebouncedSearch] = useState(search);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(timer);
}, [search]);
```

---

## Resumen de Estado

| ID | Área | Estado |
|---|---|---|
| BUG-DB-01 | CHECK CONSTRAINT roles | ✅ Resuelto |
| BUG-DB-02 | FK CASCADE en order_items | ✅ Resuelto |
| BUG-DB-03 | Type Cast RLS DELETE | ✅ Resuelto |
| BUG-ROLES-01 | UI race condition con perfil | ✅ Resuelto |
| BUG-ROLES-02 | RPC promote_to_comerciante | ✅ Resuelto |
| BUG-COM-01 | DELETE no refrescaba Realtime | ✅ Resuelto (mitigación) |
| BUG-COM-02 | RLS admin no podía borrar comentarios | ✅ Resuelto |
| BUG-CART-01 | Cart sin sync al eliminar producto | ✅ Resuelto |
| BUG-CART-02 | Flash carrito vacío en SSR | ✅ Resuelto |
| BUG-PAY-01 | Decremento stock silencioso | ⚠️ Verificar RPC en Supabase |
| BUG-PAY-02 | Pago sin login no informaba | ⚠️ Mejora pendiente |
| BUG-PAY-03 | Estado modal no reseteado | ✅ Comportamiento intencional |
| BUG-ORD-01 | N+1 queries en historial | ✅ No aplica |
| BUG-ORD-02 | `total` como string | ✅ Resuelto |
| BUG-AUTH-01 | Sesión no persistía en App Router | ✅ Resuelto |
| BUG-AUTH-02 | Callback OAuth devolvía 404 | ✅ Resuelto |
| BUG-UX-01 | Infinite scroll duplicados | ✅ Resuelto |
| BUG-UX-02 | Skeleton parpadeo en búsqueda | ⚠️ Mejora pendiente |

---

*Última actualización: Febrero 2026 — Tienda Electrónicos Next v1.0.0*
