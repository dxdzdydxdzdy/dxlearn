'use client';

import { useState, useCallback, useRef } from 'react';
import s from './SortingArticle.module.scss';

const INIT = [64, 34, 25, 12, 22, 11, 90, 45, 67, 38];

interface BarState { values: number[]; comparing: number[]; sorted: number[]; swaps: number; comps: number; }

function* bubbleSortGen(arr: number[]): Generator<BarState> {
  const a = [...arr]; let swaps = 0, comps = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      comps++;
      yield { values: [...a], comparing: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => a.length - 1 - k), swaps, comps };
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swaps++; }
    }
  }
  yield { values: [...a], comparing: [], sorted: a.map((_, i) => i), swaps, comps };
}

function* mergeSortGen(arr: number[]): Generator<BarState> {
  const a = [...arr]; let swaps = 0, comps = 0;
  function* merge(lo: number, mid: number, hi: number): Generator<BarState> {
    const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      comps++;
      yield { values: [...a], comparing: [lo + i, mid + 1 + j], sorted: [], swaps, comps };
      if (left[i] <= right[j]) { a[k++] = left[i++]; }
      else { a[k++] = right[j++]; swaps++; }
    }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
    yield { values: [...a], comparing: [], sorted: [], swaps, comps };
  }
  function* sort(lo: number, hi: number): Generator<BarState> {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* sort(lo, mid);
    yield* sort(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }
  yield* sort(0, a.length - 1);
  yield { values: [...a], comparing: [], sorted: a.map((_, i) => i), swaps, comps };
}

const MAX_VAL = Math.max(...INIT);

export function SortingDemo() {
  const [algo, setAlgo]       = useState<'bubble' | 'merge'>('bubble');
  const [state, setState]     = useState<BarState>({ values: INIT, comparing: [], sorted: [], swaps: 0, comps: 0 });
  const [playing, setPlaying] = useState(false);
  const [done, setDone]       = useState(false);
  const genRef                = useRef<Generator<BarState> | null>(null);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    genRef.current = null;
    setState({ values: INIT, comparing: [], sorted: [], swaps: 0, comps: 0 });
    setPlaying(false);
    setDone(false);
  }, []);

  const step = useCallback(() => {
    if (!genRef.current) {
      genRef.current = algo === 'bubble' ? bubbleSortGen(INIT) : mergeSortGen(INIT);
    }
    const result = genRef.current.next();
    if (!result.done && result.value) {
      setState(result.value);
    } else {
      setPlaying(false);
      setDone(true);
    }
  }, [algo]);

  const play = useCallback(() => {
    setPlaying(true);
    const tick = () => {
      if (!genRef.current) genRef.current = algo === 'bubble' ? bubbleSortGen(INIT) : mergeSortGen(INIT);
      const result = genRef.current.next();
      if (!result.done && result.value) {
        setState(result.value);
        timerRef.current = setTimeout(tick, 80);
      } else {
        setPlaying(false);
        setDone(true);
      }
    };
    tick();
  }, [algo]);

  const pause = () => { if (timerRef.current) clearTimeout(timerRef.current); setPlaying(false); };

  const switchAlgo = (a: 'bubble' | 'merge') => { setAlgo(a); reset(); };

  return (
    <div className={s.demo}>
      <div className={s.demoTabs}>
        {(['bubble', 'merge'] as const).map(a => (
          <button key={a} className={`${s.tab}${algo === a ? ` ${s.tabActive}` : ''}`}
            onClick={() => switchAlgo(a)} type="button">
            {a === 'bubble' ? 'Bubble Sort' : 'Merge Sort'}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div className={s.bars}>
        {state.values.map((v, i) => {
          const isComparing = state.comparing.includes(i);
          const isSorted    = state.sorted.includes(i);
          return (
            <div key={i} className={s.barWrap}>
              <div
                className={`${s.bar}${isComparing ? ` ${s.barCompare}` : ''}${isSorted ? ` ${s.barSorted}` : ''}`}
                style={{ height: `${(v / MAX_VAL) * 140}px` }}
              />
              <span className={s.barVal}>{v}</span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className={s.statsRow}>
        <span className={s.statItem}>сравнений: <strong>{state.comps}</strong></span>
        <span className={s.statItem}>перестановок: <strong>{state.swaps}</strong></span>
        {done && <span className={s.doneLabel}>✓ готово</span>}
      </div>

      {/* Controls */}
      <div className={s.controls}>
        {!playing
          ? <button className={s.btn} onClick={play} disabled={done} type="button">▶ Играть</button>
          : <button className={s.btn} onClick={pause} type="button">⏸ Пауза</button>
        }
        <button className={s.btn} onClick={step} disabled={playing || done} type="button">Шаг →</button>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={reset} type="button">Сброс</button>
      </div>
    </div>
  );
}
