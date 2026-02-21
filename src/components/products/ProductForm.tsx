'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFormData, CATEGORIES } from '../../types/product';

interface ProductFormProps {
    product?: Product | null;
    onSubmit: (data: ProductFormData) => void;
    onCancel: () => void;
}

const emptyForm: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: CATEGORIES[0],
    imageUrl: '',
};

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<ProductFormData>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                imageUrl: product.imageUrl,
            });
        } else {
            setFormData(emptyForm);
        }
        setErrors({});
    }, [product]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es obligatoria';
        }
        if (formData.price <= 0) {
            newErrors.price = 'El precio debe ser mayor a 0';
        }
        if (formData.stock < 0) {
            newErrors.stock = 'El stock no puede ser negativo';
        }
        if (!formData.category) {
            newErrors.category = 'Selecciona una categoría';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim() || `https://picsum.photos/seed/${Date.now()}/400/300`,
            });
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
        // Limpiar error del campo al editar
        if (errors[name as keyof ProductFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: MacBook Pro 14&quot;"
                    className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe el producto..."
                    rows={3}
                    className={errors.description ? 'input-error' : ''}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="price">Precio ($) *</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.price || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={errors.price ? 'input-error' : ''}
                    />
                    {errors.price && <span className="field-error">{errors.price}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Stock *</label>
                    <input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        value={formData.stock || ''}
                        onChange={handleChange}
                        placeholder="0"
                        className={errors.stock ? 'input-error' : ''}
                    />
                    {errors.stock && <span className="field-error">{errors.stock}</span>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={errors.category ? 'input-error' : ''}
                >
                    <option value="">Seleccionar categoría</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="imageUrl">URL de imagen (opcional)</label>
                <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                />
                <span className="field-hint">Si no se proporciona, se generará una imagen automáticamente.</span>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn">
                    {product ? 'Guardar cambios' : 'Crear producto'}
                </button>
            </div>
        </form>
    );
};
