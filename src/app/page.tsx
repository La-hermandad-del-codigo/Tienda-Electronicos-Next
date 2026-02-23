'use client';

import React, { useState } from 'react';
import { Product } from '../types/product';
import { ProductFormData } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { ProductList } from '../components/products/ProductList';
import { ProductForm } from '../components/products/ProductForm';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastContainer } from '../components/ui/Toast';
import { isCheckoutPanelVisible, invokeCheckoutCloseHandler } from '../utils/checkoutPanel';

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
        error: productError,
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

    const { toasts, removeToast, success, error: showError } = useToast();
    const { isAdmin, user } = useAuth();

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
    const [pendingAddProduct, setPendingAddProduct] = useState<Product | null>(null);
    const [showCancelCheckoutConfirm, setShowCancelCheckoutConfirm] = useState(false);
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

    const handleFormSubmit = async (formData: ProductFormData) => {
        if (editingProduct) {
            const ok = await updateProduct(editingProduct.id, formData);
            if (ok) {
                success(`"${formData.name}" actualizado correctamente`);
            } else {
                showError(productError || 'Error al actualizar el producto');
            }
        } else {
            const newProduct = await addProduct(formData, user?.id);
            if (newProduct) {
                success(`"${formData.name}" creado correctamente`);
            } else {
                showError(productError || 'Error al crear el producto');
            }
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

    const handleDeleteConfirm = async () => {
        if (deletingProduct) {
            const ok = await deleteProduct(deletingProduct.id);
            if (ok) {
                removeFromCart(deletingProduct.id);
                success(`"${deletingProduct.name}" eliminado correctamente`);
            } else {
                showError(productError || 'Error al eliminar el producto');
            }
            setDeletingProduct(null);
        }
    };

    // Handlers del carrito
    const handleAddToCart = (product: Product) => {
        if (product.stock === 0) {
            showError('Este producto está agotado');
            return;
        }
        // Si hay un proceso de pago abierto, preguntar al usuario si quiere
        // cancelarlo para poder añadir el producto.
        if (isCheckoutPanelVisible()) {
            setPendingAddProduct(product);
            setShowCancelCheckoutConfirm(true);
            return;
        }

        addToCart(product);
        success(`"${product.name}" agregado al carrito`);
    };

    const handleClearCart = () => {
        clearCart();
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
                    isAdmin={isAdmin}
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

            {/* Diálogo: cancelar checkout para agregar producto */}
            <ConfirmDialog
                isOpen={showCancelCheckoutConfirm}
                onClose={() => {
                    setShowCancelCheckoutConfirm(false);
                    setPendingAddProduct(null);
                }}
                onConfirm={() => {
                    // cerrar el panel de checkout (esto limpiará estado y carrito según implementación)
                    invokeCheckoutCloseHandler();
                    // añadir el producto después de cerrar
                    if (pendingAddProduct) {
                        addToCart(pendingAddProduct);
                        success(`"${pendingAddProduct.name}" agregado al carrito`);
                    }
                    setPendingAddProduct(null);
                    setShowCancelCheckoutConfirm(false);
                }}
                title="Cancelar proceso de pago"
                message={`¿Deseas cancelar el proceso de pago actual para agregar "${pendingAddProduct?.name}" al carrito?`}
                confirmLabel="Sí, cancelar"
                cancelLabel="No, continuar"
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
