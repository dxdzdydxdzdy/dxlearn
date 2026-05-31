'use client';

import { useState } from 'react';
import s from './BlameExplorer.module.scss';

interface BlameEntry {
  lineNo: number;
  hash: string;
  author: 'ivan' | 'maria' | 'alex';
  date: string;
  content: string;
}

interface CommitMeta {
  message: string;
  fullDate: string;
}

const AUTHORS: Record<string, { name: string; color: string }> = {
  ivan:  { name: 'Иван Петров',     color: '#00e5a0' },
  maria: { name: 'Мария Сидорова',  color: '#4db8ff' },
  alex:  { name: 'Алексей Козлов',  color: '#f0c040' },
};

const COMMITS: Record<string, CommitMeta> = {
  '2c1b0a9': { message: 'initial commit',                         fullDate: '12 янв 2025, 14:00' },
  '5b4a3f2': { message: 'feat: добавил загрузку пользователей',   fullDate: '13 янв 2025, 09:05' },
  '9e8d7c6': { message: 'fix: исправил баг с пустым массивом',    fullDate: '14 янв 2025, 11:20' },
  'a3f2b1c': { message: 'feat: добавил авторизацию',              fullDate: '15 янв 2025, 16:42' },
};

const BLAME: BlameEntry[] = [
  { lineNo: 1,  hash: '2c1b0a9', author: 'ivan',  date: '12 янв', content: 'function setupAuth() {' },
  { lineNo: 2,  hash: 'a3f2b1c', author: 'ivan',  date: '15 янв', content: '  const token = getToken();' },
  { lineNo: 3,  hash: '9e8d7c6', author: 'maria', date: '14 янв', content: '  validateToken(token);' },
  { lineNo: 4,  hash: 'a3f2b1c', author: 'ivan',  date: '15 янв', content: '  if (!token) return false;' },
  { lineNo: 5,  hash: '9e8d7c6', author: 'maria', date: '14 янв', content: '  setupSession();' },
  { lineNo: 6,  hash: '5b4a3f2', author: 'alex',  date: '13 янв', content: '  logEvent("auth_ok");' },
  { lineNo: 7,  hash: '2c1b0a9', author: 'ivan',  date: '12 янв', content: '  return true;' },
  { lineNo: 8,  hash: '2c1b0a9', author: 'ivan',  date: '12 янв', content: '}' },
];

export function BlameExplorer() {
  const [selected, setSelected] = useState<BlameEntry | null>(null);

  return (
    <div className={s.demo}>
      <div className={s.header}>// git blame auth.js</div>

      <div className={s.layout}>
        <div className={s.filePanel}>
          <div className={s.panelTitle}>ФАЙЛ</div>
          {BLAME.map(line => {
            const author = AUTHORS[line.author];
            const isSelected = selected?.lineNo === line.lineNo;
            const isSameCommit = selected && selected.hash === line.hash;
            return (
              <div
                key={line.lineNo}
                className={`${s.blameLine} ${isSelected ? s.active : ''} ${isSameCommit && !isSelected ? s.sameCommit : ''}`}
                onClick={() => setSelected(prev => prev?.lineNo === line.lineNo ? null : line)}
              >
                <span className={s.lineNo}>{line.lineNo}</span>
                <span className={s.lineHash} style={{ color: author.color }}>{line.hash}</span>
                <span className={s.lineDate}>{line.date}</span>
                <span className={s.lineCode}>{line.content}</span>
              </div>
            );
          })}
        </div>

        <div className={s.infoPanel}>
          <div className={s.panelTitle}>КОММИТ</div>
          {selected ? (
            <div className={s.commitInfo} key={selected.lineNo}>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>СТРОКА</span>
                <span className={s.infoVal}>{selected.lineNo}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>ХЭШ</span>
                <span className={`${s.infoVal} ${s.hash}`}>{selected.hash}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>АВТОР</span>
                <span
                  className={s.infoVal}
                  style={{ color: AUTHORS[selected.author].color }}
                >
                  {AUTHORS[selected.author].name}
                </span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>ДАТА</span>
                <span className={s.infoVal}>{COMMITS[selected.hash].fullDate}</span>
              </div>
              <div className={s.infoRow}>
                <span className={s.infoLabel}>КОММИТ</span>
                <span className={`${s.infoVal} ${s.message}`}>
                  {COMMITS[selected.hash].message}
                </span>
              </div>
              <div className={s.legend}>
                <div className={s.legendTitle}>выделено тем же коммитом</div>
                {BLAME.filter(l => l.hash === selected.hash).map(l => (
                  <div key={l.lineNo} className={s.legendLine}>
                    <span className={s.legendNum}>#{l.lineNo}</span>
                    <span className={s.legendCode}>{l.content.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={s.placeholder}>← кликни на строку</div>
          )}
        </div>
      </div>

      <div className={s.authorLegend}>
        {Object.entries(AUTHORS).map(([key, val]) => (
          <div key={key} className={s.authorItem}>
            <span className={s.authorDot} style={{ background: val.color }} />
            <span className={s.authorName}>{val.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
