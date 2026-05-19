'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import s from './RenderPipelineDemo.module.scss';

const STEPS = [
  {
    num: '1',
    title: 'HTML → DOM',
    input: 'raw HTML',
    output: 'DOM Tree',
    desc: '<strong>Парсинг HTML.</strong> Браузер читает HTML байт за байтом, строит токены и формирует DOM-дерево — объектную модель документа.',
  },
  {
    num: '2',
    title: 'CSS → CSSOM',
    input: 'raw CSS',
    output: 'CSSOM',
    desc: '<strong>Парсинг CSS.</strong> Параллельно с HTML парсится CSS. На выходе — CSSOM (CSS Object Model), дерево с информацией о стилях каждого элемента.',
  },
  {
    num: '3',
    title: 'Style Calc',
    input: 'DOM + CSSOM',
    output: 'Render Tree',
    desc: '<strong>Вычисление стилей.</strong> DOM и CSSOM объединяются. Браузер применяет каскад и специфичность, вычисляет итоговые стили. Invisible-элементы (display: none) исключаются.',
  },
  {
    num: '4',
    title: 'Layout',
    input: 'Render Tree',
    output: 'Box positions',
    desc: '<strong>Раскладка.</strong> Браузер вычисляет точные позиции и размеры каждого элемента на экране. Чем сложнее CSS — тем дороже этот этап.',
  },
  {
    num: '5',
    title: 'Paint',
    input: 'Layout',
    output: 'Draw calls',
    desc: '<strong>Отрисовка.</strong> Генерируются команды рисования: заливки, текст, тени, границы. Ещё не пиксели — это список инструкций для GPU.',
  },
  {
    num: '6',
    title: 'Composite',
    input: 'Layers',
    output: 'Screen pixels',
    desc: '<strong>Композитинг.</strong> Слои объединяются GPU в финальную картинку на экране. <code>transform</code> и <code>opacity</code> работают только здесь — поэтому анимации на них не вызывают Layout/Paint.',
  },
];

const SPEEDS = [
  { label: '1×', ms: 2000 },
  { label: '2×', ms: 1000 },
  { label: '0.5×', ms: 4000 },
];

export function RenderPipelineDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speed = SPEEDS[speedIdx];

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % STEPS.length);
  }, []);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(advance, speed.ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, active, advance, speed.ms]);

  function togglePlay() {
    setPlaying((p) => !p);
  }

  function cycleSpeed() {
    setSpeedIdx((i) => (i + 1) % SPEEDS.length);
  }

  function jumpTo(i: number) {
    setActive(i);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <div className={s.demo}>
      <div className={s.demoHeader}>
        <span className={s.demoTitle}>render-pipeline</span>
        <div className={s.controls}>
          <button className={s.speed} onClick={cycleSpeed}>{speed.label}</button>
          <button
            className={`${s.playBtn} ${playing ? s.playing : ''}`}
            onClick={togglePlay}
          >
            {playing ? '⏸ pause' : '▶ play'}
          </button>
        </div>
      </div>

      <div className={s.flow}>
        {STEPS.map((step, i) => (
          <div key={step.num} className={s.stepWrapper}>
            <button
              className={`${s.step} ${i === active ? s.active : ''}`}
              onClick={() => jumpTo(i)}
            >
              <div className={s.stepNum}>{step.num}</div>
              <div className={s.stepTitle}>{step.title}</div>
              <div className={s.stepIo}>
                <div className={`${s.stepIoLine} ${i === active ? s.active : ''}`}>
                  <span className={s.ioKey}>in</span>
                  <span className={s.ioVal}>{step.input}</span>
                </div>
                <div className={`${s.stepIoLine} ${i === active ? s.active : ''}`}>
                  <span className={s.ioKey}>out</span>
                  <span className={s.ioVal}>{step.output}</span>
                </div>
              </div>
            </button>

            {i < STEPS.length - 1 && (
              <div className={`${s.arrow} ${(i === active || i + 1 === active) ? s.lit : ''}`}>
                →
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={s.progressBar}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={s.descPanel}>
        <span className={s.descNum}>{STEPS[active].num}/{STEPS.length}</span>
        <p
          className={s.descText}
          dangerouslySetInnerHTML={{ __html: STEPS[active].desc }}
        />
      </div>
    </div>
  );
}
