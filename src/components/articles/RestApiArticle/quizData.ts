import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'rest-1',
    difficulty: 'easy',
    question: 'Какой HTTP-метод используется для создания нового ресурса?',
    code: `// Регистрация нового пользователя
// Какой метод и URL?`,
    options: [
      'POST /users',
      'GET /users/create',
      'PUT /users',
      'CREATE /users',
    ],
    correct: 0,
    explanation:
      'POST создаёт новый ресурс в коллекции /users. Каждый вызов создаёт новую запись с новым id. GET /users/create — антипаттерн: глагол в URL. PUT /users без id неоднозначен. CREATE не существует в HTTP.',
  },
  {
    id: 'rest-2',
    difficulty: 'easy',
    question: 'Какой статус-код вернуть при успешном создании ресурса?',
    code: `app.post('/users', async (req, res) => {
  const user = await db.create(req.body);
  res.status(???).json(user);
});`,
    options: [
      '201 Created',
      '200 OK',
      '204 No Content',
      '202 Accepted',
    ],
    correct: 0,
    explanation:
      '201 Created — специально для успешного создания. 200 OK — для успешных GET/PUT/PATCH. 204 No Content — для DELETE без тела ответа. Разница важна: клиент по статус-коду понимает что именно произошло.',
  },
  {
    id: 'rest-3',
    difficulty: 'medium',
    question: 'Чем PATCH отличается от PUT?',
    code: `// Пользователь хочет изменить только email
// У него есть: { id: 42, name: "Alice", email: "old@mail.com", role: "admin" }`,
    options: [
      'PATCH обновляет только переданные поля, PUT заменяет весь объект',
      'PUT обновляет только поля, PATCH заменяет весь объект',
      'Они идентичны — можно использовать любой',
      'PUT для создания, PATCH для обновления',
    ],
    correct: 0,
    explanation:
      'PATCH /users/42 с { "email": "new@mail.com" } — обновит только email, остальное не тронет. PUT /users/42 должен содержать полный объект: если не передать role — она обнулится. На практике PATCH используется чаще, потому что не требует передавать всё.',
  },
  {
    id: 'rest-4',
    difficulty: 'easy',
    question: 'Какой URL правильно спроектирован по REST-конвенциям?',
    code: `// Получить все заказы пользователя с id=42`,
    options: [
      'GET /users/42/orders',
      'GET /getUserOrders?userId=42',
      'POST /getOrders с телом { "userId": 42 }',
      'GET /orders/byUser/42',
    ],
    correct: 0,
    explanation:
      'В REST URL — это иерархия ресурсов, не действий. /users/42/orders читается как "заказы пользователя 42" — это естественно и понятно. Глаголы в URL (getUserOrders, getOrders) — антипаттерн. POST для получения данных — тоже нарушение, GET cacheable, POST нет.',
  },
  {
    id: 'rest-5',
    difficulty: 'medium',
    question: 'Что означает идемпотентность HTTP-метода?',
    code: `// Выполнили 5 раз подряд:
DELETE /orders/99`,
    options: [
      'Результат одного и N запросов одинаков — повторные безопасны',
      'Запрос не изменяет данные на сервере',
      'Запрос кешируется браузером и прокси',
      'Запрос выполняется параллельно без конфликтов',
    ],
    correct: 0,
    explanation:
      'Идемпотентность: DELETE /orders/99 первый раз — удаляет заказ (204). Второй, третий раз — возвращает 404, но состояние системы то же (заказа нет). GET, PUT, DELETE идемпотентны. POST — нет: каждый POST /orders создаёт новый заказ.',
  },
  {
    id: 'rest-6',
    difficulty: 'medium',
    question: 'Какие из методов являются идемпотентными?',
    code: '',
    options: [
      'GET, PUT, DELETE — да; POST — нет',
      'GET, POST, PUT — да; DELETE — нет',
      'Только GET (остальные меняют данные)',
      'Все методы идемпотентны',
    ],
    correct: 0,
    explanation:
      'GET — безопасный и идемпотентный (только читает). PUT — идемпотентный (повторный PUT с теми же данными = тот же результат). DELETE — идемпотентный (повторный DELETE возвращает 404, но ресурса всё равно нет). POST — не идемпотентный: каждый создаёт новую запись.',
  },
  {
    id: 'rest-7',
    difficulty: 'medium',
    question: 'Чем 401 отличается от 403?',
    code: `// Случай A: пользователь не передал токен
// Случай B: пользователь передал токен, но он обычный юзер, а нужен admin`,
    options: [
      '401 — не аутентифицирован (нет/плохой токен), 403 — аутентифицирован, но нет прав',
      '401 — нет прав, 403 — не аутентифицирован',
      'Они означают одно и то же — выбор на усмотрение',
      '401 от приложения, 403 от nginx/прокси',
    ],
    correct: 0,
    explanation:
      '401 Unauthorized (неудачное название) — сервер не знает кто ты: токен отсутствует, истёк или невалиден. 403 Forbidden — сервер знает кто ты, но ты не имеешь права. Случай A = 401, случай B = 403. Это важно для фронта: 401 → редирект на логин, 403 → показать "нет доступа".',
  },
  {
    id: 'rest-8',
    difficulty: 'medium',
    question: 'Какой статус-код и тело вернуть при ошибке валидации?',
    code: `// POST /users с телом: { "name": "", "email": "not-email" }`,
    options: [
      '422 Unprocessable Entity + список ошибок по полям',
      '400 Bad Request + общее сообщение об ошибке',
      '200 OK + { "success": false, "error": "validation failed" }',
      '500 Internal Server Error',
    ],
    correct: 0,
    explanation:
      '422 — данные получены и распарсены, но семантически невалидны. Возвращай структурированный список ошибок по полям — это критично для фронта. 200 OK на ошибку — антипаттерн: клиент не поймёт что что-то пошло не так без проверки тела. 400 тоже приемлем, но 422 точнее.',
  },
  {
    id: 'rest-9',
    difficulty: 'easy',
    question: 'Что вернуть после успешного DELETE?',
    code: `app.delete('/users/:id', async (req, res) => {
  await db.delete(req.params.id);
  // что вернуть?
});`,
    options: [
      '204 No Content — пустой ответ',
      '200 OK с { "success": true }',
      '200 OK с удалённым объектом',
      '201 Created',
    ],
    correct: 0,
    explanation:
      '204 No Content — стандарт для DELETE: успешно, нечего возвращать. Не нужен { "success": true } — статус-код уже говорит об успехе. Иногда возвращают 200 с удалённым объектом, если клиенту нужны его данные для аудита — это тоже допустимо.',
  },
  {
    id: 'rest-10',
    difficulty: 'hard',
    question: 'API возвращает 10 000 пользователей за один запрос. Как исправить?',
    code: `// Сейчас:
GET /users → [...10000 объектов]`,
    options: [
      'Пагинация: GET /users?page=1&limit=20 или cursor-based ?after=id',
      'Включить gzip — он всё сожмёт',
      'Использовать POST /users/batch для больших выборок',
      'Кешировать ответ — это разовая проблема',
    ],
    correct: 0,
    explanation:
      'Пагинация — обязательна. Два вида: offset (?page=2&limit=20, но нестабильна при частых INSERT) и cursor-based (?after=last_id, стабильна). Заголовки Link или поле meta: { total, nextCursor } помогают клиенту навигировать. 10K объектов за раз — memory leak, медленный рендер, большой трафик.',
  },
  {
    id: 'rest-11',
    difficulty: 'medium',
    question: 'Как правильно версионировать REST API?',
    code: `// Нужно добавить поле phone в /users
// Но старые клиенты его не ждут`,
    options: [
      'Версия в URL: /v1/users → /v2/users (самый распространённый способ)',
      'Менять ответ без версионирования — клиенты должны адаптироваться',
      'Версия в теле запроса: { "version": 2, "data": {...} }',
      'Версионирование не нужно — используй feature flags',
    ],
    correct: 0,
    explanation:
      '/v1/users — интуитивно, видно в логах и браузере, легко маршрутизировать. Альтернатива: Accept: application/vnd.api+json;version=2 (header-based) — чище, но сложнее. Главное: старая версия должна работать пока есть клиенты.',
  },
  {
    id: 'rest-12',
    difficulty: 'easy',
    question: 'Что такое rate limiting и какой статус-код он возвращает?',
    code: `// Клиент шлёт 1000 запросов в минуту`,
    options: [
      '429 Too Many Requests + заголовок Retry-After',
      '503 Service Unavailable',
      '400 Bad Request',
      '401 Unauthorized',
    ],
    correct: 0,
    explanation:
      '429 Too Many Requests — клиент превысил разрешённый лимит. Заголовок Retry-After: 60 говорит через сколько секунд можно повторить. Обычно добавляют X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset чтобы клиент видел текущий лимит.',
  },
  {
    id: 'rest-13',
    difficulty: 'hard',
    question: 'Клиент делает два одновременных POST /orders. Какой статус вернуть при дубликате?',
    code: `// Пользователь дважды нажал кнопку "Оплатить"
// В БД есть UNIQUE(user_id, product_id)`,
    options: [
      '409 Conflict — ресурс с такими данными уже существует',
      '400 Bad Request — некорректный запрос',
      '422 Unprocessable Entity — данные невалидны',
      '500 Internal Server Error',
    ],
    correct: 0,
    explanation:
      '409 Conflict — специально для ситуаций конфликта с текущим состоянием ресурса: дубликат, optimistic locking, попытка перевести деньги на закрытый счёт. Решение со стороны клиента: idempotency key (уникальный заголовок на запрос) — сервер дедуплицирует.',
  },
  {
    id: 'rest-14',
    difficulty: 'hard',
    question: 'Что нужно вернуть в заголовке при создании ресурса?',
    code: `// POST /users → 201 Created
// Что ещё вернуть кроме тела?`,
    options: [
      'Location: /users/43 — URL нового ресурса',
      'X-Created-Id: 43',
      'Redirect: /users/43',
      'Ничего лишнего — только тело с объектом',
    ],
    correct: 0,
    explanation:
      'Заголовок Location: /api/v1/users/43 — RFC 7231 стандарт для 201 Created. Он позволяет клиенту сразу знать где лежит новый ресурс без парсинга тела. Особенно важен для асинхронных операций: 202 Accepted + Location: /jobs/123 для отслеживания.',
  },
  {
    id: 'rest-15',
    difficulty: 'medium',
    question: 'Что не так с этим API-дизайном?',
    code: `GET  /api/getAllUsers
POST /api/createUser
POST /api/deleteUser?id=42
GET  /api/updateUserEmail?id=42&email=new@mail.com`,
    options: [
      'Глаголы в URL — действия должны выражаться методами HTTP, не путём',
      'Нужно добавить версионирование /v1/',
      'DELETE должен быть POST, а не GET',
      'Всё корректно — это тоже допустимый стиль',
    ],
    correct: 0,
    explanation:
      'GET /api/getAllUsers → GET /users. POST /api/createUser → POST /users. POST /api/deleteUser?id=42 → DELETE /users/42. GET /api/updateUserEmail → PATCH /users/42 с телом. Правило: URL — существительное (ресурс), метод — глагол (действие). Никаких get/create/delete/update в путях.',
  },
];
