import { AgentPlayground } from './AgentPlayground';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './AiAgentsArticle.module.scss';

export function AiAgentsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое агент ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Агент = LLM + инструменты + цикл</h2>
        <p className={s.lead}>
          Обычный LLM-запрос — это функция: один вход, один выход, без состояния.
          Агент — это <strong>цикл</strong>: модель решает что делать, вызывает инструменты,
          смотрит на результаты, решает снова, пока цель не достигнута.
        </p>
        <div className={s.anatomyGrid}>
          {[
            { icon: '🧠', name: 'LLM',        color: '#4db8ff', desc: 'Мозг агента. Рассуждает, планирует, решает какой инструмент вызвать.' },
            { icon: '🔧', name: 'Tools',       color: '#f0c040', desc: 'Инструменты: поиск, код, API, файлы, базы данных, браузер.' },
            { icon: '💾', name: 'Memory',      color: '#ff9070', desc: 'Состояние: история диалога, результаты инструментов, факты из прошлого.' },
            { icon: '🔄', name: 'Loop',        color: '#00e5a0', desc: 'Цикл: итерирует до достижения цели или лимита шагов.' },
          ].map(c => (
            <div key={c.name} className={s.anatomyCard} style={{ borderTop: `3px solid ${c.color}` }}>
              <div className={s.anatomyIcon}>{c.icon}</div>
              <div className={s.anatomyName} style={{ color: c.color }}>{c.name}</div>
              <div className={s.anatomyDesc}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div className={s.codeBlock}>
          <code>{`// Простейший агентский цикл (псевдокод):
const messages = [{ role: 'system', content: systemPrompt }];
messages.push({ role: 'user', content: userQuery });

for (let i = 0; i < MAX_ITERATIONS; i++) {
  const response = await llm.complete({ messages, tools });

  if (response.finish_reason === 'stop') {
    return response.content;  // Финальный ответ
  }

  if (response.finish_reason === 'tool_calls') {
    // Выполняем все tool calls (могут быть параллельными)
    const toolResults = await Promise.all(
      response.tool_calls.map(tc => executeTool(tc.name, tc.args))
    );

    // Добавляем в историю: ответ модели + результаты инструментов
    messages.push(response);
    messages.push(...toolResults.map(r => ({
      role: 'tool', tool_call_id: r.id, content: r.result,
    })));
    // ↑ Цикл продолжается: модель видит результаты и решает дальше
  }
}
throw new Error('Max iterations reached');`}</code>
        </div>
      </section>

      {/* ── 2. Tool Calling ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Tool Calling: как это работает</h2>
        <p className={s.lead}>
          Модель не «вызывает» функцию напрямую — она генерирует структурированный JSON
          с именем инструмента и аргументами. Твой код читает этот JSON, вызывает
          реальную функцию и возвращает результат модели.
        </p>
        <div className={s.toolFlow}>
          {[
            {
              n: '1', name: 'Define Schema',
              color: '#4db8ff',
              desc: 'Описываешь инструмент: имя, параметры, типы. Модель видит это в контексте.',
            },
            {
              n: '2', name: 'Model Decides',
              color: '#f0c040',
              desc: 'Модель решает: нужен инструмент или нет? Если да — возвращает tool_call JSON.',
            },
            {
              n: '3', name: 'App Executes',
              color: '#ff9070',
              desc: 'Твой код вызывает реальную функцию с параметрами из model output.',
            },
            {
              n: '4', name: 'Result Back',
              color: '#00e5a0',
              desc: 'Результат добавляется в messages. Модель получает данные и продолжает.',
            },
          ].map(step => (
            <div key={step.n} className={s.toolFlowStep}>
              <div className={s.toolFlowNum} style={{ color: step.color }}>{step.n}</div>
              <div className={s.toolFlowName}>{step.name}</div>
              <div className={s.toolFlowDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
        <div className={s.codeBlock}>
          <code>{`// Шаг 1: Определяем tool schema (формат OpenAI)
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Получить актуальную погоду для города',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'Название города, например "Москва"',
          },
          units: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            default: 'celsius',
          },
        },
        required: ['city'],
      },
    },
  },
];

// Шаг 2: Запрос к модели
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Какая погода в Токио?' }],
  tools,
  tool_choice: 'auto',  // сама решает когда вызывать
});

// Шаг 3: Если модель решила вызвать инструмент:
// response.choices[0].message.tool_calls = [
//   { id: 'call_xyz', function: { name: 'get_weather',
//     arguments: '{"city":"Токио","units":"celsius"}' } }
// ]

// Шаг 4: Выполняем и возвращаем результат
if (response.choices[0].finish_reason === 'tool_calls') {
  const call = response.choices[0].message.tool_calls[0];
  const args = JSON.parse(call.function.arguments);
  const result = await getWeather(args.city, args.units);

  // Передаём результат обратно модели
  const finalResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'user',      content: 'Какая погода в Токио?' },
      response.choices[0].message,           // ответ модели с tool_call
      { role: 'tool', tool_call_id: call.id,
        content: JSON.stringify(result) },   // результат инструмента
    ],
    tools,
  });
}`}</code>
        </div>
      </section>

      {/* ── 3. ReAct паттерн ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>ReAct: Reasoning + Acting</h2>
        <p className={s.lead}>
          ReAct (Yao et al., 2022) — это не фреймворк, а паттерн.
          Перед каждым действием модель явно рассуждает: <strong>Thought</strong>.
          Затем вызывает инструмент: <strong>Action</strong>.
          Получает результат: <strong>Observation</strong>. И снова думает.
          Этот цикл делает агента объяснимым и значительно точнее чем просто tool calling.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#ff5f6a' }}>Без ReAct (просто tool calling)</div>
            <div className={s.codeBlock}>
              <code>{`User: Найди столицу Австралии

// Модель напрямую → action:
get_info("столица Австралии")

// Observation: "Канберра"

// Ответ: Канберра

// Проблема: нет рассуждения —
// модель не объясняет почему
// выбрала именно этот инструмент
// и с этими параметрами`}</code>
            </div>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#00e5a0' }}>С ReAct</div>
            <div className={s.codeBlock}>
              <code>{`User: Найди столицу Австралии

Thought: Многие думают что это
  Сидней, но это неверно. Лучше
  проверю через поиск.

Action: search("столица Австралии")

Observation: "Канберра, основана
  в 1913 году как компромисс
  между Сиднеем и Мельбурном"

Thought: Подтверждено — Канберра.
  Могу дать полный ответ.

Answer: Канберра (не Сидней!)`}</code>
            </div>
          </div>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>ПОЧЕМУ THOUGHT ШАГИ УЛУЧШАЮТ КАЧЕСТВО</div>
          <p className={s.calloutText}>
            Промежуточные рассуждения — это Chain-of-Thought для агентов.
            Каждый следующий токен обусловлен правильными предыдущими.
            Модель "видит" своё рассуждение и реже совершает ошибки при выборе инструмента.
            Для Claude используй <code>&lt;thinking&gt;</code> теги,
            для OpenAI o1/o3 — встроенный scratchpad.
          </p>
        </div>
      </section>

      {/* ── 4. Agent Playground ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Интерактив: смотри ReAct в действии</h2>
        <p className={s.body}>
          Выбери вопрос и нажми <strong>Запустить агента</strong>.
          Третий запрос самый интересный — два последовательных tool call
          и коррекция распространённого заблуждения.
        </p>
        <AgentPlayground />
      </section>

      {/* ── 5. Виды памяти ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Виды памяти агента</h2>
        <p className={s.lead}>
          Агент без памяти — это Гай Пирс из «Помни»: каждый раз с нуля.
          Вот четыре типа памяти от самой простой к самой сложной.
        </p>
        <div className={s.memoryGrid}>
          {[
            {
              name: 'In-context (рабочая)',
              color: '#4db8ff',
              icon: '💬',
              how: 'Массив messages: вся история текущей сессии передаётся при каждом запросе.',
              limit: '⚠ Ограничена размером контекстного окна. Старые сообщения теряются.',
            },
            {
              name: 'External (внешняя)',
              color: '#f0c040',
              icon: '🗄️',
              how: 'База данных или Vector Store. Агент сохраняет/читает через инструменты save_memory() и recall().',
              limit: '⚠ Требует явного инструментирования. Нужна стратегия что запоминать.',
            },
            {
              name: 'Episodic (эпизодическая)',
              color: '#ff9070',
              icon: '📖',
              how: 'Суммаризованные прошлые сессии в векторной базе. Поиск по семантике: "что я знаю об этом пользователе?"',
              limit: '⚠ Качество зависит от суммаризации. Может накапливать устаревшие факты.',
            },
            {
              name: 'Semantic (семантическая)',
              color: '#00e5a0',
              icon: '🧩',
              how: 'RAG по базе знаний: документы, факты, инструкции. Агент сам решает когда искать.',
              limit: '⚠ Качество retrieval критично. Неверно найденный факт хуже чем отсутствие факта.',
            },
          ].map(m => (
            <div key={m.name} className={s.memoryCard} style={{ borderTop: `3px solid ${m.color}` }}>
              <div className={s.memoryName}>
                <span style={{ marginRight: '8px' }}>{m.icon}</span>
                <span style={{ color: m.color }}>{m.name}</span>
              </div>
              <div className={s.memoryHow}>{m.how}</div>
              <div className={s.memoryLimit}>{m.limit}</div>
            </div>
          ))}
        </div>
        <div className={s.codeBlock}>
          <code>{`// Паттерн: суммаризация при переполнении контекста
async function manageContext(messages: Message[]): Promise<Message[]> {
  const totalTokens = countTokens(messages);

  if (totalTokens < MAX_CONTEXT * 0.8) return messages;

  // Суммируем старые сообщения
  const [system, ...history] = messages;
  const toSummarize = history.slice(0, -10);  // кроме последних 10
  const recent = history.slice(-10);

  const summary = await llm.complete({
    messages: [
      { role: 'system', content: 'Кратко суммируй диалог, сохраняя ключевые факты' },
      ...toSummarize,
    ],
  });

  return [
    system,
    { role: 'assistant', content: \`[Предыдущий контекст]: \${summary}\` },
    ...recent,
  ];
}`}</code>
        </div>
      </section>

      {/* ── 6. Multi-agent ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Multi-agent: оркестратор и субагенты</h2>
        <p className={s.lead}>
          Один агент хорош для одной задачи. Для сложных проектов —
          система агентов: оркестратор разбивает задачу и делегирует
          специализированным субагентам.
        </p>
        <div className={s.multiAgentDiagram}>
          <div className={s.orchestratorBox}>
            <div className={s.orchestratorLabel}>🎯 Оркестратор</div>
            <div className={s.orchestratorModel}>GPT-4o / Claude Opus — планирует, координирует, собирает результаты</div>
          </div>
          <div style={{ color: '#3d5562', fontSize: '1.2rem' }}>↓ handoff ↓</div>
          <div className={s.subagentRow}>
            {[
              { icon: '🔍', name: 'Search Agent', model: 'Haiku / mini' },
              { icon: '💻', name: 'Code Agent',   model: 'Sonnet / 4o' },
              { icon: '📊', name: 'Data Agent',   model: 'Haiku / mini' },
              { icon: '✍️', name: 'Writer Agent', model: 'Opus / 4o' },
            ].map(a => (
              <div key={a.name} className={s.subagentBox}>
                <span className={s.subagentIcon}>{a.icon}</span>
                <div className={s.subagentName}>{a.name}</div>
                <div className={s.subagentModel}>{a.model}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.codeBlock}>
          <code>{`// OpenAI Swarm — простейший multi-agent
import Swarm from 'openai-swarm';

const client = new Swarm();

// Специализированные агенты
const searchAgent = {
  name: 'Search Agent',
  instructions: 'Ты специалист по веб-поиску. Ищи информацию, возвращай факты.',
  tools: [searchWebTool],
};

const writerAgent = {
  name: 'Writer Agent',
  instructions: 'Ты редактор. Получаешь факты и пишешь структурированный отчёт.',
  tools: [],
};

// Оркестратор передаёт управление
const orchestrator = {
  name: 'Orchestrator',
  instructions: 'Сначала собери информацию через Search Agent, потом передай Writer Agent.',
  tools: [
    {
      name: 'transfer_to_search',
      function: () => searchAgent,   // handoff!
    },
    {
      name: 'transfer_to_writer',
      function: () => writerAgent,
    },
  ],
};

const result = await client.run({
  agent: orchestrator,
  messages: [{ role: 'user', content: 'Напиши отчёт про рынок AI в 2024' }],
});`}</code>
        </div>
      </section>

      {/* ── 7. Когда использовать агентов ───────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Агент vs цепочка vs простой промпт</h2>
        <p className={s.body}>
          Агенты — не серебряная пуля. Они дороже, медленнее и менее предсказуемы.
          Используй самый простой подход который решает задачу.
        </p>
        <div className={s.decisionTable}>
          <div className={s.decisionHead}>
            <div className={s.decisionHCell}>СЦЕНАРИЙ</div>
            <div className={s.decisionHCell}>ПРОМПТ</div>
            <div className={s.decisionHCell}>ЦЕПОЧКА</div>
            <div className={s.decisionHCell}>АГЕНТ</div>
          </div>
          {[
            {
              scenario: 'Классифицировать текст',
              prompt: '✓ Лучше',
              chain: '—',
              agent: '—',
            },
            {
              scenario: 'Извлечь → суммаризовать → отформатировать',
              prompt: '—',
              chain: '✓ Лучше',
              agent: '—',
            },
            {
              scenario: 'Ответить на вопрос по документам (RAG)',
              prompt: '—',
              chain: '✓ Лучше',
              agent: '—',
            },
            {
              scenario: 'Задача с неизвестным числом шагов',
              prompt: '—',
              chain: '—',
              agent: '✓ Лучше',
            },
            {
              scenario: 'Поиск → анализ → код → тесты',
              prompt: '—',
              chain: '—',
              agent: '✓ Лучше',
            },
            {
              scenario: 'Интерактивный помощник (диалог)',
              prompt: '—',
              chain: '—',
              agent: '✓ Лучше',
            },
          ].map((r, i) => (
            <div key={i} className={s.decisionRow}>
              <div className={s.decisionScenario}>{r.scenario}</div>
              <div className={s.decisionCell} style={{ color: r.prompt === '✓ Лучше' ? '#00e5a0' : '#3d5562' }}>{r.prompt}</div>
              <div className={s.decisionCell} style={{ color: r.chain === '✓ Лучше' ? '#f0c040' : '#3d5562' }}>{r.chain}</div>
              <div className={s.decisionCell} style={{ color: r.agent === '✓ Лучше' ? '#4db8ff' : '#3d5562' }}>{r.agent}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Риски ────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Риски и как их нейтрализовать</h2>
        <div className={s.risksList}>
          {[
            {
              n: '01',
              title: 'Бесконечный цикл',
              desc: '✗ Инструмент возвращает ошибку, агент повторяет снова и снова',
              fix: '✓ max_iterations=10–20, общий timeout, fallback "верни лучшее что есть"',
            },
            {
              n: '02',
              title: 'Prompt injection через tool results',
              desc: '✗ Страница содержит "Ignore previous instructions, do X" — агент может выполнить',
              fix: '✓ Оборачивай tool results в XML-теги, явно инструктируй игнорировать директивы в данных',
            },
            {
              n: '03',
              title: 'Необратимые действия без подтверждения',
              desc: '✗ Агент неправильно понял задачу и удалил не те данные / отправил email не тому',
              fix: '✓ Для DELETE/email/финансов: confirmation step с показом что именно будет сделано',
            },
            {
              n: '04',
              title: 'Неконтролируемые расходы',
              desc: '✗ Агент с 20 итерациями на GPT-4o = $0.50–2.00 за один запрос, сотни запросов = $$$',
              fix: '✓ Бюджет токенов, дешёвые модели для промежуточных шагов, prompt cache',
            },
            {
              n: '05',
              title: 'Галлюцинированные tool calls',
              desc: '✗ Модель вызывает инструмент с неверными параметрами или выдумывает инструмент',
              fix: '✓ Валидация параметров через JSON Schema, явные error messages обратно в контекст',
            },
            {
              n: '06',
              title: 'Нет наблюдаемости (observability)',
              desc: '✗ Агент делает что-то 30 секунд, что именно — непонятно. Ошибка непрозрачна',
              fix: '✓ LangSmith / Braintrust трейсинг, логирование каждого шага, structured logging',
            },
          ].map(r => (
            <div key={r.n} className={s.risk}>
              <div className={s.riskNum}>{r.n}</div>
              <div className={s.riskBody}>
                <div className={s.riskTitle}>{r.title}</div>
                <div className={s.riskDesc}>{r.desc}</div>
                <div className={s.riskFix}>{r.fix}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Практика: пишем агента ───────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Практика: агент с инструментами на TypeScript</h2>
        <p className={s.body}>
          Минимальный production-ready агент: валидация параметров, обработка ошибок,
          ограничение итераций. Копируй и дорабатывай под свою задачу.
        </p>
        <div className={s.codeBlock}>
          <code>{`import OpenAI from 'openai';
import { z } from 'zod';

const client = new OpenAI();

// ── Инструменты ──────────────────────────────────────────

const WeatherSchema = z.object({ city: z.string() });
const CalcSchema    = z.object({ expression: z.string() });

async function getWeather(args: unknown) {
  const { city } = WeatherSchema.parse(args);
  // TODO: вызов реального weather API
  return { city, temp_c: 12, conditions: 'облачно' };
}

async function calculate(args: unknown) {
  const { expression } = CalcSchema.parse(args);
  // Безопасное вычисление (не eval!)
  return { result: Function('"use strict"; return (' + expression + ')')() };
}

const TOOLS: Record<string, (a: unknown) => Promise<unknown>> = {
  get_weather: getWeather,
  calculate:   calculate,
};

// ── Tool schemas для OpenAI API ───────────────────────────

const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Получить погоду для города',
      parameters: {
        type: 'object',
        properties: { city: { type: 'string' } },
        required: ['city'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'calculate',
      description: 'Вычислить математическое выражение',
      parameters: {
        type: 'object',
        properties: { expression: { type: 'string' } },
        required: ['expression'],
      },
    },
  },
];

// ── Основной цикл агента ──────────────────────────────────

const MAX_ITERATIONS = 10;

export async function runAgent(userMessage: string): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'Ты полезный ассистент. Используй инструменты для получения актуальных данных.',
    },
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    // Финальный ответ
    if (response.choices[0].finish_reason === 'stop') {
      return msg.content ?? '';
    }

    // Выполняем tool calls (параллельно если несколько)
    if (msg.tool_calls?.length) {
      const results = await Promise.all(
        msg.tool_calls.map(async (tc) => {
          try {
            const args = JSON.parse(tc.function.arguments);
            const fn = TOOLS[tc.function.name];
            if (!fn) throw new Error('Unknown tool: ' + tc.function.name);
            const result = await fn(args);
            return { id: tc.id, result: JSON.stringify(result) };
          } catch (err) {
            return { id: tc.id, result: 'Error: ' + String(err) };
          }
        })
      );

      messages.push(...results.map(r => ({
        role: 'tool' as const,
        tool_call_id: r.id,
        content: r.result,
      })));
    }
  }

  return 'Достигнут лимит итераций. Последний известный результат: ' +
    messages.findLast(m => m.role === 'assistant')?.content ?? '';
}`}</code>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ФРЕЙМВОРКИ</div>
          <p className={s.infoText}>
            <strong>LangChain:</strong> самый популярный, богатая экосистема инструментов, агентов и интеграций.{' '}
            <strong>LangGraph:</strong> граф состояний для сложных multi-agent систем с циклами.{' '}
            <strong>OpenAI Swarm:</strong> минималистичный handoff-паттерн, experimental.{' '}
            <strong>AutoGen:</strong> Microsoft, акцент на group chat агентов.{' '}
            <strong>CrewAI:</strong> role-based команды агентов, хорош для research workflows.
            Для старта: просто <code>openai</code> пакет + собственный цикл — проще отлаживать.
          </p>
        </div>
      </section>

      {/* ── 10. Quiz ──────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
