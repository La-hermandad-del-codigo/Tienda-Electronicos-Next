'use client';

import { useStore } from '../context/StoreContext';
import { ProcessIndicator } from '../components/ProcessIndicator';
import { ProductCard } from '../components/ProductCard';

export default function Home() {
    const { products, prices, inventory, isProcessing, runAllProcesses, integratedData } = useStore();

    const handleStart = () => {
        runAllProcesses();
    };

    const allFinished = !isProcessing && (products.data || products.error);

    return (
        <main>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>TechStore Dashboard</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Sincronización de Procesos en Paralelo</p>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Estado de los Procesos</h2>
                    <button className="btn" onClick={handleStart} disabled={isProcessing}>
                        {isProcessing ? 'Procesando...' : 'Iniciar Sincronización'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <ProcessIndicator
                        label="1. Catálogo de Productos"
                        loading={products.loading}
                        error={products.error}
                        success={!!products.data}
                    />
                    <ProcessIndicator
                        label="2. Lista de Precios"
                        loading={prices.loading}
                        error={prices.error}
                        success={!!prices.data}
                    />
                    <ProcessIndicator
                        label="3. Inventario en Tiempo Real"
                        loading={inventory.loading}
                        error={inventory.error}
                        success={!!inventory.data}
                    />
                </div>
            </section>

            {allFinished && (
                <section className="animate-fade-in">
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Resultados Integrados</h2>

                        {products.error ? (
                            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'var(--error)' }}>
                                <p style={{ color: 'var(--error)' }}>
                                    Error crítico: No se pudo cargar el catálogo de productos. La integración no es posible.
                                </p>
                            </div>
                        ) : (
                            <>
                                {(prices.error || inventory.error) && (
                                    <p style={{ color: 'var(--warning)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        ⚠️ Algunos datos secundarios no se pudieron sincronizar (Precios o Stock).
                                    </p>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {integratedData.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}

            {(!allFinished && !isProcessing) && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                    Presiona el botón para iniciar la carga sincronizada.
                </div>
            )}
        </main>
    );
}
