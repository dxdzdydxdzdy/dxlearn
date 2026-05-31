import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { JSXTransformDemo } from './JSXTransformDemo';
import { JSXExpressionDemo } from './JSXExpressionDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './JSXArticle.module.scss';

// ── Code snippets ─────────────────────────────────────────────────────────────

const JSX_NOT_HTML = `// JSX выглядит как HTML, но это JavaScript
const element = <h1 className="title">Привет!</h1>;

// После компиляции Babel это становится:
const element = React.createElement('h1', { className: 'title' }, 'Привет!');

// Элемент — это обычный JavaScript-объект:
// { type: 'h1', props: { className: 'title', children: 'Привет!' } }`;

const RULES_CODE = `// ✅ Один корневой элемент (или фрагмент)
return (
  <div>
    <h1>Заголовок</h1>
    <p>Текст</p>
  </div>
);

// ❌ Два корневых элемента — ошибка
return (
  <h1>Заголовок</h1>
  <p>Текст</p>   // SyntaxError!
);

// ✅ Все теги должны быть закрыты
<img src="photo.jpg" />     // self-closing
<input type="text" />       // обязательно!
<br />

// ❌ Незакрытый тег — ошибка
<img src="photo.jpg">       // SyntaxError в JSX`;

const ATTRS_CODE = `// В JSX атрибуты пишутся camelCase
<button
  className="btn"      // ← не class
  htmlFor="email"      // ← не for (в <label>)
  tabIndex={0}         // ← не tabindex
  onClick={handler}    // ← не onclick
  onMouseEnter={fn}    // ← не onmouseenter
>
  Кнопка
</button>

// Исключение: data-* и aria-* остаются как есть
<div
  data-testid="card"   // ← так и пишешь
  aria-label="Закрыть" // ← так и пишешь
/>`;

const CONDITIONAL_CODE = `// Способ 1: тернарный оператор — для двух вариантов
function Status({ isOnline }) {
  return (
    <span>
      {isOnline ? '🟢 онлайн' : '🔴 офлайн'}
    </span>
  );
}

// Способ 2: && — когда нужен только один вариант
function Notification({ count }) {
  return (
    <div>
      <h1>Панель</h1>
      {count > 0 && <Badge count={count} />}
      {/* ⚠️ НЕ ПИШИ: {count && <Badge />} — рендерит "0" */}
    </div>
  );
}

// Способ 3: переменная — для сложной логики
function Page({ user, isLoading }) {
  let content;
  if (isLoading)    content = <Spinner />;
  else if (!user)   content = <Login />;
  else              content = <Dashboard user={user} />;

  return <main>{content}</main>;
}`;

const FRAGMENT_CODE = `// Проблема: нужно вернуть два элемента без обёртки
// ❌ Так нельзя (два корня):
return (
  <dt>Имя</dt>
  <dd>Алиса</dd>
);

// ✅ Фрагмент — невидимая обёртка:
return (
  <>
    <dt>Имя</dt>
    <dd>Алиса</dd>
  </>
);

// <> </> — сокращение от <React.Fragment> </React.Fragment>
// Фрагмент не добавляет лишний div в DOM
// Нужен key? Тогда только полная запись:
return (
  <React.Fragment key={item.id}>
    <dt>{item.name}</dt>
    <dd>{item.value}</dd>
  </React.Fragment>
);`;

const JSX_IS_JS_CODE = `// JSX — это обычное JS-значение
// Можно хранить в переменной
const greeting = <h1>Привет!</h1>;

// Можно вернуть из функции условно
function getIcon(type) {
  if (type === 'error')   return <ErrorIcon />;
  if (type === 'success') return <CheckIcon />;
  return <InfoIcon />;
}

// Можно передать как prop
<Modal header={<h2>Заголовок</h2>}>
  Содержимое
</Modal>

// Можно положить в массив
const tabs = [
  <Tab key="home" label="Главная" />,
  <Tab key="profile" label="Профиль" />,
];`;

export function JSXArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. JSX — это не HTML ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>JSX выглядит как HTML, но это JavaScript</SectionTitle>
        <p className={s.lead}>
          JSX — синтаксический сахар. Ты пишешь что-то похожее на HTML,
          а компилятор (Babel или SWC) превращает это в обычные JavaScript-вызовы.
          Браузер никогда не видит JSX — только скомпилированный JS.
        </p>
        <CodeHighlight lang="tsx" code={JSX_NOT_HTML} />
        <Callout variant="info">
          JSX — это не магия и не шаблонизатор. Это просто более читаемый способ
          написать <code>React.createElement(...)</code>. Любой JSX можно написать
          без JSX — просто это было бы очень неудобно читать.
        </Callout>
      </section>

      {/* ── 2. Трансформация ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как JSX превращается в JavaScript</SectionTitle>
        <p className={s.body}>
          Выбери пример — увидишь что компилятор генерирует из твоего JSX.
          Обрати внимание на разницу между HTML-тегами (строка) и компонентами (ссылка на функцию).
        </p>
        <JSXTransformDemo />
      </section>

      {/* ── 3. Правила синтаксиса ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Три обязательных правила</SectionTitle>
        <p className={s.body}>
          JSX строже HTML. Нарушение этих правил — ошибка компиляции,
          а не молчаливое игнорирование.
        </p>
        <CodeHighlight lang="tsx" code={RULES_CODE} />
        <div className={s.rulesCards}>
          {[
            {
              num: '1',
              rule: 'Один корневой элемент',
              why:  'JSX компилируется в вызов функции. Функция может вернуть одно значение — один корневой React.createElement(...). Если нужно два элемента рядом — оберни во фрагмент <> </>.',
            },
            {
              num: '2',
              rule: 'Все теги закрыты',
              why:  'В HTML <img> и <br> не нужно закрывать. В JSX — обязательно: <img />, <br />. Причина та же: JSX это функции, а не HTML-парсер.',
            },
            {
              num: '3',
              rule: 'Атрибуты — camelCase',
              why:  'JSX атрибуты становятся свойствами JS-объекта. В JS нельзя написать obj.class — это зарезервированное слово. Поэтому class → className, for → htmlFor, tabindex → tabIndex.',
            },
          ].map(c => (
            <div key={c.num} className={s.ruleCard}>
              <div className={s.ruleNum}>{c.num}</div>
              <div className={s.ruleBody}>
                <div className={s.ruleTitle}>{c.rule}</div>
                <div className={s.ruleWhy}>{c.why}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Атрибуты ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Атрибуты: HTML vs JSX</SectionTitle>
        <p className={s.body}>
          Большинство HTML-атрибутов в JSX пишутся так же, но есть важные исключения.
          Запомни: все атрибуты — camelCase, кроме <code>data-*</code> и <code>aria-*</code>.
        </p>
        <CodeHighlight lang="tsx" code={ATTRS_CODE} />
        <div className={s.attrsTable}>
          {[
            { html: 'class',       jsx: 'className',    why: 'class — зарезервированное слово в JS' },
            { html: 'for',         jsx: 'htmlFor',      why: 'for — зарезервированное слово в JS' },
            { html: 'tabindex',    jsx: 'tabIndex',     why: 'camelCase — соглашение DOM API' },
            { html: 'onclick',     jsx: 'onClick',      why: 'все события — camelCase' },
            { html: 'onchange',    jsx: 'onChange',     why: 'все события — camelCase' },
            { html: 'style="color:red"', jsx: 'style={{ color: "red" }}', why: 'style принимает объект, не строку' },
          ].map(r => (
            <div key={r.html} className={s.attrsRow}>
              <code className={s.attrsHtml}>{r.html}</code>
              <span className={s.attrsArrow}>→</span>
              <code className={s.attrsJsx}>{r.jsx}</code>
              <span className={s.attrsWhy}>{r.why}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Выражения {} ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Выражения: что можно вставить в {'{}'}</SectionTitle>
        <p className={s.lead}>
          Фигурные скобки <code>{'{}'}</code> — «окно» из JSX в JavaScript.
          Внутри может быть любое <strong>JS-выражение</strong> — то что возвращает значение.
          Но не всё рендерится одинаково — некоторые типы ведут себя неожиданно.
        </p>
        <JSXExpressionDemo />
        <Callout variant="warn">
          Самая частая ошибка: <code>{'{count && <Component />}'}</code> рендерит
          <strong> "0"</strong> когда count равен нулю, потому что <code>0</code> — это
          число, а числа React отображает. Пиши <code>{'{count > 0 && <Component />}'}</code>
          или <code>{'{ !!count && <Component />}'}</code>.
        </Callout>
      </section>

      {/* ── 6. Условный рендеринг ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Условный рендеринг: три паттерна</SectionTitle>
        <p className={s.body}>
          В JSX нет <code>if</code> внутри разметки — только выражения.
          Это три способа которые покрывают 95% случаев:
        </p>
        <CodeHighlight lang="tsx" code={CONDITIONAL_CODE} />
        <div className={s.condTable}>
          {[
            { pattern: 'тернарный оператор',  when: 'два варианта: A или B',   example: '{x ? <A /> : <B />}' },
            { pattern: '&& оператор',         when: 'один вариант или ничего',  example: '{x > 0 && <A />}' },
            { pattern: 'переменная с if',     when: 'сложная логика, 3+ вариантов', example: 'let el; if (...) el = <A />; return <div>{el}</div>' },
          ].map(r => (
            <div key={r.pattern} className={s.condRow}>
              <code className={s.condPattern}>{r.pattern}</code>
              <span className={s.condWhen}>{r.when}</span>
              <code className={s.condEx}>{r.example}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Фрагменты ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Фрагменты — невидимая обёртка</SectionTitle>
        <p className={s.body}>
          Когда нужно вернуть несколько элементов рядом, но добавлять лишний
          <code> div</code> нельзя (например, внутри <code>{'<table>'}</code>,
          <code>{'<dl>'}</code>, flex- или grid-контейнера), используй фрагмент.
        </p>
        <CodeHighlight lang="tsx" code={FRAGMENT_CODE} />
        <div className={s.fragmentNote}>
          <code>{'<></>'}</code> не создаёт никакого DOM-элемента. Это просто способ
          сказать React «верни эти несколько элементов как группу».
          Проверь через DevTools: никакого лишнего <code>div</code> в DOM.
        </div>
      </section>

      {/* ── 8. JSX — это значение ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>JSX — это обычное JS-значение</SectionTitle>
        <p className={s.lead}>
          Поскольку JSX компилируется в объект, с ним можно делать всё что
          делают с обычными значениями в JavaScript: хранить в переменной,
          передавать в функцию, возвращать из условия.
        </p>
        <CodeHighlight lang="tsx" code={JSX_IS_JS_CODE} />
        <Callout variant="info">
          Именно поэтому JSX такой гибкий: это не особый язык шаблонов с
          ограниченным набором директив. Это JavaScript — со всей мощью
          языка доступной прямо в разметке.
        </Callout>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
