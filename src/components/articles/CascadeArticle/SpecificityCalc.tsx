'use client';

import { useState, useCallback } from 'react';
import s from './SpecificityCalc.module.scss';

interface SpecScore {
  ids: number;
  classes: number;
  tags: number;
}

function parseSelector(sel: string): SpecScore {
  let str = sel.trim();
  // remove pseudo-elements (::before etc) — they count as one tag
  const pseudoElements = (str.match(/::[a-z-]+/g) || []).length;
  str = str.replace(/::[a-z-]+/g, '');

  const ids = (str.match(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g) || []).length;
  str = str.replace(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g, '');

  // classes, attributes, pseudo-classes
  const classes =
    (str.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g) || []).length +
    (str.match(/\[[^\]]+\]/g) || []).length +
    (str.match(/:[a-zA-Z-]+(?:\([^)]*\))?/g) || []).length;
  str = str.replace(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g, '');
  str = str.replace(/\[[^\]]+\]/g, '');
  str = str.replace(/:[a-zA-Z-]+(?:\([^)]*\))?/g, '');

  // tags and pseudo-elements
  const tags =
    (str.match(/\b[a-zA-Z][a-zA-Z0-9]*/g) || []).filter(t => t !== '*').length +
    pseudoElements;

  return { ids, classes, tags };
}

function scoreToInt({ ids, classes, tags }: SpecScore): number {
  return ids * 10000 + classes * 100 + tags;
}

function scoreToString({ ids, classes, tags }: SpecScore): string {
  return `(${ids}, ${classes}, ${tags})`;
}

const EXAMPLES = [
  { sel: '#nav .link:hover', desc: 'id + class + pseudo-class' },
  { sel: 'div > p + span', desc: 'только теги' },
  { sel: '.card input[type="text"]', desc: 'class + attribute' },
  { sel: 'body header nav ul li a', desc: 'цепочка тегов' },
  { sel: '#app .sidebar .menu li a:first-child', desc: 'id + классы + тег' },
];

export function SpecificityCalc() {
  const [selA, setSelA] = useState('#nav .link:hover');
  const [selB, setSelB] = useState('div > p + span');

  const scoreA = parseSelector(selA);
  const scoreB = parseSelector(selB);
  const intA = scoreToInt(scoreA);
  const intB = scoreToInt(scoreB);

  const winner = intA > intB ? 'A' : intB > intA ? 'B' : 'tie';

  const applyExample = useCallback((sel: string, target: 'A' | 'B') => {
    if (target === 'A') setSelA(sel);
    else setSelB(sel);
  }, []);

  return (
    <div className={s.calc}>
      <div className={s.header}>
        <span className={s.title}>// specificity-calculator</span>
      </div>

      <div className={s.body}>
        <div className={s.selectorRow}>
          {(['A', 'B'] as const).map(label => {
            const sel = label === 'A' ? selA : selB;
            const score = label === 'A' ? scoreA : scoreB;
            const isWinner = winner === label;
            const isLoser = winner !== 'tie' && !isWinner;

            return (
              <div key={label} className={`${s.selectorCard} ${isWinner ? s.cardWinner : ''} ${isLoser ? s.cardLoser : ''}`}>
                <div className={s.cardLabel}>Селектор {label}</div>
                <input
                  className={s.selectorInput}
                  value={sel}
                  onChange={e => label === 'A' ? setSelA(e.target.value) : setSelB(e.target.value)}
                  spellCheck={false}
                  placeholder="css selector..."
                />
                <div className={s.scoreGrid}>
                  <div className={s.scoreCell}>
                    <div className={s.scoreCellLabel}>ID</div>
                    <div className={`${s.scoreCellValue} ${s.scoreId}`}>{score.ids}</div>
                  </div>
                  <div className={s.scoreCell}>
                    <div className={s.scoreCellLabel}>Class</div>
                    <div className={`${s.scoreCellValue} ${s.scoreClass}`}>{score.classes}</div>
                  </div>
                  <div className={s.scoreCell}>
                    <div className={s.scoreCellLabel}>Tag</div>
                    <div className={`${s.scoreCellValue} ${s.scoreTag}`}>{score.tags}</div>
                  </div>
                </div>
                <div className={s.scoreTuple}>{scoreToString(score)}</div>
              </div>
            );
          })}
        </div>

        <div className={s.result}>
          {winner === 'tie' ? (
            <span className={s.resultTie}>Равная специфичность — побеждает позиция в CSS</span>
          ) : (
            <span className={s.resultWin}>
              Селектор <strong>{winner}</strong> побеждает {scoreToString(winner === 'A' ? scoreA : scoreB)} &gt; {scoreToString(winner === 'A' ? scoreB : scoreA)}
            </span>
          )}
        </div>

        <div className={s.examples}>
          <div className={s.examplesLabel}>Примеры:</div>
          <div className={s.exampleList}>
            {EXAMPLES.map(ex => (
              <div key={ex.sel} className={s.exampleRow}>
                <code className={s.exampleSel}>{ex.sel}</code>
                <span className={s.exampleDesc}>{ex.desc}</span>
                <div className={s.exampleBtns}>
                  <button className={s.exBtn} onClick={() => applyExample(ex.sel, 'A')}>→ A</button>
                  <button className={s.exBtn} onClick={() => applyExample(ex.sel, 'B')}>→ B</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
