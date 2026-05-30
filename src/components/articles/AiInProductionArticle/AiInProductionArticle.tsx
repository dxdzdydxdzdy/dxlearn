import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { CostCalculator } from './CostCalculator';
import { QUIZ_QUESTIONS } from './quizData';
import s from './AiInProductionArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function AiInProductionArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Введение ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>AI в продакшне — другой мир</SectionTitle>
        <p className={s.lead}>
          Прототип работает на localhost — и это ещё только начало. Продакшн
          добавляет реальных пользователей, реальные деньги и реальные ожидания.
          LLM-приложение в проде — это не просто «вызов API», это{' '}
          <strong>система</strong>: с latency, стоимостью, надёжностью,
          мониторингом и постоянной оценкой качества.
        </p>
        <p className={s.body}>
          Эта статья — карта проблем и решений, с которыми сталкивается каждый,
          кто выносит AI-функцию за пределы Jupyter Notebook.
        </p>

        <div className={s.pillarsGrid}>
          <div className={s.pillar}>
            <div className={s.pillarIcon}>⚡</div>
            <div className={s.pillarName}>Latency</div>
            <div className={s.pillarDesc}>Streaming, TTFT, быстрые модели</div>
          </div>
          <div className={s.pillar}>
            <div className={s.pillarIcon}>💰</div>
            <div className={s.pillarName}>Cost</div>
            <div className={s.pillarDesc}>Caching, routing, prompt compression</div>
          </div>
          <div className={s.pillar}>
            <div className={s.pillarIcon}>🔬</div>
            <div className={s.pillarName}>Evals</div>
            <div className={s.pillarDesc}>Тестирование LLM, метрики, regression</div>
          </div>
          <div className={s.pillar}>
            <div className={s.pillarIcon}>📊</div>
            <div className={s.pillarName}>Observability</div>
            <div className={s.pillarDesc}>Трейсинг, логирование, мониторинг</div>
          </div>
        </div>
      </section>

      {/* ── 2. Latency ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Latency: почему LLM медленный</SectionTitle>
        <p className={s.body}>
          LLM генерирует токены <em>последовательно</em>: каждый токен зависит
          от предыдущих. Нельзя параллелизировать. 200-токенный ответ = 200
          последовательных операций. При 30-60 токенах в секунду — это 3-7
          секунд ожидания.
        </p>

        <div className={s.latencyMetrics}>
          <div className={s.latencyCard} style={{ borderColor: 'rgba(0,229,160,0.3)' }}>
            <div className={s.latencyName}>TTFT</div>
            <div className={s.latencyFull}>Time To First Token</div>
            <div className={s.latencyDesc}>
              Время от запроса до первого токена. Определяет ощущение
              отзывчивости. При стриминге — критичнее, чем общее время.
            </div>
            <div className={s.latencyTarget}>&lt; 500ms — хорошо</div>
          </div>

          <div className={s.latencyCard} style={{ borderColor: 'rgba(77,184,255,0.3)' }}>
            <div className={s.latencyName}>TPOT</div>
            <div className={s.latencyFull}>Time Per Output Token</div>
            <div className={s.latencyDesc}>
              Скорость генерации после первого токена.
              Влияет на общее время длинных ответов.
            </div>
            <div className={s.latencyTarget}>25-100+ ms/token (зависит от модели)</div>
          </div>

          <div className={s.latencyCard} style={{ borderColor: 'rgba(240,192,64,0.3)' }}>
            <div className={s.latencyName}>E2E</div>
            <div className={s.latencyFull}>End-to-End Latency</div>
            <div className={s.latencyDesc}>
              Полное время от запроса до последнего токена.
              Важно для batch-задач и не-streaming UX.
            </div>
            <div className={s.latencyTarget}>TTFT + TPOT × output_tokens</div>
          </div>
        </div>

        <CodeHighlight lang="ts" filename="Streaming в Next.js — пользователь видит токены сразу" code={`// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Создаём ReadableStream — токены льются по мере генерации
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// Клиент читает stream:
const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
const reader = response.body!.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setAnswer(prev => prev + new TextDecoder().decode(value));
}`} />
      </section>

      {/* ── 3. Cost calculator ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Стоимость: считаем реальные цифры</SectionTitle>
        <p className={s.body}>
          LLM API считается в токенах. Input (промпт) и output (ответ) тарифицируются
          отдельно — output обычно в 3-5 раз дороже. При тысячах запросов в день
          суммы становятся значительными. Посчитаем:
        </p>

        <CostCalculator />

        <div className={s.infoCard}>
          <div className={s.infoLabel}>ПРАВИЛО БОЛЬШОГО ПАЛЬЦА</div>
          <p className={s.infoText}>
            1000 слов ≈ 1300 токенов. Средний RAG-запрос: ~500 input (система + контекст + вопрос)
            + ~300 output. GPT-4o mini: 500/1M × $0.15 + 300/1M × $0.60 = $0.000255 за запрос.
            10 000 запросов/день = $2.55/день = $76.5/месяц. Claude Haiku — аналогично.
          </p>
        </div>
      </section>

      {/* ── 4. Caching ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Кэширование: три уровня</SectionTitle>
        <p className={s.body}>
          Кэш — самая дешёвая оптимизация. Три уровня с разной стратегией:
        </p>

        <div className={s.cacheTypes}>
          <div className={s.cacheCard}>
            <div className={s.cacheNum}>01</div>
            <div className={s.cacheName}>Точное совпадение (Exact match)</div>
            <div className={s.cacheDesc}>
              Если запрос word-for-word идентичен кэшированному — вернуть
              сохранённый ответ. Redis + SHA256 от промпта. Cache-hit → 0ms, $0.
            </div>
            <div className={s.cacheCode}>{`const key = crypto.createHash('sha256')
  .update(JSON.stringify(messages))
  .digest('hex');

const cached = await redis.get(key);
if (cached) return JSON.parse(cached);

const response = await callLLM(messages);
await redis.set(key, JSON.stringify(response), 'EX', 86400);`}</div>
          </div>

          <div className={s.cacheCard}>
            <div className={s.cacheNum}>02</div>
            <div className={s.cacheName}>Семантическое кэширование</div>
            <div className={s.cacheDesc}>
              Похожие по смыслу запросы возвращают один ответ. Встроить запрос
              в эмбеддинг → найти похожее в векторном кэше (cosine &#62; 0.95).
            </div>
            <div className={s.cacheCode}>{`// GPTCache / LangChain SemanticCache
import { SemanticCache } from 'gptcache';

const cache = new SemanticCache({
  vectorStore: qdrant,
  similarityThreshold: 0.95,
});

// "погода в Москве" ≈ "какая погода сейчас в Москве" → cache hit`}</div>
          </div>

          <div className={s.cacheCard}>
            <div className={s.cacheNum}>03</div>
            <div className={s.cacheName}>Prompt Caching (на стороне API)</div>
            <div className={s.cacheDesc}>
              Anthropic кэширует части промпта на своей стороне. Помечаешь
              длинный system prompt — повторные запросы с тем же prefix
              стоят ~10% от обычной цены.
            </div>
            <div className={s.cacheCode}>{`await client.messages.create({
  model: 'claude-sonnet-4-6',
  system: [{
    type: 'text',
    text: longSystemPromptOrDocuments,
    cache_control: { type: 'ephemeral' }  // ← кэшировать этот блок
  }],
  messages: [{ role: 'user', content: userQuestion }],
});
// Повторные запросы с тем же prefix: цена ×0.1`}</div>
          </div>
        </div>
      </section>

      {/* ── 5. Model routing ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Model Router: умная экономия</SectionTitle>
        <p className={s.body}>
          Не все запросы одинаково сложны. &laquo;Привет&raquo; не требует
          Claude Opus. Роутер — это небольшая классифицирующая модель (или
          rule-based логика), которая решает: какая модель нужна для этого
          конкретного запроса.
        </p>

        <div className={s.routerDiagram}>
          <div className={s.routerInput}>
            <div className={s.routerInputLabel}>ЗАПРОС</div>
            <div className={s.routerInputExamples}>
              <div className={s.routerExample}>«Привет, как дела?»</div>
              <div className={s.routerExample}>«Объясни квантовую запутанность»</div>
              <div className={s.routerExample}>«Напиши бизнес-план на 10 стр.»</div>
            </div>
          </div>

          <div className={s.routerArrow}>→</div>

          <div className={s.routerBox}>
            <div className={s.routerBoxLabel}>ROUTER</div>
            <div className={s.routerBoxDesc}>complexity classifier</div>
          </div>

          <div className={s.routerArrow}>→</div>

          <div className={s.routerTargets}>
            <div className={s.routerTarget} style={{ borderColor: 'rgba(0,229,160,0.4)' }}>
              <div className={s.routerTargetName} style={{ color: '#00e5a0' }}>Simple</div>
              <div className={s.routerTargetModel}>Haiku / GPT-4o mini</div>
              <div className={s.routerTargetCost}>~$0.001/1K tok</div>
              <div className={s.routerTargetPct}>~70% запросов</div>
            </div>
            <div className={s.routerTarget} style={{ borderColor: 'rgba(77,184,255,0.3)' }}>
              <div className={s.routerTargetName} style={{ color: '#4db8ff' }}>Medium</div>
              <div className={s.routerTargetModel}>Sonnet / GPT-4o</div>
              <div className={s.routerTargetCost}>~$0.01/1K tok</div>
              <div className={s.routerTargetPct}>~25% запросов</div>
            </div>
            <div className={s.routerTarget} style={{ borderColor: 'rgba(240,192,64,0.3)' }}>
              <div className={s.routerTargetName} style={{ color: '#f0c040' }}>Complex</div>
              <div className={s.routerTargetModel}>Opus / o1</div>
              <div className={s.routerTargetCost}>~$0.075/1K tok</div>
              <div className={s.routerTargetPct}>~5% запросов</div>
            </div>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>РЕАЛЬНАЯ ЭКОНОМИЯ</div>
          <p className={s.calloutText}>
            Если 70% запросов простые (Haiku $0.001) и 30% сложные (Opus $0.075),
            средняя стоимость = 0.7×0.001 + 0.3×0.075 = <strong>$0.023</strong>.
            Без роутера (всё на Opus) = <strong>$0.075</strong>.
            Экономия — <strong>69%</strong>.
          </p>
        </div>
      </section>

      {/* ── 6. Evals ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Evals: тестирование LLM-систем</SectionTitle>
        <p className={s.body}>
          Изменил промпт — стало лучше или хуже? Без evals ответить невозможно.
          LLM eval — это тестирование, адаптированное под нестохастический
          характер языковых моделей.
        </p>

        <div className={s.evalPyramid}>
          <div className={s.evalLevel} style={{ borderColor: 'rgba(0,229,160,0.3)' }}>
            <div className={s.evalLevelName}>Unit eval</div>
            <div className={s.evalLevelDesc}>
              Детерминированные проверки: JSON валидный, ответ содержит ключевое слово,
              длина в диапазоне. Быстро, дёшево, автоматически.
            </div>
            <div className={s.evalLevelCost}>~$0 за запрос</div>
          </div>

          <div className={s.evalLevel} style={{ borderColor: 'rgba(77,184,255,0.3)' }}>
            <div className={s.evalLevelName}>LLM-as-Judge eval</div>
            <div className={s.evalLevelDesc}>
              GPT-4 / Claude оценивает ответ по критериям (точность, тон, полнота)
              и выставляет оценку 1-5. Масштабируется, коррелирует с человеческой
              оценкой ~0.7-0.8.
            </div>
            <div className={s.evalLevelCost}>~$0.001-0.01 за eval</div>
          </div>

          <div className={s.evalLevel} style={{ borderColor: 'rgba(240,192,64,0.3)' }}>
            <div className={s.evalLevelName}>Human eval</div>
            <div className={s.evalLevelDesc}>
              Люди оценивают ответы. Ground truth. Дорого, медленно — только
              для важных изменений или финальной валидации перед деплоем.
            </div>
            <div className={s.evalLevelCost}>~$0.5-5 за пример</div>
          </div>
        </div>

        <CodeHighlight lang="ts" filename="LLM-as-Judge: автоматическая оценка ответов" code={`async function evaluateAnswer(
  question: string,
  answer: string,
  groundTruth: string,
): Promise<{ score: number; reason: string }> {

  const evalPrompt = \`Оцени ответ по шкале 1-5.

Вопрос: \${question}
Эталонный ответ: \${groundTruth}
Оцениваемый ответ: \${answer}

Критерии:
- 5: Точный, полный, правильный тон
- 4: Правильный, незначительные упущения
- 3: В целом верный, но есть ошибки или неполнота
- 2: Частично верный, но существенные проблемы
- 1: Неверный или вводящий в заблуждение

Верни JSON: {"score": N, "reason": "..."}\`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',   // дешёвая модель для оценки
    max_tokens: 200,
    messages: [{ role: 'user', content: evalPrompt }],
  });

  return JSON.parse(response.content[0].text);
}

// Запуск на всём eval датасете:
const results = await Promise.all(
  evalDataset.map(({ question, answer, groundTruth }) =>
    evaluateAnswer(question, answer, groundTruth)
  )
);
const avgScore = results.reduce((a, r) => a + r.score, 0) / results.length;
console.log(\`Average score: \${avgScore.toFixed(2)}/5\`);`} />
      </section>

      {/* ── 7. Observability ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Observability: видеть что происходит</SectionTitle>
        <p className={s.body}>
          Дебажить LLM-приложение без observability — как чинить машину в темноте.
          Нужно видеть каждый вызов: что ушло, что вернулось, сколько стоило,
          где потерялась latency.
        </p>

        <div className={s.obsTools}>
          <div className={s.obsToolCard}>
            <div className={s.obsToolName}>LangSmith</div>
            <div className={s.obsToolDesc}>
              Родной инструмент LangChain. Автоматический трейсинг всех вызовов
              через LANGCHAIN_TRACING_V2=true. Dashboard с фильтрацией, eval
              datasets, regression testing.
            </div>
            <div className={s.obsToolFeature}>Лучший выбор если используешь LangChain/LangGraph</div>
          </div>

          <div className={s.obsToolCard}>
            <div className={s.obsToolName}>Langfuse</div>
            <div className={s.obsToolDesc}>
              Open-source альтернатива. Self-host или облако. SDK для Python/TS.
              Поддерживает любые LLM (не только LangChain). Prompt versioning,
              A/B testing, user sessions.
            </div>
            <div className={s.obsToolFeature}>Лучший выбор для нативных SDK без LangChain</div>
          </div>

          <div className={s.obsToolCard}>
            <div className={s.obsToolName}>Helicone</div>
            <div className={s.obsToolDesc}>
              Proxy-подход: подменяешь base_url на helicone.ai — всё логируется
              автоматически без изменений в коде. Cost tracking, rate limiting,
              caching в одном.
            </div>
            <div className={s.obsToolFeature}>Минимум кода — максимум функций</div>
          </div>
        </div>

        <CodeHighlight lang="ts" filename="Langfuse: ручной трейсинг любого LLM" code={`import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

async function answerQuestion(userId: string, question: string) {
  const trace = langfuse.trace({ name: 'qa-pipeline', userId });

  // Span для retrieval
  const retrieveSpan = trace.span({ name: 'retrieve-context' });
  const context = await vectorSearch(question);
  retrieveSpan.end({ output: { chunks: context.length } });

  // Generation span с полным промптом
  const genSpan = trace.span({ name: 'generate-answer' });
  const response = await anthropic.messages.create({ /* ... */ });
  genSpan.end({
    output: { answer: response.content[0].text },
    usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
  });

  // Добавить score (от пользователя или LLM-judge)
  trace.score({ name: 'user-feedback', value: 0.9 });

  await langfuse.flushAsync();
  return response;
}`} />
      </section>

      {/* ── 8. Structured output ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Structured Output: надёжный JSON</SectionTitle>
        <p className={s.body}>
          Если LLM должна вернуть JSON для обработки кодом — нельзя полагаться
          на промпт &laquo;верни JSON&raquo;. Иногда модель добавляет markdown,
          объяснение или текст до/после — и парсер падает.
        </p>

        <CodeHighlight lang="ts" filename="Zod + Anthropic: гарантированный структурированный ответ" code={`import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

// Определяем схему ответа
const ProductSchema = z.object({
  name:        z.string(),
  price:       z.number().positive(),
  category:    z.enum(['electronics', 'clothing', 'food']),
  inStock:     z.boolean(),
  description: z.string().max(200),
});

type Product = z.infer<typeof ProductSchema>;

async function extractProduct(text: string): Promise<Product> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    // tools + tool_choice = принудительный вызов инструмента = структурированный JSON
    tools: [{
      name: 'extract_product',
      description: 'Извлечь информацию о продукте',
      input_schema: {
        type: 'object',
        properties: {
          name:        { type: 'string' },
          price:       { type: 'number' },
          category:    { type: 'string', enum: ['electronics', 'clothing', 'food'] },
          inStock:     { type: 'boolean' },
          description: { type: 'string' },
        },
        required: ['name', 'price', 'category', 'inStock', 'description'],
      },
    }],
    tool_choice: { type: 'tool', name: 'extract_product' },
    messages: [{ role: 'user', content: text }],
  });

  const toolUse = response.content.find(c => c.type === 'tool_use');
  const raw = (toolUse as Anthropic.ToolUseBlock).input;

  // Validate with Zod
  return ProductSchema.parse(raw);
}`} />
      </section>

      {/* ── 9. Error handling ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Надёжность: обработка ошибок и retry</SectionTitle>
        <p className={s.body}>
          LLM API не идеален: бывают timeout'ы, rate limits, временные сбои.
          Правильная обработка ошибок — разница между приложением, которое
          падает, и тем, которое деградирует gracefully.
        </p>

        <CodeHighlight lang="ts" filename="Production-ready вызов с retry и fallback" code={`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  maxRetries: 3,      // Anthropic SDK делает retry автоматически
  timeout: 60_000,    // 60 секунд на полный ответ
});

async function callWithFallback(messages: Anthropic.MessageParam[]) {
  // Попытка 1: основная модель
  try {
    return await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages,
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      // 429 — подождать и попробовать снова (SDK уже ретраит, но можно добавить задержку)
      console.warn('Rate limited, trying fallback model');
    } else if (error instanceof Anthropic.APIStatusError && error.status >= 500) {
      // 5xx — сервер перегружен
      console.warn('Server error, trying fallback');
    } else {
      throw error; // 400 (bad request) — не ретраить, это баг
    }
  }

  // Попытка 2: fallback на более дешёвую/быструю модель
  try {
    return await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages,
    });
  } catch {
    // Graceful degradation — вернуть заглушку
    return { content: [{ text: 'Сервис временно недоступен. Попробуйте позже.' }] };
  }
}`} />

        <div className={s.errorTable}>
          <div className={s.errorHead}>
            <div className={s.errorHCell}>Код</div>
            <div className={s.errorHCell}>Причина</div>
            <div className={s.errorHCell}>Что делать</div>
          </div>
          {[
            ['400', 'Invalid request (баг в коде)', 'Не ретраить. Проверить промпт/параметры'],
            ['401', 'Invalid API key', 'Проверить env variables'],
            ['403', 'Access denied (нет доступа к модели)', 'Проверить права аккаунта'],
            ['429', 'Rate limit / quota exceeded', 'Exponential backoff. Проверить лимиты'],
            ['500', 'Internal server error', 'Ретраить с задержкой. Fallback'],
            ['503', 'Service overloaded', 'Ретраить. Рассмотреть другого провайдера'],
            ['timeout', 'Запрос слишком долгий', 'Увеличить timeout или уменьшить max_tokens'],
          ].map(([code, reason, action]) => (
            <div key={code} className={s.errorRow}>
              <div className={s.errorCode}>{code}</div>
              <div className={s.errorCell}>{reason}</div>
              <div className={s.errorCell}>{action}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Quiz ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
