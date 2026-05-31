'use client';

import { useState } from 'react';
import s from './LogExplorer.module.scss';

interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
}

interface CommitEntry {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
  isHead: boolean;
  files: string[];
  diff: { file: string; lines: DiffLine[] }[];
}

const COMMITS: CommitEntry[] = [
  {
    hash: 'a3f2b1c4d5e6f7a8',
    shortHash: 'a3f2b1c',
    message: 'feat: добавил авторизацию',
    author: 'Иван Петров',
    date: '15 янв 2025, 16:42',
    isHead: true,
    files: ['auth.js', 'index.html'],
    diff: [
      {
        file: 'auth.js',
        lines: [
          { type: 'context',  content: ' function init() {' },
          { type: 'added',    content: '+  setupAuth();' },
          { type: 'added',    content: '+  checkToken();' },
          { type: 'context',  content: ' }' },
        ],
      },
      {
        file: 'index.html',
        lines: [
          { type: 'context',  content: ' <body>' },
          { type: 'added',    content: '+  <form id="login">...</form>' },
          { type: 'context',  content: ' </body>' },
        ],
      },
    ],
  },
  {
    hash: '9e8d7c6b5a4f3e2d',
    shortHash: '9e8d7c6',
    message: 'fix: исправил баг с пустым массивом',
    author: 'Мария Сидорова',
    date: '14 янв 2025, 11:20',
    isHead: false,
    files: ['utils.js'],
    diff: [
      {
        file: 'utils.js',
        lines: [
          { type: 'context',  content: ' function getFirst(arr) {' },
          { type: 'removed',  content: '-  return arr[0].value;' },
          { type: 'added',    content: '+  return arr?.[0]?.value ?? null;' },
          { type: 'context',  content: ' }' },
        ],
      },
    ],
  },
  {
    hash: '5b4a3f2e1d0c9b8a',
    shortHash: '5b4a3f2',
    message: 'feat: добавил загрузку пользователей',
    author: 'Иван Петров',
    date: '13 янв 2025, 09:05',
    isHead: false,
    files: ['api.js', 'users.js'],
    diff: [
      {
        file: 'api.js',
        lines: [
          { type: 'added',    content: '+export async function fetchUsers() {' },
          { type: 'added',    content: '+  const res = await fetch("/api/users");' },
          { type: 'added',    content: '+  return res.json();' },
          { type: 'added',    content: '+}' },
        ],
      },
    ],
  },
  {
    hash: '2c1b0a9f8e7d6c5b',
    shortHash: '2c1b0a9',
    message: 'initial commit',
    author: 'Иван Петров',
    date: '12 янв 2025, 14:00',
    isHead: false,
    files: ['index.html', 'style.css'],
    diff: [
      {
        file: 'index.html',
        lines: [
          { type: 'added', content: '+<!DOCTYPE html>' },
          { type: 'added', content: '+<html><head>...' },
          { type: 'added', content: '+<body><h1>App</h1>' },
        ],
      },
    ],
  },
];

export function LogExplorer() {
  const [selected, setSelected] = useState<CommitEntry | null>(null);

  return (
    <div className={s.demo}>
      <div className={s.header}>// git log --oneline --graph</div>

      <div className={s.layout}>
        <div className={s.logPanel}>
          <div className={s.logTitle}>ИСТОРИЯ КОММИТОВ</div>
          <div className={s.log}>
            {COMMITS.map((c, i) => (
              <div
                key={c.hash}
                className={`${s.logEntry} ${selected?.hash === c.hash ? s.selected : ''}`}
                onClick={() => setSelected(prev => prev?.hash === c.hash ? null : c)}
              >
                <div className={s.logGraph}>
                  <div className={s.logDot} />
                  {i < COMMITS.length - 1 && <div className={s.logLine} />}
                </div>
                <div className={s.logMeta}>
                  <div className={s.logHash}>
                    {c.shortHash}
                    {c.isHead && <span className={s.logHead}>HEAD</span>}
                  </div>
                  <div className={s.logMessage}>{c.message}</div>
                  <div className={s.logAuthor}>{c.author} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.detail}>
          <div className={s.detailTitle}>ДЕТАЛИ КОММИТА</div>
          {selected ? (
            <div className={s.detailContent} key={selected.hash}>
              <div className={s.detailRow}>
                <div className={s.detailLabel}>ХЭШ</div>
                <div className={`${s.detailValue} ${s.hash}`}>{selected.hash}</div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailLabel}>АВТОР</div>
                <div className={s.detailValue}>{selected.author}</div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailLabel}>ДАТА</div>
                <div className={s.detailValue}>{selected.date}</div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailLabel}>ФАЙЛЫ</div>
                <div className={`${s.detailValue} ${s.accent}`}>{selected.files.join(', ')}</div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailLabel}>ИЗМЕНЕНИЯ</div>
                {selected.diff.map(d => (
                  <div key={d.file} className={s.diffBlock}>
                    <div className={s.diffHeader}>{d.file}</div>
                    {d.lines.map((line, i) => (
                      <div key={i} className={`${s.diffLine} ${s[line.type]}`}>
                        {line.content}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={s.placeholder}>← выбери коммит</div>
          )}
        </div>
      </div>
    </div>
  );
}
