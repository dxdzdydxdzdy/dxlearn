import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'wib1',
    difficulty: 'easy',
    question: 'V8 — это…',
    options: [
      'Rendering engine в Chrome',
      'JavaScript engine, используемый в Chrome, Node.js и Deno',
      'Форк WebKit, на котором работает Safari',
      'Название многопроцессной архитектуры Chrome',
    ],
    correct: 1,
    explanation:
      'V8 — JS-движок, разработанный Google. Используется в Chrome, Chromium-based браузерах, Node.js и Deno. Rendering engine в Chrome — это Blink (форк WebKit 2013 года). WebKit используется в Safari.',
  },
  {
    id: 'wib2',
    difficulty: 'easy',
    question: 'Зачем браузер запускает каждую вкладку в отдельном процессе?',
    options: [
      'Чтобы вкладки могли делиться памятью быстрее',
      'Чтобы crash одной вкладки не убивал весь браузер и sandboxing был возможен',
      'Это требование операционной системы для HTTPS-сайтов',
      'Для ускорения JavaScript — параллельное выполнение кода',
    ],
    correct: 1,
    explanation:
      'До Chrome (IE, ранний Firefox) всё работало в одном процессе: crash в одной вкладке = crash всего браузера. Chrome 2008 ввёл модель: каждый renderer процесс изолирован. Бонус: renderer process работает в sandbox — у него нет прямого доступа к файловой системе и ОС.',
  },
  {
    id: 'wib3',
    difficulty: 'medium',
    code: `// Blink получил этот тег в 2023 году:
<div style="container-type: inline-size">
  @container (min-width: 400px) { ... }
</div>`,
    question: 'Какой принцип определяет, кто реализует новые CSS-фичи и когда они появляются в браузерах?',
    options: [
      'W3C публикует спецификацию — браузеры обязаны реализовать за 6 месяцев',
      'Браузерные вендоры сами реализуют фичи в своих движках и потом предлагают в стандарт',
      'Фичи добавляются только когда все три движка договорятся одновременно',
      'Стандарты принимаются голосованием сообщества на GitHub',
    ],
    correct: 1,
    explanation:
      'Реализация и стандартизация идут параллельно — часто вендор сначала реализует фичу (часто с префиксом), получает обратную связь, и только потом это попадает в стандарт. CSS Container Queries разрабатывались командой Chrome несколько лет до попадания в W3C. Поэтому фичи появляются в разных браузерах в разное время — caniuse.com отслеживает это.',
  },
  {
    id: 'wib4',
    difficulty: 'medium',
    question: 'Что такое Site Isolation и зачем он появился?',
    options: [
      'Технология, запрещающая сайтам читать cookies других сайтов',
      'Ответ на Spectre: каждый cross-site iframe получает свой renderer process, чтобы нельзя было читать чужую память',
      'Функция приватного режима, изолирующая историю браузера',
      'Механизм CSP для запрета загрузки ресурсов с чужих доменов',
    ],
    correct: 1,
    explanation:
      'Spectre (2018) — уязвимость процессора, позволяющая через timing-атаку читать память другого процесса. Браузер ответил Site Isolation: даже cross-site iframe в одной вкладке запускается в отдельном renderer process. Это делает Spectre-атаки через браузер практически невозможными — чужая память в другом процессе физически недоступна.',
  },
  {
    id: 'wib5',
    difficulty: 'hard',
    code: `// Почему этот код в renderer process не может
// открыть файл напрямую?
const fs = require('fs'); // ReferenceError в браузере`,
    question: 'Renderer process работает в sandbox. Как сайт тогда может, например, скачать файл?',
    options: [
      'Никак — скачивание файлов заблокировано в современных браузерах',
      'Через WebAssembly, у которого есть доступ к файловой системе',
      'Renderer шлёт IPC-сообщение Browser Process, который уже имеет привилегии и выполняет операцию',
      'Service Worker получает специальный токен для доступа к файловой системе',
    ],
    correct: 2,
    explanation:
      'Renderer process в sandbox не имеет прямого доступа к ОС: нет файловой системы, нет сети напрямую, нет clipboard. Все привилегированные операции идут через IPC (inter-process communication) к Browser Process, который проверяет разрешения и выполняет операцию. Скачивание файла: renderer → IPC → Browser Process → OS. Это и есть принцип least privilege — renderer не может навредить системе даже если скомпрометирован.',
  },
];
