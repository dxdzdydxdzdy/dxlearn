'use client';

import { useState } from 'react';
import s from './RemoteVisualizer.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type TagKind = 'local' | 'tracking' | 'head';

interface Tag {
  name: string;
  kind: TagKind;
  commitId: string;
  isNew?: boolean;
}

interface Commit {
  id: string;
  hash: string;
  msg: string;
  isNew?: boolean;
}

interface Panel {
  commits: Commit[];
  tags: Tag[];
  head?: string; // branch name HEAD is on
}

type FlowDir = 'push' | 'fetch' | 'none';

interface Frame {
  command?: string;
  note?: string;      // small label above command (e.g. "// коллега сделал:")
  description: string;
  local: Panel | null;
  remote: Panel;
  flowDir: FlowDir;
}

// ── Frame data ────────────────────────────────────────────────────────────────

const FRAMES: Frame[] = [
  {
    description:
      'На GitHub уже есть репозиторий с одним коммитом. ' +
      'Локального репозитория ещё нет — нужно сделать git clone.',
    local: null,
    remote: {
      commits: [{ id:'C0', hash:'a1b2c3', msg:'initial commit' }],
      tags:    [{ name:'main', kind:'local', commitId:'C0' }],
      head:    'main',
    },
    flowDir: 'none',
  },
  {
    command: 'git clone https://github.com/user/repo.git',
    description:
      'Git скопировал все коммиты и ветки. Локальная ветка main создана ' +
      'и автоматически привязана к origin/main — это tracking branch. ' +
      'origin — имя remote по умолчанию.',
    local: {
      commits: [{ id:'C0', hash:'a1b2c3', msg:'initial commit', isNew:true }],
      tags: [
        { name:'main',        kind:'local',    commitId:'C0' },
        { name:'origin/main', kind:'tracking', commitId:'C0', isNew:true },
      ],
      head: 'main',
    },
    remote: {
      commits: [{ id:'C0', hash:'a1b2c3', msg:'initial commit' }],
      tags:    [{ name:'main', kind:'local', commitId:'C0' }],
      head:    'main',
    },
    flowDir: 'fetch',
  },
  {
    command: 'git commit -m "add feature"',
    description:
      'Новый коммит C1 появился локально. Локальная main сдвинулась, ' +
      'но origin/main остаётся на C0 — Git помнит что remote ещё не обновлён.',
    local: {
      commits: [
        { id:'C1', hash:'b2c3d4', msg:'add feature',    isNew:true },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [
        { name:'main',        kind:'local',    commitId:'C1' },
        { name:'origin/main', kind:'tracking', commitId:'C0' },
      ],
      head: 'main',
    },
    remote: {
      commits: [{ id:'C0', hash:'a1b2c3', msg:'initial commit' }],
      tags:    [{ name:'main', kind:'local', commitId:'C0' }],
      head:    'main',
    },
    flowDir: 'none',
  },
  {
    command: 'git push',
    description:
      'Коммит C1 отправлен на GitHub. ' +
      'origin/main обновилась до C1 — теперь локальная копия состояния remote синхронизирована.',
    local: {
      commits: [
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [
        { name:'main',        kind:'local',    commitId:'C1' },
        { name:'origin/main', kind:'tracking', commitId:'C1', isNew:true },
      ],
      head: 'main',
    },
    remote: {
      commits: [
        { id:'C1', hash:'b2c3d4', msg:'add feature',    isNew:true },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [{ name:'main', kind:'local', commitId:'C1' }],
      head: 'main',
    },
    flowDir: 'push',
  },
  {
    note: '// коллега сделал:',
    command: 'git push  (из другого клона)',
    description:
      'Коллега запушил коммит C2. У тебя локально об этом ничего не известно — ' +
      'origin/main всё ещё на C1. Нужно сделать git fetch.',
    local: {
      commits: [
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [
        { name:'main',        kind:'local',    commitId:'C1' },
        { name:'origin/main', kind:'tracking', commitId:'C1' },
      ],
      head: 'main',
    },
    remote: {
      commits: [
        { id:'C2', hash:'c3d4e5', msg:'fix: typo (коллега)', isNew:true },
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [{ name:'main', kind:'local', commitId:'C2' }],
      head: 'main',
    },
    flowDir: 'none',
  },
  {
    command: 'git fetch',
    description:
      'Fetch скачал C2 с GitHub, но локальную main не тронул. ' +
      'origin/main сдвинулась до C2 — Git теперь знает о новом коммите, ' +
      'но не применяет его автоматически. Ты сам решаешь когда и как вливать.',
    local: {
      commits: [
        { id:'C2', hash:'c3d4e5', msg:'fix: typo (коллега)', isNew:true },
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [
        { name:'main',        kind:'local',    commitId:'C1' },
        { name:'origin/main', kind:'tracking', commitId:'C2', isNew:true },
      ],
      head: 'main',
    },
    remote: {
      commits: [
        { id:'C2', hash:'c3d4e5', msg:'fix: typo (коллега)' },
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [{ name:'main', kind:'local', commitId:'C2' }],
      head: 'main',
    },
    flowDir: 'fetch',
  },
  {
    command: 'git merge origin/main',
    description:
      'Теперь применяем изменения: main переместилась до C2. ' +
      'git pull = git fetch + git merge origin/main за один шаг. ' +
      'Fetch → осмотрел, merge → применил.',
    local: {
      commits: [
        { id:'C2', hash:'c3d4e5', msg:'fix: typo (коллега)' },
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [
        { name:'main',        kind:'local',    commitId:'C2', isNew:true },
        { name:'origin/main', kind:'tracking', commitId:'C2' },
      ],
      head: 'main',
    },
    remote: {
      commits: [
        { id:'C2', hash:'c3d4e5', msg:'fix: typo (коллега)' },
        { id:'C1', hash:'b2c3d4', msg:'add feature' },
        { id:'C0', hash:'a1b2c3', msg:'initial commit' },
      ],
      tags: [{ name:'main', kind:'local', commitId:'C2' }],
      head: 'main',
    },
    flowDir: 'none',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function tagsForCommit(commitId: string, panel: Panel): Tag[] {
  return panel.tags.filter(t => t.commitId === commitId);
}

function headCommitId(panel: Panel): string | undefined {
  if (!panel.head) return undefined;
  return panel.tags.find(t => t.name === panel.head && t.kind === 'local')?.commitId;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CommitTag({ tag }: { tag: Tag }) {
  const cls = [s.tag, s[`tag_${tag.kind}`], tag.isNew ? s.tagNew : ''].filter(Boolean).join(' ');
  return <span className={cls}>{tag.name}</span>;
}

function CommitList({ panel }: { panel: Panel }) {
  const headId = headCommitId(panel);
  return (
    <div className={s.commitList}>
      {panel.commits.map((c, i) => {
        const tags  = tagsForCommit(c.id, panel);
        const isHead = c.id === headId;
        return (
          <div key={c.id} className={`${s.commitRow} ${c.isNew ? s.commitNew : ''}`}>
            <div className={s.graph}>
              <div className={`${s.dot} ${isHead ? s.dotHead : ''}`} />
              {i < panel.commits.length - 1 && <div className={s.vline} />}
            </div>
            <div className={s.commitInfo}>
              <div className={s.hashRow}>
                <span className={`${s.hash} ${isHead ? s.hashHead : ''}`}>{c.hash}</span>
                {tags.map(t => <CommitTag key={t.name} tag={t} />)}
              </div>
              <div className={s.msg}>{c.msg}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className={s.emptyPanel}>
      <span className={s.emptyText}>// репозиторий не клонирован</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RemoteVisualizer() {
  const [step, setStep] = useState(0);
  const frame = FRAMES[step];

  const arrowLabel =
    frame.flowDir === 'push'  ? '→ push'  :
    frame.flowDir === 'fetch' ? '← fetch' : '···';

  const arrowCls = [
    s.flowArrow,
    frame.flowDir === 'push'  ? s.flowPush  : '',
    frame.flowDir === 'fetch' ? s.flowFetch : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={s.wrap}>

      {/* ── Terminal bar ── */}
      <div className={s.bar}>
        {frame.command ? (
          <>
            {frame.note && <span className={s.note}>{frame.note}&nbsp;</span>}
            <span className={s.prompt}>$ </span>
            <span className={s.cmd}>{frame.command}</span>
          </>
        ) : (
          <span className={s.init}>// начальное состояние</span>
        )}
      </div>

      {/* ── Two-panel layout ── */}
      <div className={s.panels}>

        {/* LOCAL */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelIcon}>💻</span>
            <span className={s.panelTitle}>LOCAL</span>
          </div>
          <div className={s.panelBody}>
            {frame.local ? <CommitList panel={frame.local} /> : <EmptyPanel />}
          </div>
        </div>

        {/* Divider */}
        <div className={s.divider}>
          <span className={arrowCls}>{arrowLabel}</span>
        </div>

        {/* REMOTE */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelIcon}>☁</span>
            <span className={s.panelTitle}>GITHUB</span>
          </div>
          <div className={s.panelBody}>
            <CommitList panel={frame.remote} />
          </div>
        </div>

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
              className={`${s.dot2} ${i === step ? s.dot2Active : ''}`}
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
