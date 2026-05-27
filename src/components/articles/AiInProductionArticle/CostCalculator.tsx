'use client';

import { useState } from 'react';
import s from './CostCalculator.module.scss';

// ── Model pricing (per 1M tokens, USD) ───────────────────────────────────────

interface ModelInfo {
  name: string;
  inputPer1M: number;
  outputPer1M: number;
  speedLabel: string;
  smartness: number;   // 1-5
  category: 'fast' | 'balanced' | 'powerful';
}

const MODELS: ModelInfo[] = [
  { name: 'claude-haiku-4-5',     inputPer1M: 0.80,  outputPer1M: 4.00,  speedLabel: '~100 tok/s', smartness: 3, category: 'fast' },
  { name: 'claude-sonnet-4-6',    inputPer1M: 3.00,  outputPer1M: 15.00, speedLabel: '~70 tok/s',  smartness: 4, category: 'balanced' },
  { name: 'claude-opus-4-7',      inputPer1M: 15.00, outputPer1M: 75.00, speedLabel: '~40 tok/s',  smartness: 5, category: 'powerful' },
  { name: 'gpt-4o-mini',          inputPer1M: 0.15,  outputPer1M: 0.60,  speedLabel: '~120 tok/s', smartness: 3, category: 'fast' },
  { name: 'gpt-4o',               inputPer1M: 2.50,  outputPer1M: 10.00, speedLabel: '~80 tok/s',  smartness: 5, category: 'powerful' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function CostCalculator() {
  const [modelIdx,      setModelIdx]      = useState(1);       // sonnet default
  const [dailyRequests, setDailyRequests] = useState(10_000);
  const [inputTokens,   setInputTokens]   = useState(500);
  const [outputTokens,  setOutputTokens]  = useState(300);
  const [cacheRate,     setCacheRate]     = useState(30);       // % of requests cached

  const model = MODELS[modelIdx];

  // Cost calculation
  const effectiveRequests = dailyRequests * (1 - cacheRate / 100);
  const inputTokensPerDay  = effectiveRequests * inputTokens;
  const outputTokensPerDay = effectiveRequests * outputTokens;

  const dailyCost = (inputTokensPerDay  / 1_000_000) * model.inputPer1M
                  + (outputTokensPerDay / 1_000_000) * model.outputPer1M;

  const monthlyCost = dailyCost * 30;
  const yearlyCost  = dailyCost * 365;
  const savedByCaching = dailyRequests * (cacheRate / 100)
    * ((inputTokens / 1_000_000) * model.inputPer1M + (outputTokens / 1_000_000) * model.outputPer1M) * 30;

  function fmt(n: number) {
    if (n < 1) return `$${n.toFixed(3)}`;
    if (n < 100) return `$${n.toFixed(2)}`;
    return `$${Math.round(n).toLocaleString()}`;
  }

  function Smartness({ n }: { n: number }) {
    return (
      <div className={s.smartness}>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`${s.smartDot} ${i <= n ? s.smartDotFilled : ''}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={s.widget}>
      <div className={s.header}>
        <span className={s.title}>LLM Cost Calculator</span>
        <span className={s.subtitle}>считаем реальную стоимость в продакшне</span>
      </div>

      <div className={s.body}>

        {/* Left: inputs */}
        <div className={s.left}>

          {/* Model selector */}
          <div className={s.block}>
            <div className={s.blockLabel}>МОДЕЛЬ</div>
            <div className={s.modelList}>
              {MODELS.map((m, i) => (
                <button
                  key={m.name}
                  className={`${s.modelBtn} ${modelIdx === i ? s.modelBtnOn : ''}`}
                  onClick={() => setModelIdx(i)}
                >
                  <div className={s.modelTop}>
                    <span className={s.modelName}>{m.name}</span>
                    <span className={`${s.modelBadge} ${s['badge_' + m.category]}`}>{m.category}</span>
                  </div>
                  <div className={s.modelMeta}>
                    <Smartness n={m.smartness} />
                    <span className={s.modelSpeed}>{m.speedLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className={s.block}>
            <div className={s.blockLabel}>ПАРАМЕТРЫ</div>

            <div className={s.slider}>
              <div className={s.sliderRow}>
                <span className={s.sliderLabel}>Запросов/день</span>
                <span className={s.sliderValue}>{dailyRequests.toLocaleString()}</span>
              </div>
              <input type="range" min="100" max="100000" step="100"
                value={dailyRequests} onChange={e => setDailyRequests(+e.target.value)}
                className={s.sliderInput} />
            </div>

            <div className={s.slider}>
              <div className={s.sliderRow}>
                <span className={s.sliderLabel}>Input токенов/запрос</span>
                <span className={s.sliderValue}>{inputTokens}</span>
              </div>
              <input type="range" min="50" max="4000" step="50"
                value={inputTokens} onChange={e => setInputTokens(+e.target.value)}
                className={s.sliderInput} />
            </div>

            <div className={s.slider}>
              <div className={s.sliderRow}>
                <span className={s.sliderLabel}>Output токенов/запрос</span>
                <span className={s.sliderValue}>{outputTokens}</span>
              </div>
              <input type="range" min="50" max="2000" step="50"
                value={outputTokens} onChange={e => setOutputTokens(+e.target.value)}
                className={s.sliderInput} />
            </div>

            <div className={s.slider}>
              <div className={s.sliderRow}>
                <span className={s.sliderLabel}>Cache hit rate</span>
                <span className={s.sliderValue}>{cacheRate}%</span>
              </div>
              <input type="range" min="0" max="90" step="5"
                value={cacheRate} onChange={e => setCacheRate(+e.target.value)}
                className={s.sliderInput} />
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className={s.right}>
          <div className={s.costCards}>
            <div className={s.costCard}>
              <div className={s.costPeriod}>В ДЕНЬ</div>
              <div className={s.costAmount}>{fmt(dailyCost)}</div>
            </div>
            <div className={s.costCard} style={{ borderColor: 'rgba(0,229,160,0.3)' }}>
              <div className={s.costPeriod}>В МЕСЯЦ</div>
              <div className={s.costAmount} style={{ color: '#00e5a0' }}>{fmt(monthlyCost)}</div>
            </div>
            <div className={s.costCard}>
              <div className={s.costPeriod}>В ГОД</div>
              <div className={s.costAmount}>{fmt(yearlyCost)}</div>
            </div>
          </div>

          <div className={s.breakdown}>
            <div className={s.breakdownTitle}>РАЗБИВКА</div>
            <div className={s.breakdownRow}>
              <span>Эффективных запросов/день</span>
              <span>{Math.round(effectiveRequests).toLocaleString()}</span>
            </div>
            <div className={s.breakdownRow}>
              <span>Input токенов/день (M)</span>
              <span>{(inputTokensPerDay / 1_000_000).toFixed(2)}</span>
            </div>
            <div className={s.breakdownRow}>
              <span>Output токенов/день (M)</span>
              <span>{(outputTokensPerDay / 1_000_000).toFixed(2)}</span>
            </div>
            <div className={s.breakdownRow}>
              <span>Цена input per 1M tokens</span>
              <span>${model.inputPer1M}</span>
            </div>
            <div className={s.breakdownRow}>
              <span>Цена output per 1M tokens</span>
              <span>${model.outputPer1M}</span>
            </div>
          </div>

          {cacheRate > 0 && (
            <div className={s.savingCard}>
              <div className={s.savingLabel}>💰 ЭКОНОМИЯ ОТ КЭША (за месяц)</div>
              <div className={s.savingAmount}>{fmt(savedByCaching)}</div>
              <div className={s.savingNote}>
                {cacheRate}% запросов не достигает API
              </div>
            </div>
          )}

          <div className={s.tip}>
            <div className={s.tipLabel}>СОВЕТ</div>
            <div className={s.tipText}>
              {model.category === 'powerful'
                ? `${model.name} — мощная модель. Проверь: нужны ли все запросы такой мощности? Роутинг простых запросов на ${MODELS[0].name} сэкономит ${Math.round((1 - MODELS[0].inputPer1M / model.inputPer1M) * 100)}% на input.`
                : model.category === 'fast'
                ? `${model.name} — быстрая и дешёвая. Если нужно больше качества для сложных задач — используй модель-роутер.`
                : `${model.name} — хороший баланс. Рассмотри роутинг: простые запросы → ${MODELS[0].name}, сложные → ${MODELS[2].name}.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
