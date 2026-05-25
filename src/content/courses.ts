// ════════════════════════════════════════════════════════════════════════════
//  СТРУКТУРА КУРСОВ — единый файл управления
// ════════════════════════════════════════════════════════════════════════════
//
//  Добавить статью:    a('slug', 'Название', 'Описание')
//  Статья с тегами:    a('slug', 'Название', 'Описание', ['tag1', 'tag2'])
//  Интерактивная:      a('slug', 'Название', 'Описание', ['tag'], true)
//  Создать раздел:     s('Название раздела', [ ...статьи ])
//  Добавить курс:      c('slug', 'Название', 'Описание', [ ...статьи/разделы ])
//
// ════════════════════════════════════════════════════════════════════════════

// ── Типы (используются в sidebar, page.tsx) ───────────────────────────────────

export interface Article {
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  interactive: boolean;
  section?: string;
}

export interface Course {
  slug: string;
  title: string;
  description: string;
  articles: Article[];
}

// ── DSL хелперы ────────────────────────────────────────────────────────────────

type ArticleNode = Omit<Article, 'section'>;
type SectionNode = { __s: string; items: ArticleNode[] };
type Node = ArticleNode | SectionNode;

/** Статья */
const a = (slug: string, title: string, description: string, tags: string[] = [], interactive = false): ArticleNode =>
  ({ slug, title, description, tags, interactive });

/** Раздел (группирует статьи в сайдбаре) */
const s = (name: string, items: ArticleNode[]): SectionNode =>
  ({ __s: name, items });

/** Курс */
const c = (slug: string, title: string, description: string, items: Node[]): Course => ({
  slug, title, description,
  articles: items.flatMap(node =>
    '__s' in node
      ? node.items.map(art => ({ ...art, section: node.__s }))
      : [node]
  ),
});

// ════════════════════════════════════════════════════════════════════════════
//  КУРСЫ
// ════════════════════════════════════════════════════════════════════════════

export const courses: Course[] = [

  // ── Общие вопросы ──────────────────────────────────────────────────────────
  c('general', 'Общие вопросы', 'Фундаментальные вопросы веб-разработки: браузер, протоколы, архитектура.', [
    a('http-request',       'Из чего состоит HTTP запрос',       'Метод, URL, заголовки, тело запроса и ответа. Коды состояния.',                           ['network'],               true),
    a('how-browser-works',  'Как работает браузер',              'Жизнь запроса: от ввода URL до отображения страницы.',                                    ['network', 'browser'],    true),
    a('oop',                'ООП',                               'Инкапсуляция, наследование, полиморфизм — принципы объектно-ориентированного программирования.', ['concepts'],          true),
    a('progressive-ssr',    'Прогрессивный SSR',                 'Streaming SSR, Suspense и прогрессивная гидратация.',                                     ['ssr', 'performance'],    true),
    a('storage',            'localStorage, sessionStorage и cookie', 'Различия в области видимости, сроке жизни и доступе к хранилищам браузера.',           ['browser'],              true),
    a('csr-vs-ssr',         'CSR vs SSR',                        'Client-Side и Server-Side Rendering: когда что применять.',                               ['architecture'],          true),
  ]),

  // ── JavaScript ─────────────────────────────────────────────────────────────
  c('javascript', 'JavaScript', 'Глубокое погружение в механизмы языка — от Event Loop до прототипов.', [
    a('event-loop',            'Event Loop',                    'Как браузер выполняет код: Call Stack, Microtask Queue, Macrotask Queue и порядок их обработки.', ['runtime', 'async'],  true),
    a('promises',              'Promises & async/await',        'Цепочки промисов, обработка ошибок и сахар async/await под капотом.',                       ['async'],                true),
    a('prototypes',            'Прототипы',                     'Прототипная цепочка, [[Prototype]], Object.create и классы ES6.',                           ['oop'],                  true),
    a('data-types',            'Типы данных',                   'Примитивы и объекты, typeof, преобразование типов.',                                        ['basics']),
    a('let-var-const',         'let, var и const',              'Области видимости, hoisting и temporal dead zone.',                                         ['basics']),
    a('hoisting',              'Hoisting',                      'Как JavaScript поднимает объявления переменных и функций.',                                 ['basics']),
    a('closures',              'Замыкания',                     'Что такое замыкание, лексическое окружение и практические паттерны.',                       ['functions']),
    a('this',                  'this',                          'Как определяется контекст this в разных ситуациях.',                                        ['functions']),
    a('call-bind-apply',       'call, bind и apply',            'Явная привязка контекста и частичное применение.',                                          ['functions']),
    a('hof',                   'HOF — Higher-Order Functions',  'Функции высшего порядка: map, filter, reduce и собственные реализации.',                    ['functions']),
    a('iife',                  'IIFE',                          'Immediately Invoked Function Expression — зачем и когда применять.',                       ['functions']),
    a('currying',              'Каррирование',                  'Преобразование функции с несколькими аргументами в цепочку функций.',                       ['functions']),
    a('equality-operators',    'Разница == и ===',              'Абстрактное и строгое сравнение, алгоритм приведения типов.',                               ['basics']),
    a('null-undefined',        'null и undefined',              'Сходства, различия и тонкости работы с отсутствующими значениями.',                         ['basics']),
    a('nan',                   'NaN',                           'Почему NaN !== NaN и как правильно проверять числа.',                                       ['basics']),
    a('spread-rest',           'spread и rest',                 'Оператор распространения и сборки аргументов в массив.',                                   ['syntax']),
    a('use-strict',            'Директива use strict',          'Что включает строгий режим и почему он важен.',                                             ['basics']),
    a('dom',                   'DOM',                           'Document Object Model: дерево узлов, манипуляция элементами, события.',                    ['browser']),
    a('property-check',        'Как определить наличие свойства в объекте', 'in, hasOwnProperty, hasOwn, optional chaining — что и когда использовать.',    ['objects']),
    a('inheritance',           'Наследование',                  'Прототипное vs классическое наследование, паттерны и подводные камни.',                    ['oop']),
    a('function-overloading',  'Перегрузка функций',            'Как эмулировать перегрузку в JavaScript без статической типизации.',                       ['functions']),
    a('null-prototype-object', 'Объект без прототипа',          'Object.create(null) и зачем создавать объекты без Object.prototype.',                      ['objects']),
    a('garbage-collector',     'Сборщик мусора',                'Mark-and-sweep, достижимость, утечки памяти и WeakRef.',                                   ['runtime']),
    a('collections',           'Map, WeakMap, Set, WeakSet',    'Коллекции ES6: когда использовать вместо объектов и массивов.',                             ['data-structures']),
  ]),

  // ── CSS ────────────────────────────────────────────────────────────────────
  c('css', 'CSS', 'Современный CSS: cascade, specificity, layout-алгоритмы.', [
    a('cascade', 'Cascade & Specificity', 'Как браузер определяет, какое правило применить. Specificity calculator.', ['fundamentals'], true),
    a('flexbox', 'Flexbox',              'Интерактивный разбор flex-модели: главная ось, поперечная, выравнивание.',  ['layout'],       true),
  ]),

  // ── HTML ───────────────────────────────────────────────────────────────────
  c('html', 'HTML', 'Семантика, доступность и нативные возможности браузера.', [
    a('template-tag', 'Тег template', 'Ленивые фрагменты DOM: как работает <template> и зачем нужен.', ['dom']),
  ]),

  // ── React ──────────────────────────────────────────────────────────────────
  c('react', 'React', 'Компонентная модель, хуки, рендеринг и оптимизации.', []),

  // ── State Management ───────────────────────────────────────────────────────
  c('state-management', 'State Management', 'Redux, Zustand, Jotai, Context — управление состоянием.', []),

  // ── TypeScript ─────────────────────────────────────────────────────────────
  c('typescript', 'TypeScript', 'Система типов, компилятор и продвинутые возможности TS.', [
    a('ts-vs-js',              'Плюсы и минусы TS vs JS',        'Зачем TypeScript, где он помогает и где добавляет сложность.',                             ['basics']),
    a('ts-compiler',           'Компилятор TypeScript',          'tsconfig, этапы компиляции, declaration files и incremental builds.',                     ['tooling']),
    a('any-unknown-never-void','any, unknown, never, void',      'Специальные типы и когда каждый из них уместен.',                                         ['types']),
    a('union-intersection',    'union и intersection',           'Объединение и пересечение типов: A | B и A & B.',                                         ['types']),
    a('class-interface-type',  'class, interface и type',        'Различия между тремя способами описать форму объекта.',                                   ['types']),
    a('extends-implements',    'extends и implements',           'Наследование классов vs реализация интерфейса.',                                           ['oop']),
    a('access-modifiers',      'Модификаторы доступа',           'public, private, protected, readonly — области видимости в классах.',                     ['oop']),
    a('getters-setters',       'Геттеры и сеттеры',              'get/set в классах и объектных литералах.',                                                ['oop']),
    a('super-constructor',     'super() в конструкторе',         'Вызов конструктора базового класса и правила использования super.',                       ['oop']),
    a('abstract',              'abstract классы',                'Абстрактные классы как контракты для подклассов.',                                         ['oop']),
    a('generics',              'Generics',                       'Обобщённые типы: параметры, constraints и инференс.',                                     ['types']),
    a('conditional-types',     'Условные типы',                  'T extends U ? X : Y — типы как функции от типов.',                                       ['advanced']),
    a('mapped-types',          'Mapped Types',                   'Трансформация типов через { [K in keyof T]: ... }.',                                      ['advanced']),
    a('utility-types',         'Utility Types',                  'Partial, Required, Pick, Omit, Record, ReturnType и другие.',                             ['types']),
    a('keyof',                 'keyof',                          'Оператор keyof и его применение в generic-функциях.',                                     ['advanced']),
    a('type-assertion',        'Type Assertion',                 'as и ! — явное приведение типов и когда это оправдано.',                                  ['types']),
    a('enum',                  'Enum',                           'Числовые и строковые перечисления, const enum и альтернативы.',                           ['types']),
    a('decorators',            'Decorators',                     'Метапрограммирование через декораторы классов, методов и свойств.',                       ['advanced']),
    a('mixins',                'Mixins',                         'Паттерн примесей для составного наследования без иерархии.',                               ['patterns']),
    a('ts-modules',            'Модули в TypeScript',            'ES-модули, namespace, declaration merging и paths.',                                      ['tooling']),
    a('readonly',              'readonly',                       'Неизменяемые поля в типах, классах и as const.',                                          ['types']),
    a('function-overloading',  'Перегрузка функций в TS',        'Сигнатуры перегрузки и реализационная подпись.',                                          ['functions']),
  ]),

  // ── Browser ────────────────────────────────────────────────────────────────
  c('browser', 'Browser', 'Как браузер превращает HTML в пиксели.', [
    a('critical-rendering-path', 'Critical Rendering Path', 'DOM, CSSOM, Render Tree, Layout, Paint, Composite — шаг за шагом.', ['performance'], true),
  ]),

  // ── Webpack ────────────────────────────────────────────────────────────────
  c('webpack', 'Webpack', 'Бандлинг, лоадеры, плагины и оптимизация сборки.', []),

  // ── Базы данных ────────────────────────────────────────────────────────────
  c('databases', 'Базы данных', 'Реляционные и NoSQL СУБД, SQL от простого к сложному, индексы, транзакции, ORM.', [
    a('databases-intro',   'Введение в базы данных',  'История БД, реляционная модель, SQL vs NoSQL, типы хранилищ и как выбрать нужное.',                         ['databases', 'sql', 'nosql'], true),
    a('db-keys',           'Ключи и ограничения',     'PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK — как работают, чем отличаются, что создаёт индекс автоматически.', ['databases', 'sql'],          true),
    a('sql-queries',       'SQL запросы',             'SELECT, WHERE, GROUP BY, подзапросы, CTE, оконные функции — базовые конструкции языка.',                    ['sql', 'databases'],         true),
    a('sql-joins',         'JOIN — объединение таблиц','INNER, LEFT, RIGHT, FULL, CROSS, SELF JOIN — все типы с визуализацией, 10 задач и 22 вопроса.',             ['sql', 'databases'],         true),
    a('sql-dml',           'INSERT, UPDATE, DELETE',  'DML-команды: как добавлять, изменять и удалять данные. RETURNING, ON CONFLICT, upsert и мест где всё идёт не так.', ['sql', 'databases'],         true),
    a('postgresql-indexes','Индексы в PostgreSQL',    'B-tree, Hash, GIN, BRIN — какой когда использовать. EXPLAIN ANALYZE и медленные запросы.',                  ['postgresql', 'performance'], true),
    a('transactions-acid', 'Транзакции и ACID',       'Атомарность, консистентность, изоляция, долговечность. Уровни изоляции и их практические последствия.',     ['databases', 'concepts'],    true),
    a('orm-migrations',    'ORM и миграции',          'SQLAlchemy / Prisma / TypeORM, N+1 проблема, миграции схемы без даунтайма.',                                 ['orm', 'databases']),
  ]),

  // ── Backend ────────────────────────────────────────────────────────────────
  c('backend', 'Backend', 'API, брокеры, кэш, авторизация, архитектура — всё что нужно знать бэкенд-разработчику.', [

    a('backend-roadmap', 'Backend Roadmap 2026', '8 доменов бэкенд-разработки: от языка и баз данных до архитектуры и безопасности. Junior → Senior.', ['roadmap', 'overview'], true),

    s('Кэширование', [
      a('redis-basics',    'Redis: структуры и команды', 'String, Hash, List, Set, Sorted Set, Pub/Sub. Когда и зачем каждая структура.',                             ['redis', 'cache'],     true),
      a('cache-patterns',  'Паттерны кэширования',       'Cache-aside, write-through, write-behind. Cache invalidation. Cache stampede и защита от него.',            ['cache', 'patterns'],  true),
    ]),

    s('Брокеры сообщений', [
      a('rabbitmq-basics', 'RabbitMQ',                  'Exchange типы, routing, очереди, ACK/NACK, Dead Letter Queue, retry с backoff.',                            ['rabbitmq', 'messaging'], true),
      a('kafka-basics',    'Apache Kafka',               'Топики, партиции, consumer groups, offset, retention. Когда Kafka, когда RabbitMQ.',                        ['kafka', 'messaging'],    true),
      a('async-patterns',  'Паттерны асинхронности',     'Idempotent consumer, Outbox pattern, Saga. Гарантии доставки: at-least-once, exactly-once.',               ['patterns', 'messaging']),
    ]),

    s('API дизайн', [
      a('rest-api-design', 'REST API: принципы и практика', 'Ресурсы, методы, статус-коды, versioning, идемпотентность, rate limiting.',                             ['rest', 'api'],        true),
      a('grpc-basics',     'gRPC и Protobuf',               'Protobuf-схема, унарные и стримовые вызовы, сравнение с REST, когда использовать.',                     ['grpc', 'api']),
      a('websocket-sse',   'WebSocket и SSE',               'Full-duplex соединение vs Server-Sent Events. Трейдинг, чаты, live-уведомления.',                       ['websocket', 'realtime'], true),
    ]),

    s('Безопасность', [
      a('auth-jwt',    'JWT и сессии',              'Структура JWT, access/refresh токены, сессии. Где хранить, как инвалидировать.',                                 ['auth', 'security'],   true),
      a('oauth-openid','OAuth 2.0 и OpenID Connect','Authorization Code Flow, PKCE, refresh rotation. "Войти через Google" под капотом.',                            ['oauth', 'auth'],      true),
      a('owasp-top10', 'OWASP Top 10',              'SQL injection, XSS, IDOR, SSRF и другие уязвимости — с примерами и защитой.',                                   ['security', 'owasp'],  true),
    ]),

    s('Архитектура', [
      a('microservices',        'Монолит vs микросервисы',              'Когда монолит лучше. Признаки того, что пора делить. Strangler Fig, модульный монолит.',    ['architecture', 'microservices'], true),
      a('architecture-patterns','Паттерны: Outbox, Saga, Circuit Breaker','Надёжные паттерны для распределённых систем. Когда и как применять каждый.',              ['patterns', 'architecture']),
      a('system-design',        'System Design: с чего начать',         'Как подходить к задачам проектирования систем. URL shortener, паста, лента новостей.',       ['system-design', 'interview'], true),
    ]),

    s('Инфраструктура', [
      a('docker-backend', 'Docker для бэкенда', 'Многоэтапные сборки, оптимизация образов, docker-compose для локальной разработки.', ['docker', 'infra']),
      a('s3-storage',     'S3 хранилища',       'Объектное хранилище, presigned URL, прямая загрузка с клиента, бэкапы БД.',          ['s3', 'storage', 'infra']),
    ]),

  ]),

  // ── ML & AI ────────────────────────────────────────────────────────────────
  c('ml-ai', 'ML & AI', 'Как работают нейросети и языковые модели, как строить RAG, обучать модели и внедрять AI в продакшн.', [

    s('Как это устроено', [
      a('ml-how-it-works',  'Нейросети: как работает под капотом',   'Нейрон, веса, слои, функция потерь, градиентный спуск — с нуля и понятно.',                                          ['ml', 'basics'],          true),
      a('llm-architecture', 'LLM под капотом',                       'Токены, трансформеры, attention, context window, temperature — как языковая модель генерирует текст.',               ['llm', 'transformers'],   true),
      a('embeddings',       'Эмбеддинги: текст → числа',             'Векторное пространство, cosine similarity, семантический поиск — основа RAG и поиска.',                             ['embeddings', 'vectors'], true),
    ]),

    s('Работа с AI API', [
      a('ai-api-integration', 'AI API: подключаем и используем', 'OpenAI/Anthropic SDK, streaming, function calling, structured output, обработка ошибок.',    ['api', 'openai'],        true),
      a('prompt-engineering', 'Prompt Engineering',               'System prompt, few-shot, chain-of-thought, XML-структура, JSON output — как управлять моделью.', ['prompts', 'llm'],       true),
    ]),

    s('RAG', [
      a('rag-architecture',  'RAG: архитектура от A до Z', 'Chunking, embedding, vector search, reranking, generation — строим свой поиск по документам.',     ['rag', 'search'],   true),
      a('vector-databases',  'Векторные базы данных',      'pgvector, Qdrant, Pinecone, FAISS — как работают индексы HNSW, когда что выбрать.',               ['vectors', 'db'],   true),
    ]),

    s('Агенты', [
      a('ai-agents',     'AI Агенты: tool calling и ReAct', 'Function calling, ReAct паттерн, memory, multi-agent системы — когда нужны и как устроены.', ['agents', 'llm'], true),
      a('ai-frameworks', 'LangChain и LlamaIndex',          'Что дают фреймворки, когда нужны, когда проще без них — архитектурные паттерны.',            ['langchain'],     true),
    ]),

    s('Обучение', [
      a('fine-tuning',       'Fine-tuning: когда и как',     'Когда нужен vs prompt engineering, LoRA/QLoRA, форматы датасетов, evaluation, Hugging Face.', ['fine-tuning', 'training'], true),
      a('ml-training-loop',  'Обучение модели с нуля',       'PyTorch основы, датасет, training loop, loss, overfitting, validation — концептуально.',      ['pytorch', 'training'],    true),
    ]),

    s('Продакшн', [
      a('ai-in-production', 'AI в проде',         'Latency, cost, caching ответов, evals (как тестировать LLM), мониторинг галлюцинаций.',         ['production', 'ai'], true),
      a('ai-safety',        'Безопасность AI',    'Prompt injection, hallucinations, guardrails, jailbreak, Red Teaming — когда не доверять модели.', ['safety', 'ai'],     true),
    ]),

  ]),

  // ── DevOps ─────────────────────────────────────────────────────────────────
  c('devops', 'DevOps', 'CI/CD, Kubernetes, IaC, Observability, DevSecOps — карта доменов.', [
    a('what-devops-knows', 'Что должен знать DevOps', 'Карта доменов: Linux, CI/CD, K8s, Cloud/IaC, Observability, DevSecOps — навыки по уровням.', ['overview', 'roadmap'], true),
    a('linux-basics',      'База по Linux',            'Процессы, файловая система, права доступа, сеть — фундамент для любого DevOps-инженера.',    ['linux', 'basics'],    true),
  ]),

];

// ════════════════════════════════════════════════════════════════════════════
//  API (используется в остальных файлах — не трогать)
// ════════════════════════════════════════════════════════════════════════════

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getArticle(courseSlug: string, articleSlug: string): Article | undefined {
  return getCourse(courseSlug)?.articles.find((a) => a.slug === articleSlug);
}
