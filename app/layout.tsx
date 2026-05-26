import React from 'react';
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import { EPinjamProvider } from '@/lib/state-context';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'E-Pinjam Biro — Booking & Peminjaman InFocus',
  description: 'Sistem Booking & Peminjaman InFocus Biro Kampus Universitas Muhammadiyah Sumatera Utara Terintegrasi',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-slate-100 bg-slate-950 min-h-screen" suppressHydrationWarning>
        <EPinjamProvider>
          {children}
        </EPinjamProvider>
      </body>
    </html>
  );
}
