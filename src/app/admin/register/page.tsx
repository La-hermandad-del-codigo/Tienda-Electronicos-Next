'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import '../../../styles/login.css';

export default function AdminRegisterPage() {
    const router = useRouter();
    const { user, isLoading, signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/');
        }
    }, [user, isLoading, router]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');

        if (!validate()) return;

        setSubmitting(true);

        try {
            const { error } = await signUp(email, password);

            if (error) {
                setServerError(translateError(error.message));
            } else {
                // Try to promote to admin after sign up
                // Need to wait for the user to be created in profiles
                // We'll use a small delay and then call the RPC
                setTimeout(async () => {
                    try {
                        const { data: { user: newUser } } = await supabase.auth.getUser();
                        if (newUser) {
                            await supabase.rpc('promote_to_admin', {
                                target_user_id: newUser.id,
                            });
                        }
                    } catch {
                        // Promotion will happen after email confirmation
                    }
                }, 1000);

                setSuccessMessage(
                    '¡Cuenta de administrador creada! Revisa tu correo para confirmar. ' +
                    'Después de confirmar tu correo, tu cuenta tendrá permisos de administrador.'
                );
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch {
            setServerError('Ocurrió un error inesperado. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const translateError = (msg: string): string => {
        if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
        if (msg.includes('User already registered')) return 'Este correo ya está registrado.';
        if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
        if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
        return msg;
    };

    if (isLoading) {
        return (
            <div className="login-page admin-register-page">
                <div className="login-container">
                    <div className="login-header">
                        <span className="login-logo">🛡️</span>
                        <h1 className="login-title">TechStore Admin</h1>
                        <p className="login-subtitle">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (user) return null;

    return (
        <div className="login-page admin-register-page">
            <div className="login-container">
                <div className="login-header">
                    <span className="login-logo">🛡️</span>
                    <h1 className="login-title">TechStore Admin</h1>
                    <p className="login-subtitle">Registro de Administrador</p>
                </div>

                <div className="admin-register-badge">
                    <span>👤 Cuenta de Administrador</span>
                </div>

                <div className="login-card">
                    {serverError && (
                        <div className="login-error">
                            <span className="login-error-icon">⚠️</span>
                            <span>{serverError}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="login-success">
                            <span>✅</span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="login-field">
                            <label htmlFor="admin-email">Correo electrónico</label>
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="admin@correo.com"
                                className={errors.email ? 'input-error' : ''}
                                autoComplete="email"
                                disabled={submitting}
                            />
                            {errors.email && <p className="login-field-error">{errors.email}</p>}
                        </div>

                        <div className="login-field">
                            <label htmlFor="admin-password">Contraseña</label>
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                                placeholder="Mínimo 6 caracteres"
                                className={errors.password ? 'input-error' : ''}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            {errors.password && <p className="login-field-error">{errors.password}</p>}
                        </div>

                        <div className="login-field">
                            <label htmlFor="admin-confirm">Confirmar contraseña</label>
                            <input
                                id="admin-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                                placeholder="Repite tu contraseña"
                                className={errors.confirm ? 'input-error' : ''}
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                            {errors.confirm && <p className="login-field-error">{errors.confirm}</p>}
                        </div>

                        <button
                            type="submit"
                            className="login-submit admin-submit"
                            disabled={submitting}
                        >
                            {submitting && <span className="login-spinner" />}
                            🛡️ Crear cuenta de Administrador
                        </button>
                    </form>
                </div>

                <div className="login-back">
                    <a href="/">← Volver a la tienda</a>
                    <span style={{ margin: '0 0.5rem' }}>|</span>
                    <a href="/login">Iniciar sesión como usuario</a>
                </div>
            </div>
        </div>
    );
}
