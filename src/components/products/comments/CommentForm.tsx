import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    placeholder = 'Escribe un comentario...',
    autoFocus = false,
    onCancel
}) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onSubmit(content.trim());
            setContent('');
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Error enviando comentario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form form-group">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={isSubmitting}
                autoFocus={autoFocus}
                rows={3}
                style={{
                    resize: 'vertical',
                    minHeight: '80px',
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--muted)',
                    color: 'var(--foreground)'
                }}
            />
            <div className="form-actions">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="btn btn-secondary btn-sm"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="btn btn-sm"
                >
                    <Send size={16} />
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
            </div>
        </form>
    );
};
