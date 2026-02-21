'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchProducts, fetchPrices, fetchInventory, Product, Price, Inventory } from '../services/electronicsService';

interface ProcessState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface StoreContextType {
    products: ProcessState<Product[]>;
    prices: ProcessState<Price[]>;
    inventory: ProcessState<Inventory[]>;
    isProcessing: boolean;
    runAllProcesses: () => Promise<void>;
    integratedData: IntegratedProduct[];
}

export interface IntegratedProduct extends Product {
    price?: number;
    stock?: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<ProcessState<Product[]>>({ data: null, loading: false, error: null });
    const [prices, setPrices] = useState<ProcessState<Price[]>>({ data: null, loading: false, error: null });
    const [inventory, setInventory] = useState<ProcessState<Inventory[]>>({ data: null, loading: false, error: null });

    const runAllProcesses = useCallback(async () => {
        setProducts({ data: null, loading: true, error: null });
        setPrices({ data: null, loading: true, error: null });
        setInventory({ data: null, loading: true, error: null });

        // We use Promise.allSettled to allow some to fail while others succeed
        const results = await Promise.allSettled([
            fetchProducts().then(d => { setProducts({ data: d, loading: false, error: null }); return d; }).catch(e => { setProducts({ data: null, loading: false, error: e.message }); throw e; }),
            fetchPrices().then(d => { setPrices({ data: d, loading: false, error: null }); return d; }).catch(e => { setPrices({ data: null, loading: false, error: e.message }); throw e; }),
            fetchInventory().then(d => { setInventory({ data: d, loading: false, error: null }); return d; }).catch(e => { setInventory({ data: null, loading: false, error: e.message }); throw e; }),
        ]);
    }, []);

    const integratedData: IntegratedProduct[] = products.data?.map(p => {
        const price = prices.data?.find(price => price.productId === p.id)?.price;
        const stock = inventory.data?.find(stock => stock.productId === p.id)?.stock;
        return { ...p, price, stock };
    }) || [];

    const isProcessing = products.loading || prices.loading || inventory.loading;

    return (
        <StoreContext.Provider value={{ products, prices, inventory, isProcessing, runAllProcesses, integratedData }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
