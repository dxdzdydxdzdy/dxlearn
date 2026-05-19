'use client';

import { useState } from 'react';
import s from './FlexboxPlayground.module.scss';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';

interface Config {
  flexDirection: FlexDirection;
  flexWrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
  itemCount: number;
}

const DEFAULT: Config = {
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  gap: 8,
  itemCount: 5,
};

function Select<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={s.control}>
      <label className={s.controlLabel}>{label}</label>
      <select className={s.controlSelect} value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function FlexboxPlayground() {
  const [cfg, setCfg] = useState<Config>(DEFAULT);
  const update = <K extends keyof Config>(key: K, val: Config[K]) => setCfg(c => ({ ...c, [key]: val }));

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: cfg.flexDirection,
    flexWrap: cfg.flexWrap,
    justifyContent: cfg.justifyContent,
    alignItems: cfg.alignItems,
    alignContent: cfg.alignContent,
    gap: cfg.gap,
  };

  const cssCode = [
    'display: flex;',
    `flex-direction: ${cfg.flexDirection};`,
    `flex-wrap: ${cfg.flexWrap};`,
    `justify-content: ${cfg.justifyContent};`,
    `align-items: ${cfg.alignItems};`,
    cfg.flexWrap !== 'nowrap' ? `align-content: ${cfg.alignContent};` : null,
    `gap: ${cfg.gap}px;`,
  ].filter(Boolean).join('\n');

  return (
    <div className={s.playground}>
      <div className={s.header}>
        <span className={s.title}>// flexbox-playground</span>
        <button className={s.resetBtn} onClick={() => setCfg(DEFAULT)}>reset</button>
      </div>

      <div className={s.main}>
        <div className={s.controls}>
          <Select label="flex-direction" value={cfg.flexDirection}
            options={['row', 'row-reverse', 'column', 'column-reverse']}
            onChange={v => update('flexDirection', v)} />
          <Select label="flex-wrap" value={cfg.flexWrap}
            options={['nowrap', 'wrap', 'wrap-reverse']}
            onChange={v => update('flexWrap', v)} />
          <Select label="justify-content" value={cfg.justifyContent}
            options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']}
            onChange={v => update('justifyContent', v)} />
          <Select label="align-items" value={cfg.alignItems}
            options={['flex-start', 'flex-end', 'center', 'stretch', 'baseline']}
            onChange={v => update('alignItems', v)} />
          {cfg.flexWrap !== 'nowrap' && (
            <Select label="align-content" value={cfg.alignContent}
              options={['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']}
              onChange={v => update('alignContent', v)} />
          )}
          <div className={s.control}>
            <label className={s.controlLabel}>gap: {cfg.gap}px</label>
            <input type="range" min={0} max={32} value={cfg.gap}
              className={s.controlRange}
              onChange={e => update('gap', Number(e.target.value))} />
          </div>
          <div className={s.control}>
            <label className={s.controlLabel}>items: {cfg.itemCount}</label>
            <input type="range" min={1} max={12} value={cfg.itemCount}
              className={s.controlRange}
              onChange={e => update('itemCount', Number(e.target.value))} />
          </div>
        </div>

        <div className={s.preview}>
          <div className={s.previewContainer} style={containerStyle}>
            {Array.from({ length: cfg.itemCount }, (_, i) => (
              <div key={i} className={s.item} style={{
                minHeight: cfg.alignItems === 'baseline' ? (i % 2 === 0 ? 40 : 64) : undefined,
              }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.codePanel}>
        <span className={s.codePanelLabel}>// generated CSS</span>
        <pre className={s.codeOutput}>{cssCode}</pre>
      </div>
    </div>
  );
}
