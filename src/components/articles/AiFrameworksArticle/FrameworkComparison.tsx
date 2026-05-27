'use client';

import { useState } from 'react';
import s from './FrameworkComparison.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type Approach = 'native' | 'langchain' | 'llamaindex';

interface TaskConfig {
  id: string;
  label: string;
  icon: string;
  desc: string;
  versions: Record<Approach, { code: string; verdict: string; score: number; why: string }>;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

const TASKS: TaskConfig[] = [
  {
    id: 'simple-chat',
    label: 'Простой чат',
    icon: '💬',
    desc: 'Отправить сообщение и получить ответ',
    versions: {
      native: {
        score: 5,
        verdict: '✅ Идеально',
        why: '10 строк кода, нет зависимостей, легко дебажить',
        code: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const response = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Привет!' }],
});

console.log(response.content[0].text);`,
      },
      langchain: {
        score: 2,
        verdict: '⚠️ Лишнее',
        why: 'Фреймворк добавляет абстракции для задачи, которая не нуждается в них',
        code: `import { ChatAnthropic } from '@langchain/anthropic';

const model = new ChatAnthropic({
  model: 'claude-opus-4-7',
  maxTokens: 1024,
});

const response = await model.invoke('Привет!');
console.log(response.content);

// Зачем это, если можно нативно?
// +300 КБ зависимостей ради invoke()`,
      },
      llamaindex: {
        score: 1,
        verdict: '❌ Не по назначению',
        why: 'LlamaIndex создан для работы с документами, не для простого чата',
        code: `// LlamaIndex вообще не для этого
// Его сила — поиск по документам

// Если нужен просто чат → native SDK
// Если чат по документам → LlamaIndex
// Если чат + инструменты → LangChain`,
      },
    },
  },
  {
    id: 'rag',
    label: 'RAG по документам',
    icon: '📚',
    desc: 'Вопросы к корпусу PDF/текстовых файлов',
    versions: {
      native: {
        score: 3,
        verdict: '🔧 Можно, но трудозатратно',
        why: 'Придётся самому реализовать chunking, embedding, поиск, сборку промпта',
        code: `// Нативно — много ручной работы:

// 1. Прочитать и разбить документ на чанки
const chunks = splitIntoChunks(document, 512);

// 2. Создать эмбеддинги для каждого чанка
const embeddings = await Promise.all(
  chunks.map(c => embed(c))
);

// 3. Найти похожие через cosine similarity
const relevant = findTopK(queryEmbedding, embeddings, 5);

// 4. Собрать промпт вручную
const prompt = \`Context: \${relevant.join('\\n')}
Question: \${query}\`;

// 5. Вызвать LLM
const answer = await llm(prompt);
// ~80 строк кода, которые LlamaIndex делает в 5`,
      },
      langchain: {
        score: 4,
        verdict: '✅ Хорошо',
        why: 'Есть загрузчики, сплиттеры, векторные стора — всё склеено',
        code: `import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';

// Загрузка и чанкинг
const loader = new PDFLoader('doc.pdf');
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512 });
const chunks = await splitter.splitDocuments(docs);

// Индексирование
const vectorStore = await MemoryVectorStore.fromDocuments(
  chunks, new OpenAIEmbeddings()
);

// RAG цепочка
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
const result = await chain.invoke({ query: 'Что такое...?' });`,
      },
      llamaindex: {
        score: 5,
        verdict: '✅ Лучший выбор',
        why: 'Создан именно для этого: богатый chunking, node relationships, query modes',
        code: `import { SimpleDirectoryReader } from 'llamaindex';
import { VectorStoreIndex } from 'llamaindex';

// Загрузить все документы из папки
const reader = new SimpleDirectoryReader();
const documents = await reader.loadData('./docs');

// Построить индекс (чанкинг + эмбеддинги автоматически)
const index = await VectorStoreIndex.fromDocuments(documents);

// Создать query engine
const queryEngine = index.asQueryEngine();

// Задать вопрос
const response = await queryEngine.query({
  query: 'Какие условия возврата?',
});

console.log(response.toString());
// Готово — 8 строк!`,
      },
    },
  },
  {
    id: 'agent',
    label: 'Агент с инструментами',
    icon: '🤖',
    desc: 'LLM вызывает внешние API, калькулятор, поиск',
    versions: {
      native: {
        score: 3,
        verdict: '🔧 Реализуемо',
        why: 'Tool calling есть в нативном SDK, но цикл ReAct придётся писать руками',
        code: `// Нативный tool calling (Anthropic SDK):

const tools = [{
  name: 'search_web',
  description: 'Поиск информации в интернете',
  input_schema: {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query'],
  },
}];

// Цикл ReAct — писать вручную:
while (true) {
  const response = await client.messages.create({
    model: 'claude-opus-4-7', tools, messages,
  });
  if (response.stop_reason === 'end_turn') break;
  // Обработать tool_use, добавить результат...
  // ~60 строк цикла
}`,
      },
      langchain: {
        score: 5,
        verdict: '✅ Лучший выбор',
        why: 'AgentExecutor, инструменты, память, LangGraph для сложных агентов — всё есть',
        code: `import { createReactAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { Calculator } from '@langchain/community/tools/calculator';

// Набор инструментов
const tools = [
  new TavilySearchResults(),
  new Calculator(),
];

// Создать агента
const agent = await createReactAgent({ llm: model, tools, prompt });
const executor = new AgentExecutor({ agent, tools, verbose: true });

// Запустить
const result = await executor.invoke({
  input: 'Какой курс EUR/USD сейчас? Пересчитай 500 EUR в USD',
});`,
      },
      llamaindex: {
        score: 3,
        verdict: '⚠️ Есть, но не фокус',
        why: 'ReActAgent в LlamaIndex есть, но экосистема инструментов у LangChain богаче',
        code: `import { ReActAgent } from 'llamaindex';
import { FunctionTool } from 'llamaindex';

// Определить инструмент
const searchTool = FunctionTool.from(
  ({ query }: { query: string }) => search(query),
  {
    name: 'search',
    description: 'Поиск в интернете',
    parameters: { /* JSON Schema */ },
  }
);

// Создать агента
const agent = new ReActAgent({ tools: [searchTool], llm });
const response = await agent.chat({ message: 'Найди...' });

// Работает, но выбор инструментов меньше чем в LangChain`,
      },
    },
  },
];

// ── Score dots ────────────────────────────────────────────────────────────────

function ScoreDots({ score }: { score: number }) {
  return (
    <div className={s.scoreDots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${s.dot} ${i <= score ? s.dotFilled : ''}`} />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const APPROACH_META: Record<Approach, { label: string; color: string }> = {
  native:     { label: 'Нативный SDK',  color: '#f0c040' },
  langchain:  { label: 'LangChain',     color: '#4db8ff' },
  llamaindex: { label: 'LlamaIndex',    color: '#00e5a0' },
};

export function FrameworkComparison() {
  const [taskIdx,    setTaskIdx]    = useState(0);
  const [approach,   setApproach]   = useState<Approach>('llamaindex');

  const task = TASKS[taskIdx];
  const version = task.versions[approach];

  return (
    <div className={s.widget}>

      {/* Header */}
      <div className={s.header}>
        <span className={s.title}>Framework Chooser</span>
        <span className={s.subtitle}>выбери задачу и сравни подходы</span>
      </div>

      <div className={s.body}>

        {/* Left: task + approach selectors */}
        <div className={s.left}>

          {/* Task selector */}
          <div className={s.selectorBlock}>
            <div className={s.selectorLabel}>ЗАДАЧА</div>
            <div className={s.taskList}>
              {TASKS.map((t, i) => (
                <button
                  key={t.id}
                  className={`${s.taskBtn} ${taskIdx === i ? s.taskBtnOn : ''}`}
                  onClick={() => setTaskIdx(i)}
                >
                  <span className={s.taskIcon}>{t.icon}</span>
                  <div>
                    <div className={s.taskName}>{t.label}</div>
                    <div className={s.taskDesc}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Approach selector */}
          <div className={s.selectorBlock}>
            <div className={s.selectorLabel}>ПОДХОД</div>
            <div className={s.approachList}>
              {(Object.keys(APPROACH_META) as Approach[]).map((ap) => {
                const meta = APPROACH_META[ap];
                const v = task.versions[ap];
                return (
                  <button
                    key={ap}
                    className={`${s.approachBtn} ${approach === ap ? s.approachBtnOn : ''}`}
                    style={approach === ap ? { borderColor: meta.color } : {}}
                    onClick={() => setApproach(ap)}
                  >
                    <div className={s.approachTop}>
                      <span className={s.approachName} style={approach === ap ? { color: meta.color } : {}}>
                        {meta.label}
                      </span>
                      <ScoreDots score={v.score} />
                    </div>
                    <div className={s.approachVerdict}>{v.verdict}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: code + explanation */}
        <div className={s.right}>
          <div className={s.whyCard}>
            <div className={s.whyIcon}>💡</div>
            <div className={s.whyText}>{version.why}</div>
          </div>

          <div className={s.codePane}>
            <div className={s.codePaneHeader}>
              <span className={s.codeLang}>typescript</span>
              <span
                className={s.codeLabel}
                style={{ color: APPROACH_META[approach].color }}
              >
                {APPROACH_META[approach].label}
              </span>
            </div>
            <pre className={s.code}>
              <code>{version.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
