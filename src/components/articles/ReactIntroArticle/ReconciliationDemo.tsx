'use client';

import { useState, useEffect } from 'react';
import s from './ReconciliationDemo.module.scss';

// ── Component tree definition ─────────────────────────────────────────────────

interface TreeNode {
  id: string;
  label: string;
  sublabel: string;
  col: number; // grid column (1-based)
  row: number; // grid row (1-based)
  parentId?: string;
  hasState?: boolean;
}

const NODES: TreeNode[] = [
  { id:'app',     label:'App',           sublabel:'корневой компонент',  col:3, row:1 },
  { id:'header',  label:'Header',        sublabel:'навигация',           col:1, row:2, parentId:'app' },
  { id:'main',    label:'Main',          sublabel:'контент страницы',    col:3, row:2, parentId:'app' },
  { id:'sidebar', label:'Sidebar',       sublabel:'боковая панель',      col:5, row:2, parentId:'app' },
  { id:'counter', label:'Counter',       sublabel:'useState(count)',      col:2, row:3, parentId:'main', hasState:true },
  { id:'feed',    label:'Feed',          sublabel:'список постов',        col:4, row:3, parentId:'main' },
  { id:'post1',   label:'Post',          sublabel:'компонент поста',     col:3, row:4, parentId:'feed' },
  { id:'post2',   label:'Post',          sublabel:'компонент поста',     col:5, row:4, parentId:'feed' },
];

// Which nodes re-render when Counter's state changes
const RERENDERS = new Set(['counter']);
// The rest stay the same
const UNCHANGED = new Set(NODES.map(n => n.id).filter(id => !RERENDERS.has(id)));

type Phase = 'idle' | 'trigger' | 'vdom' | 'diff' | 'patch';

const PHASE_LABELS: Record<Phase, string> = {
  idle:    'нажми кнопку чтобы увидеть обновление',
  trigger: 'Counter вызвал setState — React планирует обновление',
  vdom:    'React строит новый Virtual DOM дерево...',
  diff:    'Сравниваем новый и старый Virtual DOM (reconciliation)',
  patch:   'Обновлён только 1 узел в реальном DOM',
};

// ── Node positions in CSS grid (5 cols × 4 rows) ─────────────────────────────

// col 1 2 3 4 5
// row 1: App (col 3)
// row 2: Header (1), Main (3), Sidebar (5)
// row 3: Counter (2), Feed (4)
// row 4: Post (3), Post (5)

const EDGES: Array<[string, string]> = [
  ['app', 'header'],
  ['app', 'main'],
  ['app', 'sidebar'],
  ['main', 'counter'],
  ['main', 'feed'],
  ['feed', 'post1'],
  ['feed', 'post2'],
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ReconciliationDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [renderCount, setRenderCount] = useState(0);

  function runAnimation() {
    if (phase !== 'idle') return;
    const phases: Phase[] = ['trigger', 'vdom', 'diff', 'patch'];
    let i = 0;
    const delays = [0, 700, 1400, 2100];
    phases.forEach((p, idx) => {
      setTimeout(() => {
        setPhase(p);
        if (p === 'patch') {
          setRenderCount(c => c + 1);
          setTimeout(() => setPhase('idle'), 1800);
        }
      }, delays[idx]);
    });
  }

  function nodeClass(id: string): string {
    const classes = [s.node];
    if (phase === 'idle') {
      classes.push(s.nodeIdle);
    } else if (phase === 'trigger' && id === 'counter') {
      classes.push(s.nodeTrigger);
    } else if (phase === 'vdom') {
      classes.push(RERENDERS.has(id) ? s.nodeVdom : s.nodeDim);
    } else if (phase === 'diff') {
      classes.push(RERENDERS.has(id) ? s.nodeDiff : s.nodeDim);
    } else if (phase === 'patch') {
      classes.push(RERENDERS.has(id) ? s.nodePatch : s.nodeUnchanged);
    }
    const node = NODES.find(n => n.id === id);
    if (node?.hasState) classes.push(s.nodeHasState);
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className={s.wrap}>

      {/* ── Controls ── */}
      <div className={s.controls}>
        <button
          className={`${s.triggerBtn} ${phase !== 'idle' ? s.triggerBtnDisabled : ''}`}
          onClick={runAnimation}
          disabled={phase !== 'idle'}
        >
          {phase === 'idle' ? '+ изменить состояние Counter' : '⟳ анимация идёт...'}
        </button>
        <div className={s.stats}>
          <span className={s.stat}>
            <span className={s.statNum}>{renderCount > 0 ? 1 : 0}</span>
            <span className={s.statLabel}>DOM-узлов обновлено</span>
          </span>
          <span className={s.statDivider} />
          <span className={s.stat}>
            <span className={s.statNum}>{NODES.length - 1}</span>
            <span className={s.statLabel}>не тронуто</span>
          </span>
        </div>
      </div>

      {/* ── Phase label ── */}
      <div className={s.phaseBar}>
        <span className={`${s.phaseDot} ${phase !== 'idle' ? s.phaseDotActive : ''}`} />
        <span className={s.phaseText}>{PHASE_LABELS[phase]}</span>
      </div>

      {/* ── Tree grid ── */}
      <div className={s.treeWrap}>
        {/* SVG edges */}
        <svg className={s.edgesSvg} aria-hidden>
          {EDGES.map(([fromId, toId]) => {
            const from = NODES.find(n => n.id === fromId)!;
            const to   = NODES.find(n => n.id === toId)!;
            const x1 = (from.col - 1) * 20 + 10;
            const y1 = (from.row - 1) * 25 + 12.5;
            const x2 = (to.col - 1) * 20 + 10;
            const y2 = (to.row - 1) * 25 + 12.5;
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={`${x1}%`} y1={`${y1}%`}
                x2={`${x2}%`} y2={`${y2}%`}
                stroke="#1e2f3d"
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <div className={s.treeGrid}>
          {NODES.map(node => (
            <div
              key={node.id}
              className={nodeClass(node.id)}
              style={{
                gridColumn: node.col,
                gridRow: node.row,
              }}
            >
              <div className={s.nodeLabel}>{node.label}</div>
              <div className={s.nodeSub}>{node.sublabel}</div>
              {node.hasState && (
                <div className={s.stateBadge}>state</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.dotPatch}`} />
          перерендерился
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.dotUnchanged}`} />
          не тронут
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.dotState}`} />
          компонент с state
        </span>
      </div>

    </div>
  );
}
