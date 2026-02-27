'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import '../../../styles/login.css';
import { Store, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ComercianteRegisterPage() {
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
                // Try to promote to comerciante after sign up
                // Need to wait for the user to be created in profiles
                // We'll use a small delay and then call the RPC
                setTimeout(async () => {
                    try {
                        const { data: { user: newUser } } = await supabase.auth.getUser();
                        if (newUser) {
                            await supabase.rpc('promote_to_comerciante', {
                                user_email: email,
                            });
                        }
                    } catch {
                        // Promotion will happen after email confirmation
                    }
                }, 1000);

                setSuccessMessage(
                    '¡Cuenta de comerciante creada! Revisa tu correo para confirmar. ' +
                    'Después de confirmar, tu cuenta tendrá permisos para gestionar tus propios productos.'
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
            <div className="login-page">
                <div className="login-container">
                    <div className="login-header">
                        <span className="login-logo"><Store size={32} /></span>
                        <h1 className="login-title">TechStore Comerciante</h1>
                        <p className="login-subtitle">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (user) return null;

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <span className="login-logo"><Store size={32} /></span>
                    <h1 className="login-title">TechStore Comerciantes</h1>
                    <p className="login-subtitle">Únete para vender tus productos</p>
                </div>

                <div className="admin-register-badge" style={{
                    background: 'var(--success-bg, rgba(16, 185, 129, 0.15))',
                    color: 'var(--success, #10b981)',
                    border: '1px solid var(--success-bg, rgba(16, 185, 129, 0.3))'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}><Store size={16} /> Cuenta de Comerciante</span>
                </div>

                <div className="login-card" style={{ marginTop: '1rem' }}>
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
                            <label htmlFor="comerciante-email">Correo electrónico</label>
                            <input
                                id="comerciante-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="comerciante@correo.com"
                                className={errors.email ? 'input-error' : ''}
                                autoComplete="email"
                                disabled={submitting}
                            />
                            {errors.email && <p className="login-field-error">{errors.email}</p>}
                        </div>

                        <div className="login-field">
                            <label htmlFor="comerciante-password">Contraseña</label>
                            <input
                                id="comerciante-password"
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
                            <label htmlFor="comerciante-confirm">Confirmar contraseña</label>
                            <input
                                id="comerciante-confirm"
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
                            className="login-submit"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            disabled={submitting}
                        >
                            {submitting && <span className="login-spinner" />}
                            <Store size={18} className="inline mr-2" /> Crear cuenta de Comerciante
                        </button>
                    </form>
                </div>

                <div className="login-back">
                    <a href="/">← Volver a la tienda</a>
                    <span style={{ margin: '0 0.5rem', color: 'var(--muted-foreground)' }}>|</span>
                    <a href="/login">Iniciar sesión normal</a>
                </div>
            </div>
        </div>
    );
}
