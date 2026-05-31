'use client';

import { useState } from 'react';
import s from './BranchVisualizer.module.scss';

// ── Types ────────────────────────────────────────────────────────────────────

type TagType = 'main' | 'feature' | 'head';

interface TagData { text: string; type: TagType; }

interface Node {
  id: string;
  cx: number;
  cy: number;
  hash: string;
  lane: 'main' | 'feature' | 'center';
}

interface BranchDef {
  name: string;
  type: 'main' | 'feature';
  commitId: string;
}

interface Frame {
  command?: string;
  description: string;
  nodes: Node[];
  edges: Array<[string, string]>;
  branches: BranchDef[];
  headOn: string;
}

// ── Layout constants ──────────────────────────────────────────────────────────

const R       = 28;   // circle radius — bigger so hash fits comfortably
const MAIN_Y  = 188;  // main lane y — pushed down, space for bottom tags
const FEAT_Y  = 75;   // feature lane y — pushed down from top, space for top tags
const CEN_Y   = 132;  // single-commit center y

// SVG viewport: 560 × 270
// Tag strip above feature nodes: ~y=20, well clear of viewBox top
// Tag strip below main nodes: ~y=225, well within viewBox

// ── Node catalogue ────────────────────────────────────────────────────────────

const N: Record<string, Node> = {
  // single-commit layout (frames 0-2)
  C0s: { id:'C0', cx:280, cy:CEN_Y,  hash:'a1b2c3', lane:'center'  },

  // two-commit layout (frame 3)
  C0b: { id:'C0', cx:95,  cy:MAIN_Y, hash:'a1b2c3', lane:'main'    },
  C1b: { id:'C1', cx:365, cy:FEAT_Y, hash:'b2c3d4', lane:'feature' },

  // three-commit layout (frames 4-6)
  C0t: { id:'C0', cx:75,  cy:MAIN_Y, hash:'a1b2c3', lane:'main'    },
  C1t: { id:'C1', cx:240, cy:FEAT_Y, hash:'b2c3d4', lane:'feature' },
  C2t: { id:'C2', cx:450, cy:FEAT_Y, hash:'c3d4e5', lane:'feature' },
};

// ── Frame definitions ─────────────────────────────────────────────────────────

const FRAMES: Frame[] = [
  {
    description:
      'Начальное состояние: одна ветка main и один коммит. HEAD указывает на main, main — на коммит.',
    nodes: [N.C0s],
    edges: [],
    branches: [{ name:'main', type:'main', commitId:'C0' }],
    headOn: 'main',
  },
  {
    command: 'git branch feature',
    description:
      'Ветка feature создана — это просто второй указатель на тот же коммит. ' +
      'В .git/refs/heads/ появился файл feature со значением хэша. ' +
      'Создание ветки мгновенно и не копирует файлы.',
    nodes: [N.C0s],
    edges: [],
    branches: [
      { name:'main',    type:'main',    commitId:'C0' },
      { name:'feature', type:'feature', commitId:'C0' },
    ],
    headOn: 'main',
  },
  {
    command: 'git switch feature',
    description:
      'HEAD теперь указывает на feature. Рабочая директория не изменилась — ' +
      'main и feature на одном коммите. Git просто записал "ref: refs/heads/feature" в .git/HEAD.',
    nodes: [N.C0s],
    edges: [],
    branches: [
      { name:'main',    type:'main',    commitId:'C0' },
      { name:'feature', type:'feature', commitId:'C0' },
    ],
    headOn: 'feature',
  },
  {
    command: 'git commit -m "add login form"',
    description:
      'Новый коммит C1 создан на ветке feature. feature и HEAD сдвинулись на C1. ' +
      'main осталась на C0. Ветки начали расходиться.',
    nodes: [N.C0b, N.C1b],
    edges: [['C1', 'C0']],
    branches: [
      { name:'main',    type:'main',    commitId:'C0' },
      { name:'feature', type:'feature', commitId:'C1' },
    ],
    headOn: 'feature',
  },
  {
    command: 'git commit -m "add validation"',
    description:
      'Ещё один коммит на feature. Теперь feature на два коммита впереди main. ' +
      'У каждого коммита ровно один родитель — это образует цепочку (линейная история).',
    nodes: [N.C0t, N.C1t, N.C2t],
    edges: [['C1', 'C0'], ['C2', 'C1']],
    branches: [
      { name:'main',    type:'main',    commitId:'C0' },
      { name:'feature', type:'feature', commitId:'C2' },
    ],
    headOn: 'feature',
  },
  {
    command: 'git switch main',
    description:
      'Вернулись на main. HEAD теперь на main, рабочая директория откатилась к C0. ' +
      'Коммиты C1 и C2 никуда не делись — они на ветке feature.',
    nodes: [N.C0t, N.C1t, N.C2t],
    edges: [['C1', 'C0'], ['C2', 'C1']],
    branches: [
      { name:'main',    type:'main',    commitId:'C0' },
      { name:'feature', type:'feature', commitId:'C2' },
    ],
    headOn: 'main',
  },
  {
    command: 'git merge feature',
    description:
      'Fast-forward merge: main просто переместилась до C2. Нового merge-коммита нет — ' +
      'Git выбирает fast-forward когда main не добавляла своих коммитов после расхождения.',
    nodes: [N.C0t, N.C1t, N.C2t],
    edges: [['C1', 'C0'], ['C2', 'C1']],
    branches: [
      { name:'main',    type:'main',    commitId:'C2' },
      { name:'feature', type:'feature', commitId:'C2' },
    ],
    headOn: 'main',
  },
];

// ── Tag helpers ───────────────────────────────────────────────────────────────

const CHAR_W  = 7.5;
const PAD_X   = 16;
const TAG_H   = 22;
const TAG_GAP = 6;

function tagWidth(text: string) {
  return Math.max(text.length * CHAR_W + PAD_X, 42);
}

function tagColor(type: TagType) {
  if (type === 'main')    return { stroke:'#4db8ff', fill:'rgba(77,184,255,0.13)',  text:'#4db8ff' };
  if (type === 'feature') return { stroke:'#f0c040', fill:'rgba(240,192,64,0.13)', text:'#f0c040' };
  return                         { stroke:'#00e5a0', fill:'rgba(0,229,160,0.13)',  text:'#00e5a0' };
}

function buildTags(commitId: string, frame: Frame): TagData[] {
  const here = frame.branches.filter(b => b.commitId === commitId);
  if (!here.length) return [];
  const result: TagData[] = [];
  for (const b of here) {
    result.push({ text: b.name, type: b.type });
    if (b.name === frame.headOn) result.push({ text: 'HEAD', type: 'head' });
  }
  return result;
}

// ── Edge geometry ─────────────────────────────────────────────────────────────

function edgePts(child: Node, parent: Node) {
  const dx = parent.cx - child.cx;
  const dy = parent.cy - child.cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  return {
    x1: child.cx  + nx * (R + 4),
    y1: child.cy  + ny * (R + 4),
    x2: parent.cx - nx * (R + 9),
    y2: parent.cy - ny * (R + 9),
  };
}

// ── SVG sub-components ────────────────────────────────────────────────────────

function CommitNode({ node, isHead }: { node: Node; isHead: boolean }) {
  return (
    <g>
      <circle
        cx={node.cx} cy={node.cy} r={R}
        fill="#0b1219"
        stroke={isHead ? '#00e5a0' : '#253545'}
        strokeWidth={isHead ? 2.5 : 1.5}
      />
      {/* Only the hash — single line, comfortably centered */}
      <text
        x={node.cx} y={node.cy + 4}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={11}
        fontWeight="600"
        fill={isHead ? '#00e5a0' : '#4a6878'}
      >
        {node.hash}
      </text>
    </g>
  );
}

function TagGroup({ node, tags }: { node: Node; tags: TagData[] }) {
  if (!tags.length) return null;

  const widths = tags.map(t => tagWidth(t.text));
  const total  = widths.reduce((a, b) => a + b, 0) + TAG_GAP * (tags.length - 1);

  // Feature lane → tags above the circle; everything else → below
  const above = node.lane === 'feature';
  const tagY  = above
    ? node.cy - R - 10 - TAG_H
    : node.cy + R + 10;

  let x = node.cx - total / 2;

  return (
    <g>
      {tags.map((tag, i) => {
        const w = widths[i];
        const c = tagColor(tag.type);
        const rx = x;
        x += w + TAG_GAP;
        return (
          <g key={tag.text + i}>
            <rect x={rx} y={tagY} width={w} height={TAG_H} rx={5}
              fill={c.fill} stroke={c.stroke} strokeOpacity={0.5} strokeWidth={1} />
            <text
              x={rx + w / 2} y={tagY + TAG_H - 6}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize={10}
              fill={c.text}
            >
              {tag.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BranchVisualizer() {
  const [step, setStep] = useState(0);
  const frame = FRAMES[step];

  const nodeMap: Record<string, Node> = {};
  for (const n of frame.nodes) nodeMap[n.id] = n;

  const headCommitId = frame.branches.find(b => b.name === frame.headOn)?.commitId ?? '';
  const headColor    = frame.headOn === 'main' ? '#4db8ff' : '#f0c040';

  return (
    <div className={s.wrap}>

      {/* ── Terminal bar ── */}
      <div className={s.bar}>
        {frame.command ? (
          <><span className={s.prompt}>$ </span><span className={s.cmd}>{frame.command}</span></>
        ) : (
          <span className={s.init}>// начальное состояние</span>
        )}
      </div>

      {/* ── HEAD indicator — HTML strip, never overlaps SVG nodes ── */}
      <div className={s.headStrip}>
        <span className={s.headLabel}>HEAD</span>
        <span className={s.headArrow}>→</span>
        <span className={s.headBranch} style={{ color: headColor }}>{frame.headOn}</span>
      </div>

      {/* ── SVG graph ── */}
      <div className={s.graphWrap}>
        <svg viewBox="0 0 560 270" className={s.svg} aria-label="git branch visualization">
          <defs>
            <marker id="bv-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#253545" />
            </marker>
          </defs>

          {/* Edges first (rendered under circles) */}
          {frame.edges.map(([childId, parentId]) => {
            const child  = nodeMap[childId];
            const parent = nodeMap[parentId];
            if (!child || !parent) return null;
            const pts = edgePts(child, parent);
            return (
              <line key={`${childId}-${parentId}`}
                x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}
                stroke="#253545" strokeWidth={2} markerEnd="url(#bv-arr)"
              />
            );
          })}

          {/* Commit circles */}
          {frame.nodes.map(node => (
            <CommitNode key={node.id} node={node} isHead={node.id === headCommitId} />
          ))}

          {/* Branch / HEAD tags */}
          {frame.nodes.map(node => (
            <TagGroup key={`tg-${node.id}`} node={node} tags={buildTags(node.id, frame)} />
          ))}
        </svg>
      </div>

      {/* ── Description ── */}
      <div className={s.desc}>{frame.description}</div>

      {/* ── Navigation ── */}
      <div className={s.nav}>
        <button className={s.btn} onClick={() => setStep(p => p - 1)} disabled={step === 0}>
          ← назад
        </button>
        <div className={s.dots}>
          {FRAMES.map((_, i) => (
            <button
              key={i}
              className={`${s.dot} ${i === step ? s.dotActive : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Шаг ${i + 1}`}
            />
          ))}
        </div>
        <button className={s.btn} onClick={() => setStep(p => p + 1)} disabled={step === FRAMES.length - 1}>
          далее →
        </button>
      </div>

    </div>
  );
}
