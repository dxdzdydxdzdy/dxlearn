import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cp1',
    difficulty: 'easy',
    code: `function Hello({ name }) {
  return <h1>Привет, {name}!</h1>;
}

<Hello name="Алиса" />`,
    question: 'Что именно принимает функция Hello в параметре?',
    options: [
      'Строку "Алиса" напрямую',
      'Объект { name: "Алиса" } — React всегда передаёт один объект props',
      'Два аргумента: имя тега и значение',
      'Массив атрибутов компонента',
    ],
    correct: 1,
    explanation:
      'Компонент всегда принимает один аргумент — объект props. React.createElement(Hello, { name: "Алиса" }) создаёт объект { name: "Алиса" } и передаёт его в Hello. Деструктуризация ({ name }) — это синтаксический сахар для const { name } = props, она не меняет то что приходит в функцию.',
  },
  {
    id: 'cp2',
    difficulty: 'easy',
    code: `function Button({ label, variant, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}`,
    question: 'Что произойдёт с variant если не передать его при использовании компонента?',
    options: [
      'React бросит ошибку — пропущен обязательный prop',
      'variant будет undefined — без дефолтного значения пропущенный prop = undefined',
      'variant автоматически получит значение "default"',
      'React проигнорирует вызов компонента',
    ],
    correct: 1,
    explanation:
      'Если prop не передан и нет дефолтного значения — он undefined. Это не ошибка React (если только TypeScript не помечает его как обязательный). Чтобы задать дефолт: function Button({ variant = "primary" }) — деструктуризация с дефолтом, это чистый JavaScript.',
  },
  {
    id: 'cp3',
    difficulty: 'easy',
    code: `// Что попадёт в children?
<Panel title="Привет">
  <p>Текст</p>
  <Button>Нажми</Button>
</Panel>`,
    question: 'Что будет в children внутри компонента Panel?',
    options: [
      'Строка "Текст Нажми" — весь текстовый контент между тегами',
      'Массив из двух React-элементов: <p> и <Button>',
      'null — Panel не может иметь children',
      'HTML-строка "<p>Текст</p><Button>Нажми</Button>"',
    ],
    correct: 1,
    explanation:
      'children — это всё что находится между открывающим и закрывающим тегом. При нескольких дочерних элементах children становится массивом React-элементов (объектов). При одном дочернем — одиночный объект (не массив). Строки, числа, null — тоже могут быть children.',
  },
  {
    id: 'cp4',
    difficulty: 'easy',
    code: `// Сокращение для boolean props
<Input disabled />
// Это то же что:
<Input disabled={???} />`,
    question: 'Чему равно ??? в примере выше?',
    options: [
      'disabled="disabled"',
      'disabled={true}',
      'disabled={1}',
      'disabled=""',
    ],
    correct: 1,
    explanation:
      'В JSX атрибут без значения = true. <Input disabled /> это <Input disabled={true} />. Это соглашение React — удобно для boolean props. Обратно: чтобы передать false, нужно явно написать disabled={false}. Не передать prop вообще != передать false — пропущенный prop будет undefined.',
  },
  {
    id: 'cp5',
    difficulty: 'medium',
    code: `function UserCard({ name, role = 'Участник', online }) {
  return (
    <div>
      <b>{name}</b> · {role}
      {online && <span>🟢</span>}
    </div>
  );
}

<UserCard name="Боб" online={false} />`,
    question: 'Что отрендерится при этом вызове?',
    options: [
      '<div><b>Боб</b> · Участник🟢</div>',
      '<div><b>Боб</b> · Участник</div>',
      '<div><b>Боб</b> · Участникfalse</div>',
      'Ошибка — role обязательный prop',
    ],
    correct: 1,
    explanation:
      'role не передан → используется дефолт "Участник". online={false} → {false && <span>} = {false} → ничего не рендерится. Итог: Боб · Участник. Важно: false не рендерится, но 0 рендерится! Именно поэтому лучше писать {online === true && <span>} или {!!online && <span>}.',
  },
  {
    id: 'cp6',
    difficulty: 'medium',
    code: `function Counter({ count }) {
  count = count + 1;  // ← пытаемся изменить prop
  return <p>{count}</p>;
}`,
    question: 'Что произойдёт если изменить prop внутри компонента?',
    options: [
      'React обнаружит изменение и перерендерит родителя',
      'Ошибка выполнения — props заморожены через Object.freeze',
      'count внутри компонента изменится, но это локальная копия. Родитель и prop не изменятся',
      'Изменение сохранится между рендерами',
    ],
    correct: 2,
    explanation:
      'В JavaScript числа — примитивы, они передаются по значению. count + 1 создаёт новое значение, не изменяет оригинал в родителе. Если бы prop был объектом и его мутировали (prop.name = "new") — это было бы ошибкой архитектуры: React не узнает об изменении и не перерендерится. Правило: никогда не мутируй props.',
  },
  {
    id: 'cp7',
    difficulty: 'medium',
    code: `interface CardProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}`,
    question: 'Что означает React.ReactNode как тип для children?',
    options: [
      'Только JSX-элементы — <div>, <p> и компоненты',
      'Любое что React может отрендерить: JSX-элементы, строки, числа, null, undefined, массивы',
      'Только один дочерний элемент (не массив)',
      'Функция которая возвращает JSX (render prop)',
    ],
    correct: 1,
    explanation:
      'React.ReactNode — самый широкий тип для children. Включает: React.ReactElement (JSX), string, number, boolean, null, undefined, и массивы из них. Это именно то что React может отрендерить. Если нужен только один JSX-элемент — используй React.ReactElement. Если функция — (props: T) => React.ReactNode.',
  },
  {
    id: 'cp8',
    difficulty: 'medium',
    code: `// Есть компонент:
function Avatar({ src, size, alt, className }) { ... }

// Хочу создать обёртку SmallAvatar с фиксированным size
function SmallAvatar({ src, alt, className }) {
  return <Avatar src={src} alt={alt} className={className} size={24} />;
}

// Или через spread:
function SmallAvatar({ ...rest }) {
  return <Avatar {...rest} size={24} />;
}`,
    question: 'В чём разница между двумя подходами к SmallAvatar?',
    options: [
      'Нет разницы — оба делают одно и то же',
      'Первый явный: видно какие props принимает SmallAvatar. Второй через spread: короче, но скрывает что именно передаётся',
      'Второй вариант передаёт и size от родителя что позволит его переопределить',
      'Первый вариант работает только с TypeScript',
    ],
    correct: 1,
    explanation:
      'Оба рабочие, но явный подход предпочтителен: видно что SmallAvatar принимает src, alt, className. Spread {...rest} скрывает интерфейс компонента. Ещё нюанс: в spread-версии если родитель передаст size — он попадёт в rest и передастся в Avatar перед size={24}, значит size={24} его перезапишет (props справа имеют приоритет при конфликте спреда).',
  },
  {
    id: 'cp9',
    difficulty: 'hard',
    code: `function Wrapper({ children }) {
  return <div className="wrap">{children}</div>;
}

// Использование:
<Wrapper>
  {items.map(item => <Card key={item.id} {...item} />)}
</Wrapper>`,
    question: 'Каким типом будет children в этом случае?',
    options: [
      'React.ReactElement — один элемент',
      'React.ReactNode[] — массив React-узлов',
      'React.ReactElement[] — массив JSX-элементов, результат .map()',
      'Зависит от длины массива items',
    ],
    correct: 2,
    explanation:
      '.map() возвращает массив. Поэтому children будет React.ReactElement[] — массив JSX-элементов. React умеет рендерить массивы (именно поэтому нужен key). Если items пустой — children будет пустой массив [], который тоже React рендерит как "ничего". Это предсказуемое поведение.',
  },
  {
    id: 'cp10',
    difficulty: 'hard',
    code: `// Почему этот код ломает TypeScript?
function Modal({ title, onClose, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onClose}>×</button>
      {children}
    </div>
  );
}`,
    question: 'Что не так с типизацией Modal?',
    options: [
      'children нельзя типизировать как React.ReactNode',
      'onClose используется но не описан в interface — TypeScript выдаст ошибку',
      'title не используется в JSX',
      'button не может принимать onClick',
    ],
    correct: 1,
    explanation:
      'onClose передаётся в onClick={onClose}, но в интерфейсе пропов нет поля onClose. TypeScript выдаст: "Property \'onClose\' does not exist on type". Нужно добавить onClose: () => void в interface. TypeScript защищает от таких опечаток и пропущенных полей — это одна из главных ценностей типизации props.',
  },
  {
    id: 'cp11',
    difficulty: 'hard',
    code: `// Что выведет консоль?
function Child({ value }) {
  console.log('render Child', value);
  return <p>{value}</p>;
}

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child value={42} />
    </>
  );
}`,
    question: 'Сколько раз "render Child 42" появится в консоли после трёх кликов?',
    options: [
      '0 раз — value не меняется, поэтому Child не перерендеривается',
      '3 раза — Child перерендеривается при каждом обновлении Parent',
      '1 раз — только при первом рендере',
      'Зависит от версии React',
    ],
    correct: 1,
    explanation:
      'По умолчанию Child перерендеривается каждый раз когда перерендеривается Parent — даже если props не изменились. React не сравнивает старые и новые props автоматически. Чтобы пропустить лишние рендеры, нужно React.memo(Child). Но мемоизировать всё подряд — тоже не нужно: рендер компонента обычно быстрый, а memo добавляет накладные расходы на сравнение.',
  },
  {
    id: 'cp12',
    difficulty: 'hard',
    code: `// Что делает эта конструкция?
function Input({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}`,
    question: 'Зачем здесь ...rest и InputHTMLAttributes?',
    options: [
      'rest позволяет передать только разрешённые атрибуты, остальные игнорируются',
      'InputHTMLAttributes даёт все стандартные атрибуты input (value, onChange, placeholder, disabled...) без их перечисления, rest передаёт их в нативный input',
      'Это устаревший паттерн — теперь нужно явно описывать каждый prop',
      'rest нужен чтобы children input попал в label',
    ],
    correct: 1,
    explanation:
      'InputHTMLAttributes<HTMLInputElement> — это тип из @types/react который содержит все стандартные HTML-атрибуты тега input: value, onChange, placeholder, disabled, type, min, max, pattern и т.д. Через & { label: string } добавляем свой кастомный prop. ...rest собирает все стандартные атрибуты и передаёт их в нативный <input {...rest} />. Это стандартный паттерн для обёрток над нативными элементами.',
  },
];
