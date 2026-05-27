'use client';

import { useState, useRef } from 'react';
import s from './TrainingSimulator.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrainPoint {
  epoch: number;
  step: number;
  trainLoss: number;
  valLoss: number;
}

type Scenario = 'good' | 'overfit' | 'underfit';

// ── Pre-computed training curves ──────────────────────────────────────────────

function generateCurve(scenario: Scenario): TrainPoint[] {
  const points: TrainPoint[] = [];
  const totalEpochs = 20;

  for (let epoch = 1; epoch <= totalEpochs; epoch++) {
    let trainLoss: number;
    let valLoss: number;

    if (scenario === 'good') {
      // Train and val both converge nicely
      trainLoss = 2.5 * Math.exp(-epoch * 0.22) + 0.15;
      valLoss   = 2.5 * Math.exp(-epoch * 0.18) + 0.22;
    } else if (scenario === 'overfit') {
      // Train keeps dropping, val starts rising after epoch 8
      trainLoss = 2.5 * Math.exp(-epoch * 0.28) + 0.05;
      valLoss = epoch <= 8
        ? 2.5 * Math.exp(-epoch * 0.18) + 0.28
        : 0.4 + (epoch - 8) * 0.06;
    } else {
      // underfit — both stay high
      trainLoss = 1.8 * Math.exp(-epoch * 0.06) + 0.9;
      valLoss   = 1.8 * Math.exp(-epoch * 0.05) + 1.0;
    }

    // small noise
    const noise = (Math.sin(epoch * 3.7) * 0.03);
    points.push({
      epoch,
      step: epoch * 50,
      trainLoss: Math.max(0.05, trainLoss + noise),
      valLoss: Math.max(0.08, valLoss + noise * 0.5),
    });
  }

  return points;
}

const CURVES: Record<Scenario, TrainPoint[]> = {
  good:     generateCurve('good'),
  overfit:  generateCurve('overfit'),
  underfit: generateCurve('underfit'),
};

// ── SVG chart ─────────────────────────────────────────────────────────────────

const W = 400;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

function toSvgX(epoch: number, maxEpoch: number) {
  return PAD.left + ((epoch - 1) / (maxEpoch - 1)) * (W - PAD.left - PAD.right);
}

function toSvgY(loss: number, minLoss: number, maxLoss: number) {
  const t = (loss - minLoss) / (maxLoss - minLoss);
  return PAD.top + (1 - t) * (H - PAD.top - PAD.bottom);
}

function LossChart({ points, currentEpoch }: { points: TrainPoint[]; currentEpoch: number }) {
  const visible = points.slice(0, currentEpoch);
  if (visible.length === 0) return null;

  const allLoss = visible.flatMap(p => [p.trainLoss, p.valLoss]);
  const minLoss = Math.max(0, Math.min(...allLoss) - 0.1);
  const maxLoss = Math.max(...allLoss) + 0.2;
  const maxEpoch = points.length;

  const trainPath = visible
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.epoch, maxEpoch).toFixed(1)} ${toSvgY(p.trainLoss, minLoss, maxLoss).toFixed(1)}`)
    .join(' ');

  const valPath = visible
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.epoch, maxEpoch).toFixed(1)} ${toSvgY(p.valLoss, minLoss, maxLoss).toFixed(1)}`)
    .join(' ');

  // Y axis ticks
  const yTicks = [minLoss, (minLoss + maxLoss) / 2, maxLoss].map(v => ({
    value: v,
    y: toSvgY(v, minLoss, maxLoss),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg}>
      {/* Grid lines */}
      {yTicks.map(({ y }, i) => (
        <line key={i} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
          stroke="#ffffff0d" strokeWidth="1" />
      ))}

      {/* Y axis labels */}
      {yTicks.map(({ value, y }, i) => (
        <text key={i} x={PAD.left - 4} y={y + 4} textAnchor="end"
          fontSize="9" fill="#666">{value.toFixed(2)}</text>
      ))}

      {/* X axis labels */}
      {[1, 5, 10, 15, 20].map(ep => (
        <text key={ep} x={toSvgX(ep, maxEpoch)} y={H - PAD.bottom + 14}
          textAnchor="middle" fontSize="9" fill="#666">ep{ep}</text>
      ))}

      {/* Train loss line */}
      <path d={trainPath} fill="none" stroke="#f0c040" strokeWidth="2" />

      {/* Val loss line */}
      <path d={valPath} fill="none" stroke="#4db8ff" strokeWidth="2" strokeDasharray="4 2" />

      {/* Current point dots */}
      {visible.length > 0 && (() => {
        const last = visible[visible.length - 1];
        const cx = toSvgX(last.epoch, maxEpoch);
        const trainCy = toSvgY(last.trainLoss, minLoss, maxLoss);
        const valCy = toSvgY(last.valLoss, minLoss, maxLoss);
        return (
          <>
            <circle cx={cx} cy={trainCy} r="3.5" fill="#f0c040" />
            <circle cx={cx} cy={valCy} r="3.5" fill="#4db8ff" />
          </>
        );
      })()}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const SCENARIO_META: Record<Scenario, { label: string; color: string; diagnosis: string; fix: string }> = {
  good:     { label: 'Хорошее обучение',  color: '#00e5a0', diagnosis: 'Train loss и val loss падают вместе — модель учится обобщать, не запоминать. Идеально.', fix: 'Останови когда val_loss перестанет улучшаться — это оптимальная точка.' },
  overfit:  { label: 'Переобучение',      color: '#ff5f6a', diagnosis: 'Train loss падает, val loss начинает расти (~8 эпоха). Модель запомнила обучающие данные.', fix: 'Добавь dropout, больше данных или early stopping на ~8 эпохе.' },
  underfit: { label: 'Недообучение',      color: '#f0c040', diagnosis: 'Оба loss остаются высокими. Модель не может выучить паттерны.', fix: 'Увеличь capacity модели, обучай дольше, проверь learning rate.' },
};

export function TrainingSimulator() {
  const [scenario,     setScenario]     = useState<Scenario>('good');
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [running,      setRunning]      = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const points = CURVES[scenario];
  const meta   = SCENARIO_META[scenario];

  function start() {
    if (running) return;
    if (currentEpoch >= points.length) {
      setCurrentEpoch(0);
      return;
    }
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setCurrentEpoch(prev => {
        if (prev >= points.length) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 160);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setCurrentEpoch(0);
  }

  function changeScenario(s: Scenario) {
    reset();
    setScenario(s);
  }

  const current = points[Math.max(0, currentEpoch - 1)];

  return (
    <div className={s.widget}>
      <div className={s.header}>
        <span className={s.title}>Training Loop Simulator</span>
        <span className={s.subtitle}>наблюдай за train / val loss в реальном времени</span>
      </div>

      <div className={s.body}>

        {/* Left controls */}
        <div className={s.left}>
          <div className={s.blockLabel}>СЦЕНАРИЙ</div>
          <div className={s.scenarioList}>
            {(Object.keys(SCENARIO_META) as Scenario[]).map((sc) => (
              <button
                key={sc}
                className={`${s.scenarioBtn} ${scenario === sc ? s.scenarioBtnOn : ''}`}
                style={scenario === sc ? { borderColor: SCENARIO_META[sc].color } : {}}
                onClick={() => changeScenario(sc)}
                disabled={running}
              >
                <span className={s.scenarioName} style={scenario === sc ? { color: SCENARIO_META[sc].color } : {}}>
                  {SCENARIO_META[sc].label}
                </span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className={s.legend}>
            <div className={s.legendItem}>
              <div className={s.legendLine} style={{ background: '#f0c040' }} />
              <span>train loss</span>
            </div>
            <div className={s.legendItem}>
              <div className={s.legendLine} style={{ background: '#4db8ff', backgroundImage: 'repeating-linear-gradient(90deg, #4db8ff 0, #4db8ff 4px, transparent 4px, transparent 6px)' }} />
              <span>val loss</span>
            </div>
          </div>

          {/* Stats */}
          {current && (
            <div className={s.statsBlock}>
              <div className={s.blockLabel}>ЭПОХА {current.epoch} / {points.length}</div>
              <div className={s.statRow}>
                <span className={s.statLabel}>train loss</span>
                <span className={s.statValue} style={{ color: '#f0c040' }}>
                  {current.trainLoss.toFixed(3)}
                </span>
              </div>
              <div className={s.statRow}>
                <span className={s.statLabel}>val loss</span>
                <span className={s.statValue} style={{ color: '#4db8ff' }}>
                  {current.valLoss.toFixed(3)}
                </span>
              </div>
            </div>
          )}

          <div className={s.actions}>
            {currentEpoch < points.length && !running && (
              <button className={s.runBtn} onClick={start}>
                {currentEpoch === 0 ? '▶ Запустить' : '▶ Продолжить'}
              </button>
            )}
            {running && (
              <button className={s.runBtn} disabled>⏳ Обучение...</button>
            )}
            {currentEpoch > 0 && (
              <button className={s.resetBtn} onClick={reset}>↺ Сбросить</button>
            )}
          </div>
        </div>

        {/* Right: chart + diagnosis */}
        <div className={s.right}>
          <div className={s.chartWrap}>
            {currentEpoch === 0 ? (
              <div className={s.chartEmpty}>
                Нажми «Запустить» чтобы начать обучение
              </div>
            ) : (
              <LossChart points={points} currentEpoch={currentEpoch} />
            )}
          </div>

          {currentEpoch >= 5 && (
            <div className={s.diagnosis} style={{ borderColor: meta.color }}>
              <div className={s.diagnosisLabel} style={{ color: meta.color }}>
                ДИАГНОЗ: {meta.label}
              </div>
              <div className={s.diagnosisText}>{meta.diagnosis}</div>
              <div className={s.diagnosisFix}>
                <strong>Что делать:</strong> {meta.fix}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
