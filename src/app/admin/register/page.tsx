'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import '../../../styles/login.css';
import { Shield, User, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminRegisterPage() {
    const router = useRouter();
    const { user, isLoading, signUp, signInWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

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

    const handleGoogleAdmin = async () => {
        setServerError('');
        setGoogleLoading(true);
        try {
            await signInWithGoogle(true);
        } catch {
            setServerError('Error al iniciar sesión con Google.');
            setGoogleLoading(false);
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
                        <span className="login-logo"><Shield size={32} /></span>
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
                    <span className="login-logo"><Shield size={32} /></span>
                    <h1 className="login-title">TechStore Admin</h1>
                    <p className="login-subtitle">Registro de Administrador</p>
                </div>

                <div className="admin-register-badge">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><User size={16} /> Cuenta de Administrador</span>
                </div>

                <div className="login-card">
                    {serverError && (
                        <div className="login-error">
                            <span className="login-error-icon"><AlertTriangle size={20} /></span>
                            <span>{serverError}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="login-success">
                            <span><CheckCircle size={20} /></span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Google OAuth Button for Admin */}
                    <button
                        type="button"
                        className="login-google-btn"
                        onClick={handleGoogleAdmin}
                        disabled={googleLoading || submitting}
                    >
                        {googleLoading ? (
                            <span className="login-spinner" />
                        ) : (
                            <svg className="login-google-icon" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continuar con Google como Admin
                    </button>

                    <div className="login-divider">
                        <span>o</span>
                    </div>

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
                            <Shield size={18} className="inline mr-2" /> Crear cuenta de Administrador
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
