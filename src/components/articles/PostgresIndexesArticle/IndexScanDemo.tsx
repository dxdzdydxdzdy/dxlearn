'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import s from './IndexScanDemo.module.scss';

// ── Static data ───────────────────────────────────────────────────────────────

const USERS = [
  { id: 1, name: 'Alice',  dept_id: 1,    salary: 120000 },
  { id: 2, name: 'Bob',    dept_id: 2,    salary: 90000  },
  { id: 3, name: 'Carol',  dept_id: 1,    salary: 150000 },
  { id: 4, name: 'Dave',   dept_id: 3,    salary: 80000  },
  { id: 5, name: 'Eve',    dept_id: 2,    salary: 110000 },
  { id: 6, name: 'Frank',  dept_id: 1,    salary: 95000  },
  { id: 7, name: 'Grace',  dept_id: 3,    salary: 130000 },
  { id: 8, name: 'Henry',  dept_id: null, salary: 70000  },
];

// Sorted salary index entries: [salary, rowId]
const SALARY_INDEX: [number, number][] = [
  [70000, 8], [80000, 4], [90000, 2], [95000, 6],
  [110000, 5], [120000, 1], [130000, 7], [150000, 3],
];

// ── Preset queries ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    label: 'salary > 100000',
    matches: (s: number) => s > 100000,
    threshold: 100000,
    op: '>',
  },
  {
    label: 'salary >= 120000',
    matches: (s: number) => s >= 120000,
    threshold: 120000,
    op: '>=',
  },
  {
    label: 'salary = 95000',
    matches: (s: number) => s === 95000,
    threshold: 95000,
    op: '=',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function IndexScanDemo() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [mode, setMode]     = useState<'seq' | 'idx'>('seq');
  const [step, setStep]     = useState(-1);   // -1 = not started
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preset = PRESETS[presetIdx];

  // Build seq steps: each row in insertion order
  const seqSteps = USERS.map(u => ({ id: u.id, matches: preset.matches(u.salary) }));

  // Build index steps: B-tree traversal — only entries that could match (from threshold)
  // For '>', '>=' we scan from first matching value; for '=' just the matching value
  const idxSteps = SALARY_INDEX
    .filter(([sal]) =>
      preset.op === '='  ? sal === preset.threshold :
      preset.op === '>=' ? sal >= preset.threshold  :
                           sal >  preset.threshold
    )
    .map(([sal, rowId]) => ({ sal, id: rowId, matches: true }));

  const totalSteps = mode === 'seq' ? seqSteps.length : idxSteps.length;

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    clear();
    setStep(-1);
    setPlaying(false);
  }, [clear]);

  const advance = useCallback(() => {
    setStep(prev => {
      const next = prev + 1;
      if (next >= totalSteps) {
        setPlaying(false);
        return totalSteps - 1;
      }
      return next;
    });
  }, [totalSteps]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      setStep(prev => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setPlaying(false);
          return totalSteps - 1;
        }
        return next;
      });
    }, 380);
    return clear;
  }, [playing, step, totalSteps, clear]);

  // Reset when preset/mode changes
  useEffect(() => { reset(); }, [presetIdx, mode, reset]);

  const handlePlay = () => {
    if (step >= totalSteps - 1) {
      setStep(-1);
      setPlaying(true);
    } else {
      setPlaying(v => !v);
    }
  };

  // Which row IDs have been examined so far (0..step)
  const examinedIds = new Set<number>();
  const matchedIds  = new Set<number>();
  if (step >= 0) {
    if (mode === 'seq') {
      for (let i = 0; i <= step; i++) {
        examinedIds.add(seqSteps[i].id);
        if (seqSteps[i].matches) matchedIds.add(seqSteps[i].id);
      }
    } else {
      for (let i = 0; i <= step; i++) {
        examinedIds.add(idxSteps[i].id);
        matchedIds.add(idxSteps[i].id);
      }
    }
  }

  // Current active row being checked
  const activeId = step >= 0
    ? mode === 'seq' ? seqSteps[step].id : idxSteps[step]?.id
    : null;

  // Index bar: which entries are "reached" in index scan
  const idxReached = new Set<number>();
  if (mode === 'idx' && step >= 0) {
    for (let i = 0; i <= step; i++) idxReached.add(idxSteps[i].sal);
  }

  const matchesTotal = mode === 'seq'
    ? seqSteps.filter(r => r.matches).length
    : idxSteps.length;

  const isDone = step === totalSteps - 1;
  const notStarted = step === -1;

  return (
    <div className={s.demo}>
      {/* ── Controls ── */}
      <div className={s.controls}>
        <div className={s.presetGroup}>
          <span className={s.presetLabel}>WHERE</span>
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              className={`${s.preset} ${presetIdx === i ? s.presetActive : ''}`}
              onClick={() => setPresetIdx(i)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={s.modeTabs}>
          <button
            className={`${s.modeTab} ${mode === 'seq' ? s.modeTabActive : ''}`}
            onClick={() => setMode('seq')}
          >
            Seq Scan
          </button>
          <button
            className={`${s.modeTab} ${mode === 'idx' ? s.modeTabActive : ''}`}
            onClick={() => setMode('idx')}
          >
            Index Scan
          </button>
        </div>
      </div>

      {/* ── Index bar (only in index mode) ── */}
      {mode === 'idx' && (
        <div className={s.indexBar}>
          <div className={s.indexBarLabel}>// btree index on (salary)</div>
          <div className={s.indexNodes}>
            {SALARY_INDEX.map(([sal]) => {
              const isEntry = sal === SALARY_INDEX.find(
                ([s]) => preset.op === '=' ? s === preset.threshold
                        : preset.op === '>=' ? s >= preset.threshold
                        : s > preset.threshold
              )?.[0];
              const isReached = idxReached.has(sal);
              const isBefore = sal < preset.threshold || (preset.op === '>' && sal === preset.threshold);
              return (
                <div
                  key={sal}
                  className={`${s.indexNode}
                    ${isReached ? s.indexNodeReached : ''}
                    ${isEntry && step >= 0 ? s.indexNodeEntry : ''}
                    ${isBefore ? s.indexNodeBefore : ''}`}
                >
                  <span className={s.indexVal}>{(sal / 1000).toFixed(0)}K</span>
                  {isEntry && (
                    <span className={s.indexEntryArrow}>↓ вход</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>dept_id</th>
              <th>salary</th>
              <th className={s.statusCol}>
                {mode === 'seq' ? 'проверка' : 'index →'}
              </th>
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => {
              const isActive   = u.id === activeId;
              const isMatched  = matchedIds.has(u.id);
              const isExamined = examinedIds.has(u.id) && !isActive;
              const isSkipped  = mode === 'idx' && step >= 0 && !examinedIds.has(u.id);

              let rowCls = s.tr;
              if (isActive)   rowCls += ` ${s.trActive}`;
              else if (isMatched)  rowCls += ` ${s.trMatched}`;
              else if (isExamined) rowCls += ` ${s.trExamined}`;
              else if (isSkipped && mode === 'idx' && step >= 0) rowCls += ` ${s.trSkipped}`;

              let statusIcon: React.ReactNode = null;
              if (isActive) {
                statusIcon = <span className={s.iconCheck}>→</span>;
              } else if (isMatched) {
                statusIcon = <span className={s.iconOk}>✓</span>;
              } else if (isExamined) {
                statusIcon = <span className={s.iconNo}>✗</span>;
              }

              return (
                <tr key={u.id} className={rowCls}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.dept_id ?? <span className={s.nullVal}>NULL</span>}</td>
                  <td className={isMatched ? s.salaryMatch : ''}>{u.salary.toLocaleString()}</td>
                  <td className={s.statusCol}>{statusIcon}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Playback ── */}
      <div className={s.playbar}>
        <div className={s.playBtns}>
          <button
            className={`${s.playBtn} ${playing ? s.playBtnPause : ''}`}
            onClick={handlePlay}
          >
            {playing ? '⏸' : isDone ? '↺ заново' : notStarted ? '▶ запустить' : '▶ продолжить'}
          </button>
          {!notStarted && (
            <button className={s.resetBtn} onClick={reset}>↺</button>
          )}
        </div>

        <div className={s.stats}>
          {notStarted ? (
            <span className={s.statsHint}>нажми ▶ чтобы увидеть алгоритм</span>
          ) : (
            <>
              <span className={s.statItem}>
                проверено: <strong>{examinedIds.size}</strong> / {USERS.length}
              </span>
              <span className={s.statSep}>·</span>
              <span className={s.statItem}>
                найдено: <strong>{matchedIds.size}</strong> / {matchesTotal}
              </span>
              {isDone && mode === 'seq' && (
                <>
                  <span className={s.statSep}>·</span>
                  <span className={s.statBad}>каждая строка проверена</span>
                </>
              )}
              {isDone && mode === 'idx' && (
                <>
                  <span className={s.statSep}>·</span>
                  <span className={s.statGood}>только совпадения из индекса</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── EXPLAIN line ── */}
      {isDone && (
        <div className={s.explainLine}>
          <span className={s.explainKw}>
            {mode === 'seq' ? 'Seq Scan' : 'Index Scan'}
          </span>
          {' '}on users
          {mode === 'idx' && ' using idx_salary'}
          {'  '}
          <span className={s.explainRows}>
            (rows={matchesTotal}
            {mode === 'seq' ? `, scanned=8)` : `, scanned=${idxSteps.length})`}
          </span>
        </div>
      )}
    </div>
  );
}
