'use client';

import { useState, useEffect, useRef } from 'react';
import s from './VectorExplorer.module.scss';

// ── 2D semantic space (UMAP-style projection) ────────────────────────────────

interface Point {
  id: string;
  label: string;
  x: number;   // 0–1
  y: number;   // 0–1
  group: string;
  color: string;
}

const POINTS: Point[] = [
  // Animals
  { id: 'dog',        label: 'dog',        x: 0.18, y: 0.20, group: 'animals',   color: '#4db8ff' },
  { id: 'cat',        label: 'cat',        x: 0.22, y: 0.14, group: 'animals',   color: '#4db8ff' },
  { id: 'wolf',       label: 'wolf',       x: 0.12, y: 0.26, group: 'animals',   color: '#4db8ff' },
  { id: 'lion',       label: 'lion',       x: 0.28, y: 0.22, group: 'animals',   color: '#4db8ff' },
  // Countries
  { id: 'france',     label: 'france',     x: 0.72, y: 0.18, group: 'countries', color: '#f0c040' },
  { id: 'germany',    label: 'germany',    x: 0.78, y: 0.24, group: 'countries', color: '#f0c040' },
  { id: 'spain',      label: 'spain',      x: 0.68, y: 0.28, group: 'countries', color: '#f0c040' },
  { id: 'italy',      label: 'italy',      x: 0.82, y: 0.16, group: 'countries', color: '#f0c040' },
  // Tech
  { id: 'python',     label: 'python',     x: 0.54, y: 0.72, group: 'tech',      color: '#ff9070' },
  { id: 'typescript', label: 'typescript', x: 0.62, y: 0.78, group: 'tech',      color: '#ff9070' },
  { id: 'rust',       label: 'rust',       x: 0.48, y: 0.82, group: 'tech',      color: '#ff9070' },
  { id: 'golang',     label: 'golang',     x: 0.58, y: 0.68, group: 'tech',      color: '#ff9070' },
  // Food
  { id: 'pizza',      label: 'pizza',      x: 0.80, y: 0.74, group: 'food',      color: '#c084fc' },
  { id: 'pasta',      label: 'pasta',      x: 0.86, y: 0.80, group: 'food',      color: '#c084fc' },
  { id: 'sushi',      label: 'sushi',      x: 0.74, y: 0.82, group: 'food',      color: '#c084fc' },
  { id: 'ramen',      label: 'ramen',      x: 0.82, y: 0.68, group: 'food',      color: '#c084fc' },
  // Emotions
  { id: 'happy',      label: 'happy',      x: 0.22, y: 0.72, group: 'emotions',  color: '#00e5a0' },
  { id: 'sad',        label: 'sad',        x: 0.16, y: 0.80, group: 'emotions',  color: '#00e5a0' },
  { id: 'angry',      label: 'angry',      x: 0.28, y: 0.76, group: 'emotions',  color: '#00e5a0' },
  { id: 'joy',        label: 'joy',        x: 0.18, y: 0.66, group: 'emotions',  color: '#00e5a0' },
];

// Euclidean distance (2D proxy for real cosine sim)
function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Similarity = 1 - normalized distance (for display)
function simScore(a: Point, b: Point): number {
  const d = dist(a, b);
  return Math.max(0, 1 - d * 1.8); // scale so max ≈ 0.95
}

// Pre-defined HNSW traversal paths (which points the algorithm visits)
// Simulates entering from a random entry point and navigating the graph
const HNSW_PATHS: Record<string, string[]> = {
  dog:        ['pizza', 'france', 'cat', 'lion', 'wolf'],
  cat:        ['pasta', 'germany', 'dog', 'wolf', 'lion'],
  wolf:       ['ramen', 'spain', 'dog', 'cat', 'lion'],
  lion:       ['sushi', 'italy', 'dog', 'cat', 'wolf'],
  france:     ['happy', 'python', 'germany', 'spain', 'italy'],
  germany:    ['joy', 'typescript', 'france', 'spain', 'italy'],
  spain:      ['sad', 'rust', 'france', 'germany', 'italy'],
  italy:      ['angry', 'golang', 'france', 'germany', 'spain'],
  python:     ['dog', 'france', 'typescript', 'rust', 'golang'],
  typescript: ['cat', 'germany', 'python', 'rust', 'golang'],
  rust:       ['wolf', 'spain', 'python', 'typescript', 'golang'],
  golang:     ['lion', 'italy', 'python', 'typescript', 'rust'],
  pizza:      ['happy', 'python', 'pasta', 'sushi', 'ramen'],
  pasta:      ['joy', 'typescript', 'pizza', 'sushi', 'ramen'],
  sushi:      ['sad', 'rust', 'pizza', 'pasta', 'ramen'],
  ramen:      ['angry', 'golang', 'pizza', 'pasta', 'sushi'],
  happy:      ['pizza', 'france', 'sad', 'angry', 'joy'],
  sad:        ['pasta', 'germany', 'happy', 'angry', 'joy'],
  angry:      ['sushi', 'italy', 'happy', 'sad', 'joy'],
  joy:        ['ramen', 'spain', 'happy', 'sad', 'angry'],
};

const SVG_W = 440;
const SVG_H = 320;
const PAD   = 32;

function toSvg(v: number, size: number): number {
  return PAD + v * (size - PAD * 2);
}

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = 'naive' | 'hnsw';

export function VectorExplorer() {
  const [selected, setSelected]     = useState<string | null>(null);
  const [mode, setMode]             = useState<Mode>('naive');
  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [topK, setTopK]             = useState<string[]>([]);
  const [running, setRunning]       = useState(false);
  const [done, setDone]             = useState(false);

  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function reset() {
    clearAll();
    setChecked(new Set());
    setTopK([]);
    setRunning(false);
    setDone(false);
  }

  function changeSelected(id: string) {
    reset();
    setSelected(id);
  }

  function changeMode(m: Mode) {
    reset();
    setMode(m);
  }

  function run() {
    if (!selected || running) return;
    reset();
    setRunning(true);
    setDone(false);

    const query = POINTS.find(p => p.id === selected)!;

    // Sequence of points to visit
    const sequence: string[] =
      mode === 'naive'
        ? POINTS.filter(p => p.id !== selected).map(p => p.id)
        : HNSW_PATHS[selected];

    // Compute top-3 from same-group (nearest)
    const sortedAll = POINTS
      .filter(p => p.id !== selected)
      .sort((a, b) => dist(a, query) - dist(b, query));
    const top3 = sortedAll.slice(0, 3).map(p => p.id);

    // Animate sequence
    const delay = mode === 'naive' ? 120 : 200;
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTopK(top3);
        setRunning(false);
        setDone(true);
        return;
      }
      setChecked(prev => new Set([...prev, sequence[i]]));
      i++;
    }, delay);
  }

  useEffect(() => () => clearAll(), []);

  const query = selected ? POINTS.find(p => p.id === selected)! : null;

  // Build top results for sidebar
  const results = query
    ? POINTS
        .filter(p => p.id !== selected)
        .sort((a, b) => dist(a, query) - dist(b, query))
        .slice(0, 3)
    : [];

  const totalChecked = mode === 'naive' ? POINTS.length - 1 : (HNSW_PATHS[selected ?? '']?.length ?? 0);
  const currentChecked = checked.size;

  return (
    <div className={s.explorer}>

      {/* Header */}
      <div className={s.header}>
        <span className={s.title}>Vector Space Explorer</span>

        <div className={s.modeTabs}>
          {(['naive', 'hnsw'] as Mode[]).map(m => (
            <button
              key={m}
              className={`${s.modeTab} ${mode === m ? s.modeTabOn : ''}`}
              onClick={() => changeMode(m)}
            >
              {m === 'naive' ? 'Brute Force' : 'HNSW'}
            </button>
          ))}
        </div>

        <div className={s.statusRow}>
          {running && (
            <span className={s.statusChip} style={{ color: '#f0c040', borderColor: 'rgba(240,192,64,0.3)' }}>
              проверяем...
            </span>
          )}
          {done && (
            <span className={s.statusChip} style={{ color: '#00e5a0', borderColor: 'rgba(0,229,160,0.3)' }}>
              ● найдено
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={s.body}>

        {/* SVG scatter plot */}
        <div className={s.plotWrap}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={s.plot}>
            {/* Group hulls (soft background blobs) */}
            {['animals', 'countries', 'tech', 'food', 'emotions'].map(grp => {
              const pts = POINTS.filter(p => p.group === grp);
              const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
              const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
              const rx = (Math.max(...pts.map(p => Math.abs(p.x - cx))) + 0.06) * (SVG_W - PAD * 2);
              const ry = (Math.max(...pts.map(p => Math.abs(p.y - cy))) + 0.06) * (SVG_H - PAD * 2);
              return (
                <ellipse
                  key={grp}
                  cx={toSvg(cx, SVG_W)}
                  cy={toSvg(cy, SVG_H)}
                  rx={rx}
                  ry={ry}
                  fill={pts[0].color + '0d'}
                  stroke={pts[0].color + '22'}
                  strokeWidth={1}
                />
              );
            })}

            {/* Lines from query to top-3 */}
            {query && topK.map(id => {
              const pt = POINTS.find(p => p.id === id)!;
              return (
                <line
                  key={id}
                  x1={toSvg(query.x, SVG_W)}
                  y1={toSvg(query.y, SVG_H)}
                  x2={toSvg(pt.x, SVG_W)}
                  y2={toSvg(pt.y, SVG_H)}
                  stroke="#00e5a0"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              );
            })}

            {/* Checked lines during search (orange flash) */}
            {query && !done && [...checked].map(id => {
              const pt = POINTS.find(p => p.id === id)!;
              return (
                <line
                  key={'c-' + id}
                  x1={toSvg(query.x, SVG_W)}
                  y1={toSvg(query.y, SVG_H)}
                  x2={toSvg(pt.x, SVG_W)}
                  y2={toSvg(pt.y, SVG_H)}
                  stroke="#f0c040"
                  strokeWidth={1}
                  opacity={0.25}
                />
              );
            })}

            {/* Points */}
            {POINTS.map(pt => {
              const isSelected = pt.id === selected;
              const isChecked  = checked.has(pt.id) && !done;
              const isTop      = topK.includes(pt.id);
              const topRank    = topK.indexOf(pt.id);

              let r = 5;
              let fill = pt.color + '33';
              let stroke = pt.color + '66';
              let strokeW = 1;

              if (isSelected) {
                r = 8; fill = pt.color; stroke = pt.color; strokeW = 2;
              } else if (isTop) {
                r = 7; fill = '#00e5a0'; stroke = '#00e5a0'; strokeW = 2;
              } else if (isChecked) {
                r = 5; fill = '#f0c04033'; stroke = '#f0c040'; strokeW = 1;
              }

              return (
                <g
                  key={pt.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => !running && changeSelected(pt.id)}
                >
                  {isSelected && (
                    <circle
                      cx={toSvg(pt.x, SVG_W)}
                      cy={toSvg(pt.y, SVG_H)}
                      r={14}
                      fill="none"
                      stroke={pt.color + '33'}
                      strokeWidth={6}
                    />
                  )}
                  {isTop && (
                    <circle
                      cx={toSvg(pt.x, SVG_W)}
                      cy={toSvg(pt.y, SVG_H)}
                      r={12}
                      fill="none"
                      stroke="#00e5a044"
                      strokeWidth={5}
                    />
                  )}
                  <circle
                    cx={toSvg(pt.x, SVG_W)}
                    cy={toSvg(pt.y, SVG_H)}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                  />
                  <text
                    x={toSvg(pt.x, SVG_W)}
                    y={toSvg(pt.y, SVG_H) - 8}
                    textAnchor="middle"
                    fontSize={isSelected || isTop ? 11 : 10}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={isSelected || isTop ? 700 : 400}
                    fill={isSelected ? pt.color : isTop ? '#00e5a0' : pt.color + '99'}
                  >
                    {isTop ? `#${topRank + 1} ${pt.label}` : pt.label}
                  </text>
                </g>
              );
            })}

            {/* Group labels */}
            {[
              { grp: 'animals',   cx: 0.20, cy: 0.04, label: 'animals',   color: '#4db8ff' },
              { grp: 'countries', cx: 0.75, cy: 0.04, label: 'countries', color: '#f0c040' },
              { grp: 'tech',      cx: 0.55, cy: 0.96, label: 'tech',      color: '#ff9070' },
              { grp: 'food',      cx: 0.80, cy: 0.96, label: 'food',      color: '#c084fc' },
              { grp: 'emotions',  cx: 0.22, cy: 0.94, label: 'emotions',  color: '#00e5a0' },
            ].map(g => (
              <text
                key={g.grp}
                x={toSvg(g.cx, SVG_W)}
                y={toSvg(g.cy, SVG_H)}
                textAnchor="middle"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill={g.color + '88'}
                letterSpacing="1"
              >
                {g.label.toUpperCase()}
              </text>
            ))}
          </svg>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          <div>
            <div className={s.sideLabel} style={{ marginBottom: '8px' }}>ВЫБЕРИ СЛОВО</div>
            <div className={s.wordGrid}>
              {POINTS.map(p => (
                <button
                  key={p.id}
                  className={`${s.wordBtn} ${selected === p.id ? s.wordBtnOn : ''}`}
                  style={{ borderColor: selected === p.id ? p.color + '66' : undefined }}
                  onClick={() => !running && changeSelected(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {selected && (
            <div className={s.statBlock}>
              <div className={s.statRow}>
                <span className={s.statLabel}>Метод</span>
                <span className={s.statVal} style={{ color: mode === 'naive' ? '#ff9070' : '#00e5a0' }}>
                  {mode === 'naive' ? 'Brute Force' : 'HNSW'}
                </span>
              </div>
              <div className={s.statRow}>
                <span className={s.statLabel}>Проверено</span>
                <span
                  className={s.statVal}
                  style={{ color: mode === 'naive' ? '#ff9070' : '#00e5a0' }}
                >
                  {currentChecked} / {mode === 'naive' ? POINTS.length - 1 : totalChecked}
                </span>
              </div>
              {(running || done) && (
                <div className={s.progressWrap}>
                  <div className={s.progressTrack}>
                    <div
                      className={s.progressFill}
                      style={{
                        width: `${(currentChecked / totalChecked) * 100}%`,
                        background: mode === 'naive' ? '#ff9070' : '#00e5a0',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top results */}
          {topK.length > 0 && (
            <div>
              <div className={s.sideLabel} style={{ marginBottom: '8px' }}>ТОП-3 СОСЕДЕЙ</div>
              <div className={s.resultsList}>
                {results.map((pt, i) => (
                  <div key={pt.id} className={s.resultItem}>
                    <span
                      className={s.resultRank}
                      style={{ color: i === 0 ? '#00e5a0' : i === 1 ? '#f0c040' : '#4db8ff' }}
                    >
                      #{i + 1}
                    </span>
                    <span className={s.resultWord}>{pt.label}</span>
                    <span
                      className={s.resultSim}
                      style={{ color: i === 0 ? '#00e5a0' : i === 1 ? '#f0c040' : '#4db8ff' }}
                    >
                      {(simScore(query!, pt) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              className={s.runBtn}
              onClick={run}
              disabled={!selected || running}
            >
              {running ? '⏳ Поиск...' : '▶ Запустить поиск'}
            </button>
            {(done || checked.size > 0) && (
              <button className={s.resetBtn} onClick={reset}>↺ Сбросить</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
