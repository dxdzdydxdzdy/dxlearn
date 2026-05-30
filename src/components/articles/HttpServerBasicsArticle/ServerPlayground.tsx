'use client';

import { useState } from 'react';
import s from './ServerPlayground.module.scss';

interface Request {
  id: string;
  method: 'GET' | 'POST' | 'DELETE';
  url: string;
  desc: string;
  activeLines: number[];
  status: number;
  body: string;
}

const REQUESTS: Request[] = [
  {
    id: 'root',
    method: 'GET', url: '/',
    desc: 'главная страница',
    activeLines: [3, 4, 5],
    status: 200,
    body: 'Привет! Сервер работает.',
  },
  {
    id: 'users',
    method: 'GET', url: '/users',
    desc: 'список пользователей',
    activeLines: [7, 8, 9, 10],
    status: 200,
    body: JSON.stringify([
      { id: 1, name: 'Алиса' },
      { id: 2, name: 'Боб' },
    ], null, 2),
  },
  {
    id: 'create',
    method: 'POST', url: '/users',
    desc: 'создать пользователя',
    activeLines: [12, 13, 14, 15],
    status: 201,
    body: JSON.stringify({ id: 3, name: 'Новый пользователь' }, null, 2),
  },
  {
    id: 'notfound',
    method: 'GET', url: '/unknown',
    desc: 'несуществующий адрес',
    activeLines: [17, 18, 19],
    status: 404,
    body: 'Страница не найдена',
  },
];

const CODE_LINES = [
  `import { createServer } from 'node:http';`,
  ``,
  `if (req.url === '/' && req.method === 'GET') {`,
  `  res.writeHead(200);`,
  `  res.end('Привет! Сервер работает.');`,
  ``,
  `} else if (req.url === '/users' && req.method === 'GET') {`,
  `  res.writeHead(200, { 'Content-Type': 'application/json' });`,
  `  const users = [{ id: 1, name: 'Алиса' }, { id: 2, name: 'Боб' }];`,
  `  res.end(JSON.stringify(users));`,
  ``,
  `} else if (req.url === '/users' && req.method === 'POST') {`,
  `  // читаем тело запроса...`,
  `  res.writeHead(201, { 'Content-Type': 'application/json' });`,
  `  res.end(JSON.stringify({ id: 3, name: 'Новый пользователь' }));`,
  ``,
  `} else {`,
  `  res.writeHead(404);`,
  `  res.end('Страница не найдена');`,
  `}`,
];

function statusClass(code: number) {
  if (code < 300) return s.ok;
  if (code < 500) return s.miss;
  return s.err;
}

function statusText(code: number) {
  const map: Record<number, string> = { 200: 'OK', 201: 'Created', 404: 'Not Found', 500: 'Internal Server Error' };
  return map[code] ?? '';
}

export function ServerPlayground() {
  const [active, setActive] = useState<Request | null>(null);

  return (
    <div className={s.playground}>
      <div className={s.playgroundHeader}>
        <span className={s.playgroundTitle}>// server-playground</span>
      </div>

      <div className={s.layout}>
        {/* Code panel */}
        <div className={s.codePanel}>
          <div className={s.codePanelHeader}>КОД СЕРВЕРА</div>
          <div className={s.code}>
            {CODE_LINES.map((line, i) => {
              const lineNum = i + 1;
              const isActive = active?.activeLines.includes(lineNum) ?? false;
              const isDim = active !== null && !isActive && line.trim() !== '';
              return (
                <span
                  key={i}
                  className={`${s.codeLine} ${isActive ? s.active : ''} ${isDim ? s.dim : ''}`}
                >
                  {line || ' '}
                </span>
              );
            })}
          </div>
        </div>

        {/* Client panel */}
        <div className={s.clientPanel}>
          <div className={s.clientPanelHeader}>ОТПРАВЬ ЗАПРОС</div>

          <div className={s.requestList}>
            {REQUESTS.map(req => (
              <button
                key={req.id}
                className={`${s.requestBtn} ${active?.id === req.id ? s.active : ''}`}
                onClick={() => setActive(req)}
              >
                <span className={`${s.method} ${s[req.method.toLowerCase() as 'get' | 'post' | 'del']}`}>
                  {req.method}
                </span>
                <span className={s.url}>{req.url}</span>
                <span className={s.requestDesc}>{req.desc}</span>
              </button>
            ))}
          </div>

          <div className={s.divider} />

          {active ? (
            <div className={s.response} key={active.id}>
              <div className={s.responseStatus}>
                <span className={`${s.statusCode} ${statusClass(active.status)}`}>
                  {active.status}
                </span>
                <span>{statusText(active.status)}</span>
              </div>
              <div className={s.responseBody}>{active.body}</div>
            </div>
          ) : (
            <div className={s.placeholder}>
              выбери запрос — увидишь ответ и какой код его обрабатывает
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
