'use client';

import { useState } from 'react';
import s from './EmbeddingExplorer.module.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

type Cluster = 'tech' | 'animal' | 'royal' | 'job' | 'emotion';

interface Word {
  word: string;
  x: number;   // 0..400
  y: number;   // 0..280
  cluster: Cluster;
  // 6D semantic vector for cosine similarity
  vec: [number, number, number, number, number, number];
}

const CLUSTER_COLOR: Record<Cluster, string> = {
  tech:    '#4db8ff',
  animal:  '#00e5a0',
  royal:   '#f0c040',
  job:     '#ff9070',
  emotion: '#c084fc',
};

const CLUSTER_LABEL: Record<Cluster, string> = {
  tech:    'Технологии',
  animal:  'Животные',
  royal:   'Монархия',
  job:     'Профессии',
  emotion: 'Эмоции',
};

// Dimensions: [tech, living, prestige, emotional, male, abstract]
const WORDS: Word[] = [
  // Tech
  { word: 'компьютер', x: 72,  y: 52,  cluster: 'tech',    vec: [1.0, 0.0, 0.2, 0.0, 0.0, 0.3] },
  { word: 'сервер',    x: 108, y: 75,  cluster: 'tech',    vec: [0.9, 0.0, 0.1, 0.0, 0.0, 0.2] },
  { word: 'алгоритм', x: 60,  y: 98,  cluster: 'tech',    vec: [0.8, 0.0, 0.1, 0.0, 0.0, 0.5] },
  { word: 'нейросеть', x: 96, y: 118, cluster: 'tech',    vec: [0.9, 0.0, 0.2, 0.0, 0.0, 0.4] },
  // Animals
  { word: 'кошка',    x: 318, y: 55,  cluster: 'animal',  vec: [0.0, 0.9, 0.1, 0.3, 0.3, 0.0] },
  { word: 'собака',   x: 352, y: 80,  cluster: 'animal',  vec: [0.0, 0.9, 0.1, 0.3, 0.5, 0.0] },
  { word: 'птица',    x: 300, y: 98,  cluster: 'animal',  vec: [0.0, 0.8, 0.0, 0.1, 0.2, 0.0] },
  { word: 'рыба',     x: 338, y: 118, cluster: 'animal',  vec: [0.0, 0.7, 0.0, 0.0, 0.0, 0.0] },
  // Royalty
  { word: 'король',   x: 182, y: 118, cluster: 'royal',   vec: [0.0, 0.7, 0.9, 0.2, 0.9, 0.1] },
  { word: 'королева', x: 228, y: 100, cluster: 'royal',   vec: [0.0, 0.7, 0.9, 0.3, 0.1, 0.1] },
  { word: 'принц',    x: 195, y: 148, cluster: 'royal',   vec: [0.0, 0.6, 0.7, 0.2, 0.8, 0.1] },
  { word: 'принцесса',x: 242, y: 132, cluster: 'royal',   vec: [0.0, 0.6, 0.7, 0.3, 0.1, 0.1] },
  // Jobs
  { word: 'врач',     x: 95,  y: 205, cluster: 'job',     vec: [0.2, 0.6, 0.6, 0.2, 0.4, 0.1] },
  { word: 'учитель',  x: 128, y: 228, cluster: 'job',     vec: [0.1, 0.6, 0.5, 0.3, 0.4, 0.1] },
  { word: 'инженер',  x: 72,  y: 242, cluster: 'job',     vec: [0.6, 0.5, 0.4, 0.1, 0.6, 0.1] },
  { word: 'повар',    x: 110, y: 258, cluster: 'job',     vec: [0.1, 0.5, 0.3, 0.2, 0.4, 0.0] },
  // Emotions
  { word: 'радость',  x: 318, y: 205, cluster: 'emotion', vec: [0.0, 0.0, 0.1, 0.9, 0.0, 0.9] },
  { word: 'страх',    x: 352, y: 228, cluster: 'emotion', vec: [0.0, 0.0, 0.0, 0.8, 0.0, 0.8] },
  { word: 'любовь',   x: 300, y: 245, cluster: 'emotion', vec: [0.0, 0.1, 0.2, 0.9, 0.0, 0.9] },
  { word: 'гнев',     x: 340, y: 262, cluster: 'emotion', vec: [0.0, 0.0, 0.0, 0.8, 0.2, 0.7] },
];

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function norm(a: number[]): number {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}

function cosine(a: number[], b: number[]): number {
  const n = norm(a) * norm(b);
  return n === 0 ? 0 : dot(a, b) / n;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmbeddingExplorer() {
  const [selA, setSelA] = useState<number | null>(null);
  const [selB, setSelB] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  function handleClick(i: number) {
    if (selA === null) { setSelA(i); return; }
    if (selA === i)    { setSelA(null); setSelB(null); return; }
    if (selB === null) { setSelB(i); return; }
    // Reset and start with new selection
    setSelA(i); setSelB(null);
  }

  const similarity = selA !== null && selB !== null
    ? cosine(WORDS[selA].vec, WORDS[selB].vec)
    : null;

  const similarityColor =
    similarity === null   ? '#7a9aaa'
    : similarity > 0.85   ? '#00e5a0'
    : similarity > 0.55   ? '#f0c040'
    : '#ff5f6a';

  // Find similar words for hovered
  const hoveredSimilar = hovered !== null
    ? WORDS
        .map((w, i) => ({ i, sim: cosine(WORDS[hovered].vec, w.vec) }))
        .filter(x => x.i !== hovered && x.sim > 0.7)
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 3)
        .map(x => x.i)
    : [];

  return (
    <div className={s.explorer}>
      <div className={s.header}>
        <span className={s.headerTitle}>Карта смыслов</span>
        <span className={s.headerSub}>
          Кликни два слова → увидишь cosine similarity
        </span>
      </div>

      <div className={s.body}>
        {/* SVG Map */}
        <div className={s.mapWrap}>
          <svg viewBox="0 0 400 290" className={s.svg}>
            {/* Cluster halos */}
            {(Object.keys(CLUSTER_COLOR) as Cluster[]).map(cl => {
              const pts = WORDS.filter(w => w.cluster === cl);
              const cx = pts.reduce((s, w) => s + w.x, 0) / pts.length;
              const cy = pts.reduce((s, w) => s + w.y, 0) / pts.length;
              return (
                <ellipse
                  key={cl}
                  cx={cx} cy={cy}
                  rx={58} ry={48}
                  fill={CLUSTER_COLOR[cl]}
                  fillOpacity={0.06}
                  stroke={CLUSTER_COLOR[cl]}
                  strokeOpacity={0.15}
                  strokeWidth={1}
                />
              );
            })}

            {/* Line between selected */}
            {selA !== null && selB !== null && (
              <line
                x1={WORDS[selA].x} y1={WORDS[selA].y}
                x2={WORDS[selB].x} y2={WORDS[selB].y}
                stroke={similarityColor}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}

            {/* Hover similarity lines */}
            {hovered !== null && hoveredSimilar.map(si => (
              <line
                key={si}
                x1={WORDS[hovered].x} y1={WORDS[hovered].y}
                x2={WORDS[si].x} y2={WORDS[si].y}
                stroke={CLUSTER_COLOR[WORDS[hovered].cluster]}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.4}
              />
            ))}

            {/* Words */}
            {WORDS.map((w, i) => {
              const isSelA = selA === i;
              const isSelB = selB === i;
              const isHov = hovered === i || hoveredSimilar.includes(i);
              const color = CLUSTER_COLOR[w.cluster];
              const r = isSelA || isSelB ? 7 : isHov ? 6 : 5;

              return (
                <g
                  key={w.word}
                  className={s.wordGroup}
                  onClick={() => handleClick(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle
                    cx={w.x} cy={w.y} r={r + 6}
                    fill="transparent"
                  />
                  <circle
                    cx={w.x} cy={w.y} r={r}
                    fill={isSelA || isSelB ? color : `${color}33`}
                    stroke={color}
                    strokeWidth={isSelA || isSelB ? 2 : isHov ? 1.5 : 1}
                  />
                  <text
                    x={w.x}
                    y={w.y - r - 4}
                    textAnchor="middle"
                    className={s.wordLabel}
                    fill={isSelA || isSelB || isHov ? color : '#7a9aaa'}
                    fontWeight={isSelA || isSelB ? 700 : 400}
                  >
                    {w.word}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className={s.legend}>
            {(Object.entries(CLUSTER_LABEL) as [Cluster, string][]).map(([cl, label]) => (
              <div key={cl} className={s.legendItem}>
                <div className={s.legendDot} style={{ background: CLUSTER_COLOR[cl] }} />
                <span className={s.legendLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similarity panel */}
        <div className={s.panel}>
          {selA === null ? (
            <div className={s.hint}>
              <div className={s.hintIcon}>↖</div>
              <div className={s.hintText}>Кликни первое слово</div>
            </div>
          ) : selB === null ? (
            <div className={s.hint}>
              <div className={s.hintIcon}>↖</div>
              <div className={s.hintText}>Теперь выбери второе</div>
              <div className={s.selectedWord} style={{ color: CLUSTER_COLOR[WORDS[selA].cluster] }}>
                {WORDS[selA].word}
              </div>
            </div>
          ) : (
            <div className={s.result}>
              <div className={s.pairRow}>
                <span className={s.pairWord} style={{ color: CLUSTER_COLOR[WORDS[selA].cluster] }}>
                  {WORDS[selA].word}
                </span>
                <span className={s.pairVs}>vs</span>
                <span className={s.pairWord} style={{ color: CLUSTER_COLOR[WORDS[selB].cluster] }}>
                  {WORDS[selB].word}
                </span>
              </div>

              <div className={s.scoreWrap}>
                <div className={s.scoreLabel}>cosine similarity</div>
                <div className={s.scoreNum} style={{ color: similarityColor }}>
                  {similarity!.toFixed(3)}
                </div>
                <div className={s.scoreBar}>
                  <div
                    className={s.scoreBarFill}
                    style={{
                      width: `${Math.max(0, similarity!) * 100}%`,
                      background: similarityColor,
                    }}
                  />
                </div>
              </div>

              <div className={s.scoreInterp} style={{ color: similarityColor }}>
                {similarity! > 0.85 ? '● Очень похожи — один кластер смыслов'
                  : similarity! > 0.55 ? '● Умеренное сходство — есть общие черты'
                  : similarity! > 0.2  ? '● Слабое сходство — разные области'
                  : '● Не связаны — разные миры'}
              </div>

              <div className={s.vectorRow}>
                <div className={s.vecLabel}>Вектор A</div>
                <div className={s.vecBars}>
                  {WORDS[selA].vec.map((v, i) => (
                    <div key={i} className={s.vecBar}>
                      <div
                        className={s.vecBarFill}
                        style={{
                          height: `${v * 100}%`,
                          background: CLUSTER_COLOR[WORDS[selA].cluster],
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.vectorRow}>
                <div className={s.vecLabel}>Вектор B</div>
                <div className={s.vecBars}>
                  {WORDS[selB].vec.map((v, i) => (
                    <div key={i} className={s.vecBar}>
                      <div
                        className={s.vecBarFill}
                        style={{
                          height: `${v * 100}%`,
                          background: CLUSTER_COLOR[WORDS[selB].cluster],
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.vecDimLabels}>
                {['tech', 'живой', 'стат.', 'эмоц.', 'муж.', 'абстр.'].map(l => (
                  <span key={l} className={s.vecDimLabel}>{l}</span>
                ))}
              </div>

              <button className={s.resetBtn} onClick={() => { setSelA(null); setSelB(null); }}>
                сбросить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
