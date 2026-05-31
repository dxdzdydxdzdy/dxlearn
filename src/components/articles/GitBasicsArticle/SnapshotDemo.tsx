'use client';

import { useState } from 'react';
import s from './SnapshotDemo.module.scss';

interface FileState {
  name: string;
  content: string;
  status: 'new' | 'modified' | 'same';
}

interface Commit {
  hash: string;
  message: string;
  date: string;
  author: string;
  files: FileState[];
}

const COMMITS: Commit[] = [
  {
    hash: 'a1b2c3',
    message: 'Первый коммит: создал проект',
    date: '10 янв, 10:00',
    author: 'Иван',
    files: [
      { name: 'index.html', content: '<h1>Привет!</h1>', status: 'new' },
      { name: 'style.css',  content: 'body { margin: 0; }', status: 'new' },
    ],
  },
  {
    hash: 'd4e5f6',
    message: 'Добавил скрипт и обновил заголовок',
    date: '10 янв, 14:30',
    author: 'Иван',
    files: [
      { name: 'index.html', content: '<h1>Мой сайт</h1>\n<script src="app.js"></script>', status: 'modified' },
      { name: 'style.css',  content: 'body { margin: 0; }', status: 'same' },
      { name: 'app.js',     content: 'console.log("ready");', status: 'new' },
    ],
  },
  {
    hash: 'g7h8i9',
    message: 'Добавил навигацию и стили для неё',
    date: '11 янв, 09:15',
    author: 'Мария',
    files: [
      { name: 'index.html', content: '<nav>...</nav>\n<h1>Мой сайт</h1>\n<script src="app.js"></script>', status: 'modified' },
      { name: 'style.css',  content: 'body { margin: 0; }\nnav { background: #333; }', status: 'modified' },
      { name: 'app.js',     content: 'console.log("ready");', status: 'same' },
    ],
  },
  {
    hash: 'j0k1l2',
    message: 'Исправил баг в навигации',
    date: '11 янв, 16:42',
    author: 'Иван',
    files: [
      { name: 'index.html', content: '<nav>...</nav>\n<h1>Мой сайт</h1>\n<script src="app.js"></script>', status: 'same' },
      { name: 'style.css',  content: 'body { margin: 0; }\nnav { background: #222; color: #fff; }', status: 'modified' },
      { name: 'app.js',     content: 'console.log("ready");\nnavInit();', status: 'modified' },
    ],
  },
];

const STATUS_LABEL: Record<FileState['status'], string> = {
  new:      'новый',
  modified: 'изменён',
  same:     'не изменён',
};

export function SnapshotDemo() {
  const [selected, setSelected] = useState<number | null>(null);

  const commit = selected !== null ? COMMITS[selected] : null;

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// git-snapshot-demo</span>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#3d5562' }}>
          нажми на коммит — увидишь состояние проекта в тот момент
        </span>
      </div>

      <div className={s.timeline}>
        {COMMITS.map((c, i) => (
          <div key={c.hash} className={s.commitWrap}>
            {i > 0 && (
              <div className={`${s.connector} ${selected !== null && selected >= i ? s.active : ''}`} />
            )}
            <div
              className={`${s.commit} ${selected === i ? s.selected : ''}`}
              onClick={() => setSelected(prev => prev === i ? null : i)}
            >
              <div className={s.commitDot}>{c.hash.slice(0, 4)}</div>
              <div className={s.commitLabel}>{c.message}</div>
              <div className={s.commitDate}>{c.author} · {c.date}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={s.divider} />

      {commit ? (
        <div className={s.snapshot} key={selected}>
          <div className={s.snapshotTitle}>
            // снапшот проекта на момент коммита {commit.hash} — {commit.files.length} файла
          </div>
          <div className={s.files}>
            {commit.files.map(file => (
              <div key={file.name} className={s.file}>
                <div className={s.fileIcon}>📄</div>
                <div className={s.fileInfo}>
                  <div className={s.fileName}>{file.name}</div>
                  <div className={s.fileContent}>{file.content}</div>
                </div>
                <div className={`${s.fileStatus} ${s[file.status]}`}>
                  {STATUS_LABEL[file.status]}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={s.hint}>
          ← выбери любой коммит чтобы увидеть снапшот
        </div>
      )}
    </div>
  );
}
