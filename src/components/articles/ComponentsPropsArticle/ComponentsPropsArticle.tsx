import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { PropsPlayground } from './PropsPlayground';
import { ChildrenDemo } from './ChildrenDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './ComponentsPropsArticle.module.scss';

// ── Code snippets ─────────────────────────────────────────────────────────────

const COMPONENT_ANATOMY = `// Компонент — это функция
// Принимает один аргумент: объект props
function Greeting(props) {
  return <h1>Привет, {props.name}!</h1>;
}

// Деструктуризация — так пишут почти всегда:
function Greeting({ name }) {
  return <h1>Привет, {name}!</h1>;
}

// Использование: атрибуты JSX → поля объекта props
<Greeting name="Алиса" />
// React вызывает: Greeting({ name: 'Алиса' })`;

const PROPS_FLOW = `// Props текут сверху вниз — от родителя к дочернему
function App() {
  const user = { name: 'Алиса', role: 'admin' };

  return (
    //          ↓ передаём данные дочернему компоненту
    <UserCard name={user.name} role={user.role} />
  );
}

function UserCard({ name, role }) {
  //  ↑ получаем данные из props
  return (
    <div>
      <h2>{name}</h2>
      <span>{role}</span>
    </div>
  );
}
// Props всегда readonly — нельзя изменить внутри компонента`;

const DEFAULTS_CODE = `// Значения по умолчанию — через деструктуризацию
function Button({ label, variant = 'primary', disabled = false }) {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Использование — можно пропустить необязательные props:
<Button label="Сохранить" />                       // variant='primary', disabled=false
<Button label="Удалить" variant="danger" />         // disabled=false
<Button label="Отправить" variant="ghost" disabled={isLoading} />`;

const CHILDREN_CODE = `// children — особый prop: всё что между тегами
function Card({ title, children }) {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div className="card-body">
        {children}  {/* сюда попадает всё что внутри <Card> */}
      </div>
    </div>
  );
}

// Использование: контент идёт внутрь тегов
<Card title="О нас">
  <p>Мы делаем классные продукты.</p>
  <a href="/team">Наша команда →</a>
</Card>`;

const TYPESCRIPT_CODE = `// TypeScript: описываем форму props через interface
interface ButtonProps {
  label: string;                    // обязательный
  variant?: 'primary' | 'danger';  // опциональный (?)
  disabled?: boolean;
  onClick?: () => void;             // функция без аргументов
}

function Button({ label, variant = 'primary', disabled, onClick }: ButtonProps) {
  return (
    <button
      className={\`btn-\${variant}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Компонент с children — тип React.ReactNode
interface CardProps {
  title: string;
  children: React.ReactNode;  // любой JSX: элементы, строки, null
}`;

const SPREAD_CODE = `// Spread props — передать все props дальше
function IconButton({ icon, ...rest }: { icon: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest}>  {/* className, disabled, onClick и т.д. */}
      <span>{icon}</span>
    </button>
  );
}

// Передача подмножества props дочернему компоненту
function FormField({ label, error, ...inputProps }) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />  {/* value, onChange, placeholder... */}
      {error && <span className="error">{error}</span>}
    </div>
  );
}`;

const NAMING_CODE = `// ✅ Правила именования
function UserAvatar() {}      // PascalCase — компонент
function formatDate() {}      // camelCase — обычная функция

// Props: описывай намерение, не тип
<Button onClick={handleSubmit} />   // ✅ onClick — событие
<Button click={handleSubmit} />     // ❌ неочевидно

// Boolean props: без значения = true
<Input disabled />              // = disabled={true}
<Input required />              // = required={true}

// Handler props: on + EventName
<Button onClick={...} />        // ✅
<Button handleClick={...} />    // ❌ не соглашение React`;

export function ComponentsPropsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Компонент — это функция ──────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Компонент — это функция. Props — её аргументы.</SectionTitle>
        <p className={s.lead}>
          Всё в React строится на одной простой идее: компонент — обычная
          JavaScript-функция. Она принимает один объект (props) и возвращает JSX.
          Никакой магии — только функция.
        </p>
        <CodeHighlight lang="tsx" code={COMPONENT_ANATOMY} />
        <div className={s.keyPoint}>
          <span className={s.keyIcon}>◈</span>
          <div>
            <strong>Деструктуризация props</strong> — стандарт в React.
            Вместо <code>props.name</code> пишут <code>{'{ name }'}</code> прямо
            в параметре. Короче, читабельнее, и сразу видно какие данные нужны компоненту.
          </div>
        </div>
      </section>

      {/* ── 2. Поток данных ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Props текут сверху вниз</SectionTitle>
        <p className={s.lead}>
          В React данные движутся <strong>в одном направлении</strong>: от родителя
          к дочернему компоненту через props. Дочерний компонент читает props,
          но <strong>не может их изменить</strong>. Это не ограничение — это гарантия
          предсказуемости.
        </p>
        <CodeHighlight lang="tsx" code={PROPS_FLOW} />
        <Callout variant="info">
          Props — <strong>иммутабельны</strong> (только для чтения). Если компоненту
          нужно хранить изменяемые данные — для этого есть <code>useState</code>.
          Props — это «что мне передали», state — «что я помню».
        </Callout>
      </section>

      {/* ── 3. PropsPlayground ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: меняй props — смотри результат</SectionTitle>
        <p className={s.body}>
          Редактируй поля слева — компонент справа обновляется мгновенно.
          Под компонентом видно как меняется JSX-вызов при каждом изменении.
        </p>
        <PropsPlayground />
      </section>

      {/* ── 4. Дефолтные значения ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Дефолтные значения props</SectionTitle>
        <p className={s.body}>
          Если prop не передан — он будет <code>undefined</code>.
          Чтобы этого избежать, задай дефолтное значение прямо в деструктуризации.
          Это обычный JavaScript — никакого специального синтаксиса React.
        </p>
        <CodeHighlight lang="tsx" code={DEFAULTS_CODE} />
        <div className={s.twoCol}>
          <div className={s.factCard}>
            <div className={s.factLabel}>// раньше писали так</div>
            <div className={s.factCode}>
              {'Button.defaultProps = {\n  variant: "primary"\n}'}
            </div>
            <div className={s.factNote}>Устарело — defaultProps deprecated с React 18.3</div>
          </div>
          <div className={s.factCard}>
            <div className={s.factLabel}>// сейчас пишут так</div>
            <div className={s.factCode}>
              {'function Button({\n  variant = "primary"\n}) {...}'}
            </div>
            <div className={s.factNote}>Деструктуризация с дефолтами — современный стандарт</div>
          </div>
        </div>
      </section>

      {/* ── 5. children ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>children — содержимое между тегами</SectionTitle>
        <p className={s.lead}>
          <code>children</code> — это специальный prop который React заполняет
          автоматически: туда попадает всё что написано между открывающим и
          закрывающим тегом компонента. Это основа для компонентов-обёрток.
        </p>
        <CodeHighlight lang="tsx" code={CHILDREN_CODE} />
      </section>

      {/* ── 6. ChildrenDemo ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: один компонент — разный children</SectionTitle>
        <p className={s.body}>
          Компонент <code>Card</code> один и тот же. Меняется только то что
          передаётся внутрь. Это сила children — компонент не знает что в него придёт.
        </p>
        <ChildrenDemo />
      </section>

      {/* ── 7. TypeScript ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>TypeScript: типизируем props</SectionTitle>
        <p className={s.body}>
          TypeScript превращает ошибки в props из рантайма в ошибки компиляции.
          IDE подсказывает какие props есть у компонента и какого они типа.
        </p>
        <CodeHighlight lang="tsx" code={TYPESCRIPT_CODE} />
        <div className={s.typesTable}>
          {[
            { prop: 'string',                    example: 'name: string',                   use: 'Текст: заголовки, лейблы, имена' },
            { prop: 'number',                    example: 'count: number',                  use: 'Числа: размер, количество, цена' },
            { prop: 'boolean',                   example: 'disabled?: boolean',             use: 'Флаги: видимость, состояние, включено/выключено' },
            { prop: '() => void',                example: 'onClick?: () => void',           use: 'Обработчик без возвращаемого значения' },
            { prop: '(val: T) => void',          example: 'onChange: (v: string) => void', use: 'Обработчик с аргументом (controlled input)' },
            { prop: 'React.ReactNode',           example: 'children: React.ReactNode',     use: 'Любой JSX: элементы, строки, null, массивы' },
            { prop: '"a" | "b" | "c"',           example: 'variant: "primary" | "danger"', use: 'Ограниченный набор вариантов (union)' },
          ].map(r => (
            <div key={r.prop} className={s.typesRow}>
              <code className={s.typeProp}>{r.prop}</code>
              <code className={s.typeEx}>{r.example}</code>
              <span className={s.typeUse}>{r.use}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Spread и соглашения ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Spread props и соглашения именования</SectionTitle>
        <CodeHighlight lang="tsx" code={SPREAD_CODE} />
        <CodeHighlight lang="tsx" code={NAMING_CODE} />
        <Callout variant="warn">
          Не злоупотребляй spread props (<code>{'<Component {...props} />'}</code>).
          Это удобно для обёрток нативных элементов, но делает код трудно читаемым:
          непонятно какие именно props передаются. Явная передача предпочтительнее.
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
