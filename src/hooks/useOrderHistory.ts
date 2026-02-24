'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface OrderHistoryItem {
    id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
}

export interface OrderRecord {
    id: string;
    user_id: string;
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
    items: OrderHistoryItem[];
}

export function useOrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!user) {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (ordersError) {
                setError(ordersError.message);
                setIsLoading(false);
                return;
            }

            if (!ordersData || ordersData.length === 0) {
                setOrders([]);
                setIsLoading(false);
                return;
            }

            // Fetch items for all orders
            const orderIds = ordersData.map((o: { id: string }) => o.id);
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .in('order_id', orderIds);

            if (itemsError) {
                setError(itemsError.message);
                setIsLoading(false);
                return;
            }

            // Map items to their orders
            const ordersWithItems: OrderRecord[] = ordersData.map((order: Record<string, string>) => ({
                id: order.id,
                user_id: order.user_id,
                total: Number(order.total),
                status: order.status,
                payment_method: order.payment_method,
                created_at: order.created_at,
                items: (itemsData || [])
                    .filter((item: Record<string, string>) => item.order_id === order.id)
                    .map((item: Record<string, string | number>) => ({
                        id: item.id as string,
                        product_id: item.product_id as string,
                        product_name: item.product_name as string,
                        product_price: Number(item.product_price),
                        quantity: Number(item.quantity),
                    })),
            }));

            setOrders(ordersWithItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        isLoading,
        error,
        refetch: fetchOrders,
    };
}
