'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export const AdminRegisterModal: React.FC<AdminRegisterModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'El correo es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Ingresa un correo válido';
        }

        if (!password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        if (password !== confirmPassword) {
            newErrors.confirm = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const translateError = (msg: string): string => {
        if (msg.includes('User already registered')) return 'Este correo ya está registrado.';
        if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
        return msg;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        try {
            // Sign up the new admin user
            const { data, error } = await supabase.auth.signUp({ email, password });

            if (error) {
                onError(translateError(error.message));
                setSubmitting(false);
                return;
            }

            // Promote the new user to admin
            if (data.user) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const { error: rpcError } = await supabase.rpc('promote_to_admin', {
                    target_user_id: data.user.id,
                });

                if (rpcError) {
                    console.error('Error promoting to admin:', rpcError.message);
                }
            }

            // Sign out current session and sign in as the new admin
            await supabase.auth.signOut();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                onSuccess(
                    `¡Cuenta de admin creada para ${email}! ` +
                    'No se pudo iniciar sesión automáticamente. Por favor inicia sesión manualmente.'
                );
            } else {
                onSuccess(`¡Sesión iniciada como admin: ${email}!`);
            }

            resetForm();
            onClose();
        } catch {
            onError('Ocurrió un error inesperado. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content admin-register-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🛡️ Registrar Administrador</h2>
                    <button className="modal-close" onClick={handleClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    <div className="admin-register-badge" style={{ marginBottom: '1rem' }}>
                        <span>👤 Nueva cuenta de Administrador</span>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="admin-reg-email">Correo electrónico</label>
                            <input
                                id="admin-reg-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="admin@correo.com"
                                className={errors.email ? 'input-error' : ''}
                                autoComplete="email"
                                disabled={submitting}
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="admin-reg-password">Contraseña</label>
                            <input
                                id="admin-reg-password"
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                                placeholder="Mínimo 6 caracteres"
                                className={errors.password ? 'input-error' : ''}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="admin-reg-confirm">Confirmar contraseña</label>
                            <input
                                id="admin-reg-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                                placeholder="Repite tu contraseña"
                                className={errors.confirm ? 'input-error' : ''}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn admin-submit"
                                disabled={submitting}
                            >
                                {submitting && <span className="login-spinner" />}
                                🛡️ Crear Admin
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
