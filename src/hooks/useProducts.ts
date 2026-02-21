'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormData } from '../types/product';
import { getFromStorage, saveToStorage } from '../utils/localStorage';
import { defaultProducts } from '../data/defaultProducts';
import { generateId } from '../utils/idGenerator';

const STORAGE_KEY = 'techstore_products';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar productos desde localStorage al montar
    useEffect(() => {
        const stored = getFromStorage<Product[]>(STORAGE_KEY, []);
        if (stored.length === 0) {
            // Primera vez: cargar catálogo por defecto
            saveToStorage(STORAGE_KEY, defaultProducts);
            setProducts(defaultProducts);
        } else {
            setProducts(stored);
        }
        setIsLoaded(true);
    }, []);

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
