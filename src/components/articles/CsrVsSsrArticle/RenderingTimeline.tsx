'use client';

import { useState, useRef } from 'react';
import s from './RenderingTimeline.module.scss';

interface Phase {
  label: string;
  start: number;
  duration: number;
  color: string;
  note: string;
}

interface Strategy {
  id: string;
  label: string;
  color: string;
  fcp: number;
  tti: number;
  phases: Phase[];
}

const STRATEGIES: Strategy[] = [
  {
    id: 'csr', label: 'CSR', color: '#ff7b72', fcp: 28, tti: 52,
    phases: [
      { label: 'HTML (shell)', start: 0, duration: 6, color: '#4e9eff', note: 'Пустой HTML + <div id="root">' },
      { label: 'JS bundle', start: 6, duration: 20, color: '#f0c040', note: 'Скачивается весь JS (~300kB)' },
      { label: 'Parse & execute JS', start: 26, duration: 8, color: '#ff7b72', note: 'Браузер разбирает и запускает JS' },
      { label: 'API fetch', start: 34, duration: 14, color: '#b48eff', note: 'React делает fetch() за данными' },
      { label: 'Render content', start: 48, duration: 4, color: '#00e5a0', note: 'React рисует компоненты с данными' },
    ],
  },
  {
    id: 'ssr', label: 'SSR', color: '#4e9eff', fcp: 14, tti: 36,
    phases: [
      { label: 'Server processing', start: 0, duration: 10, color: '#b48eff', note: 'Сервер загружает данные и рендерит HTML' },
      { label: 'HTML + content', start: 10, duration: 4, color: '#4e9eff', note: 'Готовый HTML с контентом (FCP!)' },
      { label: 'JS bundle', start: 14, duration: 14, color: '#f0c040', note: 'JS для гидратации' },
      { label: 'Hydration', start: 28, duration: 8, color: '#00e5a0', note: 'React "оживляет" серверный HTML' },
    ],
  },
  {
    id: 'ssg', label: 'SSG', color: '#00e5a0', fcp: 4, tti: 26,
    phases: [
      { label: 'CDN cache hit', start: 0, duration: 2, color: '#00e5a0', note: 'HTML уже собран при деплое' },
      { label: 'HTML + content', start: 2, duration: 2, color: '#4e9eff', note: 'Контент сразу в HTML (FCP!)' },
      { label: 'JS bundle', start: 4, duration: 14, color: '#f0c040', note: 'JS для гидратации' },
      { label: 'Hydration', start: 18, duration: 8, color: '#00e5a0', note: 'React берёт управление' },
    ],
  },
];

const TOTAL = 60;

export function RenderingTimeline() {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState<{ s: string; p: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function play() {
    if (playing) return;
    setProgress(0);
    setPlaying(true);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= TOTAL) {
        clearInterval(timerRef.current!);
        setPlaying(false);
      }
    }, 40);
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
    setPlaying(false);
  }

  const unit = 100 / TOTAL;
  const activeHover = hovered
    ? STRATEGIES.find(s => s.id === hovered.s)?.phases.find(p => p.label === hovered.p)
    : null;

  return (
    <div className={s.timeline}>
      <div className={s.header}>
        <span className={s.title}>// rendering-timeline</span>
        <div className={s.controls}>
          <button className={s.btn} onClick={play} disabled={playing}>simulate</button>
          {progress > 0 && <button className={s.btnSecondary} onClick={reset}>reset</button>}
        </div>
      </div>

      <div className={s.chart}>
        <div className={s.timeAxis}>
          {[0, 10, 20, 30, 40, 50, 60].map(t => (
            <div key={t} className={s.tick} style={{ left: `${t * unit}%` }}>
              <span className={s.tickLabel}>{t * 100}ms</span>
            </div>
          ))}
        </div>

        {STRATEGIES.map(strategy => (
          <div key={strategy.id} className={s.row}>
            <div className={s.rowLabel}>
              <span className={s.strategyBadge} style={{ color: strategy.color }}>{strategy.label}</span>
            </div>
            <div className={s.rowTrack}>
              {strategy.phases.map(phase => {
                const visible = progress >= phase.start + phase.duration
                  ? 1 : progress <= phase.start ? 0
                  : (progress - phase.start) / phase.duration;
                return (
                  <div key={phase.label}
                    className={s.phase}
                    style={{
                      left: `${phase.start * unit}%`,
                      width: `${phase.duration * unit * visible}%`,
                      background: phase.color,
                    }}
                    onMouseEnter={() => setHovered({ s: strategy.id, p: phase.label })}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              {progress >= strategy.fcp && (
                <div className={s.marker} style={{ left: `${strategy.fcp * unit}%`, '--mc': strategy.color } as React.CSSProperties}>
                  <span className={s.markerLabel}>FCP</span>
                </div>
              )}
              {progress >= strategy.tti && (
                <div className={s.marker} style={{ left: `${strategy.tti * unit}%`, '--mc': '#b48eff' } as React.CSSProperties}>
                  <span className={s.markerLabel}>TTI</span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className={s.cursor} style={{ left: `${Math.min(progress, TOTAL) * unit}%` }} />
      </div>

      <div className={s.tooltip}>
        {activeHover ? (
          <>
            <span style={{ color: activeHover.color }} className={s.tooltipPhase}>{activeHover.label}</span>
            <span className={s.tooltipNote}>{activeHover.note}</span>
          </>
        ) : (
          <span className={s.tooltipHint}>наведи на фазу для описания</span>
        )}
      </div>

      <div className={s.legend}>
        {[
          { color: '#4e9eff', label: 'HTML' },
          { color: '#f0c040', label: 'JavaScript' },
          { color: '#b48eff', label: 'Server / Hydration' },
          { color: '#00e5a0', label: 'Content visible' },
        ].map(l => (
          <div key={l.label} className={s.legendItem}>
            <span className={s.legendDot} style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
