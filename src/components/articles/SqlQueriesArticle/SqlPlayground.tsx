'use client';

import { useState, useCallback } from 'react';
import { runQuery, DB_COLUMNS } from './sqlEngine';
import s from './SqlPlayground.module.scss';

const EXAMPLES = [
  {
    label: 'SELECT *',
    sql: 'SELECT * FROM users',
  },
  {
    label: 'WHERE',
    sql: "SELECT name, salary, city\nFROM users\nWHERE city = 'Москва'\n  AND salary > 100000",
  },
  {
    label: 'ORDER BY',
    sql: 'SELECT name, salary, age\nFROM users\nORDER BY salary DESC\nLIMIT 3',
  },
  {
    label: 'IS NULL',
    sql: 'SELECT name, dept_id\nFROM users\nWHERE dept_id IS NULL',
  },
  {
    label: 'BETWEEN',
    sql: 'SELECT name, salary\nFROM users\nWHERE salary BETWEEN 90000 AND 120000',
  },
  {
    label: 'GROUP BY',
    sql: 'SELECT city,\n  COUNT(*) AS cnt,\n  AVG(salary) AS avg_sal\nFROM users\nGROUP BY city\nORDER BY cnt DESC',
  },
  {
    label: 'HAVING',
    sql: 'SELECT city, COUNT(*) AS cnt\nFROM users\nGROUP BY city\nHAVING COUNT(*) > 1',
  },
  {
    label: 'INNER JOIN',
    sql: 'SELECT u.name, o.product, o.amount\nFROM users u\nJOIN orders o ON u.id = o.user_id\nORDER BY o.amount DESC',
  },
  {
    label: 'LEFT JOIN',
    sql: 'SELECT u.name, o.product\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nORDER BY u.name',
  },
  {
    label: 'JOIN + AGG',
    sql: 'SELECT u.name,\n  COUNT(o.id) AS orders,\n  SUM(o.amount) AS total\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY total DESC',
  },
  {
    label: 'Multi-JOIN',
    sql: 'SELECT d.title, COUNT(u.id) AS emp_count,\n  SUM(u.salary) AS payroll\nFROM departments d\nLEFT JOIN users u ON u.dept_id = d.id\nGROUP BY d.title\nORDER BY payroll DESC',
  },
  {
    label: 'IN / NOT IN',
    sql: "SELECT name, status\nFROM orders\nWHERE status IN ('done', 'pending')\nORDER BY amount DESC",
  },
];

function formatVal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v % 1 !== 0 ? v.toFixed(2) : String(v);
  return String(v);
}

export function SqlPlayground() {
  const [sql, setSql] = useState(EXAMPLES[0].sql);
  const [result, setResult] = useState(() => runQuery(EXAMPLES[0].sql));

  const run = useCallback((query: string) => {
    setResult(runQuery(query));
  }, []);

  const handleRun = () => run(sql);

  const handleExample = (ex: typeof EXAMPLES[0]) => {
    setSql(ex.sql);
    run(ex.sql);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = sql.slice(0, start) + '  ' + sql.slice(end);
      setSql(newVal);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// sql-playground</span>
        <span className={s.hint}>⌘ Enter — выполнить</span>
      </div>

      <div className={s.body}>
        {/* Schema panel */}
        <div className={s.schema}>
          <div className={s.schemaTitle}>schema</div>
          {Object.entries(DB_COLUMNS).map(([table, cols]) => (
            <div key={table} className={s.schemaTable}>
              <div className={s.schemaTableName}>{table}</div>
              {cols.map(col => (
                <div key={col.name} className={s.schemaCol}>
                  <span className={s.schemaColName}>{col.name}</span>
                  <span className={s.schemaColType}>{col.type}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Editor + Results */}
        <div className={s.main}>
          <div className={s.examples}>
            {EXAMPLES.map(ex => (
              <button
                key={ex.label}
                className={`${s.exBtn} ${sql === ex.sql ? s.exBtnActive : ''}`}
                onClick={() => handleExample(ex)}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className={s.editorWrap}>
            <div className={s.lineNums}>
              {sql.split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className={s.editor}
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div className={s.toolbar}>
            <button className={s.runBtn} onClick={handleRun}>▶ Run</button>
            {!result.error && (
              <span className={s.rowCount}>{result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}</span>
            )}
          </div>

          <div className={s.results}>
            {result.error ? (
              <div className={s.error}>
                <span className={s.errorIcon}>✕</span>
                <span>{result.error}</span>
              </div>
            ) : result.columns.length === 0 ? (
              <div className={s.empty}>Нет результатов</div>
            ) : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      {result.columns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className={cell === null || cell === undefined ? s.null : ''}>
                            {formatVal(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
