export interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    difficulty: 'easy',
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
console.log(3);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 2 → 3', '1 → 3 → 2', '3 → 1 → 2', '2 → 1 → 3'],
    correct: 1,
    explanation:
      'Синхронный код выполняется первым: 1, затем 3. setTimeout(fn, 0) помещает колбэк в Macrotask Queue — он выполнится после того, как Call Stack опустеет. Итого: 1 → 3 → 2.',
  },
  {
    id: 'q2',
    difficulty: 'easy',
    code: `console.log(1);
Promise.resolve().then(() => console.log(2));
console.log(3);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 2 → 3', '1 → 3 → 2', '2 → 1 → 3', '3 → 2 → 1'],
    correct: 1,
    explanation:
      'Синхронно: 1, затем 3. Promise.then() регистрирует микрозадачу — она выполнится сразу после синхронного кода, до следующей макрозадачи. Итого: 1 → 3 → 2.',
  },
  {
    id: 'q3',
    difficulty: 'medium',
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 2 → 3 → 4', '1 → 4 → 3 → 2', '1 → 3 → 4 → 2', '1 → 4 → 2 → 3'],
    correct: 1,
    explanation:
      'Синхронно: 1, 4. После — все микрозадачи: 3 (Promise). Потом макрозадача: 2 (setTimeout). Правило: sync → micro → macro. Итого: 1 → 4 → 3 → 2.',
  },
  {
    id: 'q4',
    difficulty: 'medium',
    code: `setTimeout(() => {
  console.log(1);
  Promise.resolve().then(() => console.log(2));
}, 0);

setTimeout(() => console.log(3), 0);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 3 → 2', '1 → 2 → 3', '3 → 1 → 2', '1 → 2 → 3 → 1'],
    correct: 1,
    explanation:
      'Первый setTimeout (macro 1) выполняется: лог 1, затем регистрирует микрозадачу. До следующей макрозадачи Event Loop опустошает Microtask Queue: лог 2. Только потом — второй setTimeout: лог 3. Итого: 1 → 2 → 3.',
  },
  {
    id: 'q5',
    difficulty: 'hard',
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve()
  .then(() => {
    console.log(3);
    return Promise.resolve();
  })
  .then(() => console.log(4));
console.log(5);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 5 → 3 → 4 → 2', '1 → 3 → 4 → 5 → 2', '1 → 5 → 4 → 3 → 2', '1 → 5 → 3 → 2 → 4'],
    correct: 0,
    explanation:
      'Синхронно: 1, 5. Microtask Queue: первый .then → лог 3, return Promise.resolve() ставит второй .then в конец микроочереди. Второй .then → лог 4. Очередь пуста → макрозадача → лог 2. Итого: 1 → 5 → 3 → 4 → 2.',
  },
  {
    id: 'q6',
    difficulty: 'hard',
    code: `async function foo() {
  console.log(2);
  await Promise.resolve();
  console.log(4);
}

console.log(1);
foo();
console.log(3);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 2 → 3 → 4', '1 → 2 → 4 → 3', '2 → 1 → 3 → 4', '1 → 4 → 2 → 3'],
    correct: 0,
    explanation:
      'log(1) синхронно. foo() вызывается: log(2) синхронно, затем await приостанавливает foo и ставит продолжение (log 4) как микрозадачу. log(3) синхронно. Стек пуст → микрозадача → log(4). Итого: 1 → 2 → 3 → 4.',
  },
];
