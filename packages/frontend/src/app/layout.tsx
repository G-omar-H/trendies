import type { Metadata } from 'next';
import './globals.css';
import { MantineProviderWrapper } from '@/providers/mantine-provider';
import { QueryProvider } from '@/providers/query-provider';
import { MainAppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Trendies - Luxury Order Management',
  description: 'Order management system for luxury brands',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark-8 text-white">
        <MantineProviderWrapper>
          <QueryProvider>
            <MainAppShell>{children}</MainAppShell>
          </QueryProvider>
        </MantineProviderWrapper>
      </body>
    </html>
  );
}