import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'dxlearn',
    short_name: 'dxlearn',
    description: 'Интерактивные курсы по веб-разработке',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0f0f',
    theme_color: '#00e5a0',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'productivity'],
  };
}
