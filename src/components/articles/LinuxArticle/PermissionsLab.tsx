'use client';

import { useState } from 'react';
import s from './PermissionsLab.module.scss';

type Bit = boolean;
type Triple = [Bit, Bit, Bit]; // r, w, x

interface PermState {
  owner: Triple;
  group: Triple;
  other: Triple;
}

const PRESETS: { label: string; desc: string; state: PermState }[] = [
  {
    label: '755',
    desc: 'Скрипт / директория',
    state: { owner: [true, true, true], group: [true, false, true], other: [true, false, true] },
  },
  {
    label: '644',
    desc: 'Веб-файл, конфиг',
    state: { owner: [true, true, false], group: [true, false, false], other: [true, false, false] },
  },
  {
    label: '600',
    desc: 'SSH ключ, секрет',
    state: { owner: [true, true, false], group: [false, false, false], other: [false, false, false] },
  },
  {
    label: '777',
    desc: '⚠ Всем всё (опасно)',
    state: { owner: [true, true, true], group: [true, true, true], other: [true, true, true] },
  },
  {
    label: '400',
    desc: 'Read-only для владельца',
    state: { owner: [true, false, false], group: [false, false, false], other: [false, false, false] },
  },
];

function tripleToNum(t: Triple): number {
  return (t[0] ? 4 : 0) + (t[1] ? 2 : 0) + (t[2] ? 1 : 0);
}

function tripleToStr(t: Triple): string {
  return (t[0] ? 'r' : '-') + (t[1] ? 'w' : '-') + (t[2] ? 'x' : '-');
}

function canDo(t: Triple): string[] {
  const out: string[] = [];
  if (t[0]) out.push('читать');
  if (t[1]) out.push('писать');
  if (t[2]) out.push('выполнять');
  return out.length ? out : ['ничего'];
}

const WHAT_MEANS: Record<string, string> = {
  r: 'read — читать содержимое файла / листинг директории',
  w: 'write — изменять файл / создавать файлы в директории',
  x: 'execute — запускать файл / входить (cd) в директорию',
};

export function PermissionsLab() {
  const [perm, setPerm] = useState<PermState>({
    owner: [true, true, true],
    group: [true, false, true],
    other: [true, false, true],
  });
  const [hovered, setHovered] = useState<string | null>(null);

  function toggle(who: keyof PermState, idx: 0 | 1 | 2) {
    setPerm(prev => {
      const t: Triple = [...prev[who]] as Triple;
      t[idx] = !t[idx];
      return { ...prev, [who]: t };
    });
  }

  function applyPreset(state: PermState) {
    setPerm(state);
  }

  const octal = `${tripleToNum(perm.owner)}${tripleToNum(perm.group)}${tripleToNum(perm.other)}`;
  const symbolic = `${tripleToStr(perm.owner)}${tripleToStr(perm.group)}${tripleToStr(perm.other)}`;

  const ROWS: { who: keyof PermState; label: string; color: string }[] = [
    { who: 'owner', label: 'владелец (u)', color: '#00e5a0' },
    { who: 'group', label: 'группа (g)', color: '#4e9eff' },
    { who: 'other', label: 'остальные (o)', color: '#b48eff' },
  ];

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.topLabel}>// permissions-lab</span>
        <div className={s.presets}>
          {PRESETS.map(p => (
            <button key={p.label} className={s.preset} onClick={() => applyPreset(p.state)} title={p.desc}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.left}>
          <div className={s.bitGrid}>
            <div className={s.bitHeaderRow}>
              <div />
              {(['r', 'w', 'x'] as const).map(b => (
                <div key={b} className={s.bitHeader}
                  onMouseEnter={() => setHovered(b)}
                  onMouseLeave={() => setHovered(null)}>
                  {b}
                </div>
              ))}
              <div className={s.bitHeader}>oct</div>
              <div className={s.bitHeader}>может</div>
            </div>

            {ROWS.map(({ who, label, color }) => (
              <div key={who} className={s.bitRow}>
                <div className={s.whoLabel} style={{ color }}>{label}</div>
                {([0, 1, 2] as const).map(idx => (
                  <button
                    key={idx}
                    className={`${s.bit} ${perm[who][idx] ? s.bitOn : ''}`}
                    style={{ '--bc': color } as React.CSSProperties}
                    onClick={() => toggle(who, idx)}
                  >
                    {perm[who][idx] ? 'rwx'[idx] : '─'}
                  </button>
                ))}
                <div className={s.octNum} style={{ color }}>{tripleToNum(perm[who])}</div>
                <div className={s.canDo}>{canDo(perm[who]).join(', ')}</div>
              </div>
            ))}
          </div>

          <div className={s.result}>
            <div className={s.resultRow}>
              <span className={s.resultLabel}>chmod</span>
              <span className={s.resultOctal}>{octal}</span>
              <span className={s.resultFile}>myfile</span>
            </div>
            <div className={s.resultRow}>
              <span className={s.resultLabel}>ls -la</span>
              <span className={s.resultSymbolic}>-{symbolic}</span>
            </div>
          </div>
        </div>

        <div className={s.right}>
          {hovered ? (
            <div className={s.explain}>
              <div className={s.explainBit}>{hovered}</div>
              <div className={s.explainText}>{WHAT_MEANS[hovered]}</div>
            </div>
          ) : (
            <div className={s.tips}>
              <div className={s.tipTitle}>Запомни паттерны:</div>
              {PRESETS.map(p => (
                <div key={p.label} className={s.tip}>
                  <span className={s.tipOct}>{p.label}</span>
                  <span className={s.tipDesc}>{p.desc}</span>
                </div>
              ))}
              <div className={s.tipNote}>
                SSH-ключи обязаны быть 600 — иначе ssh откажется работать.
              </div>
            </div>
          )}

          <div className={s.cheatSheet}>
            <div className={s.cheatTitle}>числа прав:</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>4</span> = r (read)</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>2</span> = w (write)</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>1</span> = x (execute)</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>7</span> = 4+2+1 = rwx</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>6</span> = 4+2 = rw-</div>
            <div className={s.cheatRow}><span className={s.cheatNum}>5</span> = 4+1 = r-x</div>
          </div>
        </div>
      </div>
    </div>
  );
}
