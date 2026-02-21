export interface Product {
    id: string;
    name: string;
}

export interface Price {
    productId: string;
    price: number;
}

export interface Inventory {
    productId: string;
    stock: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomDelay = () => Math.floor(Math.random() * 2000) + 1000; // 1s to 3s

export const fetchProducts = async (): Promise<Product[]> => {
    await sleep(randomDelay());
    return [
        { id: '1', name: 'MacBook Pro 14"' },
        { id: '2', name: 'iPhone 15 Pro' },
        { id: '3', name: 'Sony WH-1000XM5' },
        { id: '4', name: 'Keychron K2' },
    ];
};

export const fetchPrices = async (): Promise<Price[]> => {
    await sleep(randomDelay());
    // Simulating a potential error (20% chance)
    if (Math.random() < 0.2) {
        throw new Error('Error al conectar con el servidor de precios');
    }
    return [
        { productId: '1', price: 1999.99 },
        { productId: '2', price: 999.99 },
        { productId: '3', price: 349.99 },
        { productId: '4', price: 89.99 },
    ];
};

export const fetchInventory = async (): Promise<Inventory[]> => {
    await sleep(randomDelay());
    // Simulating a potential error (20% chance)
    if (Math.random() < 0.2) {
        throw new Error('Error de sincronización con el almacén');
    }
    return [
        { productId: '1', stock: 12 },
        { productId: '2', stock: 5 },
        { productId: '3', stock: 0 },
        { productId: '4', stock: 25 },
    ];
};
