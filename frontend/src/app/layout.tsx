import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FilterProvider } from '@/context/FilterContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Commercial Dashboard | Datalysis',
  description:
    'Dashboard analítico de e-commerce - Prueba Técnica Datalysis L1.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <FilterProvider>{children}</FilterProvider>
      </body>
    </html>
  );
}
