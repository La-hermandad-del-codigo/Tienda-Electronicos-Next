'use client';

import React from 'react';
import { IntegratedProduct } from '../context/StoreContext';

interface ProductCardProps {
    product: IntegratedProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>
                    {product.price !== undefined ? `$${product.price}` : '---'}
                </span>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: product.stock === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: product.stock === 0 ? 'var(--error)' : 'var(--success)'
                }}>
                    {product.stock !== undefined ? `${product.stock} en stock` : 'Sin stock info'}
                </span>
            </div>
        </div>
    );
};
