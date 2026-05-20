'use client';

import { useState } from 'react';
import s from './PolymorphismDemo.module.scss';

interface Shape {
  id: string;
  name: string;
  icon: string;
  color: string;
  params: { label: string; key: string; value: number }[];
  area: (p: Record<string, number>) => number;
  formula: string;
  speak(): string;
}

const SHAPES: Shape[] = [
  {
    id: 'circle', name: 'Circle', icon: '◯', color: '#00e5a0',
    params: [{ label: 'radius', key: 'r', value: 5 }],
    area: p => +(Math.PI * p.r * p.r).toFixed(2),
    formula: 'π × r²',
    speak: () => 'I am a circle',
  },
  {
    id: 'rect', name: 'Rectangle', icon: '▭', color: '#4e9eff',
    params: [
      { label: 'width', key: 'w', value: 8 },
      { label: 'height', key: 'h', value: 4 },
    ],
    area: p => p.w * p.h,
    formula: 'w × h',
    speak: () => 'I am a rectangle',
  },
  {
    id: 'triangle', name: 'Triangle', icon: '△', color: '#f0c040',
    params: [
      { label: 'base', key: 'b', value: 6 },
      { label: 'height', key: 'h', value: 4 },
    ],
    area: p => +(p.b * p.h / 2).toFixed(2),
    formula: '(b × h) / 2',
    speak: () => 'I am a triangle',
  },
];

export function PolymorphismDemo() {
  const [selectedId, setSelectedId] = useState('circle');
  const [params, setParams] = useState<Record<string, Record<string, number>>>({
    circle: { r: 5 },
    rect: { w: 8, h: 4 },
    triangle: { b: 6, h: 4 },
  });

  const shape = SHAPES.find(s => s.id === selectedId)!;
  const currentParams = params[selectedId];
  const area = shape.area(currentParams);

  function updateParam(key: string, val: number) {
    setParams(p => ({ ...p, [selectedId]: { ...p[selectedId], [key]: val } }));
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// polymorphism-demo</span>
        <div className={s.hint}>один метод area() — разная реализация</div>
      </div>

      <div className={s.body}>
        <div className={s.shapeList}>
          {SHAPES.map(sh => (
            <button key={sh.id}
              className={`${s.shapeBtn} ${selectedId === sh.id ? s.shapeBtnActive : ''}`}
              style={{ '--shape-color': sh.color } as React.CSSProperties}
              onClick={() => setSelectedId(sh.id)}>
              <span className={s.shapeIcon}>{sh.icon}</span>
              <span>{sh.name}</span>
            </button>
          ))}
        </div>

        <div className={s.detail} style={{ '--shape-color': shape.color } as React.CSSProperties}>
          <div className={s.paramsPanel}>
            <div className={s.panelLabel}>// параметры</div>
            {shape.params.map(p => (
              <div key={p.key} className={s.paramRow}>
                <label className={s.paramLabel}>{p.label}:</label>
                <input type="range" min={1} max={20} value={currentParams[p.key]}
                  className={s.paramRange}
                  onChange={e => updateParam(p.key, Number(e.target.value))} />
                <span className={s.paramVal}>{currentParams[p.key]}</span>
              </div>
            ))}
          </div>

          <div className={s.resultPanel}>
            <div className={s.resultArea}>
              <div className={s.resultLabel}>area()</div>
              <div className={s.resultValue} style={{ color: shape.color }}>{area}</div>
              <div className={s.resultFormula}>{shape.formula}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.code}>
        <div className={s.codeLabel}>// как это выглядит в коде</div>
        <pre className={s.codeBlock}>{`// Базовый класс — определяет интерфейс
abstract class Shape {
  abstract area(): number;  // каждый реализует сам
  describe() {
    return \`Area = \${this.area()}\`; // вызывает нужную реализацию
  }
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  area() { return Math.PI * this.r ** 2; }
}

class Rectangle extends Shape {
  constructor(private w: number, private h: number) { super(); }
  area() { return this.w * this.h; }
}

// Полиморфизм: один код работает с любой фигурой
const shapes: Shape[] = [new Circle(${currentParams.r ?? 5}), new Rectangle(${currentParams.w ?? 8}, ${currentParams.h ?? 4})];
shapes.forEach(s => console.log(s.describe()));
// Circle → Area = ${SHAPES[0].area(params.circle)}
// Rectangle → Area = ${SHAPES[1].area(params.rect)}`}
        </pre>
      </div>
    </div>
  );
}
