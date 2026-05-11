import './globals.css';
import { Inter } from 'next/font/google';
import CartProvider from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OFF-BLACK | STORE',
  description: 'Tienda oficial OFF-BLACK - Diseño limpio, actitud real.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}