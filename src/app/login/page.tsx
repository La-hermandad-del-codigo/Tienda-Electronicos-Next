'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/login.css';
import { Zap, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

type AuthMode = 'login' | 'register';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading, signIn, signUp, signInWithGoogle } = useAuth();

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Handle error from OAuth callback
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'not_admin') {
            setServerError('Esta cuenta no tiene permisos de administrador. Inicia sesión como usuario normal.');
        } else if (error === 'exchange_failed') {
            setServerError('Error al procesar la autenticación con Google. Intenta de nuevo.');
        } else if (error === 'no_code') {
            setServerError('Error en el proceso de autenticación. Intenta de nuevo.');
        }
    }, [searchParams]);

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setServerError('');
        setSuccessMessage('');
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        resetForm();
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

        if (mode === 'register' && password !== confirmPassword) {
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
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) {
                    setServerError(translateError(error.message));
                } else {
                    router.replace('/');
                }
            } else {
                const { error } = await signUp(email, password);
                if (error) {
                    setServerError(translateError(error.message));
                } else {
                    setSuccessMessage('¡Cuenta creada! Revisa tu correo para confirmar o inicia sesión.');
                    setMode('login');
                    setPassword('');
                    setConfirmPassword('');
                }
            }
        } catch {
            setServerError('Ocurrió un error inesperado. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setServerError('');
        setGoogleLoading(true);
        try {
            await signInWithGoogle(false);
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

    // Show nothing while checking auth state
    if (isLoading) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-header">
                        <span className="login-logo"><Zap size={32} /></span>
                        <h1 className="login-title">TechStore</h1>
                        <p className="login-subtitle">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Already authenticated — will redirect
    if (user) return null;

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <span className="login-logo"><Zap size={32} /></span>
                    <h1 className="login-title">TechStore</h1>
                    <p className="login-subtitle">
                        {mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
                    </p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`login-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => switchMode('login')}
                        type="button"
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className={`login-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => switchMode('register')}
                        type="button"
                    >
                        Registrarse
                    </button>
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

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        className="login-google-btn"
                        onClick={handleGoogleLogin}
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
                        Continuar con Google
                    </button>

                    <div className="login-divider">
                        <span>o</span>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="login-field">
                            <label htmlFor="login-email">Correo electrónico</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="tu@correo.com"
                                className={errors.email ? 'input-error' : ''}
                                autoComplete="email"
                                disabled={submitting}
                            />
                            {errors.email && <p className="login-field-error">{errors.email}</p>}
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">Contraseña</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                                placeholder="Mínimo 6 caracteres"
                                className={errors.password ? 'input-error' : ''}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                disabled={submitting}
                            />
                            {errors.password && <p className="login-field-error">{errors.password}</p>}
                        </div>

                        {mode === 'register' && (
                            <div className="login-field">
                                <label htmlFor="login-confirm">Confirmar contraseña</label>
                                <input
                                    id="login-confirm"
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
                        )}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={submitting}
                        >
                            {submitting && <span className="login-spinner" />}
                            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                        </button>

                        {mode === 'register' && (
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <a href="/admin/register" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                    <Shield size={16} /> Registrarse como Administrador
                                </a>
                            </div>
                        )}
                    </form>
                </div>

                <div className="login-back">
                    <a href="/">← Volver a la tienda</a>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="login-page">
                <div className="login-container">
                    <div className="login-header">
                        <span className="login-logo"><Zap size={32} /></span>
                        <h1 className="login-title">TechStore</h1>
                        <p className="login-subtitle">Cargando...</p>
                    </div>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
