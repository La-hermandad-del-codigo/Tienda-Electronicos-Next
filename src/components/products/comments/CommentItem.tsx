import React, { useState } from 'react';
import { Comment } from '../../../types/comment';
import { CommentForm } from './CommentForm';
import { MessageSquare, Clock } from 'lucide-react';

interface CommentItemProps {
    comment: Comment;
    onReply: (parentId: string, content: string) => Promise<void>;
    currentUserId: string | null;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `hace ${seconds} seg`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days} d`;

    return date.toLocaleDateString();
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, currentUserId }) => {
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = async (content: string) => {
        await onReply(comment.id, content);
        setIsReplying(false);
    };

    const authorName = comment.users?.name || 'Usuario';
    const avatarInitial = authorName.charAt(0).toUpperCase();

    return (
        <div className="comment-item" style={{ marginBottom: '1.25rem', marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div
                    className="avatar"
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        flexShrink: 0,
                        fontSize: '0.9rem'
                    }}
                >
                    {avatarInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{authorName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>

                    <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '0 12px 12px 12px',
                        marginBottom: '0.5rem'
                    }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.5' }}>{comment.content}</p>
                    </div>

                    {currentUserId && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    transition: 'all var(--transition)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                            >
                                <MessageSquare size={14} />
                                {isReplying ? 'Cancelar' : 'Responder'}
                            </button>
                        </div>
                    )}

                    {isReplying && (
                        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                            <CommentForm
                                onSubmit={handleReplySubmit}
                                onCancel={() => setIsReplying(false)}
                                placeholder="Escribe tu respuesta..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Render Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div style={{
                            marginLeft: '1rem',
                            paddingLeft: '1rem',
                            borderLeft: '2px solid var(--border)',
                            marginTop: '1rem'
                        }}>
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    onReply={onReply}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
