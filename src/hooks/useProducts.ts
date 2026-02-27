'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductFormData } from '../types/product';
import { ProcessTask, ProcessStatus } from '../components/ui/ProcessIndicator';
import { supabase } from '../lib/supabase';

function makeTask(id: string, label: string, status: ProcessStatus = 'idle'): ProcessTask {
    return { id, label, status };
}

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guards contra race conditions en Strict Mode / hidratación
    const isFetchingRef = useRef(false);
    const isMountedRef = useRef(true);

    // Estados de tareas intermedias para el ProcessIndicator
    const [taskStatuses, setTaskStatuses] = useState<ProcessTask[]>([
        makeTask('connect-db', 'Conectando con Supabase', 'idle'),
        makeTask('fetch-products', 'Obteniendo productos', 'idle'),
        makeTask('sync-catalog', 'Sincronizando catálogo', 'idle'),
    ]);

    const updateTask = useCallback((id: string, status: ProcessStatus, detail?: string) => {
        setTaskStatuses(prev =>
            prev.map(t => t.id === id ? { ...t, status, detail } : t)
        );
    }, []);

    // Fetch products from Supabase
    const fetchProducts = useCallback(async () => {
        // Evitar fetches duplicados (Strict Mode monta dos veces)
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        updateTask('connect-db', 'loading');

        try {
            // Step 1: connect
            updateTask('connect-db', 'success', 'Conexión establecida');

            // Step 2: fetch
            updateTask('fetch-products', 'loading');
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            // Si el componente se desmontó durante el fetch, no actualizar estado
            if (!isMountedRef.current) return;

            if (fetchError) {
                updateTask('fetch-products', 'error', fetchError.message);
                setError(fetchError.message);
                return;
            }

            updateTask('fetch-products', 'success', `${data.length} producto(s) encontrado(s)`);

            // Step 3: sync
            updateTask('sync-catalog', 'loading');
            setProducts(data as Product[]);
            updateTask('sync-catalog', 'success', 'Catálogo sincronizado');
            setError(null);
        } catch (err) {
            if (!isMountedRef.current) return;
            const message = err instanceof Error ? err.message : 'Error desconocido';
            updateTask('sync-catalog', 'error', message);
            setError(message);
        } finally {
            isFetchingRef.current = false;
            if (isMountedRef.current) {
                setIsLoaded(true);
            }
        }
    }, [updateTask]);

    // Initial load
    useEffect(() => {
        isMountedRef.current = true;
        fetchProducts();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchProducts]);

    // Add product (admin only — enforced by RLS)
    const addProduct = useCallback(async (formData: ProductFormData, userId?: string): Promise<Product | null> => {
        const { data, error: insertError } = await supabase
            .from('products')
            .insert({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                stock: formData.stock,
                category: formData.category,
                image_url: formData.image_url,
                created_by: userId || null,
            })
            .select()
            .single();

        if (insertError) {
            setError(insertError.message);
            return null;
        }

        const newProduct = data as Product;
        setProducts(prev => [newProduct, ...prev]);
        setError(null);
        return newProduct;
    }, []);

    // Update product (admin only — enforced by RLS)
    const updateProduct = useCallback(async (id: string, formData: ProductFormData): Promise<boolean> => {
        const { error: updateError } = await supabase
            .from('products')
            .update({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                stock: formData.stock,
                category: formData.category,
                image_url: formData.image_url,
            })
            .eq('id', id);

        if (updateError) {
            setError(updateError.message);
            return false;
        }

        setProducts(prev =>
            prev.map(p => p.id === id ? { ...p, ...formData } : p)
        );
        setError(null);
        return true;
    }, []);

    // Delete product (admin only — enforced by RLS)
    const deleteProduct = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error("Error al eliminar producto:", deleteError);
            setError(deleteError.message);
            return { success: false, error: deleteError.message };
        }

        setProducts(prev => prev.filter(p => p.id !== id));
        setError(null);
        return { success: true };
    }, []);

    const getProductById = useCallback((id: string): Product | undefined => {
        return products.find(p => p.id === id);
    }, [products]);

    // Filtering (client-side for instant UX)
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === '' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const availableCategories = products
        .map(p => p.category)
        .filter((cat, index, self) => self.indexOf(cat) === index)
        .sort();

    return {
        products: filteredProducts,
        allProducts: products,
        isLoaded,
        error,
        taskStatuses,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        availableCategories,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        refetch: fetchProducts,
    };
}
