# Как писать статьи для devlearn

Этот документ — инструкция для разработчиков и ИИ-агентов. Описывает структуру проекта, соглашения по коду и стиль контента.

---

## Технический стек

- **Next.js** (App Router, `output: 'export'` — SSG, нет SSR)
- **TypeScript** — строгий, без `any`
- **SCSS-модули** — каждый компонент имеет свой `.module.scss`
- **`'use client'`** — обязателен для любого компонента с `useState`, `useEffect`, обработчиками событий

---

## Структура файлов

```
src/
├── app/courses/[course]/[article]/page.tsx   ← роутинг статей
├── content/courses.ts                         ← единый реестр курсов
├── components/
│   ├── articles/
│   │   └── ArticleNameArticle/               ← папка статьи
│   │       ├── ArticleNameArticle.tsx         ← главный компонент
│   │       ├── ArticleNameArticle.module.scss
│   │       ├── quizData.ts                    ← вопросы теста
│   │       └── InteractiveWidget.tsx          ← интерактивные части (если есть)
│   └── ui/
│       ├── CodeHighlight/   ← подсветка кода
│       └── QuizBlock/       ← компонент теста
└── styles/
    ├── _tokens.scss         ← дизайн-токены (цвета, шрифты, отступы)
    └── _mixins.scss         ← @mixin mobile, tablet, etc.
```

---

## Добавить новую статью — 4 шага

### 1. `src/content/courses.ts` — зарегистрировать статью

```typescript
// В нужном курсе, внутри c(...):
a('article-slug', 'Заголовок', 'Краткое описание.', ['tag1', 'tag2'], true)
//                                                                      ^^^^ true = interactive

// Статья внутри раздела:
s('Название раздела', [
  a('slug', 'Заголовок', 'Описание', ['tags'], true),
])
```

DSL:
- `a(slug, title, description, tags?, interactive?)` — статья
- `s(name, articles[])` — группирует статьи в раздел (отображается в сайдбаре)
- `c(slug, title, description, items[])` — курс

### 2. Создать папку и файлы компонента

```
src/components/articles/MyTopicArticle/
├── MyTopicArticle.tsx
├── MyTopicArticle.module.scss
├── quizData.ts
└── (опционально) MyWidget.tsx + MyWidget.module.scss
```

### 3. `src/app/courses/[course]/[article]/page.tsx` — добавить роут

```typescript
import { MyTopicArticle } from '@/components/articles/MyTopicArticle/MyTopicArticle';

// В renderArticle():
if (cSlug === 'course-slug' && aSlug === 'article-slug') return <MyTopicArticle />;
```

### 4. Готово. Статья доступна на `/courses/course-slug/article-slug`

---

## SCSS — дизайн-токены

Все статьи подключают:
```scss
@use '../../../styles/tokens' as *;
@use '../../../styles/mixins' as *;
// Уровень вложенности зависит от глубины папки — пересчитать '../' при необходимости
```

### Цвета

| Токен | Значение | Применение |
|---|---|---|
| `$bg-base` | `#080c0e` | Самый тёмный фон |
| `$bg-surface` | `#0d1317` | Поверхность карточек |
| `$bg-elevated` | `#121a1f` | Приподнятые элементы |
| `$text-primary` | `#e8edf0` | Основной текст, заголовки |
| `$text-secondary` | `#7a9aaa` | Параграфы, описания |
| `$text-muted` | `#3d5562` | Метки, подписи, неактивное |
| `$accent` | `#00e5a0` | Зелёный акцент (основной) |
| `$accent-dim` | `rgba(0,229,160,0.12)` | Фон callout-блоков |
| `$warn` | `#f0c040` | Предупреждения (жёлтый) |
| `$error` | `#ff5f6a` | Ошибки (красный) |
| `$info` | `#4db8ff` | Информационные блоки (синий) |
| `$info-dim` | `rgba(77,184,255,0.12)` | Фон info-блоков |
| `$border-subtle` | `rgba(255,255,255,0.06)` | Тонкие границы |

### Типографика

```scss
$font-mono  // JetBrains Mono — для кода, меток, терминальных элементов
$font-sans  // Inter — для обычного текста

$text-sm    // 12px — мелкие подписи
$text-base  // 14px — основной текст статьи
$text-md    // 16px — подзаголовки
$text-xl    // 28px — заголовки секций
```

### Отступы

```scss
$space-1 // 4px    $space-2 // 8px    $space-3 // 12px
$space-4 // 16px   $space-5 // 20px   $space-6 // 24px
$space-8 // 32px   $space-10 // 40px  $space-12 // 48px
```

### Адаптивность

```scss
@include mobile  { ... }  // max-width: 768px
@include tablet  { ... }  // max-width: 1024px
```

---

## UI-компоненты

### CodeHighlight — подсветка синтаксиса

```tsx
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

<CodeHighlight lang="sql" code={`SELECT * FROM users WHERE id = 1`} />
```

Поддерживаемые языки: `sql`, `javascript`, `js`, `typescript`, `ts`, `css`, `html`, `bash`, `sh`

**Важно:** это серверный компонент (`'use client'` не нужен). Если используется внутри клиентского компонента — это нормально, Next.js разберётся.

### QuizBlock — тест

```tsx
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';

<QuizBlock questions={QUIZ_QUESTIONS} />
```

### Интерфейс QuizQuestion (строго)

```typescript
export interface QuizQuestion {
  id: string;            // уникальный, формат: 'topic-N'  (напр. 'idx-1')
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;          // SQL/JS код для блока, '' если не нужен
  question: string;
  options: string[];     // ровно 4 варианта
  correct: number;       // индекс правильного ответа (0–3)
  explanation: string;   // подробное объяснение — зачем именно этот ответ верен
}
```

---

## Структура компонента статьи

### Скелет

```tsx
// Без 'use client' если статья статическая
// С 'use client' только если в самом компоненте есть state

import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './MyTopicArticle.module.scss';

export function MyTopicArticle() {
  return (
    <div className={s.article}>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Заголовок раздела</h2>
        <p className={s.lead}>Вводный абзац...</p>
        <CodeHighlight lang="sql" code={`...`} />
      </section>

      {/* ... остальные секции ... */}

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Тест</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
```

### Обязательные стили в `.module.scss`

```scss
@use '../../../styles/tokens' as *;
@use '../../../styles/mixins' as *;

.article {
  display: flex;
  flex-direction: column;
  gap: $space-10;
}

.section {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.sectionTitle {
  font-size: $text-xl;
  font-weight: 700;
  color: $text-primary;
  font-family: $font-mono;
  display: flex;
  align-items: center;
  gap: $space-3;

  &::before {
    content: '§';
    color: $accent;
    font-size: $text-base;
  }
}

.lead {
  font-size: $text-base;
  color: $text-secondary;
  line-height: $line-loose;
  max-width: 72ch;
}
```

---

## Готовые паттерны вёрстки

Копируй из существующих статей или добавляй в свой `.module.scss`.

### Callout (зелёный — совет, ключевая мысль)

```tsx
<div className={s.callout}>
  <div className={s.calloutLabel}>// ключевое правило</div>
  <div className={s.calloutText}>Текст...</div>
</div>
```

```scss
.callout {
  background: $accent-dim;
  border: 1px solid $accent;
  border-radius: $radius-md;
  padding: $space-4 $space-5;
}
.calloutLabel {
  font-size: 11px;
  font-family: $font-mono;
  color: $accent;
  letter-spacing: $letter-wider;
  margin-bottom: $space-2;
}
.calloutText {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: $line-loose;
}
```

### Warning (красный — предупреждение)

```tsx
<div className={s.warning}>
  <div className={s.warningLabel}>// опасно</div>
  <div className={s.warningText}>Текст...</div>
</div>
```

```scss
.warning {
  background: rgba(255, 123, 114, 0.08);
  border: 1px solid rgba(255, 123, 114, 0.3);
  border-radius: $radius-md;
  padding: $space-4 $space-5;
}
.warningLabel { color: #ff7b72; ... }
```

### Info (синий — пояснение, нюанс)

```tsx
<div className={s.info}>
  <div className={s.infoLabel}>// подробнее</div>
  <div className={s.infoText}>Текст...</div>
</div>
```

```scss
.info {
  background: $info-dim;
  border: 1px solid rgba(77, 184, 255, 0.3);
  border-radius: $radius-md;
  padding: $space-4 $space-5;
}
.infoLabel { color: $info; ... }
```

### Two Columns

```tsx
<div className={s.twoCols}>
  <div className={s.colCard}>
    <div className={s.colTitle}>// левый</div>
    <ul className={s.colList}>
      <li className={s.colItem}>Пункт</li>
    </ul>
  </div>
  <div className={s.colCard}>...</div>
</div>
```

```scss
.twoCols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-4;
  @include mobile { grid-template-columns: 1fr; }
}
.colCard {
  background: $bg-elevated;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  padding: $space-4;
}
.colItem::before { content: '•'; color: $accent; }
```

### Цветные карточки с CSS-переменной `--kc` (key color)

```tsx
const ITEMS = [
  { name: 'B-tree', color: '#00e5a0', desc: '...' },
];

{ITEMS.map(item => (
  <div
    key={item.name}
    className={s.keyCard}
    style={{ '--kc': item.color } as React.CSSProperties}
  >
    <div className={s.keyName}>{item.name}</div>
    <div className={s.keyDesc}>{item.desc}</div>
  </div>
))}
```

```scss
.keyCard {
  border-top: 3px solid var(--kc, #{$accent});
  ...
}
.keyName { color: var(--kc, #{$accent}); }
```

### Таблица

```tsx
<div className={s.tableWrap}>
  <table className={s.table}>
    <thead><tr><th>Колонка</th>...</tr></thead>
    <tbody>
      <tr><td>значение</td>...</tr>
    </tbody>
  </table>
</div>
```

---

## Интерактивные компоненты

**Правило:** всё интерактивное выносится в отдельный файл с `'use client'`.
Основной `ArticleNameArticle.tsx` остаётся серверным компонентом (без `'use client'`).

```
ArticleNameArticle.tsx          ← НЕТ 'use client'
└── imports InteractiveWidget   ← ЕСТЬ 'use client'
```

Типичные интерактивные компоненты в проекте:
- Визуализаторы (анимированные диаграммы)
- SQL/DML playground'ы (`sqlEngine.ts`, `dmlEngine.ts`)
- Степпер-демо (шаг за шагом)
- Кликабельные демо с состоянием

---

## Стиль контента

### Язык и тон

- Русский язык, технические термины не переводить (index, scan, B-tree, upsert)
- Разговорный, но точный. Не учебник — ментор объясняет коллеге
- Первое слово в объяснении — ЧТО это, второе — ЗАЧЕМ нужно, третье — КОГДА применять

### Структура каждого раздела

1. `<h2>` — тема раздела
2. `<p className={s.lead}>` — ключевая мысль в 2-3 предложениях
3. `<CodeHighlight>` — живой пример
4. Callout / Warning / Info — если есть нюанс или ловушка
5. Следующий код-пример или сравнение

### Сколько разделов

Обычно 8–12 секций на статью. Каждая секция = одна концепция.
Последняя секция всегда `<QuizBlock>` с 12–16 вопросами.

### Кодовые примеры

- Всегда реальные данные из таблиц `users / orders / departments` (база проекта)
- Показывать и плохой вариант, и хороший — с объяснением почему
- Комментарии в коде: `-- Что делает эта строка`, `// зачем этот шаг`
- В SQL-примерах использовать конкретные значения из БД: `WHERE dept_id = 1`, `salary > 100000`

### Чего НЕ делать

- Не писать теорию ради теории — каждая концепция должна иметь практический пример
- Не пропускать объяснение "зачем" — читатель должен понимать для чего это в реальном коде
- Не делать секции короче 3 элементов (заголовок + текст + код минимум)
- Не добавлять секцию без примера кода если тема технически описываема кодом

---

## Существующие движки

### sqlEngine (`src/components/articles/SqlQueriesArticle/sqlEngine.ts`)

Браузерный SQL-движок: SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY, LIMIT.
Экспортирует: `runQuery(sql)`, `DB`, `DB_COLUMNS`.

### dmlEngine (`src/components/articles/SqlDmlArticle/dmlEngine.ts`)

Браузерный DML-движок: INSERT, UPDATE, DELETE, TRUNCATE.
Экспортирует: `runDML(sql, db)`, `freshDB()`, `DB`, `Schema`, `Row`.

---

## База данных в примерах

Стандартная схема (используется во всех SQL-статьях):

```
users:       id | name   | dept_id | salary | age | city
departments: id | title  | budget
orders:      id | user_id | product | amount | status
```

Данные: 8 пользователей (Alice, Bob, Carol, Dave, Eve, Frank, Grace, Henry),
3 отдела (Разработка, Маркетинг, Аналитика), 8 заказов.

Henry (id=8) не привязан к отделу (dept_id = NULL) — используется для демонстрации IS NULL.
