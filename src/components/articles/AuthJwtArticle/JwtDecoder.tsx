'use client';

import { useState } from 'react';
import s from './JwtDecoder.module.scss';

type TokenType = 'access' | 'refresh';

// ── Token data ────────────────────────────────────────────────────────────────

const TOKENS = {
  access: {
    header:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    payload: 'eyJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjgwMDAwMCwiZXhwIjoxNzE2ODAxODAwfQ',
    sig:     'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    ttl:     '15 минут',
    headerData: { alg: 'HS256', typ: 'JWT' },
    payloadData: [
      { key: 'sub',  val: '"42"',    note: 'Subject — ID пользователя' },
      { key: 'name', val: '"Alice"', note: 'Custom claim — имя' },
      { key: 'role', val: '"admin"', note: 'Custom claim — роль (не шифруется!)' },
      { key: 'iat',  val: '27.05.2024, 10:00', note: 'Issued At — время выдачи' },
      { key: 'exp',  val: '27.05.2024, 10:15', note: 'Expiration — истекает через 15 мин' },
    ],
  },
  refresh: {
    header:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    payload: 'eyJzdWIiOiI0MiIsImp0aSI6ImExYjJjM2Q0LTU2NzgtOTBhYi1jZGVmLTEyMzQ1Njc4OTBhYiIsImlhdCI6MTcxNjgwMDAwMCwiZXhwIjoxNzE5MzkyMDAwfQ',
    sig:     'Yq2RjK8vX9mNpL3oT7wZ5hB4cE1sU6dFiA0eM2gHwR',
    ttl:     '30 дней',
    headerData: { alg: 'HS256', typ: 'JWT' },
    payloadData: [
      { key: 'sub', val: '"42"',                                    note: 'Subject — ID пользователя' },
      { key: 'jti', val: '"a1b2c3d4-5678-90ab-cdef-..."',           note: 'JWT ID — уникальный UUID для rotation и blacklist' },
      { key: 'iat', val: '27.05.2024, 10:00',                       note: 'Issued At — время выдачи' },
      { key: 'exp', val: '26.06.2024, 10:00',                       note: 'Expiration — истекает через 30 дней' },
    ],
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function JwtDecoder() {
  const [type, setType] = useState<TokenType>('access');
  const t = TOKENS[type];

  return (
    <div className={s.decoder}>

      {/* Tabs */}
      <div className={s.tabs}>
        {(['access', 'refresh'] as const).map((k) => (
          <button
            key={k}
            className={`${s.tab} ${type === k ? s.tabActive : ''}`}
            onClick={() => setType(k)}
          >
            <span className={s.tabLabel}>
              {k === 'access' ? 'Access Token' : 'Refresh Token'}
            </span>
            <span className={s.tabTtl}>{TOKENS[k].ttl}</span>
          </button>
        ))}
      </div>

      {/* Token string */}
      <div className={s.tokenWrap}>
        <div className={s.tokenLabel}>// JWT TOKEN</div>
        <div className={s.tokenLines}>
          <div className={s.tokenRow}>
            <span className={s.partH}>{t.header}</span>
          </div>
          <div className={s.tokenRow}>
            <span className={s.tokenDot}>.</span>
            <span className={s.partP}>{t.payload}</span>
          </div>
          <div className={s.tokenRow}>
            <span className={s.tokenDot}>.</span>
            <span className={s.partS}>{t.sig}</span>
          </div>
        </div>

        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={s.legendDot} style={{ background: '#ff9070' }} />
            Header
          </div>
          <div className={s.legendItem}>
            <span className={s.legendDot} style={{ background: '#00e5a0' }} />
            Payload
          </div>
          <div className={s.legendItem}>
            <span className={s.legendDot} style={{ background: '#9b59e0' }} />
            Signature
          </div>
        </div>
      </div>

      {/* Decoded panels */}
      <div className={s.panels}>
        {/* Header */}
        <div className={s.panel}>
          <div className={s.panelTitle}>// Header (декодирован)</div>
          <div className={s.fieldList}>
            <div className={s.fieldRow}>
              <span className={s.fieldKey}>alg</span>
              <div className={s.fieldRight}>
                <span className={s.fieldVal}>&quot;{t.headerData.alg}&quot;</span>
                <span className={s.fieldNote}>алгоритм подписи</span>
              </div>
            </div>
            <div className={s.fieldRow}>
              <span className={s.fieldKey}>typ</span>
              <div className={s.fieldRight}>
                <span className={s.fieldVal}>&quot;{t.headerData.typ}&quot;</span>
                <span className={s.fieldNote}>тип токена</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payload */}
        <div className={s.panel}>
          <div className={s.panelTitle}>// Payload (декодирован)</div>
          <div className={s.fieldList}>
            {t.payloadData.map((f) => (
              <div key={f.key} className={s.fieldRow}>
                <span className={s.fieldKey}>{f.key}</span>
                <div className={s.fieldRight}>
                  <span className={s.fieldVal}>{f.val}</span>
                  <span className={s.fieldNote}>{f.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature note */}
      <div className={s.sigNote}>
        <div className={s.sigTitle}>// Signature</div>
        <pre className={s.sigFormula}>{`HMAC-SHA256(
  base64url(header) + "." + base64url(payload),
  SECRET_KEY    ← только сервер знает
)`}</pre>
        <p className={s.sigWarn}>
          ⚠ JWT не шифруется — payload виден всем. Подпись лишь подтверждает, что данные не изменены и токен выдан сервером.
        </p>
      </div>

    </div>
  );
}
