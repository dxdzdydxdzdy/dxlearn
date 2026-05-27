'use client';

import { useState, useMemo } from 'react';
import s from './PromptLab.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type TechKey = 'role' | 'fewshot' | 'cot' | 'format';

interface Technique {
  key: TechKey;
  label: string;
  badge: string;
  color: string;
  desc: string;
}

// ── Techniques config ─────────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    key: 'role',
    label: 'Role Assignment',
    badge: 'Роль',
    color: '#4db8ff',
    desc: 'Задаём эксперта — модель смещает распределение к профессиональным ответам',
  },
  {
    key: 'fewshot',
    label: 'Few-shot Examples',
    badge: 'Примеры',
    color: '#f0c040',
    desc: 'Показываем 3 примера вход→выход — лучше любой словесной инструкции',
  },
  {
    key: 'cot',
    label: 'Chain-of-Thought',
    badge: 'CoT',
    color: '#ff9070',
    desc: 'Просим думать пошагово — промежуточные шаги повышают точность',
  },
  {
    key: 'format',
    label: 'Output Format',
    badge: 'JSON',
    color: '#00e5a0',
    desc: 'Явный пример JSON схемы — предсказуемый машиночитаемый результат',
  },
];

// ── Prompt assembly ───────────────────────────────────────────────────────────

function buildPrompt(enabled: Set<TechKey>, input: string): string {
  const parts: string[] = [];

  if (enabled.has('role')) {
    parts.push(
      'Ты опытный специалист по анализу тональности текста с 10 годами опыта в NLP.\n' +
      'Твоя задача — точно классифицировать отзывы клиентов.'
    );
  }

  parts.push('Задача: определи тональность отзыва (POSITIVE / NEUTRAL / NEGATIVE).');

  if (enabled.has('fewshot')) {
    parts.push(
      '\nПримеры:\n' +
      'Отзыв: "Качество ужасное, развалилось на следующий день"\n' +
      'Тональность: NEGATIVE\n\n' +
      'Отзыв: "Нормально, соответствует описанию, без сюрпризов"\n' +
      'Тональность: NEUTRAL\n\n' +
      'Отзыв: "Просто восхитительно! Превзошло все ожидания, буду брать ещё"\n' +
      'Тональность: POSITIVE'
    );
  }

  if (enabled.has('cot')) {
    parts.push(
      '\nАлгоритм анализа:\n' +
      '1. Выдели ключевые слова и фразы с эмоциональной окраской\n' +
      '2. Оцени общий тон: позитивный, негативный или нейтральный\n' +
      '3. Учти контекст: сарказм, сравнения, условные конструкции\n' +
      '4. Сформулируй вывод'
    );
  }

  if (enabled.has('format')) {
    parts.push(
      '\nФормат ответа — строго JSON:\n' +
      '{\n' +
      '  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",\n' +
      '  "confidence": 0.0–1.0,\n' +
      '  "key_phrases": ["фраза1", "фраза2"],\n' +
      '  "reasoning": "краткое обоснование"\n' +
      '}'
    );
  }

  parts.push(`\nОтзыв: "${input}"`);

  if (!enabled.has('format') && !enabled.has('cot')) {
    parts.push('Тональность:');
  } else if (!enabled.has('format') && enabled.has('cot')) {
    parts.push('\nПошаговый анализ:');
  }

  return parts.join('\n');
}

// ── Simulated responses ───────────────────────────────────────────────────────

function getResponse(enabled: Set<TechKey>): { text: string; quality: number } {
  const has = (k: TechKey) => enabled.has(k);
  const count = enabled.size;

  if (count === 0) {
    return {
      quality: 15,
      text: 'POSITIVE',
    };
  }

  if (has('role') && !has('fewshot') && !has('cot') && !has('format')) {
    return {
      quality: 35,
      text: 'Данный отзыв носит позитивный характер. Клиент выражает удовлетворённость покупкой.',
    };
  }

  if (has('role') && has('fewshot') && !has('cot') && !has('format')) {
    return {
      quality: 60,
      text: 'POSITIVE\n\nОбоснование: клиент упоминает быструю доставку и соответствие описанию — оба фактора являются позитивными.',
    };
  }

  if (has('cot') && !has('format')) {
    const base =
      '1. Ключевые фразы: "пришел быстро" (+), "все как на фото" (+)\n' +
      '2. Общий тон: положительный — клиент рад скорости и соответствию\n' +
      '3. Сарказм/условия: не обнаружено\n' +
      '4. Вывод: POSITIVE (уверенность высокая)';
    return { quality: 75, text: base };
  }

  if (has('format')) {
    return {
      quality: count >= 3 ? 97 : 82,
      text: JSON.stringify(
        {
          sentiment: 'POSITIVE',
          confidence: count >= 3 ? 0.97 : 0.83,
          key_phrases: ['пришел быстро', 'все как на фото'],
          reasoning:
            count >= 3
              ? 'Отзыв содержит два явных позитивных индикатора: скорость доставки и точность описания. Негативных маркеров не обнаружено. Сарказм не выявлен.'
              : 'Позитивная тональность на основе содержания.',
        },
        null,
        2
      ),
    };
  }

  return {
    quality: 50,
    text: 'POSITIVE — отзыв положительный.',
  };
}

// ── Quality bar ───────────────────────────────────────────────────────────────

function QualityBar({ value }: { value: number }) {
  const color =
    value >= 85 ? '#00e5a0'
    : value >= 60 ? '#f0c040'
    : value >= 35 ? '#ff9070'
    : '#ff5f6a';

  const label =
    value >= 85 ? 'Отлично'
    : value >= 60 ? 'Хорошо'
    : value >= 35 ? 'Слабо'
    : 'Плохо';

  return (
    <div className={s.qualityWrap}>
      <div className={s.qualityLabel}>Качество вывода</div>
      <div className={s.qualityRow}>
        <div className={s.qualityTrack}>
          <div
            className={s.qualityFill}
            style={{ width: `${value}%`, background: color }}
          />
        </div>
        <span className={s.qualityPct} style={{ color }}>{value}%</span>
        <span className={s.qualityTxt} style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PromptLab() {
  const [enabled, setEnabled] = useState<Set<TechKey>>(new Set());
  const [input, setInput] = useState('Товар пришел быстро, все как на фото!');

  function toggle(key: TechKey) {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const prompt = useMemo(() => buildPrompt(enabled, input), [enabled, input]);
  const { text: response, quality } = useMemo(() => getResponse(enabled), [enabled]);

  return (
    <div className={s.lab}>
      <div className={s.labHeader}>
        <span className={s.labTitle}>Prompt Lab</span>
        <span className={s.labSub}>Включай техники и смотри как меняется качество</span>
      </div>

      {/* Technique toggles */}
      <div className={s.techniques}>
        {TECHNIQUES.map(t => {
          const on = enabled.has(t.key);
          return (
            <button
              key={t.key}
              className={`${s.techBtn} ${on ? s.techBtnOn : ''}`}
              style={on ? { borderColor: t.color + '66', background: t.color + '11' } : {}}
              onClick={() => toggle(t.key)}
            >
              <div className={s.techTop}>
                <span className={s.techBadge} style={{ color: on ? t.color : undefined, borderColor: on ? t.color + '44' : undefined, background: on ? t.color + '11' : undefined }}>
                  {t.badge}
                </span>
                <span className={s.techToggle} style={{ background: on ? t.color : undefined }}>
                  {on ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className={s.techLabel} style={{ color: on ? t.color : undefined }}>{t.label}</div>
              <div className={s.techDesc}>{t.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className={s.inputRow}>
        <span className={s.inputLabel}>Входной отзыв</span>
        <input
          className={s.inputField}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {/* Quality */}
      <QualityBar value={quality} />

      {/* Split view */}
      <div className={s.split}>
        <div className={s.splitPane}>
          <div className={s.splitHeader}>
            <span className={s.splitTitle}>ПРОМПТ</span>
            <span className={s.splitMeta}>{prompt.split('\n').length} строк · ~{Math.ceil(prompt.length / 4)} токенов</span>
          </div>
          <pre className={s.promptText}>{prompt}</pre>
        </div>

        <div className={s.splitPane}>
          <div className={s.splitHeader}>
            <span className={s.splitTitle}>ОТВЕТ МОДЕЛИ</span>
            <span className={s.splitMeta} style={{ color: quality >= 85 ? '#00e5a0' : quality >= 60 ? '#f0c040' : '#ff5f6a' }}>
              {quality >= 85 ? '● production ready' : quality >= 60 ? '● приемлемо' : '● ненадёжно'}
            </span>
          </div>
          <pre className={s.responseText}>{response}</pre>
        </div>
      </div>
    </div>
  );
}
