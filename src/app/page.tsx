'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { AdminRegisterModal } from '../components/ui/AdminRegisterModal';

export default function Home() {
    const router = useRouter();

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
        refetch: refetchProducts,
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
    const [processDismissed, setProcessDismissed] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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

        if (!user) {
            showError('Inicia sesión para agregar productos al carrito');
            setTimeout(() => router.push('/login'), 1500);
            return;
        }

        addToCart(product);
        success(`"${product.name}" agregado al carrito`);
    };

    const handleClearCart = () => {
        clearCart();
    };

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    const handleCheckoutSuccess = () => {
        success('¡Gracias por tu compra! Tu pedido ha sido procesado.');
        refetchProducts();
    };

    return (
        <>
            <Header
                cartCount={cartCount}
                onCartClick={() => setIsCartOpen(true)}
                onAdminRegisterClick={() => setIsAdminModalOpen(true)}
            />

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

            {/* Drawer del carrito */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                cartTotal={cartTotal}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={handleClearCart}
                isAuthenticated={!!user}
                onLoginRedirect={handleLoginRedirect}
                onCheckoutSuccess={handleCheckoutSuccess}
            />

            {/* Toasts */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Modal: Registrar Admin */}
            <AdminRegisterModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                onSuccess={(msg) => { success(msg); }}
                onError={(msg) => { showError(msg); }}
            />
        </>
    );
}
