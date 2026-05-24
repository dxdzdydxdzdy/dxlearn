import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'idx-1',
    difficulty: 'easy',
    question: 'Что происходит с запросом, если на колонку в WHERE нет индекса?',
    code: `SELECT * FROM users WHERE salary > 100000`,
    options: [
      'Sequential Scan: база проверяет каждую строку таблицы',
      'Ошибка: нельзя использовать WHERE без индекса',
      'Index Scan по ближайшему подходящему индексу',
      'Запрос кешируется и выполняется из памяти',
    ],
    correct: 0,
    explanation:
      'Без индекса PostgreSQL делает Sequential Scan (Seq Scan): читает каждую строку и проверяет условие. На таблице из 8 строк — 8 проверок. На таблице из 10 миллионов — 10 миллионов проверок.',
  },
  {
    id: 'idx-2',
    difficulty: 'easy',
    question: 'Для каких ограничений PostgreSQL создаёт B-tree индекс автоматически?',
    code: `CREATE TABLE users (
  id      SERIAL PRIMARY KEY,  -- ?
  email   TEXT UNIQUE           -- ?
);`,
    options: [
      'PRIMARY KEY и UNIQUE — оба создают индекс автоматически',
      'Только PRIMARY KEY',
      'Только UNIQUE',
      'Ни один — нужно создавать вручную',
    ],
    correct: 0,
    explanation:
      'PostgreSQL автоматически создаёт B-tree индекс для PRIMARY KEY и UNIQUE-ограничений. FOREIGN KEY — нет, нужно создавать вручную (это частая ошибка новичков).',
  },
  {
    id: 'idx-3',
    difficulty: 'medium',
    question: 'Почему индекс замедляет INSERT, UPDATE, DELETE?',
    code: `INSERT INTO users (name, salary) VALUES ('Иван', 95000);
-- salary имеет индекс`,
    options: [
      'При каждой записи PostgreSQL должен обновить B-tree структуру индекса',
      'Индекс блокирует таблицу на время операции',
      'Индекс хранит копию данных — нужна двойная запись',
      'Индекс замедляет только DELETE, на INSERT не влияет',
    ],
    correct: 0,
    explanation:
      'Индекс — это дерево, которое хранится отдельно и должно быть в актуальном состоянии. При каждом INSERT/UPDATE/DELETE PostgreSQL перестраивает дерево: находит нужную позицию и обновляет узлы. Чем больше индексов — тем дороже каждая запись.',
  },
  {
    id: 'idx-4',
    difficulty: 'medium',
    question: 'Составной индекс (last_name, first_name). Для каких запросов он будет использован?',
    code: `CREATE INDEX idx_name ON users (last_name, first_name);`,
    options: [
      'WHERE last_name = ? и WHERE last_name = ? AND first_name = ?',
      'Только WHERE last_name = ? AND first_name = ? (оба условия)',
      'WHERE first_name = ? и WHERE last_name = ? AND first_name = ?',
      'Любая комбинация из last_name и first_name в любом порядке',
    ],
    correct: 0,
    explanation:
      'Составной индекс работает слева направо (leftmost prefix rule). Индекс (a, b) покрывает WHERE a = ? и WHERE a = ? AND b = ?, но НЕ WHERE b = ? — потому что без a нельзя войти в B-tree с нужной стороны.',
  },
  {
    id: 'idx-5',
    difficulty: 'hard',
    question: 'Какой тип индекса подходит для поиска по JSONB и массивам?',
    code: `-- Таблица с тегами:
-- tags TEXT[]  или  meta JSONB

SELECT * FROM posts WHERE tags @> ARRAY['postgresql']`,
    options: [
      'GIN (Generalized Inverted Index) — инвертированный индекс для составных типов',
      'B-tree — стандартный и самый быстрый',
      'Hash — точечный поиск по хэшу',
      'BRIN — для больших таблиц с последовательными данными',
    ],
    correct: 0,
    explanation:
      'GIN (Generalized Inverted Index) — инвертированный индекс. Для каждого элемента массива/ключа JSONB хранит список документов, в которых он встречается. Идеален для операций @>, ?&, @@. B-tree не умеет индексировать "внутрь" составных типов.',
  },
  {
    id: 'idx-6',
    difficulty: 'easy',
    question: 'Что делает CREATE INDEX CONCURRENTLY?',
    code: `-- Обычный:
CREATE INDEX idx_salary ON users (salary);

-- Конкурентный:
CREATE INDEX CONCURRENTLY idx_salary ON users (salary);`,
    options: [
      'Создаёт индекс без блокировки таблицы — читать и писать можно во время создания',
      'Создаёт индекс быстрее, используя несколько процессоров',
      'Создаёт индекс в фоне, таблица недоступна до завершения',
      'Только для таблиц с параллельными транзакциями',
    ],
    correct: 0,
    explanation:
      'Обычный CREATE INDEX блокирует запись в таблицу пока строится индекс. CONCURRENTLY позволяет читать и писать одновременно, но строит индекс дольше и в два прохода. На продакшне почти всегда нужен CONCURRENTLY.',
  },
  {
    id: 'idx-7',
    difficulty: 'medium',
    question: 'Что означает "Seq Scan" в выводе EXPLAIN ANALYZE?',
    code: `EXPLAIN ANALYZE
SELECT * FROM users WHERE salary > 100000;

-- Seq Scan on users  (cost=0.00..1.08 rows=4 width=52)
--                    (actual time=0.012..0.021 rows=4 loops=1)`,
    options: [
      'PostgreSQL читает таблицу строчку за строчкой, индекс не используется',
      'PostgreSQL использует индекс и делает 4 обращения к нему',
      'Ошибка: нужно создать индекс для salary',
      'Запрос выполнится в 1.08 миллисекунды',
    ],
    correct: 0,
    explanation:
      'Seq Scan (Sequential Scan) — полное сканирование таблицы. cost=0.00..1.08 — оценочная стоимость (относительные единицы планировщика, не миллисекунды). actual time — реальное время. rows=4 — реально найдено 4 строки.',
  },
  {
    id: 'idx-8',
    difficulty: 'hard',
    question: 'Что такое Partial Index и в чём его преимущество?',
    code: `-- Обычный:
CREATE INDEX idx_status ON orders (status);

-- Partial:
CREATE INDEX idx_pending ON orders (status)
WHERE status = 'pending';`,
    options: [
      'Индексирует только строки по условию WHERE — меньше размер, быстрее для этого подмножества',
      'Частично строит индекс для ускорения операции CREATE INDEX',
      'Индексирует только часть колонок составного индекса',
      'Доступен только в PostgreSQL Enterprise',
    ],
    correct: 0,
    explanation:
      'Partial Index включает только строки, удовлетворяющие WHERE-условию. Если у вас 99% заказов "done" и 1% "pending", обычный индекс на status имеет низкую селективность. Partial index на WHERE status = \'pending\' маленький и эффективный для обработки очереди.',
  },
  {
    id: 'idx-9',
    difficulty: 'medium',
    question: 'Когда индекс НЕ поможет и планировщик выберет Seq Scan?',
    code: `-- Колонка status содержит только 2 значения: 'active' и 'inactive'
-- В таблице 1 000 000 строк, 50% active, 50% inactive

SELECT * FROM users WHERE status = 'active'`,
    options: [
      'Низкая кардинальность (мало уникальных значений) — читать 500K строк через индекс дороже Seq Scan',
      'Всегда выберет Seq Scan — индексы работают только для числовых колонок',
      'Индекс поможет — нужно просто создать его',
      'Планировщик всегда использует индекс если он есть',
    ],
    correct: 0,
    explanation:
      'При низкой кардинальности (status = active соответствует 50% строк) индекс может быть медленнее Seq Scan. Чтобы вернуть 500K строк, PostgreSQL сделал бы 500K случайных обращений к таблице через индекс, что дороже одного последовательного прохода. Планировщик это учитывает.',
  },
  {
    id: 'idx-10',
    difficulty: 'easy',
    question: 'Создаётся ли индекс для FOREIGN KEY в PostgreSQL автоматически?',
    code: `CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id)  -- FK
);`,
    options: [
      'Нет — нужно создать вручную: CREATE INDEX ON orders (user_id)',
      'Да, PostgreSQL создаёт B-tree индекс автоматически',
      'Зависит от версии PostgreSQL',
      'Только если FK объявлен как UNIQUE',
    ],
    correct: 0,
    explanation:
      'PostgreSQL НЕ создаёт индекс для FK автоматически — это классическая ловушка. Без индекса на user_id каждый JOIN users JOIN orders, каждый SELECT по user_id, и каждый DELETE пользователя (проверка каскадов) будет делать Seq Scan по orders.',
  },
  {
    id: 'idx-11',
    difficulty: 'hard',
    question: 'Что такое Covering Index (INCLUDE) и зачем он нужен?',
    code: `CREATE INDEX idx_covering ON orders (user_id)
INCLUDE (product, amount);

SELECT product, amount FROM orders WHERE user_id = 5;`,
    options: [
      'Index Only Scan: все нужные данные берутся из индекса без обращения к таблице',
      'Покрывает все колонки таблицы в одном индексе',
      'Ускоряет INSERT/UPDATE, добавляя дополнительные колонки в дерево',
      'Синоним для составного индекса (user_id, product, amount)',
    ],
    correct: 0,
    explanation:
      'INCLUDE добавляет колонки в leaf-узлы B-tree без участия в сортировке. Это позволяет Index Only Scan: если запрос запрашивает только user_id, product, amount — PostgreSQL берёт всё прямо из индекса, не обращаясь к основной таблице (heap). Быстрее особенно при cold cache.',
  },
  {
    id: 'idx-12',
    difficulty: 'hard',
    question: 'Когда использовать BRIN индекс вместо B-tree?',
    code: `-- Таблица логов с 500 миллионами строк
-- Новые строки всегда добавляются в конец
CREATE INDEX idx_brin ON events USING BRIN (created_at);`,
    options: [
      'Очень большие таблицы где данные физически хранятся в порядке вставки (логи, метрики)',
      'Для точечного поиска по уникальным значениям',
      'Для поиска по массивам и JSONB',
      'Всегда — BRIN быстрее B-tree в PostgreSQL',
    ],
    correct: 0,
    explanation:
      'BRIN (Block Range INdex) хранит только min/max значений для каждого блока данных. Занимает ничтожно мало места. Работает только когда данные физически упорядочены (time-series, auto-increment id). Для таблицы 500M строк B-tree индекс займёт десятки GB, BRIN — мегабайты.',
  },
  {
    id: 'idx-13',
    difficulty: 'medium',
    question: 'Что показывает команда EXPLAIN (ANALYZE, BUFFERS)?',
    code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE user_id = 3;`,
    options: [
      'Реальное время выполнения, число строк + обращения к буферному кешу и диску',
      'Только оценочную стоимость (cost) без реального выполнения',
      'Синтаксический анализ запроса без выполнения',
      'Список индексов, которые подходят для запроса',
    ],
    correct: 0,
    explanation:
      'EXPLAIN без ANALYZE — только план без выполнения. ANALYZE — выполняет запрос и показывает actual time/rows. BUFFERS — добавляет статистику: hits (из кэша), reads (с диска), dirtied (изменено). Buffers read > 0 означает обращения к диску, что дорого.',
  },
  {
    id: 'idx-14',
    difficulty: 'medium',
    question: 'Что такое кардинальность (cardinality) и зачем она важна для индексов?',
    code: `-- Высокая кардинальность:
SELECT * FROM users WHERE email = 'alice@example.com'  -- один уникальный email

-- Низкая кардинальность:
SELECT * FROM users WHERE country = 'RU'  -- может быть 80% от всех строк`,
    options: [
      'Количество уникальных значений в колонке. Высокая кардинальность = хороший кандидат',
      'Размер индекса в байтах',
      'Количество строк в таблице',
      'Глубина B-tree дерева',
    ],
    correct: 0,
    explanation:
      'Кардинальность — число уникальных значений. email (каждый уникален) — высокая кардинальность, идеальный кандидат для индекса. country (мало вариантов) — низкая, индекс почти не помогает. Правило: индекс эффективен когда он отсекает большую часть строк.',
  },
  {
    id: 'idx-15',
    difficulty: 'hard',
    question: 'Как проверить, используется ли созданный индекс в реальном запросе?',
    code: `-- Создали индекс:
CREATE INDEX idx_salary ON users (salary);

-- Как проверить что он работает?`,
    options: [
      'EXPLAIN ANALYZE SELECT ... — в плане должно быть "Index Scan using idx_salary"',
      'SELECT * FROM pg_indexes WHERE tablename = \'users\'',
      'SHOW INDEX FROM users',
      'pg_stat_user_indexes — смотреть idx_scan > 0',
    ],
    correct: 0,
    explanation:
      'EXPLAIN ANALYZE покажет реальный план: "Index Scan using idx_salary" — используется; "Seq Scan" — не используется (возможно, планировщику невыгодно или статистика устарела). pg_stat_user_indexes.idx_scan показывает накопленное число использований индекса — тоже полезно для audit.',
  },
];
