'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types/product';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

const STORAGE_KEY = 'techstore_cart';

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Cargar carrito desde localStorage al montar
    useEffect(() => {
        const stored = getFromStorage<CartItem[]>(STORAGE_KEY, []);
        setItems(stored);
        setIsLoaded(true);
    }, []);

    // Persistir en localStorage
    const persistCart = useCallback((updated: CartItem[]) => {
        setItems(updated);
        saveToStorage(STORAGE_KEY, updated);
    }, []);

    const addToCart = useCallback((product: Product): void => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            let updated: CartItem[];
            if (existing) {
                updated = prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                updated = [...prev, { product, quantity: 1 }];
            }
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, []);

    const removeFromCart = useCallback((productId: string): void => {
        setItems(prev => {
            const updated = prev.filter(item => item.product.id !== productId);
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number): void => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => {
            const updated = prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, [removeFromCart]);

    const clearCart = useCallback((): void => {
        persistCart([]);
    }, [persistCart]);

    // Sincronizar carrito cuando se eliminan/actualizan productos
    const syncCartWithProducts = useCallback((updatedProducts: Product[]): void => {
        setItems(prev => {
            const updated = prev
                .map(item => {
                    const product = updatedProducts.find(p => p.id === item.product.id);
                    if (!product) return null; // Producto eliminado
                    return { ...item, product }; // Actualizar datos del producto
                })
                .filter(Boolean) as CartItem[];
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, []);

    const checkout = useCallback(async (): Promise<boolean> => {
        if (items.length === 0) return false;

        setIsCheckingOut(true);

        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 2000));

        clearCart();
        setIsCheckingOut(false);
        return true;
    }, [items.length, clearCart]);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return {
        items,
        isLoaded,
        isCheckingOut,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartWithProducts,
        checkout,
        cartCount,
        cartTotal,
    };
}
