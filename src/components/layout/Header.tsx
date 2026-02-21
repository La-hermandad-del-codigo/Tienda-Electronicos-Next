'use client';

import React from 'react';

interface HeaderProps {
    cartCount: number;
    onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick }) => {
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
                <button className="cart-button" onClick={onCartClick} aria-label="Abrir carrito">
                    <span className="cart-button-icon">🛒</span>
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
            </div>
        </header>
    );
};
