'use client';

import { useState, useEffect, useRef } from 'react';
import s from './AgentPlayground.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type StepType = 'thought' | 'action' | 'observation' | 'answer';

interface Step {
  type: StepType;
  content: string;
  tool?: string;
  params?: Record<string, unknown>;
}

interface Preset {
  query: string;
  badge: string;
  usedTools: string[];
  steps: Step[];
}

// ── Presets with pre-defined ReAct traces ────────────────────────────────────

const PRESETS: Preset[] = [
  {
    query: 'Какая погода в Москве, стоит ли брать зонт?',
    badge: '1 tool call',
    usedTools: ['get_weather'],
    steps: [
      {
        type: 'thought',
        content:
          'Пользователь спрашивает о погоде в Москве и нужна ли рекомендация про зонт. Мне нужны актуальные метеоданные — вызову get_weather.',
      },
      {
        type: 'action',
        tool: 'get_weather',
        params: { city: 'Москва' },
        content: '',
      },
      {
        type: 'observation',
        content: '{ "temp_c": 8, "conditions": "дождь", "humidity_pct": 89, "wind_kmh": 12 }',
      },
      {
        type: 'thought',
        content:
          'Получил данные: +8°C, идёт дождь, влажность 89%. Рекомендация очевидна — зонт нужен. Могу формировать финальный ответ.',
      },
      {
        type: 'answer',
        content:
          'В Москве сейчас +8°C, идёт дождь (влажность 89%, ветер 12 км/ч). Зонт обязательно стоит взять — иначе промокнешь.',
      },
    ],
  },
  {
    query: 'Переведи $250 в рубли. Курс — 92.4',
    badge: '1 tool call',
    usedTools: ['calculate'],
    steps: [
      {
        type: 'thought',
        content:
          'Нужно вычислить 250 × 92.4. Лучше вызвать calculate чтобы получить точный результат без риска арифметической ошибки.',
      },
      {
        type: 'action',
        tool: 'calculate',
        params: { expression: '250 * 92.4' },
        content: '',
      },
      {
        type: 'observation',
        content: '23100',
      },
      {
        type: 'thought',
        content: 'Результат получен — 23 100. Могу ответить пользователю.',
      },
      {
        type: 'answer',
        content: '$250 по курсу 92.4 = 23 100 рублей.',
      },
    ],
  },
  {
    query: 'Какая столица Австралии и сколько там жителей?',
    badge: '2 tool calls — цепочка!',
    usedTools: ['search_web'],
    steps: [
      {
        type: 'thought',
        content:
          'Пользователь спрашивает столицу Австралии. Многие ошибочно считают что это Сидней — лучше уточню через поиск, не буду полагаться только на память.',
      },
      {
        type: 'action',
        tool: 'search_web',
        params: { query: 'столица Австралии' },
        content: '',
      },
      {
        type: 'observation',
        content:
          '"Столица Австралии — Канберра (Canberra). Основана в 1913 году как компромисс между Сиднеем и Мельбурном."',
      },
      {
        type: 'thought',
        content:
          'Итак, столица — Канберра, не Сидней. Теперь нужно население. Выполню второй поисковый запрос.',
      },
      {
        type: 'action',
        tool: 'search_web',
        params: { query: 'население Канберры 2024' },
        content: '',
      },
      {
        type: 'observation',
        content:
          '"Население Канберры (2024): около 467 000 человек. Это крупнейший внутриконтинентальный город Австралии."',
      },
      {
        type: 'thought',
        content:
          'Все данные собраны: столица — Канберра, население ~467 000. Сформирую ответ с интересным фактом про основание города.',
      },
      {
        type: 'answer',
        content:
          'Столица Австралии — Канберра (не Сидней, как часто думают!). Население — около 467 000 человек. Город был специально построен в 1913 году как нейтральный компромисс между Сиднеем и Мельбурном.',
      },
    ],
  },
];

// ── Tools registry ────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'search_web',  icon: '🔍', desc: 'Поиск в интернете' },
  { id: 'calculate',   icon: '🧮', desc: 'Математические вычисления' },
  { id: 'get_weather', icon: '☁️', desc: 'Актуальные метеоданные' },
  { id: 'get_time',    icon: '🕐', desc: 'Время в любом часовом поясе' },
];

// ── Step appearance config ────────────────────────────────────────────────────

const STEP_META: Record<StepType, { label: string; color: string; bg: string }> = {
  thought:     { label: 'THOUGHT',     color: '#f0c040', bg: 'rgba(240,192,64,0.08)'  },
  action:      { label: 'ACTION',      color: '#4db8ff', bg: 'rgba(77,184,255,0.08)'  },
  observation: { label: 'OBSERVATION', color: '#ff9070', bg: 'rgba(255,144,112,0.08)' },
  answer:      { label: 'ANSWER',      color: '#00e5a0', bg: 'rgba(0,229,160,0.10)'   },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AgentPlayground() {
  const [presetIdx, setPresetIdx]       = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Step[]>([]);
  const [running, setRunning]           = useState(false);
  const [done, setDone]                 = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function reset() {
    clearTimers();
    setVisibleSteps([]);
    setRunning(false);
    setDone(false);
  }

  function changePreset(idx: number) {
    reset();
    setPresetIdx(idx);
  }

  function run() {
    if (running) return;
    reset();
    setRunning(true);

    const steps = PRESETS[presetIdx].steps;
    steps.forEach((step, i) => {
      // Thoughts take longer (reading time), actions/obs are quick
      const perStep = step.type === 'thought' ? 1400 : 900;
      const delay = steps.slice(0, i).reduce((acc, s) => {
        return acc + (s.type === 'thought' ? 1400 : 900);
      }, 0);

      const t = setTimeout(() => {
        setVisibleSteps(prev => [...prev, step]);
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
        if (i === steps.length - 1) {
          setRunning(false);
          setDone(true);
        }
      }, delay);

      timersRef.current.push(t);
    });
  }

  useEffect(() => () => clearTimers(), []);

  const preset = PRESETS[presetIdx];

  return (
    <div className={s.playground}>

      {/* Header */}
      <div className={s.header}>
        <span className={s.title}>Agent Playground</span>
        <span className={s.subtitle}>ReAct: Thought → Action → Observation → ...</span>
      </div>

      {/* Body */}
      <div className={s.body}>

        {/* Left panel */}
        <div className={s.left}>

          {/* Query presets */}
          <div className={s.leftBlock}>
            <div className={s.blockLabel}>ВОПРОС ПОЛЬЗОВАТЕЛЯ</div>
            <div className={s.queryList}>
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  className={`${s.queryBtn} ${presetIdx === i ? s.queryBtnOn : ''}`}
                  onClick={() => !running && changePreset(i)}
                  disabled={running}
                >
                  <span className={s.queryText}>{p.query}</span>
                  <span className={s.queryMeta}>{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className={s.leftBlock}>
            <div className={s.blockLabel}>ДОСТУПНЫЕ ИНСТРУМЕНТЫ</div>
            <div className={s.toolList}>
              {TOOLS.map(t => (
                <div
                  key={t.id}
                  className={`${s.toolItem} ${preset.usedTools.includes(t.id) ? s.toolItemUsed : ''}`}
                >
                  <span className={s.toolIcon}>{t.icon}</span>
                  <div>
                    <div className={s.toolName}>{t.id}</div>
                    <div className={s.toolDesc}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className={s.actions}>
            {!done && (
              <button className={s.runBtn} onClick={run} disabled={running}>
                {running ? '⏳ Агент думает...' : '▶ Запустить агента'}
              </button>
            )}
            {done && (
              <button className={s.resetBtn} onClick={reset}>↺ Запустить снова</button>
            )}
          </div>
        </div>

        {/* Right: ReAct trace */}
        <div className={s.right}>
          <div className={s.traceHeader}>
            <span className={s.traceLabel}>REACT TRACE</span>
            {running && <span className={s.traceDot}>●</span>}
          </div>

          <div className={s.trace}>
            {visibleSteps.length === 0 && !running && (
              <div className={s.traceEmpty}>
                Нажми «Запустить агента» чтобы увидеть<br />
                цикл Thought → Action → Observation
              </div>
            )}

            {visibleSteps.map((step, i) => {
              const meta = STEP_META[step.type];
              return (
                <div
                  key={i}
                  className={s.step}
                  style={{ background: meta.bg, borderLeft: `3px solid ${meta.color}` }}
                >
                  <div className={s.stepLabel} style={{ color: meta.color }}>
                    {meta.label}
                    {step.type === 'action' && step.tool && (
                      <span className={s.stepTool}> → {step.tool}()</span>
                    )}
                  </div>

                  {step.type === 'action' ? (
                    <pre className={s.stepCode}>
                      {`${step.tool}(${JSON.stringify(step.params, null, 2)})`}
                    </pre>
                  ) : (
                    <div className={s.stepContent}>{step.content}</div>
                  )}
                </div>
              );
            })}

            {running && (
              <div className={s.thinking}>
                <span className={s.thinkDot} style={{ animationDelay: '0ms' }}>●</span>
                <span className={s.thinkDot} style={{ animationDelay: '200ms' }}>●</span>
                <span className={s.thinkDot} style={{ animationDelay: '400ms' }}>●</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
