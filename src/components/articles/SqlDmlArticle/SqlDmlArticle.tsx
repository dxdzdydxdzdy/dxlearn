import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { DmlPlayground } from './DmlPlayground';
import { QUIZ_QUESTIONS } from './quizData';
import s from './SqlDmlArticle.module.scss';

const SQL_GROUPS = [
  {
    short: 'DDL',
    full: 'Data Definition Language',
    cmds: 'CREATE · ALTER · DROP',
    desc: 'Определяет структуру: создаёт и изменяет таблицы, индексы, схемы.',
    active: false,
  },
  {
    short: 'DML',
    full: 'Data Manipulation Language',
    cmds: 'INSERT · UPDATE · DELETE',
    desc: 'Управляет данными: добавляет, изменяет и удаляет строки.',
    active: true,
  },
  {
    short: 'DQL',
    full: 'Data Query Language',
    cmds: 'SELECT',
    desc: 'Читает данные. Иногда включают в DML, но концептуально отдельно.',
    active: false,
  },
  {
    short: 'TCL',
    full: 'Transaction Control Language',
    cmds: 'COMMIT · ROLLBACK · SAVEPOINT',
    desc: 'Управляет транзакциями: подтверждает или отменяет изменения.',
    active: false,
  },
];

const PATTERNS = [
  {
    name: 'Soft Delete',
    color: '#00e5a0',
    when: 'Когда нужна история и возможность восстановить',
    desc: 'Не удаляем физически, а ставим метку. Везде добавляем WHERE deleted_at IS NULL.',
    code: `UPDATE items
SET deleted_at = NOW()
WHERE id = $1`,
  },
  {
    name: 'Upsert',
    color: '#4a9eff',
    when: 'Идемпотентная запись — "создай или обнови"',
    desc: 'INSERT + ON CONFLICT DO UPDATE. Одна атомарная операция вместо SELECT → INSERT/UPDATE.',
    code: `INSERT INTO sessions (user_id, token, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE
  SET token      = EXCLUDED.token,
      expires_at = EXCLUDED.expires_at`,
  },
  {
    name: 'Atomic counter',
    color: '#f0c040',
    when: 'Счётчики с конкурентным доступом',
    desc: 'UPDATE col = col + 1 — атомарно. SELECT + UPDATE — race condition.',
    code: `UPDATE posts
SET views = views + 1
WHERE id = $1
RETURNING views`,
  },
  {
    name: 'Bulk update',
    color: '#c96daa',
    when: 'Обновить разные строки разными значениями',
    desc: 'UPDATE FROM temp_table или батчевый INSERT ON CONFLICT DO UPDATE.',
    code: `UPDATE prices AS p
SET amount = t.new_amount
FROM (VALUES
  (1, 1500),
  (2, 2300)
) AS t(product_id, new_amount)
WHERE p.product_id = t.product_id`,
  },
];

export function SqlDmlArticle() {
  return (
    <div className={s.article}>

      {/* 1. SQL: четыре группы команд */}
      <section className={s.section}>
        <SectionTitle>SQL: четыре группы команд</SectionTitle>
        <p className={s.lead}>
          SQL — это не один язык, а семейство подъязыков. Каждая группа команд отвечает
          за свою зону ответственности. Эта статья — про DML: команды, которые
          записывают, изменяют и удаляют данные.
        </p>

        <div className={s.sqlGroups}>
          {SQL_GROUPS.map(g => (
            <div
              key={g.short}
              className={`${s.sqlGroupCard} ${g.active ? s['sqlGroupCard--active'] : ''}`}
            >
              <div className={s.sqlGroupName}>{g.short}</div>
              <div className={s.sqlGroupFull}>// {g.full}</div>
              <div className={s.sqlGroupCmds}>{g.cmds}</div>
              <div className={s.sqlGroupDesc}>{g.desc}</div>
            </div>
          ))}
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// почему DML важен</div>
          <div className={s.calloutText}>
            SELECT читает данные — это DQL. Но откуда данные берутся? Их вносят через INSERT.
            Как они обновляются? Через UPDATE. Как очищаются? Через DELETE.
            Каждый API-эндпоинт, который что-то меняет в базе, использует DML.
            Создание аккаунта — INSERT. Смена пароля — UPDATE. Удаление профиля — DELETE или soft-delete через UPDATE.
          </div>
        </div>
      </section>

      {/* 2. INSERT */}
      <section className={s.section}>
        <SectionTitle>INSERT — добавление строк</SectionTitle>
        <p className={s.lead}>
          INSERT добавляет одну или несколько новых строк в таблицу.
          Без INSERT база данных навсегда осталась бы пустой.
        </p>

        <CodeHighlight lang="sql" code={`-- Базовый синтаксис
INSERT INTO table_name (col1, col2, col3)
VALUES (val1, val2, val3);

-- Пример: добавить нового сотрудника
INSERT INTO users (name, dept_id, salary, age, city)
VALUES ('Мария', 1, 110000, 29, 'Москва');`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// всегда указывайте список колонок</div>
          <div className={s.calloutText}>
            <strong style={{ color: 'inherit' }}>Плохо:</strong>{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              INSERT INTO users VALUES (9, 'Олег', 1, 85000, 30, 'Москва')
            </code>
            <br /><br />
            Без списка колонок INSERT зависит от текущего порядка полей в таблице.
            Когда схема изменится (добавится новая колонка через ALTER TABLE) — запрос сломается молча
            или запишет данные не в те поля. Явный список колонок защищает от этого.
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Несколько строк за один запрос (эффективнее, чем N отдельных INSERT)
INSERT INTO orders (user_id, product, amount, status)
VALUES
  (1, 'Laptop', 85000, 'done'),
  (2, 'Monitor', 35000, 'pending'),
  (3, 'Keyboard', 8000, 'done');

-- INSERT ... RETURNING: получить автосгенерированный id обратно
INSERT INTO users (name, salary)
VALUES ('Анна', 95000)
RETURNING id, name;
-- → id=9, name='Анна'`} />

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// RETURNING: зачем?</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Получить auto-generated PRIMARY KEY сразу после вставки</li>
              <li className={s.colItem}>Атомарно — не нужен отдельный SELECT MAX(id)</li>
              <li className={s.colItem}>Безопасно при параллельных вставках</li>
              <li className={s.colItem}>Можно вернуть любые поля, включая вычисляемые</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// Node.js пример</div>
            <CodeHighlight lang="javascript" code={`const res = await pool.query(
  \`INSERT INTO users (name, email)
   VALUES ($1, $2)
   RETURNING id\`,
  [name, email]
);
const newUserId = res.rows[0].id;`} />
          </div>
        </div>
      </section>

      {/* 3. UPDATE */}
      <section className={s.section}>
        <SectionTitle>UPDATE — изменение данных</SectionTitle>
        <p className={s.lead}>
          UPDATE изменяет значения в уже существующих строках.
          Он нужен потому что данные в реальном мире меняются:
          пользователь обновляет профиль, статус заказа переходит из pending в done,
          цена товара индексируется.
        </p>

        <CodeHighlight lang="sql" code={`-- Синтаксис
UPDATE table_name
SET col1 = val1, col2 = val2
WHERE condition;

-- Изменить город одного пользователя
UPDATE users
SET city = 'Санкт-Петербург'
WHERE id = 4;

-- Повысить зарплату всему отделу (выражение в SET)
UPDATE users
SET salary = salary * 1.1
WHERE dept_id = 1;

-- Обновить несколько полей сразу + получить результат
UPDATE users
SET salary = 130000, city = 'Москва'
WHERE id = 3
RETURNING id, name, salary, city;`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// выражения в SET</div>
          <div className={s.infoText}>
            В SET можно использовать арифметику и ссылки на другие колонки той же строки:{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4db8ff' }}>
              salary = salary * 1.1
            </code>,{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4db8ff' }}>
              views = views + 1
            </code>,{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4db8ff' }}>
              balance = balance - amount
            </code>.{' '}
            Это атомарно: база читает старое значение и записывает новое за один шаг, без race condition.
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- UPDATE ... FROM: обновить с данными из другой таблицы
UPDATE employees e
SET salary = e.salary * 1.15
FROM departments d
WHERE e.dept_id = d.id
  AND d.title = 'Разработка';
-- Аналог UPDATE с JOIN — специфично для PostgreSQL`} />
      </section>

      {/* 4. DELETE */}
      <section className={s.section}>
        <SectionTitle>DELETE — удаление строк</SectionTitle>
        <p className={s.lead}>
          DELETE физически удаляет строки из таблицы. Он нужен для очистки устаревших
          данных, реализации GDPR-запросов на забывание, удаления черновиков и временных записей.
        </p>

        <CodeHighlight lang="sql" code={`-- Синтаксис
DELETE FROM table_name
WHERE condition;

-- Удалить отменённые заказы
DELETE FROM orders
WHERE status = 'cancelled';

-- Удалить пользователей без отдела (и узнать, кого удалили)
DELETE FROM users
WHERE dept_id IS NULL
RETURNING id, name, salary;

-- Удалить старые сессии (устаревшие токены)
DELETE FROM sessions
WHERE expires_at < NOW();`} />

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// DELETE vs TRUNCATE</div>
            <ul className={s.colList}>
              <li className={s.colItem}>DELETE умеет WHERE — удаляет выборочно</li>
              <li className={s.colItem}>DELETE поддерживает RETURNING</li>
              <li className={s.colItem}>TRUNCATE — только вся таблица целиком</li>
              <li className={s.colItem}>TRUNCATE быстрее для больших таблиц</li>
              <li className={s.colItem}>TRUNCATE сбрасывает SERIAL/SEQUENCE</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// когда использовать TRUNCATE</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Очистка таблицы логов или событий</li>
              <li className={s.colItem}>Сброс временных/тестовых данных</li>
              <li className={s.colItem}>ETL-процессы: truncate → reload</li>
              <li className={s.colItem}>Когда DELETE FROM ... занимает минуты</li>
            </ul>
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Очистить таблицу полностью (быстро)
TRUNCATE TABLE orders;

-- Или так (RESTART IDENTITY сбрасывает sequence):
TRUNCATE TABLE orders RESTART IDENTITY;`} />
      </section>

      {/* 5. Danger zone */}
      <section className={s.section}>
        <SectionTitle>⚠ Опасные операции</SectionTitle>
        <p className={s.lead}>
          UPDATE и DELETE без WHERE — одни из самых частых причин инцидентов в продакшне.
          Команды легальны, выполнятся мгновенно и затронут все строки.
        </p>

        <div className={s.warning}>
          <div className={s.warningLabel}>// продакшн-инцидент за 2 секунды</div>
          <div className={s.warningText}>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ff7b72' }}>
              UPDATE orders SET status = 'cancelled'
            </code>
            <br /><br />
            Если хотели отменить один заказ, но забыли WHERE — все заказы в системе стали cancelled.
            Откатить без бэкапа или транзакции нельзя. ROLLBACK возможен только если
            команда выполнялась внутри явной транзакции.
          </div>
        </div>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// как защититься</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Всегда запускать в транзакции: BEGIN; ...; ROLLBACK/COMMIT</li>
              <li className={s.colItem}>Сначала SELECT с тем же WHERE — убедиться что попадаем в нужные строки</li>
              <li className={s.colItem}>На проде: ограничения роли (REVOKE без условий)</li>
              <li className={s.colItem}>ORM-уровень: подтверждение операций без WHERE</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// безопасный паттерн</div>
            <CodeHighlight lang="sql" code={`-- 1. Открыть транзакцию
BEGIN;

-- 2. Посмотреть что будет затронуто
SELECT id, status FROM orders
WHERE user_id = 42;

-- 3. Выполнить UPDATE
UPDATE orders SET status = 'cancelled'
WHERE user_id = 42;

-- 4. Убедиться в результате
SELECT id, status FROM orders
WHERE user_id = 42;

-- 5. Подтвердить или откатить
COMMIT;  -- или ROLLBACK;`} />
          </div>
        </div>
      </section>

      {/* 6. RETURNING */}
      <section className={s.section}>
        <SectionTitle>RETURNING — получить изменённые строки</SectionTitle>
        <p className={s.lead}>
          RETURNING — PostgreSQL-расширение, которое возвращает строки после выполнения
          INSERT, UPDATE или DELETE. Это избавляет от дополнительного SELECT.
        </p>

        <CodeHighlight lang="sql" code={`-- INSERT: получить автосгенерированный id
INSERT INTO comments (post_id, text)
VALUES (10, 'Отличная статья')
RETURNING id, created_at;

-- UPDATE: увидеть новые значения
UPDATE users
SET last_login = NOW()
WHERE id = $1
RETURNING id, name, last_login;

-- DELETE: получить данные удалённых строк
DELETE FROM cart_items
WHERE user_id = $1
RETURNING product_id, quantity, price;
-- → можно записать в orders перед удалением из корзины`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// RETURNING в транзакции</div>
          <div className={s.infoText}>
            RETURNING особенно полезен в цепочках операций:
            INSERT в orders RETURNING id → используем id для INSERT в order_items.
            Или DELETE FROM cart RETURNING * → INSERT INTO purchase_history.
            Всё в одной транзакции, без промежуточных SELECT.
          </div>
        </div>
      </section>

      {/* 7. ON CONFLICT / UPSERT */}
      <section className={s.section}>
        <SectionTitle>ON CONFLICT — UPSERT</SectionTitle>
        <p className={s.lead}>
          Часто нужна операция «создай, если нет — обнови, если есть».
          Решение в лоб (SELECT → INSERT или UPDATE) создаёт race condition.
          PostgreSQL решает это через ON CONFLICT.
        </p>

        <CodeHighlight lang="sql" code={`-- DO NOTHING: вставить только если нет конфликта
INSERT INTO tags (name)
VALUES ('javascript')
ON CONFLICT (name) DO NOTHING;
-- Если 'javascript' уже есть → просто ничего не делаем, не ошибка

-- DO UPDATE SET: настоящий upsert
INSERT INTO user_settings (user_id, theme, language)
VALUES (42, 'dark', 'ru')
ON CONFLICT (user_id) DO UPDATE
  SET theme    = EXCLUDED.theme,
      language = EXCLUDED.language;
-- EXCLUDED — псевдотаблица с тем, что пытались вставить

-- Реальный пример: сессии пользователей
INSERT INTO sessions (user_id, token, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE
  SET token      = EXCLUDED.token,
      expires_at = EXCLUDED.expires_at
RETURNING token;`} />

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// DO NOTHING</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Вставка идемпотентна: выполни сколько угодно раз</li>
              <li className={s.colItem}>affected = 0, если конфликт (не ошибка!)</li>
              <li className={s.colItem}>Подходит для справочников и словарей</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// DO UPDATE SET</div>
            <ul className={s.colList}>
              <li className={s.colItem}>EXCLUDED содержит значения из VALUES</li>
              <li className={s.colItem}>Можно обновлять только часть колонок</li>
              <li className={s.colItem}>Атомарно: нет race condition</li>
              <li className={s.colItem}>Требует уникального ограничения на конфликтные колонки</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Playground */}
      <section className={s.section}>
        <SectionTitle>Интерактивный плейграунд</SectionTitle>
        <p className={s.body}>
          Попробуйте INSERT, UPDATE, DELETE и TRUNCATE на живой базе данных.
          Зелёная подсветка — вставленные строки, жёлтая — обновлённые.
          Кнопка «сброс» возвращает исходные данные.
        </p>
        <DmlPlayground />
      </section>

      {/* 9. Практические паттерны */}
      <section className={s.section}>
        <SectionTitle>Практические паттерны</SectionTitle>
        <p className={s.lead}>
          В реальных проектах DML используется не просто так, а по устоявшимся паттернам.
          Вот самые важные из них.
        </p>

        <div className={s.patternsGrid}>
          {PATTERNS.map(p => (
            <div key={p.name} className={s.patternCard} style={{ '--pc': p.color } as React.CSSProperties}>
              <div className={s.patternName}>{p.name}</div>
              <div className={s.patternWhen}>// {p.when}</div>
              <div className={s.patternDesc}>{p.desc}</div>
              <CodeHighlight lang="sql" code={p.code} />
            </div>
          ))}
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// audit log паттерн</div>
          <div className={s.calloutText}>
            Хотите знать кто и когда что изменил? Комбинируйте DML с RETURNING:
            после UPDATE записывайте старые и новые значения в таблицу audit_log.
            Или используйте триггеры (ON UPDATE, ON DELETE) — они срабатывают автоматически
            при любом DML без изменения кода приложения.
          </div>
        </div>
      </section>

      {/* 10. DML summary table */}
      <section className={s.section}>
        <SectionTitle>Краткая шпаргалка</SectionTitle>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Команда</th>
                <th>Что делает</th>
                <th>RETURNING</th>
                <th>WHERE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>INSERT</td>
                <td>Добавляет новые строки</td>
                <td>Новые значения (incl. generated id)</td>
                <td>Нет (только ON CONFLICT)</td>
              </tr>
              <tr>
                <td>UPDATE</td>
                <td>Изменяет существующие строки</td>
                <td>Строки с НОВЫМИ значениями</td>
                <td>Обязателен на проде!</td>
              </tr>
              <tr>
                <td>DELETE</td>
                <td>Удаляет строки</td>
                <td>Удалённые строки</td>
                <td>Обязателен на проде!</td>
              </tr>
              <tr>
                <td>TRUNCATE</td>
                <td>Очищает всю таблицу</td>
                <td>Нет</td>
                <td>Нет</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 11. Quiz */}
      <section className={s.section}>
        <SectionTitle>Тест</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
