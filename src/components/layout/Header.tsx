'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, ClipboardList, UserPlus, ShoppingCart } from 'lucide-react';

interface HeaderProps {
    cartCount: number;
    onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
    const { user, profile, isLoading, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <header className="store-header">
            <div className="header-content">
                <div className="header-brand">
                    <span className="header-logo"><Zap size={28} /></span>
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
                                    <a href="/orders" className="btn btn-sm btn-ghost header-orders-btn" title="Mis pedidos" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <ClipboardList size={16} /> Mis pedidos
                                    </a>

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
                        <span className="cart-button-icon"><ShoppingCart size={24} /></span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
};
