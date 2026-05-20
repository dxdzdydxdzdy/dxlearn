import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'browser1',
    difficulty: 'easy',
    code: `<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.googleapis.com">`,
    question: 'Зачем добавлять dns-prefetch и preconnect для сторонних ресурсов?',
    options: [
      'Чтобы шрифты загружались без CORS ошибок',
      'Чтобы браузер заранее сделал DNS и TCP/TLS — сократить задержку при загрузке шрифтов',
      'Это обязательно для HTTPS ресурсов',
      'Это увеличивает приоритет загрузки ресурса',
    ],
    correct: 1,
    explanation:
      'dns-prefetch делает DNS lookup заранее (~20-120ms экономии). preconnect дополнительно делает TCP и TLS handshake (~100-200ms экономии). Для Google Fonts и других CDN это заметно ускоряет первую загрузку страницы.',
  },
  {
    id: 'browser2',
    difficulty: 'easy',
    code: `// Devtools → Network → первый HTML-запрос
// Waiting (TTFB): 1.2s
// Content Download: 0.05s`,
    question: 'TTFB = 1.2s — что это значит и где искать проблему?',
    options: [
      'Медленный интернет у пользователя',
      'Сервер долго генерирует ответ — медленная БД, тяжёлая логика или нет кэша',
      'Слишком большой HTML-файл',
      'Проблема с TLS-сертификатом',
    ],
    correct: 1,
    explanation:
      'TTFB (Time to First Byte) — время от запроса до первого байта ответа. Долгий TTFB = медленный сервер. Причины: N+1 запросы в БД, отсутствие кэша (Redis), тяжёлые вычисления. Content Download 0.05s означает что сам файл маленький — проблема именно в серверной логике.',
  },
  {
    id: 'browser3',
    difficulty: 'medium',
    code: `// Порядок ресурсов в <head>:
<script src="analytics.js"></script>
<link rel="stylesheet" href="styles.css">`,
    question: 'Что происходит с парсингом HTML, когда браузер встречает этот script?',
    options: [
      'Скрипт загружается параллельно, парсинг продолжается',
      'Парсер останавливается, ждёт загрузки и выполнения script, затем парсит дальше',
      'Парсер пропускает script и продолжает',
      'Браузер сначала загружает styles.css, потом script',
    ],
    correct: 1,
    explanation:
      'Script без async/defer блокирует HTML-парсер: браузер останавливается, загружает JS, выполняет его, и только потом продолжает парсить. При этом analytics.js стоит до styles.css — это ещё хуже: выполнение JS может обратиться к CSSOM, которого ещё нет. Решение: async/defer или перенос в конец body.',
  },
  {
    id: 'browser4',
    difficulty: 'medium',
    code: `// HTTP/1.1: браузер делает max ~6 параллельных запросов на домен
// HTTP/2: мультиплексирование — все запросы по одному соединению`,
    question: 'Как HTTP/2 мультиплексирование влияет на практику оптимизации?',
    options: [
      'С HTTP/2 нужно объединять все JS в один файл ещё больше',
      'С HTTP/2 domain sharding (спредить ресурсы по поддоменам) становится антипаттерном',
      'С HTTP/2 нельзя использовать CDN',
      'Разницы нет — браузер всё равно ограничивает параллельные соединения',
    ],
    correct: 1,
    explanation:
      'В HTTP/1.1 у браузера лимит ~6 соединений на домен — поэтому делали domain sharding: раскидывали ресурсы по img1.cdn.com, img2.cdn.com. В HTTP/2 все запросы идут по одному соединению параллельно, поэтому domain sharding только добавляет overhead от TLS handshake для каждого домена.',
  },
  {
    id: 'browser5',
    difficulty: 'hard',
    code: `// Service Worker перехватывает все запросы
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached ?? fetch(e.request)
    )
  );
});`,
    question: 'Какой этап браузерного journey перехватывает Service Worker?',
    options: [
      'После DNS lookup, до TCP handshake',
      'После получения HTML, до парсинга',
      'До DNS lookup — перехватывает сетевые запросы на уровне браузера',
      'После рендера, до отображения пикселей',
    ],
    correct: 2,
    explanation:
      'Service Worker работает как прокси на уровне браузера — перехватывает fetch-запросы ещё до того, как они уйдут в сеть. Поэтому можно отдать кэшированный ответ без единого сетевого запроса, полностью пропустив DNS, TCP, TLS и HTTP этапы. Именно это делает PWA работающими офлайн.',
  },
];
