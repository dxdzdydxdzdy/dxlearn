'use client';

import { useState } from 'react';
import s from './OAuthFlowViewer.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type Actor = 'user' | 'client' | 'auth' | 'api';

interface FlowStep {
  id: number;
  title: string;
  from: Actor;
  to: Actor;
  desc: string;
  http?: {
    label: string;
    lines: Array<{ type: 'verb' | 'path' | 'key' | 'val' | 'sep' | 'plain'; text: string }>;
  };
  note?: string;
}

// ── Actor config ──────────────────────────────────────────────────────────────

const ACTORS: Record<Actor, { icon: string; name: string; role: string; color: string }> = {
  user:   { icon: '🧑',  name: 'БРАУЗЕР',          role: 'Resource Owner',      color: '#4db8ff' },
  client: { icon: '⚙️',  name: 'ВАШЕ ПРИЛОЖЕНИЕ',  role: 'Client',             color: '#00e5a0' },
  auth:   { icon: '🔑',  name: 'GOOGLE',            role: 'Authorization Server', color: '#f0c040' },
  api:    { icon: '📦',  name: 'GOOGLE API',         role: 'Resource Server',    color: '#9b59e0' },
};

// ── Flow data ─────────────────────────────────────────────────────────────────

const CODE_FLOW: FlowStep[] = [
  {
    id: 1,
    title: 'Пользователь нажимает «Войти через Google»',
    from: 'user',
    to: 'client',
    desc: 'Клик по кнопке. Ваш backend или SPA генерирует случайный state (для CSRF защиты) и сохраняет его в сессии.',
    note: 'state — непредсказуемая строка. Обязателен для защиты от CSRF.',
  },
  {
    id: 2,
    title: 'Клиент перенаправляет браузер на Google',
    from: 'client',
    to: 'auth',
    desc: 'Формируется Authorization Request URL и браузер делает редирект на accounts.google.com.',
    http: {
      label: '// HTTP — Authorization Request',
      lines: [
        { type: 'plain', text: 'GET accounts.google.com/o/oauth2/v2/auth?' },
        { type: 'key',   text: '  response_type' },
        { type: 'val',   text: '=code' },
        { type: 'key',   text: '  &client_id' },
        { type: 'val',   text: '=YOUR_CLIENT_ID.apps.googleusercontent.com' },
        { type: 'key',   text: '  &redirect_uri' },
        { type: 'val',   text: '=https://yourapp.com/auth/callback' },
        { type: 'key',   text: '  &scope' },
        { type: 'val',   text: '=openid email profile' },
        { type: 'key',   text: '  &state' },
        { type: 'val',   text: '=a9f3c8b2e1d0' },
        { type: 'key',   text: '  &access_type' },
        { type: 'val',   text: '=offline    // refresh token' },
      ],
    },
  },
  {
    id: 3,
    title: 'Google показывает форму входа и Consent Screen',
    from: 'auth',
    to: 'user',
    desc: 'Пользователь видит форму входа Google. После входа — страницу с запрашиваемыми правами (scopes). Пользователь нажимает «Разрешить».',
    note: 'Consent показывается только при первом входе или при изменении scopes.',
  },
  {
    id: 4,
    title: 'Google перенаправляет обратно с code',
    from: 'auth',
    to: 'client',
    desc: 'После согласия Google делает redirect на ваш redirect_uri с authorization code. Код одноразовый, живёт ~10 минут.',
    http: {
      label: '// HTTP — Authorization Response (redirect)',
      lines: [
        { type: 'plain', text: 'GET https://yourapp.com/auth/callback?' },
        { type: 'key',   text: '  code' },
        { type: 'val',   text: '=4/0AX4XfWh8kR2...' },
        { type: 'key',   text: '  &state' },
        { type: 'val',   text: '=a9f3c8b2e1d0  // проверь совпадение!' },
      ],
    },
    note: 'Сначала проверяем state! Если не совпадает — отбрасываем запрос.',
  },
  {
    id: 5,
    title: 'Клиент обменивает code на токены',
    from: 'client',
    to: 'auth',
    desc: 'Server-to-server запрос — браузер не участвует. Используется client_secret. Это самый важный шаг.',
    http: {
      label: '// HTTP — Token Request (server-to-server)',
      lines: [
        { type: 'verb',  text: 'POST' },
        { type: 'plain', text: ' https://oauth2.googleapis.com/token' },
        { type: 'sep',   text: '' },
        { type: 'key',   text: 'Content-Type' },
        { type: 'val',   text: ': application/x-www-form-urlencoded' },
        { type: 'sep',   text: '' },
        { type: 'key',   text: 'code' },
        { type: 'val',   text: '=4/0AX4XfWh8kR2...' },
        { type: 'key',   text: '&client_id' },
        { type: 'val',   text: '=YOUR_CLIENT_ID' },
        { type: 'key',   text: '&client_secret' },
        { type: 'val',   text: '=YOUR_SECRET  // только на сервере!' },
        { type: 'key',   text: '&redirect_uri' },
        { type: 'val',   text: '=https://yourapp.com/auth/callback' },
        { type: 'key',   text: '&grant_type' },
        { type: 'val',   text: '=authorization_code' },
      ],
    },
  },
  {
    id: 6,
    title: 'Google возвращает токены',
    from: 'auth',
    to: 'client',
    desc: 'Получаем access_token, refresh_token и id_token. id_token — JWT с данными пользователя (OIDC).',
    http: {
      label: '// HTTP — Token Response',
      lines: [
        { type: 'plain', text: '200 OK' },
        { type: 'sep',   text: '' },
        { type: 'key',   text: '{\n  "access_token"' },
        { type: 'val',   text: ':  "ya29.a0ARrdaM...",' },
        { type: 'key',   text: '  "token_type"' },
        { type: 'val',   text: ':  "Bearer",' },
        { type: 'key',   text: '  "expires_in"' },
        { type: 'val',   text: ':  3600,' },
        { type: 'key',   text: '  "refresh_token"' },
        { type: 'val',   text: ': "1//0gQO...",' },
        { type: 'key',   text: '  "id_token"' },
        { type: 'val',   text: ':  "eyJhbGci...",' },
        { type: 'key',   text: '  "scope"' },
        { type: 'val',   text: ':  "openid email profile"\n}' },
      ],
    },
  },
  {
    id: 7,
    title: 'Клиент верифицирует id_token и создаёт сессию',
    from: 'client',
    to: 'user',
    desc: 'Проверяем подпись id_token через JWKS Google, извлекаем sub/email/name. Находим или создаём пользователя в БД. Создаём свою сессию или выдаём собственный JWT.',
    http: {
      label: '// id_token payload (декодирован)',
      lines: [
        { type: 'plain', text: '{' },
        { type: 'key',   text: '  "sub"' },
        { type: 'val',   text: ':     "10769150350006150715113082367",' },
        { type: 'key',   text: '  "email"' },
        { type: 'val',   text: ':   "alice@gmail.com",' },
        { type: 'key',   text: '  "name"' },
        { type: 'val',   text: ':    "Alice Smith",' },
        { type: 'key',   text: '  "picture"' },
        { type: 'val',   text: ': "https://lh3.googleusercontent.com/...",' },
        { type: 'key',   text: '  "iss"' },
        { type: 'val',   text: ':     "https://accounts.google.com",' },
        { type: 'key',   text: '  "aud"' },
        { type: 'val',   text: ':     "YOUR_CLIENT_ID"' },
        { type: 'plain', text: '}' },
      ],
    },
    note: 'sub — стабильный уникальный ID пользователя у Google. Храни в БД как foreign key.',
  },
  {
    id: 8,
    title: 'Использование access_token для Google API',
    from: 'client',
    to: 'api',
    desc: 'Если нужен доступ к Google Calendar/Drive — используем access_token. Для обновления — refresh_token.',
    http: {
      label: '// HTTP — Resource Server Request',
      lines: [
        { type: 'verb',  text: 'GET' },
        { type: 'plain', text: ' https://www.googleapis.com/calendar/v3/calendars/primary/events' },
        { type: 'sep',   text: '' },
        { type: 'key',   text: 'Authorization' },
        { type: 'val',   text: ': Bearer ya29.a0ARrdaM...' },
      ],
    },
    note: 'access_token живёт ~1 час. При истечении используй refresh_token → POST /token?grant_type=refresh_token.',
  },
];

const PKCE_STEPS: FlowStep[] = [
  {
    id: 1,
    title: 'Генерируем code_verifier и code_challenge',
    from: 'client',
    to: 'client',
    desc: 'Браузер (SPA) генерирует случайную строку code_verifier, вычисляет хэш. client_secret не используется — хранить его в SPA небезопасно.',
    http: {
      label: '// JavaScript — PKCE generation',
      lines: [
        { type: 'plain', text: '// 1. Случайная строка (43-128 символов)' },
        { type: 'key',   text: 'code_verifier' },
        { type: 'val',   text: ' = crypto.randomBytes(32).toString("base64url")' },
        { type: 'sep',   text: '' },
        { type: 'plain', text: '// 2. SHA-256 хэш, кодированный base64url' },
        { type: 'key',   text: 'code_challenge' },
        { type: 'val',   text: ' = base64url(sha256(code_verifier))' },
        { type: 'sep',   text: '' },
        { type: 'plain', text: '// Сохрани code_verifier в sessionStorage' },
      ],
    },
    note: 'code_verifier хранится на клиенте, code_challenge отправляется серверу. Зная challenge нельзя восстановить verifier.',
  },
  {
    id: 2,
    title: 'Authorization Request с code_challenge',
    from: 'client',
    to: 'auth',
    desc: 'В URL авторизации добавляем code_challenge. Auth Server запоминает его для последующей проверки.',
    http: {
      label: '// Authorization Request + PKCE',
      lines: [
        { type: 'plain', text: 'GET accounts.google.com/o/oauth2/v2/auth?' },
        { type: 'key',   text: '  response_type' },
        { type: 'val',   text: '=code' },
        { type: 'key',   text: '  &client_id' },
        { type: 'val',   text: '=YOUR_CLIENT_ID' },
        { type: 'key',   text: '  &redirect_uri' },
        { type: 'val',   text: '=https://app.com/callback' },
        { type: 'key',   text: '  &code_challenge' },
        { type: 'val',   text: '=E9Melhoa2OwvFrEMTJguCHaoeK1t...' },
        { type: 'key',   text: '  &code_challenge_method' },
        { type: 'val',   text: '=S256' },
        { type: 'key',   text: '  &state' },
        { type: 'val',   text: '=random_state' },
      ],
    },
  },
  {
    id: 3,
    title: 'Получаем code в callback',
    from: 'auth',
    to: 'client',
    desc: 'Такой же как в стандартном flow. Проверяем state. Атакующий, перехвативший code, не сможет его использовать — у него нет code_verifier.',
    http: {
      label: '// Callback URL',
      lines: [
        { type: 'plain', text: 'GET https://app.com/callback?' },
        { type: 'key',   text: '  code' },
        { type: 'val',   text: '=4/0AX4XfW...' },
        { type: 'key',   text: '  &state' },
        { type: 'val',   text: '=random_state  // проверить!' },
      ],
    },
    note: 'Перехват code бесполезен без code_verifier. В этом суть PKCE.',
  },
  {
    id: 4,
    title: 'Token Request с code_verifier вместо client_secret',
    from: 'client',
    to: 'auth',
    desc: 'Отправляем code + code_verifier. Auth Server вычисляет SHA256(verifier) и сравнивает с сохранённым challenge. Совпало — выдаёт токены.',
    http: {
      label: '// Token Request + PKCE',
      lines: [
        { type: 'verb',  text: 'POST' },
        { type: 'plain', text: ' https://oauth2.googleapis.com/token' },
        { type: 'sep',   text: '' },
        { type: 'key',   text: 'code' },
        { type: 'val',   text: '=4/0AX4XfW...' },
        { type: 'key',   text: '&client_id' },
        { type: 'val',   text: '=YOUR_CLIENT_ID' },
        { type: 'key',   text: '&code_verifier' },
        { type: 'val',   text: '=dBjftJeZ4CVP...  // не хэш, сам verifier!' },
        { type: 'key',   text: '&redirect_uri' },
        { type: 'val',   text: '=https://app.com/callback' },
        { type: 'key',   text: '&grant_type' },
        { type: 'val',   text: '=authorization_code' },
        { type: 'plain', text: '// Без client_secret!' },
      ],
    },
    note: 'Google проверяет: SHA256(code_verifier) == code_challenge? Если да — токены выданы.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type FlowType = 'code' | 'pkce';

export function OAuthFlowViewer() {
  const [flow, setFlow]       = useState<FlowType>('code');
  const [active, setActive]   = useState(0);

  const steps = flow === 'code' ? CODE_FLOW : PKCE_STEPS;
  const step  = steps[active];

  const activeActors = new Set<Actor>([step.from, step.to]);

  return (
    <div className={s.viewer}>

      {/* Tabs */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${flow === 'code' ? s.tabActive : ''}`}
          onClick={() => { setFlow('code'); setActive(0); }}
        >
          Authorization Code Flow
        </button>
        <button
          className={`${s.tab} ${flow === 'pkce' ? s.tabActive : ''}`}
          onClick={() => { setFlow('pkce'); setActive(0); }}
        >
          + PKCE (для SPA)
        </button>
      </div>

      {/* Actors */}
      <div className={s.actors}>
        {(Object.entries(ACTORS) as [Actor, typeof ACTORS[Actor]][]).map(([key, a]) => (
          <div
            key={key}
            className={`${s.actor} ${activeActors.has(key) ? s.actorActive : ''}`}
            style={{ '--ac': a.color } as React.CSSProperties}
          >
            <span className={s.actorIcon}>{a.icon}</span>
            <span className={s.actorName}>{a.name}</span>
            <span className={s.actorRole}>{a.role}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className={s.body}>
        {/* Step list */}
        <div className={s.steps}>
          {steps.map((st, i) => {
            const fromColor = ACTORS[st.from].color;
            return (
              <div
                key={st.id}
                className={`${s.step} ${active === i ? s.stepActive : ''}`}
                onClick={() => setActive(i)}
              >
                <span className={`${s.stepNum} ${active === i ? s.stepNumActive : ''}`}>
                  {st.id}
                </span>
                <div className={s.stepInfo}>
                  <span className={s.stepTitle}>{st.title}</span>
                  {st.from !== st.to && (
                    <span className={s.stepArrow} style={{ color: fromColor }}>
                      {ACTORS[st.from].name} → {ACTORS[st.to].name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div className={s.detail}>
          <p className={s.detailTitle}>{step.id}. {step.title}</p>
          <p className={s.detailDesc}>{step.desc}</p>

          {step.http && (
            <div className={s.httpBlock}>
              <div className={s.httpLabel}>{step.http.label}</div>
              <div className={s.httpContent}>
                {step.http.lines.map((line, i) => {
                  if (line.type === 'sep')  return <br key={i} />;
                  if (line.type === 'verb') return <span key={i} className={s.httpVerb}>{line.text}</span>;
                  if (line.type === 'path') return <span key={i} className={s.httpPath}>{line.text}</span>;
                  if (line.type === 'key')  return <span key={i} className={s.httpKey}>{line.text}</span>;
                  if (line.type === 'val')  return <span key={i} className={s.httpVal}>{line.text}</span>;
                  return <span key={i}>{line.text}</span>;
                })}
              </div>
            </div>
          )}

          {step.note && (
            <div className={s.detailNote}>💡 {step.note}</div>
          )}
        </div>
      </div>

    </div>
  );
}
