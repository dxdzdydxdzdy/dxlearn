import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ServiceWorker } from '@/components/ServiceWorker';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: { default: 'dxlearn', template: '%s — dxlearn' },
  description: 'Интерактивные курсы по веб-разработке',
  verification: {
    google: 'RK79_tykQlJawxSuG-Ou20zlPeSV_piwYkRGfrYsWFw',
    yandex: 'ee409c6ea22671f8',
  },
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
  themeColor: '#0a0f0f',
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
        <Footer />
      </body>
    </html>
  );
}
