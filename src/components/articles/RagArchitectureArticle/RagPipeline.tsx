'use client';

import { useState, useEffect, useRef } from 'react';
import s from './RagPipeline.module.scss';

// ── Knowledge base (fake Next.js docs) ────────────────────────────────────────

const CHUNKS = [
  {
    id: 0,
    title: 'App Router: маршрутизация',
    text: 'App Router использует файловую систему для маршрутизации. Каждая папка в app/ создаёт сегмент маршрута. page.tsx делает маршрут публичным.',
    source: 'routing.md',
  },
  {
    id: 1,
    title: 'Server Components',
    text: 'Все компоненты App Router — Server Components по умолчанию. Рендерятся на сервере, не отправляют JS клиенту. Для интерактивности — "use client".',
    source: 'rendering.md',
  },
  {
    id: 2,
    title: 'Route Handlers (API)',
    text: 'Route Handlers создаются в файлах route.ts. Поддерживают GET, POST, PUT, DELETE. Заменяют pages/api/* из Pages Router.',
    source: 'api-routes.md',
  },
  {
    id: 3,
    title: 'Кэширование запросов',
    text: 'Next.js автоматически кэширует fetch-запросы. Для ISR: { next: { revalidate: 60 } }. Для отключения кэша: { cache: "no-store" }.',
    source: 'caching.md',
  },
  {
    id: 4,
    title: 'Middleware',
    text: 'Middleware выполняется перед обработкой запроса. Создаётся в middleware.ts. Применяется для auth, редиректов, A/B тестирования.',
    source: 'middleware.md',
  },
  {
    id: 5,
    title: 'Dynamic imports',
    text: 'next/dynamic позволяет лениво загружать компоненты. Снижает начальный bundle. Поддерживает ssr: false для client-only компонентов.',
    source: 'optimization.md',
  },
];

// ── Query presets with pre-computed similarity scores ─────────────────────────

const PRESETS = [
  {
    query: 'Как кэшировать fetch-запросы?',
    sims: [0.31, 0.28, 0.22, 0.94, 0.19, 0.25],
    answer:
      'Next.js автоматически кэширует fetch-запросы. Для ISR с периодическим обновлением передай { next: { revalidate: 60 } } — кэш будет сброшен каждые 60 секунд. Чтобы полностью отключить кэш и всегда получать свежие данные, используй { cache: "no-store" }.',
  },
  {
    query: 'Что такое Server Components?',
    sims: [0.27, 0.95, 0.21, 0.33, 0.18, 0.29],
    answer:
      'Server Components — компоненты, которые рендерятся на сервере и не отправляют JavaScript-код клиенту. В Next.js App Router все компоненты являются Server Component по умолчанию. Для клиентской интерактивности (хуки, обработчики событий) добавь директиву "use client" в начало файла.',
  },
  {
    query: 'Как создать API endpoint?',
    sims: [0.22, 0.19, 0.96, 0.24, 0.31, 0.18],
    answer:
      'Создай файл route.ts в любой директории внутри app/. Экспортируй именованные async-функции GET, POST, PUT или DELETE. Пример: export async function GET(request: Request) { return Response.json({ ok: true }) }. Route Handlers заменяют pages/api/* из Pages Router.',
  },
];

// ── Fixed fake vector values (avoids Math.random re-render issues) ────────────

const FAKE_VECTORS = [
  '-0.231', '0.847', '-0.103', '0.562', '-0.721',
  '0.189', '0.445', '-0.334', '0.673', '-0.512',
  '0.228', '0.891',
];

const STEP_LABELS = [
  'Готов к поиску',
  'Кодируем запрос...',
  'Вычисляем сходство...',
  'Топ чанки найдены',
  'Собираем промпт...',
  'Ответ готов',
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

// ── Component ─────────────────────────────────────────────────────────────────

export function RagPipeline() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [step, setStep]           = useState<Step>(0);
  const [running, setRunning]     = useState(false);
  const [simVisible, setSimVisible] = useState(false);
  const [shownSims, setShownSims] = useState<number[]>(CHUNKS.map(() => 0));

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = PRESETS[presetIdx];

  // Top-3 chunk indices sorted by similarity
  const ranked = [...CHUNKS.map((c, i) => ({ id: c.id, sim: preset.sims[i] }))]
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3)
    .map(c => c.id);

  function clearAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function reset() {
    clearAll();
    setStep(0);
    setRunning(false);
    setSimVisible(false);
    setShownSims(CHUNKS.map(() => 0));
  }

  function changePreset(idx: number) {
    reset();
    setPresetIdx(idx);
  }

  function run() {
    if (running) return;
    clearAll();
    setRunning(true);
    setStep(1);
    setSimVisible(false);
    setShownSims(CHUNKS.map(() => 0));

    // Step 2 — start sim animation
    const t1 = setTimeout(() => {
      setStep(2);
      setSimVisible(true);

      const target = preset.sims;
      let progress = 0;
      intervalRef.current = setInterval(() => {
        progress = Math.min(progress + 0.05, 1);
        setShownSims(target.map(v => parseFloat((v * progress).toFixed(3))));
        if (progress >= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      }, 25);

      // Step 3 — top chunks revealed
      const t2 = setTimeout(() => {
        setStep(3);
        setShownSims(target);

        // Step 4 — prompt assembly
        const t3 = setTimeout(() => {
          setStep(4);

          // Step 5 — answer
          const t4 = setTimeout(() => {
            setStep(5);
            setRunning(false);
          }, 1400);
          timersRef.current.push(t4);
        }, 1100);
        timersRef.current.push(t3);
      }, 2000);
      timersRef.current.push(t2);
    }, 1300);
    timersRef.current.push(t1);
  }

  useEffect(() => () => clearAll(), []);

  // Assembled prompt for step 4+
  const topChunks = CHUNKS.filter(c => ranked.includes(c.id))
    .sort((a, b) => preset.sims[b.id] - preset.sims[a.id]);

  const assembledPrompt =
    `<context>\n` +
    topChunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`).join('\n\n') +
    `\n</context>\n\n<question>${preset.query}</question>\n\nОтвечай ТОЛЬКО на основе контекста выше.\nЕсли ответа нет — скажи об этом.`;

  return (
    <div className={s.pipeline}>

      {/* ── Header ── */}
      <div className={s.header}>
        <span className={s.title}>RAG Pipeline</span>
        <div className={s.stepBar}>
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`${s.stepDot} ${step === i ? s.stepDotActive : ''} ${step > i ? s.stepDotDone : ''}`}
            />
          ))}
        </div>
        <span className={s.stepLabel}>{STEP_LABELS[step]}</span>
      </div>

      {/* ── Query presets ── */}
      <div className={s.presets}>
        <span className={s.presetsLabel}>ЗАПРОС</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className={`${s.presetBtn} ${presetIdx === i ? s.presetBtnOn : ''}`}
            onClick={() => changePreset(i)}
          >
            {p.query}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className={s.body}>

        {/* Left — chunk cards */}
        <div className={s.chunks}>
          <div className={s.chunksLabel}>KNOWLEDGE BASE · 6 чанков · Next.js docs</div>
          {CHUNKS.map(chunk => {
            const sim    = shownSims[chunk.id];
            const isTop  = ranked.includes(chunk.id);
            const hilite = step >= 3 && isTop;
            return (
              <div
                key={chunk.id}
                className={`${s.chunk} ${hilite ? s.chunkTop : ''}`}
                style={hilite ? { borderLeftColor: '#00e5a0', background: 'rgba(0,229,160,0.05)' } : {}}
              >
                <div className={s.chunkHeader}>
                  <span className={s.chunkTitle}>{chunk.title}</span>
                  <span className={s.chunkSource}>{chunk.source}</span>
                </div>
                <div className={s.chunkText}>{chunk.text}</div>

                {simVisible && (
                  <div className={s.simRow}>
                    <div className={s.simTrack}>
                      <div
                        className={s.simFill}
                        style={{
                          width: `${sim * 100}%`,
                          background: sim > 0.8 ? '#00e5a0' : sim > 0.4 ? '#f0c040' : '#4db8ff',
                        }}
                      />
                    </div>
                    <span
                      className={s.simPct}
                      style={{ color: sim > 0.8 ? '#00e5a0' : sim > 0.4 ? '#f0c040' : '#4db8ff' }}
                    >
                      {(sim * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {hilite && <div className={s.topBadge}>TOP-3</div>}
              </div>
            );
          })}
        </div>

        {/* Right — step visualization */}
        <div className={s.right}>

          {/* Step 0: ready */}
          {step === 0 && (
            <div className={s.readyState}>
              <div className={s.readyIcon}>⚡</div>
              <div className={s.readyText}>Выбери запрос и нажми Search</div>
              <div className={s.readySub}>Query → Embed → Vector Search → Rerank → Generate</div>
            </div>
          )}

          {/* Step 1: encode query */}
          {step === 1 && (
            <div className={s.stepView}>
              <div className={s.stepViewTitle}>Шаг 1 — Embed Query</div>
              <div className={s.queryBox}>&ldquo;{preset.query}&rdquo;</div>
              <div className={s.arrowDown}>↓ text-embedding-3-large</div>
              <div className={s.vectorBox}>
                {FAKE_VECTORS.map((v, i) => (
                  <span
                    key={i}
                    className={s.vectorNum}
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    {v}
                  </span>
                ))}
                <span className={s.vectorEllipsis}>... (1536 dims)</span>
              </div>
              <div className={s.stepDesc}>
                Запрос преобразуется в вектор из 1 536 чисел.
                Семантически похожие тексты имеют близкие векторы в пространстве.
              </div>
            </div>
          )}

          {/* Step 2: computing similarities */}
          {step === 2 && (
            <div className={s.stepView}>
              <div className={s.stepViewTitle}>Шаг 2 — Vector Search (HNSW)</div>
              <div className={s.formulaBox}>
                <span className={s.formulaText}>similarity =</span>
                <span className={s.formulaFrac}>
                  <span className={s.formulaTop}>query · chunk</span>
                  <span className={s.formulaBot}>|query| × |chunk|</span>
                </span>
              </div>
              <div className={s.stepDesc}>
                Cosine similarity вычисляется между вектором запроса и каждым
                чанком в индексе. HNSW делает это за O(log N) — смотри на бары слева.
              </div>
            </div>
          )}

          {/* Step 3: top-k */}
          {step === 3 && (
            <div className={s.stepView}>
              <div className={s.stepViewTitle}>Шаг 3 — Top-K Retrieval</div>
              <div className={s.stepDesc}>3 наиболее релевантных чанка:</div>
              {topChunks.map((c, i) => (
                <div key={c.id} className={s.topItem}>
                  <span
                    className={s.topRank}
                    style={{ color: i === 0 ? '#00e5a0' : i === 1 ? '#f0c040' : '#4db8ff' }}
                  >
                    #{i + 1}
                  </span>
                  <span className={s.topName}>{c.title}</span>
                  <span
                    className={s.topScore}
                    style={{ color: i === 0 ? '#00e5a0' : i === 1 ? '#f0c040' : '#4db8ff' }}
                  >
                    {(preset.sims[c.id] * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              <div className={s.stepDesc}>
                Выделены зелёным слева. В реальной системе здесь применяется reranker
                (cross-encoder) для уточнения порядка.
              </div>
            </div>
          )}

          {/* Step 4: prompt assembly */}
          {step === 4 && (
            <div className={s.stepView}>
              <div className={s.stepViewTitle}>Шаг 4 — Prompt Assembly</div>
              <pre className={s.promptPreview}>{assembledPrompt}</pre>
            </div>
          )}

          {/* Step 5: answer */}
          {step === 5 && (
            <div className={s.stepView}>
              <div className={s.stepViewTitle}>Шаг 5 — Generated Answer</div>
              <div className={s.answerBox}>{preset.answer}</div>
              <div className={s.answerMeta}>
                <span className={s.answerMetaItem}>● grounded in context</span>
                <span className={s.answerMetaItem}>● 3 chunks used</span>
                <span className={s.answerMetaItem}>● ~{Math.ceil(preset.answer.length / 4)} tokens</span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className={s.actions}>
            {step === 0 && (
              <button className={s.runBtn} onClick={run}>▶ Search</button>
            )}
            {step === 5 && (
              <button className={s.runBtn} onClick={reset}>↺ Сбросить</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
