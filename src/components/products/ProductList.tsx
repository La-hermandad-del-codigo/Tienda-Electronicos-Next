'use client';

import React from 'react';
import { Product } from '../../types/product';
import { ProcessTask } from '../ui/ProcessIndicator';
import { ProcessIndicator } from '../ui/ProcessIndicator';
import { SkeletonGrid } from '../ui/SkeletonCard';
import { EmptyState } from '../ui/EmptyState';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Search, X, Edit2, Trash2, ShoppingCart, MessageSquare } from 'lucide-react';

interface ProductListProps {
    products: Product[];
    isLoaded: boolean;
    taskStatuses: ProcessTask[];
    processDismissed: boolean;
    onProcessDismiss: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    availableCategories: string[];
    onNewProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    onViewComments: (product: Product) => void;
    isAdmin?: boolean;
    isComerciante?: boolean;
    currentUserId?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
    products,
    isLoaded,
    taskStatuses,
    processDismissed,
    onProcessDismiss,
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    availableCategories,
    onNewProduct,
    onEditProduct,
    onDeleteProduct,
    onAddToCart,
    onViewComments,
    isAdmin = false,
    isComerciante = false,
    currentUserId,
}) => {
    const {
        displayedItems,
        hasMore,
        isLoadingMore,
        observerTarget
    } = useInfiniteScroll(products, { initialPageSize: 8, increment: 4 });

    const showProcessPanel = !processDismissed;

    return (
        <section className="product-list-section">
            {/* Panel de estados intermedios (siempre visible hasta que se cierre) */}
            {showProcessPanel && (
                <ProcessIndicator
                    tasks={taskStatuses}
                    onDismiss={isLoaded ? onProcessDismiss : undefined}
                />
            )}

            {/* Toolbar: búsqueda + filtros + nuevo */}
            <div className="toolbar">
                <div className="toolbar-filters">
                    <div className="search-bar">
                        <span className="search-icon"><Search size={20} /></span>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                            disabled={!isLoaded}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => onSearchChange('')}
                                aria-label="Limpiar búsqueda"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <select
                        className="category-filter"
                        value={categoryFilter}
                        onChange={e => onCategoryChange(e.target.value)}
                        disabled={!isLoaded}
                    >
                        <option value="">Todas las categorías</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {isComerciante && (
                    <button className="btn" onClick={onNewProduct} disabled={!isLoaded}>
                        + Nuevo producto
                    </button>
                )}
            </div>

            {/* Skeleton mientras carga */}
            {!isLoaded && <SkeletonGrid count={6} />}

            {/* Grid de productos o estado vacío (solo cuando ya cargó) */}
            {isLoaded && (
                products.length === 0 ? (
                    <EmptyState
                        icon={<Search size={48} />}
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
                                    style={{ backgroundImage: `url(${product.image_url})` }}
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
                                            {isComerciante && product.created_by === currentUserId && (
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => onEditProduct(product)}
                                                    title="Editar"
                                                    aria-label="Editar producto"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {(isAdmin || (isComerciante && product.created_by === currentUserId)) && (
                                                <button
                                                    className="btn-icon btn-icon-danger"
                                                    onClick={() => onDeleteProduct(product)}
                                                    title="Eliminar"
                                                    aria-label="Eliminar producto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <button
                                                className="btn-icon"
                                                onClick={() => onViewComments(product)}
                                                title="Comentarios"
                                                aria-label="Ver comentarios"
                                                style={{ color: 'var(--primary-color)' }}
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => onAddToCart(product)}
                                                disabled={product.stock === 0}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            >
<<<<<<< HEAD
                                                <ShoppingCart size={16} /> Agregar
=======
                                                {product.stock === 0 ? '🚫 Sin producto' : '🛒 Agregar'}
>>>>>>> f1fa6d5 (Agregue imagenes y el stock)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Elemento observador para scroll infinito */}
            {isLoaded && products.length > 0 && (
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
