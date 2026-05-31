'use client';

import { useState } from 'react';
import s from './ResetDemo.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'initial' | 'soft' | 'mixed' | 'hard';

interface ZoneItem {
  name: string;
  label: string;
  variant: 'mine' | 'fromC2' | 'lost';
}

interface State {
  repo:    { msg: string; isHead: boolean }[];
  staging: ZoneItem[];
  working: ZoneItem[];
}

// ── States ────────────────────────────────────────────────────────────────────

const STATES: Record<Mode, State> = {
  initial: {
    repo: [
      { msg: 'feat: add auth (C2)', isHead: true  },
      { msg: 'fix: login bug (C1)',  isHead: false },
      { msg: 'initial commit (C0)', isHead: false },
    ],
    staging: [
      { name:'styles.css', label:'staged',        variant:'mine' },
    ],
    working: [
      { name:'file.js',   label:'изменён',        variant:'mine' },
    ],
  },
  soft: {
    repo: [
      { msg: 'fix: login bug (C1)',  isHead: true  },
      { msg: 'initial commit (C0)', isHead: false },
    ],
    staging: [
      { name:'auth.js',    label:'← из C2', variant:'fromC2' },
      { name:'styles.css', label:'staged',  variant:'mine'   },
    ],
    working: [
      { name:'file.js',   label:'изменён',  variant:'mine' },
    ],
  },
  mixed: {
    repo: [
      { msg: 'fix: login bug (C1)',  isHead: true  },
      { msg: 'initial commit (C0)', isHead: false },
    ],
    staging: [],
    working: [
      { name:'auth.js',   label:'← из C2',  variant:'fromC2' },
      { name:'file.js',   label:'изменён',  variant:'mine'   },
    ],
  },
  hard: {
    repo: [
      { msg: 'fix: login bug (C1)',  isHead: true  },
      { msg: 'initial commit (C0)', isHead: false },
    ],
    staging: [],
    working: [
      { name:'auth.js',   label:'потеряно', variant:'lost' },
      { name:'file.js',   label:'потеряно', variant:'lost' },
      { name:'styles.css',label:'потеряно', variant:'lost' },
    ],
  },
};

const DESCRIPTIONS: Record<Mode, string> = {
  initial:
    'Начальное состояние: HEAD на C2, в staging есть styles.css, в рабочей директории изменён file.js.',
  soft:
    '--soft: HEAD переместился на C1. Изменения из C2 (auth.js) переброшены в staging. ' +
    'Staging и рабочая директория не тронуты.',
  mixed:
    '--mixed (поведение по умолчанию): HEAD на C1. Staging очищен. ' +
    'Изменения из C2 оказались в рабочей директории как unstaged. Ничего не потеряно.',
  hard:
    '--hard: HEAD на C1. Staging очищен. Рабочая директория откатилась к состоянию C1. ' +
    'Все незакоммиченные изменения и изменения из C2 безвозвратно потеряны.',
};

const COMMANDS: Record<Mode, string> = {
  initial: '// исходное состояние',
  soft:    'git reset --soft HEAD~1',
  mixed:   'git reset HEAD~1  (или --mixed)',
  hard:    'git reset --hard HEAD~1',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function RepoZone({ commits }: { commits: State['repo'] }) {
  return (
    <div className={s.zone}>
      <div className={s.zoneHeader}>
        <span className={s.zoneIcon}>◈</span>
        <span className={s.zoneName}>РЕПОЗИТОРИЙ</span>
      </div>
      <div className={s.zoneBody}>
        {commits.map((c, i) => (
          <div key={i} className={`${s.commit} ${c.isHead ? s.commitHead : ''}`}>
            <div className={s.commitGraph}>
              <div className={`${s.commitDot} ${c.isHead ? s.commitDotHead : ''}`} />
              {i < commits.length - 1 && <div className={s.commitLine} />}
            </div>
            <div className={s.commitMsg}>{c.msg}</div>
            {c.isHead && <span className={s.headBadge}>HEAD</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FileZone({ title, icon, items, empty }: {
  title: string;
  icon: string;
  items: ZoneItem[];
  empty: string;
}) {
  return (
    <div className={s.zone}>
      <div className={s.zoneHeader}>
        <span className={s.zoneIcon}>{icon}</span>
        <span className={s.zoneName}>{title}</span>
      </div>
      <div className={s.zoneBody}>
        {items.length === 0
          ? <div className={s.emptyZone}>{empty}</div>
          : items.map(item => (
            <div key={item.name} className={`${s.fileItem} ${s['file_' + item.variant]}`}>
              <span className={s.fileName}>{item.name}</span>
              <span className={s.fileLabel}>{item.label}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResetDemo() {
  const [mode, setMode] = useState<Mode>('initial');
  const state = STATES[mode];

  return (
    <div className={s.wrap}>
      {/* ── Buttons ── */}
      <div className={s.controls}>
        {(['initial', 'soft', 'mixed', 'hard'] as Mode[]).map(m => (
          <button
            key={m}
            className={`${s.modeBtn} ${mode === m ? s.modeBtnActive : ''} ${m === 'hard' ? s.modeBtnDanger : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'initial' ? 'начало' : `--${m}`}
          </button>
        ))}
      </div>

      {/* ── Terminal line ── */}
      <div className={s.termLine}>
        <span className={s.termPrompt}>$ </span>
        <span className={s.termCmd}>{COMMANDS[mode]}</span>
      </div>

      {/* ── Three zones ── */}
      <div className={s.zones} key={mode}>
        <RepoZone commits={state.repo} />
        <FileZone
          title="STAGING AREA"
          icon="⊕"
          items={state.staging}
          empty="пусто"
        />
        <FileZone
          title="РАБОЧАЯ ДИРЕКТОРИЯ"
          icon="◻"
          items={state.working}
          empty={mode === 'hard' ? '⚠ откат к C1' : 'пусто'}
        />
      </div>

      {/* ── Description ── */}
      <div className={s.desc}>{DESCRIPTIONS[mode]}</div>

      {/* ── Legend ── */}
      <div className={s.legend}>
        <span className={`${s.legendItem} ${s.legendMine}`}>мои изменения</span>
        <span className={`${s.legendItem} ${s.legendFromC2}`}>из C2 (отменяемый коммит)</span>
        <span className={`${s.legendItem} ${s.legendLost}`}>потеряно</span>
      </div>
    </div>
  );
}
