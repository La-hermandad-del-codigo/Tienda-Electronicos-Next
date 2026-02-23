'use client';

import React, { useState } from 'react';
import { useOrderHistory, OrderRecord } from '../../hooks/useOrderHistory';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { orders, isLoading, error } = useOrderHistory();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [authLoading, user, router]);

    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="orders-page">
                <div className="orders-container">
                    <p className="orders-loading">Cargando...</p>
                </div>
            </div>
        );
    }

    const toggleExpanded = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            completed: { label: 'Completado', className: 'badge-success' },
            pending: { label: 'Pendiente', className: 'badge-warning' },
            failed: { label: 'Fallido', className: 'badge-danger' },
        };
        const s = map[status] || { label: status, className: '' };
        return <span className={`badge ${s.className}`}>{s.label}</span>;
    };

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <a href="/" className="orders-back">← Volver a la tienda</a>
                    <h1>📋 Historial de Pedidos</h1>
                    <p className="orders-subtitle">Aquí puedes ver todas tus compras realizadas</p>
                </div>

                {isLoading && (
                    <div className="orders-loading-state">
                        <div className="payment-spinner" />
                        <p>Cargando pedidos...</p>
                    </div>
                )}

                {error && (
                    <div className="orders-error">
                        <p>❌ Error al cargar pedidos: {error}</p>
                    </div>
                )}

                {!isLoading && !error && orders.length === 0 && (
                    <div className="orders-empty">
                        <span className="orders-empty-icon">📦</span>
                        <h3>No tienes pedidos aún</h3>
                        <p>¡Explora nuestra tienda y realiza tu primera compra!</p>
                        <a href="/" className="btn">Ir a la tienda</a>
                    </div>
                )}

                {!isLoading && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order: OrderRecord) => (
                            <div
                                key={order.id}
                                className={`order-card ${expandedId === order.id ? 'order-card-expanded' : ''}`}
                            >
                                <div
                                    className="order-card-header"
                                    onClick={() => toggleExpanded(order.id)}
                                >
                                    <div className="order-card-info">
                                        <span className="order-card-id">
                                            🧾 Orden #{order.id.slice(0, 8)}
                                        </span>
                                        <span className="order-card-date">
                                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <div className="order-card-meta">
                                        {statusBadge(order.status)}
                                        <span className="order-card-total">${order.total.toFixed(2)}</span>
                                        <span className={`order-chevron ${expandedId === order.id ? 'order-chevron-open' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {expandedId === order.id && (
                                    <div className="order-card-body">
                                        <div className="order-items-list">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="order-item-row">
                                                    <span className="order-item-name">
                                                        {item.product_name}
                                                    </span>
                                                    <span className="order-item-qty">×{item.quantity}</span>
                                                    <span className="order-item-price">
                                                        ${(item.product_price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-card-footer">
                                            <span>Método: 💳 {order.payment_method === 'card_simulated' ? 'Tarjeta (simulada)' : order.payment_method}</span>
                                            <strong>Total: ${order.total.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
