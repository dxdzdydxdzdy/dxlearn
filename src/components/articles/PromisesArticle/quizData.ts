import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'p1',
    difficulty: 'easy',
    code: `Promise.resolve(1).then(x => console.log(x));
console.log(2);`,
    question: 'В каком порядке выведутся числа?',
    options: ['1 → 2', '2 → 1', 'одновременно', 'только 2'],
    correct: 1,
    explanation:
      'Promise.resolve(1) уже выполнен, но .then() всегда регистрирует микрозадачу — она выполнится после синхронного кода. Сначала log(2), потом log(1).',
  },
  {
    id: 'p2',
    difficulty: 'easy',
    code: `Promise.resolve(5)
  .then(x => x * 2)
  .then(x => x + 1)
  .then(x => console.log(x));`,
    question: 'Что выведет console.log?',
    options: ['5', '10', '11', 'undefined'],
    correct: 2,
    explanation:
      '5 * 2 = 10, затем 10 + 1 = 11. Каждый .then() получает значение, возвращённое предыдущим, и передаёт результат дальше.',
  },
  {
    id: 'p3',
    difficulty: 'easy',
    code: `Promise.resolve(42)
  .finally(() => 100)
  .then(x => console.log(x));`,
    question: 'Что выведет console.log?',
    options: ['100', '42', 'undefined', 'ошибка'],
    correct: 1,
    explanation:
      '.finally() не меняет значение промиса: он всегда «прозрачно» передаёт исходное значение (или ошибку) следующему обработчику. Возвращаемое значение из .finally() игнорируется.',
  },
  {
    id: 'p4',
    difficulty: 'medium',
    code: `Promise.reject('oops')
  .catch(e => 'recovered: ' + e)
  .then(x => console.log(x));`,
    question: 'Что выведет console.log?',
    options: ['oops', 'recovered: oops', 'undefined', 'необработанная ошибка'],
    correct: 1,
    explanation:
      '.catch() поймал отклонение и вернул строку. После .catch() цепочка продолжается как обычный .then() — промис считается «восстановленным». Следующий .then() получает "recovered: oops".',
  },
  {
    id: 'p5',
    difficulty: 'medium',
    code: `Promise.resolve(1)
  .then(x => Promise.resolve(x + 1))
  .then(x => Promise.resolve(x + 1))
  .then(x => console.log(x));`,
    question: 'Что выведет console.log?',
    options: ['Promise {3}', '1', '3', 'undefined'],
    correct: 2,
    explanation:
      'Когда .then() возвращает промис — движок «разворачивает» его и передаёт в следующий .then() уже разрешённое значение, а не сам объект промиса. Итого: 1 → 2 → 3.',
  },
  {
    id: 'p6',
    difficulty: 'medium',
    code: `Promise.resolve()
  .then(() => { throw new Error('boom'); })
  .then(() => console.log('then'))
  .catch(e => console.log('catch:', e.message));`,
    question: 'Что выведет консоль?',
    options: ['"then"', '"catch: boom"', '"then" и "catch: boom"', 'ничего'],
    correct: 1,
    explanation:
      'throw внутри .then() превращает промис в отклонённый. Следующий .then() пропускается, управление переходит к первому .catch() в цепочке.',
  },
  {
    id: 'p7',
    difficulty: 'medium',
    code: `console.log(1);
Promise.all([
  Promise.resolve(10),
  Promise.resolve(20),
]).then(([a, b]) => console.log(a + b));
console.log(2);`,
    question: 'В каком порядке выведутся значения?',
    options: ['1 → 10 → 20 → 2', '1 → 2 → 30', '1 → 30 → 2', '30 → 1 → 2'],
    correct: 1,
    explanation:
      'Синхронно: 1, 2. Promise.all() разрешается как микрозадача после синхронного кода. .then() выводит 10 + 20 = 30. Порядок: 1 → 2 → 30.',
  },
  {
    id: 'p8',
    difficulty: 'hard',
    code: `async function foo() {
  const x = await Promise.resolve(10);
  console.log(x);
}
console.log(1);
foo();
console.log(2);`,
    question: 'В каком порядке выведутся значения?',
    options: ['1 → 10 → 2', '10 → 1 → 2', '1 → 2 → 10', '1 → 2'],
    correct: 2,
    explanation:
      'foo() вызывается синхронно: log(1) выполняется, затем foo() доходит до await и приостанавливается (регистрирует микрозадачу). Синхронно продолжается log(2). После опустошения стека — микрозадача: log(10).',
  },
  {
    id: 'p9',
    difficulty: 'hard',
    code: `Promise.all([
  Promise.resolve('a'),
  Promise.reject('b'),
  Promise.resolve('c'),
])
  .then(x => console.log('ok:', x))
  .catch(e => console.log('err:', e));`,
    question: 'Что выведет консоль?',
    options: ["ok: ['a', 'c']", "err: 'b'", "ok: ['a', undefined, 'c']", "ok: ['a', 'b', 'c']"],
    correct: 1,
    explanation:
      "Promise.all() немедленно отклоняется при первом же reject, игнорируя остальные промисы. Значение отклонения — причина первого reject, то есть 'b'.",
  },
  {
    id: 'p10',
    difficulty: 'hard',
    code: `async function fetchData() {
  try {
    const a = await Promise.reject(new Error('fail'));
    return a;
  } catch (e) {
    return 'fallback';
  } finally {
    console.log('cleanup');
  }
}
fetchData().then(x => console.log(x));`,
    question: 'Что выведет консоль?',
    options: ['"cleanup" → ошибка', '"cleanup" → "fallback"', '"fallback" → "cleanup"', 'только "cleanup"'],
    correct: 1,
    explanation:
      'await Promise.reject() бросает ошибку — catch её ловит и возвращает "fallback". finally выполняется всегда, до возврата значения: сначала "cleanup", потом .then() получает "fallback".',
  },
];
