'use client';

import React from 'react';
import { Product } from '../../types/product';
import { EmptyState } from '../ui/EmptyState';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface ProductListProps {
    products: Product[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    availableCategories: string[];
    onNewProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
    products,
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    availableCategories,
    onNewProduct,
    onEditProduct,
    onDeleteProduct,
    onAddToCart,
}) => {
    const {
        displayedItems,
        hasMore,
        isLoadingMore,
        observerTarget
    } = useInfiniteScroll(products, { initialPageSize: 8, increment: 4 });

    return (
        <section className="product-list-section">
            {/* Toolbar: búsqueda + filtros + nuevo */}
            <div className="toolbar">
                <div className="toolbar-filters">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => onSearchChange('')}
                                aria-label="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <select
                        className="category-filter"
                        value={categoryFilter}
                        onChange={e => onCategoryChange(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="btn" onClick={onNewProduct}>
                    + Nuevo producto
                </button>
            </div>

            {/* Grid de productos o estado vacío */}
            {products.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="No se encontraron productos"
                    description={
                        searchTerm || categoryFilter
                            ? 'Intenta con otros filtros de búsqueda.'
                            : 'Agrega tu primer producto para comenzar.'
                    }
                    action={
                        !searchTerm && !categoryFilter ? (
                            <button className="btn" onClick={onNewProduct}>
                                + Crear primer producto
                            </button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="product-grid">
                    {displayedItems.map(product => (
                        <div key={product.id} className="card product-card animate-fade-in">
                            <div
                                className="product-card-image"
                                style={{ backgroundImage: `url(${product.imageUrl})` }}
                            />
                            <div className="product-card-body">
                                <div className="product-card-header">
                                    <h3 className="product-card-title">{product.name}</h3>
                                    <span className="badge badge-category">{product.category}</span>
                                </div>
                                <p className="product-card-description">{product.description}</p>
                                <div className="product-card-footer">
                                    <div className="product-card-info">
                                        <span className="product-price">${product.price.toFixed(2)}</span>
                                        <span
                                            className={`badge ${product.stock === 0
                                                ? 'badge-danger'
                                                : product.stock <= 5
                                                    ? 'badge-warning'
                                                    : 'badge-success'
                                                }`}
                                        >
                                            {product.stock === 0
                                                ? 'Agotado'
                                                : `${product.stock} en stock`}
                                        </span>
                                    </div>
                                    <div className="product-card-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => onEditProduct(product)}
                                            title="Editar"
                                            aria-label="Editar producto"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-danger"
                                            onClick={() => onDeleteProduct(product)}
                                            title="Eliminar"
                                            aria-label="Eliminar producto"
                                        >
                                            🗑️
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => onAddToCart(product)}
                                            disabled={product.stock === 0}
                                        >
                                            🛒 Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Elemento observador para scroll infinito */}
            {products.length > 0 && (
                <div
                    ref={observerTarget}
                    className="infinite-scroll-trigger"
                    style={{ height: '20px', margin: '20px 0', textAlign: 'center' }}
                >
                    {isLoadingMore && (
                        <div className="loading-spinner-small" style={{ margin: '0 auto' }}>
                            <span className="loading-text">Cargando más productos...</span>
                        </div>
                    )}
                    {!hasMore && products.length > 8 && (
                        <p className="end-message">Has llegado al final del catálogo</p>
                    )}
                </div>
            )}
        </section>
    );
};
