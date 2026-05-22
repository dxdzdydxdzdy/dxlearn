'use client';

import { useState } from 'react';
import s from './BackendDomainExplorer.module.scss';

type Level = 'junior' | 'middle' | 'senior';
interface Skill { text: string; note?: string; }
interface InterviewQ { q: string; hint: string; level: Level; }
interface Domain {
  id: string; icon: string; name: string; color: string; tagline: string;
  tools: string[]; skills: Record<Level, Skill[]>; questions: InterviewQ[];
}

const DOMAINS: Domain[] = [
  {
    id: 'lang', icon: '🐍', name: 'Язык и рантайм', color: '#00e5a0',
    tagline: 'Фундамент. Не язык важен — важны концепции.',
    tools: ['Python', 'Go', 'Java', 'Node.js', 'asyncio', 'threading', 'multiprocessing', 'venv'],
    skills: {
      junior: [
        { text: 'Синтаксис, встроенные типы, стандартная библиотека' },
        { text: 'ООП: классы, наследование, инкапсуляция, полиморфизм' },
        { text: 'Исключения: try/except/finally, кастомные Exception' },
        { text: 'Пакеты и зависимости: pip, venv, requirements.txt' },
        { text: 'Работа с файлами, JSON, переменными окружения' },
      ],
      middle: [
        { text: 'CPU-bound vs IO-bound — что использовать и когда', note: 'Частый вопрос на собеседовании' },
        { text: 'async/await, event loop, coroutines' },
        { text: 'GIL (Python): почему asyncio обходит, threading — нет' },
        { text: 'Декораторы, контекстные менеджеры, генераторы' },
        { text: 'Профилирование: cProfile, memory_profiler, py-spy' },
      ],
      senior: [
        { text: 'Устройство рантайма: CPython internals, bytecode' },
        { text: 'Garbage collection, memory model, WeakRef' },
        { text: 'Метапрограммирование: metaclass, __slots__, дескрипторы' },
        { text: 'C-расширения, Cython, ctypes для CPU-задач' },
      ],
    },
    questions: [
      { level: 'junior', q: 'В чём разница list и tuple? Когда что использовать?', hint: 'Tuple иммутабелен, hashable — можно как ключ dict. List — для изменяемых последовательностей. Tuple быстрее для fixed-size данных.' },
      { level: 'middle', q: 'Объясни GIL и почему asyncio решает проблему IO, но не CPU.', hint: 'GIL = один поток выполняет Python bytecode одновременно. IO-bound: thread отпускает GIL на системных вызовах. asyncio — кооперативная многозадачность в одном потоке. CPU-bound → multiprocessing.' },
      { level: 'middle', q: 'Что такое event loop и как он работает?', hint: 'Цикл, берущий задачи из очереди. await = "я жду IO, возьми другую задачу". Один поток, но высокая конкурентность для IO. Блокирующий вызов внутри async = блокирует весь loop.' },
      { level: 'senior', q: 'Как найти утечку памяти в Python-сервисе в проде?', hint: 'memory_profiler или tracemalloc (в коде). py-spy или memray без изменения кода. Смотреть граф объектов: objgraph. Часто: циклические ссылки, глобальные коллекции, не закрытые ресурсы.' },
    ],
  },
  {
    id: 'db', icon: '🗄️', name: 'Базы данных', color: '#4e9eff',
    tagline: 'Сердце любого проекта. Знание SQL открывает двери.',
    tools: ['PostgreSQL', 'MongoDB', 'ClickHouse', 'Redis', 'SQLAlchemy', 'Alembic', 'Prisma'],
    skills: {
      junior: [
        { text: 'SQL: SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY' },
        { text: 'JOIN: INNER, LEFT, RIGHT — когда какой' },
        { text: 'Индексы: зачем нужны, B-tree индекс' },
        { text: 'ORM basics: модели, запросы, миграции' },
        { text: 'Разница SQL (PostgreSQL) и NoSQL (MongoDB)' },
      ],
      middle: [
        { text: 'Транзакции и ACID: атомарность, консистентность, изоляция', note: 'Обязательно знать' },
        { text: 'EXPLAIN ANALYZE — читать план запроса, находить seq scan' },
        { text: 'Нормализация (1NF–3NF) и когда нарушать намеренно' },
        { text: 'N+1 проблема в ORM и как решить (eager loading, select_related)' },
        { text: 'Репликация: master-slave, read replica' },
      ],
      senior: [
        { text: 'Шардирование и партиционирование таблиц' },
        { text: 'Window functions, CTE, lateral joins' },
        { text: 'Проектирование схемы под нагрузку: оценка объёма, денормализация' },
        { text: 'Connection pooling: PgBouncer, почему важен' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Чем PostgreSQL отличается от MongoDB? Когда выбирать NoSQL?', hint: 'PostgreSQL: реляционная, схема, JOIN, транзакции. MongoDB: гибкая схема, документы. NoSQL подходит когда сущности имеют сильно разные поля или нужна горизонтальная масштабируемость "из коробки".' },
      { level: 'middle', q: 'Что такое N+1 проблема? Покажи пример.', hint: '1 запрос за списком → N запросов за деталями каждого. User.query.all() + user.posts для каждого. Решение: joinedload, prefetch_related, DataLoader (GraphQL).' },
      { level: 'middle', q: 'Объясни уровни изоляции транзакций.', hint: 'READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. Компромисс между консистентностью и производительностью. Postgres default: READ COMMITTED.' },
      { level: 'senior', q: 'Как спроектировать таблицу уведомлений для 1M пользователей?', hint: 'Оценить объём: 1M users × 100 notif × 50 bytes = 5GB. Партиционирование по user_id или дате. Индекс (user_id, created_at DESC). Возможно: JSONB для метаданных вместо 100 столбцов.' },
    ],
  },
  {
    id: 'api', icon: '🔌', name: 'API дизайн', color: '#f0c040',
    tagline: 'Контракт между сервисами. REST — основа, gRPC — скорость.',
    tools: ['REST', 'gRPC', 'GraphQL', 'WebSocket', 'OpenAPI/Swagger', 'FastAPI', 'Django REST'],
    skills: {
      junior: [
        { text: 'HTTP методы: GET, POST, PUT, PATCH, DELETE — семантика' },
        { text: 'Статус коды: 2xx, 3xx, 4xx, 5xx и конкретные (200, 201, 400, 401, 403, 404, 422, 500)' },
        { text: 'REST принципы: ресурсы, URL дизайн, JSON' },
        { text: 'Swagger/OpenAPI: читать документацию, тестировать' },
      ],
      middle: [
        { text: 'Versioning API: /v1/, header-based, deprecation' },
        { text: 'Rate limiting, throttling — зачем и как' },
        { text: 'Идемпотентность: GET/PUT/DELETE idempotent, POST — нет' },
        { text: 'WebSocket: когда нужен, отличие от HTTP', note: 'Трейдинг, чаты, live-updates' },
        { text: 'gRPC: Protobuf, streaming, когда лучше REST' },
      ],
      senior: [
        { text: 'API Gateway: routing, auth, rate limit, observability' },
        { text: 'GraphQL: resolver, N+1 в GQL, DataLoader, federation' },
        { text: 'Contract-first design: OpenAPI → codegen' },
        { text: 'Backward compatibility: как не сломать клиентов при изменении' },
      ],
    },
    questions: [
      { level: 'junior', q: 'В каком случае использовать PUT, а в каком PATCH?', hint: 'PUT = полная замена ресурса (нужно передать все поля). PATCH = частичное обновление (только изменённые поля). PUT идемпотентен — повторный вызов даёт тот же результат.' },
      { level: 'middle', q: 'Чем gRPC лучше REST? В каких случаях его стоит выбирать?', hint: 'gRPC: бинарный протокол (Protobuf), строгая типизация, streaming, HTTP/2. Быстрее и компактнее. Выбирать: межсервисное взаимодействие, когда важна скорость. REST — для public API (удобнее клиентам).' },
      { level: 'middle', q: 'Что такое идемпотентность и почему это важно для API?', hint: 'Идемпотентный запрос = одинаковый результат при повторных вызовах. Важно при retry после сбоя: GET/PUT/DELETE — идемпотентны, POST — нет. Решение: idempotency key в заголовке.' },
      { level: 'senior', q: 'Как версионировать API без breaking changes?', hint: 'Стратегии: URL (/v1/, /v2/), заголовки (Accept-Version), query param. Deprecated поля оставлять, добавлять новые. Feature flags. Consumer-driven contract tests (Pact).' },
    ],
  },
  {
    id: 'cache', icon: '⚡', name: 'Кэширование', color: '#b48eff',
    tagline: 'Скорость и экономия. Redis — стандарт де-факто.',
    tools: ['Redis', 'Memcached', 'Cache-aside', 'Write-through', 'CDN', 'HTTP Cache'],
    skills: {
      junior: [
        { text: 'Зачем кэш: скорость доступа RAM vs диск vs сеть' },
        { text: 'Redis: SET, GET, TTL, базовые структуры' },
        { text: 'Когда НЕ кэшировать: данные всегда должны быть свежими' },
      ],
      middle: [
        { text: 'Cache-aside (lazy loading) vs write-through vs write-behind' },
        { text: 'Cache invalidation — одна из двух сложных задач в CS', note: 'Шутка, которая правда' },
        { text: 'Redis structures: Hash, List, Set, Sorted Set, Pub/Sub' },
        { text: 'TTL стратегии: absolute, sliding, event-based invalidation' },
        { text: 'HTTP кэш: Cache-Control, ETag, CDN' },
      ],
      senior: [
        { text: 'Cache stampede (thundering herd): как защититься (probabilistic early expiration, lock)' },
        { text: 'Hot keys проблема: шардирование, local cache + distributed' },
        { text: 'Redis Cluster: шардирование, consistency trade-offs' },
        { text: 'Cache warming: как прогреть кэш после деплоя' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Зачем Redis, если данные уже есть в PostgreSQL?', hint: 'Redis хранит в RAM → доступ ~0.1ms против 10-50ms для БД. Снижает нагрузку на БД. Подходит для: сессий, часто читаемых справочников, rate limiting counters, pub/sub.' },
      { level: 'middle', q: 'Что такое cache invalidation и почему это сложно?', hint: 'Инвалидация = удалить устаревший кэш при изменении данных. Сложно: нужно знать, какие ключи зависят от изменившихся данных. Стратегии: TTL (простой, может быть stale), event-driven (точно, сложнее).' },
      { level: 'senior', q: 'Что такое cache stampede и как решить?', hint: 'Истёк TTL у популярного ключа → 1000 запросов одновременно идут в БД. Решения: (1) distributed lock, (2) probabilistic early expiration (продлевать до истечения), (3) background refresh.' },
      { level: 'senior', q: 'Как организовать кэш для данных которые часто пишутся?', hint: 'Write-through: писать одновременно в кэш и БД. Write-behind (write-back): писать в кэш, асинхронно — в БД (риск потери данных). Или: не кэшировать, оптимизировать саму БД.' },
    ],
  },
  {
    id: 'async', icon: '📨', name: 'Брокеры & очереди', color: '#ff9f43',
    tagline: 'Надёжная асинхронная связь между сервисами.',
    tools: ['RabbitMQ', 'Kafka', 'Celery', 'Redis Streams', 'NATS', 'AWS SQS'],
    skills: {
      junior: [
        { text: 'Producer/Consumer паттерн — зачем нужна очередь' },
        { text: 'Разница синхронной (HTTP) и асинхронной (broker) коммуникации' },
        { text: 'Celery + Redis/RabbitMQ: запустить фоновую задачу' },
      ],
      middle: [
        { text: 'RabbitMQ vs Kafka: когда что выбирать', note: 'Частый вопрос' },
        { text: 'Dead Letter Queue (DLQ): что делать с упавшими сообщениями' },
        { text: 'Acknowledge/NACK: гарантии доставки at-least-once' },
        { text: 'Retry стратегии с exponential backoff' },
        { text: 'Idempotent consumer: что делать с дублями' },
      ],
      senior: [
        { text: 'Exactly-once delivery: насколько реально и как реализовать' },
        { text: 'Event sourcing + CQRS: когда применять' },
        { text: 'Kafka partitioning: гарантии порядка, consumer groups' },
        { text: 'Backpressure: как не утопить consumer под нагрузкой' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Зачем нужен брокер сообщений? Нельзя просто HTTP использовать?', hint: 'HTTP синхронный: если получатель упал — сообщение потеряно. Брокер хранит сообщение, пока получатель не обработает. Также: decoupling сервисов, fan-out (один → много получателей), буферизация пиков.' },
      { level: 'middle', q: 'Чем RabbitMQ отличается от Kafka?', hint: 'RabbitMQ: сообщение удаляется после ACK, routing через exchange, push-модель. Kafka: лог событий, сообщения хранятся по retention policy, pull-модель, replay. Kafka для потоков данных и нагруженных систем; RabbitMQ — для task queues.' },
      { level: 'middle', q: 'Что такое Dead Letter Queue и зачем она нужна?', hint: 'Очередь для сообщений, которые не удалось обработать (N попыток, TTL истёк, rejection). Без DLQ: сообщение теряется или блокирует очередь. С DLQ: можно расследовать, переотправить после исправления бага.' },
      { level: 'senior', q: 'Как обеспечить exactly-once processing?', hint: 'Теоретически сложно из-за двойных сбоев. На практике: idempotent consumer (проверяй message_id в БД перед обработкой) + транзакция на обработку + ACK. Kafka Transactions для producer-side exactly-once.' },
    ],
  },
  {
    id: 'sec', icon: '🔐', name: 'Безопасность & Auth', color: '#ff5f6a',
    tagline: 'В каждом приложении. Ошибки здесь — катастрофа.',
    tools: ['JWT', 'OAuth 2.0', 'bcrypt', 'argon2', 'OWASP', 'HTTPS/TLS', 'RBAC'],
    skills: {
      junior: [
        { text: 'Хэширование паролей: bcrypt/argon2 (не MD5, не SHA256)', note: 'Критически важно' },
        { text: 'JWT: структура (header.payload.signature), где хранить' },
        { text: 'HTTPS: зачем нужен, что защищает' },
        { text: 'Базовая защита: SQL injection, XSS' },
      ],
      middle: [
        { text: 'OAuth 2.0: Authorization Code Flow, PKCE' },
        { text: 'Access + Refresh токены: зачем два, rotation' },
        { text: 'RBAC: роли и разрешения, реализация' },
        { text: 'OWASP Top 10: знать каждый пункт', note: 'Спрашивают на собеседованиях' },
        { text: '2FA: TOTP (Google Authenticator), как работает' },
      ],
      senior: [
        { text: 'mTLS: взаимная аутентификация сервисов' },
        { text: 'Secrets management: Vault, не хранить секреты в коде/ENV образа' },
        { text: 'Security audit: SAST/DAST в CI, dependency scanning' },
        { text: 'Threat modeling: STRIDE, как думать как атакующий' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Почему нельзя хранить пароли в MD5 или SHA-256?', hint: 'MD5/SHA — быстрые. Злоумышленник с GPU делает миллиарды хэшей/сек (rainbow tables, brute force). bcrypt/argon2 — специально медленные: cost factor настраивается. Плюс: соль против rainbow tables.' },
      { level: 'middle', q: 'JWT можно декодировать без секрета. Это уязвимость?', hint: 'Нет. Payload — base64, не зашифрован, просто encoded. Данные в нём открыты. Зашифровать можно JWE. Но подпись (signature) гарантирует, что токен не изменён. Не хранить секреты в payload.' },
      { level: 'middle', q: 'Зачем нужен refresh token, если есть access token?', hint: 'Access token — короткоживущий (15 мин), можно хранить в памяти. Refresh — долгоживущий, хранится в httpOnly cookie. При краже access token — ущерб ограничен. Refresh rotation: при использовании выдаётся новый, старый инвалидируется.' },
      { level: 'senior', q: 'Опиши OAuth 2.0 Authorization Code Flow с PKCE.', hint: 'Client → Auth Server (auth_url + code_challenge). User логинится. Auth Server → redirect с code. Client → token_endpoint (code + code_verifier). Зачем PKCE: защита от перехвата code в публичных клиентах (SPA, mobile).' },
    ],
  },
  {
    id: 'infra', icon: '🚀', name: 'Инфраструктура', color: '#48dbfb',
    tagline: 'Backend-разработчик должен уметь задеплоить своё приложение.',
    tools: ['Docker', 'Docker Compose', 'CI/CD', 'Nginx', 'S3', 'Prometheus', 'Sentry'],
    skills: {
      junior: [
        { text: 'Docker: Dockerfile, образы, контейнеры, volumes' },
        { text: 'Docker Compose: поднять БД + сервис + Redis локально' },
        { text: 'Переменные окружения: .env, 12-factor app принципы' },
        { text: 'Логирование: structlog/loguru, уровни, куда писать' },
      ],
      middle: [
        { text: 'CI/CD: GitHub Actions / GitLab CI — build, test, deploy' },
        { text: 'Nginx: reverse proxy, SSL termination, static files' },
        { text: 'S3 хранилища: presigned URL, прямая загрузка с фронта' },
        { text: 'Мониторинг: метрики приложения (Prometheus), алерты' },
        { text: 'Graceful shutdown: SIGTERM → завершить обработку → выйти' },
      ],
      senior: [
        { text: 'Kubernetes основы: Pod, Deployment, Service, Ingress' },
        { text: 'Observability: metrics + logs + traces (OpenTelemetry)' },
        { text: 'Performance testing: Locust, k6, анализ узких мест' },
        { text: 'Disaster recovery: backup, restore, RTO/RPO' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Зачем хранить конфигурацию в ENV, а не в коде?', hint: '12-factor app: конфиг меняется между окружениями (dev/stage/prod), код — нет. ENV: не попадает в git, не нужно перепаковывать образ при смене конфига. Секреты в ENV образа небезопасны — используй secrets manager.' },
      { level: 'middle', q: 'Что такое graceful shutdown и зачем он нужен?', hint: 'Получить SIGTERM → перестать принимать новые запросы → дождаться завершения текущих → закрыть соединения с БД → выйти. Без этого: при деплое можно прервать обработку запроса на середине, потерять данные.' },
      { level: 'middle', q: 'Что такое presigned URL в S3 и зачем он нужен?', hint: 'Временная URL с подписью, по которой клиент может напрямую загрузить/скачать файл из S3 без прохождения через бэкенд. Преимущество: файл не проходит через сервер дважды, экономия bandwidth и CPU.' },
      { level: 'senior', q: 'Как мониторить бэкенд-приложение в проде?', hint: 'Три столпа: Metrics (Prometheus → Grafana), Logs (structlog → Loki), Traces (OpenTelemetry → Tempo/Jaeger). Alerts на SLO нарушения. Sentry для исключений. RED метод: Rate, Errors, Duration.' },
    ],
  },
  {
    id: 'arch', icon: '🏛️', name: 'Архитектура', color: '#ff6b9d',
    tagline: 'Монолит → сервисы → микросервисы. Каждый шаг — сознательное решение.',
    tools: ['Microservices', 'DDD', 'Clean Architecture', 'CQRS', 'Event Sourcing', 'API Gateway'],
    skills: {
      junior: [
        { text: 'Что такое монолит и в чём его преимущества' },
        { text: 'MVC / Repository / Service Layer паттерны' },
        { text: 'SOLID принципы — хотя бы S и D', note: 'Почти всегда спрашивают' },
        { text: 'Dependency Injection: зачем и как' },
      ],
      middle: [
        { text: 'Микросервисы: когда стоит, когда — оверинжиниринг' },
        { text: 'Clean Architecture / Hexagonal: зачем слои' },
        { text: 'Паттерны: Saga, Outbox, Circuit Breaker' },
        { text: 'System design основы: как разделить монолит' },
      ],
      senior: [
        { text: 'DDD: Bounded Context, Aggregate, Domain Events' },
        { text: 'CQRS + Event Sourcing: плюсы и цена' },
        { text: 'CAP теорема: консистентность vs доступность' },
        { text: 'System design interview: URL shortener, паста-сайт, Twitter' },
      ],
    },
    questions: [
      { level: 'junior', q: 'В чём преимущество монолита над микросервисами?', hint: 'Монолит: проще разрабатывать, дебажить, деплоить. Нет сетевых задержек между сервисами. Транзакции простые. Старт быстрее. Микросервисы решают проблемы масштабирования команды и независимых деплоев — нужны когда монолит реально мешает.' },
      { level: 'middle', q: 'Что такое паттерн Outbox и зачем он нужен?', hint: 'Проблема: записать в БД + отправить событие в брокер атомарно нельзя. Outbox: пишем и запись, и событие в одну транзакцию в БД. Отдельный процесс читает outbox и отправляет в брокер. Гарантирует at-least-once delivery.' },
      { level: 'middle', q: 'Что такое Circuit Breaker?', hint: 'Паттерн защиты от каскадных сбоев. Состояния: Closed (работает) → Open (ошибок много, сразу отказывать) → Half-Open (проверить, восстановился ли). Предотвращает накопление ошибок когда зависимый сервис упал.' },
      { level: 'senior', q: 'CAP теорема: что означает в контексте выбора базы данных?', hint: 'Consistency, Availability, Partition tolerance — выбери два. В реальности partition неизбежны → выбор между CP (PostgreSQL, HBase — консистентность, может быть недоступна) и AP (Cassandra, DynamoDB — всегда отвечает, но может быть stale).' },
    ],
  },
];

const LEVELS: Level[] = ['junior', 'middle', 'senior'];
const LEVEL_LABELS: Record<Level, string> = { junior: 'Junior', middle: 'Middle', senior: 'Senior' };
const LEVEL_COLORS: Record<Level, string> = { junior: '#00e5a0', middle: '#4e9eff', senior: '#b48eff' };

export function BackendDomainExplorer() {
  const [selected, setSelected] = useState('db');
  const [level, setLevel] = useState<Level>('middle');
  const [tab, setTab] = useState<'skills' | 'questions'>('skills');

  const domain = DOMAINS.find(d => d.id === selected)!;
  const filteredQ = domain.questions.filter(q => q.level === level);

  return (
    <div className={s.explorer}>
      <div className={s.header}>
        <span className={s.title}>// backend-domain-explorer</span>
        <div className={s.levelTabs}>
          {LEVELS.map(l => (
            <button key={l}
              className={`${s.levelTab} ${level === l ? s.levelTabActive : ''}`}
              style={{ '--lc': LEVEL_COLORS[l] } as React.CSSProperties}
              onClick={() => setLevel(l)}>
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.domainList}>
          {DOMAINS.map(d => (
            <button key={d.id}
              className={`${s.domainBtn} ${selected === d.id ? s.domainBtnActive : ''}`}
              style={{ '--dc': d.color } as React.CSSProperties}
              onClick={() => setSelected(d.id)}>
              <span className={s.domainIcon}>{d.icon}</span>
              <span className={s.domainName}>{d.name}</span>
            </button>
          ))}
        </div>

        <div className={s.detail} style={{ '--dc': domain.color } as React.CSSProperties}>
          <div className={s.detailHeader}>
            <div className={s.detailTitle}>
              <span className={s.detailIcon}>{domain.icon}</span>
              {domain.name}
            </div>
            <div className={s.detailTagline}>{domain.tagline}</div>
            <div className={s.toolList}>
              {domain.tools.map(t => <span key={t} className={s.tool}>{t}</span>)}
            </div>
          </div>

          <div className={s.detailTabs}>
            <button className={`${s.detailTab} ${tab === 'skills' ? s.detailTabActive : ''}`}
              onClick={() => setTab('skills')}>навыки {LEVEL_LABELS[level]}</button>
            <button className={`${s.detailTab} ${tab === 'questions' ? s.detailTabActive : ''}`}
              onClick={() => setTab('questions')}>
              вопросы {filteredQ.length > 0 ? `(${filteredQ.length})` : ''}
            </button>
          </div>

          {tab === 'skills' && (
            <div className={s.skillList}>
              {domain.skills[level].map((skill, i) => (
                <div key={i} className={s.skillItem}>
                  <span className={s.skillCheck} style={{ color: LEVEL_COLORS[level] }}>▸</span>
                  <div>
                    <span className={s.skillText}>{skill.text}</span>
                    {skill.note && <span className={s.skillNote}> — {skill.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'questions' && (
            <div className={s.questionList}>
              {filteredQ.length === 0
                ? <div className={s.noQ}>Нет вопросов для этого уровня</div>
                : filteredQ.map((q, i) => <QuestionCard key={i} q={q} levelColor={LEVEL_COLORS[level]} />)
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ q, levelColor }: { q: InterviewQ; levelColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.qCard} onClick={() => setOpen(o => !o)}>
      <div className={s.qRow}>
        <span className={s.qMark} style={{ color: levelColor }}>?</span>
        <span className={s.qText}>{q.q}</span>
        <span className={s.qToggle}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className={s.qHint}>
          <span className={s.qHintLabel}>подсказка: </span>{q.hint}
        </div>
      )}
    </div>
  );
}
