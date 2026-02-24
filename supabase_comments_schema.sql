-- Ejecutar esto en el editor SQL de Supabase

-- Crear la tabla product_comments
CREATE TABLE public.product_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    parent_id uuid REFERENCES public.product_comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir lectura a todos (o solo autenticados si se prefiere)
CREATE POLICY "Permitir lectura de comentarios a todos" 
ON public.product_comments FOR SELECT 
USING (true);

-- Permitir inserción solo a usuarios autenticados y con su propio user_id
CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON public.product_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir actualización de sus propios comentarios
CREATE POLICY "Permitir actualización a dueños del comentario" 
ON public.product_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Permitir borrado de sus propios comentarios
CREATE POLICY "Permitir borrado a dueños del comentario" 
ON public.product_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Habilitar Realtime para product_comments
-- Asegúrate de que publicación "supabase_realtime" exista (usualmente creada por defecto)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE product_comments;

