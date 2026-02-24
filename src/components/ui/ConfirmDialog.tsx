'use client';

import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Eliminar',
    cancelLabel = 'Cancelar',
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--muted-foreground)' }}>{message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={onClose}>
                    {cancelLabel}
                </button>
                <button className="btn btn-danger" onClick={handleConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
};
