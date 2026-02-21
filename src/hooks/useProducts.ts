'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormData } from '../types/product';
import { ProcessTask, ProcessStatus } from '../components/ui/ProcessIndicator';
import { getFromStorage, saveToStorage } from '../utils/localStorage';
import { defaultProducts } from '../data/defaultProducts';
import { generateId } from '../utils/idGenerator';

const STORAGE_KEY = 'techstore_products';

// Simula una espera asincrónica para mostrar los estados de carga
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function makeTask(id: string, label: string, status: ProcessStatus = 'idle'): ProcessTask {
    return { id, label, status };
}

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Estados de tareas intermedias para el ProcessIndicator
    const [taskStatuses, setTaskStatuses] = useState<ProcessTask[]>([
        makeTask('read-storage', 'Leyendo localStorage', 'idle'),
        makeTask('validate-categories', 'Validando categorías', 'idle'),
        makeTask('sync-catalog', 'Sincronizando catálogo', 'idle'),
    ]);

    const updateTask = useCallback((id: string, status: ProcessStatus, detail?: string) => {
        setTaskStatuses(prev =>
            prev.map(t => t.id === id ? { ...t, status, detail } : t)
        );
    }, []);

    // Carga inicial con estados intermedios simulados
    useEffect(() => {
        const load = async () => {
            // Paso 1: leer localStorage
            updateTask('read-storage', 'loading');
            await delay(600);
            let stored: Product[] = [];
            try {
                stored = getFromStorage<Product[]>(STORAGE_KEY, []);
                updateTask('read-storage', 'success', `${stored.length} producto(s) encontrado(s)`);
            } catch {
                updateTask('read-storage', 'error', 'Error leyendo el almacenamiento');
            }

            // Paso 2: validar categorías
            updateTask('validate-categories', 'loading');
            await delay(500);
            try {
                const cats = Array.from(new Set(stored.map(p => p.category)));
                updateTask('validate-categories', 'success', `${cats.length} categoría(s) válidas`);
            } catch {
                updateTask('validate-categories', 'error', 'Error validando categorías');
            }

            // Paso 3: sincronizar catálogo por defecto si está vacío
            updateTask('sync-catalog', 'loading');
            await delay(400);
            try {
                if (stored.length === 0) {
                    saveToStorage(STORAGE_KEY, defaultProducts);
                    setProducts(defaultProducts);
                    updateTask('sync-catalog', 'success', `Catálogo por defecto cargado (${defaultProducts.length} productos)`);
                } else {
                    setProducts(stored);
                    updateTask('sync-catalog', 'success', 'Catálogo sincronizado');
                }
            } catch {
                updateTask('sync-catalog', 'error', 'Error sincronizando catálogo');
            }

            setIsLoaded(true);
        };

        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const addProduct = useCallback((formData: ProductFormData): Product => {
        const newProduct: Product = {
            ...formData,
            id: generateId('prod'),
            createdAt: new Date().toISOString(),
        };
        setProducts((prev: Product[]) => {
            const updated = [newProduct, ...prev];
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
        return newProduct;
    }, []);

    const updateProduct = useCallback((id: string, formData: ProductFormData): void => {
        setProducts((prev: Product[]) => {
            const updated = prev.map(p =>
                p.id === id ? { ...p, ...formData } : p
            );
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, []);

    const deleteProduct = useCallback((id: string): void => {
        setProducts((prev: Product[]) => {
            const updated = prev.filter(p => p.id !== id);
            saveToStorage(STORAGE_KEY, updated);
            return updated;
        });
    }, []);

    const getProductById = useCallback((id: string): Product | undefined => {
        return products.find(p => p.id === id);
    }, [products]);

    // Filtrado
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === '' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Categorías únicas de los productos existentes
    const availableCategories = products
        .map(p => p.category)
        .filter((cat, index, self) => self.indexOf(cat) === index)
        .sort();

    return {
        products: filteredProducts,
        allProducts: products,
        isLoaded,
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
    };
}
