'use client';

import { useEffect, useRef } from 'react';
import s from './ReadingProgress.module.scss';

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const { scrollY, innerHeight } = window;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={s.track} aria-hidden>
      <div ref={barRef} className={s.bar} />
    </div>
  );
}
