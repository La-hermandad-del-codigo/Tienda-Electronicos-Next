"use client";

import React, { useState } from 'react';
import { CartItem } from '../../types/product';
import { useCheckout } from '../../hooks/useCheckout';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    cartTotal: number;
    onSuccess: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
    isOpen,
    onClose,
    items,
    cartTotal,
    onSuccess,
}) => {
    const { user } = useAuth();
    const {
        startCheckout,
        validationState,
        paymentState,
        orderState,
        orderResult,
        error,
        processing,
        reset,
    } = useCheckout();

    // Card form state
    const [cardName, setCardName] = useState('Juan Pérez');
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [cardExpiry, setCardExpiry] = useState('12/28');
    const [cardCvv, setCardCvv] = useState('123');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showProcessing, setShowProcessing] = useState(false);

    const formatCardNumber = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiry = (value: string): string => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }
        return digits;
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!cardName.trim()) errors.cardName = 'Nombre requerido';
        const digits = cardNumber.replace(/\s/g, '');
        if (digits.length !== 16) errors.cardNumber = '16 dígitos requeridos';
        const expiryDigits = cardExpiry.replace(/\D/g, '');
        if (expiryDigits.length !== 4) {
            errors.cardExpiry = 'Formato MM/YY';
        } else {
            const month = parseInt(expiryDigits.slice(0, 2));
            if (month < 1 || month > 12) errors.cardExpiry = 'Mes inválido';
        }
        if (cardCvv.length !== 3) errors.cardCvv = '3 dígitos';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePay = async () => {
        if (!validateForm() || !user) return;

        setShowProcessing(true);
        const result = await startCheckout(user.id, items, cartTotal, 'card_simulated');

        if (result) {
            // Payment succeeded — keep showing result
        }
    };

    const handleClose = () => {
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setFormErrors({});
        setShowProcessing(false);
        reset();
        onClose();
    };

    const handleSuccessClose = () => {
        onSuccess();
        handleClose();
    };

    if (!isOpen) return null;

    const stepIcon = (state: string) => {
        switch (state) {
            case 'loading': return '⏳';
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '⬜';
        }
    };

    return (
        <div className="payment-gateway">
            <div className="payment-header">
                <h3>💳 Pasarela de Pago</h3>
                {!processing && (
                    <button className="modal-close" onClick={handleClose} aria-label="Cerrar">
                        ✕
                    </button>
                )}
            </div>

            <div className="payment-body">
                {!showProcessing ? (
                    <>
                        {/* Order summary */}
                        <div className="payment-summary">
                            <h4>Resumen del pedido</h4>
                            <div className="payment-items">
                                {items.map(item => (
                                    <div key={item.product.id} className="payment-item">
                                        <span>{item.product.name} × {item.quantity}</span>
                                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="payment-total-line">
                                <strong>Total a pagar</strong>
                                <strong className="payment-total-amount">${cartTotal.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* Card form */}
                        <div className="payment-card-form">
                            <div className="payment-card-visual">
                                <div className="card-chip">💳</div>
                                <div className="card-number-display">
                                    {cardNumber || '•••• •••• •••• ••••'}
                                </div>
                                <div className="card-bottom">
                                    <span>{cardName || 'NOMBRE DEL TITULAR'}</span>
                                    <span>{cardExpiry || 'MM/YY'}</span>
                                </div>
                            </div>

                            <div className="payment-field">
                                <label htmlFor="card-name">Nombre en la tarjeta</label>
                                <input
                                    id="card-name"
                                    type="text"
                                    value={cardName}
                                    onChange={e => { setCardName(e.target.value.toUpperCase()); setFormErrors(p => ({ ...p, cardName: '' })); }}
                                    placeholder="NOMBRE COMPLETO"
                                    className={formErrors.cardName ? 'input-error' : ''}
                                    disabled={processing}
                                />
                                {formErrors.cardName && <p className="field-error">{formErrors.cardName}</p>}
                            </div>

                            <div className="payment-field">
                                <label htmlFor="card-number">Número de tarjeta</label>
                                <input
                                    id="card-number"
                                    type="text"
                                    value={cardNumber}
                                    onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setFormErrors(p => ({ ...p, cardNumber: '' })); }}
                                    placeholder="0000 0000 0000 0000"
                                    className={formErrors.cardNumber ? 'input-error' : ''}
                                    disabled={processing}
                                    maxLength={19}
                                />
                                {formErrors.cardNumber && <p className="field-error">{formErrors.cardNumber}</p>}
                            </div>

                            <div className="payment-field-row">
                                <div className="payment-field">
                                    <label htmlFor="card-expiry">Vencimiento</label>
                                    <input
                                        id="card-expiry"
                                        type="text"
                                        value={cardExpiry}
                                        onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setFormErrors(p => ({ ...p, cardExpiry: '' })); }}
                                        placeholder="MM/YY"
                                        className={formErrors.cardExpiry ? 'input-error' : ''}
                                        disabled={processing}
                                        maxLength={5}
                                    />
                                    {formErrors.cardExpiry && <p className="field-error">{formErrors.cardExpiry}</p>}
                                </div>
                                <div className="payment-field">
                                    <label htmlFor="card-cvv">CVV</label>
                                    <input
                                        id="card-cvv"
                                        type="text"
                                        value={cardCvv}
                                        onChange={e => { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); setFormErrors(p => ({ ...p, cardCvv: '' })); }}
                                        placeholder="123"
                                        className={formErrors.cardCvv ? 'input-error' : ''}
                                        disabled={processing}
                                        maxLength={3}
                                    />
                                    {formErrors.cardCvv && <p className="field-error">{formErrors.cardCvv}</p>}
                                </div>
                            </div>

                            <button
                                className="payment-pay-btn"
                                onClick={handlePay}
                                disabled={processing}
                            >
                                🔒 Pagar ${cartTotal.toFixed(2)}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Processing steps */}
                        <div className="payment-processing">
                            <div className="payment-steps">
                                <div className={`payment-step payment-step-${validationState}`}>
                                    <span className="step-icon">{stepIcon(validationState)}</span>
                                    <span>Validando stock disponible</span>
                                </div>
                                <div className={`payment-step payment-step-${paymentState}`}>
                                    <span className="step-icon">{stepIcon(paymentState)}</span>
                                    <span>Procesando pago</span>
                                </div>
                                <div className={`payment-step payment-step-${orderState}`}>
                                    <span className="step-icon">{stepIcon(orderState)}</span>
                                    <span>Generando orden</span>
                                </div>
                            </div>

                            {processing && (
                                <div className="payment-spinner-container">
                                    <div className="payment-spinner" />
                                    <p>Procesando tu pago...</p>
                                </div>
                            )}

                            {error && (
                                <div className="payment-error">
                                    <p>❌ {error}</p>
                                    <div className="payment-actions">
                                        <button className="btn" onClick={() => { reset(); setShowProcessing(false); }}>
                                            Reintentar
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleClose}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {orderResult && (
                                <div className="payment-success">
                                    <div className="payment-success-icon">🎉</div>
                                    <h4>¡Pago completado!</h4>
                                    <p className="payment-order-id">Orden: {orderResult.orderId.slice(0, 8)}...</p>
                                    <p>Total: <strong>${orderResult.total.toFixed(2)}</strong></p>
                                    <p className="payment-date">{new Date(orderResult.createdAt).toLocaleString()}</p>
                                    <button className="btn payment-done-btn" onClick={handleSuccessClose}>
                                        ✓ Listo
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
