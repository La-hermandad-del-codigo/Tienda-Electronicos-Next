"use client";

import React, { useEffect } from 'react';
import { useCheckout } from '../../hooks/useCheckout';
import { useCart } from '../../hooks/useCart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParentClear?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onParentClear }) => {
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

  const { items, cartTotal } = useCart();
  const [localOrder, setLocalOrder] = React.useState(orderResult ?? null);

  useEffect(() => {
    if (isOpen) {
      // iniciar automáticamente al abrir: limpiar estado previo y lanzar checkout
      setLocalOrder(null);
      reset();
      startCheckout().catch(() => {
        // errores ya manejados en el hook
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Guardar una copia local de la orden antes de limpiar el carrito, y luego avisar al padre.
  useEffect(() => {
    if (orderResult) {
      setLocalOrder(orderResult);
      try {
        onParentClear?.();
      } catch (e) {
        // ignorar errores del handler del padre
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderResult]);

  const handleClose = () => {
    // Cuando el usuario cierre manualmente, resetear el hook de checkout y la copia local
    reset();
    setLocalOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-panel">
      <div className="checkout-header">
        <h3>Proceso de pago</h3>
        <button className="modal-close" onClick={handleClose} aria-label="Cerrar">
          ✕
        </button>
      </div>

      <div className="checkout-body">
          <div className="checkout-steps">
            <div className="step">
              <strong>1. Validar stock</strong>
              <span className={`step-state step-${validationState}`}>{validationState}</span>
            </div>

            <div className="step">
              <strong>2. Procesar pago</strong>
              <span className={`step-state step-${paymentState}`}>{paymentState}</span>
            </div>

            <div className="step">
              <strong>3. Generar orden</strong>
              <span className={`step-state step-${orderState}`}>{orderState}</span>
            </div>
          </div>

          {processing && <p>Procesando... espera a que terminen las tareas.</p>}

          {error && (
            <div className="alert alert-error">
              <p>Error: {error}</p>
              <div className="modal-actions">
                <button
                  className="btn"
                  onClick={() => {
                    reset();
                    startCheckout();
                  }}
                >
                  Reintentar
                </button>
                <button className="btn btn-secondary" onClick={handleClose}>
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {localOrder && (
            <div className="order-summary">
              <h4>Orden creada</h4>
              <p>Id: {localOrder.id}</p>
              <p>Total: ${localOrder.total.toFixed(2)}</p>
              <p>Fecha: {new Date(localOrder.createdAt).toLocaleString()}</p>
              <div className="order-items">
                {localOrder.items.map(i => (
                  <div key={i.product.id} className="order-item">
                    <span>{i.product.name} x {i.quantity}</span>
                    <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={handleClose}>
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {!processing && !error && !orderResult && (
            <div>
              <p>Productos a procesar: {items.length} | Total: ${cartTotal.toFixed(2)}</p>
            </div>
          )}
      </div>
    </div>
  );
};
