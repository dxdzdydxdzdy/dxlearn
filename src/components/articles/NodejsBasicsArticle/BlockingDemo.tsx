'use client';

import { useState, useRef, useCallback } from 'react';
import s from './BlockingDemo.module.scss';

type ReqState = 'waiting' | 'active' | 'done';

interface Req {
  id: number;
  label: string;
  ioMs: number;
  state: ReqState;
  progress: number;
  startAt: number;
  doneAt: number;
}

const REQUESTS: Pick<Req, 'id' | 'label' | 'ioMs'>[] = [
  { id: 1, label: 'GET /users        (БД 200ms)', ioMs: 2000 },
  { id: 2, label: 'GET /posts        (БД 150ms)', ioMs: 1500 },
  { id: 3, label: 'GET /comments     (БД 300ms)', ioMs: 3000 },
  { id: 4, label: 'GET /profile      (БД 100ms)', ioMs: 1000 },
];

function makeReqs(): Req[] {
  return REQUESTS.map(r => ({ ...r, state: 'waiting', progress: 0, startAt: 0, doneAt: 0 }));
}

const TICK = 50; // ms per animation frame

export function BlockingDemo() {
  const [blockingReqs, setBlockingReqs] = useState<Req[]>(makeReqs());
  const [nonblockingReqs, setNonblockingReqs] = useState<Req[]>(makeReqs());
  const [running, setRunning] = useState(false);
  const [blockingTotal, setBlockingTotal] = useState<number | null>(null);
  const [nonblockingTotal, setNonblockingTotal] = useState<number | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
  }, []);

  function reset() {
    clearTimers();
    setBlockingReqs(makeReqs());
    setNonblockingReqs(makeReqs());
    setRunning(false);
    setBlockingTotal(null);
    setNonblockingTotal(null);
  }

  function simulate() {
    reset();
    setRunning(true);

    // ── Blocking: sequential, one at a time ──────────────────────────────────
    let blockingOffset = 0;
    for (let i = 0; i < REQUESTS.length; i++) {
      const req = REQUESTS[i];
      const startAt = blockingOffset;
      const doneAt = startAt + req.ioMs;
      blockingOffset = doneAt;

      // Animate active + progress
      scheduleTimeout(() => {
        setBlockingReqs(prev => prev.map(r =>
          r.id === req.id ? { ...r, state: 'active', startAt, progress: 0 } : r
        ));
        // Progress ticks
        let elapsed = 0;
        const tick = () => {
          elapsed += TICK;
          const pct = Math.min(100, (elapsed / req.ioMs) * 100);
          setBlockingReqs(prev => prev.map(r =>
            r.id === req.id ? { ...r, progress: pct } : r
          ));
          if (elapsed < req.ioMs) scheduleTimeout(tick, TICK);
        };
        scheduleTimeout(tick, TICK);
      }, startAt);

      // Mark done
      scheduleTimeout(() => {
        setBlockingReqs(prev => prev.map(r =>
          r.id === req.id ? { ...r, state: 'done', progress: 100, doneAt } : r
        ));
      }, doneAt);
    }

    // Total blocking time
    scheduleTimeout(() => {
      setBlockingTotal(blockingOffset);
    }, blockingOffset);

    // ── Non-blocking: all start at t=0, finish when I/O done ─────────────────
    for (const req of REQUESTS) {
      // All start immediately
      setNonblockingReqs(prev => prev.map(r =>
        r.id === req.id ? { ...r, state: 'active', startAt: 0, progress: 0 } : r
      ));

      // Progress ticks
      let elapsed = 0;
      const tick = () => {
        elapsed += TICK;
        const pct = Math.min(100, (elapsed / req.ioMs) * 100);
        setNonblockingReqs(prev => prev.map(r =>
          r.id === req.id ? { ...r, progress: pct } : r
        ));
        if (elapsed < req.ioMs) scheduleTimeout(tick, TICK);
      };
      scheduleTimeout(tick, TICK);

      // Done when I/O finishes
      scheduleTimeout(() => {
        setNonblockingReqs(prev => prev.map(r =>
          r.id === req.id ? { ...r, state: 'done', progress: 100, doneAt: req.ioMs } : r
        ));
      }, req.ioMs);
    }

    const nonblockingTotal = Math.max(...REQUESTS.map(r => r.ioMs));
    scheduleTimeout(() => {
      setNonblockingTotal(nonblockingTotal);
      setRunning(false);
    }, nonblockingTotal);
  }

  function dotColor(state: ReqState) {
    if (state === 'done') return '#00e5a0';
    if (state === 'active') return '#f0c040';
    return '#3d5562';
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// blocking-vs-nonblocking</span>
        <div className={s.controls}>
          <button className={`${s.btn} ${s.primary}`} onClick={simulate} disabled={running}>
            simulate
          </button>
          <button className={s.btn} onClick={reset} disabled={running}>reset</button>
        </div>
      </div>

      <div className={s.body}>
        {/* Blocking lane */}
        <div className={s.lane}>
          <div className={s.laneTitle}>BLOCKING (Apache / sync)</div>
          <div className={s.requests}>
            {blockingReqs.map(req => (
              <div key={req.id} className={`${s.request} ${s[req.state]}`}>
                <div className={s.requestDot} style={{ background: dotColor(req.state) }} />
                <div className={s.requestLabel}>{req.label}</div>
                {req.state === 'done' && <div className={s.requestTime}>{req.doneAt / 10}ms</div>}
                {req.state === 'active' && (
                  <div className={s.progressBar} style={{ width: `${req.progress}%` }} />
                )}
              </div>
            ))}
          </div>
          <div className={`${s.totalTime} ${blockingTotal ? s.slow : ''}`}>
            {blockingTotal ? `итого: ${blockingTotal / 10}ms` : 'итого: —'}
          </div>
        </div>

        {/* Non-blocking lane */}
        <div className={s.lane}>
          <div className={s.laneTitle}>NON-BLOCKING (Node.js)</div>
          <div className={s.requests}>
            {nonblockingReqs.map(req => (
              <div key={req.id} className={`${s.request} ${s[req.state]}`}>
                <div className={s.requestDot} style={{ background: dotColor(req.state) }} />
                <div className={s.requestLabel}>{req.label}</div>
                {req.state === 'done' && <div className={s.requestTime}>{req.ioMs / 10}ms</div>}
                {req.state === 'active' && (
                  <div className={s.progressBar} style={{ width: `${req.progress}%` }} />
                )}
              </div>
            ))}
          </div>
          <div className={`${s.totalTime} ${nonblockingTotal ? s.fast : ''}`}>
            {nonblockingTotal ? `итого: ${nonblockingTotal / 10}ms` : 'итого: —'}
          </div>
        </div>
      </div>

      <div className={s.note}>
        // время намеренно увеличено ×10 для наглядности — реальные задержки БД составляют десятки миллисекунд
      </div>
    </div>
  );
}
