import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header/Header';
import { ServiceWorker } from '@/components/ServiceWorker';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: { default: 'dxlearn', template: '%s — dxlearn' },
  description: 'Интерактивные курсы по веб-разработке',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'dxlearn',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#00e5a0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ServiceWorker />
        <Header />
        {children}
      </body>
    </html>
  );
}
