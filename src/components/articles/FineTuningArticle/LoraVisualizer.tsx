'use client';

import { useState } from 'react';
import s from './LoraVisualizer.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'full' | 'lora' | 'qlora';

interface ModeConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  trainable: number;   // % trainable parameters
  vram: number;        // GB VRAM for 7B model
  time: number;        // relative training time
  desc: string;
  pros: string[];
  cons: string[];
}

// ── Config ────────────────────────────────────────────────────────────────────

const MODES: Record<Mode, ModeConfig> = {
  full: {
    label: 'Full Fine-Tuning',
    color: '#ff5f6a',
    bg: 'rgba(255, 95, 106, 0.06)',
    border: 'rgba(255, 95, 106, 0.3)',
    trainable: 100,
    vram: 80,
    time: 100,
    desc: 'Все веса модели обучаются. Максимальное качество адаптации, но требует огромных ресурсов.',
    pros: ['Максимальное качество', 'Полная адаптация', 'Нет ограничений на изменения'],
    cons: ['~80 ГБ VRAM для 7B', 'Дорого — часы на A100', 'Catastrophic forgetting', 'Сложно хранить много версий'],
  },
  lora: {
    label: 'LoRA',
    color: '#f0c040',
    bg: 'rgba(240, 192, 64, 0.06)',
    border: 'rgba(240, 192, 64, 0.3)',
    trainable: 0.5,
    vram: 16,
    time: 30,
    desc: 'Замораживаем оригинальные веса, обучаем только маленькие матрицы-адаптеры A и B.',
    pros: ['~16 ГБ VRAM (7B)', '~0.5% обучаемых параметров', 'Адаптер: 10-100 МБ', 'Можно хранить много адаптеров'],
    cons: ['Чуть хуже full fine-tuning', 'Нужно подбирать rank', 'Только к выбранным слоям'],
  },
  qlora: {
    label: 'QLoRA',
    color: '#00e5a0',
    bg: 'rgba(0, 229, 160, 0.06)',
    border: 'rgba(0, 229, 160, 0.3)',
    trainable: 0.5,
    vram: 6,
    time: 40,
    desc: 'LoRA + квантизация базовой модели до 4-bit. 7B модель помещается на обычную GPU.',
    pros: ['~6 ГБ VRAM (7B)', 'Работает на RTX 3090/4090', 'Качество близко к LoRA', 'Доступно всем'],
    cons: ['Чуть медленнее LoRA (+20-30%)', 'Небольшая потеря точности', 'Нужна библиотека bitsandbytes'],
  },
};

// ── Matrix viz ────────────────────────────────────────────────────────────────

function MatrixViz({ mode }: { mode: Mode }) {
  if (mode === 'full') {
    return (
      <div className={s.matrixFull}>
        <div className={s.matrixLabel}>W (обучается)</div>
        <div className={s.matrixGrid}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className={s.matrixCell} style={{ background: '#ff5f6a', opacity: 0.3 + Math.random() * 0.5 }} />
          ))}
        </div>
        <div className={s.matrixNote}>Все 7 000 000 000 параметров — обучаемые</div>
      </div>
    );
  }

  return (
    <div className={s.matrixLora}>
      {/* Frozen W */}
      <div className={s.matrixBlock}>
        <div className={s.matrixLabel} style={{ color: '#888' }}>W (заморожен)</div>
        <div className={s.matrixGrid} style={{ opacity: 0.3 }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className={s.matrixCell} style={{ background: '#555' }} />
          ))}
        </div>
      </div>

      <div className={s.matrixPlus}>+</div>

      {/* A matrix */}
      <div className={s.matrixBlock}>
        <div className={s.matrixLabel} style={{ color: MODES[mode].color }}>A (обучается)</div>
        <div className={s.matrixThin}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className={s.matrixCell} style={{ background: MODES[mode].color, opacity: 0.4 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </div>

      <div className={s.matrixTimes}>×</div>

      {/* B matrix */}
      <div className={s.matrixBlock}>
        <div className={s.matrixLabel} style={{ color: MODES[mode].color }}>B (обучается)</div>
        <div className={s.matrixWide}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className={s.matrixCell} style={{ background: MODES[mode].color, opacity: 0.4 + (i % 4) * 0.15 }} />
          ))}
        </div>
      </div>

      <div className={s.matrixNote}>
        {mode === 'qlora' ? 'W в 4-bit (NF4) — в 4× меньше памяти' : 'ΔW = A×B, rank r << d'}
      </div>
    </div>
  );
}

// ── Bar ───────────────────────────────────────────────────────────────────────

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={s.barRow}>
      <div className={s.barLabel}>{label}</div>
      <div className={s.barTrack}>
        <div className={s.barFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className={s.barValue}>{value}</div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LoraVisualizer() {
  const [mode, setMode] = useState<Mode>('lora');
  const cfg = MODES[mode];

  return (
    <div className={s.widget}>
      <div className={s.header}>
        <span className={s.title}>LoRA Visualizer</span>
        <span className={s.subtitle}>сравни подходы к fine-tuning</span>
      </div>

      <div className={s.body}>

        {/* Left: mode selector */}
        <div className={s.left}>
          <div className={s.selectorLabel}>МЕТОД</div>
          <div className={s.modeList}>
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button
                key={m}
                className={`${s.modeBtn} ${mode === m ? s.modeBtnOn : ''}`}
                style={mode === m ? { borderColor: MODES[m].color } : {}}
                onClick={() => setMode(m)}
              >
                <span className={s.modeName} style={mode === m ? { color: MODES[m].color } : {}}>
                  {MODES[m].label}
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className={s.statsBlock}>
            <div className={s.selectorLabel}>ТРЕБОВАНИЯ (7B модель)</div>
            <Bar value={cfg.vram}         max={80}  color={cfg.color} label="VRAM, ГБ" />
            <Bar value={cfg.time}         max={100} color={cfg.color} label="Время, %" />
            <Bar value={cfg.trainable}    max={100} color={cfg.color} label="Обучаем., %" />
          </div>
        </div>

        {/* Right: visualization + details */}
        <div className={s.right}>
          <div className={s.desc} style={{ borderColor: cfg.border, background: cfg.bg }}>
            <span className={s.descLabel} style={{ color: cfg.color }}>{cfg.label}</span>
            <p className={s.descText}>{cfg.desc}</p>
          </div>

          <MatrixViz mode={mode} />

          <div className={s.proscons}>
            <div className={s.proconsBlock}>
              <div className={s.proconsTitle} style={{ color: '#00e5a0' }}>✅ Плюсы</div>
              {cfg.pros.map((p, i) => (
                <div key={i} className={s.proconsItem}>{p}</div>
              ))}
            </div>
            <div className={s.proconsBlock}>
              <div className={s.proconsTitle} style={{ color: '#ff5f6a' }}>⚠️ Минусы</div>
              {cfg.cons.map((c, i) => (
                <div key={i} className={s.proconsItem}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
