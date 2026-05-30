import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { FrameworkComparison } from './FrameworkComparison';
import { QUIZ_QUESTIONS } from './quizData';
import s from './AiFrameworksArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function AiFrameworksArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем вообще фреймворки ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Зачем нужны фреймворки</SectionTitle>
        <p className={s.lead}>
          Когда ты впервые работаешь с LLM — достаточно нативного SDK:
          создал клиент, отправил сообщение, получил ответ. Но по мере роста
          приложения возникают повторяющиеся задачи: загрузить документы,
          разбить на чанки, сохранить в векторную базу, достать при запросе,
          собрать промпт, вызвать модель. Писать это с нуля каждый раз — потеря
          времени. Фреймворки — это{' '}
          <strong>готовые строительные блоки</strong> для типичных LLM-паттернов.
        </p>
        <p className={s.body}>
          Но у фреймворков есть обратная сторона: они добавляют{' '}
          <strong>абстракции</strong>. Когда всё работает — удобно. Когда что-то
          идёт не так — трудно понять, что именно происходит внутри. Поэтому
          ключевой вопрос не «какой фреймворк выбрать», а{' '}
          <strong>«нужен ли фреймворк вообще»</strong>.
        </p>

        <div className={s.threeChoices}>
          <div className={s.choiceCard}>
            <div className={s.choiceIcon}>📦</div>
            <div className={s.choiceName}>Нативный SDK</div>
            <p className={s.choiceDesc}>
              <code>openai</code>, <code>@anthropic-ai/sdk</code> — прямые вызовы API.
              Максимальный контроль, минимум зависимостей. Для простых задач это лучший выбор.
            </p>
            <div className={s.choiceWhen}>
              <span className={s.choiceWhenLabel}>Когда:</span> простой чат, один LLM-вызов, стриминг
            </div>
          </div>

          <div className={s.choiceCard}>
            <div className={s.choiceIcon}>🔗</div>
            <div className={s.choiceName}>LangChain</div>
            <p className={s.choiceDesc}>
              Оркестратор: соединяет LLM, инструменты, память, ретриверы в цепочки.
              Огромная экосистема интеграций. Для агентов — лучший выбор.
            </p>
            <div className={s.choiceWhen}>
              <span className={s.choiceWhenLabel}>Когда:</span> агенты, tool calling, сложные цепочки
            </div>
          </div>

          <div className={s.choiceCard}>
            <div className={s.choiceIcon}>🦙</div>
            <div className={s.choiceName}>LlamaIndex</div>
            <p className={s.choiceDesc}>
              Заточен под работу с документами: умный chunking, индексирование,
              query modes. Для RAG — более богатый инструментарий.
            </p>
            <div className={s.choiceWhen}>
              <span className={s.choiceWhenLabel}>Когда:</span> RAG, Q&amp;A по документам, сложный поиск
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. LangChain: ключевые концепции ─────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LangChain: как устроен</SectionTitle>
        <p className={s.body}>
          LangChain — это не одна библиотека, а экосистема из нескольких пакетов.
          Понимать её удобнее через{' '}
          <strong>5 ключевых абстракций</strong>:
        </p>

        <div className={s.conceptsGrid}>
          <div className={s.conceptCard}>
            <div className={s.conceptNum}>01</div>
            <div className={s.conceptName}>Model</div>
            <p className={s.conceptDesc}>
              Обёртка над LLM: <code>ChatOpenAI</code>, <code>ChatAnthropic</code>,
              <code>ChatOllama</code>. Единый интерфейс <code>invoke()</code> для
              любого провайдера — меняешь провайдера без изменения остального кода.
            </p>
          </div>

          <div className={s.conceptCard}>
            <div className={s.conceptNum}>02</div>
            <div className={s.conceptName}>Prompt Template</div>
            <p className={s.conceptDesc}>
              Шаблон промпта с переменными: <code>PromptTemplate</code>,{' '}
              <code>ChatPromptTemplate</code>. Отделяет структуру промпта от
              данных — легко менять и тестировать.
            </p>
          </div>

          <div className={s.conceptCard}>
            <div className={s.conceptNum}>03</div>
            <div className={s.conceptName}>Output Parser</div>
            <p className={s.conceptDesc}>
              Парсит ответ модели: <code>StrOutputParser</code> — строка,
              <code>JsonOutputParser</code> — JSON объект,
              <code>StructuredOutputParser</code> — по Zod-схеме.
            </p>
          </div>

          <div className={s.conceptCard}>
            <div className={s.conceptNum}>04</div>
            <div className={s.conceptName}>LCEL Chain</div>
            <p className={s.conceptDesc}>
              LangChain Expression Language: компоненты соединяются через{' '}
              <code>|</code>. Результат одного — вход следующего.
              Все поддерживают <code>invoke</code>, <code>stream</code>, <code>batch</code>.
            </p>
          </div>

          <div className={s.conceptCard}>
            <div className={s.conceptNum}>05</div>
            <div className={s.conceptName}>Retriever</div>
            <p className={s.conceptDesc}>
              Компонент, который принимает вопрос и возвращает релевантные документы.
              Обёртка над векторным хранилищем — соединяется в цепочку через LCEL.
            </p>
          </div>

          <div className={s.conceptCard}>
            <div className={s.conceptNum}>06</div>
            <div className={s.conceptName}>Memory</div>
            <p className={s.conceptDesc}>
              История диалога: <code>ConversationBufferMemory</code> — всё подряд,{' '}
              <code>ConversationSummaryMemory</code> — сжимает через LLM,{' '}
              <code>ConversationTokenBufferMemory</code> — по лимиту токенов.
            </p>
          </div>
        </div>

        {/* LCEL пример */}
        <CodeHighlight lang="ts" filename="LCEL: цепочка промпт → модель → парсер" code={`import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StrOutputParser } from '@langchain/core/output_parsers';

const model = new ChatAnthropic({ model: 'claude-opus-4-7' });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'Ты помощник-переводчик. Переводи на {language}.'],
  ['human',  '{text}'],
]);

const parser = new StrOutputParser();

// Цепочка через оператор | (pipe)
const chain = prompt | model | parser;

// invoke — одиночный запрос
const result = await chain.invoke({
  language: 'французский',
  text: 'Привет, как дела?',
});

// stream — токен за токеном
for await (const chunk of await chain.stream({ language: 'испанский', text: 'Спасибо!' })) {
  process.stdout.write(chunk);
}

// batch — несколько запросов параллельно
const results = await chain.batch([
  { language: 'немецкий', text: 'Доброе утро' },
  { language: 'японский', text: 'До свидания' },
]);`} />
      </section>

      {/* ── 3. LangGraph: агенты со сложной логикой ──────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LangGraph: когда AgentExecutor мало</SectionTitle>
        <p className={s.body}>
          Обычный <code>AgentExecutor</code> в LangChain — это линейный цикл:
          думать → вызвать инструмент → думать → вызвать → ответить. Но что
          если логика агента нелинейная? Например:{' '}
          <strong>проверить результат</strong>, при ошибке — попробовать другой
          инструмент, при успехе — перейти к следующему шагу. Для таких случаев
          создали <strong>LangGraph</strong>.
        </p>

        <div className={s.graphDiagram}>
          <div className={s.graphTitle}>LangGraph: граф состояний агента</div>
          <div className={s.graphFlow}>
            <div className={s.graphNode} style={{ borderColor: 'rgba(0,229,160,0.5)' }}>
              <div className={s.graphNodeLabel} style={{ color: '#00e5a0' }}>START</div>
            </div>
            <div className={s.graphArrow}>↓</div>
            <div className={s.graphNode}>
              <div className={s.graphNodeLabel}>plan_task</div>
              <div className={s.graphNodeDesc}>LLM составляет план</div>
            </div>
            <div className={s.graphArrow}>↓</div>
            <div className={s.graphNode}>
              <div className={s.graphNodeLabel}>execute_tool</div>
              <div className={s.graphNodeDesc}>Вызов инструмента</div>
            </div>
            <div className={s.graphArrow}>↓ (проверка)</div>
            <div className={s.graphBranch}>
              <div className={s.graphBranchItem} style={{ borderColor: 'rgba(255,95,106,0.4)' }}>
                <div className={s.graphBranchLabel} style={{ color: '#ff5f6a' }}>ошибка</div>
                <div className={s.graphBranchDesc}>↩ execute_tool<br />(другой инструмент)</div>
              </div>
              <div className={s.graphBranchItem} style={{ borderColor: 'rgba(0,229,160,0.4)' }}>
                <div className={s.graphBranchLabel} style={{ color: '#00e5a0' }}>успех</div>
                <div className={s.graphBranchDesc}>→ synthesize<br />(собрать ответ)</div>
              </div>
            </div>
            <div className={s.graphArrow}>↓</div>
            <div className={s.graphNode} style={{ borderColor: 'rgba(0,229,160,0.5)' }}>
              <div className={s.graphNodeLabel} style={{ color: '#00e5a0' }}>END</div>
            </div>
          </div>
        </div>

        <p className={s.body}>
          В LangGraph каждый <strong>узел (node)</strong> — это функция,
          которая получает состояние и возвращает обновлённое состояние.{' '}
          <strong>Рёбра (edges)</strong> могут быть условными — на основе
          результата функции граф выбирает, в какой узел перейти дальше.
          Это позволяет строить агентов с ветвлением, циклами и
          человеческим подтверждением (human-in-the-loop).
        </p>

        <div className={s.infoCard}>
          <div className={s.infoLabel}>НА ПРАКТИКЕ</div>
          <p className={s.infoText}>
            LangGraph сложнее AgentExecutor, зато даёт полный контроль. Когда
            агент должен делать что-то нетривиальное — несколько итераций,
            проверку результатов, откат при ошибке — LangGraph правильный выбор.
            Для простых агентов это overkill.
          </p>
        </div>
      </section>

      {/* ── 4. LlamaIndex: как устроен ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LlamaIndex: как устроен</SectionTitle>
        <p className={s.body}>
          LlamaIndex строится вокруг концепции <strong>индекса</strong> —
          структурированного представления данных, по которому можно искать.
          Основной поток работы: загрузить → разбить → встроить → сохранить → искать → сгенерировать.
        </p>

        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.flowStepNum}>1</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Document Loader</div>
              <div className={s.flowStepDesc}>
                <code>SimpleDirectoryReader</code>, <code>PDFReader</code>,
                <code>WebPageReader</code> — загружают данные из любых источников
                в единый формат <code>Document</code>
              </div>
            </div>
          </div>

          <div className={s.flowStep}>
            <div className={s.flowStepNum}>2</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Node Parser</div>
              <div className={s.flowStepDesc}>
                Разбивает <code>Document</code> на <code>Node</code>'ы — чанки
                с метаданными, ссылками на соседей и пространством для эмбеддингов.
                <code>SentenceSplitter</code>, <code>SemanticSplitterNodeParser</code>
              </div>
            </div>
          </div>

          <div className={s.flowStep}>
            <div className={s.flowStepNum}>3</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Index</div>
              <div className={s.flowStepDesc}>
                <code>VectorStoreIndex</code> — поиск по эмбеддингам,{' '}
                <code>SummaryIndex</code> — суммаризация всего корпуса,{' '}
                <code>KeywordTableIndex</code> — по ключевым словам.
                Каждый индекс хранит ноды в подходящей структуре
              </div>
            </div>
          </div>

          <div className={s.flowStep}>
            <div className={s.flowStepNum}>4</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Retriever</div>
              <div className={s.flowStepDesc}>
                Вытаскивает топ-K нод по релевантности. Можно настроить:
                <code>similarity_top_k</code>, <code>VectorIndexRetriever</code>,
                гибридный поиск (семантика + ключевые слова)
              </div>
            </div>
          </div>

          <div className={s.flowStep}>
            <div className={s.flowStepNum}>5</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Query Engine</div>
              <div className={s.flowStepDesc}>
                Объединяет retriever + LLM. <code>RetrieverQueryEngine</code>,
                <code>SubQuestionQueryEngine</code> (разбивает вопрос на подвопросы),
                <code>RouterQueryEngine</code> (выбирает индекс динамически)
              </div>
            </div>
          </div>

          <div className={s.flowStep}>
            <div className={s.flowStepNum}>6</div>
            <div className={s.flowStepBody}>
              <div className={s.flowStepName}>Response Synthesizer</div>
              <div className={s.flowStepDesc}>
                Собирает финальный ответ из нод: <code>compact</code> (сжать в один промпт),
                <code>tree_summarize</code> (иерархическая суммаризация),{' '}
                <code>refine</code> (итеративное уточнение)
              </div>
            </div>
          </div>
        </div>

        {/* SubQuestion пример */}
        <CodeHighlight lang="ts" filename="SubQuestionQueryEngine — сложные вопросы по нескольким документам" code={`import { VectorStoreIndex, SimpleDirectoryReader } from 'llamaindex';
import { SubQuestionQueryEngine } from 'llamaindex';
import { QueryEngineTool } from 'llamaindex';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

// Создаём отдельные индексы для каждого источника
const appleIndex   = await VectorStoreIndex.fromDocuments(appleDocs);
const googleIndex  = await VectorStoreIndex.fromDocuments(googleDocs);

// Обернуть в именованные инструменты
const tools = [
  new QueryEngineTool({
    queryEngine: appleIndex.asQueryEngine(),
    metadata: { name: 'apple_annual_report',  description: 'Годовой отчёт Apple 2023'  },
  }),
  new QueryEngineTool({
    queryEngine: googleIndex.asQueryEngine(),
    metadata: { name: 'google_annual_report', description: 'Годовой отчёт Google 2023' },
  }),
];

// SubQuestionQueryEngine автоматически разобьёт вопрос:
// → "Какая выручка Apple за 2023?" (к apple_annual_report)
// → "Какая выручка Google за 2023?" (к google_annual_report)
// → сравнит оба ответа
const engine = SubQuestionQueryEngine.fromDefaults({ queryEngineTools: tools });

const response = await engine.query({
  query: 'Сравни выручку Apple и Google за 2023 год. Кто вырос быстрее?',
});`} />
      </section>

      {/* ── 5. Интерактивный виджет ───────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Выбери подход для задачи</SectionTitle>
        <p className={s.body}>
          На каждую задачу — свой правильный выбор. Попробуй разные комбинации
          и посмотри на реальный код:
        </p>

        <FrameworkComparison />
      </section>

      {/* ── 6. LangSmith: observability ──────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LangSmith: смотрим внутрь чёрного ящика</SectionTitle>
        <p className={s.body}>
          Одна из главных жалоб на фреймворки — невозможность понять, что
          происходит внутри при ошибке. LangSmith решает это: он{' '}
          <strong>перехватывает каждый шаг</strong> цепочки и логирует его с
          полным контекстом.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>Что логирует LangSmith</div>
            <div className={s.colList}>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Точный промпт, ушедший в API (включая system prompt)</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Ответ модели до парсинга и после</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Какие документы достал ретривер и с каким score</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Latency каждого шага цепочки</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Количество токенов и стоимость каждого вызова</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colDot} />
                <span>Вложенные трейсы для multi-agent систем</span>
              </div>
            </div>
          </div>

          <div className={s.colCard}>
            <div className={s.colTitle}>Как подключить</div>
            <div className={s.colList}>
              <div className={s.colItem}>
                <span className={s.colStep}>1</span>
                <span>Создать проект на <code>smith.langchain.com</code></span>
              </div>
              <div className={s.colItem}>
                <span className={s.colStep}>2</span>
                <span>Добавить env-переменные:<br />
                  <code>LANGCHAIN_TRACING_V2=true</code><br />
                  <code>LANGCHAIN_API_KEY=ls__...</code>
                </span>
              </div>
              <div className={s.colItem}>
                <span className={s.colStep}>3</span>
                <span>Запустить приложение — трейсы появятся автоматически, без изменений в коде</span>
              </div>
              <div className={s.colItem}>
                <span className={s.colStep}>4</span>
                <span>Собрать датасет из плохих примеров → запустить оценку через LangSmith Evaluators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Когда без фреймворка лучше ────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда фреймворк — лишний</SectionTitle>
        <p className={s.body}>
          Фреймворки добавляют <strong>сложность</strong>. Это оправдано,
          когда без них было бы ещё сложнее. Вот сигналы, что стоит остаться
          на нативном SDK:
        </p>

        <div className={s.signalsList}>
          <div className={s.signal}>
            <div className={s.signalIcon}>🎯</div>
            <div className={s.signalBody}>
              <div className={s.signalTitle}>Один LLM-вызов</div>
              <div className={s.signalDesc}>
                Если твоё приложение делает один вызов модели — нативный SDK проще,
                быстрее и понятнее. Фреймворк для этого — как вилочный погрузчик
                чтобы поднять карандаш.
              </div>
            </div>
          </div>

          <div className={s.signal}>
            <div className={s.signalIcon}>⚡</div>
            <div className={s.signalBody}>
              <div className={s.signalTitle}>Критична latency</div>
              <div className={s.signalDesc}>
                Каждый слой абстракции добавляет накладные расходы. Для
                real-time streaming с минимальной задержкой нативный SDK
                даёт более предсказуемое поведение.
              </div>
            </div>
          </div>

          <div className={s.signal}>
            <div className={s.signalIcon}>🔍</div>
            <div className={s.signalBody}>
              <div className={s.signalTitle}>Нужна прозрачность</div>
              <div className={s.signalDesc}>
                Стриминг, обработка ошибок, retry-логика — в нативном SDK ты
                контролируешь каждый байт. В фреймворке всегда есть магия,
                которую нужно понять перед дебаггингом.
              </div>
            </div>
          </div>

          <div className={s.signal}>
            <div className={s.signalIcon}>📦</div>
            <div className={s.signalBody}>
              <div className={s.signalTitle}>Размер бандла важен</div>
              <div className={s.signalDesc}>
                LangChain — это сотни килобайт зависимостей. Для Edge Runtime
                или serverless-функций с холодным стартом это может быть
                критично.
              </div>
            </div>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>ЗОЛОТОЕ ПРАВИЛО</div>
          <p className={s.calloutText}>
            Начинай с нативного SDK. Переходи на фреймворк только когда
            почувствуешь конкретную боль, которую он решает. Боль от
            сложного кода — лучший аргумент для фреймворка, чем &ldquo;так
            принято&rdquo;.
          </p>
        </div>
      </section>

      {/* ── 8. Сравнительная таблица ──────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LangChain vs LlamaIndex vs нативный SDK</SectionTitle>

        <div className={s.compareTable}>
          <div className={s.compareHead}>
            <div className={s.compareHCell}>Критерий</div>
            <div className={s.compareHCell}>Нативный SDK</div>
            <div className={s.compareHCell}>LangChain</div>
            <div className={s.compareHCell}>LlamaIndex</div>
          </div>

          {[
            ['Простой чат',             '✅ Лучший выбор',  '⚠️ Избыточно',      '❌ Не по назначению'],
            ['RAG / поиск по документам','⚠️ Много кода',   '✅ Хорошо',         '✅ Лучший выбор'],
            ['Агенты с инструментами',  '⚠️ Реализуемо',   '✅ Лучший выбор',   '⚠️ Есть, но слабее'],
            ['Multi-agent система',     '🔧 Очень сложно',  '✅ LangGraph',      '⚠️ Базовая поддержка'],
            ['Прозрачность / дебаг',    '✅ Полный контроль','⚠️ LangSmith нужен','⚠️ Требует внимания'],
            ['Размер зависимостей',     '✅ Минимум',        '⚠️ Большой',       '⚠️ Средний'],
            ['Скорость старта',         '✅ Быстро',         '⚠️ Надо разобраться','⚠️ Надо разобраться'],
            ['Экосистема интеграций',   '❌ Нет',            '✅ Огромная',       '✅ Богатая для RAG'],
          ].map(([crit, nat, lc, li]) => (
            <div key={crit} className={s.compareRow}>
              <div className={s.compareCrit}>{crit}</div>
              <div className={s.compareCell}>{nat}</div>
              <div className={s.compareCell}>{lc}</div>
              <div className={s.compareCell}>{li}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Паттерны комбинирования ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как их комбинируют на практике</SectionTitle>
        <p className={s.body}>
          В реальных проектах редко выбирают что-то одно. Типичные комбинации:
        </p>

        <div className={s.patternsList}>
          <div className={s.pattern}>
            <div className={s.patternTitle}>LlamaIndex + нативный SDK</div>
            <p className={s.patternDesc}>
              LlamaIndex строит индекс и делает retrieval. Нативный SDK вызывает
              LLM напрямую с собранным контекстом. Максимальный контроль при
              сохранении удобства RAG-инструментов.
            </p>
          </div>

          <div className={s.pattern}>
            <div className={s.patternTitle}>LangChain агент + LlamaIndex RAG</div>
            <p className={s.patternDesc}>
              LangChain управляет агентом и инструментами. Один из инструментов —
              LlamaIndex QueryEngine для поиска по документам. LangGraph управляет
              логикой: когда искать, а когда отвечать напрямую.
            </p>
          </div>

          <div className={s.pattern}>
            <div className={s.patternTitle}>Нативный SDK + своя RAG-логика</div>
            <p className={s.patternDesc}>
              Qdrant/pgvector напрямую через их SDK. Эмбеддинги через OpenAI API.
              Промпт собирается кодом. LLM вызывается нативно. Нет магии,
              максимальная прозрачность — подходит для критичных продакшн-систем.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. Quiz ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
