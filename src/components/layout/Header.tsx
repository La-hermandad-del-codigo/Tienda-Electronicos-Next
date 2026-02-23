'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    cartCount: number;
    onCartClick: () => void;
    onAdminRegisterClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick, onAdminRegisterClick }) => {
    const { user, profile, isLoading, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className="store-header">
            <div className="header-content">
                <div className="header-brand">
                    <span className="header-logo">⚡</span>
                    <div>
                        <h1 className="header-title">TechStore</h1>
                        <p className="header-subtitle">Tu tienda de electrónicos</p>
                    </div>
                </div>

                <div className="header-actions">
                    {!isLoading && (
                        <>
                            {user ? (
                                <div className="header-user">
                                    <span className="header-user-email" title={profile?.email ?? user.email ?? ''}>
                                        {profile?.role === 'admin' && <span className="header-role-badge">Admin</span>}
                                        {user.email}
                                    </span>
                                    <a href="/orders" className="btn btn-sm btn-ghost header-orders-btn" title="Mis pedidos">
                                        📋 Mis pedidos
                                    </a>
                                    <button
                                        className="btn btn-sm btn-ghost header-admin-btn"
                                        onClick={onAdminRegisterClick}
                                        title="Registrar Admin"
                                    >
                                        👤 Registrar Admin
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            ) : (
                                <a href="/login" className="btn btn-sm">
                                    Iniciar sesión
                                </a>
                            )}
                        </>
                    )}

                    <button className="cart-button" onClick={onCartClick} aria-label="Abrir carrito">
                        <span className="cart-button-icon">🛒</span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
};
