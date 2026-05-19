import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'crp1',
    difficulty: 'easy',
    code: `<head>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js"></script>
</head>`,
    question: 'Что заблокирует первый рендер страницы?',
    options: [
      'Только styles.css',
      'Только app.js',
      'И styles.css, и app.js',
      'Ничего — браузер рендерит сразу',
    ],
    correct: 2,
    explanation:
      'CSS-файлы блокируют рендер (render-blocking), потому что браузер не знает, как выглядит страница без стилей. <script> без async/defer блокирует парсер HTML, а следовательно и рендер. Оба ресурса задерживают First Contentful Paint.',
  },
  {
    id: 'crp2',
    difficulty: 'easy',
    code: `<script src="analytics.js" async></script>
<script src="app.js" defer></script>`,
    question: 'В чём ключевое отличие async от defer?',
    options: [
      'async не блокирует парсер, defer блокирует',
      'async выполняется после DOMContentLoaded, defer — до',
      'defer гарантирует порядок выполнения; async — нет',
      'Разницы нет — оба загружают скрипт параллельно',
    ],
    correct: 2,
    explanation:
      'Оба атрибута загружают скрипт параллельно (не блокируя парсер). Разница в выполнении: async выполняется сразу при загрузке (порядок не гарантирован); defer — после парсинга HTML, перед DOMContentLoaded, в порядке появления в документе.',
  },
  {
    id: 'crp3',
    difficulty: 'medium',
    code: `// Браузер строит CSSOM
// В это время встречает:
<script src="heavy.js"></script>`,
    question: 'Как незавершённый CSSOM влияет на выполнение скрипта?',
    options: [
      'Скрипт выполняется немедленно, CSSOM достраивается параллельно',
      'Браузер ждёт завершения CSSOM перед выполнением скрипта',
      'Скрипт пропускается, CSSOM строится без задержки',
      'CSSOM отбрасывается, чтобы скрипт выполнился быстрее',
    ],
    correct: 1,
    explanation:
      'JS может читать и изменять стили через getComputedStyle(), поэтому браузер не может выполнять скрипт, пока CSSOM не завершён. Незавершённый CSSOM блокирует выполнение JS, что в свою очередь блокирует дальнейший парсинг HTML.',
  },
  {
    id: 'crp4',
    difficulty: 'medium',
    code: `<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="hero.jpg" as="image">`,
    question: 'Что делает rel="preload"?',
    options: [
      'Загружает ресурс с наивысшим приоритетом и применяет его немедленно',
      'Указывает браузеру загрузить ресурс заранее, не блокируя рендер',
      'Кэширует ресурс в Service Worker',
      'Заменяет тег <link rel="stylesheet">',
    ],
    correct: 1,
    explanation:
      'rel="preload" говорит браузеру: «загрузи этот ресурс как можно раньше, он понадобится скоро». Ресурс загружается в фоне с высоким приоритетом, но не применяется сразу (в отличие от stylesheet). Это устраняет задержку обнаружения критических ресурсов, таких как шрифты и изображения-герои.',
  },
  {
    id: 'crp5',
    difficulty: 'hard',
    code: `// Layout Thrashing
for (let i = 0; i < items.length; i++) {
  const h = items[i].offsetHeight; // чтение → форсирует layout
  items[i].style.height = h + 10 + 'px'; // запись → инвалидирует layout
}`,
    question: 'Почему этот код вызывает "layout thrashing"?',
    options: [
      'Цикл выполняется слишком долго',
      'offsetHeight — устаревшее свойство',
      'Чередование чтения и записи геометрии принудительно запускает layout на каждой итерации',
      'style.height нельзя менять в цикле',
    ],
    correct: 2,
    explanation:
      'Браузер откладывает layout, накапливая изменения. Но когда вы читаете геометрические свойства (offsetHeight, getBoundingClientRect и др.), он вынужден синхронно выполнить layout, чтобы вернуть актуальное значение. Запись сразу инвалидирует layout — и цикл провоцирует N синхронных layout. Решение: сначала все чтения, потом все записи (паттерн "batch reads/writes").',
  },
];
