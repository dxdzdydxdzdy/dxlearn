import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'exp1',
    difficulty: 'easy',
    code: `app.get('/users', (req, res) => {
  res.json({ users: [] });
});`,
    question: 'Что произойдёт если отправить POST-запрос на /users?',
    options: [
      'Выполнится этот обработчик — метод не важен',
      'Express вернёт 404, потому что POST /users не зарегистрирован',
      'Express вернёт 405 Method Not Allowed',
      'Запрос зависнет и не получит ответа',
    ],
    correct: 1,
    explanation:
      'app.get() регистрирует обработчик только для GET-запросов. POST /users — другой маршрут. Express пройдёт по всем зарегистрированным маршрутам, не найдёт совпадения и вернёт 404. Чтобы обрабатывать POST, нужен отдельный app.post(\'/users\', ...).',
  },
  {
    id: 'exp2',
    difficulty: 'easy',
    code: `app.get('/users/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.query.format);
  res.json({});
});
// GET /users/42?format=json`,
    question: 'Что выведет console.log для запроса GET /users/42?format=json?',
    options: [
      'req.params.id → "42", req.query.format → undefined',
      'req.params.id → 42 (число), req.query.format → "json"',
      'req.params.id → "42", req.query.format → "json"',
      'req.params.id → ":id", req.query.format → "json"',
    ],
    correct: 2,
    explanation:
      'req.params содержит параметры из URL-пути — :id → "42" (всегда строка, даже если выглядит как число). req.query содержит параметры после ? — format → "json". Важно: всё это строки. Если нужно число — parseInt(req.params.id).',
  },
  {
    id: 'exp3',
    difficulty: 'medium',
    code: `// Порядок middleware:
app.use(logger);
app.use(express.json());
app.post('/data', handler);

// logger вызывает next(), express.json() вызывает next()
// В handler пытаемся прочитать req.body`,
    question: 'Что будет в req.body внутри handler?',
    options: [
      'undefined — body доступен только через отдельную библиотеку',
      'Строка с JSON — нужно вызвать JSON.parse вручную',
      'Распарсенный объект — express.json() уже разобрал тело запроса',
      'Buffer с сырыми байтами тела запроса',
    ],
    correct: 2,
    explanation:
      'express.json() — встроенный middleware который читает тело запроса и кладёт распарсенный объект в req.body. Он стоит перед handler в цепочке и вызывает next(), поэтому когда управление доходит до handler — req.body уже готов. Без express.json() — req.body был бы undefined.',
  },
  {
    id: 'exp4',
    difficulty: 'medium',
    code: `app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    res.status(401).json({ error: 'Нет токена' });
    return; // ← зачем здесь return?
  }
  next();
});`,
    question: 'Зачем нужен return после res.status(401).json()?',
    options: [
      'Без return ответ не отправится',
      'Чтобы остановить выполнение функции — иначе после json() выполнится next() и middleware продолжится',
      'return нужен только в async функциях',
      'Это стилистическое соглашение, на работу не влияет',
    ],
    correct: 1,
    explanation:
      'res.json() отправляет ответ, но не останавливает функцию. Без return код продолжит выполняться и дойдёт до next() — что попытается передать управление следующему middleware уже после отправленного ответа. Это вызовет ошибку "Cannot set headers after they are sent". return просто останавливает выполнение функции после отправки ответа.',
  },
  {
    id: 'exp5',
    difficulty: 'hard',
    code: `// Обработчик ошибок в Express — 4 параметра:
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Чтобы попасть в него из обычного маршрута:
app.get('/fail', (req, res, next) => {
  next(new Error('Что-то сломалось'));
});`,
    question: 'Почему обработчик ошибок должен иметь именно 4 параметра (err, req, res, next)?',
    options: [
      'Это просто соглашение — можно написать любое количество',
      'Express определяет тип middleware по количеству параметров: 4 = error handler',
      'err нужен для логирования, остальные можно не использовать',
      'Четвёртый параметр next обязателен для передачи ошибки дальше',
    ],
    correct: 1,
    explanation:
      'Express смотрит на количество параметров функции (Function.length) чтобы различать обычный middleware (3 параметра) и error handler (4 параметра). Это внутренняя договорённость фреймворка. Если написать (err, req, res) — три параметра — Express будет считать это обычным middleware и не вызовет его для ошибок.',
  },
];
