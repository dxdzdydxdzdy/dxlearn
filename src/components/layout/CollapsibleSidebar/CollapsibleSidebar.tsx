'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import s from './CollapsibleSidebar.module.scss';

const LS_KEY = 'sidebar-open';

export function CollapsibleSidebar() {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== null) setOpen(stored === 'true');
    setMounted(true);
  }, []);

  const toggle = () => {
    setOpen(v => {
      localStorage.setItem(LS_KEY, String(!v));
      return !v;
    });
  };

  const isOpen = !mounted || open;

  return (
    <div className={`${s.wrap} ${isOpen ? s.wrapOpen : s.wrapClosed}`}>
      <div className={s.topBar}>
        <button
          className={s.toggle}
          onClick={toggle}
          aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
          type="button"
        >
          <span
            className={s.toggleIcon}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ›
          </span>
        </button>
      </div>

      <div className={s.content}>
        {isOpen && <Sidebar />}
      </div>
    </div>
  );
}
