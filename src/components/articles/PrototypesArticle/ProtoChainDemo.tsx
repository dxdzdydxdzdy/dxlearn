'use client';

import { useState } from 'react';
import s from './ProtoChainDemo.module.scss';

interface ChainNode {
  label: string;
  props: string[];
}

const CHAIN: ChainNode[] = [
  { label: 'dog', props: ['name: "Rex"', 'breed: "Husky"'] },
  { label: 'Dog.prototype', props: ['speak()', 'constructor: Dog'] },
  { label: 'Animal.prototype', props: ['eat()', 'isAlive: true', 'constructor: Animal'] },
  { label: 'Object.prototype', props: ['toString()', 'hasOwnProperty()', 'valueOf()'] },
  { label: 'null', props: [] },
];

const PROP_LOCATION: Record<string, number> = {
  name: 0, breed: 0,
  speak: 1, constructor: 1,
  eat: 2, isAlive: 2,
  toString: 3, hasOwnProperty: 3, valueOf: 3,
};

type NodeStatus = 'idle' | 'searching' | 'found' | 'notfound' | 'passed';

export function ProtoChainDemo() {
  const [query, setQuery] = useState('speak');
  const [statuses, setStatuses] = useState<NodeStatus[]>(CHAIN.map(() => 'idle'));
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function handleLookup() {
    if (running) return;
    setRunning(true);
    setResult(null);
    const foundAt = PROP_LOCATION[query.trim()] ?? -1;
    const total = foundAt === -1 ? CHAIN.length - 1 : foundAt + 1;

    setStatuses(CHAIN.map(() => 'idle'));

    let step = 0;
    const tick = setInterval(() => {
      setStatuses(CHAIN.map((_, i) => {
        if (i < step) return 'passed';
        if (i === step) return 'searching';
        return 'idle';
      }));

      if (step === total - 1 || step === CHAIN.length - 2) {
        clearInterval(tick);
        const finalStatuses = CHAIN.map((_, i) => {
          if (foundAt === -1) return i < CHAIN.length - 1 ? 'notfound' : 'idle';
          if (i < foundAt) return 'passed';
          if (i === foundAt) return 'found';
          return 'idle';
        }) as NodeStatus[];
        setStatuses(finalStatuses);
        setResult(foundAt === -1
          ? `«${query}» не найдено в цепочке`
          : `Найдено на: ${CHAIN[foundAt].label}`
        );
        setRunning(false);
      }
      step++;
    }, 420);
  }

  function handleReset() {
    setStatuses(CHAIN.map(() => 'idle'));
    setResult(null);
    setRunning(false);
  }

  const PRESETS = ['name', 'speak', 'eat', 'toString', 'missing'];

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// proto-chain-lookup</span>
      </div>

      <div className={s.chain}>
        {CHAIN.map((node, i) => (
          <div key={node.label} className={s.nodeWrap}>
            <div className={`${s.node} ${s[statuses[i]]}`}>
              <div className={s.nodeLabel}>{node.label}</div>
              {node.props.length > 0 && (
                <div className={s.nodeProps}>
                  {node.props.map(p => <span key={p} className={s.nodeProp}>{p}</span>)}
                </div>
              )}
            </div>
            {i < CHAIN.length - 1 && (
              <div className={`${s.arrow} ${statuses[i] === 'passed' || statuses[i] === 'found' ? s.arrowLit : ''}`}>→</div>
            )}
          </div>
        ))}
      </div>

      <div className={s.controls}>
        <div className={s.inputRow}>
          <span className={s.inputLabel}>свойство:</span>
          <input
            className={s.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            disabled={running}
            placeholder="имя свойства"
          />
          <button className={s.btn} onClick={handleLookup} disabled={running}>lookup</button>
          <button className={s.btnSecondary} onClick={handleReset}>reset</button>
        </div>
        <div className={s.presets}>
          {PRESETS.map(p => (
            <button key={p} className={s.preset} onClick={() => { setQuery(p); handleReset(); }}>
              {p}
            </button>
          ))}
        </div>
        {result && (
          <div className={`${s.result} ${result.includes('не найдено') ? s.resultErr : s.resultOk}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
