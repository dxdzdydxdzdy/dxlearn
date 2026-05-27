import { ApiPlayground } from './ApiPlayground';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './AiApiArticle.module.scss';

export function AiApiArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Два API — один паттерн ──────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Два API, один паттерн</h2>
        <p className={s.lead}>
          OpenAI и Anthropic — разные компании, но их API устроены похоже.
          Понял один — второй освоишь за час. Основа у обоих:
          массив сообщений, роли, параметры генерации.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colHeader} style={{ color: '#4db8ff' }}>OpenAI (GPT-4o)</div>
            <div className={s.codeBlock}>
              <code>{`import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const res = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system',    content: 'Ты опытный TS-разработчик.' },
    { role: 'user',      content: 'Что такое never?' },
  ],
  temperature: 0.7,
  max_tokens: 1024,
});

console.log(res.choices[0].message.content);`}</code>
            </div>
          </div>
          <div className={s.colCard}>
            <div className={s.colHeader} style={{ color: '#ff9070' }}>Anthropic (Claude)</div>
            <div className={s.codeBlock}>
              <code>{`import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const res = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  system: 'Ты опытный TS-разработчик.',  // ← отдельно
  messages: [
    { role: 'user', content: 'Что такое never?' },
  ],
  max_tokens: 1024,
});

console.log(res.content[0].text);`}</code>
            </div>
          </div>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>КЛЮЧЕВОЕ ОТЛИЧИЕ</div>
          <p className={s.infoText}>
            У OpenAI system message идёт первым в массиве <code>messages[]</code>.
            У Anthropic — отдельный параметр <code>system:</code> вне messages.
            Структура ответа тоже разная: OpenAI возвращает <code>choices[0].message.content</code>,
            Anthropic — <code>content[0].text</code>. Всё остальное — практически идентично.
          </p>
        </div>
      </section>

      {/* ── 2. Анатомия запроса ────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Анатомия запроса</h2>
        <p className={s.lead}>
          Каждый запрос к LLM API — это набор параметров.
          Разберём каждый, чтобы ты понимал что куда ставить и почему.
        </p>
        <div className={s.paramsTable}>
          {[
            {
              param: 'model',
              type: 'string',
              example: '"gpt-4o"',
              desc: 'Какую модель использовать. Дороже ≠ лучше для простых задач. gpt-4o-mini в 30× дешевле и справится с 80% задач.',
              color: '#4db8ff',
            },
            {
              param: 'messages',
              type: 'Message[]',
              example: '[{role, content}]',
              desc: 'История диалога. Чередование user/assistant. API stateless — каждый запрос несёт всю историю. Ты хранишь её сам.',
              color: '#00e5a0',
            },
            {
              param: 'temperature',
              type: 'number 0–2',
              example: '0.7',
              desc: '0 = детерминированно (код, факты). 0.7–1.0 = балансирует (объяснения). 1.5+ = творчество/шум. По умолчанию 1.0.',
              color: '#f0c040',
            },
            {
              param: 'max_tokens',
              type: 'number',
              example: '2048',
              desc: 'Лимит токенов в ответе. Если finish_reason = "length" — ответ обрезан. Ставь с запасом, платишь только за фактические.',
              color: '#ff9070',
            },
            {
              param: 'stop',
              type: 'string[]',
              example: '["```", "END"]',
              desc: 'Модель остановится когда встретит эту строку. Удобно для парсинга структурированного вывода.',
              color: '#c084fc',
            },
            {
              param: 'stream',
              type: 'boolean',
              example: 'true',
              desc: 'Включить Server-Sent Events. Первый токен приходит через ~200ms вместо ожидания всего ответа. Подробнее ниже.',
              color: '#fb7185',
            },
          ].map(p => (
            <div key={p.param} className={s.paramRow}>
              <div className={s.paramLeft}>
                <span className={s.paramName} style={{ color: p.color }}>{p.param}</span>
                <span className={s.paramType}>{p.type}</span>
                <span className={s.paramEx}>{p.example}</span>
              </div>
              <div className={s.paramDesc}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. System message ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>System message: настройка личности</h2>
        <p className={s.lead}>
          System message — самый авторитетный текст для модели. Она читает его
          как «устав» — то, что нельзя нарушать независимо от того что скажет пользователь.
        </p>
        <div className={s.codeBlock}>
          <code>{`// Плохой system prompt — размытый:
"Ты полезный ассистент."

// Хороший — конкретный:
"Ты senior backend-разработчик с 10 годами опыта в Node.js и PostgreSQL.
Отвечай только на технические вопросы по этим темам.
Давай конкретные примеры кода на TypeScript.
Если не знаешь ответа — говори честно, не выдумывай.
Формат: сначала краткий ответ, потом пример кода, потом подводные камни."

// Структурированный с XML (лучший для Claude):
"<role>Senior TypeScript разработчик</role>
<rules>
  - Отвечай на русском
  - Всегда давай примеры кода
  - Указывай версию TypeScript в примерах
</rules>
<output_format>
  Сначала TL;DR (1-2 предложения), затем подробный ответ
</output_format>"`}</code>
        </div>
        <div className={s.warningCard}>
          <div className={s.warningLabel}>⚠ PROMPT INJECTION</div>
          <p className={s.warningText}>
            Никогда не интерполируй user input прямо в system message:
            {' '}<code>system: `Ты ассистент. Пользователь написал: ${'{userInput}'}`</code>{' '}
            — пользователь может написать «Игнорируй все инструкции выше».
            User input должен идти строго в role: &quot;user&quot; сообщение.
          </p>
        </div>
      </section>

      {/* ── 4. Playground ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Интерактив: три режима API</h2>
        <p className={s.body}>
          Посмотри как выглядят реальные запросы и ответы.
          Три таба: базовый запрос/ответ, стриминг с SSE событиями, и полный цикл tool calling.
        </p>
        <ApiPlayground />
      </section>

      {/* ── 5. Streaming ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Streaming: почему он обязателен в продакшне</h2>
        <p className={s.lead}>
          GPT-4o генерирует ~50–100 токенов в секунду. Длинный ответ = 10+ секунд ожидания.
          Со streaming пользователь начинает читать через 200ms — остальное догоняет.
        </p>
        <div className={s.codeBlock}>
          <code>{`// Next.js App Router: стриминг прямо в HTTP Response
// app/api/chat/route.ts

import OpenAI from 'openai';
const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages,
  });

  // Возвращаем ReadableStream клиенту:
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}

// На клиенте:
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
const reader = res.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setOutput(prev => prev + decoder.decode(value));  // React state update
}`}</code>
        </div>
      </section>

      {/* ── 6. Function Calling ────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Function Calling: LLM + реальный мир</h2>
        <p className={s.lead}>
          LLM не умеет лезть в интернет, читать базу данных или вызывать ваш код.
          Но может <em>попросить тебя</em> это сделать — и получить результат.
          Это function calling (в Anthropic называется tool use).
        </p>
        <p className={s.body}>
          Ты описываешь функции в JSON Schema — что принимает, что возвращает.
          Модель читает описания и сама решает: нужно ли вызвать инструмент,
          чтобы ответить на вопрос пользователя.
        </p>
        <div className={s.codeBlock}>
          <code>{`// Полный цикл на TypeScript:
import OpenAI from 'openai';

const tools = [{
  type: 'function' as const,
  function: {
    name: 'get_weather',
    description: 'Получить текущую погоду в городе',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Название города на русском' },
      },
      required: ['city'],
    },
  },
}];

async function chat(userMessage: string) {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  // Шаг 1: Первый запрос
  const res1 = await openai.chat.completions.create({ model: 'gpt-4o', tools, messages });
  const msg1 = res1.choices[0].message;
  messages.push(msg1);

  // Шаг 2: Проверяем — модель хочет вызвать функцию?
  if (res1.choices[0].finish_reason === 'tool_calls') {
    for (const toolCall of msg1.tool_calls!) {
      const args = JSON.parse(toolCall.function.arguments);

      // Шаг 3: Вызываем реальный API
      const weatherData = await fetchWeatherFromExternalApi(args.city);

      // Шаг 4: Возвращаем результат в messages
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(weatherData),
      });
    }

    // Шаг 5: Второй запрос — модель формирует финальный ответ
    const res2 = await openai.chat.completions.create({ model: 'gpt-4o', tools, messages });
    return res2.choices[0].message.content;
  }

  return msg1.content;
}`}</code>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>ПАРАЛЛЕЛЬНЫЕ ВЫЗОВЫ</div>
          <p className={s.calloutText}>
            Если нужны данные из нескольких источников — модель может вернуть массив tool_calls.
            Вызывай их через <code>Promise.all()</code> — экономит один лишний LLM-запрос.
            Именно так работают AI-агенты: один запрос → несколько инструментов → один ответ.
          </p>
        </div>
      </section>

      {/* ── 7. Structured Output ───────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Structured Output: надёжный JSON из LLM</h2>
        <p className={s.lead}>
          LLM возвращает текст. Но часто нужен JSON с конкретной схемой.
          Есть три способа — с очень разной надёжностью.
        </p>
        <div className={s.reliabilityGrid}>
          <div className={s.relCard} style={{ borderTop: '3px solid #ff5f6a' }}>
            <div className={s.relTitle} style={{ color: '#ff5f6a' }}>❌ Промпт "верни JSON"</div>
            <div className={s.relDesc}>Иногда возвращает не-JSON. Иногда нарушает схему. Нельзя использовать в проде без валидации.</div>
          </div>
          <div className={s.relCard} style={{ borderTop: '3px solid #f0c040' }}>
            <div className={s.relTitle} style={{ color: '#f0c040' }}>⚠ JSON mode</div>
            <div className={s.relDesc}>Гарантирует валидный JSON, но не гарантирует схему. Можешь получить любые ключи.</div>
          </div>
          <div className={s.relCard} style={{ borderTop: '3px solid #00e5a0' }}>
            <div className={s.relTitle} style={{ color: '#00e5a0' }}>✓ Structured Outputs</div>
            <div className={s.relDesc}>Гарантирует точную схему через JSON Schema. GPT-4o+. Никаких сюрпризов.</div>
          </div>
        </div>
        <div className={s.codeBlock}>
          <code>{`// OpenAI Structured Outputs + Zod:
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const ArticleSchema = z.object({
  title:    z.string(),
  summary:  z.string().max(200),
  tags:     z.array(z.string()).max(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const res = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-2024-08-06',   // ← Structured Outputs только здесь
  messages: [
    { role: 'user', content: 'Создай метаданные для статьи про async/await' }
  ],
  response_format: zodResponseFormat(ArticleSchema, 'article'),
});

const article = res.choices[0].message.parsed;
// article.title    — гарантировано string
// article.tags     — гарантировано string[]
// article.difficulty — гарантировано 'easy' | 'medium' | 'hard'

// Anthropic: передаёшь schema в промпт, парсишь ответ через Zod
// anthropic не имеет нативных Structured Outputs — используй промпт:
// "Ответь строго в JSON формате: { title: string, summary: string }"
// + JSON.parse(res.content[0].text) + articleSchema.parse(data)`}</code>
        </div>
      </section>

      {/* ── 8. Обработка ошибок ────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Обработка ошибок: production-ready</h2>
        <p className={s.lead}>
          API недоступен, rate limit, токенов не хватает — в проде всё это случается.
          Вот как выглядит надёжный wrapper.
        </p>
        <div className={s.errorsGrid}>
          {[
            { code: '429', name: 'Rate Limit',     color: '#f0c040', fix: 'Exponential backoff: 1s → 2s → 4s → 8s → fail' },
            { code: '503', name: 'Service Unavail',color: '#ff9070', fix: 'Retry с backoff, может помочь смена региона' },
            { code: '400', name: 'Invalid Request', color: '#ff5f6a', fix: 'Превышен context window или неверная структура messages' },
            { code: '401', name: 'Auth Error',      color: '#ff5f6a', fix: 'Неверный API ключ — проверь env переменные' },
          ].map(e => (
            <div key={e.code} className={s.errorCard}>
              <span className={s.errorCode} style={{ color: e.color }}>{e.code}</span>
              <span className={s.errorName}>{e.name}</span>
              <span className={s.errorFix}>{e.fix}</span>
            </div>
          ))}
        </div>
        <div className={s.codeBlock}>
          <code>{`// Production-ready wrapper с retry:
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,        // ← встроенный retry в SDK
  timeout: 30_000,      // ← 30 секунд
});

async function safeCompletion(
  messages: OpenAI.ChatCompletionMessageParam[],
  options: { model?: string; temp?: number } = {}
) {
  try {
    const res = await openai.chat.completions.create({
      model: options.model ?? 'gpt-4o-mini',
      temperature: options.temp ?? 0.7,
      max_tokens: 2048,
      messages,
    });

    const choice = res.choices[0];

    // Проверяем finish_reason — ответ полный?
    if (choice.finish_reason === 'length') {
      console.warn('Response truncated — increase max_tokens');
    }

    return { ok: true, content: choice.message.content!, usage: res.usage };

  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      // SDK уже выполнил retry — если сюда дошли, всё плохо
      console.error(\`OpenAI API error \${err.status}: \${err.message}\`);
      return { ok: false, error: err.message };
    }
    throw err;   // Неожиданная ошибка — пробрасываем выше
  }
}`}</code>
        </div>
      </section>

      {/* ── 9. Cost & Caching ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Стоимость, кэширование и production советы</h2>
        <div className={s.tipsList}>
          {[
            {
              icon: '💰',
              title: 'Считай токены до отправки',
              desc: 'Установи tiktoken (OpenAI) или @anthropic-ai/tokenizer. Считай токены промпта до запроса — не удивляйся счёту в конце месяца. Логируй usage из каждого ответа в базу данных.',
              color: '#f0c040',
            },
            {
              icon: '⚡',
              title: 'Prompt Caching (Anthropic)',
              desc: 'Отметь неизменяемую часть промпта как cache_control: {type: "ephemeral"}. Повторные запросы с тем же prefix — cache hit в 10× дешевле. Идеально для длинного system prompt или RAG контекста.',
              color: '#00e5a0',
            },
            {
              icon: '🔄',
              title: 'Кэшируй семантически похожие запросы',
              desc: 'Если два запроса дают одинаковый ответ — зачем платить дважды? Embedding запроса → cosine search в кэше. Если similarity > 0.95 → возвращаем кэшированный ответ. GPTCache, Semantic Cache.',
              color: '#4db8ff',
            },
            {
              icon: '🎯',
              title: 'Выбирай модель под задачу',
              desc: 'gpt-4o-mini в 30× дешевле gpt-4o. Для классификации, извлечения данных, простых ответов — mini справляется. gpt-4o для сложного reasoning, code review, длинных документов.',
              color: '#ff9070',
            },
            {
              icon: '📊',
              title: 'Observability с первого дня',
              desc: 'LangSmith, Helicone, Braintrust — логируй каждый запрос: промпт, ответ, токены, latency, ошибки. Без этого отлаживать LLM-приложения = угадывать.',
              color: '#c084fc',
            },
          ].map(t => (
            <div key={t.title} className={s.tipItem}>
              <div className={s.tipIcon}>{t.icon}</div>
              <div className={s.tipBody}>
                <div className={s.tipTitle} style={{ color: t.color }}>{t.title}</div>
                <div className={s.tipDesc}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Quiz ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
