import { SqlPlayground } from './SqlPlayground';
import { JoinVisualizer } from './JoinVisualizer';
import { SqlChallenges } from './SqlChallenges';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QUIZ_QUESTIONS } from './quizData';
import s from './SqlQueriesArticle.module.scss';

const EXEC_ORDER = [
  { kw: 'FROM', desc: 'строим набор строк' },
  { kw: 'WHERE', desc: 'фильтруем строки' },
  { kw: 'GROUP BY', desc: 'группируем' },
  { kw: 'HAVING', desc: 'фильтруем группы' },
  { kw: 'SELECT', desc: 'проецируем' },
  { kw: 'ORDER BY', desc: 'сортируем' },
  { kw: 'LIMIT', desc: 'ограничиваем' },
];

const AGGREGATE_FNS = [
  { fn: 'COUNT(*)', desc: 'Количество строк (включая NULL)', ex: 'SELECT COUNT(*) FROM users → 8' },
  { fn: 'COUNT(col)', desc: 'Количество строк, где col IS NOT NULL', ex: 'SELECT COUNT(dept_id) FROM users → 7' },
  { fn: 'SUM(col)', desc: 'Сумма числовых значений', ex: 'SELECT SUM(salary) FROM users → 845000' },
  { fn: 'AVG(col)', desc: 'Среднее числовых значений (NULL игнорируется)', ex: 'SELECT AVG(salary) FROM users → 105625' },
  { fn: 'MIN(col)', desc: 'Минимальное значение', ex: 'SELECT MIN(salary) FROM users → 70000' },
  { fn: 'MAX(col)', desc: 'Максимальное значение', ex: 'SELECT MAX(salary) FROM users → 150000' },
];

export function SqlQueriesArticle() {
  return (
    <div className={s.article}>

      {/* 1. Playground */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Интерактивный SQL-плейграунд</h2>
        <p className={s.lead}>
          Пиши настоящие SQL-запросы прямо в браузере. Три таблицы:
          <code> users</code>, <code>orders</code>, <code>departments</code>.
          Жми примеры или пиши свои запросы — результат мгновенный.
        </p>
        <SqlPlayground />
      </section>

      {/* 2. Execution order */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Порядок выполнения запроса</h2>
        <p className={s.lead}>
          SQL — декларативный язык. Ты описываешь <em>что</em> хочешь, а не <em>как</em> это получить.
          Но понимать логический порядок выполнения критично — особенно для WHERE vs HAVING и алиасов.
        </p>

        <div className={s.execOrder}>
          {EXEC_ORDER.map((step, i) => (
            <div key={step.kw} className={s.execStep}>
              <div className={s.execKw}>{i + 1}. {step.kw}</div>
              <div className={s.execDesc}>{step.desc}</div>
              {i < EXEC_ORDER.length - 1 && <span className={s.execArrow}>→</span>}
            </div>
          ))}
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// почему важно</div>
          <div className={s.calloutText}>
            WHERE выполняется до SELECT, поэтому нельзя писать WHERE alias = x — алиас ещё не определён.
            HAVING выполняется после GROUP BY — можно фильтровать по агрегатам.
            ORDER BY — после SELECT, поэтому алиасы работают.
          </div>
        </div>
      </section>

      {/* 3. SELECT + WHERE */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>SELECT и WHERE</h2>
        <p className={s.lead}>
          WHERE поддерживает богатый набор операторов. Важно знать нюансы каждого.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// операторы сравнения</div>
            <ul className={s.colList}>
              <li className={s.colItem}><code>=</code> — равно</li>
              <li className={s.colItem}><code>!=</code> или <code>&lt;&gt;</code> — не равно</li>
              <li className={s.colItem}><code>&lt; &gt; &lt;= &gt;=</code> — сравнение</li>
              <li className={s.colItem}><code>BETWEEN a AND b</code> — включительно</li>
              <li className={s.colItem}><code>IN (a, b, c)</code> — вхождение в список</li>
              <li className={s.colItem}><code>LIKE '%pattern%'</code> — паттерн (% = любые символы)</li>
              <li className={s.colItem}><code>IS NULL / IS NOT NULL</code> — проверка NULL</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// логические операторы</div>
            <ul className={s.colList}>
              <li className={s.colItem}><code>AND</code> — оба условия должны быть истинными</li>
              <li className={s.colItem}><code>OR</code> — хотя бы одно условие истинно</li>
              <li className={s.colItem}><code>NOT</code> — инверсия условия</li>
              <li className={s.colItem}>Приоритет: NOT → AND → OR</li>
              <li className={s.colItem}>Используй <code>()</code> для явного порядка</li>
              <li className={s.colItem}><code>NOT IN (..., NULL)</code> — ловушка: вернёт пустой результат</li>
            </ul>
          </div>
        </div>

        <div className={s.warning}>
          <div className={s.warningLabel}>// ловушка с NULL</div>
          <div className={s.warningText}>
            <code>WHERE col = NULL</code> никогда не найдёт строки. В SQL: NULL = NULL → unknown (не true).
            Только <code>IS NULL</code> работает корректно. Аналогично: <code>NOT IN (1, 2, NULL)</code> → пустой результат.
          </div>
        </div>
      </section>

      {/* 4. GROUP BY + aggregates */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>GROUP BY и агрегатные функции</h2>
        <p className={s.lead}>
          GROUP BY объединяет строки с одинаковыми значениями в группы.
          Агрегатные функции вычисляют одно значение для каждой группы.
        </p>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Функция</th>
                <th>Что делает</th>
                <th>Пример</th>
              </tr>
            </thead>
            <tbody>
              {AGGREGATE_FNS.map(r => (
                <tr key={r.fn}>
                  <td>{r.fn}</td>
                  <td>{r.desc}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.8 }}>{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeHighlight lang="sql" code={`-- Только города с >1 сотрудником
SELECT city, COUNT(*) AS cnt, AVG(salary) AS avg_sal
FROM users
GROUP BY city
HAVING COUNT(*) > 1
ORDER BY cnt DESC`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// правило GROUP BY</div>
          <div className={s.calloutText}>
            В SELECT при GROUP BY каждая колонка должна либо входить в GROUP BY,
            либо быть агрегатной функцией. Нарушение: SELECT name, dept_id, COUNT(*) FROM users GROUP BY dept_id —
            name не в GROUP BY и не агрегат → ошибка в PostgreSQL.
          </div>
        </div>
      </section>

      {/* 5. JOIN */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>JOIN: объединение таблиц</h2>
        <p className={s.lead}>
          JOIN соединяет строки из двух таблиц по условию. Тип JOIN определяет, что происходит
          со строками без совпадений.
        </p>
        <JoinVisualizer />

        <CodeHighlight lang="sql" code={`-- Топ сотрудников по сумме заказов (включая тех, у кого нет заказов)
SELECT u.name,
       COUNT(o.id)    AS order_count,
       COALESCE(SUM(o.amount), 0) AS total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name
ORDER BY total DESC`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// частая ошибка</div>
          <div className={s.calloutText}>
            При LEFT JOIN и COUNT(*) vs COUNT(o.id): COUNT(*) посчитает строку с NULL (от LEFT JOIN) как 1.
            COUNT(o.id) вернёт 0, потому что id = NULL. Для подсчёта связанных записей используй COUNT(правая_таблица.id).
          </div>
        </div>
      </section>

      {/* 6. NULL handling */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>NULL: трёхзначная логика</h2>
        <p className={s.lead}>
          NULL — не пустая строка, не 0. NULL означает «неизвестно». Это меняет всё.
        </p>

        <div className={s.nullGrid}>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// сравнение</div>
            <div className={s.nullCardCode}>NULL = NULL</div>
            <div className={s.nullCardDesc}>→ UNKNOWN, не TRUE. Используй IS NULL.</div>
          </div>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// арифметика</div>
            <div className={s.nullCardCode}>100 + NULL</div>
            <div className={s.nullCardDesc}>→ NULL. Любое выражение с NULL = NULL.</div>
          </div>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// агрегаты</div>
            <div className={s.nullCardCode}>AVG(col) с NULL</div>
            <div className={s.nullCardDesc}>→ NULL строки игнорируются в COUNT(col), SUM, AVG.</div>
          </div>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// NOT IN</div>
            <div className={s.nullCardCode}>x NOT IN (..., NULL)</div>
            <div className={s.nullCardDesc}>→ всегда пустой результат. Ловушка!</div>
          </div>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// COALESCE</div>
            <div className={s.nullCardCode}>COALESCE(col, 0)</div>
            <div className={s.nullCardDesc}>→ первое не-NULL значение. Замена NULL на default.</div>
          </div>
          <div className={s.nullCard}>
            <div className={s.nullCardTitle}>// ORDER BY</div>
            <div className={s.nullCardCode}>ORDER BY col ASC</div>
            <div className={s.nullCardDesc}>→ NULL идут последними (PostgreSQL), или первыми (MySQL).</div>
          </div>
        </div>
      </section>

      {/* 7. Window functions */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Оконные функции</h2>
        <p className={s.lead}>
          Оконные функции вычисляют значение для каждой строки относительно «окна» — набора соседних строк.
          В отличие от GROUP BY, они не схлопывают строки.
        </p>

        <CodeHighlight lang="sql" code={`-- Ранг по зарплате
SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
  RANK()       OVER (ORDER BY salary DESC) AS rank,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM users`} />

        <CodeHighlight lang="sql" code={`-- Ранг внутри каждого города (PARTITION BY)
SELECT name, city, salary,
  RANK() OVER (PARTITION BY city ORDER BY salary DESC) AS city_rank
FROM users
ORDER BY city, city_rank`} />

        <CodeHighlight lang="sql" code={`-- Нарастающая сумма
SELECT name, salary,
  SUM(salary) OVER (ORDER BY salary ROWS UNBOUNDED PRECEDING) AS running_total
FROM users
ORDER BY salary`} />

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// ranking функции</div>
            <ul className={s.colList}>
              <li className={s.colItem}><code>ROW_NUMBER()</code> — уникальный номер строки</li>
              <li className={s.colItem}><code>RANK()</code> — ранг с пропуском при равенстве</li>
              <li className={s.colItem}><code>DENSE_RANK()</code> — ранг без пропуска</li>
              <li className={s.colItem}><code>NTILE(n)</code> — разбивка на n квантилей</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// offset функции</div>
            <ul className={s.colList}>
              <li className={s.colItem}><code>LAG(col, n)</code> — значение предыдущей строки</li>
              <li className={s.colItem}><code>LEAD(col, n)</code> — значение следующей строки</li>
              <li className={s.colItem}><code>FIRST_VALUE(col)</code> — первое значение в окне</li>
              <li className={s.colItem}><code>LAST_VALUE(col)</code> — последнее значение в окне</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Subqueries + CTEs */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Подзапросы и CTE</h2>

        <CodeHighlight lang="sql" code={`-- Скалярный подзапрос: сравнение с одним значением
SELECT name, salary
FROM users
WHERE salary > (SELECT AVG(salary) FROM users)`} />

        <CodeHighlight lang="sql" code={`-- CTE: именованный временный запрос
WITH top_earners AS (
  SELECT * FROM users
  WHERE salary > 100000
),
with_orders AS (
  SELECT t.name, COUNT(o.id) AS cnt
  FROM top_earners t
  LEFT JOIN orders o ON t.id = o.user_id
  GROUP BY t.name
)
SELECT * FROM with_orders
ORDER BY cnt DESC`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// CTE vs подзапросы</div>
          <div className={s.calloutText}>
            CTE читаемее: сложный запрос разбивается на именованные части. Можно использовать несколько CTE,
            ссылаясь на предыдущие. Рекурсивные CTE (WITH RECURSIVE) решают задачи обхода деревьев.
            В PostgreSQL CTE иногда создаёт барьер оптимизации — в простых случаях подзапрос может быть быстрее.
          </div>
        </div>
      </section>

      {/* 9. Challenges */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Практика: напиши сам</h2>
        <p className={s.lead}>
          6 задач с реальными данными. Пиши запрос, нажимай «Проверить» — система сравнит
          результат с ожидаемым.
        </p>
        <SqlChallenges />
      </section>

      {/* 10. Quiz */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя — 22 вопроса</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
