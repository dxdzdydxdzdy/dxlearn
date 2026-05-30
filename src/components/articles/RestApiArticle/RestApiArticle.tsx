import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ScenarioViewer } from './ScenarioViewer';
import { QUIZ_QUESTIONS } from './quizData';
import s from './RestApiArticle.module.scss';

// ── HTTP Methods data ─────────────────────────────────────────────────────────

const HTTP_METHODS = [
  {
    name: 'GET',
    color: '#00e5a0',
    semantic: '// читать',
    desc: 'Получить ресурс или коллекцию. Не меняет состояние. Запросы кешируются браузером и прокси.',
    safe: true,
    idempotent: true,
    pills: [{ text: 'safe', cls: 'pillGreen' }, { text: 'idempotent', cls: 'pillGreen' }, { text: 'cacheable', cls: 'pillGreen' }],
  },
  {
    name: 'POST',
    color: '#4a9eff',
    semantic: '// создать',
    desc: 'Создать новый ресурс в коллекции. Каждый вызов создаёт новую запись. Возвращает 201.',
    safe: false,
    idempotent: false,
    pills: [{ text: 'not safe', cls: 'pillRed' }, { text: 'not idempotent', cls: 'pillRed' }],
  },
  {
    name: 'PUT',
    color: '#f0c040',
    semantic: '// заменить целиком',
    desc: 'Полностью заменить ресурс. Клиент передаёт весь объект. Если поле не передано — оно обнуляется.',
    safe: false,
    idempotent: true,
    pills: [{ text: 'not safe', cls: 'pillRed' }, { text: 'idempotent', cls: 'pillGreen' }],
  },
  {
    name: 'PATCH',
    color: '#9b59e0',
    semantic: '// изменить частично',
    desc: 'Обновить только переданные поля. Остальные поля не трогает. Используется чаще чем PUT.',
    safe: false,
    idempotent: false,
    pills: [{ text: 'not safe', cls: 'pillRed' }, { text: 'usually idempotent', cls: 'pillYellow' }],
  },
  {
    name: 'DELETE',
    color: '#ff7b72',
    semantic: '// удалить',
    desc: 'Удалить ресурс. Повторный вызов возвращает 404, но состояние системы то же. Возвращает 204.',
    safe: false,
    idempotent: true,
    pills: [{ text: 'not safe', cls: 'pillRed' }, { text: 'idempotent', cls: 'pillGreen' }],
  },
  {
    name: 'OPTIONS',
    color: '#4db8ff',
    semantic: '// что можно?',
    desc: 'Браузер автоматически шлёт перед cross-origin запросом (CORS preflight). Сервер отвечает разрешёнными методами.',
    safe: true,
    idempotent: true,
    pills: [{ text: 'safe', cls: 'pillGreen' }, { text: 'CORS preflight', cls: 'pillYellow' }],
  },
];

// ── Status codes data ─────────────────────────────────────────────────────────

const STATUS_GROUPS = [
  {
    range: '2xx',
    color: '#00e5a0',
    label: 'Успех',
    codes: [
      { code: '200', name: 'OK',                    desc: 'Стандартный успех. Для GET, PUT, PATCH.' },
      { code: '201', name: 'Created',               desc: 'Ресурс создан. Для POST. Добавь заголовок Location: /resource/id.' },
      { code: '204', name: 'No Content',            desc: 'Успешно, тела нет. Для DELETE. Не возвращай {success:true}.' },
      { code: '202', name: 'Accepted',              desc: 'Запрос принят, обработка асинхронна. Для job-очередей.' },
    ],
  },
  {
    range: '4xx',
    color: '#f0c040',
    label: 'Ошибка клиента',
    codes: [
      { code: '400', name: 'Bad Request',           desc: 'Запрос нельзя понять: битый JSON, неверный формат параметра.' },
      { code: '401', name: 'Unauthorized',          desc: 'Нет аутентификации: токен отсутствует, истёк, невалиден.' },
      { code: '403', name: 'Forbidden',             desc: 'Аутентифицирован, но нет прав на этот ресурс.' },
      { code: '404', name: 'Not Found',             desc: 'Ресурс не существует. Не раскрывай причину (403 vs 404).' },
      { code: '409', name: 'Conflict',              desc: 'Конфликт с текущим состоянием: дубликат, optimistic lock.' },
      { code: '422', name: 'Unprocessable Entity',  desc: 'Данные получены, но невалидны по бизнес-логике. Возвращай список ошибок.' },
      { code: '429', name: 'Too Many Requests',     desc: 'Rate limit превышен. Добавь Retry-After и X-RateLimit-* заголовки.' },
    ],
  },
  {
    range: '5xx',
    color: '#ff7b72',
    label: 'Ошибка сервера',
    codes: [
      { code: '500', name: 'Internal Server Error', desc: 'Необработанное исключение. Логируй и не отдавай stack trace клиенту.' },
      { code: '502', name: 'Bad Gateway',           desc: 'Прокси/балансировщик получил плохой ответ от upstream.' },
      { code: '503', name: 'Service Unavailable',   desc: 'Сервер временно недоступен. Добавь Retry-After.' },
    ],
  },
];

export function RestApiArticle() {
  return (
    <div className={s.article}>

      {/* 1. Зачем REST */}
      <section className={s.section}>
        <SectionTitle>Зачем нужен стандарт</SectionTitle>
        <p className={s.lead}>
          До REST каждый API придумывал свои конвенции.
          Одни писали <code style={{ fontFamily: 'var(--font-mono)', color: '#4db8ff' }}>/getUser?id=5</code>,
          другие <code style={{ fontFamily: 'var(--font-mono)', color: '#4db8ff' }}>POST /user/fetch</code>,
          третьи слали всё в теле POST. Интеграция между сервисами была кошмаром.
        </p>
        <p className={s.body}>
          REST (Representational State Transfer) — это архитектурный стиль, предложенный
          Роем Филдингом в 2000 году. Он не придумывал ничего нового — просто сказал:
          используй HTTP так, как он был задуман. У HTTP уже есть методы (GET, POST...),
          статус-коды (200, 404...) и заголовки. Используй их правильно и последовательно.
        </p>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// главная идея REST</div>
          <div className={s.calloutText}>
            <strong style={{ color: 'inherit' }}>URL = существительное (ресурс).</strong>{' '}
            <strong style={{ color: 'inherit' }}>Метод = глагол (действие).</strong>{' '}
            <strong style={{ color: 'inherit' }}>Статус-код = результат.</strong>
            <br /><br />
            <code style={{ fontFamily: 'var(--font-mono)', color: '#00e5a0' }}>DELETE /users/42</code>
            {' '}читается как «удали пользователя 42» — метод это глагол, URL это существительное.
            <br />
            <code style={{ fontFamily: 'var(--font-mono)', color: '#ff7b72', textDecoration: 'line-through' }}>POST /deleteUser?id=42</code>
            {' '}— два глагола, нарушение REST.
          </div>
        </div>
      </section>

      {/* 2. URL и ресурсы */}
      <section className={s.section}>
        <SectionTitle>Ресурсы и структура URL</SectionTitle>
        <p className={s.lead}>
          Каждая сущность твоего приложения — это ресурс. Пользователи, заказы, продукты, сессии.
          URL — это адрес ресурса, а не инструкция что с ним делать.
        </p>

        <div className={s.urlBox}>
          <span className={s.urlPart + ' ' + s.urlScheme}>https://</span>
          <span className={s.urlPart + ' ' + s.urlHost}>api.example.com</span>
          <span className={s.urlPart + ' ' + s.urlPrefix}>/api/</span>
          <span className={s.urlPart + ' ' + s.urlVersion}>v1</span>
          <span className={s.urlPart + ' ' + s.urlScheme}>/</span>
          <span className={s.urlPart + ' ' + s.urlResource}>users</span>
          <span className={s.urlPart + ' ' + s.urlScheme}>/</span>
          <span className={s.urlPart + ' ' + s.urlId}>42</span>
          <span className={s.urlPart + ' ' + s.urlScheme}>/</span>
          <span className={s.urlPart + ' ' + s.urlSub}>orders</span>
        </div>
        <div className={s.urlLegend}>
          {[
            { color: '#4db8ff', text: 'хост' },
            { color: '#f0c040', text: 'версия API' },
            { color: '#00e5a0', text: 'ресурс (коллекция)' },
            { color: '#9b59e0', text: 'id конкретного объекта' },
          ].map(i => (
            <div key={i.text} className={s.urlLegendItem}>
              <div className={s.urlDot} style={{ background: i.color }} />
              {i.text}
            </div>
          ))}
        </div>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// хорошо — ресурсы</div>
            <ul className={s.colList}>
              <li className={`${s.colItem} ${s.colItemGood}`}><code style={{ fontFamily: 'var(--font-mono)' }}>GET /users</code></li>
              <li className={`${s.colItem} ${s.colItemGood}`}><code style={{ fontFamily: 'var(--font-mono)' }}>GET /users/42</code></li>
              <li className={`${s.colItem} ${s.colItemGood}`}><code style={{ fontFamily: 'var(--font-mono)' }}>POST /users</code></li>
              <li className={`${s.colItem} ${s.colItemGood}`}><code style={{ fontFamily: 'var(--font-mono)' }}>GET /users/42/orders</code></li>
              <li className={`${s.colItem} ${s.colItemGood}`}><code style={{ fontFamily: 'var(--font-mono)' }}>DELETE /orders/7</code></li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// плохо — глаголы в URL</div>
            <ul className={s.colList}>
              <li className={`${s.colItem} ${s.colItemBad}`}><code style={{ fontFamily: 'var(--font-mono)' }}>GET /getAllUsers</code></li>
              <li className={`${s.colItem} ${s.colItemBad}`}><code style={{ fontFamily: 'var(--font-mono)' }}>GET /getUser?id=42</code></li>
              <li className={`${s.colItem} ${s.colItemBad}`}><code style={{ fontFamily: 'var(--font-mono)' }}>POST /createUser</code></li>
              <li className={`${s.colItem} ${s.colItemBad}`}><code style={{ fontFamily: 'var(--font-mono)' }}>POST /getUserOrders</code></li>
              <li className={`${s.colItem} ${s.colItemBad}`}><code style={{ fontFamily: 'var(--font-mono)' }}>POST /deleteOrder?id=7</code></li>
            </ul>
          </div>
        </div>

        <CodeHighlight lang="javascript" code={`// Express: типичная структура маршрутов
app.get('/api/v1/users',          getUsers);        // список
app.get('/api/v1/users/:id',      getUserById);     // один
app.post('/api/v1/users',         createUser);      // создать
app.patch('/api/v1/users/:id',    updateUser);      // изменить частично
app.delete('/api/v1/users/:id',   deleteUser);      // удалить

// Вложенный ресурс: заказы конкретного пользователя
app.get('/api/v1/users/:id/orders', getUserOrders);`} />
      </section>

      {/* 3. HTTP методы */}
      <section className={s.section}>
        <SectionTitle>HTTP-методы и их семантика</SectionTitle>
        <p className={s.lead}>
          Каждый метод несёт смысл. Нарушение семантики ломает кеширование,
          мешает инструментам мониторинга и путает других разработчиков.
        </p>

        <div className={s.methodGrid}>
          {HTTP_METHODS.map(m => (
            <div
              key={m.name}
              className={s.methodCard}
              style={{ '--mc': m.color } as React.CSSProperties}
            >
              <div className={s.methodName}>{m.name}</div>
              <div className={s.methodSemantic}>{m.semantic}</div>
              <div className={s.methodDesc}>{m.desc}</div>
              <div className={s.methodPills}>
                {m.pills.map(p => (
                  <span key={p.text} className={`${s.pill} ${s[p.cls as keyof typeof s]}`}>
                    {p.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <CodeHighlight lang="javascript" code={`// Express примеры всех методов

// GET — только читает, не меняет данные
app.get('/users/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!user.rows[0]) return res.status(404).json({ error: 'Not Found' });
  res.json(user.rows[0]);
});

// POST — создаёт новый ресурс
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const result = await db.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  res.status(201)
    .set('Location', \`/api/v1/users/\${result.rows[0].id}\`)
    .json(result.rows[0]);
});

// PATCH — только изменённые поля
app.patch('/users/:id', async (req, res) => {
  const { email } = req.body;  // только то что передали
  const result = await db.query(
    'UPDATE users SET email = $1 WHERE id = $2 RETURNING *',
    [email, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE — удалить, тело пустое
app.delete('/users/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.status(204).end();
});`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// safe vs idempotent</div>
          <div className={s.infoText}>
            <strong style={{ color: '#4db8ff' }}>Safe</strong> — метод не меняет состояние сервера (GET, HEAD, OPTIONS).
            Браузер может свободно повторять safe-запросы (prefetch, retry).
            <br /><br />
            <strong style={{ color: '#4db8ff' }}>Idempotent</strong> — повтор одного запроса N раз = тот же результат что и 1 раз (GET, PUT, DELETE).
            Это позволяет безопасно ретраить при network error. POST — не idempotent: каждый раз создаёт новую запись.
          </div>
        </div>
      </section>

      {/* 4. Статус коды */}
      <section className={s.section}>
        <SectionTitle>Статус-коды — язык HTTP</SectionTitle>
        <p className={s.lead}>
          Статус-код — это машиночитаемый ответ на вопрос «что произошло?».
          Не возвращай 200 OK с <code style={{ fontFamily: 'var(--font-mono)', color: '#ff7b72' }}>{"{ success: false }"}</code> — это антипаттерн,
          который ломает мониторинг, retry-логику и логирование.
        </p>

        <div className={s.statusGroups}>
          {STATUS_GROUPS.map(g => (
            <div key={g.range} className={s.statusGroup}>
              <div
                className={s.statusGroupLabel}
                style={{ '--gc': g.color } as React.CSSProperties}
              >
                {g.range} — {g.label}
              </div>
              {g.codes.map(c => (
                <div key={c.code} className={s.statusRow}>
                  <span className={s.statusCode} style={{ '--gc': g.color } as React.CSSProperties}>
                    {c.code}
                  </span>
                  <span className={s.statusName}>{c.name}</span>
                  <span className={s.statusDesc}>{c.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={s.warning}>
          <div className={s.warningLabel}>// главный антипаттерн — 200 на ошибку</div>
          <div className={s.warningText}>
            Если API всегда возвращает 200 и кладёт ошибку в тело — мониторинг не поймает проблему,
            retry-middleware не сработает, логи будут бесполезны. HTTP-статус должен отражать реальный результат.
            Клиент обязан проверять статус, а не только парсить тело.
          </div>
        </div>
      </section>

      {/* 5. Интерактивные сценарии */}
      <section className={s.section}>
        <SectionTitle>Request / Response — живые примеры</SectionTitle>
        <p className={s.body}>
          Нажимай на сценарии и смотри как выглядят реальные HTTP-запросы и ответы.
          Обращай внимание на метод, статус-код и заголовки.
        </p>
        <ScenarioViewer />
      </section>

      {/* 6. Структура ошибки */}
      <section className={s.section}>
        <SectionTitle>Структура ответа с ошибкой</SectionTitle>
        <p className={s.lead}>
          Ошибки должны быть информативными и предсказуемыми.
          Стандартизируй формат ошибок — фронт будет благодарен.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// плохо</div>
            <CodeHighlight lang="javascript" code={`// 200 OK ← уже ошибка
{
  "status": "error",
  "msg": "something went wrong"
}

// Или того хуже — HTML-страница
// с трассировкой стека в теле`} />
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// хорошо</div>
            <CodeHighlight lang="javascript" code={`// 422 Unprocessable Entity
{
  "error": "Validation Failed",
  "code": "VALIDATION_ERROR",
  "fields": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}`} />
          </div>
        </div>

        <CodeHighlight lang="javascript" code={`// Middleware для централизованной обработки ошибок в Express
app.use((err, req, res, next) => {
  // Не отдавать stack trace клиенту в продакшне!
  const isDev = process.env.NODE_ENV === 'development';

  console.error(err);  // Логируем для разработчика

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message,
    code: err.code,                    // машиночитаемый код для клиента
    ...(isDev && { stack: err.stack }) // только в dev
  });
});

// Кастомный класс ошибки
class AppError extends Error {
  constructor(message, status = 500, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Бросаем ошибку в роуте
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    res.json(user);
  } catch (err) {
    next(err);  // → попадает в error middleware
  }
});`} />
      </section>

      {/* 7. Идемпотентность */}
      <section className={s.section}>
        <SectionTitle>Идемпотентность и безопасность</SectionTitle>
        <p className={s.lead}>
          Это не просто теория — от этого зависит как клиент обрабатывает сетевые ошибки.
          Если запрос идемпотентен, его можно безопасно повторить при таймауте.
        </p>

        <CodeHighlight lang="javascript" code={`// POST — не идемпотентный. Повтор при network error = дублированный заказ
// Решение: Idempotency Key
app.post('/orders', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (idempotencyKey) {
    // Проверяем не выполняли ли уже этот запрос
    const cached = await redis.get(\`idem:\${idempotencyKey}\`);
    if (cached) return res.status(200).json(JSON.parse(cached));
  }

  const order = await db.createOrder(req.body);

  if (idempotencyKey) {
    await redis.set(\`idem:\${idempotencyKey}\`, JSON.stringify(order), 'EX', 86400);
  }

  res.status(201).json(order);
});

// Клиент при retry посылает тот же ключ:
// Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000`} />

        <div className={s.info}>
          <div className={s.infoLabel}>// практика</div>
          <div className={s.infoText}>
            Платёжные системы (Stripe, YooKassa) всегда требуют Idempotency-Key для операций оплаты.
            Это защита от двойного списания при сетевых ошибках.
            Для своего API — добавляй Idempotency-Key для критичных POST-операций: создание заказа, списание, отправка email.
          </div>
        </div>
      </section>

      {/* 8. Версионирование */}
      <section className={s.section}>
        <SectionTitle>Версионирование API</SectionTitle>
        <p className={s.lead}>
          API — публичный контракт. Если ты его сломаешь, сломаются все клиенты.
          Версионирование позволяет развивать API не ломая существующих пользователей.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// в URL (самый распространённый)</div>
            <CodeHighlight lang="bash" code={`GET /api/v1/users
GET /api/v2/users

# + Просто и видно в логах
# + Легко маршрутизировать в nginx
# - "нечисто" с точки зрения REST`} />
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// в заголовке (REST-pure)</div>
            <CodeHighlight lang="bash" code={`GET /api/users
Accept: application/vnd.myapi+json;version=2

# + URL не меняется
# - Сложнее тестировать в браузере
# - Caching может не учесть версию`} />
          </div>
        </div>

        <CodeHighlight lang="javascript" code={`// Express: версионирование через Router
const v1Router = require('./routes/v1');
const v2Router = require('./routes/v2');

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// v1/users.js — старая версия (поддерживаем пока есть клиенты)
router.get('/users', (req, res) => {
  // возвращаем { id, name, email }
});

// v2/users.js — новая версия
router.get('/users', (req, res) => {
  // возвращаем { id, name, email, phone, avatar }
});`} />
      </section>

      {/* 9. Пагинация и rate limiting */}
      <section className={s.section}>
        <SectionTitle>Пагинация и Rate Limiting</SectionTitle>
        <p className={s.lead}>
          Два обязательных элемента любого production API.
          Без пагинации коллекции взрываются в памяти.
          Без rate limiting любой может положить сервер.
        </p>

        <CodeHighlight lang="javascript" code={`// ── Пагинация ────────────────────────────────────────────────────────────────
// Offset-based (простая, но нестабильна при частых INSERT)
app.get('/users', async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    db.query('SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]),
    db.query('SELECT COUNT(*) FROM users'),
  ]);

  res.json({
    data: rows.rows,
    meta: {
      total:    parseInt(count.rows[0].count),
      page,
      limit,
      pages:    Math.ceil(count.rows[0].count / limit),
    }
  });
});
// GET /users?page=2&limit=20

// Cursor-based (стабильна, работает с live-данными)
app.get('/users', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const after = req.query.after;  // id последнего элемента прошлой страницы

  const rows = await db.query(
    'SELECT * FROM users WHERE id > $1 ORDER BY id LIMIT $2',
    [after || 0, limit]
  );

  res.json({
    data: rows.rows,
    nextCursor: rows.rows.length === limit ? rows.rows.at(-1).id : null,
  });
});
// GET /users?after=42&limit=20

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 минута
  max: 100,             // 100 запросов в минуту
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
  headers: true,  // добавляет X-RateLimit-* заголовки
});

app.use('/api/', limiter);`} />
      </section>

      {/* 10. Summary table */}
      <section className={s.section}>
        <SectionTitle>Шпаргалка — CRUD на REST</SectionTitle>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Действие</th>
                <th>Метод</th>
                <th>URL</th>
                <th>Тело запроса</th>
                <th>Статус</th>
                <th>Тело ответа</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Список</td>
                <td>GET</td>
                <td>/users</td>
                <td>—</td>
                <td>200</td>
                <td>Массив объектов</td>
              </tr>
              <tr>
                <td>Один</td>
                <td>GET</td>
                <td>/users/42</td>
                <td>—</td>
                <td>200 / 404</td>
                <td>Объект / ошибка</td>
              </tr>
              <tr>
                <td>Создать</td>
                <td>POST</td>
                <td>/users</td>
                <td>Новый объект</td>
                <td>201</td>
                <td>Созданный объект + Location</td>
              </tr>
              <tr>
                <td>Заменить</td>
                <td>PUT</td>
                <td>/users/42</td>
                <td>Полный объект</td>
                <td>200</td>
                <td>Обновлённый объект</td>
              </tr>
              <tr>
                <td>Изменить</td>
                <td>PATCH</td>
                <td>/users/42</td>
                <td>Только изменённые поля</td>
                <td>200</td>
                <td>Обновлённый объект</td>
              </tr>
              <tr>
                <td>Удалить</td>
                <td>DELETE</td>
                <td>/users/42</td>
                <td>—</td>
                <td>204</td>
                <td>— (пустое)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 11. Quiz */}
      <section className={s.section}>
        <SectionTitle>Тест</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
