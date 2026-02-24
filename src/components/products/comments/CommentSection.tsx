'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Comment } from '../../../types/comment';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { useAuth } from '../../../contexts/AuthContext';

interface CommentSectionProps {
    productId: string;
}

// Función auxiliar para organizar los comentarios planos en un árbol
const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Primero, creamos una copia de todos los comentarios en un mapa
    flatComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Luego, organizamos las referencias
    flatComments.forEach(comment => {
        const commentNode = commentMap.get(comment.id);
        if (commentNode) {
            if (comment.parent_id) {
                const parentNode = commentMap.get(comment.parent_id);
                if (parentNode) {
                    parentNode.replies!.push(commentNode);
                }
            } else {
                rootComments.push(commentNode);
            }
        }
    });

    // Ordenar los principales (más recientes arriba) y las respuestas por antigüedad (opcional)
    rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return rootComments;
};

export const CommentSection: React.FC<CommentSectionProps> = ({ productId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: isAuthLoading } = useAuth();
    const currentUserId = user?.id || null;

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: commentsData, error: commentsError } = await supabase
                .from('product_comments')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;

            // Extraer user_ids únicos
            const userIds = Array.from(new Set((commentsData || []).map(c => c.user_id)));

            let profilesMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .in('id', userIds);

                if (!profilesError && profilesData) {
                    profilesData.forEach(p => {
                        profilesMap[p.id] = {
                            name: p.email ? p.email.split('@')[0] : 'Usuario',
                            avatar_url: undefined
                        };
                    });
                }
            }

            const formattedData = (commentsData || []).map(comment => ({
                ...comment,
                users: profilesMap[comment.user_id] || { name: 'Usuario Anónimo' }
            })) as Comment[];

            setComments(buildCommentTree(formattedData));
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchComments();

        // Configurar listener en tiempo real de Supabase
        const channel = supabase.channel(`public:product_comments:product_id=eq.${productId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'product_comments',
                    filter: `product_id=eq.${productId}`
                },
                (payload) => {
                    console.log('Cambio detectado en comentarios:', payload);
                    // Fetch everything again on any change for simplicity 
                    // (An optimal implementation would append the payload directly to the tree but this ensures sync with user display names)
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [productId, fetchComments]);

    const handleSubmitComment = async (content: string, parentId: string | null = null) => {
        if (!currentUserId) {
            alert("Debes iniciar sesión para comentar");
            return;
        }

        const { error } = await supabase
            .from('product_comments')
            .insert([
                {
                    product_id: productId,
                    user_id: currentUserId,
                    content,
                    parent_id: parentId
                }
            ]);

        if (error) {
            console.error('Error insertando comentario:', error);
            throw error;
        }

        // No necesitamos hacer fetchComments manual aquí porque Realtime lo hará por nosotros
    };

    return (
        <div className="product-comments-section" style={{ marginTop: '1.5rem' }}>
            {isAuthLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Verificando sesión...</div>
            ) : currentUserId ? (
                <div style={{ marginBottom: '2rem', backgroundColor: 'var(--muted)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Deja un comentario</h4>
                    <CommentForm onSubmit={(content) => handleSubmitComment(content, null)} />
                </div>
            ) : (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)', textAlign: 'center', border: '1px solid var(--border)' }}>
                    Inicia sesión para dejar un comentario sobre este producto.
                </div>
            )}

            <div className="comments-list">
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando comentarios...</div>
                ) : comments.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                        No hay comentarios aún. ¡Sé el primero en preguntar o comentar!
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={(parentId, content) => handleSubmitComment(content, parentId)}
                            currentUserId={currentUserId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
