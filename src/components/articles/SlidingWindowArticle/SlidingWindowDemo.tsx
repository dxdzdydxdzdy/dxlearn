'use client';

import { useState, useCallback } from 'react';
import s from './SlidingWindowArticle.module.scss';

const ARR = [2, 1, 5, 1, 3, 2, 6, 1, 4, 2];

interface Step { lo: number; hi: number; sum: number; maxSum: number; maxLo: number; }

function maxSumWindow(arr: number[], k: number): Step[] {
  const steps: Step[] = [];
  let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = sum, maxLo = 0;
  steps.push({ lo: 0, hi: k - 1, sum, maxSum, maxLo });
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];
    if (sum > maxSum) { maxSum = sum; maxLo = i - k + 1; }
    steps.push({ lo: i - k + 1, hi: i, sum, maxSum, maxLo });
  }
  return steps;
}

export function SlidingWindowDemo() {
  const [k, setK] = useState(3);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = maxSumWindow(ARR, k);
  const cur = steps[stepIdx];

  const setKAndReset = useCallback((newK: number) => {
    setK(newK);
    setStepIdx(0);
  }, []);

  return (
    <div className={s.demo}>
      <div className={s.demoLabel}>// максимальная сумма подмассива длиной k</div>

      <div className={s.arrayWrap}>
        {ARR.map((v, i) => {
          const inWindow  = i >= cur.lo && i <= cur.hi;
          const isBest    = i >= cur.maxLo && i <= cur.maxLo + k - 1;
          const isNewCell = i === cur.hi;
          let cls = s.cell;
          if (inWindow)  cls = `${s.cell} ${s.cellWindow}`;
          if (isNewCell) cls = `${s.cell} ${s.cellNew}`;
          return (
            <div key={i} className={cls}>
              <span className={s.cellVal}>{v}</span>
              <span className={s.cellIdx}>{i}</span>
              {isBest && stepIdx === steps.length - 1 && <span className={s.bestMark}>★</span>}
            </div>
          );
        })}
      </div>

      <div className={s.windowInfo}>
        <div className={s.infoItem}>
          <span className={s.infoLabel}>окно [{cur.lo}…{cur.hi}]</span>
          <span className={s.infoVal} style={{ color: '#f0db4f' }}>сумма = {cur.sum}</span>
        </div>
        <div className={s.infoItem}>
          <span className={s.infoLabel}>лучшее [{cur.maxLo}…{cur.maxLo + k - 1}]</span>
          <span className={s.infoVal} style={{ color: '#00e5a0' }}>max = {cur.maxSum}</span>
        </div>
      </div>

      <div className={s.controls}>
        <div className={s.targetWrap}>
          <span className={s.controlLabel}>k =</span>
          {[2, 3, 4, 5].map(kv => (
            <button key={kv} className={`${s.targetBtn}${k === kv ? ` ${s.targetBtnActive}` : ''}`}
              onClick={() => setKAndReset(kv)} type="button">{kv}</button>
          ))}
        </div>
        <button className={s.btn} onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0} type="button">← Назад</button>
        <button className={s.btn} onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx === steps.length - 1} type="button">Вперёд →</button>
        <span className={s.stepCount}>{stepIdx + 1} / {steps.length}</span>
      </div>
    </div>
  );
}
