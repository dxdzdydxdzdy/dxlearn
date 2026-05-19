'use client';

import { useState } from 'react';
import s from './WaterfallDemo.module.scss';

interface Resource {
  name: string;
  type: 'html' | 'css' | 'js' | 'font' | 'img';
  start: number;
  duration: number;
  blocking: boolean;
  note?: string;
}

const SCENARIOS: Record<string, { label: string; resources: Resource[] }> = {
  bad: {
    label: 'Без оптимизаций',
    resources: [
      { name: 'index.html', type: 'html', start: 0, duration: 2, blocking: false },
      { name: 'styles.css', type: 'css', start: 2, duration: 3, blocking: true, note: 'блокирует рендер' },
      { name: 'analytics.js', type: 'js', start: 2, duration: 4, blocking: true, note: 'блокирует парсер' },
      { name: 'app.js', type: 'js', start: 6, duration: 5, blocking: true, note: 'блокирует парсер' },
      { name: 'font.woff2', type: 'font', start: 5, duration: 3, blocking: false },
      { name: 'hero.jpg', type: 'img', start: 11, duration: 4, blocking: false },
    ],
  },
  good: {
    label: 'С оптимизациями',
    resources: [
      { name: 'index.html', type: 'html', start: 0, duration: 2, blocking: false },
      { name: 'styles.css', type: 'css', start: 2, duration: 3, blocking: false, note: 'критический CSS inline' },
      { name: 'font.woff2', type: 'font', start: 2, duration: 3, blocking: false, note: 'preload' },
      { name: 'analytics.js', type: 'js', start: 2, duration: 4, blocking: false, note: 'async' },
      { name: 'hero.jpg', type: 'img', start: 2, duration: 4, blocking: false, note: 'preload' },
      { name: 'app.js', type: 'js', start: 2, duration: 5, blocking: false, note: 'defer' },
    ],
  },
};

const TYPE_COLOR: Record<string, string> = {
  html: '#4e9eff',
  css: '#b48eff',
  js: '#f0c040',
  font: '#00e5a0',
  img: '#ff7b72',
};

const TOTAL_UNITS = 16;
const UNIT = 100 / TOTAL_UNITS;

export function WaterfallDemo() {
  const [scenario, setScenario] = useState<'bad' | 'good'>('bad');
  const [hovered, setHovered] = useState<string | null>(null);

  const { resources } = SCENARIOS[scenario];
  const lastEnd = Math.max(...resources.map(r => r.start + r.duration));

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// waterfall-demo</span>
        <div className={s.tabs}>
          {(['bad', 'good'] as const).map(k => (
            <button
              key={k}
              className={`${s.tab} ${scenario === k ? s.tabActive : ''}`}
              onClick={() => setScenario(k)}
            >
              {SCENARIOS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.chart}>
        <div className={s.timeAxis}>
          {Array.from({ length: TOTAL_UNITS + 1 }, (_, i) => (
            <div key={i} className={s.tick} style={{ left: `${i * UNIT}%` }}>
              {i % 2 === 0 && <span className={s.tickLabel}>{i * 100}ms</span>}
            </div>
          ))}
        </div>

        <div className={s.rows}>
          {resources.map(r => (
            <div
              key={r.name}
              className={s.row}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={s.rowLabel}>
                <span className={s.typeBadge} style={{ background: TYPE_COLOR[r.type] }}>{r.type}</span>
                <span className={s.rowName}>{r.name}</span>
              </div>
              <div className={s.rowTrack}>
                <div
                  className={`${s.bar} ${r.blocking ? s.barBlocking : ''} ${hovered === r.name ? s.barHovered : ''}`}
                  style={{
                    left: `${r.start * UNIT}%`,
                    width: `${r.duration * UNIT}%`,
                    background: r.blocking ? undefined : TYPE_COLOR[r.type],
                  }}
                >
                  {hovered === r.name && r.note && (
                    <span className={s.tooltip}>{r.note}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={s.fcp}>
          <div
            className={s.fcpLine}
            style={{ left: `${lastEnd * UNIT}%` }}
          />
          <div
            className={s.fcpLabel}
            style={{ left: `${lastEnd * UNIT}%` }}
          >
            FCP ~{lastEnd * 100}ms
          </div>
        </div>
      </div>

      <div className={s.legend}>
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <div key={type} className={s.legendItem}>
            <span className={s.legendDot} style={{ background: color }} />
            <span>{type}</span>
          </div>
        ))}
        <div className={s.legendItem}>
          <span className={s.legendDot} style={{ background: '#ff5f6a', opacity: 0.6 }} />
          <span>blocking</span>
        </div>
      </div>
    </div>
  );
}
