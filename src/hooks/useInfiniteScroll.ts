'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    threshold?: number;
    rootMargin?: string;
    initialPageSize?: number;
    increment?: number;
}

export function useInfiniteScroll<T>(
    items: T[],
    options: UseInfiniteScrollOptions = {}
) {
    const {
        threshold = 0.5,
        rootMargin = '100px',
        initialPageSize = 6,
        increment = 6,
    } = options;

    const [displayLimit, setDisplayLimit] = useState(initialPageSize);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement | null>(null);

    const hasMore = displayLimit < items.length;

    const loadMore = useCallback(() => {
        if (!hasMore || isLoadingMore) return;

        setIsLoadingMore(true);
        // Simular un pequeño delay de carga para mejor feedback visual
        setTimeout(() => {
            setDisplayLimit(prev => prev + increment);
            setIsLoadingMore(false);
        }, 600);
    }, [hasMore, isLoadingMore, increment]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            },
            { threshold, rootMargin }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [loadMore, hasMore, threshold, rootMargin]);

    // Resetear el límite cuando cambian los items (por ejemplo, al filtrar)
    useEffect(() => {
        setDisplayLimit(initialPageSize);
    }, [items.length, initialPageSize]);

    const displayedItems = items.slice(0, displayLimit);

    return {
        displayedItems,
        hasMore,
        isLoadingMore,
        observerTarget,
        resetLimit: () => setDisplayLimit(initialPageSize),
    };
}
