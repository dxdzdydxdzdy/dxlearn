'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './Header.module.scss';

const NAV = [
  { href: '/courses', label: 'курсы' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className={s.header}>
      <Link href="/" className={s.logo}>
        <span className={s.prompt}>~/</span>
        <span>dxlearn</span>
      </Link>

      <nav className={s.nav}>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`${s.navLink} ${pathname.startsWith(href) ? s.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className={s.spacer} />
      <span className={s.meta}>v0.1.0</span>
    </header>
  );
}
