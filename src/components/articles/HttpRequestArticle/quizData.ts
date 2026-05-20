import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'http1',
    difficulty: 'easy',
    code: `fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alex' }),
});`,
    question: 'Почему нужен заголовок Content-Type: application/json?',
    options: [
      'Без него fetch вернёт ошибку',
      'Сервер не знает, как парсить тело запроса',
      'Он шифрует тело запроса',
      'Он нужен только для GET-запросов',
    ],
    correct: 1,
    explanation:
      'Content-Type сообщает серверу формат тела. Без него сервер может получить строку "{"name":"Alex"}" и не понять, что это JSON — не вызовет JSON.parse автоматически. Типичная ошибка: POST отправлен, но сервер вернул 400 Bad Request именно из-за отсутствия этого заголовка.',
  },
  {
    id: 'http2',
    difficulty: 'easy',
    code: `// Ответ сервера:
// HTTP/1.1 401 Unauthorized
// HTTP/1.1 403 Forbidden`,
    question: 'В чём разница между 401 и 403?',
    options: [
      '401 и 403 — одно и то же, просто разные серверы',
      '401 — не аутентифицирован (нет токена), 403 — аутентифицирован, но нет прав',
      '401 — ошибка сервера, 403 — ошибка клиента',
      '403 — токен просрочен, 401 — токен неверный',
    ],
    correct: 1,
    explanation:
      '401 Unauthorized = "Я не знаю кто ты — войди в систему". 403 Forbidden = "Я знаю кто ты, но у тебя нет прав на этот ресурс". На практике: 401 → редирект на /login, 403 → показать страницу "Доступ запрещён".',
  },
  {
    id: 'http3',
    difficulty: 'medium',
    code: `// Браузер отправляет запрос с localhost:3000
// на api.example.com
// Сервер не возвращает CORS-заголовки`,
    question: 'Что произойдёт с запросом?',
    options: [
      'Запрос выполнится, но без cookies',
      'Браузер заблокирует ответ — CORS error',
      'Сервер заблокирует запрос',
      'Запрос выполнится нормально — CORS только для production',
    ],
    correct: 1,
    explanation:
      'CORS (Cross-Origin Resource Sharing) — браузерная политика. Сервер получит запрос и вернёт ответ, но браузер откажется его передавать JS-коду без заголовка Access-Control-Allow-Origin. Сервер должен явно разрешить кросс-доменные запросы.',
  },
  {
    id: 'http4',
    difficulty: 'medium',
    code: `// Хранение JWT токена
// Вариант 1: localStorage.setItem('token', jwt)
// Вариант 2: httpOnly cookie (устанавливает сервер)`,
    question: 'Почему httpOnly cookie безопаснее для хранения JWT?',
    options: [
      'Cookie шифрует токен, localStorage нет',
      'httpOnly cookie недоступна из JavaScript — XSS не сможет её украсть',
      'Cookie автоматически истекает через 24 часа',
      'localStorage ограничен 5MB',
    ],
    correct: 1,
    explanation:
      'XSS-атака — вредоносный JS на странице читает localStorage и крадёт токен. httpOnly cookie JS прочитать не может вообще — браузер отправляет её с запросами автоматически, но скрипту она недоступна. Поэтому auth-токены лучше хранить в httpOnly cookie, а не в localStorage.',
  },
  {
    id: 'http5',
    difficulty: 'hard',
    code: `// DELETE /api/users/42 → 204 No Content
const res = await fetch('/api/users/42', { method: 'DELETE' });
console.log(await res.json()); // ?`,
    question: 'Что вернёт res.json() при ответе 204?',
    options: [
      '{}',
      'null',
      'Выбросит ошибку — тела нет',
      '"deleted"',
    ],
    correct: 2,
    explanation:
      '204 No Content означает, что тела ответа нет. Вызов res.json() попытается распарсить пустую строку как JSON и выбросит SyntaxError. Правильная обработка: проверить res.status === 204 и не вызывать res.json(). Или использовать res.ok и условно парсить.',
  },
];
