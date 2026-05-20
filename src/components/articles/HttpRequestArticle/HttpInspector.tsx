'use client';

import { useState } from 'react';
import s from './HttpInspector.module.scss';

type Tab = 'request' | 'response';

interface Part {
  id: string;
  text: string;
  color: string;
  title: string;
  why: string;
  code?: string;
}

const REQUEST_PARTS: Part[] = [
  {
    id: 'method', text: 'POST', color: '#f0c040',
    title: 'HTTP-метод',
    why: 'Описывает намерение: GET — получить, POST — создать, PUT/PATCH — обновить, DELETE — удалить. REST API строится вокруг методов.',
    code: 'fetch("/api/users", { method: "POST" })',
  },
  {
    id: 'path', text: ' /api/users', color: '#00e5a0',
    title: 'Path (ресурс)',
    why: '/api/users — коллекция. /api/users/42 — конкретный ресурс. Структура URL — это дизайн API.',
    code: 'fetch("/api/users/42")',
  },
  {
    id: 'version', text: ' HTTP/1.1\n', color: '#4e9eff',
    title: 'Версия протокола',
    why: 'HTTP/1.1 — одно соединение на запрос. HTTP/2 — мультиплексирование (несколько запросов одновременно). HTTP/3 — поверх QUIC вместо TCP.',
  },
  {
    id: 'host', text: 'Host: api.example.com\n', color: '#b48eff',
    title: 'Header: Host',
    why: 'Обязательный заголовок — сервер может хостить несколько доменов. Без него сервер не знает, куда направить запрос.',
  },
  {
    id: 'content-type', text: 'Content-Type: application/json\n', color: '#b48eff',
    title: 'Header: Content-Type',
    why: 'Говорит серверу, в каком формате тело запроса. Без него сервер может не распарсить JSON. Типичная ошибка — забыть этот заголовок при POST.',
    code: '{ "Content-Type": "application/json" }',
  },
  {
    id: 'auth', text: 'Authorization: Bearer eyJhbG...\n', color: '#b48eff',
    title: 'Header: Authorization',
    why: 'Передаёт токен аутентификации. JWT-токен в этом заголовке — стандарт для API. В отличие от cookie, его не отправляет браузер автоматически.',
    code: '{ "Authorization": `Bearer ${token}` }',
  },
  {
    id: 'blank', text: '\n', color: 'transparent',
    title: 'Пустая строка',
    why: 'Разделяет заголовки от тела. Обязательна по спецификации HTTP.',
  },
  {
    id: 'body', text: '{ "name": "Alex", "email": "alex@example.com" }', color: '#ff7b72',
    title: 'Тело запроса (body)',
    why: 'Данные, которые передаются на сервер. Есть только у POST/PUT/PATCH. GET-запросы не имеют тела — данные передаются в query string.',
    code: 'body: JSON.stringify({ name: "Alex" })',
  },
];

const RESPONSE_PARTS: Part[] = [
  {
    id: 'status', text: 'HTTP/1.1 201 Created\n', color: '#00e5a0',
    title: 'Статус ответа',
    why: '2xx — успех. 201 Created — ресурс создан. 200 OK — просто успех. 204 No Content — успех, но тела нет (типично для DELETE).',
    code: 'if (res.status === 201) { /* ресурс создан */ }',
  },
  {
    id: 'res-ct', text: 'Content-Type: application/json\n', color: '#b48eff',
    title: 'Content-Type ответа',
    why: 'Браузер и fetch смотрят на этот заголовок, чтобы понять как парсить тело. res.json() работает только если Content-Type: application/json.',
    code: 'const data = await res.json()',
  },
  {
    id: 'cookie', text: 'Set-Cookie: session=abc123; HttpOnly; SameSite=Strict\n', color: '#b48eff',
    title: 'Set-Cookie',
    why: 'Сервер устанавливает cookie. HttpOnly — недоступна из JS (защита от XSS). SameSite=Strict — не отправляется с кросс-доменных запросов (защита от CSRF).',
  },
  {
    id: 'cors', text: 'Access-Control-Allow-Origin: https://app.example.com\n', color: '#b48eff',
    title: 'CORS-заголовок',
    why: 'Без этого заголовка браузер заблокирует ответ при запросе с другого домена. Самая частая ошибка при работе с API — "CORS blocked".',
  },
  {
    id: 'blank2', text: '\n', color: 'transparent',
    title: 'Пустая строка',
    why: 'Разделяет заголовки от тела ответа.',
  },
  {
    id: 'res-body', text: '{ "id": 42, "name": "Alex", "email": "alex@example.com" }', color: '#ff7b72',
    title: 'Тело ответа',
    why: 'Данные от сервера. Для REST API обычно JSON. Размер тела влияет на скорость — сервер может сжать его через gzip (Content-Encoding: gzip).',
    code: 'const { id } = await res.json()',
  },
];

const STATUS_GROUPS = [
  { range: '1xx', label: 'Информационные', color: '#4e9eff', codes: [
    { code: 100, text: 'Continue' },
    { code: 101, text: 'Switching Protocols (WebSocket upgrade)' },
  ]},
  { range: '2xx', label: 'Успех', color: '#00e5a0', codes: [
    { code: 200, text: 'OK — стандартный успех' },
    { code: 201, text: 'Created — ресурс создан (POST)' },
    { code: 204, text: 'No Content — успех, тела нет (DELETE)' },
  ]},
  { range: '3xx', label: 'Редиректы', color: '#f0c040', codes: [
    { code: 301, text: 'Moved Permanently — SEO-редирект' },
    { code: 302, text: 'Found — временный редирект' },
    { code: 304, text: 'Not Modified — кэш актуален, тело не отправляется' },
  ]},
  { range: '4xx', label: 'Ошибки клиента', color: '#ff7b72', codes: [
    { code: 400, text: 'Bad Request — неверные данные' },
    { code: 401, text: 'Unauthorized — нужна аутентификация' },
    { code: 403, text: 'Forbidden — нет прав (авторизован, но доступ закрыт)' },
    { code: 404, text: 'Not Found — ресурс не существует' },
    { code: 422, text: 'Unprocessable Entity — валидация провалилась' },
    { code: 429, text: 'Too Many Requests — rate limit' },
  ]},
  { range: '5xx', label: 'Ошибки сервера', color: '#ff5f6a', codes: [
    { code: 500, text: 'Internal Server Error — баг на сервере' },
    { code: 502, text: 'Bad Gateway — upstream не отвечает' },
    { code: 503, text: 'Service Unavailable — сервер перегружен' },
  ]},
];

export function HttpInspector() {
  const [tab, setTab] = useState<Tab>('request');
  const [active, setActive] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('2xx');

  const parts = tab === 'request' ? REQUEST_PARTS : RESPONSE_PARTS;
  const activePart = parts.find(p => p.id === active);

  return (
    <div className={s.inspector}>
      <div className={s.header}>
        <span className={s.title}>// http-inspector</span>
        <div className={s.tabs}>
          {(['request', 'response'] as Tab[]).map(t => (
            <button key={t} className={`${s.tab} ${tab === t ? s.tabActive : ''}`}
              onClick={() => { setTab(t); setActive(null); }}>
              {t === 'request' ? '→ Request' : '← Response'}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.messagePanel}>
          <div className={s.messageLabel}>// кликни на любую часть</div>
          <pre className={s.message}>
            {parts.map(part => (
              <span
                key={part.id}
                className={`${s.part} ${active === part.id ? s.partActive : ''}`}
                style={{ '--part-color': part.color } as React.CSSProperties}
                onClick={() => setActive(active === part.id ? null : part.id)}
              >
                {part.text}
              </span>
            ))}
          </pre>
        </div>

        <div className={s.explainPanel}>
          {activePart ? (
            <>
              <div className={s.explainTitle} style={{ color: activePart.color }}>{activePart.title}</div>
              <div className={s.explainWhy}>{activePart.why}</div>
              {activePart.code && (
                <div className={s.explainCode}>{activePart.code}</div>
              )}
            </>
          ) : (
            <div className={s.explainEmpty}>← выбери элемент</div>
          )}
        </div>
      </div>

      <div className={s.statusSection}>
        <div className={s.statusHeader}>
          <span className={s.statusTitle}>// status codes</span>
          <div className={s.statusTabs}>
            {STATUS_GROUPS.map(g => (
              <button key={g.range}
                className={`${s.statusTab} ${statusTab === g.range ? s.statusTabActive : ''}`}
                style={{ '--tab-color': g.color } as React.CSSProperties}
                onClick={() => setStatusTab(g.range)}>
                {g.range}
              </button>
            ))}
          </div>
        </div>
        <div className={s.statusCodes}>
          {STATUS_GROUPS.find(g => g.range === statusTab)?.codes.map(c => (
            <div key={c.code} className={s.statusCode}>
              <span className={s.statusNum} style={{ color: STATUS_GROUPS.find(g => g.range === statusTab)?.color }}>
                {c.code}
              </span>
              <span className={s.statusText}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
