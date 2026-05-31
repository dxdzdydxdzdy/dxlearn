'use client';

import { useState } from 'react';
import s from './JSXTransformDemo.module.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

interface Example {
  id: string;
  title: string;
  jsx: string;
  compiled: string;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'simple',
    title: 'Простой элемент',
    jsx:
`<h1>Привет, мир!</h1>`,
    compiled:
`React.createElement(
  'h1',         // тип — строковый HTML-тег
  null,         // props — нет
  'Привет, мир!' // children — текст
)`,
    note: 'Строковый тег ("h1") — нативный DOM-элемент. null вместо props означает "никаких атрибутов".',
  },
  {
    id: 'props',
    title: 'Атрибуты (props)',
    jsx:
`<button
  className="btn"
  disabled={isLoading}
  onClick={handleClick}
>
  Сохранить
</button>`,
    compiled:
`React.createElement(
  'button',
  {
    className: 'btn',   // ← не class!
    disabled: isLoading,
    onClick: handleClick,
  },
  'Сохранить'
)`,
    note: 'Атрибуты → второй аргумент (объект). Обрати внимание: class → className, for → htmlFor.',
  },
  {
    id: 'nested',
    title: 'Вложенные элементы',
    jsx:
`<div className="card">
  <h2>{title}</h2>
  <p>{description}</p>
</div>`,
    compiled:
`React.createElement(
  'div',
  { className: 'card' },
  React.createElement('h2', null, title),
  React.createElement('p',  null, description)
  // каждый вложенный элемент — рекурсивный вызов
)`,
    note: 'Дочерние элементы — дополнительные аргументы. Чем глубже дерево, тем больше вложенных вызовов.',
  },
  {
    id: 'component',
    title: 'Компонент (с большой буквы)',
    jsx:
`<UserCard
  name="Алиса"
  age={25}
  online={true}
/>`,
    compiled:
`React.createElement(
  UserCard,  // ← ссылка на функцию, не строка!
  {
    name: 'Алиса',
    age: 25,
    online: true,
  }
  // нет children → нет третьего аргумента
)`,
    note: 'Компонент с большой буквы → ссылка на функцию. Строчная буква → строка (HTML-тег). Это единственное правило по которому React различает их.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function JSXTransformDemo() {
  const [activeId, setActiveId] = useState('simple');
  const ex = EXAMPLES.find(e => e.id === activeId)!;

  return (
    <div className={s.wrap}>

      {/* ── Tabs ── */}
      <div className={s.tabs}>
        {EXAMPLES.map(e => (
          <button
            key={e.id}
            className={`${s.tab} ${e.id === activeId ? s.tabActive : ''}`}
            onClick={() => setActiveId(e.id)}
          >
            {e.title}
          </button>
        ))}
      </div>

      {/* ── Split view ── */}
      <div className={s.split} key={activeId}>

        <div className={s.pane}>
          <div className={s.paneHeader}>
            <span className={s.paneLabel}>JSX</span>
            <span className={s.paneSub}>пишешь ты</span>
          </div>
          <pre className={s.code}><code className={s.jsx}>{ex.jsx}</code></pre>
        </div>

        <div className={s.arrow}>
          <div className={s.arrowLine} />
          <div className={s.arrowText}>Babel<br/>↓</div>
          <div className={s.arrowLine} />
        </div>

        <div className={s.pane}>
          <div className={s.paneHeader}>
            <span className={s.paneLabel}>JavaScript</span>
            <span className={s.paneSub}>видит браузер</span>
          </div>
          <pre className={s.code}><code className={s.compiled}>{ex.compiled}</code></pre>
        </div>

      </div>

      {/* ── Note ── */}
      <div className={s.note}>
        <span className={s.noteIcon}>💡</span>
        <span>{ex.note}</span>
      </div>

    </div>
  );
}
