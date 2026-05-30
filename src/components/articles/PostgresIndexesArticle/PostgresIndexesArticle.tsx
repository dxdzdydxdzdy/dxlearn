import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { IndexScanDemo } from './IndexScanDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './PostgresIndexesArticle.module.scss';

// ── Index types data ──────────────────────────────────────────────────────────

const INDEX_TYPES = [
  {
    name: 'B-tree',
    color: '#00e5a0',
    tag: '// default',
    desc: 'Сбалансированное дерево. Подходит для сравнений (=, <, >, BETWEEN, LIKE \'foo%\'). Создаётся по умолчанию для CREATE INDEX без USING.',
    when: 'Используй для: числовых колонок, дат, строк с высокой кардинальностью, FK-колонок.',
  },
  {
    name: 'Hash',
    color: '#4a9eff',
    tag: '// только для =',
    desc: 'Хэш-таблица. Быстрее B-tree для точного равенства (=), но не поддерживает диапазоны, сортировку, LIKE.',
    when: 'Используй для: кешей, словарей — колонки где нужен только =. Редко применяется.',
  },
  {
    name: 'GIN',
    color: '#9b59e0',
    tag: '// инвертированный',
    desc: 'Generalized Inverted Index. Для каждого элемента хранит список строк где он встречается. Идеален для массивов, JSONB, полнотекстового поиска.',
    when: 'Используй для: TEXT[] @>, JSONB ?, tsquery @@. Медленнее при записи, быстрее при сложных поисках.',
  },
  {
    name: 'BRIN',
    color: '#f0c040',
    tag: '// блочный',
    desc: 'Block Range INdex. Хранит min/max для блоков данных. Очень маленький, но работает только когда данные физически упорядочены.',
    when: 'Используй для: логов, метрик, событий с auto-increment id/timestamp. Таблицы от десятков GB.',
  },
];

export function PostgresIndexesArticle() {
  return (
    <div className={s.article}>

      {/* 1. Почему индексы */}
      <section className={s.section}>
        <SectionTitle>Проблема: Sequential Scan</SectionTitle>
        <p className={s.lead}>
          База данных хранит строки в файлах на диске — без какого-либо порядка по содержимому.
          Когда ты пишешь <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>WHERE salary &gt; 100000</code>,
          PostgreSQL понятия не имеет в каком файловом блоке лежат нужные строки.
          Без индекса остаётся одно — прочитать каждую строку и проверить условие.
          Это называется Sequential Scan.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// без индекса</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Seq Scan: проверяет каждую строку таблицы</li>
              <li className={s.colItem}>Сложность O(n) — линейный рост с таблицей</li>
              <li className={s.colItem}>10 строк → 10 проверок</li>
              <li className={s.colItem}>10 млн строк → 10 млн проверок</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// с B-tree индексом</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Index Scan: переход по дереву к нужному значению</li>
              <li className={s.colItem}>Сложность O(log n) — логарифмический рост</li>
              <li className={s.colItem}>10 строк → ~3 шага</li>
              <li className={s.colItem}>10 млн строк → ~23 шага</li>
            </ul>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// в цифрах</div>
          <div className={s.calloutText}>
            Таблица orders с 10 миллионами строк. Запрос <code style={{ fontFamily: 'var(--font-mono)' }}>WHERE user_id = 42</code> без индекса
            читает всю таблицу: десятки секунд или минут. С B-tree индексом
            на user_id — 3–4 дисковых обращения и несколько миллисекунд. Вот зачем нужны индексы.
          </div>
        </div>
      </section>

      {/* 2. Demo */}
      <section className={s.section}>
        <SectionTitle>Seq Scan vs Index Scan — наглядно</SectionTitle>
        <p className={s.body}>
          Нажми ▶ чтобы увидеть как PostgreSQL ищет строки с индексом и без.
          Переключай условие WHERE и режим чтобы сравнить количество проверок.
        </p>
        <IndexScanDemo />
      </section>

      {/* 3. Как работает B-tree */}
      <section className={s.section}>
        <SectionTitle>Как устроен B-tree индекс</SectionTitle>
        <p className={s.lead}>
          B-tree (Balanced Tree) — сбалансированное дерево поиска. Все значения
          хранятся отсортированными. Каждый узел дерева содержит диапазон значений
          и ссылки на дочерние узлы. Leaf-узлы хранят значение и указатель на строку в таблице.
        </p>

        <CodeHighlight lang="sql" code={`-- Создать индекс (по умолчанию B-tree):
CREATE INDEX idx_salary ON users (salary);

-- Явно указать тип:
CREATE INDEX idx_salary ON users USING btree (salary);

-- Как PostgreSQL выполняет запрос с индексом:
-- SELECT * FROM users WHERE salary > 100000
--
-- 1. Входим в B-tree на уровне корня
-- 2. Сравниваем: нужен salary > 100000
-- 3. По ключам переходим в нужный поддерево (O(log n))
-- 4. В leaf-узле: salary=110000 → rowid=5 (Eve)
-- 5. Читаем следующие leaf-узлы: 120000, 130000, 150000
-- 6. По rowid достаём строки из основной таблицы
-- Итого: ~3 чтения дерева + 4 чтения таблицы`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// indirectly sorted</div>
          <div className={s.infoText}>
            B-tree хранит значения отсортированными. Это значит что индекс используется
            не только для WHERE, но и для ORDER BY (сортировка бесплатна — данные уже упорядочены)
            и для BETWEEN (диапазонные запросы). Hash-индекс так не умеет.
          </div>
        </div>
      </section>

      {/* 4. Автоматические индексы */}
      <section className={s.section}>
        <SectionTitle>Автоматические индексы</SectionTitle>
        <p className={s.lead}>
          Два ограничения создают индекс автоматически. Остальное — вручную.
          Эту разницу надо знать наизусть.
        </p>

        <CodeHighlight lang="sql" code={`CREATE TABLE users (
  id      SERIAL PRIMARY KEY,          -- ✓ B-tree индекс создаётся автоматически
  email   TEXT UNIQUE,                  -- ✓ B-tree индекс создаётся автоматически
  dept_id INT REFERENCES departments(id) -- ✗ НЕТ автоиндекса (нужно CREATE INDEX!)
);

-- Без этого индекса каждый JOIN по dept_id = Seq Scan:
CREATE INDEX idx_users_dept ON users (dept_id);`} />

        <div className={s.warning}>
          <div className={s.warningLabel}>// классическая ловушка с FK</div>
          <div className={s.warningText}>
            PostgreSQL автоматически создаёт индекс для PRIMARY KEY и UNIQUE.
            Для FOREIGN KEY — нет. Это отличие от MySQL.
            В результате: JOIN users JOIN orders без CREATE INDEX ON orders (user_id)
            делает Seq Scan по таблице заказов при каждом запросе.
            Всегда создавай индекс для FK-колонок вручную.
          </div>
        </div>
      </section>

      {/* 5. CREATE INDEX синтаксис */}
      <section className={s.section}>
        <SectionTitle>CREATE INDEX — синтаксис</SectionTitle>
        <p className={s.lead}>
          Несколько вариантов создания индекса. На продакшне почти всегда
          нужен CONCURRENTLY — без него таблица блокируется для записи.
        </p>

        <CodeHighlight lang="sql" code={`-- Базовый синтаксис
CREATE INDEX idx_name ON table_name (column);

-- На продакшне: без блокировки таблицы
CREATE INDEX CONCURRENTLY idx_salary ON users (salary);

-- Составной индекс (порядок важен! — leftmost prefix)
CREATE INDEX idx_dept_salary ON users (dept_id, salary);

-- Partial index: только нужное подмножество строк
CREATE INDEX idx_pending_orders ON orders (user_id)
WHERE status = 'pending';

-- Covering index: данные прямо в индексе, без обращения к таблице
CREATE INDEX idx_covering ON orders (user_id)
INCLUDE (product, amount);

-- Удалить индекс
DROP INDEX CONCURRENTLY idx_salary;

-- Список индексов таблицы
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users';`} />

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// CONCURRENTLY</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Таблица доступна для чтения и записи во время создания</li>
              <li className={s.colItem}>Строит индекс в два прохода — медленнее</li>
              <li className={s.colItem}>Если отменить — остаётся невалидный индекс (нужно DROP)</li>
              <li className={s.colItem}>На продакшне: всегда CONCURRENTLY</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// именование индексов</div>
            <ul className={s.colList}>
              <li className={s.colItem}><code style={{ fontFamily: 'var(--font-mono)' }}>idx_table_column</code> — простой индекс</li>
              <li className={s.colItem}><code style={{ fontFamily: 'var(--font-mono)' }}>idx_table_col1_col2</code> — составной</li>
              <li className={s.colItem}><code style={{ fontFamily: 'var(--font-mono)' }}>idx_table_column_partial</code> — partial</li>
              <li className={s.colItem}>PostgreSQL генерирует имя автоматически если не указать</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Типы индексов */}
      <section className={s.section}>
        <SectionTitle>Типы индексов в PostgreSQL</SectionTitle>
        <p className={s.lead}>
          PostgreSQL поддерживает 6 типов индексов. На практике 95% случаев — это B-tree.
          Остальные нужны для специфических задач.
        </p>

        <div className={s.typeGrid}>
          {INDEX_TYPES.map(t => (
            <div
              key={t.name}
              className={s.typeCard}
              style={{ '--kc': t.color } as React.CSSProperties}
            >
              <div className={s.typeName}>{t.name}</div>
              <div className={s.typeTag}>{t.tag}</div>
              <div className={s.typeDesc}>{t.desc}</div>
              <div className={s.typeWhen}><strong>Когда:</strong> {t.when}</div>
            </div>
          ))}
        </div>

        <CodeHighlight lang="sql" code={`-- GIN: поиск по массиву тегов
CREATE INDEX idx_tags ON posts USING GIN (tags);
SELECT * FROM posts WHERE tags @> ARRAY['postgresql', 'performance'];

-- GIN: полнотекстовый поиск
CREATE INDEX idx_fts ON articles USING GIN (to_tsvector('russian', body));
SELECT * FROM articles WHERE to_tsvector('russian', body) @@ to_tsquery('индекс');

-- BRIN: логи (новые строки всегда в конце — физически упорядочены)
CREATE INDEX idx_events_time ON events USING BRIN (created_at);

-- Hash: точное совпадение (редко нужен)
CREATE INDEX idx_hash_email ON users USING HASH (email);`} />
      </section>

      {/* 7. Составные индексы */}
      <section className={s.section}>
        <SectionTitle>Составные индексы и leftmost prefix</SectionTitle>
        <p className={s.lead}>
          Составной индекс (a, b, c) — это одно дерево, отсортированное сначала
          по a, потом по b, потом по c. Из этого вытекает важное правило.
        </p>

        <CodeHighlight lang="sql" code={`CREATE INDEX idx_dept_age ON users (dept_id, age);

-- ✓ Индекс используется: первая колонка есть
SELECT * FROM users WHERE dept_id = 1;
SELECT * FROM users WHERE dept_id = 1 AND age > 25;
SELECT * FROM users WHERE dept_id = 1 ORDER BY age;

-- ✗ Индекс НЕ используется: первой колонки нет
SELECT * FROM users WHERE age > 25;   -- только вторая колонка`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// правило leftmost prefix</div>
          <div className={s.calloutText}>
            Индекс (a, b, c) используется для запросов начинающихся с a:
            WHERE a = ?; WHERE a = ? AND b = ?; WHERE a = ? AND b = ? AND c = ?
            Запросы WHERE b = ? или WHERE c = ? без a — не попадут в индекс.
            Порядок колонок в составном индексе: сначала колонки для equality (=), потом range (&gt;, &lt;, BETWEEN).
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Практический пример: запросы к orders
SELECT * FROM orders WHERE user_id = 5 AND status = 'pending';

-- Какой индекс лучше?
CREATE INDEX idx_a ON orders (user_id, status);   -- user_id = ?, status = ? ✓
CREATE INDEX idx_b ON orders (status, user_id);   -- status = ?, user_id = ? ✓
-- оба работают для этого запроса

-- Но если запросы только по user_id:
SELECT * FROM orders WHERE user_id = 5;
-- idx_a подойдёт (user_id первым)
-- idx_b не подойдёт (user_id вторым, без status)`} />
      </section>

      {/* 8. EXPLAIN ANALYZE */}
      <section className={s.section}>
        <SectionTitle>EXPLAIN ANALYZE — читаем план запроса</SectionTitle>
        <p className={s.lead}>
          EXPLAIN ANALYZE — главный инструмент диагностики медленных запросов.
          Показывает что именно делает PostgreSQL: какой алгоритм выбрал,
          сколько строк обработал, сколько времени потратил.
        </p>

        <CodeHighlight lang="sql" code={`-- Синтаксис
EXPLAIN ANALYZE SELECT * FROM users WHERE salary > 100000;

-- С подробной статистикой буферов (hits = кэш, reads = диск):
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = 3;`} />

        <div className={s.explainBlock}>
          <code>
            <span className={s.explainLine}>
              <span className={s.explainComment}>-- Seq Scan (нет индекса):</span>
            </span>
            <span className={s.explainLine}>
              <span className={s.explainNode}>Seq Scan</span>
              {' on users  '}
              <span className={s.explainCost}>(cost=0.00..1.08 rows=4 width=52)</span>
            </span>
            <span className={s.explainLine}>
              {'                 '}
              <span className={s.explainActual}>(actual time=0.012..0.023 rows=4 loops=1)</span>
            </span>
            <span className={s.explainLine}>{'  Filter: (salary > 100000)'}</span>
            <span className={s.explainLine}>
              {'  Rows Removed by Filter: '}
              <span className={s.explainRows}>4</span>
              <span className={s.explainComment}>  -- лишние проверки</span>
            </span>
            <br />
            <span className={s.explainLine}>
              <span className={s.explainComment}>-- Index Scan (с индексом):</span>
            </span>
            <span className={s.explainLine}>
              <span className={s.explainIndex}>Index Scan</span>
              {' using '}
              <span className={s.explainIndex}>idx_salary</span>
              {' on users  '}
              <span className={s.explainCost}>(cost=0.14..8.32 rows=4 width=52)</span>
            </span>
            <span className={s.explainLine}>
              {'                         '}
              <span className={s.explainActual}>(actual time=0.008..0.014 rows=4 loops=1)</span>
            </span>
            <span className={s.explainLine}>
              {'  Index Cond: (salary > 100000)'}
              <span className={s.explainComment}>  -- условие применено в индексе</span>
            </span>
          </code>
        </div>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// что читать в EXPLAIN</div>
            <ul className={s.colList}>
              <li className={s.colItem}><strong>Seq Scan</strong> — нет индекса или невыгодно</li>
              <li className={s.colItem}><strong>Index Scan</strong> — идёт по индексу + читает строки</li>
              <li className={s.colItem}><strong>Index Only Scan</strong> — все данные из индекса (covering index)</li>
              <li className={s.colItem}><strong>Bitmap Scan</strong> — собирает rowids через индекс, потом читает пакетами</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// cost и actual time</div>
            <ul className={s.colList}>
              <li className={s.colItem}>cost=0.00..1.08 — оценка (условные единицы, не мс)</li>
              <li className={s.colItem}>actual time=0.012..0.023 — реальное время в мс</li>
              <li className={s.colItem}>rows= — реально обработано строк</li>
              <li className={s.colItem}>loops= — сколько раз узел выполнялся (в JOIN)</li>
            </ul>
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Найти медленные запросы без EXPLAIN вручную:
-- Расширение pg_stat_statements (нужно включить в postgresql.conf)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Посмотреть использование индексов:
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- ASC = редко используемые наверху`} />
      </section>

      {/* 9. Когда индекс не нужен */}
      <section className={s.section}>
        <SectionTitle>Когда индекс не нужен или вреден</SectionTitle>
        <p className={s.lead}>
          Индекс — не серебряная пуля. Иногда он бесполезен.
          Иногда замедляет систему в целом. Нужно понимать компромиссы.
        </p>

        <div className={s.rulesGrid}>
          <div className={`${s.ruleCard} ${s.ruleDont}`}>
            <div className={s.ruleLabel}>// не добавляй индекс</div>
            <div className={s.ruleText}>
              Маленькие таблицы (&lt;1000 строк) — Seq Scan быстрее (всё помещается в cache).
            </div>
          </div>
          <div className={`${s.ruleCard} ${s.ruleDont}`}>
            <div className={s.ruleLabel}>// не добавляй индекс</div>
            <div className={s.ruleText}>
              Низкая кардинальность: gender, boolean, status с 2–3 значениями при равном распределении.
            </div>
          </div>
          <div className={`${s.ruleCard} ${s.ruleDont}`}>
            <div className={s.ruleLabel}>// не добавляй индекс</div>
            <div className={s.ruleText}>
              Таблица — преимущественно write (INSERT/UPDATE тысячи раз в секунду). Каждый индекс = overhead на запись.
            </div>
          </div>
          <div className={`${s.ruleCard} ${s.ruleDo}`}>
            <div className={s.ruleLabel}>// добавляй индекс</div>
            <div className={s.ruleText}>
              FK-колонки всегда. Колонки в частых WHERE/JOIN. ORDER BY с LIMIT 10 на больших таблицах.
            </div>
          </div>
          <div className={`${s.ruleCard} ${s.ruleDo}`}>
            <div className={s.ruleLabel}>// добавляй индекс</div>
            <div className={s.ruleText}>
              Поля поиска/фильтрации: email, phone, external_id. Высокая кардинальность.
            </div>
          </div>
          <div className={`${s.ruleCard} ${s.ruleDo}`}>
            <div className={s.ruleLabel}>// удаляй неиспользуемые</div>
            <div className={s.ruleText}>
              Проверяй pg_stat_user_indexes.idx_scan = 0 — индекс никогда не использовался. Удали его: только тормозит запись.
            </div>
          </div>
        </div>

        <div className={s.warning}>
          <div className={s.warningLabel}>// индексный bloat</div>
          <div className={s.warningText}>
            B-tree индексы со временем «раздуваются» от DELETE и UPDATE (старые записи помечаются удалёнными,
            но физически остаются). Команда REINDEX CONCURRENTLY пересоздаёт индекс и сжимает его.
            Автовакуум частично помогает, но для очень активных таблиц — нужен ручной REINDEX.
          </div>
        </div>
      </section>

      {/* 10. Partial и Covering */}
      <section className={s.section}>
        <SectionTitle>Partial и Covering индексы</SectionTitle>
        <p className={s.lead}>
          Два специальных вида индексов, которые решают конкретные проблемы производительности
          элегантнее, чем просто добавить ещё один B-tree.
        </p>

        <CodeHighlight lang="sql" code={`-- ── Partial Index ───────────────────────────────────────────────────────────
-- Проблема: orders.status = 'done' у 99% строк — индекс почти бесполезен
-- Решение: индексировать только строки где status = 'pending'

CREATE INDEX idx_pending ON orders (user_id)
WHERE status = 'pending';

-- Этот индекс маленький (только ~1% строк) и идеален для очереди:
SELECT * FROM orders WHERE user_id = 5 AND status = 'pending';
-- ↑ использует idx_pending

-- ── Covering Index (INCLUDE) ─────────────────────────────────────────────────
-- Проблема: Index Scan = traversal дерева + чтение строки из таблицы (heap fetch)
-- Решение: хранить нужные колонки прямо в leaf-узлах индекса

CREATE INDEX idx_covering ON orders (user_id) INCLUDE (product, amount);

-- Теперь запрос не обращается к таблице вообще:
SELECT product, amount FROM orders WHERE user_id = 5;
-- → Index Only Scan (всё есть в индексе)

-- Сравни: обычный индекс на этот же запрос
CREATE INDEX idx_plain ON orders (user_id);
-- → Index Scan (нужно читать строки из таблицы для product и amount)`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// Index Only Scan</div>
          <div className={s.infoText}>
            Index Only Scan — самый быстрый вариант: PostgreSQL не обращается к таблице вообще.
            Для этого нужен covering index через INCLUDE. Особенно эффективен когда таблица
            большая, а запрашиваемых колонок мало. Проверить: в EXPLAIN должно быть
            «Index Only Scan» и «Heap Fetches: 0».
          </div>
        </div>
      </section>

      {/* 11. Summary table */}
      <section className={s.section}>
        <SectionTitle>Шпаргалка по типам сканирования</SectionTitle>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Тип</th>
                <th>Когда</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Seq Scan</td>
                <td>Нет индекса, или выборка &gt;20-30% строк</td>
                <td>O(n) — читает всё</td>
              </tr>
              <tr>
                <td>Index Scan</td>
                <td>Есть индекс, выборка мала (&lt;10%)</td>
                <td>O(log n) + heap fetch</td>
              </tr>
              <tr>
                <td>Index Only Scan</td>
                <td>Covering index, все нужные поля в нём</td>
                <td>O(log n), нет heap fetch</td>
              </tr>
              <tr>
                <td>Bitmap Scan</td>
                <td>Выборка средняя, OR по нескольким индексам</td>
                <td>O(n log n) — batch heap fetches</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 12. Quiz */}
      <section className={s.section}>
        <SectionTitle>Тест</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
