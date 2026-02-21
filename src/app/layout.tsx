import '../styles/globals.css';

export const metadata = {
    title: 'TechStore - Tienda de Electrónicos',
    description: 'Tu tienda de electrónicos con CRUD completo y carrito de compras.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>
                {children}
            </body>
        </html>
    );
}
