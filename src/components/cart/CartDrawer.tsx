"use client";

import React, { useState } from 'react';
import { PaymentGateway } from './PaymentGateway';
import { CartItem as CartItemType } from '../../types/product';
import { EmptyState } from '../ui/EmptyState';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItemType[];
    cartTotal: number;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onClearCart: () => void;
    isAuthenticated: boolean;
    onLoginRedirect: () => void;
    onCheckoutSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen,
    onClose,
    items,
    cartTotal,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    isAuthenticated,
    onLoginRedirect,
    onCheckoutSuccess,
}) => {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handleCheckoutClick = () => {
        if (!isAuthenticated) {
            onLoginRedirect();
            return;
        }
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = () => {
        onClearCart();
        setIsPaymentOpen(false);
        onCheckoutSuccess();
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && <div className="drawer-overlay" onClick={onClose} />}

            {/* Drawer */}
            <aside className={`cart-drawer ${isOpen ? 'cart-drawer-open' : ''}`}>
                <div className="cart-drawer-header">
                    <h2>🛒 Carrito</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar carrito">
                        ✕
                    </button>
                </div>

                <div className="cart-drawer-body">
                    {isPaymentOpen ? (
                        <PaymentGateway
                            isOpen={isPaymentOpen}
                            onClose={() => setIsPaymentOpen(false)}
                            items={items}
                            cartTotal={cartTotal}
                            onSuccess={handlePaymentSuccess}
                        />
                    ) : items.length === 0 ? (
                        <EmptyState
                            icon="🛒"
                            title="Carrito vacío"
                            description="Agrega productos para comenzar tu compra."
                        />
                    ) : (
                        <div className="cart-items">
                            {items.map(item => (
                                <div key={item.product.id} className="cart-item">
                                    <div
                                        className="cart-item-image"
                                        style={{ backgroundImage: `url(${item.product.image_url})` }}
                                    />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.product.name}</h4>
                                        <span className="cart-item-price">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </span>
                                        <div className="cart-item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                                aria-label="Reducir cantidad"
                                            >
                                                −
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                                aria-label="Aumentar cantidad"
                                            >
                                                +
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-danger cart-item-remove"
                                                onClick={() => onRemoveItem(item.product.id)}
                                                aria-label="Eliminar del carrito"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && !isPaymentOpen && (
                    <div className="cart-drawer-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
                        </div>

                        {!isAuthenticated && (
                            <div className="cart-login-notice">
                                <p>🔒 Inicia sesión para completar tu compra</p>
                            </div>
                        )}

                        <button
                            className="btn cart-checkout-btn"
                            style={{ width: '100%' }}
                            onClick={handleCheckoutClick}
                        >
                            {isAuthenticated ? '💳 Proceder al pago' : '🔑 Iniciar sesión para comprar'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            onClick={onClearCart}
                        >
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};