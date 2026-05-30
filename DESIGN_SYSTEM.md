# Design System — devlearn

> Этот файл — единственный источник правды по дизайну. При генерации новых страниц и компонентов строго следуй указанным правилам. Никаких отступлений без явного разрешения.

---

## Общий стиль

**Тема:** только тёмная. Никаких light-mode переменных.  
**Настроение:** tech / terminal. Ощущение редактора кода, а не маркетингового сайта.  
**Типографика:** monospace-first. Основной шрифт — `JetBrains Mono`. Санс (`Inter`) — только вспомогательный текст при необходимости.  
**Язык формы:** прямоугольники с минимальным радиусом. Никаких blob, gradient-mesh, glassmorphism. Тонкие 1px-бордеры.  
**Цвет акцента:** один — `#00e5a0` (зелёный). Никаких дополнительных основных цветов.

---

## Цветовые токены

Все цвета берутся только из `src/styles/_tokens.scss`. Никаких хардкодных hex-значений в компонентах.

| Переменная         | Hex / Значение                | Использование                         |
|--------------------|-------------------------------|---------------------------------------|
| `$bg-base`         | `#080c0e`                     | Фон страницы, sidebar                 |
| `$bg-surface`      | `#0d1317`                     | Карточки, блоки                       |
| `$bg-elevated`     | `#121a1f`                     | Header блоков, hover-состояния        |
| `$bg-hover`        | `#1a2530`                     | Hover на элементах                    |
| `$border-subtle`   | `rgba(255,255,255,0.06)`      | Разделители, фоновые линии            |
| `$border-default`  | `rgba(255,255,255,0.12)`      | Рамки карточек, инпуты                |
| `$border-strong`   | `rgba(255,255,255,0.22)`      | Hover-состояние рамок                 |
| `$text-primary`    | `#e8edf0`                     | Заголовки, ключевой текст             |
| `$text-secondary`  | `#7a9aaa`                     | Основной текст, описания              |
| `$text-muted`      | `#3d5562`                     | Лейблы, метаданные, неактивные пункты |
| `$accent`          | `#00e5a0`                     | Акцент: активные состояния, ссылки    |
| `$accent-dim`      | `rgba(0,229,160,0.12)`        | Фон акцентных элементов               |
| `$accent-glow`     | `rgba(0,229,160,0.25)`        | Glow-эффект                           |
| `$warn`            | `#f0c040`                     | Предупреждения                        |
| `$error`           | `#ff5f6a`                     | Ошибки                                |
| `$info`            | `#4db8ff`                     | Информационные блоки                  |

---

## Типографика

Все размеры из `$text-*` токенов. Никаких `px` или `rem` хардкодом.

| Переменная    | Размер  | Использование                          |
|---------------|---------|----------------------------------------|
| `$text-xs`    | 10px    | Лейблы (`terminal-label` mixin)        |
| `$text-sm`    | 12px    | Мелкие подписи, code в сниппетах       |
| `$text-base`  | 14px    | Основной текст статей                  |
| `$text-md`    | 16px    | Крупный body-текст, CTA               |
| `$text-lg`    | 20px    | Section titles                         |
| `$text-xl`    | 28px    | Page titles (h1 на страницах курсов)   |
| `$text-2xl`   | 40px    | Article titles                         |
| `$text-3xl`   | 56px    | Hero заголовок (главная страница)      |

**Правило лейблов:** все маленькие категориальные подписи (тип `"// courses"`, `"v0.1.0"`, теги) оформляются через `@include terminal-label`:
- `font-size: $text-xs`
- `letter-spacing: $letter-wider` (0.12em)
- `text-transform: uppercase`
- `color: $text-muted`

---

## Spacing

Система: множители 4px. Переменные `$space-1` ... `$space-24`.

**Типичные значения:**
- padding кнопки: `$space-1 $space-3` (вертикаль × горизонталь)
- padding карточки: `$space-5` или `$space-6`
- gap между элементами: `$space-2` или `$space-3`
- margin между секциями: `$space-10` или `$space-12`

---

## Миксины

Подключай через относительные пути. Turbopack не поддерживает `includePaths`, поэтому пути зависят от глубины файла:

| Директория файла                          | Импорт                                           |
|-------------------------------------------|--------------------------------------------------|
| `src/styles/`                             | `@use './tokens' as *; @use './mixins' as *;`    |
| `src/app/`                                | `@use '../styles/tokens' as *;`                  |
| `src/app/courses/`                        | `@use '../../styles/tokens' as *;`               |
| `src/app/courses/[course]/`               | `@use '../../../styles/tokens' as *;`            |
| `src/app/courses/[course]/[article]/`     | `@use '../../../../styles/tokens' as *;`         |
| `src/components/**/ComponentDir/`         | `@use '../../../styles/tokens' as *;`            |

Всегда указывай **оба** — и `tokens`, и `mixins`.

| Mixin                    | Что делает                                              |
|--------------------------|---------------------------------------------------------|
| `terminal-border`        | `border: 1px solid $border-default`                     |
| `terminal-label`         | xs / uppercase / wide letter-spacing / muted color      |
| `focus-ring`             | `:focus-visible` с `outline: 1px solid $accent`         |
| `truncate`               | overflow: hidden + text-overflow: ellipsis              |
| `custom-scrollbar`       | тонкий скроллбар в стиле темы                           |
| `mobile`                 | `@media (max-width: 768px)`                             |
| `tablet`                 | `@media (max-width: 1024px)`                            |

---

## Компоненты UI-кита

Расположены в `src/components/ui/`. Используй их вместо написания с нуля.

### `<Badge variant="..." />`
Маленький ярлык. Варианты: `default` `accent` `warn` `error` `info`.

```tsx
<Badge variant="accent">live</Badge>
<Badge variant="warn">deprecated</Badge>
```

### `<ArrowLink href="..." size="..." />`
Ссылка с анимированной стрелкой `→`. Варианты size: `sm` `md` `lg`.

```tsx
<ArrowLink href="/courses">открыть курсы</ArrowLink>
<ArrowLink href="/courses" size="lg">CTA-ссылка</ArrowLink>
```

### `<CodeHighlight code="..." lang="..." filename="..." />` ⬅ основной компонент для кода

Блок кода с подсветкой синтаксиса (highlight.js) и встроенной кнопкой **Copy**.  
Это **единственный** правильный способ отображать код в статьях.

```tsx
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

// Базовое использование — в шапке показывает язык
<CodeHighlight lang="ts" code={`const x = 1;`} />

// С именем файла — в шапке показывает filename
<CodeHighlight lang="ts" filename="server.ts" code={`import express from 'express';`} />

// Другие языки
<CodeHighlight lang="sql"    code={`SELECT * FROM users`} />
<CodeHighlight lang="python" code={`def train(model): ...`} />
<CodeHighlight lang="bash"   code={`npm install && npm start`} />
```

Поддерживаемые языки: `ts`, `js`, `typescript`, `javascript`, `python`, `py`, `sql`, `css`, `html`, `bash`, `sh`

> **Запрещено:** создавать собственные `s.codeBlock`, `s.codeBlockHeader` классы в SCSS статей.
> Никаких `<div className={s.codeBlock}>`, `<pre className={s.codeBlock}>`.
> Только `<CodeHighlight>`.

### `<CodeBlock code="..." lang="..." filename="..." />` (устарел, не использовать)

~~Без syntax highlighting. Не используй в новых статьях — только `<CodeHighlight>`.~~

### `<Callout variant="..." />`
Выделенный блок с иконкой. Варианты: `info` `warn` `accent`.

```tsx
<Callout variant="warn">Не используй eval().</Callout>
<Callout variant="accent">Ключевое правило: ...</Callout>
```

### `ArticleH1`, `ArticleH2`, `ArticleH3`, `ArticleP`, `ArticleDivider`, `ArticleSection`
Типографические примитивы для статей. Импорт из `@/components/ui/ArticleSection/ArticleSection`.

```tsx
<ArticleH2>Раздел статьи</ArticleH2>
<ArticleP>Текст. Можно использовать <code>inline code</code>.</ArticleP>
```

---

## Структура статьи

Каждая статья — это React-компонент в `src/components/articles/ИмяArticle/ИмяArticle.tsx`.  
Интерактивные части — отдельные `'use client'` компоненты рядом.

```
src/components/articles/
  EventLoopArticle/
    EventLoopArticle.tsx        ← Server Component (обёртка + текст)
    EventLoopDemo.tsx           ← 'use client' (интерактивная часть)
    EventLoopArticle.module.scss
    eventLoopEngine.ts          ← логика (опционально, если сложно)
```

Регистрация в роутере: `src/app/courses/[course]/[article]/page.tsx` в функции `renderArticle()`.

---

## Структура страниц

| URL                             | Файл                                                            |
|---------------------------------|-----------------------------------------------------------------|
| `/`                             | `src/app/page.tsx`                                              |
| `/courses`                      | `src/app/courses/page.tsx`                                      |
| `/courses/[course]`             | `src/app/courses/[course]/page.tsx`                             |
| `/courses/[course]/[article]`   | `src/app/courses/[course]/[article]/page.tsx`                   |

Metadata через `generateMetadata`. Статические параметры через `generateStaticParams`.

---

## Layout

```
┌─────────────────────────────────────────────────┐
│                   Header (52px)                  │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│   Sidebar    │         Content area             │
│   (260px)    │       max-width: 760px           │
│   sticky     │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

- Sidebar скрывается на `≤1024px`
- Header — `position: fixed`, z-index: 20
- Sidebar — `position: sticky`, z-index: 10

---

## Анимации

Только утилитарные. Никакого motion-design ради motion-design.

| Что            | Как                                    |
|----------------|----------------------------------------|
| Hover цвет     | `transition: color $t-fast` (100ms)    |
| Hover фон      | `transition: background $t-normal` (180ms) |
| Стрелка →      | `transform: translateX(4px)` on hover  |
| Появление item | `animation: slideIn 150ms ease`        |
| Blink cursor   | `animation: blink 1s step-end infinite` |

---

## Паттерны именования

- CSS-классы: `camelCase` в SCSS-модулях (`.articleTitle`, `.queueItem`)
- Файлы компонентов: `PascalCase` (`EventLoopDemo.tsx`)
- Файлы стилей: `ComponentName.module.scss` рядом с компонентом
- Slug-ключи в контенте: `kebab-case` (`event-loop`, `critical-rendering-path`)

---

## Запрещено

- `color: white`, `background: black` — только токены
- `border-radius: 8px` и выше — максимум `$radius-lg` (6px)
- Tailwind, inline styles (кроме динамических значений)
- Gradient backgrounds, shadows (кроме `accent-glow` в специальных случаях)
- Emoji в UI (только по явному запросу)
- `!important`
- CSS-переменные (`--var`) — только SCSS-переменные из `_tokens.scss`

---

## Добавление нового курса

1. Добавить объект в массив `courses` в `src/content/courses.ts`
2. Создать компоненты статей в `src/components/articles/`
3. Зарегистрировать в `renderArticle()` в `src/app/courses/[course]/[article]/page.tsx`
4. Sidebar обновится автоматически

---

## Добавление интерактивной статьи

```tsx
// 1. Создать файл:
// src/components/articles/MyTopicArticle/MyTopicArticle.tsx

// 2. Структура:
export function MyTopicArticle() {
  return (
    <div className={s.root}>
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Название раздела</h2>
        <p className={s.prose}>Объяснение...</p>
        <Callout variant="accent">Ключевая идея</Callout>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Интерактив</h2>
        <MyTopicDemo />  {/* 'use client' компонент */}
      </section>
    </div>
  );
}

// 3. Зарегистрировать в page.tsx renderArticle():
if (cSlug === 'css' && aSlug === 'flexbox') {
  return <FlexboxArticle />;
}
```
