import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header/Header';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: { default: 'devlearn', template: '%s — devlearn' },
  description: 'Интерактивные курсы по веб-разработке',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
