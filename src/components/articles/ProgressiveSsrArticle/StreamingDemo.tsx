'use client';

import { useState, useRef } from 'react';
import s from './StreamingDemo.module.scss';

interface Block {
  id: string;
  label: string;
  delay: number;
  content: string;
  skeleton: string;
}

const BLOCKS: Block[] = [
  { id: 'shell', label: 'Shell (немедленно)', delay: 0, content: 'dxlearn — header, nav', skeleton: '' },
  { id: 'sidebar', label: 'Sidebar (~200ms)', delay: 200, content: 'Список курсов загружен', skeleton: '3 пункта меню' },
  { id: 'hero', label: 'Hero block (~400ms)', delay: 400, content: 'Заголовок и описание курса', skeleton: 'текст-заглушка' },
  { id: 'articles', label: 'Список статей (~800ms)', delay: 800, content: '6 статей с прогрессом', skeleton: '6 карточек-скелетонов' },
  { id: 'stats', label: 'Статистика (~1200ms)', delay: 1200, content: 'Время чтения, просмотры', skeleton: '2 числа' },
];

type BlockState = 'waiting' | 'skeleton' | 'loaded';

export function StreamingDemo() {
  const [states, setStates] = useState<Record<string, BlockState>>(
    Object.fromEntries(BLOCKS.map(b => [b.id, 'waiting']))
  );
  const [playing, setPlaying] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function simulate() {
    if (playing) return;
    setPlaying(true);
    setStates(Object.fromEntries(BLOCKS.map(b => [b.id, 'waiting'])));

    // First pass: show skeletons
    BLOCKS.forEach(block => {
      const t1 = setTimeout(() => {
        setStates(prev => ({ ...prev, [block.id]: 'skeleton' }));
      }, block.id === 'shell' ? 0 : 50);
      timersRef.current.push(t1);
    });

    // Second pass: stream in real content
    BLOCKS.forEach(block => {
      const t2 = setTimeout(() => {
        setStates(prev => ({ ...prev, [block.id]: 'loaded' }));
        if (block.id === BLOCKS[BLOCKS.length - 1].id) setPlaying(false);
      }, block.delay + 300);
      timersRef.current.push(t2);
    });
  }

  function reset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setStates(Object.fromEntries(BLOCKS.map(b => [b.id, 'waiting'])));
    setPlaying(false);
  }

  const loadedCount = Object.values(states).filter(s => s === 'loaded').length;

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// streaming-ssr-demo</span>
        <div className={s.controls}>
          <button className={s.btn} onClick={simulate} disabled={playing}>simulate load</button>
          {loadedCount > 0 && <button className={s.btnSecondary} onClick={reset}>reset</button>}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.page}>
          {BLOCKS.map(block => {
            const state = states[block.id];
            return (
              <div key={block.id} className={`${s.block} ${s[state]}`}>
                <div className={s.blockTag}>{block.label}</div>
                {state === 'waiting' && <div className={s.waiting}>⟳ ожидание</div>}
                {state === 'skeleton' && (
                  <div className={s.skeletonContent}>
                    <div className={s.skeletonLine} style={{ width: '80%' }} />
                    <div className={s.skeletonLine} style={{ width: '60%' }} />
                    {block.id !== 'shell' && <div className={s.skeletonLine} style={{ width: '70%' }} />}
                  </div>
                )}
                {state === 'loaded' && (
                  <div className={s.loadedContent}>✓ {block.content}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className={s.log}>
          <div className={s.logLabel}>// server stream</div>
          {BLOCKS.map(block => {
            const state = states[block.id];
            return (
              <div key={block.id} className={`${s.logLine} ${state === 'loaded' ? s.logDone : state === 'skeleton' ? s.logStreaming : ''}`}>
                <span className={s.logTime}>{block.delay}ms</span>
                <span>{state === 'loaded' ? `✓ <${block.id}> flushed` : state === 'skeleton' ? `⟳ <${block.id}> pending...` : `○ <${block.id}> waiting`}</span>
              </div>
            );
          })}
          {loadedCount === BLOCKS.length && (
            <div className={s.logComplete}>// all chunks received</div>
          )}
        </div>
      </div>

      {loadedCount === 0 && !playing && (
        <div className={s.hint}>нажми simulate — посмотри как контент появляется постепенно</div>
      )}
    </div>
  );
}
