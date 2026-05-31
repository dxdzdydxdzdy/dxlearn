'use client';

import { useState } from 'react';
import s from './ChildrenDemo.module.scss';

// ── Examples ──────────────────────────────────────────────────────────────────

interface Example {
  id: string;
  label: string;
  description: string;
  usage: string;       // JSX code shown to user
}

const EXAMPLES: Example[] = [
  {
    id: 'text',
    label: 'Текст',
    description: 'Самый простой случай — children это обычный текст.',
    usage:
`<Card title="Заметка">
  Купить молоко и хлеб
</Card>`,
  },
  {
    id: 'elements',
    label: 'Элементы',
    description: 'Children может быть любым JSX — несколько элементов, компоненты.',
    usage:
`<Card title="Профиль">
  <img src="avatar.jpg" alt="Фото" />
  <h3>Алиса Смирнова</h3>
  <p>Frontend-разработчик</p>
</Card>`,
  },
  {
    id: 'actions',
    label: 'Действия',
    description: 'Компонент-обёртка не знает что будет внутри. Это мощь children.',
    usage:
`<Card title="Подтверждение">
  <p>Удалить этот проект?</p>
  <Button variant="danger">Удалить</Button>
  <Button variant="ghost">Отмена</Button>
</Card>`,
  },
  {
    id: 'nested',
    label: 'Вложенные карточки',
    description: 'Children сам может содержать компоненты с children.',
    usage:
`<Card title="Раздел">
  <Card title="Подраздел 1">
    Содержимое 1
  </Card>
  <Card title="Подраздел 2">
    Содержимое 2
  </Card>
</Card>`,
  },
];

// ── Visual "rendered" output per example ──────────────────────────────────────

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={s.cardShell}>
      <div className={s.cardHeader}>{title}</div>
      <div className={s.cardBody}>{children}</div>
    </div>
  );
}

function ExamplePreview({ id }: { id: string }) {
  if (id === 'text') {
    return (
      <CardShell title="Заметка">
        <p className={s.previewText}>Купить молоко и хлеб</p>
      </CardShell>
    );
  }
  if (id === 'elements') {
    return (
      <CardShell title="Профиль">
        <div className={s.profileRow}>
          <div className={s.previewAvatar}>А</div>
          <div>
            <div className={s.previewName}>Алиса Смирнова</div>
            <div className={s.previewRole}>Frontend-разработчик</div>
          </div>
        </div>
      </CardShell>
    );
  }
  if (id === 'actions') {
    return (
      <CardShell title="Подтверждение">
        <p className={s.previewText}>Удалить этот проект?</p>
        <div className={s.previewBtns}>
          <button className={`${s.previewBtn} ${s.btnDanger}`}>Удалить</button>
          <button className={`${s.previewBtn} ${s.btnGhost}`}>Отмена</button>
        </div>
      </CardShell>
    );
  }
  if (id === 'nested') {
    return (
      <CardShell title="Раздел">
        <div className={s.nestedCards}>
          <CardShell title="Подраздел 1">
            <p className={s.previewText}>Содержимое 1</p>
          </CardShell>
          <CardShell title="Подраздел 2">
            <p className={s.previewText}>Содержимое 2</p>
          </CardShell>
        </div>
      </CardShell>
    );
  }
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChildrenDemo() {
  const [activeId, setActiveId] = useState('text');
  const ex = EXAMPLES.find(e => e.id === activeId)!;

  return (
    <div className={s.wrap}>

      {/* ── Card component code — always visible ── */}
      <div className={s.componentDef}>
        <div className={s.defHeader}>
          <span className={s.defLabel}>// один компонент Card — разный children</span>
        </div>
        <pre className={s.defCode}>{`function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}`}</pre>
      </div>

      {/* ── Examples ── */}
      <div className={s.examples}>

        {/* Tabs */}
        <div className={s.tabs}>
          {EXAMPLES.map(e => (
            <button
              key={e.id}
              className={`${s.tab} ${e.id === activeId ? s.tabActive : ''}`}
              onClick={() => setActiveId(e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Split: usage code + preview */}
        <div className={s.split} key={activeId}>
          <div className={s.splitPane}>
            <div className={s.splitLabel}>ИСПОЛЬЗОВАНИЕ</div>
            <pre className={s.usageCode}>{ex.usage}</pre>
          </div>
          <div className={s.splitPane}>
            <div className={s.splitLabel}>РЕЗУЛЬТАТ</div>
            <div className={s.preview}>
              <ExamplePreview id={activeId} />
            </div>
          </div>
        </div>

        <div className={s.note}>
          <span className={s.noteIcon}>💡</span>
          <span>{ex.description}</span>
        </div>

      </div>

    </div>
  );
}
