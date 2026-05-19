import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'flex1',
    difficulty: 'easy',
    code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    question: 'Что делают эти правила с дочерними элементами?',
    options: [
      'Центрируют по горизонтали, растягивают по вертикали',
      'Центрируют по главной оси, растягивают по поперечной',
      'Центрируют по обеим осям',
      'Выравнивают по левому краю и верху',
    ],
    correct: 2,
    explanation:
      'justify-content работает вдоль главной оси (по умолчанию — горизонталь). align-items — вдоль поперечной (вертикаль). Оба значения center → элементы в центре по обеим осям.',
  },
  {
    id: 'flex2',
    difficulty: 'easy',
    code: `.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}`,
    question: 'В каком направлении расположатся элементы и как распределится пространство?',
    options: [
      'Горизонтально, равные отступы между ними',
      'Вертикально, первый и последний прижаты к краям',
      'Вертикально, равные отступы вокруг каждого',
      'Горизонтально, первый и последний прижаты к краям',
    ],
    correct: 1,
    explanation:
      'flex-direction: column меняет главную ось на вертикальную. justify-content: space-between распределяет элементы так, что первый — у начала оси, последний — у конца, а свободное пространство равномерно между ними.',
  },
  {
    id: 'flex3',
    difficulty: 'medium',
    code: `.item {
  flex: 1 0 200px;
}`,
    question: 'Что означает запись flex: 1 0 200px?',
    options: [
      'flex-grow: 1, flex-shrink: 0, flex-basis: 200px',
      'flex-grow: 0, flex-shrink: 1, flex-basis: 200px',
      'width: 200px, min-width: 1px, max-width: none',
      'flex-basis: 1, gap: 0, min-width: 200px',
    ],
    correct: 0,
    explanation:
      'Сокращение flex принимает: flex-grow flex-shrink flex-basis. flex: 1 0 200px — элемент начинает с 200px, может расти (grow: 1), но не сжимается (shrink: 0).',
  },
  {
    id: 'flex4',
    difficulty: 'medium',
    code: `.container { display: flex; }
.a { flex-grow: 1; }
.b { flex-grow: 2; }
.c { flex-grow: 1; }
/* свободного места: 300px */`,
    question: 'Сколько пикселей получит каждый элемент из свободного пространства?',
    options: [
      'a: 100px, b: 100px, c: 100px',
      'a: 75px, b: 150px, c: 75px',
      'a: 50px, b: 200px, c: 50px',
      'a: 0, b: 300px, c: 0',
    ],
    correct: 1,
    explanation:
      'Сумма flex-grow: 1 + 2 + 1 = 4. Свободное место делится на части пропорционально: a получает 300/4×1=75px, b — 300/4×2=150px, c — 75px.',
  },
  {
    id: 'flex5',
    difficulty: 'hard',
    code: `.container {
  display: flex;
  align-items: flex-start;
}
.item-2 {
  align-self: stretch;
}`,
    question: 'Что делает align-self: stretch на .item-2?',
    options: [
      'Переопределяет align-items только для этого элемента',
      'Растягивает элемент по главной оси',
      'Применяет align-items ко всем дочерним элементам item-2',
      'Ничего — stretch не работает с flex-start на контейнере',
    ],
    correct: 0,
    explanation:
      'align-self позволяет отдельному flex-элементу переопределить align-items контейнера. Здесь контейнер говорит "все элементы по верху" (flex-start), но item-2 говорит "я хочу растянуться" — и растягивается до высоты строки.',
  },
  {
    id: 'flex6',
    difficulty: 'hard',
    code: `.container {
  display: flex;
  flex-wrap: wrap;
}
.item {
  flex: 0 0 calc(33.333% - 16px);
}`,
    question: 'Сколько элементов поместится в одну строку при ширине контейнера 900px?',
    options: ['2', '3', '4', 'зависит от gap'],
    correct: 1,
    explanation:
      'flex-basis: calc(33.333% - 16px) при 900px ≈ 300px - 16px = 284px на элемент. 900/284 ≈ 3.17 → 3 элемента в строке (четвёртый не влезет и перейдёт на следующую строку). Учти: вычитаемые 16px обычно компенсируют gap.',
  },
];
