'use client';

import { useState } from 'react';
import s from './BigOArticle.module.scss';

const COMPLEXITIES = [
  { key: 'O1',     label: 'O(1)',       fn: (_: number) => 1,              color: '#00e5a0' },
  { key: 'Ologn',  label: 'O(log n)',   fn: (n: number) => Math.log2(n),   color: '#4db8ff' },
  { key: 'On',     label: 'O(n)',       fn: (n: number) => n,              color: '#f0db4f' },
  { key: 'Onlogn', label: 'O(n log n)', fn: (n: number) => n * Math.log2(n), color: '#d2a679' },
  { key: 'On2',    label: 'O(n²)',      fn: (n: number) => n * n,          color: '#ff7b72' },
  { key: 'O2n',    label: 'O(2ⁿ)',      fn: (n: number) => Math.pow(2, n), color: '#c96daa' },
];

const MAX_N    = 20;
const CHART_H  = 200;
const CHART_W  = 100; // viewBox units

// log scale: log(v+1) normalized to log(maxVal+1)
function logNorm(v: number, maxVal: number): number {
  return Math.log(v + 1) / Math.log(maxVal + 1);
}

const OPS_AT: number[] = [1, 5, 10, 20, 50, 100, 1000, 1_000_000];

function fmt(v: number): string {
  if (!isFinite(v) || v > 1e30) return '∞';
  if (v >= 1e12) return `${(v / 1e12).toFixed(0)}T`;
  if (v >= 1e9)  return `${(v / 1e9).toFixed(0)}B`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(0)}M`;
  if (v >= 1e3)  return `${(v / 1e3).toFixed(0)}K`;
  return Math.round(v).toLocaleString('ru');
}

function danger(v: number): string {
  if (!isFinite(v) || v > 1e15) return '#ff5f6a';
  if (v > 1e9) return '#ff7b72';
  if (v > 1e6) return '#f0db4f';
  if (v > 1e3) return '#d2a679';
  return '#00e5a0';
}

export function BigOChart() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [n, setN] = useState(10);

  const toggle = (key: string) =>
    setHidden(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  // Compute log-scale paths (normalise against O(2^MAX_N))
  const maxVal = Math.pow(2, MAX_N);
  const paths = COMPLEXITIES.map(c => {
    const pts = Array.from({ length: MAX_N }, (_, i) => {
      const ni = i + 1;
      const x  = ((ni - 1) / (MAX_N - 1)) * CHART_W;
      const y  = CHART_H - logNorm(c.fn(ni), maxVal) * CHART_H;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    return { ...c, pts, dotY: CHART_H - logNorm(c.fn(n), maxVal) * CHART_H };
  });

  return (
    <div className={s.chartWrap}>
      {/* ── SVG chart (log scale) ── */}
      <div className={s.chartTop}>
        <div className={s.chartSvgWrap}>
          <div className={s.chartYLabel}>операций (log шкала)</div>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" className={s.chartSvg}>
            {[0.25, 0.5, 0.75, 1].map(f => (
              <line key={f} x1="0" y1={CHART_H * (1 - f)} x2={CHART_W} y2={CHART_H * (1 - f)}
                stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
            ))}
            {paths.map(c => !hidden.has(c.key) && (
              <polyline key={c.key} points={c.pts} fill="none"
                stroke={c.color} strokeWidth="1.4" strokeLinejoin="round" />
            ))}
            {/* vertical cursor */}
            <line x1={((n - 1) / (MAX_N - 1)) * CHART_W} y1="0"
                  x2={((n - 1) / (MAX_N - 1)) * CHART_W} y2={CHART_H}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" strokeDasharray="2,2" />
            {paths.map(c => !hidden.has(c.key) && (
              <circle key={c.key}
                cx={((n - 1) / (MAX_N - 1)) * CHART_W}
                cy={c.dotY}
                r="1.4" fill={c.color} />
            ))}
          </svg>
          <div className={s.chartAxisX}><span>n = 1</span><span>n = {MAX_N}</span></div>
        </div>

        {/* live values at current n */}
        <div className={s.liveValues}>
          <div className={s.liveTitle}>При n = {n}</div>
          {paths.map(c => (
            <div key={c.key} className={`${s.liveRow}${hidden.has(c.key) ? ` ${s.liveRowHidden}` : ''}`}
              onClick={() => toggle(c.key)} role="button" tabIndex={0}>
              <span className={s.liveDot} style={{ background: c.color }} />
              <span className={s.liveLabel}>{c.label}</span>
              <span className={s.liveOps} style={{ color: danger(c.fn(n)) }}>
                {fmt(c.fn(n))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.sliderWrap}>
        <span className={s.sliderLabel}>n =</span>
        <input type="range" min={1} max={MAX_N} value={n}
          onChange={e => setN(Number(e.target.value))} className={s.slider} />
        <span className={s.sliderVal}>{n}</span>
      </div>

      {/* ── Operations table ── */}
      <div className={s.opsTable}>
        <div className={s.opsTableTitle}>// сколько операций при разных n</div>
        <div className={s.opsGrid}>
          <div className={s.opsHeader}>
            <span>n →</span>
            {OPS_AT.map(n => <span key={n}>{n >= 1e6 ? '1M' : n >= 1e3 ? `${n/1000}K` : n}</span>)}
          </div>
          {COMPLEXITIES.map(c => (
            <div key={c.key} className={s.opsRow}>
              <span className={s.opsNotation} style={{ color: c.color }}>{c.label}</span>
              {OPS_AT.map(n => {
                const v = c.fn(n);
                return (
                  <span key={n} className={s.opsCell} style={{ color: danger(v) }}>
                    {fmt(v)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
