import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { OnDeleteDemo } from './OnDeleteDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './DbKeysArticle.module.scss';

const KEY_CARDS = [
  {
    name: 'PRIMARY KEY',
    color: '#00e5a0',
    props: [
      'Уникальность + NOT NULL — два в одном',
      'Только один на таблицу',
      'Автоматически создаёт уникальный индекс',
      'Может быть составным (из нескольких колонок)',
    ],
  },
  {
    name: 'FOREIGN KEY',
    color: '#4db8ff',
    props: [
      'Ссылается на PK или UNIQUE другой таблицы',
      'Запрещает «висячие» ссылки',
      'Управляет поведением при удалении/обновлении родителя',
      'Индекс автоматически НЕ создаётся — делай сам!',
    ],
  },
  {
    name: 'UNIQUE',
    color: '#d2a679',
    props: [
      'Запрещает дубликаты значений',
      'В отличие от PK — разрешает NULL (несколько NULL в разных строках)',
      'Автоматически создаёт уникальный индекс',
      'Несколько UNIQUE на одну таблицу — нормально',
    ],
  },
  {
    name: 'CHECK',
    color: '#b08de0',
    props: [
      'Произвольное булево условие для значения',
      'Проверяется при INSERT и UPDATE',
      'Индекс не создаётся',
      'Примеры: age >= 0, status IN (...), price > 0',
    ],
  },
];

const ON_DELETE_ACTIONS = [
  {
    action: 'CASCADE',
    behavior: 'Дочерние строки удаляются автоматически',
    when: 'Лог событий, позиции заказа — потеряли смысл без родителя',
  },
  {
    action: 'SET NULL',
    behavior: 'FK-столбец дочерних строк становится NULL',
    when: 'Сотрудник остаётся в системе после закрытия отдела',
  },
  {
    action: 'RESTRICT',
    behavior: 'Ошибка сразу — удаление запрещено пока есть дочерние строки',
    when: 'Счёт нельзя удалить пока есть транзакции по нему',
  },
  {
    action: 'NO ACTION',
    behavior: 'Как RESTRICT, но проверка — в конце SQL-выражения',
    when: 'Когда нужны отложенные (DEFERRABLE) проверки в транзакции',
  },
  {
    action: 'SET DEFAULT',
    behavior: 'FK-столбец получает значение DEFAULT этой колонки',
    when: 'Редко. Нужен DEFAULT у FK-столбца, иначе ошибка',
  },
];

export function DbKeysArticle() {
  return (
    <div className={s.article}>

      {/* 1. Зачем ключи */}
      <section className={s.section}>
        <SectionTitle>Зачем нужны ключи</SectionTitle>
        <p className={s.lead}>
          Без ключей реляционная база — просто набор таблиц без гарантий. Можно вставить двух пользователей
          с одинаковым id, создать заказ для несуществующего клиента, записать возраст «−5».
          Ключи — это ограничения целостности, которые СУБД проверяет автоматически при каждом
          INSERT и UPDATE.
        </p>
        <p className={s.body}>
          Классически целостность данных делят на три вида — это классификация Кодда из реляционной теории.
        Позднее ряд учебников и документация Microsoft SQL Server добавили четвёртый вид:
        бизнес-правила, которые не укладываются в стандартные ограничения СУБД и требуют триггеров или логики приложения.
        </p>
        <div className={s.keyGrid}>
          <div style={{ '--kc': '#00e5a0' } as React.CSSProperties} className={s.keyCard}>
            <div className={s.keyName}>Сущностная</div>
            <ul className={s.keyProps}>
              <li className={s.keyProp}>Каждая строка однозначно идентифицируема</li>
              <li className={s.keyProp}>Обеспечивается PRIMARY KEY</li>
            </ul>
          </div>
          <div style={{ '--kc': '#4db8ff' } as React.CSSProperties} className={s.keyCard}>
            <div className={s.keyName}>Ссылочная</div>
            <ul className={s.keyProps}>
              <li className={s.keyProp}>Нет «висячих» ссылок на несуществующие строки</li>
              <li className={s.keyProp}>Обеспечивается FOREIGN KEY</li>
            </ul>
          </div>
          <div style={{ '--kc': '#d2a679' } as React.CSSProperties} className={s.keyCard}>
            <div className={s.keyName}>Доменная</div>
            <ul className={s.keyProps}>
              <li className={s.keyProp}>Значения соответствуют допустимым диапазонам</li>
              <li className={s.keyProp}>Обеспечивается UNIQUE, CHECK, NOT NULL</li>
            </ul>
          </div>
          <div style={{ '--kc': '#b08de0' } as React.CSSProperties} className={s.keyCard}>
            <div className={s.keyName}>Пользовательская ¹</div>
            <ul className={s.keyProps}>
              <li className={s.keyProp}>Бизнес-правила, не выразимые стандартными ограничениями</li>
              <li className={s.keyProp}>Пример: один активный тариф на клиента в любой момент</li>
              <li className={s.keyProp}>Реализуется через триггеры или логику приложения</li>
            </ul>
          </div>
        </div>
        <p className={s.body}>
          ¹ Четвёртый вид — расширение классификации, которое добавляют некоторые учебники
          и документация Microsoft SQL Server. В оригинальную теорию Кодда он не входит.
        </p>
      </section>

      {/* 2. Обзор всех типов */}
      <section className={s.section}>
        <SectionTitle>Четыре основных ключа</SectionTitle>
        <div className={s.keyGrid}>
          {KEY_CARDS.map(k => (
            <div
              key={k.name}
              className={s.keyCard}
              style={{ '--kc': k.color } as React.CSSProperties}
            >
              <div className={s.keyName}>{k.name}</div>
              <ul className={s.keyProps}>
                {k.props.map(p => (
                  <li key={p} className={s.keyProp}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PRIMARY KEY */}
      <section className={s.section}>
        <SectionTitle>PRIMARY KEY — идентификатор строки</SectionTitle>
        <p className={s.lead}>
          Первичный ключ однозначно идентифицирует каждую строку таблицы.
          PostgreSQL создаёт уникальный B-tree индекс автоматически.
        </p>

        <CodeHighlight lang="sql" code={`-- Вариант 1: SERIAL (4 байта, автоинкремент)
CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Вариант 2: BIGSERIAL (8 байт, для больших таблиц)
CREATE TABLE events (
  id        BIGSERIAL PRIMARY KEY,
  payload   JSONB
);

-- Вариант 3: UUID (16 байт, глобально уникальный)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INT REFERENCES users(id)
);

-- Вариант 4: явная последовательность через GENERATED
CREATE TABLE orders (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amount     NUMERIC(12,2)
);`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// составной первичный ключ</div>
          <div className={s.calloutText}>
            PK может состоять из нескольких колонок — тогда уникальной должна быть их комбинация.
            Типичный случай — таблица-связка M:N (пользователь ↔ роль):
            один пользователь может иметь одну роль только раз.
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Составной PK в таблице-связке
CREATE TABLE user_roles (
  user_id INT REFERENCES users(id)  ON DELETE CASCADE,
  role_id INT REFERENCES roles(id)  ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)  -- комбинация уникальна
);

-- Нельзя: один пользователь — дважды одна роль
INSERT INTO user_roles VALUES (1, 2);  -- OK
INSERT INTO user_roles VALUES (1, 2);  -- ERROR: duplicate key`} />
      </section>

      {/* 4. FOREIGN KEY */}
      <section className={s.section}>
        <SectionTitle>FOREIGN KEY — ссылочная целостность</SectionTitle>
        <p className={s.lead}>
          Внешний ключ гарантирует, что значение в одной таблице ссылается на существующую строку
          в другой. Без FK можно вставить заказ с <code>user_id = 999</code> — пользователя нет, а заказ есть.
        </p>

        <CodeHighlight lang="sql" code={`CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  dept_id  INT REFERENCES departments(id) ON DELETE SET NULL
  --              ↑ краткий синтаксис ↑
);

-- Полный синтаксис с именованием ограничения:
ALTER TABLE users
  ADD CONSTRAINT fk_users_dept
  FOREIGN KEY (dept_id)
  REFERENCES departments(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;`} />

        <div className={s.warning}>
          <div className={s.warningLabel}>// критически важно</div>
          <div className={s.warningText}>
            PostgreSQL <strong>не создаёт индекс</strong> на FK-столбце автоматически.
            При удалении/обновлении родительской строки — полный перебор дочерней таблицы.
            На таблице из 10 млн строк это катастрофа. Всегда создавай индекс вручную:
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Обязательно после объявления FK:
CREATE INDEX idx_users_dept_id    ON users  (dept_id);
CREATE INDEX idx_orders_user_id   ON orders (user_id);

-- Проверить, какие FK остались без индекса:
SELECT
  c.conrelid::regclass  AS table,
  a.attname             AS column,
  c.conname             AS constraint
FROM pg_constraint c
JOIN pg_attribute   a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid
      AND (i.indkey::int[])[0:array_length(c.conkey,1)-1] @> c.conkey::int[]
  );`} />

        <h3 style={{ fontSize: 'var(--text-md, 1rem)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 0, marginBottom: 0 }}>
          ON DELETE — поведение при удалении родителя
        </h3>
        <p className={s.body}>Выбери действие и нажми кнопку — посмотри, что произойдёт с дочерними строками.</p>

        <OnDeleteDemo />

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Действие</th>
                <th>Что происходит с дочерними строками</th>
                <th>Когда применять</th>
              </tr>
            </thead>
            <tbody>
              {ON_DELETE_ACTIONS.map(r => (
                <tr key={r.action}>
                  <td>{r.action}</td>
                  <td>{r.behavior}</td>
                  <td>{r.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. UNIQUE */}
      <section className={s.section}>
        <SectionTitle>UNIQUE — уникальность без идентификации</SectionTitle>
        <p className={s.lead}>
          UNIQUE запрещает дубликаты, но это не первичный ключ — он может быть NULL,
          и таких ограничений может быть несколько на одной таблице.
        </p>

        <CodeHighlight lang="sql" code={`CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE,          -- автоматом создаст уникальный индекс
  phone      TEXT UNIQUE,          -- и ещё один индекс
  username   TEXT NOT NULL UNIQUE,

  -- Составной UNIQUE: комбинация уникальна, а не каждое поле по отдельности
  CONSTRAINT uq_users_name_per_dept UNIQUE (name, dept_id)
);

-- NULL — особый случай: несколько NULL не считаются дубликатами
INSERT INTO users (email) VALUES (NULL);  -- OK
INSERT INTO users (email) VALUES (NULL);  -- OK тоже!
INSERT INTO users (email) VALUES ('a@b.com'); -- OK
INSERT INTO users (email) VALUES ('a@b.com'); -- ERROR: duplicate key`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// UNIQUE NULLS NOT DISTINCT (PostgreSQL 15+)</div>
          <div className={s.infoText}>
            Начиная с PostgreSQL 15 можно изменить поведение для NULL:
            <code> UNIQUE NULLS NOT DISTINCT</code> — тогда второй NULL будет считаться дубликатом первого.
            До 15-й версии — только через частичный индекс:
            <code> CREATE UNIQUE INDEX ON users (email) WHERE email IS NOT NULL;</code>
          </div>
        </div>
      </section>

      {/* 6. CHECK */}
      <section className={s.section}>
        <SectionTitle>CHECK — пользовательская валидация</SectionTitle>
        <p className={s.lead}>
          CHECK позволяет задать произвольное условие — СУБД проверит его при каждом INSERT и UPDATE.
          Это дешевле, чем валидация в приложении, и надёжнее: данные не испортятся даже при прямом SQL-доступе.
        </p>

        <CodeHighlight lang="sql" code={`CREATE TABLE products (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  price    NUMERIC(12,2) CHECK (price >= 0),
  discount NUMERIC(5,2)  CHECK (discount BETWEEN 0 AND 100),
  status   TEXT          CHECK (status IN ('active', 'inactive', 'archived')),

  -- CHECK на несколько колонок:
  CONSTRAINT chk_price_with_discount
    CHECK (discount = 0 OR price > 0)
);

-- Добавить CHECK к существующей таблице:
ALTER TABLE users
  ADD CONSTRAINT chk_age CHECK (age >= 0 AND age < 150);`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// ограничения CHECK</div>
          <div className={s.calloutText}>
            CHECK не может ссылаться на другие таблицы — для этого нужны триггеры или FK.
            NULL в CHECK-условии даёт UNKNOWN, что интерпретируется как «проверка пройдена» — поэтому
            <code> CHECK (age &gt; 0)</code> пропустит NULL. Если нужно запретить NULL, добавь отдельный NOT NULL.
          </div>
        </div>
      </section>

      {/* 7. Surrogate vs Natural */}
      <section className={s.section}>
        <SectionTitle>Суррогатный vs натуральный ключ</SectionTitle>
        <p className={s.lead}>
          Натуральный ключ — это реальный атрибут предметной области (email, ИНН, артикул).
          Суррогатный — искусственный идентификатор (SERIAL, UUID), созданный только ради идентификации.
        </p>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th></th>
                <th>Натуральный (email, ИНН)</th>
                <th>Суррогатный (SERIAL, UUID)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Читаемость</td>
                <td>Понятен без JOIN — сразу видно «кто»</td>
                <td>Нужен JOIN чтобы понять смысл</td>
              </tr>
              <tr>
                <td>Изменяемость</td>
                <td>Проблема: email меняется → нужен CASCADE UPDATE по всем FK</td>
                <td>Не меняется никогда — FK спокойны</td>
              </tr>
              <tr>
                <td>Размер</td>
                <td>Может быть большим (TEXT) — дорогие индексы и FK</td>
                <td>Фиксированный: 4/8 байт (SERIAL) или 16 байт (UUID)</td>
              </tr>
              <tr>
                <td>Уникальность</td>
                <td>Зависит от предметной области — могут быть коллизии</td>
                <td>Гарантируется базой</td>
              </tr>
              <tr>
                <td>Распределённость</td>
                <td>Обычно уникален глобально (ИНН, UUID)</td>
                <td>SERIAL — только внутри БД, UUID — глобально</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// практика</div>
          <div className={s.calloutText}>
            Большинство современных проектов используют суррогатный ключ (BIGSERIAL или UUID) как PK,
            а натуральный атрибут (email, username) закрывают UNIQUE-ограничением.
            Это даёт стабильные FK и читаемые данные одновременно.
          </div>
        </div>
      </section>

      {/* 8. SERIAL vs UUID */}
      <section className={s.section}>
        <SectionTitle>SERIAL, UUID v4, UUID v7 — что выбрать</SectionTitle>
        <p className={s.lead}>
          Выбор типа PK влияет на производительность вставок, размер индекса
          и возможность работы в распределённых системах.
        </p>

        <div className={s.uuidGrid}>
          <div className={s.uuidCard}>
            <div className={s.uuidName}>BIGSERIAL</div>
            <div className={s.uuidSample}>1, 2, 3, … 9 223 372 036 854 775 807</div>
            <div className={s.uuidDesc}>
              Последовательный 8-байтовый счётчик. Новые строки вставляются
              в конец индекса — минимальная фрагментация.
            </div>
            <span className={`${s.uuidTag} ${s.tagGood}`}>лучший выбор для одной БД</span>
          </div>
          <div className={s.uuidCard}>
            <div className={s.uuidName}>UUID v4</div>
            <div className={s.uuidSample}>550e8400-e29b-41d4-a716-446655440000</div>
            <div className={s.uuidDesc}>
              Полностью случайный 16 байт. Вставки — в произвольное место B-tree.
              Сильная фрагментация индекса на больших таблицах.
            </div>
            <span className={`${s.uuidTag} ${s.tagWarn}`}>проблемы с производительностью</span>
          </div>
          <div className={s.uuidCard}>
            <div className={s.uuidName}>UUID v7</div>
            <div className={s.uuidSample}>018e7a5a-3c4b-7000-a9b2-d4e5f6a7b8c9</div>
            <div className={s.uuidDesc}>
              Начинается с unix-миллисекунды. Монотонно возрастает — вставки
              в конец индекса как у SERIAL, но глобально уникален.
            </div>
            <span className={`${s.uuidTag} ${s.tagGood}`}>лучший UUID для новых проектов</span>
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- UUID v7 в PostgreSQL через расширение pg_uuidv7:
CREATE EXTENSION IF NOT EXISTS pg_uuidv7;

CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id    BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Без расширения — gen_random_uuid() даёт v4:
CREATE TABLE legacy_sessions (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid()
);`} />
      </section>

      {/* 9. Ключи и индексы */}
      <section className={s.section}>
        <SectionTitle>Ключи и индексы — что создаётся автоматически</SectionTitle>
        <p className={s.lead}>
          Запомни одно правило: <strong>PK и UNIQUE → индекс есть. FK → индекса нет.</strong>
        </p>

        <div className={s.indexList}>
          {[
            { constraint: 'PRIMARY KEY', result: true,  text: 'Уникальный B-tree индекс создаётся автоматически' },
            { constraint: 'UNIQUE',      result: true,  text: 'Уникальный B-tree индекс создаётся автоматически' },
            { constraint: 'FOREIGN KEY', result: false, text: 'Индекс не создаётся — нужно CREATE INDEX вручную' },
            { constraint: 'CHECK',       result: false, text: 'Индекс не создаётся' },
            { constraint: 'NOT NULL',    result: false, text: 'Индекс не создаётся' },
          ].map(r => (
            <div key={r.constraint} className={s.indexRow}>
              <span className={s.indexConstraint}>{r.constraint}</span>
              <span className={s.indexResult}>
                <span className={r.result ? s.yes : s.no}>
                  {r.result ? '✓ индекс' : '✗ нет индекса'}
                </span>
                {' — '}
                {r.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Полная схема */}
      <section className={s.section}>
        <SectionTitle>Полная схема с правильными ключами</SectionTitle>
        <p className={s.lead}>
          Всё вместе — три таблицы с полным набором ограничений и ручными индексами на FK.
        </p>

        <CodeHighlight lang="sql" code={`-- Отделы
CREATE TABLE departments (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     TEXT NOT NULL,
  location TEXT,
  CONSTRAINT uq_dept_name UNIQUE (name)
);

-- Пользователи
CREATE TABLE users (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      TEXT NOT NULL,
  username   TEXT NOT NULL,
  age        INT  CHECK (age >= 18 AND age < 120),
  salary     NUMERIC(12, 2) CHECK (salary >= 0),
  dept_id    BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_users_email    UNIQUE (email),
  CONSTRAINT uq_users_username UNIQUE (username)
);

-- Индекс на FK — обязательно!
CREATE INDEX idx_users_dept_id ON users (dept_id);

-- Заказы
CREATE TABLE orders (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индекс на FK
CREATE INDEX idx_orders_user_id ON orders (user_id);
-- Индекс для фильтрации по статусу
CREATE INDEX idx_orders_status  ON orders (status);`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// итоговый чеклист</div>
          <div className={s.infoText}>
            При создании таблицы: ✓ PK есть ✓ NOT NULL там где нужно ✓ FK объявлены ✓ CHECK для бизнес-правил ✓ UNIQUE для натуральных атрибутов ✓ индексы созданы для всех FK-столбцов
          </div>
        </div>
      </section>

      {/* 11. Quiz */}
      <section className={s.section}>
        <SectionTitle>Проверь себя — 16 вопросов</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
