"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { CartItem } from '../types/product';
import { supabase } from '../lib/supabase';

type TaskState = 'idle' | 'loading' | 'success' | 'error';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface CheckoutResult {
  orderId: string;
  total: number;
  createdAt: string;
}

export function useCheckout() {
  const [validationState, setValidationState] = useState<TaskState>('idle');
  const [paymentState, setPaymentState] = useState<TaskState>('idle');
  const [orderState, setOrderState] = useState<TaskState>('idle');

  const [orderResult, setOrderResult] = useState<CheckoutResult | null>(null);
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

  // Simula validación de stock
  const simulateValidateStock = useCallback(async () => {
    await wait(400 + Math.random() * 600);
    return true;
  }, []);

  // Simula procesamiento de pago
  const simulatePayment = useCallback(async () => {
    await wait(600 + Math.random() * 1000);
    return true;
  }, []);

  // Guarda la orden en Supabase
  const saveOrderToSupabase = useCallback(async (
    userId: string,
    items: CartItem[],
    total: number,
    paymentMethod: string = 'card_simulated'
  ): Promise<CheckoutResult> => {
    // 1. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: 'completed',
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // 2. Insert order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // 3. Decrement stock for each purchased product
    for (const item of items) {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product.id);
    }

    return {
      orderId: orderData.id,
      total: Number(orderData.total),
      createdAt: orderData.created_at,
    };
  }, []);

  const startCheckout = useCallback(async (
    userId: string,
    items: CartItem[],
    total: number,
    paymentMethod: string = 'card_simulated'
  ) => {
    setError(null);
    setOrderResult(null);

    // Step 1: Validate stock
    setValidationState('loading');
    try {
      await simulateValidateStock();
      setValidationState('success');
    } catch (err) {
      setValidationState('error');
      setError(err instanceof Error ? err.message : 'Error al validar stock');
      return null;
    }

    // Step 2: Process payment
    setPaymentState('loading');
    try {
      await simulatePayment();
      setPaymentState('success');
    } catch (err) {
      setPaymentState('error');
      setError(err instanceof Error ? err.message : 'Error al procesar pago');
      return null;
    }

    // Step 3: Create order in Supabase
    setOrderState('loading');
    try {
      const result = await saveOrderToSupabase(userId, items, total, paymentMethod);
      setOrderState('success');
      setOrderResult(result);
      return result;
    } catch (err) {
      setOrderState('error');
      setError(err instanceof Error ? err.message : 'Error al crear orden');
      return null;
    }
  }, [simulateValidateStock, simulatePayment, saveOrderToSupabase]);

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
