'use client';

import { useState } from 'react';
import s from './JSXExpressionDemo.module.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warn' | 'err' | 'nothing';

interface ExprItem {
  id: string;
  label: string;
  code: string;
  status: Status;
  renders: string;       // what it renders as text / description
  renderReal?: boolean;  // render as actual JSX in preview?
  renderJsx?: string;    // the actual preview text
  note: string;
}

const ITEMS: ExprItem[] = [
  {
    id: 'str',
    label: '"строка"',
    code: `<p>{"Привет, React!"}</p>`,
    status: 'ok',
    renders: 'Привет, React!',
    renderReal: true,
    note: 'Строки всегда рендерятся как текст. Самый простой и безопасный случай.',
  },
  {
    id: 'num',
    label: '{42}',
    code: `<p>{42}</p>`,
    status: 'ok',
    renders: '42',
    renderReal: true,
    note: 'Числа рендерятся как текст. Но смотри следующий пример — {0} ведёт себя неожиданно!',
  },
  {
    id: 'zero',
    label: '{0} — ловушка!',
    code: `{items.length > 0 && <List />}
// ↑ если items.length === 0, рендерится "0"`,
    status: 'warn',
    renders: '0',
    renderReal: true,
    note: 'Самая частая ошибка новичков: {0 && <Component />} выведет "0" на экран! React рендерит 0 как текст. Исправление: {items.length > 0 && ...} или {!!count && ...}',
  },
  {
    id: 'bool',
    label: '{true} / {false}',
    code: `<p>{true}</p>
<p>{false}</p>`,
    status: 'warn',
    renders: '(ничего)',
    renderReal: false,
    renderJsx: 'ничего не рендерится',
    note: 'Булевые значения React намеренно не отображает — это удобно для условного рендеринга: {isLoggedIn && <Profile />}',
  },
  {
    id: 'null',
    label: '{null} / {undefined}',
    code: `<p>{null}</p>
<p>{undefined}</p>`,
    status: 'ok',
    renders: '(ничего)',
    renderReal: false,
    renderJsx: 'ничего не рендерится',
    note: 'null и undefined — стандартный способ "ничего не рендерить". Компонент может вернуть null чтобы скрыться.',
  },
  {
    id: 'jsx',
    label: '{<span>JSX</span>}',
    code: `<p>
  Статус: {isOnline
    ? <span className="green">онлайн</span>
    : <span className="grey">офлайн</span>
  }
</p>`,
    status: 'ok',
    renders: 'Статус: онлайн',
    renderReal: true,
    note: 'JSX можно вкладывать в JSX через {}. Тернарный оператор — стандартный способ условного рендеринга.',
  },
  {
    id: 'fn',
    label: '{fn()}',
    code: `<p>{formatDate(createdAt)}</p>
<p>{items.map(i => <Item key={i.id} {...i} />)}</p>`,
    status: 'ok',
    renders: '15 мая 2025',
    renderReal: true,
    note: 'Любое JS-выражение в {} — вызов функции, метод массива, шаблонная строка. Главное что выражение что-то возвращает.',
  },
  {
    id: 'arr',
    label: '{[a, b, c]}',
    code: `<p>{['React', ', ', 'Vue', ', ', 'Angular']}</p>`,
    status: 'ok',
    renders: 'React, Vue, Angular',
    renderReal: true,
    note: 'Массивы рендерятся как последовательность. Элементы должны иметь key если это массив компонентов.',
  },
  {
    id: 'obj',
    label: '{{ объект }} — ошибка',
    code: `<p>{user}</p>
// ↑ Uncaught Error:
// Objects are not valid as a React child`,
    status: 'err',
    renders: 'Ошибка!',
    renderReal: false,
    renderJsx: 'Uncaught Error: Objects are not valid as a React child',
    note: 'Объекты нельзя рендерить напрямую. Нужно обращаться к конкретным полям: {user.name}, или конвертировать: {JSON.stringify(user)}',
  },
];

const STATUS_LABELS: Record<Status, string> = {
  ok:      '✓ работает',
  warn:    '⚠ работает, но осторожно',
  err:     '✕ ошибка',
  nothing: '· ничего не рендерит',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function JSXExpressionDemo() {
  const [activeId, setActiveId] = useState('str');
  const item = ITEMS.find(i => i.id === activeId)!;

  return (
    <div className={s.wrap}>

      {/* ── Left: expression tiles ── */}
      <div className={s.layout}>
        <div className={s.tileList}>
          <div className={s.tileHeader}>// выбери выражение</div>
          {ITEMS.map(it => (
            <button
              key={it.id}
              className={`${s.tile} ${it.id === activeId ? s.tileActive : ''} ${s['tile_' + it.status]}`}
              onClick={() => setActiveId(it.id)}
            >
              <span className={`${s.tileDot} ${s['dot_' + it.status]}`} />
              <span className={s.tileLabel}>{it.label}</span>
            </button>
          ))}
        </div>

        {/* ── Right: detail ── */}
        <div className={s.detail} key={activeId}>
          <div className={s.detailHeader}>// результат</div>

          <div className={s.codeBlock}>
            <div className={s.codeLabel}>КОД</div>
            <pre className={s.code}>{item.code}</pre>
          </div>

          <div className={s.resultBlock}>
            <div className={s.resultLabel}>РЕНДЕРИТСЯ КАК</div>
            <div className={`${s.resultBox} ${s['result_' + item.status]}`}>
              {item.renderReal ? (
                <span className={s.resultText}>{item.renders}</span>
              ) : (
                <span className={`${s.resultText} ${s.resultMuted}`}>
                  {item.renderJsx ?? item.renders}
                </span>
              )}
            </div>
          </div>

          <div className={`${s.statusBadge} ${s['badge_' + item.status]}`}>
            {STATUS_LABELS[item.status]}
          </div>

          <div className={s.noteBlock}>
            <span className={s.noteIcon}>💡</span>
            <span className={s.noteText}>{item.note}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
