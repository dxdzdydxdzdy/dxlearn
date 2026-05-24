import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'dml-1',
    difficulty: 'easy',
    question: 'Как в PostgreSQL получить id только что вставленной строки?',
    code: `INSERT INTO users (name, salary) VALUES ('Иван', 80000)`,
    options: [
      'Добавить RETURNING id в конец INSERT',
      'Выполнить SELECT MAX(id) FROM users',
      'Использовать LAST_INSERT_ID()',
      'Прочитать currval(\'sequence\') отдельным запросом',
    ],
    correct: 0,
    explanation:
      'RETURNING — стандартный PostgreSQL-способ получить значения из изменённых строк сразу в теле DML-запроса. SELECT MAX(id) опасен при конкурентных вставках. LAST_INSERT_ID() — функция MySQL.',
  },
  {
    id: 'dml-2',
    difficulty: 'easy',
    question: 'Что произойдёт при выполнении DELETE FROM users?',
    code: `DELETE FROM users`,
    options: [
      'Удалятся все строки таблицы',
      'Синтаксическая ошибка — WHERE обязателен',
      'Удалится только первая строка',
      'Операция заблокируется, пока не добавить WHERE',
    ],
    correct: 0,
    explanation:
      'DELETE без WHERE — валидный SQL, он удаляет все строки. WHERE не является обязательным, но на продакшне это катастрофа. Всегда проверяйте условие перед выполнением.',
  },
  {
    id: 'dml-3',
    difficulty: 'medium',
    question: 'Чем TRUNCATE TABLE orders отличается от DELETE FROM orders?',
    code: '',
    options: [
      'TRUNCATE быстрее (DDL, не пишет WAL построчно), сбрасывает SERIAL-счётчики, нельзя добавить WHERE',
      'TRUNCATE требует наличия WHERE-условия',
      'TRUNCATE удаляет только первые 1000 строк',
      'Они полностью идентичны по поведению',
    ],
    correct: 0,
    explanation:
      'TRUNCATE работает как DDL: очищает таблицу целиком без строчного журналирования (WAL), поэтому намного быстрее на больших таблицах. Побочный эффект — сброс SERIAL/SEQUENCE. В PostgreSQL TRUNCATE всё же транзакционен, в отличие от MySQL.',
  },
  {
    id: 'dml-4',
    difficulty: 'easy',
    question: 'Что произойдёт при выполнении этого UPDATE?',
    code: `UPDATE users SET salary = salary * 1.2`,
    options: [
      'Зарплата вырастет на 20% у ВСЕХ сотрудников',
      'Ошибка: WHERE обязателен для UPDATE',
      'Обновится только первая строка',
      'Ошибка: нельзя использовать expressions в SET',
    ],
    correct: 0,
    explanation:
      'UPDATE без WHERE обновляет все строки таблицы. Это легальный SQL. В SET можно использовать любые арифметические выражения, в том числе с другими колонками этой же строки.',
  },
  {
    id: 'dml-5',
    difficulty: 'easy',
    question: 'Какой синтаксис вставляет несколько строк за один запрос?',
    code: '',
    options: [
      'INSERT INTO t (c) VALUES (1), (2), (3)',
      'INSERT INTO t (c) VALUES (1); INSERT INTO t (c) VALUES (2); INSERT INTO t (c) VALUES (3)',
      'INSERT MULTIPLE INTO t (c) VALUES (1), (2), (3)',
      'INSERT INTO t (c) BULK VALUES (1), (2), (3)',
    ],
    correct: 0,
    explanation:
      'Стандартный SQL поддерживает многострочный INSERT через перечисление значений через запятую. Это намного эффективнее отдельных INSERT: база выполняет одну транзакцию и один парсинг запроса.',
  },
  {
    id: 'dml-6',
    difficulty: 'medium',
    question: 'Что именно возвращает RETURNING в UPDATE?',
    code: `UPDATE users
SET salary = salary * 1.1
WHERE dept_id = 1
RETURNING id, name, salary`,
    options: [
      'Строки с НОВЫМИ значениями (после обновления)',
      'Строки со СТАРЫМИ значениями (до обновления)',
      'Только количество обновлённых строк в виде числа',
      'RETURNING работает только в SELECT-запросах',
    ],
    correct: 0,
    explanation:
      'RETURNING в PostgreSQL возвращает строки уже после применения изменений. Если нужны старые значения — придётся SELECT перед UPDATE или использовать триггеры. В INSERT RETURNING тоже возвращает новые значения (включая auto-generated id).',
  },
  {
    id: 'dml-7',
    difficulty: 'hard',
    question: 'Что такое UPSERT и когда это используется?',
    code: `INSERT INTO sessions (user_id, token)
VALUES (42, 'abc123')
ON CONFLICT (user_id) DO UPDATE
  SET token = EXCLUDED.token`,
    options: [
      'Вставить строку; если конфликт уникального ключа — обновить существующую',
      'UPDATE если строка есть, INSERT если нет — отдельными запросами с проверкой',
      'Специальный синтаксис MERGE, синоним в PostgreSQL',
      'Тип транзакции с автоматическим ROLLBACK при конфликте',
    ],
    correct: 0,
    explanation:
      'UPSERT (INSERT ... ON CONFLICT DO UPDATE) — атомарная операция: если вставка нарушает уникальное ограничение, вместо ошибки выполняется UPDATE. EXCLUDED — псевдотаблица с "отклонёнными" значениями, которые пытались вставить.',
  },
  {
    id: 'dml-8',
    difficulty: 'medium',
    question: 'Чем опасен INSERT без явного списка колонок?',
    code: `-- Плохо:
INSERT INTO users VALUES (9, 'Олег', 1, 85000, 30, 'Москва')

-- Лучше:
INSERT INTO users (name, dept_id, salary, age, city)
VALUES ('Олег', 1, 85000, 30, 'Москва')`,
    options: [
      'При добавлении новой колонки в таблицу VALUES без списка сломается',
      'Нельзя опустить список колонок — это синтаксическая ошибка',
      'id должен всегда генерироваться автоматически',
      'Никакой разницы — оба варианта одинаково безопасны',
    ],
    correct: 0,
    explanation:
      'INSERT без списка колонок зависит от ТЕКУЩЕГО порядка и количества колонок таблицы. Когда схема изменится (ALTER TABLE ADD COLUMN) — запрос сломается. Явный список колонок защищает от этого и документирует намерение.',
  },
  {
    id: 'dml-9',
    difficulty: 'easy',
    question: 'Что вернёт DELETE с RETURNING?',
    code: `DELETE FROM orders
WHERE status = 'cancelled'
RETURNING id, user_id, product`,
    options: [
      'Строки, которые были удалены (id, user_id, product каждой удалённой строки)',
      'Строки, которые остались в таблице после удаления',
      'Просто число удалённых строк',
      'Ошибку: RETURNING не поддерживается в DELETE',
    ],
    correct: 0,
    explanation:
      'RETURNING в DELETE возвращает удалённые строки. Это удобно для аудита, отмены действий или записи в лог. Строки возвращаются с их значениями на момент удаления.',
  },
  {
    id: 'dml-10',
    difficulty: 'hard',
    question: 'Что такое Soft Delete и зачем он нужен?',
    code: `-- Вместо DELETE:
UPDATE items
SET deleted_at = NOW()
WHERE id = 42`,
    options: [
      'Пометить строку как удалённую через флаг/timestamp вместо физического удаления',
      'Удаление с транзакцией и ROLLBACK-страховкой',
      'DELETE с RETURNING для хранения удалённых строк в отдельной таблице',
      'Создание резервной копии таблицы перед DELETE',
    ],
    correct: 0,
    explanation:
      'Soft Delete — паттерн, когда данные не удаляются физически, а помечаются как удалённые. Преимущества: возможность восстановить, история изменений, нет нарушения FK. Минус: нужно везде добавлять WHERE deleted_at IS NULL.',
  },
  {
    id: 'dml-11',
    difficulty: 'medium',
    question: 'Что делает ON CONFLICT DO NOTHING?',
    code: `INSERT INTO tags (name)
VALUES ('javascript')
ON CONFLICT (name) DO NOTHING`,
    options: [
      'При нарушении уникального ограничения — игнорировать, не выдавать ошибку',
      'Пропускать все ограничения (UNIQUE, CHECK, FK)',
      'Добавить строку с новым автоматическим ID в любом случае',
      'Обновить существующую строку',
    ],
    correct: 0,
    explanation:
      'DO NOTHING — самый простой вариант UPSERT: при конфликте уникального ключа запрос тихо игнорирует вставку (affected = 0). Полезно для idempotent операций: "вставь, если ещё нет".',
  },
  {
    id: 'dml-12',
    difficulty: 'medium',
    question: 'Когда стоит использовать TRUNCATE вместо DELETE?',
    code: '',
    options: [
      'Нужно очистить всю таблицу быстро (логи, временные данные, тестовые данные)',
      'Нужно удалить строки по условию (WHERE)',
      'Нужно получить удалённые строки обратно через RETURNING',
      'Таблица связана через FOREIGN KEY и есть зависимые строки',
    ],
    correct: 0,
    explanation:
      'TRUNCATE оптимален для полной очистки: он не журналирует каждую строку, поэтому в 100-1000 раз быстрее DELETE на больших таблицах. Но нельзя TRUNCATE таблицу, на которую ссылается FOREIGN KEY с существующими данными.',
  },
  {
    id: 'dml-13',
    difficulty: 'hard',
    question: 'Что делает UPDATE с FROM?',
    code: `UPDATE employees e
SET salary = e.salary * 1.15
FROM departments d
WHERE e.dept_id = d.id
  AND d.title = 'Разработка'`,
    options: [
      'Обновляет строки employees, используя данные из departments для условия',
      'Обновляет обе таблицы одновременно',
      'Синтаксическая ошибка в PostgreSQL',
      'UPDATE внутри подзапроса FROM',
    ],
    correct: 0,
    explanation:
      'UPDATE ... FROM — PostgreSQL-расширение стандарта SQL. Позволяет джойнить другие таблицы для обновления: можно обновить зарплату сотрудников, ссылаясь на условие из departments. В стандартном SQL используют UPDATE ... WHERE col = (SELECT ...)',
  },
  {
    id: 'dml-14',
    difficulty: 'medium',
    question: 'Как атомарно увеличить счётчик, не теряя значение при конкурентном доступе?',
    code: `-- Что выбрать?
-- A: SELECT + UPDATE
-- B: UPDATE counter = counter + 1`,
    options: [
      'UPDATE t SET counter = counter + 1 WHERE id = ? — база сама блокирует строку',
      'SELECT counter; потом UPDATE t SET counter = <прочитанное + 1>',
      'LOCK TABLE t; SELECT; UPDATE; UNLOCK',
      'Использовать INSERT ON CONFLICT',
    ],
    correct: 0,
    explanation:
      'UPDATE col = col + 1 — атомарная операция: база блокирует строку на время UPDATE, читает текущее значение и записывает новое за один шаг. SELECT + UPDATE — race condition: между SELECT и UPDATE другой процесс успеет изменить значение.',
  },
  {
    id: 'dml-15',
    difficulty: 'hard',
    question: 'Что делает EXCLUDED в ON CONFLICT DO UPDATE?',
    code: `INSERT INTO prices (product_id, amount)
VALUES (5, 1500)
ON CONFLICT (product_id) DO UPDATE
  SET amount = EXCLUDED.amount`,
    options: [
      'EXCLUDED — псевдотаблица с данными, которые пытались вставить',
      'EXCLUDED — псевдотаблица с текущими данными в таблице',
      'EXCLUDED — список исключённых колонок из обновления',
      'EXCLUDED — синоним для DEFAULT в ON CONFLICT',
    ],
    correct: 0,
    explanation:
      'EXCLUDED — специальная псевдотаблица в PostgreSQL, которая содержит значения из VALUES, которые "не прошли" из-за конфликта. EXCLUDED.amount = 1500 (то, что пытались вставить). Используется в DO UPDATE SET чтобы обновить строку именно новыми значениями.',
  },
];
