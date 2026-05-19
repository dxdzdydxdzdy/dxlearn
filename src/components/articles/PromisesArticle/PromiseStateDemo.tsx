'use client';

import { useState } from 'react';
import s from './PromiseStateDemo.module.scss';

type PromiseState = 'pending' | 'fulfilled' | 'rejected';

export function PromiseStateDemo() {
  const [state, setState] = useState<PromiseState>('pending');
  const [inputValue, setInputValue] = useState('');
  const [settledValue, setSettledValue] = useState<string | null>(null);

  const settled = state !== 'pending';

  function handleResolve() {
    setSettledValue(inputValue || 'undefined');
    setState('fulfilled');
  }

  function handleReject() {
    setSettledValue(inputValue || 'reason');
    setState('rejected');
  }

  function handleReset() {
    setState('pending');
    setSettledValue(null);
    setInputValue('');
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// promise-state</span>
      </div>

      <div className={s.body}>
        <div className={s.diagram}>
          {/* Pending node */}
          <div className={`${s.node} ${s.pending} ${state === 'pending' ? s.active : ''}`}>
            <div className={s.nodeHeader}>
              <div className={s.nodeDot} />
              <span className={s.nodeName}>pending</span>
            </div>
            <span className={s.nodeDesc}>ожидание</span>
          </div>

          {/* Arrows */}
          <div className={s.arrows}>
            <div className={s.arrow}>
              <div className={`${s.arrowRow} ${s.arrowResolve}`}>
                <div className={s.arrowLine} />
                <span className={s.arrowLabel}>resolve(value)</span>
              </div>
            </div>
            <div className={s.arrow}>
              <div className={`${s.arrowRow} ${s.arrowReject}`}>
                <div className={s.arrowLine} />
                <span className={s.arrowLabel}>reject(reason)</span>
              </div>
            </div>
          </div>

          {/* Right nodes */}
          <div className={s.rightNodes}>
            <div className={`${s.node} ${s.fulfilled} ${state === 'fulfilled' ? s.active : ''}`}>
              <div className={s.nodeHeader}>
                <div className={s.nodeDot} />
                <span className={s.nodeName}>fulfilled</span>
              </div>
              <span className={s.nodeDesc}>выполнен</span>
              {state === 'fulfilled' && settledValue !== null && (
                <div className={s.nodeValue}>{settledValue}</div>
              )}
            </div>

            <div className={`${s.node} ${s.rejected} ${state === 'rejected' ? s.active : ''}`}>
              <div className={s.nodeHeader}>
                <div className={s.nodeDot} />
                <span className={s.nodeName}>rejected</span>
              </div>
              <span className={s.nodeDesc}>отклонён</span>
              {state === 'rejected' && settledValue !== null && (
                <div className={s.nodeValue}>{settledValue}</div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={s.controls}>
          <input
            className={s.input}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='"success"'
            disabled={settled}
          />
          <button
            className={`${s.btn} ${s.resolve}`}
            onClick={handleResolve}
            disabled={settled}
          >
            resolve()
          </button>
          <button
            className={`${s.btn} ${s.reject}`}
            onClick={handleReject}
            disabled={settled}
          >
            reject()
          </button>
          {settled && (
            <button className={`${s.btn} ${s.reset}`} onClick={handleReset}>
              ↺ reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
