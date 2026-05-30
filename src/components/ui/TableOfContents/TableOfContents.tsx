'use client';

import { useEffect, useRef, useState } from 'react';
import s from './TableOfContents.module.scss';

const HEADER_OFFSET = 52 + 24; // $header-height + extra breathing room

interface Heading {
  id: string;
  text: string;
}

function toId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64);
}

export function TableOfContents() {
  const [headings, setHeadings]   = useState<Heading[]>([]);
  const [activeId, setActiveId]   = useState('');
  const observerRef               = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Find all h2 inside <article> (skips breadcrumb / page-level headings)
    const article = document.querySelector('article');
    if (!article) return;

    const els = Array.from(article.querySelectorAll('h2'));
    if (els.length < 2) return; // no ToC for very short articles

    const items: Heading[] = els.map(el => {
      const text = el.textContent?.trim() ?? '';
      if (!el.id) el.id = toId(text) || `section-${Math.random().toString(36).slice(2, 6)}`;
      return { id: el.id, text };
    });

    setHeadings(items);

    // Track active section
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );
    els.forEach(el => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  if (headings.length < 2) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <aside className={s.aside}>
      <nav className={s.nav}>
        <p className={s.label}>// содержание</p>
        <ul className={s.list}>
          {headings.map(h => (
            <li key={h.id}>
              <button
                className={`${s.item}${h.id === activeId ? ` ${s.active}` : ''}`}
                onClick={() => handleClick(h.id)}
                type="button"
              >
                <span className={s.dot} />
                <span className={s.text}>{h.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
