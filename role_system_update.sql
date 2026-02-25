-- ==============================================================================
-- ACTUALIZACIÓN DE SISTEMA DE ROLES (ADMINISTRADOR / COMERCIANTE)
-- ==============================================================================

-- 1. Actualizar el CHECK constraint de la tabla `profiles` si existe para permitir 'comerciante'
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE IF EXISTS public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'comerciante'));

-- 2. Actualizar las Políticas de Seguridad a Nivel de Fila (RLS) para 'products'
-- Primero eliminamos políticas previas que puedan entrar en conflicto
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
-- (Añade aquí otras políticas DROPs si tienen nombres personalizados que usabas antes)

-- Política de Inserción: Solo comerciantes
CREATE POLICY "Permitir inserción solo a comerciantes" 
ON public.products FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'comerciante'
  )
);

-- Política de Actualización: Solo para comerciantes si el producto les pertenece
CREATE POLICY "Permitir actualización a dueño comerciante" 
ON public.products FOR UPDATE 
USING (
  created_by = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'comerciante'
  )
);

-- Política de Eliminación: Administradores (todo) o Comerciantes (solo lo suyo)
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

-- 3. Actualizar Políticas de Seguridad para 'product_comments'

-- Eliminar la política de borrado actual para recrearla
DROP POLICY IF EXISTS "Permitir borrado a dueños del comentario" ON public.product_comments;

-- Nueva política de borrado: Dueño del comentario o Administradores
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

-- Función SQL (RPC) para asignar rápidamente el rol comerciante (Opcional, útil para gestionar desde un panel/admin)
CREATE OR REPLACE FUNCTION promote_to_comerciante(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'comerciante'
  WHERE email = user_email;
END;
$$;

-- ==============================================================================
-- 4. FIX: PERMITIR ELIMINAR PRODUCTOS (CASCADE)
-- ==============================================================================
-- Al eliminar un producto, debe eliminarse en las tablas referenciadas en lugar de lanzar error
-- de llave foránea.

-- Para order_items:
ALTER TABLE IF EXISTS public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE IF EXISTS public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Para cart_items (si existe en base de datos la referencia foránea restrictiva)
ALTER TABLE IF EXISTS public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE IF EXISTS public.cart_items
ADD CONSTRAINT cart_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;
