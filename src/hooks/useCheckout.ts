"use client";

import { useState, useCallback, useMemo } from 'react';
import { CartItem, Order } from '../types/product';
import { useProducts } from './useProducts';
import { useCart } from './useCart';
import { generateId } from '../utils/idGenerator';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

type TaskState = 'idle' | 'loading' | 'success' | 'error';

const ORDERS_KEY = 'techstore_orders';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useCheckout() {
  const { allProducts, getProductById } = useProducts();
  const { items: cartItems, cartTotal, clearCart, isLoaded } = useCart();

  const [validationState, setValidationState] = useState<TaskState>('idle');
  const [paymentState, setPaymentState] = useState<TaskState>('idle');
  const [orderState, setOrderState] = useState<TaskState>('idle');

  const [orderResult, setOrderResult] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processing = useMemo(() => {
    return [validationState, paymentState, orderState].some(s => s === 'loading');
  }, [validationState, paymentState, orderState]);

  const reset = useCallback(() => {
    setValidationState('idle');
    setPaymentState('idle');
    setOrderState('idle');
    setOrderResult(null);
    setError(null);
  }, []);

  // Simula validación de stock: comprueba cantidades contra productos actuales
  const simulateValidateStock = useCallback(async (items: CartItem[]) => {
    // pequeña latencia aleatoria
    await wait(300 + Math.random() * 800);

    // posibilidad aleatoria de fallo en validación (simulación de error de servicio)
    if (Math.random() < 0.08) {
      throw new Error('Error de validación (servicio no disponible)');
    }

    for (const item of items) {
      const product = getProductById(item.product.id) || allProducts.find(p => p.id === item.product.id);
      if (!product) {
        throw new Error(`El producto "${item.product.name}" ya no existe`);
      }
      if (item.quantity > product.stock) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }
    }

    return true;
  }, [allProducts, getProductById]);

  // Simula procesamiento de pago
  const simulatePayment = useCallback(async (total: number) => {
    await wait(500 + Math.random() * 1200);
    // mayor probabilidad de éxito, pero con posibilidad de falla
    if (Math.random() < 0.12) {
      throw new Error('Pago rechazado por el emisor');
    }
    return { paymentId: generateId('pay'), charged: total };
  }, []);

  // Simula generación de orden (puede fallar también)
  const simulateGenerateOrder = useCallback(async (items: CartItem[], total: number) => {
    await wait(200 + Math.random() * 600);
    if (Math.random() < 0.06) {
      throw new Error('Error al generar la orden');
    }
    const newOrder: Order = {
      id: generateId('order'),
      items,
      total,
      createdAt: new Date().toISOString(),
      status: 'created',
    };
    return newOrder;
  }, []);

  const startCheckout = useCallback(async () => {
    setError(null);
    setOrderResult(null);

    let items = cartItems;
    let total = cartTotal;

    // Asegurarnos de no usar `cartTotal` antes de que `useCart` haya cargado desde localStorage.
    // Si aún no está cargado, leer desde storage como fallback para obtener el total correcto.
    if (!isLoaded) {
      const stored = getFromStorage<CartItem[]>('techstore_cart', []);
      items = stored;
      total = stored.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }

    setValidationState('loading');
    setPaymentState('loading');
    setOrderState('loading');

    // Iniciar las tres tareas en paralelo y actualizar sus estados independientemente
    const validationPromise = simulateValidateStock(items)
      .then(() => setValidationState('success'))
      .catch(err => {
        setValidationState('error');
        setError(String(err.message || err));
        throw err;
      });

    const paymentPromise = simulatePayment(total)
      .then(() => setPaymentState('success'))
      .catch(err => {
        setPaymentState('error');
        setError(String(err.message || err));
        throw err;
      });

    let generatedOrder: Order | null = null;
    const orderPromise = simulateGenerateOrder(items, total)
      .then(order => {
        generatedOrder = order;
        setOrderState('success');
        return order;
      })
      .catch(err => {
        setOrderState('error');
        setError(String(err.message || err));
        throw err;
      });

    // Esperar a que todas terminen (settled) y luego decidir
    const results = await Promise.allSettled([validationPromise, paymentPromise, orderPromise]);

    const anyRejected = results.some(r => r.status === 'rejected');
    if (anyRejected) {
      // Ya se establecieron estados individuales y error, mantener orderResult null
      return;
    }

    // Todas las tareas exitosas: persistir orden y vaciar carrito
    if (generatedOrder) {
      const existing = getFromStorage<Order[]>(ORDERS_KEY, []);
      saveToStorage(ORDERS_KEY, [generatedOrder, ...existing]);
      setOrderResult(generatedOrder);
      // vaciar carrito
      clearCart();
    }
  }, [cartItems, cartTotal, clearCart, simulateGenerateOrder, simulatePayment, simulateValidateStock]);

  return {
    startCheckout,
    validationState,
    paymentState,
    orderState,
    orderResult,
    error,
    processing,
    reset,
  } as const;
}
