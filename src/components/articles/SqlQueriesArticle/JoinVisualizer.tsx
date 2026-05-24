'use client';

import { useState } from 'react';
import s from './JoinVisualizer.module.scss';

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

const USERS = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
  { id: 4, name: 'Dave' },  // no orders
];

const ORDERS = [
  { id: 1, user_id: 1, product: 'Laptop' },
  { id: 2, user_id: 1, product: 'Mouse' },
  { id: 3, user_id: 2, product: 'Monitor' },
  { id: 99, user_id: 99, product: 'Tablet' }, // no matching user
];

interface ResultRow {
  userId: number | null;
  userName: string | null;
  orderId: number | null;
  product: string | null;
  leftNull: boolean;
  rightNull: boolean;
}

function computeResult(type: JoinType): ResultRow[] {
  const result: ResultRow[] = [];

  if (type === 'INNER') {
    for (const u of USERS) {
      const matched = ORDERS.filter(o => o.user_id === u.id);
      for (const o of matched) result.push({ userId: u.id, userName: u.name, orderId: o.id, product: o.product, leftNull: false, rightNull: false });
    }
  } else if (type === 'LEFT') {
    for (const u of USERS) {
      const matched = ORDERS.filter(o => o.user_id === u.id);
      if (matched.length) {
        for (const o of matched) result.push({ userId: u.id, userName: u.name, orderId: o.id, product: o.product, leftNull: false, rightNull: false });
      } else {
        result.push({ userId: u.id, userName: u.name, orderId: null, product: null, leftNull: false, rightNull: true });
      }
    }
  } else if (type === 'RIGHT') {
    for (const o of ORDERS) {
      const u = USERS.find(u => u.id === o.user_id);
      if (u) {
        result.push({ userId: u.id, userName: u.name, orderId: o.id, product: o.product, leftNull: false, rightNull: false });
      } else {
        result.push({ userId: null, userName: null, orderId: o.id, product: o.product, leftNull: true, rightNull: false });
      }
    }
  } else {
    // FULL OUTER
    const leftResult = new Map<number, boolean>();
    for (const u of USERS) {
      const matched = ORDERS.filter(o => o.user_id === u.id);
      if (matched.length) {
        for (const o of matched) { result.push({ userId: u.id, userName: u.name, orderId: o.id, product: o.product, leftNull: false, rightNull: false }); leftResult.set(o.id, true); }
      } else {
        result.push({ userId: u.id, userName: u.name, orderId: null, product: null, leftNull: false, rightNull: true });
      }
    }
    for (const o of ORDERS) {
      if (!leftResult.has(o.id) && !USERS.find(u => u.id === o.user_id)) {
        result.push({ userId: null, userName: null, orderId: o.id, product: o.product, leftNull: true, rightNull: false });
      }
    }
  }

  return result;
}

const JOIN_INFO: Record<JoinType, { label: string; color: string; desc: string; sql: string }> = {
  INNER: {
    label: 'INNER JOIN',
    color: '#4e9eff',
    desc: 'Только строки, у которых есть совпадение в обеих таблицах.',
    sql: 'SELECT u.name, o.product\nFROM users u\nJOIN orders o ON u.id = o.user_id',
  },
  LEFT: {
    label: 'LEFT JOIN',
    color: '#00e5a0',
    desc: 'Все строки из левой таблицы + совпадения справа. Нет совпадения — NULL.',
    sql: 'SELECT u.name, o.product\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id',
  },
  RIGHT: {
    label: 'RIGHT JOIN',
    color: '#f0c040',
    desc: 'Все строки из правой таблицы + совпадения слева. Нет совпадения — NULL.',
    sql: 'SELECT u.name, o.product\nFROM users u\nRIGHT JOIN orders o ON u.id = o.user_id',
  },
  FULL: {
    label: 'FULL OUTER',
    color: '#b48eff',
    desc: 'Все строки из обеих таблиц. Нет совпадения с одной стороны — NULL.',
    sql: 'SELECT u.name, o.product\nFROM users u\nFULL OUTER JOIN orders o ON u.id = o.user_id',
  },
};

export function JoinVisualizer() {
  const [type, setType] = useState<JoinType>('INNER');
  const result = computeResult(type);
  const info = JOIN_INFO[type];

  const isUserActive = (uid: number) => result.some(r => r.userId === uid);
  const isOrderActive = (oid: number) => result.some(r => r.orderId === oid);

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// join-visualizer</span>
      </div>

      <div className={s.tabs}>
        {(Object.keys(JOIN_INFO) as JoinType[]).map(t => (
          <button
            key={t}
            className={`${s.tab} ${type === t ? s.tabActive : ''}`}
            style={{ '--jc': JOIN_INFO[t].color } as React.CSSProperties}
            onClick={() => setType(t)}
          >
            {JOIN_INFO[t].label}
          </button>
        ))}
      </div>

      <div className={s.body}>
        <div className={s.tables}>
          {/* Left table */}
          <div className={s.tablePanel}>
            <div className={s.tableName}>users (LEFT)</div>
            {USERS.map(u => (
              <div
                key={u.id}
                className={`${s.tableRow} ${isUserActive(u.id) ? s.tableRowActive : s.tableRowDim}`}
                style={{ '--jc': info.color } as React.CSSProperties}
              >
                <span className={s.tableId}>{u.id}</span>
                <span>{u.name}</span>
              </div>
            ))}
          </div>

          {/* Venn */}
          <div className={s.venn}>
            <svg viewBox="0 0 120 80" className={s.vennSvg}>
              <circle cx="42" cy="40" r="30" fill={type === 'LEFT' || type === 'FULL' ? info.color : 'transparent'} fillOpacity="0.15" stroke={info.color} strokeWidth="1.5" />
              <circle cx="78" cy="40" r="30" fill={type === 'RIGHT' || type === 'FULL' ? info.color : 'transparent'} fillOpacity="0.15" stroke={info.color} strokeWidth="1.5" />
              {/* Inner intersection highlight */}
              {(type === 'INNER' || type === 'LEFT' || type === 'RIGHT' || type === 'FULL') && (
                <ellipse cx="60" cy="40" rx="12" ry="20" fill={info.color} fillOpacity="0.25" />
              )}
            </svg>
            <div className={s.vennLabel} style={{ color: info.color }}>
              {result.length} rows
            </div>
          </div>

          {/* Right table */}
          <div className={s.tablePanel}>
            <div className={s.tableName}>orders (RIGHT)</div>
            {ORDERS.map(o => (
              <div
                key={o.id}
                className={`${s.tableRow} ${isOrderActive(o.id) ? s.tableRowActive : s.tableRowDim}`}
                style={{ '--jc': info.color } as React.CSSProperties}
              >
                <span className={s.tableId}>{o.id}</span>
                <span>{o.product}</span>
                <span className={s.tableSubtext}>uid:{o.user_id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.right}>
          <div className={s.desc}>{info.desc}</div>
          <pre className={s.sqlPre}>{info.sql}</pre>

          <div className={s.resultTable}>
            <div className={s.resultHeader}>
              <span>name</span>
              <span>product</span>
            </div>
            {result.map((r, i) => (
              <div key={i} className={`${s.resultRow} ${r.leftNull || r.rightNull ? s.resultRowNull : ''}`}>
                <span className={r.leftNull ? s.nullCell : ''}>{r.userName ?? 'NULL'}</span>
                <span className={r.rightNull ? s.nullCell : ''}>{r.product ?? 'NULL'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
