'use client';

import { useState } from 'react';
import s from './TwoPointersArticle.module.scss';

const SORTED = [1, 3, 6, 8, 11, 15, 18, 22, 25, 30];

interface Step { lo: number; hi: number; sum: number; msg: string; found: boolean; }

function twoSum(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const sum = arr[lo] + arr[hi];
    if (sum === target) {
      steps.push({ lo, hi, sum, msg: `arr[${lo}](${arr[lo]}) + arr[${hi}](${arr[hi]}) = ${sum} ✓`, found: true });
      return steps;
    } else if (sum < target) {
      steps.push({ lo, hi, sum, msg: `${arr[lo]} + ${arr[hi]} = ${sum} < ${target} → lo++` , found: false });
      lo++;
    } else {
      steps.push({ lo, hi, sum, msg: `${arr[lo]} + ${arr[hi]} = ${sum} > ${target} → hi--`, found: false });
      hi--;
    }
  }
  steps.push({ lo, hi, sum: 0, msg: `Пара не найдена (${steps.length} шагов)`, found: false });
  return steps;
}

const TARGETS = [26, 33, 41, 53, 99];

export function TwoPointersDemo() {
  const [target, setTarget] = useState(26);
  const [stepIdx, setStepIdx] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [started, setStarted] = useState(false);

  const run = () => { const s = twoSum(SORTED, target); setSteps(s); setStepIdx(0); setStarted(true); };
  const next = () => setStepIdx(i => Math.min(i + 1, steps.length - 1));
  const reset = () => { setStepIdx(-1); setStarted(false); setSteps([]); };

  const cur = started && stepIdx >= 0 ? steps[stepIdx] : null;

  return (
    <div className={s.demo}>
      <div className={s.demoLabel}>// Two Sum на отсортированном массиве: target = {target}</div>

      <div className={s.arrayWrap}>
        {SORTED.map((v, i) => {
          let cls = s.cell;
          if (cur) {
            if (i === cur.lo) cls = `${s.cell} ${s.cellLo}`;
            else if (i === cur.hi) cls = `${s.cell} ${s.cellHi}`;
            else if (cur.found && (i === cur.lo || i === cur.hi)) cls = `${s.cell} ${s.cellFound}`;
            else if (i < cur.lo || i > cur.hi) cls = `${s.cell} ${s.cellOut}`;
          }
          return (
            <div key={i} className={cls}>
              <span className={s.cellVal}>{v}</span>
              {cur && i === cur.lo && <span className={s.ptrLabel} style={{ color: '#4db8ff' }}>lo</span>}
              {cur && i === cur.hi && <span className={s.ptrLabel} style={{ color: '#c96daa' }}>hi</span>}
            </div>
          );
        })}
      </div>

      <div className={s.controls}>
        <div className={s.targetWrap}>
          <span className={s.controlLabel}>target =</span>
          <div className={s.targetBtns}>
            {TARGETS.map(t => (
              <button key={t} className={`${s.targetBtn}${target === t ? ` ${s.targetBtnActive}` : ''}`}
                onClick={() => { setTarget(t); reset(); }} type="button">{t}</button>
            ))}
          </div>
        </div>
        {!started
          ? <button className={s.btn} onClick={run} type="button">Запустить</button>
          : <>
              <button className={s.btn} onClick={next} disabled={stepIdx >= steps.length - 1} type="button">Шаг →</button>
              <button className={`${s.btn} ${s.btnSecondary}`} onClick={reset} type="button">Сброс</button>
            </>
        }
      </div>

      <div className={s.log}>
        <div className={s.logLabel}>// шаги</div>
        {steps.slice(0, stepIdx + 1).map((st, i) => (
          <div key={i} className={`${s.logLine}${i === stepIdx ? ` ${s.logLineCurrent}` : ''}`}>
            <span className={s.logNum}>{i + 1}</span>
            <span style={st.found ? { color: '#00e5a0' } : undefined}>{st.msg}</span>
          </div>
        ))}
        {!started && <div className={s.logEmpty}>Выбери target и запусти</div>}
      </div>
    </div>
  );
}
