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

export const courses: Course[] = [
  {
    slug: 'general',
    title: 'Общие вопросы',
    description: 'Фундаментальные вопросы веб-разработки: браузер, протоколы, архитектура.',
    articles: [
      {
        slug: 'http-request',
        title: 'Из чего состоит HTTP запрос',
        description: 'Метод, URL, заголовки, тело запроса и ответа. Коды состояния.',
        tags: ['network'],
        interactive: true,
      },
      {
        slug: 'how-browser-works',
        title: 'Как работает браузер',
        description: 'Жизнь запроса: от ввода URL до отображения страницы.',
        tags: ['network', 'browser'],
        interactive: true,
      },
      {
        slug: 'oop',
        title: 'ООП',
        description: 'Инкапсуляция, наследование, полиморфизм — принципы объектно-ориентированного программирования.',
        tags: ['concepts'],
        interactive: true,
      },
      {
        slug: 'progressive-ssr',
        title: 'Прогрессивный SSR',
        description: 'Streaming SSR, Suspense и прогрессивная гидратация.',
        tags: ['ssr', 'performance'],
        interactive: true,
      },
      {
        slug: 'storage',
        title: 'localStorage, sessionStorage и cookie',
        description: 'Различия в области видимости, сроке жизни и доступе к хранилищам браузера.',
        tags: ['browser'],
        interactive: true,
      },
      {
        slug: 'csr-vs-ssr',
        title: 'CSR vs SSR',
        description: 'Client-Side и Server-Side Rendering: когда что применять.',
        tags: ['architecture'],
        interactive: true,
      },
    ],
  },

  {
    slug: 'javascript',
    title: 'JavaScript',
    description: 'Глубокое погружение в механизмы языка — от Event Loop до прототипов.',
    articles: [
      {
        slug: 'event-loop',
        title: 'Event Loop',
        description: 'Как браузер выполняет код: Call Stack, Microtask Queue, Macrotask Queue и порядок их обработки.',
        tags: ['runtime', 'async'],
        interactive: true,
      },
      {
        slug: 'promises',
        title: 'Promises & async/await',
        description: 'Цепочки промисов, обработка ошибок и сахар async/await под капотом.',
        tags: ['async'],
        interactive: true,
      },
      {
        slug: 'prototypes',
        title: 'Прототипы',
        description: 'Прототипная цепочка, [[Prototype]], Object.create и классы ES6.',
        tags: ['oop'],
        interactive: true,
      },
      {
        slug: 'data-types',
        title: 'Типы данных',
        description: 'Примитивы и объекты, typeof, преобразование типов.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'let-var-const',
        title: 'let, var и const',
        description: 'Области видимости, hoisting и temporal dead zone.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'hoisting',
        title: 'Hoisting',
        description: 'Как JavaScript поднимает объявления переменных и функций.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'closures',
        title: 'Замыкания',
        description: 'Что такое замыкание, лексическое окружение и практические паттерны.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'this',
        title: 'this',
        description: 'Как определяется контекст this в разных ситуациях.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'call-bind-apply',
        title: 'call, bind и apply',
        description: 'Явная привязка контекста и частичное применение.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'hof',
        title: 'HOF — Higher-Order Functions',
        description: 'Функции высшего порядка: map, filter, reduce и собственные реализации.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'iife',
        title: 'IIFE',
        description: 'Immediately Invoked Function Expression — зачем и когда применять.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'currying',
        title: 'Каррирование',
        description: 'Преобразование функции с несколькими аргументами в цепочку функций.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'equality-operators',
        title: 'Разница == и ===',
        description: 'Абстрактное и строгое сравнение, алгоритм приведения типов.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'null-undefined',
        title: 'null и undefined',
        description: 'Сходства, различия и тонкости работы с отсутствующими значениями.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'nan',
        title: 'NaN',
        description: 'Почему NaN !== NaN и как правильно проверять числа.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'spread-rest',
        title: 'spread и rest',
        description: 'Оператор распространения и сборки аргументов в массив.',
        tags: ['syntax'],
        interactive: false,
      },
      {
        slug: 'use-strict',
        title: 'Директива use strict',
        description: 'Что включает строгий режим и почему он важен.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'dom',
        title: 'DOM',
        description: 'Document Object Model: дерево узлов, манипуляция элементами, события.',
        tags: ['browser'],
        interactive: false,
      },
      {
        slug: 'property-check',
        title: 'Как определить наличие свойства в объекте',
        description: 'in, hasOwnProperty, hasOwn, optional chaining — что и когда использовать.',
        tags: ['objects'],
        interactive: false,
      },
      {
        slug: 'inheritance',
        title: 'Наследование',
        description: 'Прототипное vs классическое наследование, паттерны и подводные камни.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'function-overloading',
        title: 'Перегрузка функций',
        description: 'Как эмулировать перегрузку в JavaScript без статической типизации.',
        tags: ['functions'],
        interactive: false,
      },
      {
        slug: 'null-prototype-object',
        title: 'Объект без прототипа',
        description: 'Object.create(null) и зачем создавать объекты без Object.prototype.',
        tags: ['objects'],
        interactive: false,
      },
      {
        slug: 'garbage-collector',
        title: 'Сборщик мусора',
        description: 'Mark-and-sweep, достижимость, утечки памяти и WeakRef.',
        tags: ['runtime'],
        interactive: false,
      },
      {
        slug: 'collections',
        title: 'Map, WeakMap, Set, WeakSet',
        description: 'Коллекции ES6: когда использовать вместо объектов и массивов.',
        tags: ['data-structures'],
        interactive: false,
      },
    ],
  },

  {
    slug: 'css',
    title: 'CSS',
    description: 'Современный CSS: cascade, specificity, layout-алгоритмы.',
    articles: [
      {
        slug: 'cascade',
        title: 'Cascade & Specificity',
        description: 'Как браузер определяет, какое правило применить. Specificity calculator.',
        tags: ['fundamentals'],
        interactive: true,
      },
      {
        slug: 'flexbox',
        title: 'Flexbox',
        description: 'Интерактивный разбор flex-модели: главная ось, поперечная, выравнивание.',
        tags: ['layout'],
        interactive: true,
      },
    ],
  },

  {
    slug: 'html',
    title: 'HTML',
    description: 'Семантика, доступность и нативные возможности браузера.',
    articles: [
      {
        slug: 'template-tag',
        title: 'Тег template',
        description: 'Ленивые фрагменты DOM: как работает <template> и зачем нужен.',
        tags: ['dom'],
        interactive: false,
      },
    ],
  },

  {
    slug: 'react',
    title: 'React',
    description: 'Компонентная модель, хуки, рендеринг и оптимизации.',
    articles: [],
  },

  {
    slug: 'state-management',
    title: 'State Management',
    description: 'Redux, Zustand, Jotai, Context — управление состоянием.',
    articles: [],
  },

  {
    slug: 'typescript',
    title: 'TypeScript',
    description: 'Система типов, компилятор и продвинутые возможности TS.',
    articles: [
      {
        slug: 'ts-vs-js',
        title: 'Плюсы и минусы TS vs JS',
        description: 'Зачем TypeScript, где он помогает и где добавляет сложность.',
        tags: ['basics'],
        interactive: false,
      },
      {
        slug: 'ts-compiler',
        title: 'Компилятор TypeScript',
        description: 'tsconfig, этапы компиляции, declaration files и incremental builds.',
        tags: ['tooling'],
        interactive: false,
      },
      {
        slug: 'any-unknown-never-void',
        title: 'any, unknown, never, void',
        description: 'Специальные типы и когда каждый из них уместен.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'union-intersection',
        title: 'union и intersection',
        description: 'Объединение и пересечение типов: A | B и A & B.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'class-interface-type',
        title: 'class, interface и type',
        description: 'Различия между тремя способами описать форму объекта.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'extends-implements',
        title: 'extends и implements',
        description: 'Наследование классов vs реализация интерфейса.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'access-modifiers',
        title: 'Модификаторы доступа',
        description: 'public, private, protected, readonly — области видимости в классах.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'getters-setters',
        title: 'Геттеры и сеттеры',
        description: 'get/set в классах и объектных литералах.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'super-constructor',
        title: 'super() в конструкторе',
        description: 'Вызов конструктора базового класса и правила использования super.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'abstract',
        title: 'abstract классы',
        description: 'Абстрактные классы как контракты для подклассов.',
        tags: ['oop'],
        interactive: false,
      },
      {
        slug: 'generics',
        title: 'Generics',
        description: 'Обобщённые типы: параметры, constraints и инференс.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'conditional-types',
        title: 'Условные типы',
        description: 'T extends U ? X : Y — типы как функции от типов.',
        tags: ['advanced'],
        interactive: false,
      },
      {
        slug: 'mapped-types',
        title: 'Mapped Types',
        description: 'Трансформация типов через { [K in keyof T]: ... }.',
        tags: ['advanced'],
        interactive: false,
      },
      {
        slug: 'utility-types',
        title: 'Utility Types',
        description: 'Partial, Required, Pick, Omit, Record, ReturnType и другие.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'keyof',
        title: 'keyof',
        description: 'Оператор keyof и его применение в generic-функциях.',
        tags: ['advanced'],
        interactive: false,
      },
      {
        slug: 'type-assertion',
        title: 'Type Assertion',
        description: 'as и ! — явное приведение типов и когда это оправдано.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'enum',
        title: 'Enum',
        description: 'Числовые и строковые перечисления, const enum и альтернативы.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'decorators',
        title: 'Decorators',
        description: 'Метапрограммирование через декораторы классов, методов и свойств.',
        tags: ['advanced'],
        interactive: false,
      },
      {
        slug: 'mixins',
        title: 'Mixins',
        description: 'Паттерн примесей для составного наследования без иерархии.',
        tags: ['patterns'],
        interactive: false,
      },
      {
        slug: 'ts-modules',
        title: 'Модули в TypeScript',
        description: 'ES-модули, namespace, declaration merging и paths.',
        tags: ['tooling'],
        interactive: false,
      },
      {
        slug: 'readonly',
        title: 'readonly',
        description: 'Неизменяемые поля в типах, классах и as const.',
        tags: ['types'],
        interactive: false,
      },
      {
        slug: 'function-overloading',
        title: 'Перегрузка функций в TS',
        description: 'Сигнатуры перегрузки и реализационная подпись.',
        tags: ['functions'],
        interactive: false,
      },
    ],
  },

  {
    slug: 'browser',
    title: 'Browser',
    description: 'Как браузер превращает HTML в пиксели.',
    articles: [
      {
        slug: 'critical-rendering-path',
        title: 'Critical Rendering Path',
        description: 'DOM, CSSOM, Render Tree, Layout, Paint, Composite — шаг за шагом.',
        tags: ['performance'],
        interactive: true,
      },
    ],
  },

  {
    slug: 'webpack',
    title: 'Webpack',
    description: 'Бандлинг, лоадеры, плагины и оптимизация сборки.',
    articles: [],
  },

  {
    slug: 'backend',
    title: 'Backend',
    description: 'Базы данных, API, брокеры, кэш, авторизация — всё что нужно знать бэкенд-разработчику.',
    articles: [
      {
        slug: 'backend-roadmap',
        title: 'Backend Roadmap 2026',
        description: '8 доменов бэкенд-разработки: от языка и баз данных до архитектуры и безопасности. Junior → Senior.',
        tags: ['roadmap', 'overview'],
        interactive: true,
      },

      // ── Базы данных ──────────────────────────────────────────────
      {
        slug: 'sql-queries',
        title: 'SQL запросы',
        description: 'SELECT, JOIN, GROUP BY, подзапросы, CTE, window functions — от простого к сложному.',
        tags: ['sql', 'databases'],
        interactive: true,
        section: 'Базы данных',
      },
      {
        slug: 'postgresql-indexes',
        title: 'Индексы в PostgreSQL',
        description: 'B-tree, Hash, GIN, BRIN — какой когда использовать. EXPLAIN ANALYZE и медленные запросы.',
        tags: ['postgresql', 'performance'],
        interactive: true,
        section: 'Базы данных',
      },
      {
        slug: 'transactions-acid',
        title: 'Транзакции и ACID',
        description: 'Атомарность, консистентность, изоляция, долговечность. Уровни изоляции и их практические последствия.',
        tags: ['databases', 'concepts'],
        interactive: true,
        section: 'Базы данных',
      },
      {
        slug: 'orm-migrations',
        title: 'ORM и миграции',
        description: 'SQLAlchemy / Prisma / TypeORM, N+1 проблема, миграции схемы без даунтайма.',
        tags: ['orm', 'databases'],
        interactive: false,
        section: 'Базы данных',
      },

      // ── Кэширование ──────────────────────────────────────────────
      {
        slug: 'redis-basics',
        title: 'Redis: структуры и команды',
        description: 'String, Hash, List, Set, Sorted Set, Pub/Sub. Когда и зачем каждая структура.',
        tags: ['redis', 'cache'],
        interactive: true,
        section: 'Кэширование',
      },
      {
        slug: 'cache-patterns',
        title: 'Паттерны кэширования',
        description: 'Cache-aside, write-through, write-behind. Cache invalidation. Cache stampede и защита от него.',
        tags: ['cache', 'patterns'],
        interactive: true,
        section: 'Кэширование',
      },

      // ── Брокеры сообщений ────────────────────────────────────────
      {
        slug: 'rabbitmq-basics',
        title: 'RabbitMQ',
        description: 'Exchange типы, routing, очереди, ACK/NACK, Dead Letter Queue, retry с backoff.',
        tags: ['rabbitmq', 'messaging'],
        interactive: true,
        section: 'Брокеры сообщений',
      },
      {
        slug: 'kafka-basics',
        title: 'Apache Kafka',
        description: 'Топики, партиции, consumer groups, offset, retention. Когда Kafka, когда RabbitMQ.',
        tags: ['kafka', 'messaging'],
        interactive: true,
        section: 'Брокеры сообщений',
      },
      {
        slug: 'async-patterns',
        title: 'Паттерны асинхронности',
        description: 'Idempotent consumer, Outbox pattern, Saga. Гарантии доставки: at-least-once, exactly-once.',
        tags: ['patterns', 'messaging'],
        interactive: false,
        section: 'Брокеры сообщений',
      },

      // ── API дизайн ───────────────────────────────────────────────
      {
        slug: 'rest-api-design',
        title: 'REST API: принципы и практика',
        description: 'Ресурсы, методы, статус-коды, versioning, идемпотентность, rate limiting.',
        tags: ['rest', 'api'],
        interactive: true,
        section: 'API дизайн',
      },
      {
        slug: 'grpc-basics',
        title: 'gRPC и Protobuf',
        description: 'Protobuf-схема, унарные и стримовые вызовы, сравнение с REST, когда использовать.',
        tags: ['grpc', 'api'],
        interactive: false,
        section: 'API дизайн',
      },
      {
        slug: 'websocket-sse',
        title: 'WebSocket и SSE',
        description: 'Full-duplex соединение vs Server-Sent Events. Трейдинг, чаты, live-уведомления.',
        tags: ['websocket', 'realtime'],
        interactive: true,
        section: 'API дизайн',
      },

      // ── Безопасность ─────────────────────────────────────────────
      {
        slug: 'auth-jwt',
        title: 'JWT и сессии',
        description: 'Структура JWT, access/refresh токены, сессии. Где хранить, как инвалидировать.',
        tags: ['auth', 'security'],
        interactive: true,
        section: 'Безопасность',
      },
      {
        slug: 'oauth-openid',
        title: 'OAuth 2.0 и OpenID Connect',
        description: 'Authorization Code Flow, PKCE, refresh rotation. "Войти через Google" под капотом.',
        tags: ['oauth', 'auth'],
        interactive: true,
        section: 'Безопасность',
      },
      {
        slug: 'owasp-top10',
        title: 'OWASP Top 10',
        description: 'SQL injection, XSS, IDOR, SSRF и другие уязвимости — с примерами и защитой.',
        tags: ['security', 'owasp'],
        interactive: true,
        section: 'Безопасность',
      },

      // ── Архитектура ──────────────────────────────────────────────
      {
        slug: 'microservices',
        title: 'Монолит vs микросервисы',
        description: 'Когда монолит лучше. Признаки того, что пора делить. Strangler Fig, модульный монолит.',
        tags: ['architecture', 'microservices'],
        interactive: true,
        section: 'Архитектура',
      },
      {
        slug: 'architecture-patterns',
        title: 'Паттерны: Outbox, Saga, Circuit Breaker',
        description: 'Надёжные паттерны для распределённых систем. Когда и как применять каждый.',
        tags: ['patterns', 'architecture'],
        interactive: false,
        section: 'Архитектура',
      },
      {
        slug: 'system-design',
        title: 'System Design: с чего начать',
        description: 'Как подходить к задачам проектирования систем. URL shortener, паста, лента новостей.',
        tags: ['system-design', 'interview'],
        interactive: true,
        section: 'Архитектура',
      },

      // ── Инфраструктура ───────────────────────────────────────────
      {
        slug: 'docker-backend',
        title: 'Docker для бэкенда',
        description: 'Многоэтапные сборки, оптимизация образов, docker-compose для локальной разработки.',
        tags: ['docker', 'infra'],
        interactive: false,
        section: 'Инфраструктура',
      },
      {
        slug: 's3-storage',
        title: 'S3 хранилища',
        description: 'Объектное хранилище, presigned URL, прямая загрузка с клиента, бэкапы БД.',
        tags: ['s3', 'storage', 'infra'],
        interactive: false,
        section: 'Инфраструктура',
      },
    ],
  },

  {
    slug: 'devops',
    title: 'DevOps',
    description: 'CI/CD, Kubernetes, IaC, Observability, DevSecOps — карта доменов.',
    articles: [
      {
        slug: 'what-devops-knows',
        title: 'Что должен знать DevOps',
        description: 'Карта доменов: Linux, CI/CD, K8s, Cloud/IaC, Observability, DevSecOps — навыки по уровням.',
        tags: ['overview', 'roadmap'],
        interactive: true,
      },
      {
        slug: 'linux-basics',
        title: 'База по Linux',
        description: 'Процессы, файловая система, права доступа, сеть — фундамент для любого DevOps-инженера.',
        tags: ['linux', 'basics'],
        interactive: true,
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getArticle(courseSlug: string, articleSlug: string): Article | undefined {
  return getCourse(courseSlug)?.articles.find((a) => a.slug === articleSlug);
}
