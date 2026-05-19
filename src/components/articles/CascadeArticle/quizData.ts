import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cascade1',
    difficulty: 'easy',
    code: `/* CSS */
p { color: blue; }
p { color: red; }`,
    question: 'Какой цвет получит <p>?',
    options: ['blue', 'red', 'фиолетовый (смешение)', 'зависит от браузера'],
    correct: 1,
    explanation:
      'Каскад: при равной специфичности побеждает объявление, которое появляется позже в таблице стилей. Второй p { color: red } перекрывает первый.',
  },
  {
    id: 'cascade2',
    difficulty: 'easy',
    code: `<p id="title" class="big">Текст</p>

/* CSS */
#title { color: blue; }
.big   { color: red; }`,
    question: 'Какой цвет получит абзац?',
    options: ['red', 'blue', 'зависит от порядка правил', 'наследованный'],
    correct: 1,
    explanation:
      'ID-селектор (#title) имеет специфичность (1,0,0), классовый (.big) — (0,1,0). ID всегда побеждает класс, независимо от порядка правил.',
  },
  {
    id: 'cascade3',
    difficulty: 'medium',
    code: `/* Специфичность: кто победит? */
div#app .btn:hover        /* ? */
#app ul li a.active       /* ? */`,
    question: 'Какую специфичность имеет первый селектор?',
    options: ['(1,2,1)', '(1,1,2)', '(0,2,2)', '(1,2,2)'],
    correct: 0,
    explanation:
      'div#app .btn:hover: div — тег (0,0,1), #app — id (1,0,0), .btn — класс (0,1,0), :hover — псевдокласс (0,1,0). Итого: (1, 2, 1). Второй: #app (1,0,0) + ul li a — 3 тега (0,0,3) + .active — класс (0,1,0) = (1,1,3).',
  },
  {
    id: 'cascade4',
    difficulty: 'medium',
    code: `<p style="color: green;">Текст</p>

/* style.css */
#id { color: blue; }`,
    question: 'Какой цвет получит абзац?',
    options: ['blue', 'green', 'зависит от порядка подключения', 'унаследованный'],
    correct: 1,
    explanation:
      'Инлайн-стиль (style="") имеет специфичность (1,0,0,0) — он выше любого CSS-селектора, включая ID. Исключение — !important.',
  },
  {
    id: 'cascade5',
    difficulty: 'hard',
    code: `/* style.css */
p { color: red !important; }

/* inline */
<p style="color: blue;">Текст</p>`,
    question: 'Какой цвет получит абзац?',
    options: ['blue (инлайн сильнее)', 'red (!important сильнее)', 'зависит от порядка', 'браузерный дефолт'],
    correct: 1,
    explanation:
      '!important перекрывает всё, включая инлайн-стили. Порядок победы: !important > инлайн > ID > класс/атрибут/псевдокласс > тег. Инлайн + !important победит обычный !important.',
  },
  {
    id: 'cascade6',
    difficulty: 'hard',
    code: `<div>
  <p>Текст</p>
</div>

div { color: teal; }
/* нет правил для p */`,
    question: 'Какой цвет получит <p>?',
    options: ['браузерный дефолт (черный)', 'teal (наследование)', 'не определён', 'transparent'],
    correct: 1,
    explanation:
      'color — наследуемое свойство. Если у <p> нет явного цвета, он наследует его от родителя <div>. Это третья ступень каскада: сначала origin + !important, затем специфичность, затем наследование, затем начальное значение.',
  },
];
