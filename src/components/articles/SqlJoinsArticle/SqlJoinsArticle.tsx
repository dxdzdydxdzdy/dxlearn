import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { JoinVisualizer } from '../SqlQueriesArticle/JoinVisualizer';
import { JoinChallenges } from './JoinChallenges';
import { QUIZ_QUESTIONS } from './quizData';
import s from './SqlJoinsArticle.module.scss';

const JOIN_TYPES = [
  {
    name: 'INNER JOIN',
    color: '#00e5a0',
    short: 'Только совпадения',
    desc: 'Строка попадает в результат только если нашлось совпадение в обеих таблицах. Самый частый тип JOIN.',
  },
  {
    name: 'LEFT JOIN',
    color: '#4db8ff',
    short: 'Все из левой + совпадения',
    desc: 'Сохраняет все строки левой таблицы. Если совпадения нет — колонки правой таблицы заполняются NULL.',
  },
  {
    name: 'RIGHT JOIN',
    color: '#d2a679',
    short: 'Все из правой + совпадения',
    desc: 'Зеркало LEFT JOIN. На практике почти не используется — всегда можно переписать как LEFT JOIN с переставленными таблицами.',
  },
  {
    name: 'FULL OUTER JOIN',
    color: '#b08de0',
    short: 'Все строки из обеих',
    desc: 'Объединение LEFT и RIGHT JOIN. Все строки с обеих сторон, NULL там где нет пары.',
  },
  {
    name: 'CROSS JOIN',
    color: '#f0c040',
    short: 'Декартово произведение',
    desc: 'Каждая строка таблицы A соединяется с каждой строкой B. Нет условия ON. 5 × 4 = 20 строк.',
  },
];

export function SqlJoinsArticle() {
  return (
    <div className={s.article}>

      {/* 1. Зачем JOIN */}
      <section className={s.section}>
        <SectionTitle>Зачем нужен JOIN</SectionTitle>
        <p className={s.lead}>
          Реляционные базы данных хранят данные в нескольких таблицах — это нормализация.
          Заказы отдельно от пользователей, пользователи отдельно от отделов.
          JOIN собирает данные из нескольких таблиц в один результат по заданному условию.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// без нормализации</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Дублирование: имя отдела в каждой строке сотрудника</li>
              <li className={s.colItem}>При переименовании отдела — UPDATE миллиона строк</li>
              <li className={s.colItem}>Нет защиты от несогласованности</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// с нормализацией + JOIN</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Отдел хранится один раз, сотрудник хранит только dept_id</li>
              <li className={s.colItem}>Переименование — одна строка в departments</li>
              <li className={s.colItem}>JOIN собирает нужные данные на лету</li>
            </ul>
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Данные в разных таблицах:
-- users:       id | name  | dept_id | salary
-- departments: id | title | budget

-- JOIN собирает их вместе:
SELECT u.name, d.title, u.salary
FROM users u
INNER JOIN departments d ON u.dept_id = d.id`} />
      </section>

      {/* 2. Визуализация */}
      <section className={s.section}>
        <SectionTitle>Типы JOIN — интерактивно</SectionTitle>
        <p className={s.lead}>
          Выбери тип JOIN — увидишь какие строки попадут в результат.
        </p>
        <JoinVisualizer />
      </section>

      {/* 3. Обзор типов */}
      <section className={s.section}>
        <SectionTitle>Пять типов JOIN</SectionTitle>
        <div className={s.keyGrid}>
          {JOIN_TYPES.map(j => (
            <div key={j.name} className={s.keyCard} style={{ '--kc': j.color } as React.CSSProperties}>
              <div className={s.keyName}>{j.name}</div>
              <div className={s.keyShort}>{j.short}</div>
              <div className={s.keyDesc}>{j.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INNER JOIN */}
      <section className={s.section}>
        <SectionTitle>INNER JOIN</SectionTitle>
        <p className={s.lead}>
          Пересечение двух множеств. Строка попадает в результат только если
          условие ON истинно для пары строк из обеих таблиц.
        </p>

        <CodeHighlight lang="sql" code={`-- Сотрудники с отделом (Henry без dept_id выброшен)
SELECT u.name, d.title, u.salary
FROM users u
INNER JOIN departments d ON u.dept_id = d.id
ORDER BY u.salary DESC;

-- Результат: 7 строк (только те у кого dept_id не NULL)
-- Henry с dept_id = NULL — не попадёт, т.к. NULL != любое значение`} />

        <CodeHighlight lang="sql" code={`-- Несколько условий в ON
SELECT u.name, o.product, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'done'
ORDER BY o.amount DESC;`} />

        <div className={s.callout}>
          <div className={s.calloutLabel}>// JOIN vs implicit cross join</div>
          <div className={s.calloutText}>
            Старый синтаксис <code>FROM users, departments WHERE u.dept_id = d.id</code> — это
            неявный CROSS JOIN с фильтром в WHERE. Результат тот же что у INNER JOIN, но читать сложнее
            и легко случайно забыть условие, получив декартово произведение. Используй явный JOIN.
          </div>
        </div>
      </section>

      {/* 5. LEFT JOIN */}
      <section className={s.section}>
        <SectionTitle>LEFT JOIN — сохранить всех слева</SectionTitle>
        <p className={s.lead}>
          Возвращает все строки левой таблицы. Для строк без совпадения в правой таблице —
          колонки правой заполняются NULL. Незаменим когда нужно «всё из A, и если есть — из B».
        </p>

        <CodeHighlight lang="sql" code={`-- Все пользователи, включая Henry без отдела
SELECT u.name, d.title
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id
ORDER BY u.name;
-- Henry: name='Henry', title=NULL`} />

        <CodeHighlight lang="sql" code={`-- Anti-join: пользователи БЕЗ заказов
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL  -- NULL = нет совпадения = нет заказов
ORDER BY u.name;`} />

        <div className={s.warning}>
          <div className={s.warningLabel}>// COUNT(*) ловушка в LEFT JOIN</div>
          <div className={s.warningText}>
            При LEFT JOIN строка пользователя без заказов всё равно присутствует в результате (с NULL справа).
            <code> COUNT(*)</code> посчитает её как 1.
            <code> COUNT(o.id)</code> проигнорирует NULL и вернёт 0. Всегда считай конкретную колонку правой таблицы.
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Количество заказов (правильно: COUNT(o.id), не COUNT(*))
SELECT u.name,
       COUNT(o.id)              AS order_count,   -- 0 для без заказов
       COALESCE(SUM(o.amount), 0) AS total         -- 0 вместо NULL
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name
ORDER BY total DESC;`} />
      </section>

      {/* 6. RIGHT и FULL OUTER */}
      <section className={s.section}>
        <SectionTitle>RIGHT JOIN и FULL OUTER JOIN</SectionTitle>

        <CodeHighlight lang="sql" code={`-- RIGHT JOIN = LEFT JOIN с переставленными таблицами
-- Оба запроса дают одинаковый результат:
SELECT u.name, d.title
FROM users u RIGHT JOIN departments d ON u.dept_id = d.id;

SELECT u.name, d.title
FROM departments d LEFT JOIN users u ON u.dept_id = d.id;

-- FULL OUTER JOIN: все строки из обеих таблиц
SELECT u.name, d.title
FROM users u
FULL OUTER JOIN departments d ON u.dept_id = d.id;
-- Henry (без отдела): name='Henry',  title=NULL
-- Если бы был отдел без сотрудников: name=NULL, title='...'`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// практика</div>
          <div className={s.infoText}>
            RIGHT JOIN на практике почти не используется — любой RIGHT JOIN переписывается в LEFT JOIN с переставленными таблицами.
            FULL OUTER JOIN редок: типичное применение — сравнение двух таблиц на предмет расхождений (data reconciliation).
          </div>
        </div>
      </section>

      {/* 7. CROSS JOIN и SELF JOIN */}
      <section className={s.section}>
        <SectionTitle>CROSS JOIN и SELF JOIN</SectionTitle>

        <CodeHighlight lang="sql" code={`-- CROSS JOIN: каждая строка × каждую строку (без ON)
SELECT u.name, d.title
FROM users u
CROSS JOIN departments d;
-- 8 пользователей × 3 отдела = 24 строки
-- Когда нужен: генерация комбинаций, calendar × product для отчётов`} />

        <CodeHighlight lang="sql" code={`-- SELF JOIN: таблица соединяется сама с собой
-- Классика: иерархия сотрудник → менеджер
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY e.name;
-- Сотрудники без менеджера (CEO): manager = NULL`} />
      </section>

      {/* 8. Несколько JOIN */}
      <section className={s.section}>
        <SectionTitle>Несколько JOIN подряд</SectionTitle>
        <p className={s.lead}>
          JOIN можно цеплять один за другим. PostgreSQL строит промежуточный результат
          последовательно: сначала users + departments, потом результат + orders.
        </p>

        <CodeHighlight lang="sql" code={`-- Три таблицы: имя, отдел, кол-во заказов
SELECT
  u.name,
  d.title                    AS dept,
  COUNT(o.id)                AS order_cnt,
  COALESCE(SUM(o.amount), 0) AS total
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id   -- сохраним Henry без отдела
LEFT JOIN orders     o ON u.id   = o.user_id  -- сохраним без заказов
GROUP BY u.name, d.title
ORDER BY total DESC;`} />

        <div className={s.warning}>
          <div className={s.warningLabel}>// fan-out при JOIN + агрегация</div>
          <div className={s.warningText}>
            Если Alice имеет 2 заказа и присоединяется к ещё одной таблице через JOIN — она появится в результате 2 раза.
            AVG(u.salary) посчитает её зарплату дважды. Решение: агрегируй заказы в подзапросе или CTE до основного JOIN.
          </div>
        </div>

        <CodeHighlight lang="sql" code={`-- Правильный паттерн: агрегация в CTE, потом JOIN
WITH order_stats AS (
  SELECT user_id,
         COUNT(*)   AS cnt,
         SUM(amount) AS total
  FROM orders
  GROUP BY user_id
)
SELECT u.name, d.title, COALESCE(os.cnt, 0) AS orders, COALESCE(os.total, 0) AS total
FROM users u
LEFT JOIN departments d  ON u.dept_id = d.id
LEFT JOIN order_stats os ON u.id = os.user_id
ORDER BY total DESC;`} />
      </section>

      {/* 9. ON vs USING */}
      <section className={s.section}>
        <SectionTitle>ON vs USING</SectionTitle>

        <CodeHighlight lang="sql" code={`-- ON: явное условие, колонки могут называться по-разному
SELECT u.name, d.title
FROM users u
JOIN departments d ON u.dept_id = d.id;  -- dept_id ↔ id

-- USING: только если колонки называются одинаково
-- colонка появляется один раз в результате (не дублируется)
SELECT name, title
FROM users
JOIN departments USING (dept_id);  -- требует dept_id в обеих таблицах

-- Неэквисоединение: JOIN по неравенству
SELECT o.id, b.level
FROM orders o
JOIN bonus_tiers b ON o.amount BETWEEN b.min_val AND b.max_val;`} />
      </section>

      {/* 10. Практика */}
      <section className={s.section}>
        <SectionTitle>Практика — 10 задач на JOIN</SectionTitle>
        <p className={s.lead}>
          От простого INNER JOIN до тройных соединений и anti-join. Пиши запрос, жми «Проверить».
        </p>
        <JoinChallenges />
      </section>

      {/* 11. Quiz */}
      <section className={s.section}>
        <SectionTitle>Проверь себя — 22 вопроса</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
