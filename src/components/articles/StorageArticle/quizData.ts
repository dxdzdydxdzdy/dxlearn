import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'storage1',
    difficulty: 'easy',
    code: `// Пользователь открывает новую вкладку с тем же сайтом
sessionStorage.setItem('cart', JSON.stringify([{ id: 1 }]));
// Новая вкладка: sessionStorage.getItem('cart') → ?`,
    question: 'Что вернёт getItem в новой вкладке?',
    options: ['[{"id":1}]', 'null — sessionStorage не делится между вкладками', 'undefined', 'Зависит от браузера'],
    correct: 1,
    explanation:
      'sessionStorage изолирован по вкладкам — даже если это тот же домен, каждая вкладка имеет свой sessionStorage. При закрытии вкладки данные удаляются. localStorage же делится между всеми вкладками одного происхождения (origin = протокол + домен + порт).',
  },
  {
    id: 'storage2',
    difficulty: 'easy',
    code: `// Нужно хранить JWT токен для авторизации API-запросов
// Вариант 1: localStorage.setItem('token', jwt)
// Вариант 2: httpOnly cookie (устанавливает сервер)
// Вариант 3: sessionStorage.setItem('token', jwt)`,
    question: 'Какой вариант наиболее безопасен и почему?',
    options: [
      'localStorage — данные не теряются при перезагрузке',
      'sessionStorage — очищается при закрытии вкладки',
      'httpOnly cookie — JS не может прочитать, защита от XSS',
      'Все варианты одинаково безопасны',
    ],
    correct: 2,
    explanation:
      'httpOnly cookie недоступна из JavaScript вообще — XSS-атака не сможет украсть токен через document.cookie или через Storage API. localStorage и sessionStorage доступны любому JS на странице — если есть XSS уязвимость, токен утёкнет. Для auth токенов всегда httpOnly cookie + SameSite=Strict.',
  },
  {
    id: 'storage3',
    difficulty: 'medium',
    code: `// Куки отправляются с каждым запросом автоматически
document.cookie = 'theme=dark; max-age=2592000'; // 30 дней
// vs
localStorage.setItem('theme', 'dark');`,
    question: 'Когда лучше использовать cookie вместо localStorage для хранения темы?',
    options: [
      'Никогда — cookie устарели',
      'Когда сервер должен знать тему до отправки HTML (SSR без flicker)',
      'Когда нужно хранить данные больше 5MB',
      'Cookie автоматически шифруются, localStorage нет',
    ],
    correct: 1,
    explanation:
      'С localStorage тема применяется после загрузки JS — пользователь видит вспышку белого (FOUC — Flash Of Unstyled Content). С cookie — сервер читает тему в запросе и рендерит правильный HTML сразу. Именно поэтому Next.js-приложения часто хранят тему в cookie для SSR. localStorage лучше для данных, которые серверу не нужны.',
  },
  {
    id: 'storage4',
    difficulty: 'medium',
    code: `// IndexedDB для хранения большого объёма данных
const db = await openDB('my-app', 1, {
  upgrade(db) {
    db.createObjectStore('products', { keyPath: 'id' });
  },
});
await db.add('products', { id: 1, name: 'Phone', price: 999 });`,
    question: 'Когда использовать IndexedDB вместо localStorage?',
    options: [
      'IndexedDB всегда лучше — localStorage устарел',
      'Когда данных больше 5-10MB, нужны транзакции или индексы для поиска',
      'Только для PWA приложений',
      'Когда нужен синхронный API',
    ],
    correct: 1,
    explanation:
      'localStorage ограничен ~5-10MB и синхронен (блокирует main thread при больших данных). IndexedDB: асинхронный, поддерживает транзакции, индексы, хранение бинарных данных (Blob, File). Используй для: офлайн-кэша, больших коллекций, поиска по клиентским данным. Библиотека idb упрощает работу с IndexedDB.',
  },
  {
    id: 'storage5',
    difficulty: 'hard',
    code: `// Пользователь очищает кэш браузера
// Что происходит с данными?
localStorage.clear();        // явно, программно
// vs
// Пользователь: настройки → очистить данные сайта`,
    question: 'Какое хранилище НЕ очищается при "Clear site data" в браузере?',
    options: [
      'Все хранилища очищаются — нет исключений',
      'Cookies с флагом Secure',
      'localStorage очищается, IndexedDB нет',
      'Ни одно — "Clear site data" очищает всё включая cookies, localStorage, IndexedDB, Cache Storage',
    ],
    correct: 3,
    explanation:
      '"Clear site data" в DevTools или настройках браузера очищает всё: localStorage, sessionStorage, IndexedDB, Cache API (Service Worker), cookies. Именно поэтому не стоит хранить критические данные только на клиенте без возможности восстановления с сервера. Хорошая стратегия: localStorage как кэш, сервер как источник истины.',
  },
];
