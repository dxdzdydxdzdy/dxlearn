'use client';

import { useState, useCallback } from 'react';
import s from './BinarySearchArticle.module.scss';

const ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 105, 134, 167, 200];

interface Step {
  lo: number; hi: number; mid: number; found: boolean; msg: string;
}

function runBinarySearch(target: number): Step[] {
  const steps: Step[] = [];
  let lo = 0, hi = ARRAY.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const val = ARRAY[mid];
    if (val === target) {
      steps.push({ lo, hi, mid, found: true, msg: `arr[${mid}] = ${val} — найдено!` });
      return steps;
    }
    if (val < target) {
      steps.push({ lo, hi, mid, found: false, msg: `arr[${mid}] = ${val} < ${target} → ищем правее` });
      lo = mid + 1;
    } else {
      steps.push({ lo, hi, mid, found: false, msg: `arr[${mid}] = ${val} > ${target} → ищем левее` });
      hi = mid - 1;
    }
  }
  steps.push({ lo, hi: lo - 1, mid: -1, found: false, msg: `${target} не найден (${steps.length} шагов)` });
  return steps;
}

export function BinarySearchDemo() {
  const [target, setTarget]     = useState(72);
  const [stepIdx, setStepIdx]   = useState(-1);
  const [steps, setSteps]       = useState<Step[]>([]);
  const [started, setStarted]   = useState(false);

  const run = useCallback(() => {
    const s = runBinarySearch(target);
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
  }, [target]);

  const next = () => setStepIdx(i => Math.min(i + 1, steps.length - 1));
  const reset = () => { setStepIdx(-1); setStarted(false); setSteps([]); };

  const current = started && stepIdx >= 0 ? steps[stepIdx] : null;

  const getCellClass = (i: number) => {
    if (!current) return s.cell;
    if (current.mid === i)  return `${s.cell} ${s.cellMid}`;
    if (current.found && current.mid === i) return `${s.cell} ${s.cellFound}`;
    if (i < current.lo || i > current.hi) return `${s.cell} ${s.cellOut}`;
    return `${s.cell} ${s.cellActive}`;
  };

  return (
    <div className={s.demo}>
      {/* Array */}
      <div className={s.arrayWrap}>
        {ARRAY.map((v, i) => (
          <div key={i} className={getCellClass(i)}>
            <span className={s.cellVal}>{v}</span>
            <span className={s.cellIdx}>{i}</span>
            {current?.mid === i && <span className={s.midLabel}>mid</span>}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={s.controls}>
        <div className={s.targetWrap}>
          <span className={s.controlLabel}>Цель:</span>
          <select
            className={s.select}
            value={target}
            onChange={e => { setTarget(Number(e.target.value)); reset(); }}
          >
            {[...ARRAY, 50, 100, 999].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {!started ? (
          <button className={s.btn} onClick={run} type="button">Запустить</button>
        ) : (
          <>
            <button className={s.btn} onClick={next}
              disabled={stepIdx >= steps.length - 1} type="button">
              Следующий шаг →
            </button>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={reset} type="button">Сброс</button>
          </>
        )}
      </div>

      {/* Step log */}
      <div className={s.log}>
        <div className={s.logLabel}>// шаги поиска</div>
        {steps.slice(0, stepIdx + 1).map((st, i) => (
          <div key={i} className={`${s.logLine}${i === stepIdx ? ` ${s.logLineCurrent}` : ''}`}>
            <span className={s.logNum}>{i + 1}</span>
            <span>{st.msg}</span>
          </div>
        ))}
        {!started && (
          <div className={s.logEmpty}>Выбери значение и нажми «Запустить»</div>
        )}
      </div>

      {/* Stats */}
      {started && (
        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.statLabel}>шагов бинарный</span>
            <span className={s.statVal}>{steps.length}</span>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>шагов линейный</span>
            <span className={s.statVal}>{ARRAY.findIndex(v => v === target) + 1 || ARRAY.length}</span>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>размер массива</span>
            <span className={s.statVal}>{ARRAY.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
