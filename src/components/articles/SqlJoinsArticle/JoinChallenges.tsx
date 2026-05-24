'use client';

import { useState } from 'react';
import { runQuery, DB, DB_COLUMNS } from '../SqlQueriesArticle/sqlEngine';
import s from './JoinChallenges.module.scss';

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
  // ── 1 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j1',
    title: 'INNER JOIN: сотрудник + отдел',
    task: 'Выведи имя каждого сотрудника и название его отдела. Только сотрудников с отделом. Отсортируй по имени.',
    hint: 'SELECT u.name, d.title FROM users u INNER JOIN departments d ON u.dept_id = d.id',
    answer: 'SELECT u.name, d.title\nFROM users u\nINNER JOIN departments d ON u.dept_id = d.id\nORDER BY u.name',
    checkFn: (sql) => checkQuery(sql, [
      ['Alice', 'Разработка'],
      ['Bob',   'Маркетинг'],
      ['Carol', 'Разработка'],
      ['Dave',  'Аналитика'],
      ['Eve',   'Маркетинг'],
      ['Frank', 'Разработка'],
      ['Grace', 'Аналитика'],
    ]),
  },

  // ── 2 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j2',
    title: 'LEFT JOIN: все, включая без отдела',
    task: 'Выведи имена всех сотрудников и названия их отделов. Для сотрудников без отдела — NULL. Отсортируй по имени.',
    hint: 'LEFT JOIN — сохраняет ВСЕ строки левой таблицы, для несовпавших — NULL справа',
    answer: 'SELECT u.name, d.title\nFROM users u\nLEFT JOIN departments d ON u.dept_id = d.id\nORDER BY u.name',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 8) return false;
      // Henry — last alphabetically — должен быть с NULL отделом
      const henry = r.rows.find(row => String(row[0]) === 'Henry');
      return !!henry && (henry[1] === null || String(henry[1]) === 'NULL');
    },
  },

  // ── 3 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j3',
    title: 'Anti-join: без заказов',
    task: 'Найди сотрудников, у которых нет ни одного заказа. Выведи только имя. Отсортируй по имени.',
    hint: 'LEFT JOIN orders + WHERE o.id IS NULL — строки без совпадений справа',
    answer: 'SELECT u.name\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.id IS NULL\nORDER BY u.name',
    checkFn: (sql) => checkQuery(sql, [['Dave'], ['Henry']]),
  },

  // ── 4 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j4',
    title: 'JOIN + WHERE: выполненные заказы',
    task: "Выведи имя сотрудника, продукт и сумму для заказов со статусом 'done'. Отсортируй по сумме по убыванию.",
    hint: "INNER JOIN + WHERE o.status = 'done' ORDER BY o.amount DESC",
    answer: "SELECT u.name, o.product, o.amount\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'done'\nORDER BY o.amount DESC",
    checkFn: (sql) => checkQuery(sql, [
      ['Carol', 'Laptop',   90000],
      ['Alice', 'Laptop',   85000],
      ['Carol', 'Keyboard',  8000],
      ['Frank', 'Mouse',     3000],
      ['Alice', 'Mouse',     2500],
    ]),
  },

  // ── 5 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j5',
    title: 'LEFT JOIN + COUNT: заказы на каждого',
    task: 'Для каждого сотрудника посчитай количество его заказов (cnt), включая 0 если заказов нет. Отсортируй по cnt по убыванию, затем по имени.',
    hint: 'LEFT JOIN + COUNT(o.id) — важно считать o.id, не *. GROUP BY u.name',
    answer: 'SELECT u.name, COUNT(o.id) AS cnt\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY cnt DESC, u.name',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 8) return false;
      // первые два — 2 заказа, последние два — 0
      const top2 = r.rows.slice(0, 2).every(row => Number(row[1]) === 2);
      const bot2 = r.rows.slice(6, 8).every(row => Number(row[1]) === 0);
      return top2 && bot2;
    },
  },

  // ── 6 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j6',
    title: 'LEFT JOIN + COALESCE: сумма с нулями',
    task: 'Для каждого сотрудника выведи имя и суммарную стоимость заказов. Для тех без заказов — 0 (не NULL). Отсортируй по total по убыванию.',
    hint: 'COALESCE(SUM(o.amount), 0) AS total — заменяет NULL на 0',
    answer: 'SELECT u.name, COALESCE(SUM(o.amount), 0) AS total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY total DESC',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 8) return false;
      const first = r.rows[0];
      const last  = r.rows[7];
      return String(first[0]) === 'Carol' && Number(first[1]) === 98000
          && Number(last[1]) === 0 && last[1] !== null;
    },
  },

  // ── 7 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j7',
    title: 'JOIN + HAVING: сумма > 10 000',
    task: 'Найди сотрудников, у которых суммарная стоимость заказов превышает 10 000. Выведи name и total. Отсортируй по total по убыванию.',
    hint: 'INNER JOIN + GROUP BY + HAVING SUM(o.amount) > 10000',
    answer: 'SELECT u.name, SUM(o.amount) AS total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nHAVING SUM(o.amount) > 10000\nORDER BY total DESC',
    checkFn: (sql) => checkQuery(sql, [
      ['Carol', 98000],
      ['Alice', 87500],
      ['Grace', 40000],
      ['Bob',   35000],
      ['Eve',   15000],
    ]),
  },

  // ── 8 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j8',
    title: 'Тройной JOIN: имя + отдел + кол-во заказов',
    task: 'Для каждого сотрудника выведи его имя, название отдела и количество заказов. Отсортируй по кол-ву заказов по убыванию, затем по имени.',
    hint: 'users LEFT JOIN departments + LEFT JOIN orders — два LEFT JOIN подряд',
    answer: 'SELECT u.name, d.title, COUNT(o.id) AS cnt\nFROM users u\nLEFT JOIN departments d ON u.dept_id = d.id\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name, d.title\nORDER BY cnt DESC, u.name',
    checkFn: (sql) => {
      const r = runQuery(sql);
      if (r.error || r.rows.length !== 8) return false;
      const first = r.rows[0];
      // Alice или Carol первые (оба по 2 заказа), в отделе Разработка
      return Number(first[2]) === 2 && String(first[1]) === 'Разработка';
    },
  },

  // ── 9 ────────────────────────────────────────────────────────────────────────
  {
    id: 'j9',
    title: 'JOIN + GROUP BY: фонд зарплат по отделам',
    task: 'Для каждого отдела выведи название и суммарный фонд зарплат (payroll). Отсортируй по payroll по убыванию.',
    hint: 'departments JOIN users + GROUP BY d.title + SUM(u.salary)',
    answer: 'SELECT d.title, SUM(u.salary) AS payroll\nFROM departments d\nINNER JOIN users u ON u.dept_id = d.id\nGROUP BY d.title\nORDER BY payroll DESC',
    checkFn: (sql) => checkQuery(sql, [
      ['Разработка', 365000],  // Alice+Carol+Frank
      ['Аналитика',  210000],  // Dave+Grace
      ['Маркетинг',  200000],  // Bob+Eve
    ]),
  },

  // ── 10 ───────────────────────────────────────────────────────────────────────
  {
    id: 'j10',
    title: 'JOIN + WHERE: заказы москвичей',
    task: "Для каждого сотрудника из Москвы посчитай количество его заказов (включая 0). Отсортируй по cnt по убыванию, затем по имени.",
    hint: "LEFT JOIN + WHERE u.city = 'Москва' + COUNT(o.id)",
    answer: "SELECT u.name, COUNT(o.id) AS cnt\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.city = 'Москва'\nGROUP BY u.name\nORDER BY cnt DESC, u.name",
    checkFn: (sql) => checkQuery(sql, [
      ['Alice', 2],
      ['Carol', 2],
      ['Eve',   1],
      ['Henry', 0],
    ]),
  },
];

type Status = 'idle' | 'ok' | 'fail';
type Tab = 'task' | 'schema';

export function JoinChallenges() {
  const [active,     setActive]     = useState(0);
  const [tab,        setTab]        = useState<Tab>('task');
  const [sqls,       setSqls]       = useState<Record<string, string>>({});
  const [statuses,   setStatuses]   = useState<Record<string, Status>>({});
  const [showHint,   setShowHint]   = useState<Record<string, boolean>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  const challenge = CHALLENGES[active];
  const sql       = sqls[challenge.id] ?? '';
  const status    = statuses[challenge.id] ?? 'idle';
  const result    = sql ? runQuery(sql) : null;

  const handleCheck = () => {
    setStatuses(p => ({ ...p, [challenge.id]: challenge.checkFn(sql) ? 'ok' : 'fail' }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleCheck(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const pos = ta.selectionStart;
      const val = sql.slice(0, pos) + '  ' + sql.slice(ta.selectionEnd);
      setSqls(p => ({ ...p, [challenge.id]: val }));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = pos + 2; }, 0);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// join-challenges</span>
        <span className={s.progress}>{Object.values(statuses).filter(v => v === 'ok').length} / {CHALLENGES.length}</span>
      </div>

      <div className={s.body}>
        {/* Список задач */}
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

        {/* Основная панель */}
        <div className={s.main}>
          <div className={s.tabs}>
            <button className={`${s.tab} ${tab === 'task'   ? s.tabActive : ''}`} onClick={() => setTab('task')}>Задача</button>
            <button className={`${s.tab} ${tab === 'schema' ? s.tabActive : ''}`} onClick={() => setTab('schema')}>Схема БД</button>
          </div>

          {/* Схема */}
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

          {/* Задача */}
          {tab === 'task' && (
            <div className={s.taskArea}>
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
                rows={5}
              />

              <div className={s.actions}>
                <button className={s.checkBtn} onClick={handleCheck}>Проверить</button>
                <button className={s.hintBtn}   onClick={() => setShowHint(p => ({ ...p, [challenge.id]: !p[challenge.id] }))}>
                  {showHint[challenge.id] ? 'Скрыть подсказку' : 'Подсказка'}
                </button>
                <button className={s.answerBtn} onClick={() => setShowAnswer(p => ({ ...p, [challenge.id]: !p[challenge.id] }))}>
                  {showAnswer[challenge.id] ? 'Скрыть ответ' : 'Показать ответ'}
                </button>
              </div>

              {showHint[challenge.id]   && <div className={s.hint}><span className={s.hintLabel}>// hint</span> {challenge.hint}</div>}
              {showAnswer[challenge.id] && <pre className={s.answer}>{challenge.answer}</pre>}

              {status === 'ok'   && <div className={`${s.feedback} ${s.feedbackOk}`}>✓ Верно! Запрос возвращает правильный результат.</div>}
              {status === 'fail' && <div className={`${s.feedback} ${s.feedbackFail}`}>✕ Не совпадает с ожидаемым. Проверь условие JOIN, WHERE и ORDER BY.</div>}

              {result && !result.error && result.rows.length > 0 && (
                <div className={s.preview}>
                  <div className={s.previewLabel}>результат ({result.rowCount} rows)</div>
                  <div className={s.tableWrap}>
                    <table className={s.table}>
                      <thead><tr>{result.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                      <tbody>
                        {result.rows.slice(0, 8).map((row, i) => (
                          <tr key={i}>{row.map((cell, j) => <td key={j}>{cell === null || cell === undefined ? 'NULL' : String(cell)}</td>)}</tr>
                        ))}
                        {result.rows.length > 8 && <tr><td colSpan={result.columns.length} className={s.more}>…ещё {result.rows.length - 8} строк</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {result?.error && <div className={s.error}>{result.error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
