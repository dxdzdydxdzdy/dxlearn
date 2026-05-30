'use client';

import Link from 'next/link';
import { useRef } from 'react';

interface Props {
  href?: string;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export function CourseCard({ href, className, style, children }: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - left) / width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - top) / height) * 100}%`);
  }

  if (href) {
    return (
      <Link ref={ref} href={href} className={className} style={style} onMouseMove={onMove}>
        {children}
      </Link>
    );
  }

  return (
    <div ref={ref} className={className} style={style} onMouseMove={onMove}>
      {children}
    </div>
  );
}
