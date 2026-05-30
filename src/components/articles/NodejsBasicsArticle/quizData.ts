import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'node1',
    difficulty: 'easy',
    question: 'Что такое Node.js?',
    options: [
      'Фреймворк для создания сайтов на JavaScript',
      'Среда выполнения JavaScript вне браузера, построенная на V8',
      'Язык программирования, похожий на JavaScript',
      'База данных для хранения JSON-документов',
    ],
    correct: 1,
    explanation:
      'Node.js — это runtime: он берёт V8 (JS-движок из Chrome) и добавляет к нему libuv (Event Loop, async I/O), а также API для работы с файловой системой, сетью, процессами. Это не фреймворк и не новый язык — ты пишешь обычный JavaScript, но выполняется он не в браузере.',
  },
  {
    id: 'node2',
    difficulty: 'easy',
    code: `// Что выведет этот код?
console.log('1');
fs.readFile('data.txt', (err, data) => {
  console.log('2');
});
console.log('3');`,
    question: 'В каком порядке выведутся числа?',
    options: [
      '1, 2, 3 — файл читается перед следующей строкой',
      '1, 3, 2 — readFile не блокирует, callback вызовется позже',
      '2, 1, 3 — файл имеет приоритет',
      'Порядок непредсказуем',
    ],
    correct: 1,
    explanation:
      'fs.readFile — асинхронная операция. Node.js передаёт её libuv и продолжает выполнение дальше. Поэтому сначала выводится 1, потом 3, а callback с "2" вызывается когда файл дочитан — после того как текущий код завершился. Это и есть non-blocking I/O.',
  },
  {
    id: 'node3',
    difficulty: 'medium',
    code: `// CPU-intensive задача в Node.js
app.get('/compute', (req, res) => {
  let result = 0;
  for (let i = 0; i < 1_000_000_000; i++) {
    result += i;
  }
  res.json({ result });
});`,
    question: 'Что произойдёт с другими запросами пока этот endpoint работает?',
    options: [
      'Ничего — Node.js многопоточный, другие запросы обработаются параллельно',
      'Node.js заблокируется: Event Loop занят, все остальные запросы встанут в очередь',
      'Node.js автоматически перенесёт вычисление в Worker Thread',
      'Запрос упадёт с таймаутом через 30 секунд',
    ],
    correct: 1,
    explanation:
      'JavaScript в Node.js однопоточный. Тяжёлый цикл блокирует Event Loop — в это время не обрабатываются ни новые HTTP-запросы, ни таймеры, ни callbacks. Это главная ловушка Node.js. Решение: Worker Threads, child_process или вынести вычисления в отдельный микросервис (например, на Python/Go).',
  },
  {
    id: 'node4',
    difficulty: 'medium',
    question: 'Зачем нужен package.json?',
    options: [
      'Это конфигурация для запуска Node.js сервера',
      'Описывает проект: зависимости, скрипты, версия, автор — манифест npm-пакета',
      'Содержит исходный код в JSON-формате для ускорения загрузки',
      'Это файл настроек базы данных для Node.js',
    ],
    correct: 1,
    explanation:
      'package.json — манифест проекта. Ключевые поля: name и version (идентификатор пакета), dependencies (что нужно в проде), devDependencies (что нужно только при разработке), scripts (npm run dev, npm test и т.д.). При npm install Node.js читает этот файл и скачивает все зависимости в node_modules.',
  },
  {
    id: 'node5',
    difficulty: 'hard',
    code: `// Node.js vs Apache (традиционный подход)
// 1000 одновременных запросов, каждый ждёт БД 100ms

// Apache (thread-per-request):
// 1000 запросов → 1000 потоков → ~1GB RAM
// Поток ждёт БД, но не освобождается

// Node.js (event-driven):
// 1000 запросов → 1 поток → ~50MB RAM
// Пока один запрос ждёт БД — обрабатываются другие`,
    question: 'Почему Node.js эффективнее Apache при I/O-heavy нагрузке?',
    options: [
      'Node.js использует быстрее алгоритм сортировки очереди запросов',
      'Node.js компилирует JavaScript в машинный код быстрее Apache компилирует PHP',
      'Ожидание I/O не занимает поток — один поток обслуживает тысячи соединений через Event Loop',
      'Node.js кэширует все ответы в оперативной памяти автоматически',
    ],
    correct: 2,
    explanation:
      'В модели thread-per-request каждый поток занимает ~1MB RAM и большую часть времени просто ждёт I/O (БД, файл, внешний API). Node.js использует один поток + Event Loop: когда запрос ждёт ответа от БД, поток свободен и обрабатывает другие запросы. Когда БД ответила — callback ставится в очередь. Это позволяет обслуживать тысячи соединений одним потоком.',
  },
];
