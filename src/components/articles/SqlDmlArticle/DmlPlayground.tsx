'use client';

import { useState, useCallback } from 'react';
import { runDML, freshDB, type DMLResult, type DMLError, type Schema } from './dmlEngine';
import { DB_COLUMNS } from '../SqlQueriesArticle/sqlEngine';
import s from './DmlPlayground.module.scss';

// ── Example queries ───────────────────────────────────────────────────────────

const EXAMPLES = {
  INSERT: [
    {
      label: 'Добавить сотрудника',
      code: `INSERT INTO users (name, dept_id, salary, age, city)
VALUES ('Иван', 2, 95000, 27, 'Казань')`,
    },
    {
      label: 'INSERT + RETURNING',
      code: `INSERT INTO orders (user_id, product, amount, status)
VALUES (1, 'Keyboard', 8500, 'pending')
RETURNING id, product, amount`,
    },
    {
      label: 'Несколько строк',
      code: `INSERT INTO orders (user_id, product, amount, status)
VALUES
  (2, 'Mouse', 2800, 'done'),
  (3, 'Webcam', 12000, 'pending'),
  (5, 'SSD', 7500, 'done')`,
    },
  ],
  UPDATE: [
    {
      label: 'Повысить зарплату',
      code: `UPDATE users
SET salary = salary * 1.1
WHERE dept_id = 1`,
    },
    {
      label: '⚠ Без WHERE (все строки!)',
      code: `-- ОПАСНО: обновит ВСЕ строки таблицы!
UPDATE orders SET status = 'done'`,
    },
    {
      label: 'UPDATE + RETURNING',
      code: `UPDATE users
SET city = 'Новосибирск'
WHERE id = 4
RETURNING id, name, city`,
    },
  ],
  DELETE: [
    {
      label: 'Удалить по условию',
      code: `DELETE FROM orders
WHERE status = 'cancelled'`,
    },
    {
      label: 'DELETE + RETURNING',
      code: `DELETE FROM users
WHERE dept_id IS NULL
RETURNING id, name, salary`,
    },
    {
      label: 'TRUNCATE',
      code: `-- Очистить всю таблицу
TRUNCATE TABLE orders`,
    },
  ],
};

type ExGroup = keyof typeof EXAMPLES;
type HighlightType = 'insert' | 'update' | 'delete' | null;

// ── Component ─────────────────────────────────────────────────────────────────

export function DmlPlayground() {
  const [db, setDb] = useState<Schema>(freshDB);
  const [activeTable, setActiveTable] = useState<string>('users');
  const [activeGroup, setActiveGroup] = useState<ExGroup>('INSERT');
  const [sql, setSql] = useState(EXAMPLES.INSERT[0].code);
  const [result, setResult] = useState<DMLResult | DMLError | null>(null);
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [highlightType, setHighlightType] = useState<HighlightType>(null);

  const handleRun = useCallback(() => {
    const res = runDML(sql, db);
    if ('error' in res) {
      setResult(res);
      setHighlighted(new Set());
      setHighlightType(null);
    } else {
      setDb(res.newDB);
      setActiveTable(res.table);
      setHighlighted(res.affectedIds);
      setHighlightType(res.type.toLowerCase() as HighlightType);
      setResult(res);
    }
  }, [sql, db]);

  const handleReset = useCallback(() => {
    setDb(freshDB());
    setResult(null);
    setHighlighted(new Set());
    setHighlightType(null);
  }, []);

  const loadExample = (code: string) => {
    setSql(code);
    setResult(null);
    setHighlighted(new Set());
    setHighlightType(null);
  };

  const rows = db[activeTable] ?? [];
  const cols = DB_COLUMNS[activeTable]?.map(c => c.name) ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
  const isSuccess = result && !('error' in result);
  const isError = result && 'error' in result;

  return (
    <div className={s.playground}>

      {/* ── Table view ── */}
      <div className={s.tablePanel}>
        <div className={s.tableHeader}>
          <div className={s.tableTabs}>
            {Object.keys(db).map(t => (
              <button
                key={t}
                className={`${s.tableTab} ${activeTable === t ? s.tableTabActive : ''}`}
                onClick={() => { setActiveTable(t); setHighlighted(new Set()); setHighlightType(null); }}
              >
                {t}
                <span className={s.rowCount}>{db[t].length}</span>
              </button>
            ))}
          </div>
          <button className={s.resetBtn} onClick={handleReset} title="Сбросить базу">
            ↺ сброс
          </button>
        </div>

        <div className={s.tableWrap}>
          {rows.length === 0 ? (
            <div className={s.emptyTable}>// таблица пуста</div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  {cols.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const id = row['id'] as number;
                  const isHl = highlighted.has(id);
                  const rowCls = isHl
                    ? `${s.tr} ${highlightType === 'insert' ? s.trInsert : s.trUpdate}`
                    : s.tr;
                  return (
                    <tr key={ri} className={rowCls}>
                      {cols.map(c => (
                        <td key={c} className={s.td}>
                          {row[c] == null
                            ? <span className={s.null}>NULL</span>
                            : String(row[c])
                          }
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className={s.editor}>
        <div className={s.exampleBar}>
          <div className={s.groupTabs}>
            {(Object.keys(EXAMPLES) as ExGroup[]).map(g => (
              <button
                key={g}
                className={`${s.groupTab} ${activeGroup === g ? s.groupTabActive : ''}`}
                onClick={() => setActiveGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className={s.exampleBtns}>
            {EXAMPLES[activeGroup].map(ex => (
              <button
                key={ex.label}
                className={s.exBtn}
                onClick={() => loadExample(ex.code)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className={s.textarea}
          value={sql}
          onChange={e => setSql(e.target.value)}
          spellCheck={false}
          rows={5}
        />

        <button className={s.runBtn} onClick={handleRun}>
          ▶ Выполнить
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className={`${s.result} ${isError ? s.resultError : s.resultOk}`}>
          {isError ? (
            <>
              <span className={s.resultIcon}>✗</span>
              <span className={s.resultMsg}>{(result as DMLError).error}</span>
            </>
          ) : (
            <>
              <span className={s.resultIcon}>✓</span>
              <span className={s.resultMsg}>
                {(result as DMLResult).message}
                {(result as DMLResult).affected === 0 && (
                  <span className={s.resultHint}> — условие не совпало ни с одной строкой</span>
                )}
              </span>
            </>
          )}
          {isSuccess && (result as DMLResult).returning && (
            <div className={s.returning}>
              <div className={s.returningLabel}>RETURNING:</div>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      {(result as DMLResult).returning!.columns.map(c => <th key={c}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(result as DMLResult).returning!.rows.map((row, ri) => (
                      <tr key={ri} className={s.tr}>
                        {row.map((v, ci) => (
                          <td key={ci} className={s.td}>
                            {v == null ? <span className={s.null}>NULL</span> : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
