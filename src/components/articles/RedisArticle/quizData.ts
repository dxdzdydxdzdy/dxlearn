import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'redis-1',
    difficulty: 'easy',
    question: 'Почему Redis работает на порядки быстрее PostgreSQL для чтения?',
    code: `// PostgreSQL: диск → RAM → CPU
// Redis:      RAM → CPU`,
    options: [
      'Redis хранит данные в оперативной памяти — нет обращений к диску',
      'Redis использует более эффективный язык запросов',
      'Redis компрессирует данные перед хранением',
      'Redis кеширует результаты SQL-запросов',
    ],
    correct: 0,
    explanation:
      'Redis in-memory: все данные в RAM. Чтение из памяти ~100 нс, с диска ~10 мс — разница в 100 000 раз. GET/SET на Redis: >100 000 операций/сек на одном ядре. Цена: данные теряются при перезапуске без persistence (RDB/AOF).',
  },
  {
    id: 'redis-2',
    difficulty: 'easy',
    question: 'Что вернёт команда GET для несуществующего ключа?',
    code: `127.0.0.1:6379> GET nonexistent_key`,
    options: [
      '(nil) — ключ не существует',
      '(error) KEY NOT FOUND',
      'null',
      '(integer) 0',
    ],
    correct: 0,
    explanation:
      'Redis возвращает (nil) — аналог null. В клиентских библиотеках это обычно null/None/nil. Важно отличать (nil) от пустой строки "". Используй EXISTS key чтобы явно проверить существование.',
  },
  {
    id: 'redis-3',
    difficulty: 'medium',
    question: 'Когда использовать Hash вместо String для хранения объекта?',
    code: `// Вариант A — один String:
SET user:42 '{"name":"Alice","role":"admin","email":"a@b.com"}'

// Вариант B — Hash:
HSET user:42 name Alice role admin email a@b.com`,
    options: [
      'Hash когда нужно обновлять отдельные поля без перезаписи всего объекта',
      'String всегда лучше — меньше команд для GET',
      'Hash только для числовых значений',
      'Они идентичны — разница только в синтаксисе',
    ],
    correct: 0,
    explanation:
      'Hash: HSET user:42 role superadmin — обновляет только одно поле. String: нужно GET → распарсить JSON → изменить → SET — три операции, не атомарно. Также Hash экономит память для маленьких объектов (Redis оптимизирует хранение hash до 128 полей).',
  },
  {
    id: 'redis-4',
    difficulty: 'easy',
    question: 'Почему INCR безопаснее чем GET + 1 + SET?',
    code: `// Два запроса одновременно читают counter = 5
// Оба прибавляют 1 и пишут 6
// Результат: 6 вместо 7 — потеряна одна операция`,
    options: [
      'INCR атомарен — никакой другой команды между чтением и записью нет',
      'INCR быстрее — одна операция вместо трёх',
      'INCR работает с числами, GET возвращает строку',
      'INCR автоматически создаёт ключ со значением 0',
    ],
    correct: 0,
    explanation:
      'Redis однопоточный: команды выполняются строго последовательно. INCR — атомарная операция чтение+инкремент+запись без возможности race condition. GET→parse→+1→SET — три отдельных команды, между которыми другой клиент может вклиниться.',
  },
  {
    id: 'redis-5',
    difficulty: 'medium',
    question: 'LRANGE queue 0 -1 — что означает -1?',
    code: `127.0.0.1:6379> RPUSH queue a b c d e
127.0.0.1:6379> LRANGE queue 0 -1`,
    options: [
      '-1 — последний элемент, LRANGE 0 -1 возвращает весь список',
      '-1 — начало с конца, удаляет последний элемент',
      '-1 — ошибка, индексы только положительные',
      '-1 означает бесконечность — вернёт все элементы начиная с 0',
    ],
    correct: 0,
    explanation:
      'Redis поддерживает отрицательные индексы: -1 = последний, -2 = предпоследний. LRANGE key 0 -1 — весь список. LRANGE key -3 -1 — последние 3 элемента. Аналогично в GETRANGE для строк.',
  },
  {
    id: 'redis-6',
    difficulty: 'medium',
    question: 'Чем Set отличается от List для хранения уникальных значений?',
    code: `// List:
RPUSH tags redis redis database cache redis
// → ["redis","redis","database","cache","redis"] — дубликаты

// Set:
SADD tags redis redis database cache redis`,
    options: [
      'Set автоматически дедуплицирует — добавление существующего элемента игнорируется',
      'Set быстрее для добавления в начало',
      'Set поддерживает порядок вставки, List нет',
      'Set хранит только числа, List только строки',
    ],
    correct: 0,
    explanation:
      'Set: уникальные значения, O(1) для SADD/SISMEMBER/SREM. SCARD вернёт 3 (redis, database, cache). List: допускает дубликаты, сохраняет порядок. Для тегов, разрешений, уникальных посетителей — Set. Для очередей, истории — List.',
  },
  {
    id: 'redis-7',
    difficulty: 'hard',
    question: 'Что такое "score" в Sorted Set и для чего он нужен?',
    code: `ZADD leaderboard 2300 "bob" 1500 "alice" 1800 "carol"
ZREVRANGE leaderboard 0 -1 WITHSCORES`,
    options: [
      'Числовое значение для сортировки — ZRANGE возвращает элементы по возрастанию score',
      'Уникальный ID члена в sorted set',
      'Количество раз когда элемент был добавлен',
      'TTL отдельного элемента в sorted set',
    ],
    correct: 0,
    explanation:
      'Score — float64, определяет порядок. ZRANGE — по возрастанию, ZREVRANGE — по убыванию. ZINCRBY — атомарное изменение score. Применения: leaderboard (score = очки), rate limiting (score = timestamp), очередь по приоритету (score = priority).',
  },
  {
    id: 'redis-8',
    difficulty: 'medium',
    question: 'TTL вернул -2 для ключа. Что это значит?',
    code: `127.0.0.1:6379> TTL some_key
(integer) -2`,
    options: [
      '-2 — ключ не существует (истёк или не создавался)',
      '-2 — TTL не установлен, ключ постоянный',
      '-2 — TTL истекает через 2 секунды',
      '-2 — ошибка конфигурации',
    ],
    correct: 0,
    explanation:
      'TTL возвращает: положительное число — секунд до истечения, -1 — ключ существует но без TTL (постоянный), -2 — ключ не существует. После истечения TTL Redis автоматически удаляет ключ. PERSIST key — убрать TTL.',
  },
  {
    id: 'redis-9',
    difficulty: 'medium',
    question: 'Как реализовать rate limiting через Redis?',
    code: `// 100 запросов в минуту на IP
// Каждый запрос:`,
    options: [
      'INCR ip:{ip}:{minute} → если > 100: 429. EXPIRE устанавливается при первом инкременте',
      'SET ip:{ip} counter и проверять вручную',
      'LPUSH в список и считать LLEN',
      'Хранить в PostgreSQL — Redis для кеша, не rate limiting',
    ],
    correct: 0,
    explanation:
      'Паттерн: const count = await redis.incr(`rate:${ip}:${minute}`); if (count === 1) await redis.expire(`rate:${ip}:${minute}`, 60); if (count > 100) throw TooManyRequests. INCR атомарен — нет race condition. Ключ автоматически удаляется через минуту.',
  },
  {
    id: 'redis-10',
    difficulty: 'easy',
    question: 'Что такое паттерн "Cache-Aside" (Lazy Loading)?',
    code: `// Запрос данных:
// 1. Проверить Redis
// 2. Если нет — взять из БД и положить в Redis
// 3. Вернуть данные`,
    options: [
      'Приложение само управляет кешем: read-through только при cache miss',
      'Redis автоматически синхронизируется с PostgreSQL',
      'Писать одновременно в Redis и БД при любом изменении',
      'Кешировать только POST запросы',
    ],
    correct: 0,
    explanation:
      'Cache-Aside: GET → Redis miss → DB read → Redis SET → return. Плюсы: простота, кешируются только реально запрошенные данные. Минусы: первый запрос медленный (cold start), нужна явная инвалидация при обновлении данных.',
  },
  {
    id: 'redis-11',
    difficulty: 'easy',
    question: 'Почему KEYS * опасен на production?',
    code: `127.0.0.1:6379> KEYS *
// Миллионы ключей...`,
    options: [
      'KEYS блокирует Redis на время выполнения — сервер не отвечает на другие запросы',
      'KEYS * возвращает секретные данные',
      'KEYS работает только в development окружении',
      'KEYS требует прав администратора',
    ],
    correct: 0,
    explanation:
      'Redis однопоточный. KEYS * на миллионах ключей может занять секунды — всё это время сервер заморожен. В production используй SCAN (итерационный, не блокирует): SCAN 0 MATCH user:* COUNT 100 → возвращает курсор для следующей итерации.',
  },
  {
    id: 'redis-12',
    difficulty: 'hard',
    question: 'Pub/Sub в Redis — что происходит с сообщениями если subscriber offline?',
    code: `// Publisher:
PUBLISH notifications "user:42 logged in"

// Subscriber был offline в этот момент`,
    options: [
      'Сообщение теряется — Pub/Sub не хранит историю, только live доставка',
      'Сообщение ожидает в очереди пока subscriber не подключится',
      'Сообщение сохраняется в List автоматически',
      'Redis переотправляет при следующем подключении subscriber',
    ],
    correct: 0,
    explanation:
      'Redis Pub/Sub: fire-and-forget. Нет персистентности, нет ACK. Если subscriber offline — сообщение потеряно. Для надёжной доставки: Redis Streams (XADD/XREAD) с consumer groups и ACK, или BullMQ поверх Redis Lists/Streams.',
  },
  {
    id: 'redis-13',
    difficulty: 'medium',
    question: 'Что делает SINTER?',
    code: `SADD day1:visitors alice bob carol dave
SADD day2:visitors bob carol eve
SINTER day1:visitors day2:visitors`,
    options: [
      'Возвращает пересечение — элементы присутствующие во всех указанных множествах',
      'Объединяет два множества в одно новое',
      'Вычитает второе множество из первого',
      'Возвращает уникальные элементы только в первом множестве',
    ],
    correct: 0,
    explanation:
      'SINTER возвращает пересечение: {bob, carol} — те кто был оба дня. SUNION — объединение {alice, bob, carol, dave, eve}. SDIFF day1 day2 — только в day1 {alice, dave}. Set операции O(N) где N — размер меньшего множества.',
  },
  {
    id: 'redis-14',
    difficulty: 'hard',
    question: 'Redis транзакция MULTI/EXEC — что происходит при ошибке внутри?',
    code: `MULTI
SET user:42:name "Alice"
INCR user:42:age        // age = "Alice" — ошибка типа!
SET user:42:role "admin"
EXEC`,
    options: [
      'Ошибочная команда пропускается, остальные выполняются — нет атомарного rollback',
      'При первой ошибке весь EXEC отменяется',
      'EXEC не выполняется если есть ошибки в блоке',
      'Redis автоматически откатывает все изменения',
    ],
    correct: 0,
    explanation:
      'Redis транзакции: MULTI/EXEC выполняет все команды блока. Ошибки типа (WRONGTYPE) возникают в runtime — остальные команды продолжают работать. Нет rollback! Для атомарных операций с проверками используй Lua-скрипты (EVAL) — они действительно атомарны.',
  },
  {
    id: 'redis-15',
    difficulty: 'medium',
    question: 'Как хранить сессию пользователя в Redis?',
    code: `// express-session + connect-redis
// Что происходит под капотом?`,
    options: [
      'HSET session:{id} userId 42 role admin ... + EXPIRE session:{id} 86400',
      'SET session:{id} "{json}" без TTL',
      'LPUSH sessions userId + EXPIRE',
      'Сессии хранятся только в памяти Node.js, Redis не используется',
    ],
    correct: 0,
    explanation:
      'Сессия в Redis: Hash для структурированных данных + EXPIRE для автоматической очистки. Плюсы: мгновенная инвалидация (DEL session:{id} = logout), масштабирование (все серверы читают из одного Redis), автоматическое истечение. 1 млн активных сессий ≈ ~100MB RAM.',
  },
];
