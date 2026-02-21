'use client';

import { useState, useCallback, useRef } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = `toast-${++counterRef.current}`;
        const toast: Toast = { id, message, type };
        setToasts(prev => [...prev, toast]);

        // Auto-dismiss después de 3 segundos
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

    return { toasts, addToast, removeToast, success, error, info };
}
