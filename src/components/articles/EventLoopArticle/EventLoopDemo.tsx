'use client';

import { useState, useCallback } from 'react';
import { snippets, type ELSnippet, type ELStep } from './eventLoopEngine';
import s from './EventLoopArticle.module.scss';

export function EventLoopDemo() {
  const [activeSnippet, setActiveSnippet] = useState<ELSnippet>(snippets[0]);
  const [stepIndex, setStepIndex] = useState(0);

  const step = activeSnippet.steps[stepIndex] as ELStep;
  const totalSteps = activeSnippet.steps.length;

  const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => setStepIndex(0), []);

  function selectSnippet(snippet: ELSnippet) {
    setActiveSnippet(snippet);
    setStepIndex(0);
  }

  return (
    <div className={s.demo}>
      <div className={s.demoHeader}>
        <span className={s.demoTitle}>event-loop.js</span>
        <div className={s.controls}>
          <button className={s.btn} onClick={reset} disabled={stepIndex === 0}>reset</button>
          <button className={s.btn} onClick={prev} disabled={stepIndex === 0}>← prev</button>
          <button className={`${s.btn} ${s.primary}`} onClick={next} disabled={stepIndex === totalSteps - 1}>
            next →
          </button>
        </div>
      </div>

      <div className={s.snippetTabs}>
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            className={`${s.snippetTab} ${activeSnippet.id === snippet.id ? s.active : ''}`}
            onClick={() => selectSnippet(snippet)}
          >
            {snippet.label}
          </button>
        ))}
      </div>

      <div className={s.codePane}>
        {activeSnippet.code.map((line, i) => (
          <div
            key={i}
            className={`${s.codeLine} ${i === step.lineIndex ? s.highlighted : ''}`}
          >
            <span className={s.lineNum}>{i + 1}</span>
            <span className={s.lineText}>{line || ' '}</span>
          </div>
        ))}
      </div>

      <div className={s.queues}>
        <QueuePanel label="Call Stack" dotClass="callstack" items={step.callStack} itemClass="callstack" />
        <QueuePanel label="Microtask Queue" dotClass="micro" items={step.microQueue} itemClass="micro" />
        <QueuePanel label="Macrotask Queue" dotClass="macro" items={step.macroQueue} itemClass="macro" />
        <QueuePanel label="Console" dotClass="log" items={step.log} itemClass="log" />
      </div>

      <div className={s.status}>
        <span className={s.cursor} />
        <span>
          [{stepIndex + 1}/{totalSteps}] {step.description}
        </span>
      </div>
    </div>
  );
}

interface QueuePanelProps {
  label: string;
  dotClass: string;
  items: string[];
  itemClass: string;
}

function QueuePanel({ label, dotClass, items, itemClass }: QueuePanelProps) {
  return (
    <div className={s.queue}>
      <div className={s.queueLabel}>
        <span className={`${s.dot} ${s[dotClass]}`} />
        {label}
      </div>
      <div className={s.queueItems}>
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className={`${s.queueItem} ${s[itemClass]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
