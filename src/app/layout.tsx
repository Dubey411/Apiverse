import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';

import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'APIverse - Discover, Test, and Manage APIs in One Place',
  description:
    'APIverse is the developer marketplace for discovering, testing, and managing government and private APIs with integrated analytics and key management.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-[#050d1a] dark:text-[#e2e8f0]"
      >
        <ThemeProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#0a1628',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  borderRadius: '0.75rem',
                },
              }}
            />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
