import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'jsx1',
    difficulty: 'easy',
    code: `const el = <h1 className="title">Привет!</h1>;`,
    question: 'Во что компилируется эта строка JSX?',
    options: [
      'В HTML-строку "<h1 class=\'title\'>Привет!</h1>"',
      'В вызов React.createElement("h1", { className: "title" }, "Привет!")',
      'В прямое обращение к DOM: document.createElement("h1")',
      'В объект { html: "<h1>", text: "Привет!" }',
    ],
    correct: 1,
    explanation:
      'JSX — синтаксический сахар. Babel или SWC компилирует любой JSX в React.createElement(тип, props, ...children). Браузер никогда не видит JSX — только скомпилированный JavaScript. Результат — обычный JS-объект с полями type, props, children.',
  },
  {
    id: 'jsx2',
    difficulty: 'easy',
    code: `// Что не так?
return (
  <h1>Заголовок</h1>
  <p>Текст</p>
);`,
    question: 'Почему этот код вызовет ошибку?',
    options: [
      'Нельзя возвращать JSX из функции',
      'JSX требует один корневой элемент — здесь два элемента без обёртки',
      'Тег p нельзя использовать без div',
      'h1 и p нельзя использовать в одном return',
    ],
    correct: 1,
    explanation:
      'JSX компилируется в React.createElement(...) — вызов функции. Функция возвращает одно значение. Два соседних элемента — это два значения. Решение: обернуть в div или в фрагмент <> </> который не добавляет DOM-элемента.',
  },
  {
    id: 'jsx3',
    difficulty: 'easy',
    code: `<img src="photo.jpg">        // HTML
<img src="photo.jpg" />      // JSX`,
    question: 'Почему в JSX все теги нужно закрывать?',
    options: [
      'Это требование HTML5 которое JSX просто переняло',
      'JSX строже HTML: незакрытый тег — синтаксическая ошибка при компиляции',
      'Чтобы браузер правильно расставил отступы',
      'Это опционально — незакрытые теги тоже работают',
    ],
    correct: 1,
    explanation:
      'JSX — это не HTML-парсер, а компилятор. Он ожидает строгий синтаксис: каждый тег должен быть явно закрыт. Даже "пустые" HTML-теги (img, br, input, hr) в JSX пишутся как self-closing: <img />, <br />, <input />.',
  },
  {
    id: 'jsx4',
    difficulty: 'easy',
    code: `// Что нужно написать вместо ??? чтобы добавить класс?
<button ???="primary-btn">Нажми</button>`,
    question: 'Какой атрибут используется в JSX вместо HTML-атрибута class?',
    options: [
      'class="primary-btn"',
      'cssClass="primary-btn"',
      'className="primary-btn"',
      'classList="primary-btn"',
    ],
    correct: 2,
    explanation:
      'class — зарезервированное слово в JavaScript (для объявления классов). Чтобы использовать его как имя свойства объекта пришлось бы писать obj["class"] — неудобно. React выбрал className по аналогии с DOM API (element.className). Аналогично: for → htmlFor в <label>.',
  },
  {
    id: 'jsx5',
    difficulty: 'medium',
    code: `// Чем отличаются эти два JSX-выражения?
<div />             // A
<Div />             // B`,
    question: 'В чём разница между <div /> и <Div />?',
    options: [
      'Нет разницы — JSX не чувствителен к регистру',
      '<Div /> вызовет ошибку — нельзя использовать HTML-теги с большой буквы',
      '<div /> → createElement("div", ...) — HTML-тег; <Div /> → createElement(Div, ...) — ссылка на компонент-функцию',
      '<Div /> рендерит div с атрибутом capital="true"',
    ],
    correct: 2,
    explanation:
      'Регистр первой буквы — единственный способ которым React отличает HTML-теги от компонентов. Строчная буква → строка (HTML-элемент), заглавная → ссылка на функцию или класс. Поэтому компоненты в React всегда начинаются с большой буквы: <Button />, <UserCard />, а не <button-custom />.',
  },
  {
    id: 'jsx6',
    difficulty: 'medium',
    code: `function List({ items }) {
  return (
    <ul>
      {items.length && <Items list={items} />}
    </ul>
  );
}
// items = []`,
    question: 'Что отрендерится когда items пустой массив?',
    options: [
      'Пустой <ul> — ничего внутри',
      'Вообще ничего — компонент не рендерится',
      'Число 0 внутри <ul>',
      'Ошибка: Cannot read property of undefined',
    ],
    correct: 2,
    explanation:
      'items.length === 0 при пустом массиве. В JavaScript 0 && anything === 0. React рендерит число 0 как текст — получается <ul>0</ul>. Правильно: {items.length > 0 && <Items />} или {!!items.length && <Items />}. Это одна из самых частых ошибок в React.',
  },
  {
    id: 'jsx7',
    difficulty: 'medium',
    code: `<p style="color: red; font-size: 16px">Текст</p>  // HTML
<p style={{ color: 'red', fontSize: '16px' }}>Текст</p>  // JSX`,
    question: 'Почему в JSX style принимает объект, а не строку?',
    options: [
      'Это просто синтаксическое предпочтение команды React',
      'JSX компилируется в JavaScript, где стили удобнее передавать как объект со свойствами',
      'Строки запрещены в JSX-атрибутах',
      'Объект быстрее обрабатывается браузером чем строка',
    ],
    correct: 1,
    explanation:
      'JSX атрибуты становятся свойствами JavaScript-объекта. Строка CSS требовала бы парсинга в рантайме. Объект удобнее: типизация в TypeScript, прямое присваивание значений, динамические стили. Обратите внимание: свойства camelCase — fontSize вместо font-size, backgroundColor вместо background-color.',
  },
  {
    id: 'jsx8',
    difficulty: 'medium',
    code: `const user = { name: 'Алиса', age: 25 };

// Что произойдёт?
<p>{user}</p>`,
    question: 'Что случится если передать объект напрямую в JSX?',
    options: [
      'Отрендерится "[object Object]"',
      'Отрендерится JSON-строка объекта',
      'Ошибка: Objects are not valid as a React child',
      'Ничего не отрендерится — объекты игнорируются',
    ],
    correct: 2,
    explanation:
      'React не умеет рендерить JavaScript-объекты — это ошибка рантайма. Нужно обращаться к конкретным полям: {user.name}, {user.age}. Для отладки можно использовать {JSON.stringify(user)}, но не в production-коде. Ошибка защищает от случайного рендеринга не того значения.',
  },
  {
    id: 'jsx9',
    difficulty: 'medium',
    code: `return (
  <>
    <dt>Название</dt>
    <dd>Значение</dd>
  </>
);`,
    question: 'Зачем здесь фрагмент <> </> вместо <div>?',
    options: [
      'Фрагменты рендерятся быстрее чем div',
      'div запрещён внутри компонентов',
      'Фрагмент не создаёт DOM-элемент — не добавляет лишний div который мог бы сломать структуру dt/dd',
      'Это устаревший синтаксис — теперь нужно писать React.Fragment',
    ],
    correct: 2,
    explanation:
      'Фрагмент — невидимая обёртка без реального DOM-элемента. Это важно когда структура DOM имеет значение: dt/dd внутри dl, tr/td внутри table, или в flex/grid-контейнерах где лишний div меняет поведение. <> </> — сокращение от <React.Fragment>. Если нужен key — только полная запись: <React.Fragment key={id}>.',
  },
  {
    id: 'jsx10',
    difficulty: 'hard',
    code: `function Page({ isAdmin, isLoading }) {
  if (isLoading) return <Spinner />;

  return (
    <div>
      <Header />
      {isAdmin && <AdminPanel />}
    </div>
  );
}`,
    question: 'Что вернёт компонент когда isAdmin=false и isLoading=false?',
    options: [
      '<div><Header /></div> — AdminPanel не рендерится, false ничего не рендерит',
      '<div><Header />false</div> — false выводится как текст',
      'null — компонент не рендерится ничего',
      '<div><Header /><AdminPanel /></div> — AdminPanel всегда рендерится',
    ],
    correct: 0,
    explanation:
      'false в {} не рендерится — это специальное правило React для удобного условного рендеринга. При isAdmin=false выражение {isAdmin && <AdminPanel />} вычисляется как {false}, которое React игнорирует. Результат: <div><Header /></div>. Если бы isAdmin=0 — число 0 бы рендерилось!',
  },
  {
    id: 'jsx11',
    difficulty: 'hard',
    code: `const icon = getIcon(type);  // возвращает JSX

<Button>
  {icon}
  Отправить
</Button>`,
    question: 'Почему JSX можно хранить в переменной и передавать куда угодно?',
    options: [
      'Это специальная возможность JSX недоступная обычному JavaScript',
      'JSX компилируется в React.createElement() — обычный вызов функции возвращающий объект. Объекты в JS можно хранить где угодно',
      'Это работает только если переменная называется element или jsx',
      'JSX в переменной работает только внутри компонентов',
    ],
    correct: 1,
    explanation:
      'JSX компилируется в React.createElement() который возвращает обычный JavaScript-объект (React element). Объекты — first-class values в JS: их можно хранить в переменных, передавать как аргументы, возвращать из функций, класть в массивы. Именно поэтому JSX так гибок — это не шаблонизатор с ограниченным синтаксисом, а полноценный JavaScript.',
  },
  {
    id: 'jsx12',
    difficulty: 'hard',
    code: `// aria-* и data-* атрибуты в JSX
<div
  aria-label="Закрыть диалог"
  aria-hidden={false}
  data-testid="close-btn"
  data-analytics="header_close"
>
  ×
</div>`,
    question: 'Почему aria-* и data-* атрибуты НЕ используют camelCase как другие?',
    options: [
      'Это баг в React который пока не исправили',
      'aria и data — специальные namespace-атрибуты HTML, в DOM они остаются с дефисом, React сохраняет их как есть',
      'Они написаны без camelCase только в этом примере — на самом деле нужно ariaLabel, dataTestId',
      'camelCase для aria/data не работает в старых браузерах',
    ],
    correct: 1,
    explanation:
      'aria-* и data-* — это HTML-атрибуты со специальным синтаксисом (содержат дефис). В DOM они хранятся именно с дефисом: element.getAttribute("aria-label"), element.dataset.testid. React сохраняет их оригинальное написание чтобы правильно映射ться в DOM. Обычные атрибуты (class, for, tabindex) конвертируются в camelCase потому что иначе конфликтуют с зарезервированными словами JS.',
  },
];
