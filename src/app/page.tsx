'use client';

import React, { useState } from 'react';
import { Product } from '../types/product';
import { ProductFormData } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { Header } from '../components/layout/Header';
import { ProductList } from '../components/products/ProductList';
import { ProductForm } from '../components/products/ProductForm';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastContainer } from '../components/ui/Toast';

export default function Home() {
    // Hooks de estado
    const {
        products,
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
        allProducts,
    } = useProducts();

    const {
        items: cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartWithProducts,
        checkout,
        isCheckingOut,
    } = useCart();

    const { toasts, removeToast, success, error } = useToast();

    // Sincronizar carrito cuando cambian los productos (edición/eliminación)
    React.useEffect(() => {
        if (isLoaded) {
            syncCartWithProducts(allProducts);
        }
    }, [allProducts, isLoaded, syncCartWithProducts]);

    // Estado de UI
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [processDismissed, setProcessDismissed] = useState(false);

    // Handlers de productos
    const handleNewProduct = () => {
        setEditingProduct(null);
        setIsFormModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData: ProductFormData) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, formData);
            success(`"${formData.name}" actualizado correctamente`);
        } else {
            addProduct(formData);
            success(`"${formData.name}" creado correctamente`);
        }
        setIsFormModalOpen(false);
        setEditingProduct(null);
    };

    const handleFormCancel = () => {
        setIsFormModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteRequest = (product: Product) => {
        setDeletingProduct(product);
    };

    const handleDeleteConfirm = () => {
        if (deletingProduct) {
            deleteProduct(deletingProduct.id);
            removeFromCart(deletingProduct.id);
            success(`"${deletingProduct.name}" eliminado correctamente`);
            setDeletingProduct(null);
        }
    };

    // Handlers del carrito
    const handleAddToCart = (product: Product) => {
        if (product.stock === 0) {
            error('Este producto está agotado');
            return;
        }
        addToCart(product);
        success(`"${product.name}" agregado al carrito`);
    };

    const handleClearCart = () => {
        clearCart();
        success('Carrito vaciado');
    };

    const handleCheckout = async () => {
        const result = await checkout();
        if (result) {
            success('¡Gracias por tu compra! Tu pedido ha sido procesado.');
            setIsCartOpen(false);
        }
    };

    return (
        <>
            <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

            <main>
                <ProductList
                    products={products}
                    isLoaded={isLoaded}
                    taskStatuses={taskStatuses}
                    processDismissed={processDismissed}
                    onProcessDismiss={() => setProcessDismissed(true)}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    availableCategories={availableCategories}
                    onNewProduct={handleNewProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteRequest}
                    onAddToCart={handleAddToCart}
                />
            </main>

            {/* Modal: Crear/Editar producto */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={handleFormCancel}
                title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
            >
                <ProductForm
                    product={editingProduct}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </Modal>

            {/* Diálogo de confirmación: Eliminar */}
            <ConfirmDialog
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar producto"
                message={`¿Estás seguro de que deseas eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
            />

            {/* Drawer del carrito */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                cartTotal={cartTotal}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={handleClearCart}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
            />

            {/* Toasts */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}
