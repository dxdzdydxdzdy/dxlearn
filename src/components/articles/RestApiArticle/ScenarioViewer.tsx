'use client';

import { useState } from 'react';
import s from './ScenarioViewer.module.scss';

// ── Scenarios ─────────────────────────────────────────────────────────────────

interface Scenario {
  id: string;
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: number;
  statusText: string;
  request: {
    path: string;
    headers: string[];
    body?: string;
  };
  response: {
    headers: string[];
    body?: string;
  };
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'get-one',
    label: 'Получить пользователя',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    request: {
      path: '/api/v1/users/42',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
        'Accept: application/json',
      ],
    },
    response: {
      headers: [
        'Content-Type: application/json',
        'Cache-Control: private, max-age=60',
      ],
      body: JSON.stringify({ id: 42, name: 'Alice', email: 'alice@example.com', role: 'admin' }, null, 2),
    },
    note: '200 OK — запрос выполнен, ресурс в теле ответа.',
  },
  {
    id: 'post-create',
    label: 'Создать пользователя',
    method: 'POST',
    status: 201,
    statusText: 'Created',
    request: {
      path: '/api/v1/users',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
        'Content-Type: application/json',
      ],
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }, null, 2),
    },
    response: {
      headers: [
        'Content-Type: application/json',
        'Location: /api/v1/users/43',
      ],
      body: JSON.stringify({ id: 43, name: 'Bob', email: 'bob@example.com', role: 'user' }, null, 2),
    },
    note: '201 Created — ресурс создан. Location указывает на новый ресурс. Не 200!',
  },
  {
    id: 'patch-update',
    label: 'Обновить частично',
    method: 'PATCH',
    status: 200,
    statusText: 'OK',
    request: {
      path: '/api/v1/users/42',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
        'Content-Type: application/json',
      ],
      body: JSON.stringify({ email: 'alice.new@example.com' }, null, 2),
    },
    response: {
      headers: ['Content-Type: application/json'],
      body: JSON.stringify({ id: 42, name: 'Alice', email: 'alice.new@example.com', role: 'admin' }, null, 2),
    },
    note: 'PATCH обновляет только переданные поля. PUT заменил бы весь объект целиком.',
  },
  {
    id: 'delete',
    label: 'Удалить',
    method: 'DELETE',
    status: 204,
    statusText: 'No Content',
    request: {
      path: '/api/v1/users/42',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
      ],
    },
    response: {
      headers: ['X-Request-Id: a1b2c3d4'],
    },
    note: '204 No Content — успешно, тело ответа пустое. Не возвращай {success: true}!',
  },
  {
    id: 'not-found',
    label: '404 Не найден',
    method: 'GET',
    status: 404,
    statusText: 'Not Found',
    request: {
      path: '/api/v1/users/9999',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
        'Accept: application/json',
      ],
    },
    response: {
      headers: ['Content-Type: application/json'],
      body: JSON.stringify({ error: 'Not Found', message: 'User 9999 does not exist', code: 'USER_NOT_FOUND' }, null, 2),
    },
    note: '404 — ресурс с таким id не существует. Ошибка клиента (4xx), не сервера.',
  },
  {
    id: 'validation',
    label: '422 Невалидные данные',
    method: 'POST',
    status: 422,
    statusText: 'Unprocessable Entity',
    request: {
      path: '/api/v1/users',
      headers: [
        'Host: api.example.com',
        'Content-Type: application/json',
      ],
      body: JSON.stringify({ name: '', email: 'not-an-email' }, null, 2),
    },
    response: {
      headers: ['Content-Type: application/json'],
      body: JSON.stringify({
        error: 'Validation Failed',
        fields: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' },
        ],
      }, null, 2),
    },
    note: '422 — данные получены, но невалидны. Возвращай список ошибок по полям — это важно для фронта.',
  },
  {
    id: 'unauthorized',
    label: '401 Не авторизован',
    method: 'GET',
    status: 401,
    statusText: 'Unauthorized',
    request: {
      path: '/api/v1/users/42',
      headers: [
        'Host: api.example.com',
        'Accept: application/json',
      ],
    },
    response: {
      headers: [
        'Content-Type: application/json',
        'WWW-Authenticate: Bearer realm="api"',
      ],
      body: JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }, null, 2),
    },
    note: '401 — токен не передан или невалиден. 403 — токен есть, но прав не хватает.',
  },
  {
    id: 'rate-limit',
    label: '429 Лимит запросов',
    method: 'GET',
    status: 429,
    statusText: 'Too Many Requests',
    request: {
      path: '/api/v1/users',
      headers: [
        'Host: api.example.com',
        'Authorization: Bearer eyJhbGc...',
      ],
    },
    response: {
      headers: [
        'Content-Type: application/json',
        'X-RateLimit-Limit: 100',
        'X-RateLimit-Remaining: 0',
        'X-RateLimit-Reset: 1716800460',
        'Retry-After: 60',
      ],
      body: JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }, null, 2),
    },
    note: '429 — клиент превысил лимит. Заголовки говорят когда можно повторить.',
  },
];

// ── Status color ──────────────────────────────────────────────────────────────

function statusColor(code: number): string {
  if (code < 300) return '#00e5a0';
  if (code < 400) return '#4db8ff';
  if (code < 500) return '#f0c040';
  return '#ff7b72';
}

function methodColor(m: string): string {
  const map: Record<string, string> = {
    GET: '#00e5a0', POST: '#4a9eff', PUT: '#f0c040',
    PATCH: '#9b59e0', DELETE: '#ff7b72',
  };
  return map[m] ?? '#aaa';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ScenarioViewer() {
  const [active, setActive] = useState('get-one');
  const sc = SCENARIOS.find(x => x.id === active)!;
  const sc_ = statusColor(sc.status);
  const mc_ = methodColor(sc.method);

  return (
    <div className={s.viewer}>
      {/* ── Tabs ── */}
      <div className={s.tabs}>
        {SCENARIOS.map(x => (
          <button
            key={x.id}
            className={`${s.tab} ${active === x.id ? s.tabActive : ''}`}
            style={active === x.id ? { '--tc': statusColor(x.status) } as React.CSSProperties : undefined}
            onClick={() => setActive(x.id)}
          >
            <span className={s.tabMethod} style={{ color: methodColor(x.method) }}>{x.method}</span>
            <span className={s.tabLabel}>{x.label}</span>
            <span className={s.tabStatus} style={{ color: statusColor(x.status) }}>{x.status}</span>
          </button>
        ))}
      </div>

      {/* ── Panels ── */}
      <div className={s.panels}>
        {/* Request */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>// Request</span>
            <span className={s.methodBadge} style={{ '--mc': mc_ } as React.CSSProperties}>
              {sc.method}
            </span>
          </div>
          <div className={s.httpLine} style={{ '--mc': mc_ } as React.CSSProperties}>
            <span className={s.httpMethod}>{sc.method}</span>
            {' '}
            <span className={s.httpPath}>{sc.request.path}</span>
            {' '}
            <span className={s.httpVer}>HTTP/1.1</span>
          </div>
          <div className={s.headers}>
            {sc.request.headers.map((h, i) => {
              const [key, ...rest] = h.split(': ');
              return (
                <div key={i} className={s.header}>
                  <span className={s.headerKey}>{key}:</span>
                  {' '}
                  <span className={s.headerVal}>{rest.join(': ')}</span>
                </div>
              );
            })}
          </div>
          {sc.request.body && (
            <>
              <div className={s.bodySep} />
              <pre className={s.body}>{sc.request.body}</pre>
            </>
          )}
        </div>

        {/* Response */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>// Response</span>
            <span className={s.statusBadge} style={{ '--sc': sc_ } as React.CSSProperties}>
              {sc.status} {sc.statusText}
            </span>
          </div>
          <div className={s.httpLine}>
            <span className={s.httpVer}>HTTP/1.1</span>
            {' '}
            <span className={s.statusCode} style={{ color: sc_ }}>{sc.status}</span>
            {' '}
            <span className={s.statusText} style={{ color: sc_ }}>{sc.statusText}</span>
          </div>
          <div className={s.headers}>
            {sc.response.headers.map((h, i) => {
              const [key, ...rest] = h.split(': ');
              return (
                <div key={i} className={s.header}>
                  <span className={s.headerKey}>{key}:</span>
                  {' '}
                  <span className={s.headerVal}>{rest.join(': ')}</span>
                </div>
              );
            })}
          </div>
          {sc.response.body && (
            <>
              <div className={s.bodySep} />
              <pre className={s.body}>{sc.response.body}</pre>
            </>
          )}
          {!sc.response.body && (
            <div className={s.emptyBody}>// тело ответа пустое</div>
          )}
        </div>
      </div>

      {/* ── Note ── */}
      <div className={s.note} style={{ '--sc': sc_ } as React.CSSProperties}>
        <span className={s.noteIcon}>💡</span>
        <span className={s.noteText}>{sc.note}</span>
      </div>
    </div>
  );
}
