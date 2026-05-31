'use client';

import { useState } from 'react';
import s from './PropsPlayground.module.scss';

// ── Props for the "live" component ────────────────────────────────────────────

interface CardProps {
  name: string;
  role: string;
  online: boolean;
  verified: boolean;
}

const DEFAULTS: CardProps = {
  name:     'Алиса Смирнова',
  role:     'Frontend-разработчик',
  online:   true,
  verified: true,
};

// ── The component being demoed (pure display, no hooks) ───────────────────────

function UserCard({ name, role, online, verified }: CardProps) {
  const initial = (name.trim() || '?')[0].toUpperCase();
  const msgCount = name.length % 7 + 1; // deterministic fake count

  return (
    <div className={s.card}>
      <div className={s.cardAvatar}>{initial}</div>
      <div className={s.cardBody}>
        <div className={s.cardNameRow}>
          <span className={s.cardName}>{name || <em className={s.empty}>введи имя</em>}</span>
          {verified && <span className={s.verified} title="Верифицирован">✓</span>}
        </div>
        <div className={s.cardRole}>{role || <em className={s.empty}>роль не указана</em>}</div>
        <div className={s.cardMeta}>
          <span className={`${s.statusDot} ${online ? s.dotOnline : s.dotOffline}`} />
          <span className={s.statusText}>{online ? 'онлайн' : 'офлайн'}</span>
          <span className={s.metaDivider}>·</span>
          <span className={s.msgCount}>{msgCount} сообщ.</span>
        </div>
      </div>
    </div>
  );
}

// ── JSX call preview ──────────────────────────────────────────────────────────

function JsxPreview({ p }: { p: CardProps }) {
  const lines = [
    '<UserCard',
    `  name="${p.name}"`,
    `  role="${p.role}"`,
    p.online   ? '  online={true}'   : '  online={false}',
    p.verified ? '  verified={true}' : '  verified={false}',
    '/>',
  ];
  return (
    <div className={s.jsxPreview}>
      {lines.map((l, i) => (
        <div key={i} className={s.jsxLine}>
          {l.startsWith('  ') ? (
            <>
              <span className={s.jsxIndent}>{'  '}</span>
              {l.trim().startsWith('name') || l.trim().startsWith('role')
                ? <>
                    <span className={s.jsxAttr}>{l.trim().split('=')[0]}</span>
                    <span className={s.jsxPunct}>{'='}</span>
                    <span className={s.jsxStr}>{'"' + l.trim().split('"')[1] + '"'}</span>
                  </>
                : <>
                    <span className={s.jsxAttr}>{l.trim().split('=')[0]}</span>
                    <span className={s.jsxPunct}>{'='}</span>
                    <span className={s.jsxBrace}>{'{' + (l.includes('true') ? 'true' : 'false') + '}'}</span>
                  </>
              }
            </>
          ) : (
            <span className={l === '/>' ? s.jsxPunct : s.jsxTag}>{l}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PropsPlayground() {
  const [props, setProps] = useState<CardProps>(DEFAULTS);

  const set = <K extends keyof CardProps>(key: K, val: CardProps[K]) =>
    setProps(p => ({ ...p, [key]: val }));

  return (
    <div className={s.wrap}>

      {/* ── Header ── */}
      <div className={s.header}>
        <span className={s.headerLabel}>// редактируй props → компонент обновляется</span>
      </div>

      <div className={s.layout}>

        {/* ── Props editor ── */}
        <div className={s.editor}>
          <div className={s.editorTitle}>PROPS</div>

          <div className={s.fields}>
            <div className={s.field}>
              <div className={s.fieldMeta}>
                <span className={s.fieldName}>name</span>
                <span className={s.fieldType}>string</span>
              </div>
              <input
                className={s.input}
                value={props.name}
                maxLength={30}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className={s.field}>
              <div className={s.fieldMeta}>
                <span className={s.fieldName}>role</span>
                <span className={s.fieldType}>string</span>
              </div>
              <input
                className={s.input}
                value={props.role}
                maxLength={40}
                onChange={e => set('role', e.target.value)}
              />
            </div>

            <div className={s.field}>
              <div className={s.fieldMeta}>
                <span className={s.fieldName}>online</span>
                <span className={s.fieldType}>boolean</span>
              </div>
              <button
                className={`${s.toggle} ${props.online ? s.toggleOn : s.toggleOff}`}
                onClick={() => set('online', !props.online)}
              >
                {props.online ? 'true' : 'false'}
              </button>
            </div>

            <div className={s.field}>
              <div className={s.fieldMeta}>
                <span className={s.fieldName}>verified</span>
                <span className={s.fieldType}>boolean</span>
              </div>
              <button
                className={`${s.toggle} ${props.verified ? s.toggleOn : s.toggleOff}`}
                onClick={() => set('verified', !props.verified)}
              >
                {props.verified ? 'true' : 'false'}
              </button>
            </div>
          </div>

          <button className={s.resetBtn} onClick={() => setProps(DEFAULTS)}>
            сбросить
          </button>
        </div>

        {/* ── Component output ── */}
        <div className={s.output}>
          <div className={s.outputTitle}>РЕЗУЛЬТАТ</div>
          <div className={s.outputCard}>
            <UserCard {...props} />
          </div>
          <div className={s.outputTitle} style={{ marginTop: 16 }}>JSX-ВЫЗОВ</div>
          <JsxPreview p={props} />
        </div>

      </div>

      {/* ── Footer note ── */}
      <div className={s.footer}>
        <span className={s.footerIcon}>↑</span>
        <span>
          Props — это аргументы функции. Компонент читает их и возвращает UI.
          Изменились props — React перерендеривает компонент с новыми данными.
        </span>
      </div>

    </div>
  );
}
