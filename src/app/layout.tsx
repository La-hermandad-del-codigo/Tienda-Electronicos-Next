'use client';

import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <title>TechStore - Tienda de Electrónicos</title>
                <meta name="description" content="Tu tienda de electrónicos con CRUD completo y carrito de compras." />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
