'use client';

import { useState, useMemo } from 'react';
import s from './LlmGenerator.module.scss';

// ── Tokenizer ─────────────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    label: 'Обычный текст',
    text: 'Hello world!',
    tokens: ['Hello', ' world', '!'],
  },
  {
    label: 'Редкое слово',
    text: 'transformer architecture',
    tokens: ['transform', 'er', ' archit', 'ecture'],
  },
  {
    label: 'Русский текст',
    text: 'нейросеть умеет',
    tokens: ['ней', 'ро', 'сеть', ' умеет'],
  },
  {
    label: 'Числа',
    text: '2024-01-15',
    tokens: ['20', '24', '-', '01', '-', '15'],
  },
  {
    label: 'Код',
    text: 'const model = new GPT()',
    tokens: ['const', ' model', ' =', ' new', ' G', 'PT', '()'],
  },
];

const TOKEN_COLORS = [
  '#00e5a0', '#4db8ff', '#f0c040', '#ff9070', '#c084fc',
  '#fb7185', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa',
];

// ── Temperature ───────────────────────────────────────────────────────────────

const NEXT_TOKENS: { token: string; logit: number }[] = [
  { token: 'генерирует',    logit: 4.5 },
  { token: 'предсказывает', logit: 3.8 },
  { token: 'думает',        logit: 3.2 },
  { token: 'создаёт',       logit: 2.7 },
  { token: 'учится',        logit: 2.1 },
  { token: 'работает',      logit: 1.9 },
];

function softmax(logits: number[], temp: number): number[] {
  const scaled = logits.map((l) => l / Math.max(temp, 0.01));
  const maxVal = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function sampleFromDist(probs: number[]): number {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r < cum) return i;
  }
  return probs.length - 1;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LlmGenerator() {
  const [tab, setTab] = useState<'tokens' | 'temp'>('tokens');

  // Tokenizer tab
  const [exampleIdx, setExampleIdx] = useState(0);

  // Temperature tab
  const [temperature, setTemperature] = useState(1.0);
  const [generated, setGenerated] = useState<string[]>([]);

  const probs = useMemo(
    () => softmax(NEXT_TOKENS.map((t) => t.logit), temperature),
    [temperature]
  );

  function handleGenerate() {
    const idx = sampleFromDist(probs);
    setGenerated((prev) => [...prev, NEXT_TOKENS[idx].token]);
  }

  function handleReset() {
    setGenerated([]);
  }

  const example = EXAMPLES[exampleIdx];

  return (
    <div className={s.container}>
      {/* Tabs */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'tokens' ? s.tabActive : ''}`}
          onClick={() => setTab('tokens')}
        >
          Токенизация
        </button>
        <button
          className={`${s.tab} ${tab === 'temp' ? s.tabActive : ''}`}
          onClick={() => setTab('temp')}
        >
          Температура
        </button>
      </div>

      {/* ── Tab: Tokenizer ─────────────────────────────────────────────────── */}
      {tab === 'tokens' && (
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Как текст разбивается на токены</span>
            <span className={s.panelSub}>GPT-4 / cl100k_base токенизатор (приближение)</span>
          </div>

          {/* Example buttons */}
          <div className={s.exampleBtns}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                className={`${s.exBtn} ${i === exampleIdx ? s.exBtnActive : ''}`}
                onClick={() => setExampleIdx(i)}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Input display */}
          <div className={s.inputDisplay}>
            <div className={s.inputLabel}>Текст</div>
            <div className={s.inputText}>{example.text}</div>
          </div>

          {/* Token display */}
          <div className={s.tokenDisplay}>
            <div className={s.inputLabel}>
              Токены
              <span className={s.tokenCount}>{example.tokens.length} токена</span>
            </div>
            <div className={s.tokenRow}>
              {example.tokens.map((tok, i) => (
                <div
                  key={i}
                  className={s.tokenChip}
                  style={{
                    borderColor: TOKEN_COLORS[i % TOKEN_COLORS.length] + '55',
                    background: TOKEN_COLORS[i % TOKEN_COLORS.length] + '11',
                    color: TOKEN_COLORS[i % TOKEN_COLORS.length],
                  }}
                >
                  <span className={s.tokenText}>{tok}</span>
                  <span className={s.tokenId}>#{i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className={s.statsRow}>
            <div className={s.stat}>
              <span className={s.statNum}>{example.tokens.length}</span>
              <span className={s.statLabel}>токенов</span>
            </div>
            <div className={s.stat}>
              <span className={s.statNum}>{example.text.length}</span>
              <span className={s.statLabel}>символов</span>
            </div>
            <div className={s.stat}>
              <span className={s.statNum}>
                {(example.text.length / example.tokens.length).toFixed(1)}
              </span>
              <span className={s.statLabel}>симв / токен</span>
            </div>
          </div>

          <div className={s.note}>
            Токены ≠ слова. Среднее по английскому: ~4 символа на токен.
            Русский текст обходится в ~1.5–2× дороже — меньше слов в том же контексте.
          </div>
        </div>
      )}

      {/* ── Tab: Temperature ───────────────────────────────────────────────── */}
      {tab === 'temp' && (
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Как temperature меняет выбор токена</span>
            <span className={s.panelSub}>
              Промпт: «Нейросеть умеет…» — что выберет модель?
            </span>
          </div>

          {/* Temperature slider */}
          <div className={s.tempControl}>
            <div className={s.tempRow}>
              <span className={s.tempLabel}>temperature =</span>
              <span className={s.tempValue}>{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className={s.tempSlider}
            />
            <div className={s.tempScale}>
              <span>0.1 — детерминировано</span>
              <span>1.0 — нормально</span>
              <span>2.0 — случайно</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className={s.chart}>
            {NEXT_TOKENS.map((t, i) => (
              <div key={t.token} className={s.chartRow}>
                <span className={s.chartToken}>{t.token}</span>
                <div className={s.chartBarWrap}>
                  <div
                    className={s.chartBar}
                    style={{
                      width: `${probs[i] * 100}%`,
                      background: TOKEN_COLORS[i % TOKEN_COLORS.length],
                      opacity: 0.75,
                    }}
                  />
                </div>
                <span className={s.chartPct}>{(probs[i] * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {/* Generate */}
          <div className={s.genArea}>
            <div className={s.genPrompt}>
              <span className={s.genPromptText}>Нейросеть умеет </span>
              {generated.map((tok, i) => (
                <span key={i} className={s.genToken} style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}>
                  {tok}{' '}
                </span>
              ))}
              <span className={s.genCursor}>▌</span>
            </div>
            <div className={s.genBtns}>
              <button className={s.genBtn} onClick={handleGenerate}>
                Выбрать токен
              </button>
              {generated.length > 0 && (
                <button className={s.resetBtn} onClick={handleReset}>
                  Сбросить
                </button>
              )}
            </div>
          </div>

          <div className={s.note}>
            При низкой temperature модель почти всегда выберет «{NEXT_TOKENS[0].token}».
            При высокой — результат непредсказуем. Попробуй сгенерировать 5–10 токенов при разных значениях.
          </div>
        </div>
      )}
    </div>
  );
}
