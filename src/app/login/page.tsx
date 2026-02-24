'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/login.css';
import { Zap, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
    const router = useRouter();
    const { user, isLoading, signIn, signUp } = useAuth();

    const [mode, setMode] = useState<AuthMode>('login');
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
