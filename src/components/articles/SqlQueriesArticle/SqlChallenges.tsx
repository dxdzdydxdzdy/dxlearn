'use client';

import { useState } from 'react';
import { runQuery, DB, DB_COLUMNS } from './sqlEngine';
import s from './SqlChallenges.module.scss';

interface Challenge {
  id: string;
  title: string;
  task: string;
  hint: string;
  answer: string;
  checkFn: (sql: string) => boolean;
}

function rowsEqual(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i].map(v => v === null || v === undefined ? 'NULL' : String(v).trim());
    const rb = b[i].map(v => v === null || v === undefined ? 'NULL' : String(v).trim());
    if (ra.join('\x00') !== rb.join('\x00')) return false;
  }
  return true;
}

function checkQuery(sql: string, expectedRows: unknown[][], sortRows = false): boolean {
  const r = runQuery(sql);
  if (r.error || r.rows.length === 0) return false;
  const got = sortRows ? [...r.rows].sort((a, b) => String(a[0]).localeCompare(String(b[0]))) : r.rows;
  const exp = sortRows ? [...expectedRows].sort((a, b) => String(a[0]).localeCompare(String(b[0]))) : expectedRows;
  return rowsEqual(got, exp);
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Найди богатых москвичей',
    task: 'Выбери имя и зарплату сотрудников из Москвы с зарплатой > 100 000. Отсортируй по зарплате по убыванию.',
    hint: 'WHERE city = ... AND salary > ... ORDER BY salary DESC',
    answer: "SELECT name, salary FROM users WHERE city = 'Москва' AND salary > 100000 ORDER BY salary DESC",
    checkFn: (sql) => checkQuery(sql, [
      ['Carol', 150000],
      ['Alice', 120000],
      ['Eve', 110000],
    ]),
  },
  {
    id: 'c2',
    title: 'Статистика по городам',
    task: 'Для каждого города посчитай количество сотрудников и среднюю зарплату. Отсортируй по количеству по убыванию.',
    hint: 'GROUP BY city ORDER BY COUNT(*) DESC',
    answer: "SELECT city, COUNT(*) as cnt, AVG(salary) as avg_sal FROM users GROUP BY city ORDER BY cnt DESC",
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 3) return false;
      // Check first row is Москва with 4 people
      const first = r.rows[0];
      return String(first[0]) === 'Москва' && Number(first[1]) === 4;
    },
  },
  {
    id: 'c3',
    title: 'Заказы на крупную сумму',
    task: 'Найди все заказы с суммой > 10 000. Выведи product и amount. Отсортируй по amount по убыванию.',
    hint: 'WHERE amount > 10000 ORDER BY amount DESC',
    answer: 'SELECT product, amount FROM orders WHERE amount > 10000 ORDER BY amount DESC',
    checkFn: (sql) => checkQuery(sql, [
      ['Laptop', 90000],
      ['Laptop', 85000],
      ['Monitor', 40000],
      ['Monitor', 35000],
      ['Headphones', 15000],
    ]),
  },
  {
    id: 'c4',
    title: 'JOIN: сотрудники и их заказы',
    task: 'Для каждого сотрудника выведи его имя и суммарную стоимость всех его заказов. Включи сотрудников без заказов (NULL). Отсортируй по total по убыванию.',
    hint: 'LEFT JOIN + GROUP BY u.name + SUM(o.amount)',
    answer: 'SELECT u.name, SUM(o.amount) as total FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY total DESC',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 8) return false;
      const first = r.rows[0];
      return String(first[0]) === 'Carol' && Number(first[1]) === 98000;
    },
  },
  {
    id: 'c5',
    title: 'Сотрудники без отдела',
    task: 'Найди сотрудников, у которых dept_id IS NULL. Выведи только их имена.',
    hint: 'WHERE dept_id IS NULL',
    answer: 'SELECT name FROM users WHERE dept_id IS NULL',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 1) return false;
      return String(r.rows[0][0]) === 'Henry';
    },
  },
  {
    id: 'c6',
    title: 'Отделы с расходами на зарплаты',
    task: 'Для каждого отдела выведи его название (title) и суммарный фонд зарплат. Только отделы с фондом > 300 000. Отсортируй по фонду по убыванию.',
    hint: 'JOIN departments + GROUP BY d.title + HAVING SUM(salary) > 300000',
    answer: 'SELECT d.title, SUM(u.salary) as payroll FROM departments d JOIN users u ON u.dept_id = d.id GROUP BY d.title HAVING SUM(u.salary) > 300000 ORDER BY payroll DESC',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 2) return false;
      return String(r.rows[0][0]) === 'Разработка';
    },
  },
  {
    id: 'c7',
    title: 'LIKE: товары с буквой «a»',
    task: "Найди уникальные названия продуктов из таблицы orders, которые содержат букву 'a'. Отсортируй по алфавиту.",
    hint: "SELECT DISTINCT ... WHERE product LIKE '%a%' ORDER BY ...",
    answer: "SELECT DISTINCT product FROM orders WHERE product LIKE '%a%' ORDER BY product",
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 3) return false;
      // Headphones, Keyboard, Laptop — alphabetical
      return String(r.rows[0][0]) === 'Headphones' && String(r.rows[2][0]) === 'Laptop';
    },
  },
  {
    id: 'c8',
    title: 'LIKE _: имена из 5 букв',
    task: 'Найди всех сотрудников с именем ровно из 5 букв. Выведи name и city. Отсортируй по имени.',
    hint: "WHERE name LIKE '_____' (пять символов подчёркивания) ORDER BY name",
    answer: "SELECT name, city FROM users WHERE name LIKE '_____' ORDER BY name",
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 5) return false;
      // Alice, Carol, Frank, Grace, Henry
      return String(r.rows[0][0]) === 'Alice' && String(r.rows[4][0]) === 'Henry';
    },
  },
  {
    id: 'c9',
    title: 'GROUP BY: статистика по статусам',
    task: 'Для каждого статуса заказа посчитай количество заказов (cnt) и среднюю сумму (avg_amount). Отсортируй по количеству по убыванию.',
    hint: 'GROUP BY status + COUNT(*) + AVG(amount) ORDER BY cnt DESC',
    answer: 'SELECT status, COUNT(*) as cnt, AVG(amount) as avg_amount FROM orders GROUP BY status ORDER BY cnt DESC',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 3) return false;
      // First row: done, 5 orders
      return String(r.rows[0][0]) === 'done' && Number(r.rows[0][1]) === 5;
    },
  },
  {
    id: 'c10',
    title: 'Не из Москвы с высокой зарплатой',
    task: 'Найди сотрудников НЕ из Москвы с зарплатой >= 90 000. Выведи name, city, salary. Отсортируй по зарплате по убыванию.',
    hint: "WHERE city != 'Москва' AND salary >= 90000 ORDER BY salary DESC",
    answer: "SELECT name, city, salary FROM users WHERE city != 'Москва' AND salary >= 90000 ORDER BY salary DESC",
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 3) return false;
      // Grace(130000), Frank(95000), Bob(90000)
      return String(r.rows[0][0]) === 'Grace' && String(r.rows[2][0]) === 'Bob';
    },
  },
];

type Status = 'idle' | 'ok' | 'fail';
type Tab = 'task' | 'schema';

export function SqlChallenges() {
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<Tab>('task');
  const [sqls, setSqls] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  const challenge = CHALLENGES[active];
  const sql = sqls[challenge.id] ?? '';
  const status = statuses[challenge.id] ?? 'idle';
  const result = sql ? runQuery(sql) : null;

  const handleCheck = () => {
    const ok = challenge.checkFn(sql);
    setStatuses(p => ({ ...p, [challenge.id]: ok ? 'ok' : 'fail' }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCheck();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const newVal = sql.slice(0, start) + '  ' + sql.slice(ta.selectionEnd);
      setSqls(p => ({ ...p, [challenge.id]: newVal }));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// sql-challenges</span>
        <span className={s.progress}>{Object.values(statuses).filter(v => v === 'ok').length} / {CHALLENGES.length}</span>
      </div>

      <div className={s.body}>
        <div className={s.list}>
          {CHALLENGES.map((c, i) => {
            const st = statuses[c.id] ?? 'idle';
            return (
              <button
                key={c.id}
                className={`${s.item} ${active === i ? s.itemActive : ''} ${st === 'ok' ? s.itemDone : ''}`}
                onClick={() => setActive(i)}
              >
                <span className={s.itemNum}>{i + 1}</span>
                <span className={s.itemTitle}>{c.title}</span>
                {st === 'ok' && <span className={s.itemCheck}>✓</span>}
              </button>
            );
          })}
        </div>

        <div className={s.main}>
          <div className={s.tabs}>
            <button className={`${s.tab} ${tab === 'task' ? s.tabActive : ''}`} onClick={() => setTab('task')}>Задача</button>
            <button className={`${s.tab} ${tab === 'schema' ? s.tabActive : ''}`} onClick={() => setTab('schema')}>Схема БД</button>
          </div>

          {tab === 'schema' && (
            <div className={s.schemaPanel}>
              {Object.entries(DB_COLUMNS).map(([table, cols]) => (
                <div key={table} className={s.schemaBlock}>
                  <div className={s.schemaTableName}>{table}</div>
                  <div className={s.schemaColList}>
                    {cols.map(col => (
                      <span key={col.name} className={s.schemaColItem}>
                        <span className={s.schemaColName}>{col.name}</span>
                        <span className={s.schemaColType}>{col.type}</span>
                      </span>
                    ))}
                  </div>
                  <div className={s.sampleWrap}>
                    <table className={s.sampleTable}>
                      <thead>
                        <tr>{cols.map(c => <th key={c.name}>{c.name}</th>)}</tr>
                      </thead>
                      <tbody>
                        {(DB[table] ?? []).slice(0, 4).map((row, i) => (
                          <tr key={i}>
                            {cols.map(c => (
                              <td key={c.name} className={row[c.name] === null ? s.nullCell : ''}>
                                {row[c.name] === null ? 'NULL' : String(row[c.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {(DB[table]?.length ?? 0) > 4 && (
                          <tr><td colSpan={cols.length} className={s.moreRows}>…ещё {(DB[table]?.length ?? 0) - 4} строк</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'task' && <div className={s.taskArea}>
          <div className={s.task}>{challenge.task}</div>

          <textarea
            className={`${s.editor} ${status === 'ok' ? s.editorOk : status === 'fail' ? s.editorFail : ''}`}
            placeholder="SELECT ..."
            value={sql}
            onChange={e => {
              setSqls(p => ({ ...p, [challenge.id]: e.target.value }));
              setStatuses(p => ({ ...p, [challenge.id]: 'idle' }));
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCorrect="off"
            rows={4}
          />

          <div className={s.actions}>
            <button className={s.checkBtn} onClick={handleCheck}>Проверить</button>
            <button className={s.hintBtn} onClick={() => setShowHint(p => ({ ...p, [challenge.id]: !p[challenge.id] }))}>
              {showHint[challenge.id] ? 'Скрыть подсказку' : 'Подсказка'}
            </button>
            <button className={s.answerBtn} onClick={() => setShowAnswer(p => ({ ...p, [challenge.id]: !p[challenge.id] }))}>
              {showAnswer[challenge.id] ? 'Скрыть ответ' : 'Показать ответ'}
            </button>
          </div>

          {showHint[challenge.id] && (
            <div className={s.hint}><span className={s.hintLabel}>// hint</span> {challenge.hint}</div>
          )}
          {showAnswer[challenge.id] && (
            <pre className={s.answer}>{challenge.answer}</pre>
          )}

          {status === 'ok' && <div className={s.feedback + ' ' + s.feedbackOk}>✓ Верно! Запрос возвращает правильный результат.</div>}
          {status === 'fail' && <div className={s.feedback + ' ' + s.feedbackFail}>✕ Не совпадает с ожидаемым результатом. Попробуй ещё.</div>}

          {result && !result.error && result.rows.length > 0 && (
            <div className={s.preview}>
              <div className={s.previewLabel}>результат ({result.rowCount} rows)</div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>{result.columns.map(c => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 6).map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{cell === null || cell === undefined ? 'NULL' : String(cell)}</td>)}</tr>
                    ))}
                    {result.rows.length > 6 && <tr><td colSpan={result.columns.length} className={s.more}>…ещё {result.rows.length - 6} строк</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {result?.error && <div className={s.error}>{result.error}</div>}
          </div>}
        </div>
      </div>
    </div>
  );
}
