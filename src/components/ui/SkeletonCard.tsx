'use client';

import React from 'react';

export const SkeletonCard: React.FC = () => (
    <div className="card product-card skeleton-card" aria-busy="true" aria-label="Cargando producto">
        <div className="skeleton skeleton-image" />
        <div className="product-card-body">
            <div className="product-card-header">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-badge" />
            </div>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text skeleton-text--short" />
            <div className="product-card-footer">
                <div className="product-card-info">
                    <div className="skeleton skeleton-price" />
                    <div className="skeleton skeleton-stock" />
                </div>
                <div className="product-card-actions">
                    <div className="skeleton skeleton-btn-sm" />
                    <div className="skeleton skeleton-btn-sm" />
                    <div className="skeleton skeleton-btn" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="product-grid">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);
