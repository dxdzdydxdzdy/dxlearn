'use client';

import { useState, useMemo } from 'react';
import s from './NeuronPlayground.module.scss';

// ── Slider ────────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}

function Slider({ label, value, onChange, color }: SliderProps) {
  const pct = ((value + 2) / 4) * 100;
  return (
    <div className={s.sliderRow}>
      <span className={s.sliderLabel} style={{ color }}>{label}</span>
      <div className={s.sliderTrack}>
        <div
          className={s.sliderFill}
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min={-2}
          max={2}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={s.sliderInput}
        />
      </div>
      <span className={s.sliderValue}>{value >= 0 ? '+' : ''}{value.toFixed(1)}</span>
    </div>
  );
}

// ── SVG Neuron ────────────────────────────────────────────────────────────────

interface NeuronSVGProps {
  x1: number; x2: number; x3: number;
  w1: number; w2: number; w3: number;
  bias: number; z: number; a: number;
}

function NeuronSVG({ x1, x2, x3, w1, w2, w3, bias, z, a }: NeuronSVGProps) {
  const inputs = [
    { x: x1, w: w1, label: 'x₁', y: 50 },
    { x: x2, w: w2, label: 'x₂', y: 120 },
    { x: x3, w: w3, label: 'x₃', y: 190 },
  ];

  function wColor(w: number) {
    if (w > 0.3) return '#00e5a0';
    if (w < -0.3) return '#ff5f6a';
    return '#7a9aaa';
  }

  function wWidth(w: number) {
    return Math.max(1, Math.abs(w) * 2.5);
  }

  const neuronX = 210;
  const neuronY = 120;
  const outputActive = a > 0;

  return (
    <svg viewBox="0 0 380 240" className={s.neuronSvg} aria-hidden="true">
      {/* ── Input circles ─────────────────────────────── */}
      {inputs.map((inp, i) => (
        <g key={i}>
          {/* Connection line */}
          <line
            x1={60} y1={inp.y}
            x2={neuronX - 24} y2={neuronY}
            stroke={wColor(inp.w)}
            strokeWidth={wWidth(inp.w)}
            strokeOpacity={0.7}
          />
          {/* Weight label on line */}
          <text
            x={(60 + neuronX - 24) / 2}
            y={(inp.y + neuronY) / 2 - 6}
            textAnchor="middle"
            className={s.svgWLabel}
            fill={wColor(inp.w)}
          >
            ×{inp.w >= 0 ? '+' : ''}{inp.w.toFixed(1)}
          </text>
          {/* Input circle */}
          <circle cx={44} cy={inp.y} r={20} className={s.svgInputCircle} />
          <text x={44} y={inp.y - 5} textAnchor="middle" className={s.svgInputLabel}>
            {inp.label}
          </text>
          <text x={44} y={inp.y + 9} textAnchor="middle" className={s.svgInputValue}>
            {inp.x >= 0 ? '+' : ''}{inp.x.toFixed(1)}
          </text>
        </g>
      ))}

      {/* ── Bias ─────────────────────────────────────── */}
      <line
        x1={neuronX} y1={neuronY - 38}
        x2={neuronX} y2={neuronY - 24}
        stroke="#ff9070"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text x={neuronX} y={neuronY - 44} textAnchor="middle" className={s.svgBiasLabel}>
        b={bias >= 0 ? '+' : ''}{bias.toFixed(1)}
      </text>

      {/* ── Neuron (Σ) ───────────────────────────────── */}
      <circle cx={neuronX} cy={neuronY} r={24} className={s.svgNeuron} />
      <text x={neuronX} y={neuronY - 4} textAnchor="middle" className={s.svgNeuronLabel}>Σ</text>
      <text x={neuronX} y={neuronY + 11} textAnchor="middle" className={s.svgNeuronValue}>
        {z.toFixed(2)}
      </text>

      {/* ── ReLU box ─────────────────────────────────── */}
      <line
        x1={neuronX + 24} y1={neuronY}
        x2={280} y2={neuronY}
        stroke={outputActive ? '#00e5a0' : '#3d5562'}
        strokeWidth={2}
      />
      <rect x={280} y={neuronY - 18} width={56} height={36}
        rx={3} className={s.svgReluBox}
        stroke={outputActive ? '#00e5a0' : '#3d5562'}
      />
      <text x={308} y={neuronY - 4} textAnchor="middle" className={s.svgReluLabel}>ReLU</text>
      <text x={308} y={neuronY + 10} textAnchor="middle"
        className={s.svgReluValue}
        fill={outputActive ? '#00e5a0' : '#ff5f6a'}
      >
        {a.toFixed(2)}
      </text>

      {/* ── Output arrow ─────────────────────────────── */}
      <line
        x1={336} y1={neuronY}
        x2={360} y2={neuronY}
        stroke={outputActive ? '#00e5a0' : '#3d5562'}
        strokeWidth={2}
      />
      <polygon
        points={`${362},${neuronY - 5} ${372},${neuronY} ${362},${neuronY + 5}`}
        fill={outputActive ? '#00e5a0' : '#3d5562'}
      />
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function NeuronPlayground() {
  const [x1, setX1] = useState(1.0);
  const [x2, setX2] = useState(0.5);
  const [x3, setX3] = useState(-0.8);
  const [w1, setW1] = useState(0.7);
  const [w2, setW2] = useState(1.2);
  const [w3, setW3] = useState(-0.5);
  const [bias, setBias] = useState(0.3);

  const z = useMemo(
    () => x1 * w1 + x2 * w2 + x3 * w3 + bias,
    [x1, x2, x3, w1, w2, w3, bias]
  );
  const a = Math.max(0, z);
  const activated = a > 0;

  const terms = [
    { label: 'x₁·w₁', val: x1 * w1, color: '#4db8ff' },
    { label: 'x₂·w₂', val: x2 * w2, color: '#4db8ff' },
    { label: 'x₃·w₃', val: x3 * w3, color: '#4db8ff' },
    { label: 'bias',   val: bias,    color: '#ff9070' },
  ];

  return (
    <div className={s.playground}>
      <div className={s.header}>
        <span className={s.headerTitle}>Нейрон в действии</span>
        <span className={s.headerSub}>Двигай ползунки — смотри как меняется выход</span>
      </div>

      <div className={s.body}>
        {/* Left: controls */}
        <div className={s.controls}>
          <div className={s.controlGroup}>
            <div className={s.groupTitle}>Входы (inputs x)</div>
            <div className={s.groupDesc}>Данные которые подаём на нейрон</div>
            <Slider label="x₁" value={x1} onChange={setX1} color="#4db8ff" />
            <Slider label="x₂" value={x2} onChange={setX2} color="#4db8ff" />
            <Slider label="x₃" value={x3} onChange={setX3} color="#4db8ff" />
          </div>

          <div className={s.controlGroup}>
            <div className={s.groupTitle}>Веса (weights w)</div>
            <div className={s.groupDesc}>Важность каждого входа — учатся при обучении</div>
            <Slider label="w₁" value={w1} onChange={setW1} color="#f0c040" />
            <Slider label="w₂" value={w2} onChange={setW2} color="#f0c040" />
            <Slider label="w₃" value={w3} onChange={setW3} color="#f0c040" />
          </div>

          <div className={s.controlGroup}>
            <div className={s.groupTitle}>Смещение (bias b)</div>
            <div className={s.groupDesc}>Сдвигает порог активации нейрона</div>
            <Slider label="bias" value={bias} onChange={setBias} color="#ff9070" />
          </div>
        </div>

        {/* Right: visualization */}
        <div className={s.viz}>
          <NeuronSVG
            x1={x1} x2={x2} x3={x3}
            w1={w1} w2={w2} w3={w3}
            bias={bias} z={z} a={a}
          />

          {/* Calc breakdown */}
          <div className={s.calcBox}>
            <div className={s.calcTitle}>Вычисление</div>
            <div className={s.calcFormula}>
              <span className={s.calcVar}>z</span>
              <span className={s.calcOp}> = </span>
              {terms.map((t, i) => (
                <span key={t.label}>
                  <span className={s.calcTerm} style={{ color: t.color }}>
                    {t.val >= 0 && i > 0 ? '+' : ''}{t.val.toFixed(2)}
                  </span>
                  {i < terms.length - 1 && <span className={s.calcOp}> + </span>}
                </span>
              ))}
              <span className={s.calcOp}> = </span>
              <span
                className={s.calcResult}
                style={{ color: z < 0 ? '#ff5f6a' : '#f0c040' }}
              >
                {z.toFixed(3)}
              </span>
            </div>

            <div className={s.calcReluRow}>
              <span className={s.calcReluLabel}>ReLU(z) = max(0, {z.toFixed(2)}) =</span>
              <span
                className={s.calcReluResult}
                style={{ color: activated ? '#00e5a0' : '#ff5f6a' }}
              >
                {a.toFixed(3)}
              </span>
            </div>

            <div
              className={s.statusBadge}
              style={{
                background: activated ? 'rgba(0,229,160,0.08)' : 'rgba(255,95,106,0.08)',
                borderColor: activated ? 'rgba(0,229,160,0.3)' : 'rgba(255,95,106,0.3)',
                color: activated ? '#00e5a0' : '#ff5f6a',
              }}
            >
              {activated
                ? `✓ Нейрон активирован — сигнал ${a.toFixed(3)} проходит дальше`
                : `✗ Нейрон молчит — ReLU обнулил отрицательный z`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
