import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'auth-1',
    difficulty: 'easy',
    question: 'Из каких трёх частей состоит JWT?',
    code: `// Вот токен — что в нём за точками?
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiJ9
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    options: [
      'Header, Payload, Signature — алгоритм, данные, подпись',
      'Login, Data, Hash — учётные данные и хэш',
      'Type, Claims, MAC — в JSON-объекте',
      'Version, Body, Checksum — в hex-кодировке',
    ],
    correct: 0,
    explanation:
      'JWT = header.payload.signature. Header — алгоритм и тип (HS256/RS256). Payload — claims: sub, exp, роль, имя. Signature — HMAC или RSA подпись, гарантирует что токен не изменён. Всё в base64url, разделено точками.',
  },
  {
    id: 'auth-2',
    difficulty: 'easy',
    question: 'JWT — это…',
    code: `// Можно ли прочитать payload без ключа?
atob("eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiJ9")`,
    options: [
      'Закодированный (base64url) JSON — виден всем, но подписан',
      'Зашифрованный JSON — только сервер может прочитать',
      'Хэш пароля пользователя в base64',
      'Сессионный идентификатор в базе данных',
    ],
    correct: 0,
    explanation:
      'JWT не шифруется — payload виден любому на jwt.io без ключа. atob() вернёт {"sub":"42","role":"admin"}. Подпись лишь гарантирует что данные не изменены. Никогда не кладите в JWT пароли, номера карт или другие секреты.',
  },
  {
    id: 'auth-3',
    difficulty: 'easy',
    question: 'Как передавать JWT в HTTP-запросе к API?',
    code: `// Обращаемся к защищённому эндпоинту
// Куда поместить токен?`,
    options: [
      'Authorization: Bearer <token>',
      'X-Auth-Token: <token>',
      'Query-параметр: GET /users?token=<token>',
      'В теле запроса: { "token": "..." }',
    ],
    correct: 0,
    explanation:
      'Authorization: Bearer — стандарт RFC 6750. Сервер читает req.headers.authorization.split(" ")[1]. Query-параметр — антипаттерн: токен попадает в логи сервера, nginx и историю браузера. Для веб-приложений альтернатива — httpOnly cookie (устанавливается сервером).',
  },
  {
    id: 'auth-4',
    difficulty: 'medium',
    question: 'Зачем использовать два токена — access и refresh?',
    code: `// Access TTL:  15 минут
// Refresh TTL: 30 дней`,
    options: [
      'Access короткий (безопасность), Refresh для получения нового access без повторного логина',
      'Access для GET-запросов, Refresh для POST/PUT',
      'Access для мобильных приложений, Refresh для браузеров',
      'Access содержит данные, Refresh — только идентификатор',
    ],
    correct: 0,
    explanation:
      'Короткий access (15 мин) ограничивает ущерб от утечки — устареет быстро. Refresh (30 дней) хранится безопаснее (httpOnly cookie, защищённое хранилище устройства). При истечении access — клиент запрашивает новый через refresh без повторного ввода пароля.',
  },
  {
    id: 'auth-5',
    difficulty: 'medium',
    question: 'Где безопаснее всего хранить JWT в браузере?',
    code: `// Вариант A:
localStorage.setItem('token', jwt);

// Вариант B:
document.cookie = 'token=' + jwt;

// Вариант C: httpOnly cookie (устанавливает сервер)
res.cookie('token', jwt, { httpOnly: true });`,
    options: [
      'httpOnly cookie (C) — JS не может прочитать, защита от XSS',
      'localStorage (A) — удобно, доступно везде',
      'Обычный cookie (B) — безопаснее localStorage',
      'Все варианты одинаково безопасны',
    ],
    correct: 0,
    explanation:
      'httpOnly cookie: браузер отправляет автоматически, JS (включая XSS-скрипт) не может прочитать через document.cookie. localStorage уязвим к XSS — любой JS на странице имеет доступ. Минус httpOnly — риск CSRF (лечится SameSite=Strict/Lax или CSRF-токеном).',
  },
  {
    id: 'auth-6',
    difficulty: 'hard',
    question: 'Как инвалидировать JWT до истечения exp?',
    code: `// Пользователь нажал "Выйти"
// или аккаунт заблокирован администратором
// access TTL = 15 min, refresh TTL = 30 days`,
    options: [
      'Token blacklist в Redis — хранить jti до exp, проверять при каждом запросе',
      'Удалить токен из localStorage — клиент не отправит, сервер не знает',
      'JWT нельзя инвалидировать — это архитектурный недостаток',
      'Сменить JWT_SECRET — сбросит все сессии немедленно',
    ],
    correct: 0,
    explanation:
      'Blacklist: сохраняешь jti в Redis с TTL = exp токена. При каждом запросе проверяешь. Удаление на клиенте не защищает от атакующего с украденным токеном. Смена секрета — ядерный вариант, сломает всех сразу. Правильный подход: короткий TTL access + rotation делают blacklist менее критичным.',
  },
  {
    id: 'auth-7',
    difficulty: 'hard',
    question: 'Что такое уязвимость "alg:none"?',
    code: `// Атакующий модифицирует header токена:
// { "alg": "HS256" } → { "alg": "none" }
// и убирает подпись (третью часть)`,
    options: [
      'Уязвимые библиотеки принимают токен без проверки подписи при alg:none',
      'Сервер отклоняет токен с неизвестным алгоритмом автоматически',
      'Клиент не может декодировать payload без указания алгоритма',
      'base64url декодирование ломается при alg:none',
    ],
    correct: 0,
    explanation:
      'alg:none означает "подпись не нужна". Уязвимые библиотеки принимали такие токены без верификации — атакующий создавал произвольный payload с любыми claims. Защита: явно задавать список разрешённых алгоритмов при верификации: jwt.verify(token, secret, { algorithms: ["HS256"] }).',
  },
  {
    id: 'auth-8',
    difficulty: 'hard',
    question: 'Что такое Refresh Token Rotation?',
    code: `// POST /auth/refresh
// Cookie: refreshToken=old-token-abc
// → ???`,
    options: [
      'Каждое использование refresh выдаёт новый refresh, старый инвалидируется',
      'Refresh токен меняет алгоритм подписи каждый раз',
      'Сервер выбирает случайный из нескольких refresh токенов',
      'Refresh хранится в localStorage и перезаписывается при каждом запросе',
    ],
    correct: 0,
    explanation:
      'Rotation: при каждом обновлении получаешь не только новый access, но и новый refresh (старый инвалидируется). Если украденный refresh попытаются использовать повторно — сервер увидит "reuse" и может заблокировать всю сессию. Это механизм обнаружения компрометации токена.',
  },
  {
    id: 'auth-9',
    difficulty: 'medium',
    question: 'Пользователь получил роль "admin". Когда JWT отразит изменение?',
    code: `// В БД роль обновлена: user → admin
// Текущий JWT содержит: { role: "user", exp: +14min }`,
    options: [
      'Только после выдачи нового токена (логин или refresh)',
      'Немедленно — JWT обращается к БД при каждом запросе',
      'Через 5 секунд — JWT кешируется на сервере',
      'JWT автоматически перевыпускается при изменении данных пользователя',
    ],
    correct: 0,
    explanation:
      'JWT stateless — сервер не ходит в БД при верификации. Claims "заморожены" до истечения токена. С 15-минутным TTL максимальный рассинхрон — 15 минут. Для критичных изменений (блокировка аккаунта) используй blacklist: добавь jti в Redis немедленно.',
  },
  {
    id: 'auth-10',
    difficulty: 'easy',
    question: 'Какой HTTP-статус вернуть при истёкшем или невалидном JWT?',
    code: `// jwt.verify() бросает TokenExpiredError
// Что вернуть клиенту?`,
    options: [
      '401 Unauthorized — сервер не знает кто ты, нужна аутентификация',
      '403 Forbidden — токен есть, но прав нет',
      '400 Bad Request — неверный формат токена',
      '498 Invalid Token (нестандартный)',
    ],
    correct: 0,
    explanation:
      '401 — "не знаю кто ты": токен истёк, невалиден или отсутствует. Это сигнал клиенту: попробуй обновить через refresh. 403 — "знаю кто ты, но нельзя": токен валиден, но роль/права не позволяют. Важно различать для корректной обработки на фронте.',
  },
  {
    id: 'auth-11',
    difficulty: 'medium',
    question: 'Сессии vs JWT: когда предпочесть сессии?',
    code: `// Требования:
// - мгновенная блокировка пользователя
// - монолитное приложение
// - нет нескольких сервисов`,
    options: [
      'Сессии лучше при нужде в мгновенной инвалидации и монолитной архитектуре',
      'JWT всегда лучше — сессии устарели',
      'Сессии для мобильных, JWT для браузеров',
      'Сессии если нет Redis, JWT если Redis есть',
    ],
    correct: 0,
    explanation:
      'Сессии: stateful, мгновенная инвалидация (удали из Redis — готово), централизованное состояние. JWT: stateless, горизонтальное масштабирование без общего хранилища сессий, подходит для микросервисов. Для монолита с instant-revoke — сессии проще и надёжнее.',
  },
  {
    id: 'auth-12',
    difficulty: 'medium',
    question: 'Зачем claim "jti" в JWT?',
    code: `{
  "sub": "42",
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "exp": 1716801800
}`,
    options: [
      'Уникальный ID токена — для blacklist и обнаружения reuse при rotation',
      'JSON Token Interface — тип клиентского интерфейса',
      'Junior Token Index — порядковый номер в серии',
      'JWT Issuer — сервис выдавший токен (дублирует iss)',
    ],
    correct: 0,
    explanation:
      'jti (JWT ID) — уникальный UUID токена. Нужен для: blacklist (сохрани jti при logout, проверяй каждый запрос), и refresh rotation (отследи что каждый refresh использован только один раз). Без jti невозможно инвалидировать конкретный токен среди всех активных.',
  },
  {
    id: 'auth-13',
    difficulty: 'hard',
    question: 'Когда использовать RS256 вместо HS256?',
    code: `// HS256 = HMAC-SHA256 — симметричный
// один секрет для подписи и верификации

// RS256 = RSA-SHA256 — асимметричный
// private key подписывает, public key верифицирует`,
    options: [
      'RS256 если несколько сервисов верифицируют токен — они получают только public key',
      'RS256 быстрее — нужен для высоконагруженных сервисов',
      'RS256 только для мобильных приложений',
      'HS256 и RS256 взаимозаменяемы — выбор не важен',
    ],
    correct: 0,
    explanation:
      'HS256: все сервисы должны знать один секрет — риск утечки. RS256: auth-сервис подписывает private key, все остальные сервисы верифицируют через public key (можно раздавать открыто через JWKS endpoint /.well-known/jwks.json). Идеально для микросервисов и OAuth2/OIDC.',
  },
  {
    id: 'auth-14',
    difficulty: 'medium',
    question: 'Что нельзя хранить в JWT payload?',
    code: `// Что из этого безопасно положить в payload?
// A: user_id, role
// B: email, display_name
// C: password_hash, card_number, api_secret`,
    options: [
      'Пароли, токены, номера карт — payload виден всем без ключа',
      'user_id и роль — они могут изменится',
      'email — персональные данные нельзя в токен',
      'Всё перечисленное безопасно в JWT',
    ],
    correct: 0,
    explanation:
      'JWT payload — это base64url, не шифрование. Любой с токеном может декодировать его на jwt.io. Кладите только то, что клиент "должен знать": id, роль, email. Никогда: пароли (даже хэши), секреты API, PAN карты, приватные данные. Принцип минимальной необходимости.',
  },
  {
    id: 'auth-15',
    difficulty: 'easy',
    question: 'Что делает next() в Express middleware после успешной верификации JWT?',
    code: `function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // ???
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}`,
    options: [
      'Передаёт управление следующему middleware или route handler в цепочке',
      'Завершает HTTP-соединение и закрывает сокет',
      'Повторно верифицирует токен для надёжности',
      'Очищает req.user перед следующим запросом',
    ],
    correct: 0,
    explanation:
      'next() передаёт управление следующему в цепочке: middleware или route handler. Без вызова next() и без res.send/json запрос "зависнет". Паттерн: проверяй → кидай 401 при ошибке → кладь данные в req.user → вызывай next() для продолжения в route handler.',
  },
];
