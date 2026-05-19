import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/layout/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Delivery Billing System',
  description: 'Fast, simple mobile delivery billing management for business owners',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ganesh Billing',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} h-full bg-slate-50 text-slate-800 antialiased font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
