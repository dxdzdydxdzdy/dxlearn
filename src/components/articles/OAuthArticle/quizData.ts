import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'oauth-1',
    difficulty: 'easy',
    question: 'В чём разница между аутентификацией и авторизацией?',
    code: `// А: "Войти через Google" — кто ты?
// Б: "Разрешить Spotify публиковать в Twitter" — что можно?`,
    options: [
      'Аутентификация — кто ты (identity), авторизация — что тебе можно (permissions)',
      'Аутентификация — что можно, авторизация — кто ты',
      'Это синонимы, разница только терминологическая',
      'Аутентификация — для людей, авторизация — для сервисов',
    ],
    correct: 0,
    explanation:
      'Аутентификация (AuthN): подтверждение личности — "докажи кто ты". OAuth 2.0 — про авторизацию (AuthZ): "делегируй доступ без передачи пароля". OpenID Connect добавляет слой аутентификации поверх OAuth 2.0.',
  },
  {
    id: 'oauth-2',
    difficulty: 'easy',
    question: 'Для чего нужен OAuth 2.0?',
    code: `// Пользователь хочет дать Figma доступ к его Google Drive
// Без OAuth: поделиться паролем Google
// С OAuth: ???`,
    options: [
      'Делегированная авторизация — дать доступ без передачи пароля',
      'Шифрование паролей при передаче',
      'Хранение токенов в безопасном хранилище',
      'Аутентификация через fingerprint и Face ID',
    ],
    correct: 0,
    explanation:
      'OAuth 2.0 решает задачу делегирования: пользователь разрешает Figma читать только определённые файлы Google Drive, не передавая пароль. Google спрашивает пользователя, пользователь соглашается, Figma получает ограниченный токен.',
  },
  {
    id: 'oauth-3',
    difficulty: 'medium',
    question: 'Почему Authorization Code Flow безопаснее Implicit Flow?',
    code: `// Implicit Flow (устаревший):
// → access_token сразу в URL: /callback#token=eyJ...

// Authorization Code Flow:
// → /callback?code=abc123 (короткоживущий код)`,
    options: [
      'Код обменивается на токен в backend — токен не попадает в браузер, логи, Referer',
      'Authorization Code использует более длинный токен',
      'Implicit не поддерживает refresh токены, Code поддерживает',
      'Authorization Code работает быстрее',
    ],
    correct: 0,
    explanation:
      'Implicit: access_token в URL-фрагменте — попадает в историю браузера, JS, Referer. Authorization Code: в URL только короткоживущий одноразовый code, обмен на токен происходит server-to-server с client_secret. Implicit официально устарел в OAuth 2.1.',
  },
  {
    id: 'oauth-4',
    difficulty: 'medium',
    question: 'Для чего нужен PKCE?',
    code: `// SPA или мобильное приложение:
// Нет backend — нельзя хранить client_secret
// Authorization Code Flow без PKCE: уязвим к перехвату code`,
    options: [
      'Защита от перехвата authorization code — без хранения client_secret',
      'Ускорение обмена code на token',
      'Шифрование state параметра',
      'Авторизация без redirect — для CLI приложений',
    ],
    correct: 0,
    explanation:
      'PKCE (Proof Key for Code Exchange): клиент генерирует code_verifier (случайная строка), вычисляет code_challenge = base64url(SHA256(verifier)). При auth запросе отправляет challenge, при token запросе — verifier. Если code перехватили — без verifier обменять нельзя.',
  },
  {
    id: 'oauth-5',
    difficulty: 'medium',
    question: 'Чем id_token отличается от access_token?',
    code: `// OpenID Connect возвращает оба:
{
  "access_token": "ya29.a0ARrdaM...",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}`,
    options: [
      'id_token — кто пользователь (identity JWT), access_token — что можно делать (API)',
      'access_token — JWT, id_token — непрозрачная строка',
      'id_token для backend, access_token для frontend',
      'Они идентичны, разные названия одного объекта',
    ],
    correct: 0,
    explanation:
      'id_token (OIDC): JWT с identity claims — sub, email, name, picture. Для вашего приложения — "кто зашёл". access_token: для обращения к Resource Server (Google API). id_token проверяется клиентом, access_token используется как Bearer при API запросах. Не используйте id_token для авторизации API.',
  },
  {
    id: 'oauth-6',
    difficulty: 'hard',
    question: 'Зачем нужен параметр state в OAuth запросе?',
    code: `// GET /authorize?
//   response_type=code
//   &client_id=xxx
//   &redirect_uri=https://app.com/callback
//   &state=random_csrf_token_here  // зачем?`,
    options: [
      'CSRF защита: сервер проверяет что callback пришёл от реального запроса клиента',
      'Хранение данных пользователя между шагами',
      'Шифрование authorization code',
      'Идентификатор сессии OAuth провайдера',
    ],
    correct: 0,
    explanation:
      'state: случайная непредсказуемая строка. Клиент сохраняет её до редиректа, Auth Server возвращает обратно в callback. Клиент сверяет: state совпадает? Если нет — CSRF атака. Без state атакующий может подставить свой code в ваш callback.',
  },
  {
    id: 'oauth-7',
    difficulty: 'easy',
    question: 'Какие scopes нужны для базового "Войти через Google"?',
    code: `// Нужно только узнать кто пользователь
// email и имя — достаточно`,
    options: [
      'openid email profile',
      'read:user write:user',
      'https://www.googleapis.com/auth/gmail',
      'offline_access calendar.readonly',
    ],
    correct: 0,
    explanation:
      'openid — активирует OpenID Connect, возвращает id_token. email — email пользователя. profile — имя, аватар. Это минимальный набор для аутентификации. Никогда не запрашивай лишние scopes — пользователь увидит расширенный запрос разрешений и может отказать.',
  },
  {
    id: 'oauth-8',
    difficulty: 'medium',
    question: 'Authorization code можно использовать несколько раз?',
    code: `// Получили code=abc123 в callback
// Обменяли на токены — успешно
// Пытаемся обменять второй раз...`,
    options: [
      'Нет — одноразовый, короткоживущий (обычно 10 мин), повторный обмен → ошибка',
      'Да — можно обменивать пока не истечёт TTL',
      'Да — но только тот же client_id',
      'Нет — но можно продлить через refresh endpoint',
    ],
    correct: 0,
    explanation:
      'Authorization code: одноразовый и короткоживущий (~10 мин). После первого успешного обмена — инвалидируется. Попытка повторного использования должна вызывать отзыв всех выданных токенов (детектирование компрометации). Это защищает от перехвата code.',
  },
  {
    id: 'oauth-9',
    difficulty: 'hard',
    question: 'Что такое client_secret и где его хранить?',
    code: `// POST /token
// client_id=app123
// client_secret=???   // откуда взять?`,
    options: [
      'Секрет приложения — только в переменных окружения на сервере, никогда во frontend',
      'Публичный идентификатор — можно встраивать в код SPA',
      'Хешируется и хранится в localStorage',
      'Генерируется при каждом запросе из client_id',
    ],
    correct: 0,
    explanation:
      'client_secret — пароль вашего приложения у OAuth провайдера. Хранить только в env на backend. В SPA, мобильных или публичных клиентах client_secret нет — используется PKCE. Утечка client_secret = атакующий может выдавать себя за ваше приложение.',
  },
  {
    id: 'oauth-10',
    difficulty: 'medium',
    question: 'Что такое scope "offline_access"?',
    code: `// scope=openid email profile offline_access`,
    options: [
      'Запрос refresh token — доступ без присутствия пользователя',
      'Работа без интернета через кеш',
      'Доступ к offline-файлам Google Drive',
      'Фоновая синхронизация данных',
    ],
    correct: 0,
    explanation:
      'offline_access: запрашивает выдачу refresh token. Без него — только access token, при истечении нужен новый login. С offline_access — можно обновлять access в фоне без пользователя. Google по умолчанию выдаёт refresh только при первом consent, или при access_type=offline.',
  },
  {
    id: 'oauth-11',
    difficulty: 'hard',
    question: 'Что такое Open Redirect уязвимость в OAuth?',
    code: `// Атакующий подменяет redirect_uri:
// /authorize?redirect_uri=https://evil.com/steal`,
    options: [
      'Auth Server должен проверять redirect_uri по точному совпадению с зарегистрированным',
      'redirect_uri должен быть зашифрован',
      'Использовать только HTTP (без S) для redirect_uri',
      'Ограничить redirect_uri 256 символами',
    ],
    correct: 0,
    explanation:
      'Open Redirect: если провайдер принимает любой redirect_uri — атакующий направляет code/token на свой сервер. Защита: регистрировать точные redirect_uri при создании приложения, проверять точное совпадение (не prefix, не wildcard). Google/GitHub это делают.',
  },
  {
    id: 'oauth-12',
    difficulty: 'medium',
    question: 'Нужно ли проверять sub в id_token при повторном входе?',
    code: `// Пользователь входит через Google снова
// Получаем новый id_token
// sub: "1234567890" — тот же что был?`,
    options: [
      'Да — sub должен совпадать с сохранённым, смена sub = другой аккаунт',
      'Нет — sub меняется при каждом входе по соображениям приватности',
      'Нет — достаточно проверить email',
      'Да — но только если email изменился',
    ],
    correct: 0,
    explanation:
      'sub (subject): стабильный уникальный идентификатор пользователя у конкретного провайдера. Никогда не меняется. Именно sub нужно сохранять в БД как связь между вашим пользователем и Google-аккаунтом. Email может меняться, sub — нет.',
  },
  {
    id: 'oauth-13',
    difficulty: 'hard',
    question: 'Что такое nonce в OpenID Connect?',
    code: `// GET /authorize?
//   scope=openid
//   &nonce=random_value_here  // зачем?`,
    options: [
      'Защита от replay-атак — сервер включает nonce в id_token, клиент проверяет совпадение',
      'Дополнительная энтропия для подписи токена',
      'Идентификатор сессии в Auth Server',
      'Версия протокола OpenID Connect',
    ],
    correct: 0,
    explanation:
      'Nonce: случайное значение, которое клиент отправляет при авторизации. Auth Server включает его в id_token. Клиент проверяет: nonce в id_token = отправленному? Защищает от replay-атаки: перехваченный id_token не принять как свежий, т.к. nonce уже использован.',
  },
  {
    id: 'oauth-14',
    difficulty: 'easy',
    question: 'Какой Grant Type использовать для server-to-server коммуникации без пользователя?',
    code: `// Cron job на сервере должен обратиться к Google API
// Нет пользователя — никто не кликает "Войти"`,
    options: [
      'Client Credentials — только client_id и client_secret, без пользователя',
      'Authorization Code — стандартный flow',
      'Implicit — для всего без пользователя',
      'Device Code — для устройств без браузера',
    ],
    correct: 0,
    explanation:
      'Client Credentials: M2M (machine-to-machine). Только client_id + client_secret → access_token. Нет пользователя, нет redirect, нет consent. Используется для: внутренние сервисы, API интеграции, CI/CD, cron jobs с доступом к внешним API.',
  },
  {
    id: 'oauth-15',
    difficulty: 'medium',
    question: 'Где проверяется подпись id_token при "Войти через Google"?',
    code: `// id_token = eyJhbGciOiJSUzI1NiIs...
// Как убедиться что он выдан Google, а не подделан?`,
    options: [
      'Через публичные ключи Google (JWKS) по URL: accounts.google.com/.well-known/jwks.json',
      'Отправить id_token обратно в Google для проверки',
      'Через client_secret — симметричная верификация',
      'id_token не проверяется — доверяем что Google не солгал',
    ],
    correct: 0,
    explanation:
      'Google подписывает id_token приватным RSA ключом (RS256). Публичные ключи доступны по JWKS URL. Ваш сервер загружает их (с кешированием по Cache-Control) и верифицирует подпись локально. OIDC discovery: /.well-known/openid-configuration содержит все эндпоинты и jwks_uri.',
  },
];
