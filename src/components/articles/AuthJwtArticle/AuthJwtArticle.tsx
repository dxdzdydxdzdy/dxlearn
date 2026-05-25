import s from './AuthJwtArticle.module.scss';
import { JwtDecoder } from './JwtDecoder';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';

export function AuthJwtArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Проблема ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>HTTP без памяти</h2>
        <p className={s.lead}>
          HTTP — stateless протокол. Каждый запрос существует сам по себе: сервер
          не помнит, что вы уже авторизовались секунду назад. Это значит — без
          дополнительного механизма вам пришлось бы вводить логин и пароль при
          каждом клике.
        </p>
        <p className={s.body}>
          Аутентификация решает это: клиент один раз доказывает кто он есть,
          получает «доказательство» (токен или сессию) и предъявляет его при
          каждом следующем запросе. Сервер проверяет его — быстро и без базы
          данных.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Без токенов — невозможно</p>
            <ul className={s.colList}>
              <li className={s.colItemBad}>GET /dashboard — кто ты?</li>
              <li className={s.colItemBad}>GET /orders — снова кто ты?</li>
              <li className={s.colItemBad}>POST /checkout — ещё раз кто ты?</li>
              <li className={s.colItem}>Пришлось бы логиниться при каждом запросе</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>С токеном — один раз</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>POST /auth/login → получил токен</li>
              <li className={s.colItemGood}>GET /dashboard + Bearer token → OK</li>
              <li className={s.colItemGood}>GET /orders + Bearer token → OK</li>
              <li className={s.colItemGood}>Сервер верифицирует за ~0.1 мс</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. Сессии ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Сессии — старый подход</h2>
        <p className={s.body}>
          До JWT доминировали сессии. Сервер хранил состояние в памяти или Redis,
          клиент — только идентификатор в cookie.
        </p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum}>1</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Логин</span>
              <span className={s.stepDesc}>Клиент отправляет логин + пароль. Сервер проверяет, создаёт запись сессии в Redis/БД.</span>
              <span className={s.stepCode}>POST /login → сервер: sessions[&quot;abc123&quot;] = {'{'} userId: 42, role: &quot;admin&quot; {'}'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum}>2</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Сервер ставит cookie</span>
              <span className={s.stepDesc}>Браузер автоматически хранит и отправляет cookie при каждом запросе к домену.</span>
              <span className={s.stepCode}>Set-Cookie: sessionId=abc123; HttpOnly; Secure</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum}>3</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Каждый запрос</span>
              <span className={s.stepDesc}>Сервер берёт sessionId из cookie и идёт в Redis/БД за данными пользователя.</span>
              <span className={s.stepCode}>Cookie: sessionId=abc123 → Redis GET abc123 → {'{'} userId: 42 {'}'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum}>4</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Logout — мгновенно</span>
              <span className={s.stepDesc}>Удалить сессию из Redis — и токен немедленно перестаёт работать. Это главное преимущество.</span>
              <span className={s.stepCode}>DELETE sessions[&quot;abc123&quot;] → следующий запрос с этим sessionId: 401</span>
            </div>
          </div>
        </div>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Плюсы сессий</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Мгновенная инвалидация</li>
              <li className={s.colItemGood}>Небольшой размер cookie (просто ID)</li>
              <li className={s.colItemGood}>Легко обновить данные пользователя</li>
              <li className={s.colItemGood}>Простая реализация для монолита</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Минусы сессий</p>
            <ul className={s.colList}>
              <li className={s.colItemBad}>Stateful: нужен общий Redis при масштабировании</li>
              <li className={s.colItemBad}>Чтение Redis при каждом запросе</li>
              <li className={s.colItemBad}>Сложно использовать в микросервисах</li>
              <li className={s.colItemBad}>Mobile и SPA: cookie не всегда удобны</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. JWT структура ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>JWT: три части и главный миф</h2>
        <p className={s.lead}>
          JSON Web Token — это три base64url-строки, разделённые точками:
          header, payload, signature. Ключевой момент который путают почти все:
          JWT не шифруется. Payload виден любому без ключа.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>// Главное про JWT</div>
          <p className={s.calloutText}>
            Подпись гарантирует что данные не изменены и токен выдан сервером.
            Но прочитать payload может кто угодно — просто вставь в jwt.io.
            Это означает: никогда не кладите в JWT пароли, секреты, номера карт.
          </p>
        </div>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Header — алгоритм</p>
            <ul className={s.colList}>
              <li className={s.colItem}><strong>alg</strong> — алгоритм подписи: HS256 (HMAC), RS256 (RSA)</li>
              <li className={s.colItem}><strong>typ</strong> — всегда &quot;JWT&quot;</li>
              <li className={s.colItem}>base64url(<code className={s.code}>{'{'}alg,typ{'}'}</code>) = первая часть</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Payload — данные</p>
            <ul className={s.colList}>
              <li className={s.colItem}><strong>sub</strong> — subject (ID пользователя)</li>
              <li className={s.colItem}><strong>iat</strong> — issued at (время выдачи)</li>
              <li className={s.colItem}><strong>exp</strong> — expiration (когда истекает)</li>
              <li className={s.colItem}><strong>jti</strong> — JWT ID (UUID для blacklist)</li>
              <li className={s.colItem}>Любые custom claims: role, name, permissions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. JwtDecoder ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Декодируем JWT вживую</h2>
        <p className={s.body}>
          Посмотрите на реальный токен. Обратите внимание: access содержит имя и
          роль (нужны фронтенду), refresh — только jti для rotation.
        </p>
        <JwtDecoder />
      </section>

      {/* ── 5. Access + Refresh ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Access и Refresh: зачем два токена</h2>
        <p className={s.lead}>
          Один токен с TTL 30 дней — удобно, но если его украдут, атакующий
          получает доступ на месяц. Один токен с TTL 15 минут — безопасно, но
          пользователь логинится каждые 15 минут. Решение: два токена.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard} style={{ borderTopColor: 'var(--color-accent, #00e5a0)', borderTop: '3px solid' }}>
            <p className={s.colTitle}>Access Token — для API</p>
            <ul className={s.colList}>
              <li className={s.colItem}>TTL: 15 минут — 1 час</li>
              <li className={s.colItem}>Содержит: userId, role, name</li>
              <li className={s.colItem}>Передаётся с каждым запросом</li>
              <li className={s.colItem}>Хранится в памяти или localStorage</li>
              <li className={s.colItemGood}>Украден? Устареет быстро</li>
            </ul>
          </div>
          <div className={s.colCard} style={{ borderTopColor: '#9b59e0', borderTop: '3px solid' }}>
            <p className={s.colTitle}>Refresh Token — для обновления</p>
            <ul className={s.colList}>
              <li className={s.colItem}>TTL: 30 дней — 1 год</li>
              <li className={s.colItem}>Содержит: userId, jti (UUID)</li>
              <li className={s.colItem}>Используется только при истечении access</li>
              <li className={s.colItem}>Хранится в httpOnly cookie</li>
              <li className={s.colItemGood}>Rotation: каждый use — новый refresh</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 6. Auth flow ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Полный цикл аутентификации</h2>
        <p className={s.body}>Логин, запрос, обновление токена, выход — как это выглядит на практике.</p>

        <p className={s.body} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>// ШАГ 1 — ЛОГИН</p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#00e5a0'} as React.CSSProperties}>1</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Клиент отправляет учётные данные</span>
              <span className={s.stepDesc}>Один раз — при входе. Логин и пароль отправляются по HTTPS.</span>
              <span className={s.stepCode}>POST /auth/login {'{'} email, password {'}'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#00e5a0'} as React.CSSProperties}>2</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Сервер верифицирует и выдаёт токены</span>
              <span className={s.stepDesc}>Проверяет пароль через bcrypt, подписывает оба токена JWT_SECRET.</span>
              <span className={s.stepCode}>{'→'} 200 {'{'} accessToken {'}'} + Set-Cookie: refreshToken=...; HttpOnly</span>
            </div>
          </div>
        </div>

        <p className={s.body} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em', marginTop: 'var(--space-4)' }}>// ШАГ 2 — ЗАПРОС К API</p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#4db8ff'} as React.CSSProperties}>3</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Клиент прикладывает access token</span>
              <span className={s.stepDesc}>При каждом запросе к защищённому эндпоинту.</span>
              <span className={s.stepCode}>GET /api/orders Authorization: Bearer eyJhbGci...</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#4db8ff'} as React.CSSProperties}>4</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Middleware верифицирует токен</span>
              <span className={s.stepDesc}>jwt.verify() — без обращения к базе данных. Занимает ~0.1 мс.</span>
              <span className={s.stepCode}>jwt.verify(token, SECRET) → {'{'} sub: &quot;42&quot;, role: &quot;admin&quot; {'}'} → next()</span>
            </div>
          </div>
        </div>

        <p className={s.body} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em', marginTop: 'var(--space-4)' }}>// ШАГ 3 — ACCESS ИСТЁК</p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>5</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Сервер возвращает 401 Token Expired</span>
              <span className={s.stepDesc}>Клиент видит 401 с кодом TOKEN_EXPIRED — это сигнал обновить токен.</span>
              <span className={s.stepCode}>{'←'} 401 {'{'} error: &quot;Token expired&quot;, code: &quot;TOKEN_EXPIRED&quot; {'}'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>6</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Клиент использует refresh token</span>
              <span className={s.stepDesc}>Браузер автоматически отправляет httpOnly cookie с refresh токеном.</span>
              <span className={s.stepCode}>POST /auth/refresh (cookie: refreshToken=...) → {'{'} accessToken: &quot;new...&quot; {'}'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>7</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Rotation: новый refresh token</span>
              <span className={s.stepDesc}>Старый refresh инвалидируется, выдаётся новый. Попытка reuse — блокировка всей сессии.</span>
              <span className={s.stepCode}>{'←'} Set-Cookie: refreshToken=new-token; HttpOnly + {'{'} accessToken {'}'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Где хранить ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Где хранить токен в браузере</h2>
        <p className={s.body}>
          Это один из самых спорных вопросов. Единого «правильного» ответа нет —
          зависит от модели угроз. Вот честное сравнение.
        </p>
        <div className={s.storageGrid}>
          <div className={s.storageCard} style={{'--sc': '#ff7b72'} as React.CSSProperties}>
            <p className={s.storageTitle}>localStorage</p>
            <span className={`${s.threatBadge} ${s.threatHigh}`}>ВЫСОКИЙ РИСК XSS</span>
            <ul className={s.storageList}>
              <li className={s.storageItem}>JS читает напрямую: localStorage.getItem()</li>
              <li className={s.storageItem}>XSS скрипт может украсть токен</li>
              <li className={s.storageItem}>Явно указывается в запросах</li>
              <li className={s.storageItem}>Удобно для SPA, не требует CSRF защиты</li>
            </ul>
          </div>
          <div className={s.storageCard} style={{'--sc': '#f0c040'} as React.CSSProperties}>
            <p className={s.storageTitle}>обычный cookie</p>
            <span className={`${s.threatBadge} ${s.threatMed}`}>СРЕДНИЙ РИСК</span>
            <ul className={s.storageList}>
              <li className={s.storageItem}>JS читает через document.cookie</li>
              <li className={s.storageItem}>XSS всё ещё работает</li>
              <li className={s.storageItem}>Нужна CSRF защита</li>
              <li className={s.storageItem}>Хуже localStorage только сложностью</li>
            </ul>
          </div>
          <div className={s.storageCard} style={{'--sc': '#00e5a0'} as React.CSSProperties}>
            <p className={s.storageTitle}>httpOnly cookie</p>
            <span className={`${s.threatBadge} ${s.threatLow}`}>РЕКОМЕНДУЕТСЯ</span>
            <ul className={s.storageList}>
              <li className={s.storageItem}>JS не может прочитать cookie</li>
              <li className={s.storageItem}>XSS не может украсть токен</li>
              <li className={s.storageItem}>Нужна защита от CSRF (SameSite=Strict)</li>
              <li className={s.storageItem}>Устанавливается сервером через Set-Cookie</li>
            </ul>
          </div>
        </div>
        <div className={s.info}>
          <div className={s.infoLabel}>// Рекомендация</div>
          <p className={s.infoText}>
            Refresh token — всегда в httpOnly cookie (сервер устанавливает, JS не видит).
            Access token — в памяти приложения (React state) для максимальной безопасности,
            или в localStorage если CORS и API на другом домене. Access short-lived (15 мин),
            поэтому даже при утечке ущерб минимален.
          </p>
        </div>
      </section>

      {/* ── 8. Express код ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Код: Express + JWT</h2>
        <p className={s.body}>Минимальная рабочая реализация: логин, middleware, refresh.</p>

        <p className={s.body}><strong>Логин — выдать оба токена:</strong></p>
        <pre className={s.codeBlock}><code>{`const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // Access token — короткий, несёт данные для API
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token — длинный, только для обновления access
  const refreshToken = jwt.sign(
    { sub: user.id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  // Refresh — только в httpOnly cookie (JS не читает)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   true,          // только HTTPS
    sameSite: 'strict',      // CSRF защита
    maxAge:   30 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});`}</code></pre>

        <p className={s.body}><strong>Middleware — верифицировать access token:</strong></p>
        <pre className={s.codeBlock}><code>{`function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token', code: 'NO_TOKEN' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();   // токен валиден — передаём дальше
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
}

// Использование:
app.get('/api/orders', authMiddleware, async (req, res) => {
  const orders = await db.getOrders(req.user.sub);  // req.user.sub = userId
  res.json(orders);
});`}</code></pre>

        <p className={s.body}><strong>Refresh endpoint — обновить access + rotation:</strong></p>
        <pre className={s.codeBlock}><code>{`app.post('/auth/refresh', async (req, res) => {
  const oldRefresh = req.cookies.refreshToken;
  if (!oldRefresh) return res.status(401).json({ error: 'No refresh token' });

  let payload;
  try {
    payload = jwt.verify(oldRefresh, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Rotation: старый refresh инвалидируем (blacklist по jti в Redis)
  // await redis.set(\`blacklist:\${payload.jti}\`, 1, 'EX', 30 * 24 * 3600);

  const user = await db.findById(payload.sub);

  const newAccessToken = jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const newRefreshToken = jwt.sign(
    { sub: user.id, jti: crypto.randomUUID() },   // новый jti!
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true, secure: true, sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken });
});`}</code></pre>
      </section>

      {/* ── 9. Инвалидация ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Инвалидация JWT: главная проблема</h2>
        <p className={s.body}>
          JWT stateless — нельзя «отозвать» токен, не добавив state. Это
          архитектурный компромисс. Вот варианты от простого к надёжному:
        </p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>A</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Короткий TTL (15 мин)</span>
              <span className={s.stepDesc}>
                Самый простой подход. Даже украденный токен быстро устареет.
                Проблема: 15 минут — это окно атаки.
              </span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>B</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Blacklist по jti в Redis</span>
              <span className={s.stepDesc}>
                При logout добавляешь jti токена в Redis с TTL = exp. При каждом запросе
                middleware проверяет Redis. Добавляет ~1 мс на чтение.
              </span>
              <span className={s.stepCode}>await redis.set(`blacklist:{`${'{payload.jti}'}`}`, 1, {'{'}'EX', exp - now{'}'})</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#00e5a0'} as React.CSSProperties}>C</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Refresh Rotation + blacklist</span>
              <span className={s.stepDesc}>
                Лучший баланс: короткий access (не нужен blacklist), refresh rotation с
                blacklist по jti. Обнаруживает кражу refresh токена.
              </span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#9b59e0'} as React.CSSProperties}>D</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>«Ядерный» вариант: сменить JWT_SECRET</span>
              <span className={s.stepDesc}>
                Сбрасывает все активные сессии мгновенно. Только если скомпрометирован
                сам секрет. Все пользователи выйдут одновременно.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Сессии vs JWT ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Сессии vs JWT: когда что выбрать</h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Критерий</th>
                <th>Сессии</th>
                <th>JWT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>State</td>
                <td>Stateful — хранится на сервере</td>
                <td>Stateless — в самом токене</td>
              </tr>
              <tr>
                <td>Инвалидация</td>
                <td>Мгновенная — удали из Redis</td>
                <td>Сложнее — нужен blacklist или ждать exp</td>
              </tr>
              <tr>
                <td>Масштабирование</td>
                <td>Нужен shared Redis между серверами</td>
                <td>Каждый сервер верифицирует сам</td>
              </tr>
              <tr>
                <td>Микросервисы</td>
                <td>Неудобно — все сервисы идут в Redis</td>
                <td>Идеально — верификация без общего хранилища</td>
              </tr>
              <tr>
                <td>Размер payload</td>
                <td>Маленький sessionId в cookie</td>
                <td>Токен ~200–500 байт, растёт с claims</td>
              </tr>
              <tr>
                <td>Данные пользователя</td>
                <td>Всегда актуальны (из Redis)</td>
                <td>Заморожены до истечения TTL</td>
              </tr>
              <tr>
                <td>Когда выбирать</td>
                <td>Монолит, нужен instant-revoke, веб</td>
                <td>Микросервисы, SPA+API, мобильные приложения</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>// Вывод</div>
          <p className={s.calloutText}>
            Оба подхода рабочие. Сессии проще для монолита с нужной мгновенной инвалидацией.
            JWT лучше для stateless масштабирования и микросервисов. Многие продакшн-системы
            используют гибрид: JWT для stateless верификации + Redis для blacklist при logout.
          </p>
        </div>
      </section>

      {/* ── 11. Security pitfalls ───────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Типичные ошибки и уязвимости</h2>
        <div className={s.pitfallList}>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ alg:none — критическая уязвимость</p>
            <p className={s.pitfallDesc}>
              Атакующий меняет header токена: <code className={s.code}>{'"alg":"HS256"'}</code> →{' '}
              <code className={s.code}>{'"alg":"none"'}</code> и убирает подпись. Уязвимые библиотеки
              принимали такой токен без верификации.
            </p>
            <p className={s.pitfallFix}>
              ✓ Фикс: jwt.verify(token, secret, {'{'} algorithms: [&apos;HS256&apos;] {'}'}) — явно белый список
            </p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Слабый секрет</p>
            <p className={s.pitfallDesc}>
              JWT_SECRET=&quot;secret&quot; или JWT_SECRET=&quot;1234&quot; — перебирается за секунды.
              Атакующий с токеном может подобрать секрет и подписывать любые payload.
            </p>
            <p className={s.pitfallFix}>
              ✓ Фикс: минимум 256 бит случайных данных — node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;hex&apos;))&quot;
            </p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Секреты в JWT payload</p>
            <p className={s.pitfallDesc}>
              Payload виден без ключа — base64url декодируется на jwt.io.
              Кладут пароли, API ключи, номера карт — всё это читается любым владельцем токена.
            </p>
            <p className={s.pitfallFix}>
              ✓ Фикс: только публичные данные — userId, role, email. Секреты — никогда.
            </p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Долгий TTL без инвалидации</p>
            <p className={s.pitfallDesc}>
              Access token на 30 дней без механизма отзыва. Утечка = 30 дней доступа.
              Logout на клиенте (удалить из localStorage) — не защищает от украденного токена.
            </p>
            <p className={s.pitfallFix}>
              ✓ Фикс: access TTL 15 мин + refresh rotation + blacklist при logout
            </p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Access token в URL</p>
            <p className={s.pitfallDesc}>
              GET /api/data?token=eyJ... — токен в логах nginx, в истории браузера,
              в Referer заголовке при переходах. Утекает незаметно.
            </p>
            <p className={s.pitfallFix}>
              ✓ Фикс: только Authorization: Bearer header или httpOnly cookie
            </p>
          </div>
        </div>
      </section>

      {/* ── 12. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
