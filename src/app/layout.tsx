import '../styles/globals.css';
import { StoreProvider } from '../context/StoreContext';

export const metadata = {
    title: 'Tienda Electrónicos - Integración UI',
    description: 'Demostración de flujos paralelos y sincronización UI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>
                <StoreProvider>
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}
