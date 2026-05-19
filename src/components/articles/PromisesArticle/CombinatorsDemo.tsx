'use client';

import { useState, useRef, useCallback } from 'react';
import s from './CombinatorsDemo.module.scss';

type CombinatorTab = 'all' | 'race' | 'allSettled' | 'any';
type PromiseStatus = 'idle' | 'running' | 'fulfilled' | 'rejected';

interface PromiseConfig {
  delay: number;
  fails: boolean;
}

interface PromiseRunState {
  status: PromiseStatus;
  progress: number;
}

interface CombinatorResult {
  settled: boolean;
  resolved: boolean;
  value: unknown;
}

const TAB_LABELS: Record<CombinatorTab, string> = {
  all: 'Promise.all',
  race: 'Promise.race',
  allSettled: 'Promise.allSettled',
  any: 'Promise.any',
};

function getStatusIcon(status: PromiseStatus): string {
  switch (status) {
    case 'idle': return '○';
    case 'running': return '◌';
    case 'fulfilled': return '✓';
    case 'rejected': return '✗';
  }
}

function getStatusColor(status: PromiseStatus): string {
  switch (status) {
    case 'idle': return '#3d5562';
    case 'running': return '#00e5a0';
    case 'fulfilled': return '#00e5a0';
    case 'rejected': return '#ff5f6a';
  }
}

const INITIAL_CONFIGS: PromiseConfig[] = [
  { delay: 1000, fails: false },
  { delay: 2000, fails: false },
  { delay: 1500, fails: false },
];

const INITIAL_RUN_STATES: PromiseRunState[] = [
  { status: 'idle', progress: 0 },
  { status: 'idle', progress: 0 },
  { status: 'idle', progress: 0 },
];

export function CombinatorsDemo() {
  const [activeTab, setActiveTab] = useState<CombinatorTab>('all');
  const [configs, setConfigs] = useState<PromiseConfig[]>(INITIAL_CONFIGS);
  const [runStates, setRunStates] = useState<PromiseRunState[]>(INITIAL_RUN_STATES);
  const [combinatorResult, setCombinatorResult] = useState<CombinatorResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const checkCombinator = useCallback(
    (states: PromiseRunState[], tab: CombinatorTab): CombinatorResult | null => {
      const values = states.map((st, i) => ({ status: st.status, value: `P${i + 1}`, fails: configs[i].fails }));

      if (tab === 'race') {
        const first = values.find((v) => v.status === 'fulfilled' || v.status === 'rejected');
        if (first) {
          return {
            settled: true,
            resolved: first.status === 'fulfilled',
            value: first.status === 'fulfilled'
              ? `"${first.value} resolved"`
              : `"${first.value} rejected"`,
          };
        }
      }

      if (tab === 'any') {
        const firstFulfilled = values.find((v) => v.status === 'fulfilled');
        if (firstFulfilled) {
          return { settled: true, resolved: true, value: `"${firstFulfilled.value} resolved"` };
        }
        const allRejected = values.every((v) => v.status === 'rejected');
        if (allRejected) {
          return { settled: true, resolved: false, value: 'AggregateError: All promises were rejected' };
        }
      }

      if (tab === 'all') {
        const firstRejected = values.find((v) => v.status === 'rejected');
        if (firstRejected) {
          return { settled: true, resolved: false, value: `"${firstRejected.value} rejected"` };
        }
        const allFulfilled = values.every((v) => v.status === 'fulfilled');
        if (allFulfilled) {
          return { settled: true, resolved: true, value: `["P1 resolved", "P2 resolved", "P3 resolved"]` };
        }
      }

      if (tab === 'allSettled') {
        const allDone = values.every((v) => v.status === 'fulfilled' || v.status === 'rejected');
        if (allDone) {
          const arr = values.map((v) =>
            v.status === 'fulfilled'
              ? `{ status: "fulfilled", value: "${v.value} resolved" }`
              : `{ status: "rejected", reason: "${v.value} rejected" }`,
          );
          return { settled: true, resolved: true, value: `[\n  ${arr.join(',\n  ')}\n]` };
        }
      }

      return null;
    },
    [configs],
  );

  function handleRun() {
    if (isRunning) return;
    setIsRunning(true);
    setCombinatorResult(null);

    const newRunStates: PromiseRunState[] = configs.map(() => ({ status: 'running' as PromiseStatus, progress: 0 }));
    setRunStates([...newRunStates]);
    startTimeRef.current = Date.now();

    let localStates: PromiseRunState[] = newRunStates.map((s) => ({ ...s }));
    let stopped = false;

    intervalRef.current = setInterval(() => {
      if (stopped) return;
      const elapsed = Date.now() - startTimeRef.current;

      let changed = false;
      localStates = localStates.map((st, i) => {
        if (st.status !== 'running') return st;
        const progress = Math.min((elapsed / configs[i].delay) * 100, 100);
        if (progress >= 100) {
          changed = true;
          return {
            status: configs[i].fails ? 'rejected' : 'fulfilled',
            progress: 100,
          };
        }
        return { ...st, progress };
      });

      setRunStates([...localStates]);

      const result = checkCombinator(localStates, activeTab);
      if (result) {
        setCombinatorResult(result);
        // For race and any we can stop early. For all/allSettled continue until all settle.
        if (activeTab === 'race' || activeTab === 'any') {
          stopped = true;
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
      }

      const allSettled = localStates.every((st) => st.status === 'fulfilled' || st.status === 'rejected');
      if (allSettled) {
        stopped = true;
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setCombinatorResult(null);
    setRunStates(INITIAL_RUN_STATES.map(() => ({ status: 'idle', progress: 0 })));
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// combinators</span>
      </div>

      <div className={s.tabs}>
        {(Object.keys(TAB_LABELS) as CombinatorTab[]).map((tab) => (
          <button
            key={tab}
            className={`${s.tab} ${activeTab === tab ? s.active : ''}`}
            onClick={() => { handleReset(); setActiveTab(tab); }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className={s.body}>
        <div className={s.promisesGrid}>
          {configs.map((cfg, i) => {
            const rs = runStates[i];
            return (
              <div key={i} className={s.promiseRow}>
                <span className={s.promiseLabel}>P{i + 1}</span>

                <div className={s.sliderWrap}>
                  <input
                    className={s.slider}
                    type="range"
                    min={500}
                    max={3000}
                    step={100}
                    value={cfg.delay}
                    disabled={isRunning}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, delay: val } : c));
                    }}
                  />
                  <span className={s.sliderValue}>{(cfg.delay / 1000).toFixed(1)}s</span>
                </div>

                <label className={s.failCheckbox}>
                  <input
                    type="checkbox"
                    checked={cfg.fails}
                    disabled={isRunning}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, fails: val } : c));
                    }}
                  />
                  reject
                </label>

                <div className={s.progressWrap}>
                  <div className={s.progressBar}>
                    <div
                      className={`${s.progressFill} ${rs.status === 'rejected' ? s.failed : ''}`}
                      style={{ width: `${rs.progress}%` }}
                    />
                  </div>
                </div>

                <span className={s.promiseStatus} style={{ color: getStatusColor(rs.status) }}>
                  {getStatusIcon(rs.status)}
                </span>
              </div>
            );
          })}
        </div>

        <div className={s.controls}>
          <button className={`${s.btn} ${s.primary}`} onClick={handleRun} disabled={isRunning}>
            Run
          </button>
          <button className={s.btn} onClick={handleReset} disabled={isRunning}>
            Reset
          </button>
        </div>

        {combinatorResult && (
          <div className={`${s.resultBox} ${combinatorResult.resolved ? s.resolved : combinatorResult.settled && !combinatorResult.resolved ? s.rejected : s.settled}`}>
            <span className={s.resultLabel}>{TAB_LABELS[activeTab]} →</span>
            <div className={s.resultValue}>{String(combinatorResult.value)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
