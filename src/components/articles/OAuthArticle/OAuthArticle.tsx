import s from './OAuthArticle.module.scss';
import { OAuthFlowViewer } from './OAuthFlowViewer';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';

export function OAuthArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем OAuth ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проблема: не давай пароль третьим сервисам</h2>
        <p className={s.lead}>
          Представь: ты пользуешься Spotify и хочешь, чтобы он публиковал треки
          в твой Twitter. Без OAuth Spotify просил бы твой пароль Twitter.
          Ты бы дал пароль — и всё: Spotify может делать с аккаунтом что угодно,
          и ты не можешь отозвать доступ без смены пароля.
        </p>
        <p className={s.body}>
          OAuth 2.0 решает это через делегированную авторизацию: пользователь
          разрешает приложению доступ к определённым ресурсам,
          не передавая пароль. Twitter спрашивает тебя напрямую — ты
          нажимаешь «Разрешить», Spotify получает ограниченный токен.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Без OAuth — опасно</p>
            <ul className={s.colList}>
              <li className={s.colItemBad}>Передаёшь пароль третьему сервису</li>
              <li className={s.colItemBad}>Сервис может делать всё что угодно</li>
              <li className={s.colItemBad}>Отозвать доступ = сменить пароль</li>
              <li className={s.colItemBad}>Если сервис взломан — скомпрометирован аккаунт</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>С OAuth — безопасно</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Пароль никуда не передаётся</li>
              <li className={s.colItemGood}>Только указанные scopes (права)</li>
              <li className={s.colItemGood}>Отозвать доступ одним кликом в настройках</li>
              <li className={s.colItemGood}>Взлом сервиса = только утечка ограниченного токена</li>
            </ul>
          </div>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>// OAuth 2.0 vs OpenID Connect</div>
          <p className={s.calloutText}>
            OAuth 2.0 — протокол авторизации: «что приложению можно делать».
            OpenID Connect (OIDC) — протокол аутентификации поверх OAuth: «кто пользователь».
            «Войти через Google» — это OIDC. «Дать Figma доступ к Drive» — это OAuth.
            На практике «Sign in with X» использует оба сразу.
          </p>
        </div>
      </section>

      {/* ── 2. Четыре роли ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Четыре участника OAuth</h2>
        <p className={s.body}>
          Каждый OAuth-флоу вовлекает четыре роли. Понять их — значит понять
          протокол.
        </p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Роль</th>
                <th>Кто это</th>
                <th>Пример</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Resource Owner</td>
                <td>Владелец ресурса — пользователь</td>
                <td>Ты, нажимающий «Войти через Google»</td>
              </tr>
              <tr>
                <td>Client</td>
                <td>Приложение, запрашивающее доступ</td>
                <td>Твоё приложение на Node.js</td>
              </tr>
              <tr>
                <td>Authorization Server</td>
                <td>Выдаёт токены после подтверждения</td>
                <td>accounts.google.com</td>
              </tr>
              <tr>
                <td>Resource Server</td>
                <td>API с защищёнными ресурсами</td>
                <td>googleapis.com/calendar, github.com/api</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={s.body}>
          У Google Authorization Server и Resource Server — разные URL, но одна
          компания. У GitHub — аналогично. В своих системах ты можешь строить
          Auth Server сам (через Keycloak, Auth0, или custom).
        </p>
      </section>

      {/* ── 3. Grant Types ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Grant Types: четыре сценария</h2>
        <p className={s.body}>
          OAuth 2.0 описывает несколько «флоу» для разных ситуаций.
          Знать нужно три:
        </p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#00e5a0'} as React.CSSProperties}>▶</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Authorization Code — основной</span>
              <span className={s.stepDesc}>
                Для веб-приложений с backend. Самый безопасный: code обменивается на токен
                server-to-server, токен не попадает в браузер.
              </span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#4db8ff'} as React.CSSProperties}>▶</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Authorization Code + PKCE — для SPA и мобильных</span>
              <span className={s.stepDesc}>
                То же, но без client_secret (его нельзя безопасно хранить во frontend).
                Вместо secret — математическая гарантия через code_verifier/code_challenge.
              </span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>▶</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Client Credentials — machine-to-machine</span>
              <span className={s.stepDesc}>
                Нет пользователя. Сервис аутентифицируется сам через client_id + client_secret.
                Для cron jobs, микросервисов, API интеграций.
              </span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#9b59e0'} as React.CSSProperties}>▶</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Device Code — без браузера</span>
              <span className={s.stepDesc}>
                Для TV, CLI инструментов. Устройство показывает код и URL, пользователь
                авторизует с телефона/компьютера. GitHub CLI использует этот flow.
              </span>
            </div>
          </div>
        </div>
        <div className={s.warning}>
          <div className={s.warningLabel}>// Устаревший Implicit Flow</div>
          <p className={s.warningText}>
            Implicit Flow (где access_token сразу возвращался в URL-фрагменте) официально
            устарел в OAuth 2.1. Используй Authorization Code + PKCE вместо него для SPA.
          </p>
        </div>
      </section>

      {/* ── 4. Flow Viewer ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>«Войти через Google» — пошагово</h2>
        <p className={s.body}>
          Нажмите на каждый шаг чтобы увидеть реальные HTTP запросы.
          Переключите на PKCE для сравнения с SPA вариантом.
        </p>
        <OAuthFlowViewer />
      </section>

      {/* ── 5. OpenID Connect ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>OpenID Connect: слой идентичности</h2>
        <p className={s.lead}>
          OAuth 2.0 отвечает на вопрос «что можно». OpenID Connect добавляет ответ
          на «кто ты» — тонкий стандартный слой поверх OAuth.
        </p>
        <p className={s.body}>
          Чтобы активировать OIDC, добавляем <code className={s.code}>openid</code> в scope.
          В ответ получаем <code className={s.code}>id_token</code> — JWT с identity claims.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>access_token</p>
            <ul className={s.colList}>
              <li className={s.colItem}>Для обращения к Resource Server (API)</li>
              <li className={s.colItem}>Структура зависит от провайдера (часто непрозрачный)</li>
              <li className={s.colItem}>Ваш код не должен его парсить</li>
              <li className={s.colItem}>Живёт ~1 час</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>id_token</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>JWT с identity claims пользователя</li>
              <li className={s.colItemGood}>sub, email, name, picture, locale</li>
              <li className={s.colItemGood}>Стандартизирован OIDC — одинаков у всех провайдеров</li>
              <li className={s.colItemGood}>Проверяем подпись через JWKS провайдера</li>
            </ul>
          </div>
        </div>

        <p className={s.body}><strong>Стандартные OIDC claims в id_token:</strong></p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Описание</th>
                <th>Пример</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>sub</td><td>Уникальный ID пользователя у провайдера (не меняется)</td><td>&quot;10769150350006150715&quot;</td></tr>
              <tr><td>email</td><td>Email (может меняться!)</td><td>&quot;alice@gmail.com&quot;</td></tr>
              <tr><td>email_verified</td><td>Подтверждён ли email</td><td>true</td></tr>
              <tr><td>name</td><td>Полное имя</td><td>&quot;Alice Smith&quot;</td></tr>
              <tr><td>picture</td><td>URL аватара</td><td>&quot;https://lh3...&quot;</td></tr>
              <tr><td>iss</td><td>Issuer — URL Auth Server</td><td>&quot;https://accounts.google.com&quot;</td></tr>
              <tr><td>aud</td><td>Audience — должен совпасть с твоим client_id</td><td>&quot;YOUR_CLIENT_ID&quot;</td></tr>
              <tr><td>exp</td><td>Время истечения</td><td>1716801800</td></tr>
            </tbody>
          </table>
        </div>
        <div className={s.warning}>
          <div className={s.warningLabel}>// Не используй id_token как access_token</div>
          <p className={s.warningText}>
            id_token — для идентификации пользователя в вашем приложении.
            access_token — для обращения к Google API. Это разные вещи с разными
            аудиториями. Не отправляй id_token на внешние API.
          </p>
        </div>
      </section>

      {/* ── 6. PKCE ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>PKCE: почему нельзя просто хранить client_secret в SPA</h2>
        <p className={s.body}>
          В браузерном SPA нет «секрета» — весь JavaScript виден в DevTools.
          Если вшить client_secret в код — его можно найти в Source вкладке.
          PKCE решает это математически.
        </p>
        <pre className={s.codeBlock}><code>{`// 1. Генерируем случайный code_verifier (43–128 символов)
const verifier  = crypto.randomBytes(32).toString('base64url');
// → "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

// 2. Вычисляем code_challenge = base64url(SHA256(verifier))
const challenge = crypto.createHash('sha256')
  .update(verifier).digest('base64url');
// → "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

// 3. Сохраняем verifier в sessionStorage
sessionStorage.setItem('pkce_verifier', verifier);

// 4. В auth URL:
//    &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
//    &code_challenge_method=S256

// 5. В token request (вместо client_secret):
//    code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
//
// Auth Server проверяет: SHA256(verifier) == challenge? ✓`}</code></pre>
        <div className={s.callout}>
          <div className={s.calloutLabel}>// Почему это безопасно</div>
          <p className={s.calloutText}>
            Атакующий, перехвативший authorization code из redirect URL, не знает code_verifier.
            Без verifier обменять code на токены невозможно — Auth Server вычислит SHA256 и
            сравнит с challenge. SHA256 необратимо — из challenge verifier не восстановить.
          </p>
        </div>
      </section>

      {/* ── 7. Scopes ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Scopes: запрашивай только то, что нужно</h2>
        <p className={s.body}>
          Scope — строка, определяющая какие действия разрешены токену. Пользователь
          видит список разрешений на Consent Screen. Чем шире scopes — тем меньше
          доверия.
        </p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Scope</th>
                <th>Что даёт</th>
                <th>Когда нужен</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>openid</td><td>id_token с sub</td><td>Всегда при OIDC (Sign in)</td></tr>
              <tr><td>email</td><td>email, email_verified</td><td>Нужен email пользователя</td></tr>
              <tr><td>profile</td><td>name, picture, locale</td><td>Нужно имя/аватар</td></tr>
              <tr><td>offline_access</td><td>refresh_token</td><td>Фоновый доступ без пользователя</td></tr>
              <tr><td>https://...calendar</td><td>Чтение Google Calendar</td><td>Нужен доступ к Calendar</td></tr>
              <tr><td>repo</td><td>GitHub: доступ к репозиториям</td><td>CI/CD, GitHub Apps</td></tr>
            </tbody>
          </table>
        </div>
        <div className={s.info}>
          <div className={s.infoLabel}>// Принцип минимальных прав</div>
          <p className={s.infoText}>
            Запрашивай только необходимые scopes. Широкие разрешения пугают
            пользователей и увеличивают ущерб при утечке токена. Если нужен только
            email — не запрашивай read:calendar.
          </p>
        </div>
      </section>

      {/* ── 8. Практика Node.js ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Практика: «Войти через Google» на Node.js</h2>
        <p className={s.body}>
          Минимальная реализация OAuth + OIDC с Google без готовых библиотек типа Passport.
          Так понятно что происходит под капотом.
        </p>

        <p className={s.body}><strong>1. Зарегистрировать приложение:</strong></p>
        <pre className={s.codeBlock}><code>{`// console.cloud.google.com → APIs & Services → Credentials
// Создать OAuth 2.0 Client ID
// Authorised redirect URIs: http://localhost:3000/auth/callback

// .env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback`}</code></pre>

        <p className={s.body}><strong>2. Redirect на Google:</strong></p>
        <pre className={s.codeBlock}><code>{`const crypto = require('crypto');

app.get('/auth/google', (req, res) => {
  // Генерируем state для CSRF защиты
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;           // сохраняем в сессии

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
    scope:         'openid email profile',
    state,
    access_type:   'offline',               // получить refresh_token
    prompt:        'select_account',        // показать выбор аккаунта
  });

  res.redirect(
    'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString()
  );
});`}</code></pre>

        <p className={s.body}><strong>3. Обработать callback:</strong></p>
        <pre className={s.codeBlock}><code>{`const { jwtVerify, createRemoteJWKSet } = require('jose');

// Публичные ключи Google (кешируются автоматически)
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  // 1. Проверяем state (CSRF защита)
  if (state !== req.session.oauthState) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  // 2. Обмениваем code на токены
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  // tokens: { access_token, refresh_token, id_token, expires_in }

  // 3. Верифицируем и декодируем id_token
  const { payload } = await jwtVerify(tokens.id_token, GOOGLE_JWKS, {
    issuer:   'https://accounts.google.com',
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  // payload: { sub, email, name, picture, email_verified, ... }

  // 4. Найти или создать пользователя в БД
  let user = await db.findByGoogleSub(payload.sub);
  if (!user) {
    user = await db.createUser({
      googleSub:  payload.sub,             // главный ключ — никогда не меняется
      email:      payload.email,
      name:       payload.name,
      avatar:     payload.picture,
    });
  }

  // 5. Создать собственную сессию
  req.session.userId = user.id;
  res.redirect('/dashboard');
});`}</code></pre>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// На продакшне — используй библиотеку</div>
          <p className={s.calloutText}>
            В реальных проектах используй Passport.js (passport-google-oauth20),
            Auth0, Clerk, или NextAuth.js. Они обрабатывают PKCE, state,
            refresh rotation, JWKS кеширование. Пример выше — для понимания что
            происходит внутри.
          </p>
        </div>
      </section>

      {/* ── 9. Ошибки ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Типичные ошибки</h2>
        <div className={s.pitfallList}>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Не проверять state</p>
            <p className={s.pitfallDesc}>
              Без проверки state в callback возможна CSRF атака: атакующий начинает OAuth
              flow, получает code, подставляет его в твой callback URL — ты привязываешь
              свой аккаунт к чужому Google.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: всегда сравнивать state из callback с сохранённым в сессии</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Хранить client_secret во frontend</p>
            <p className={s.pitfallDesc}>
              SPA: все файлы загружаются браузером, включая JS. Любой может открыть
              DevTools → Sources и найти вшитый secret. Это скомпрометирует всё приложение.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: client_secret только в env на backend. SPA → использовать PKCE без secret</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Использовать email как primary key вместо sub</p>
            <p className={s.pitfallDesc}>
              Email может меняться. Если пользователь изменит email у Google — они больше
              не смогут войти в твой аккаунт (найдёт другого пользователя или не найдёт
              никого). sub у Google не меняется никогда.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: хранить googleSub в БД, email — для отображения, не для поиска</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Wildcard redirect_uri</p>
            <p className={s.pitfallDesc}>
              Регистрировать <code className={s.code}>https://app.com/*</code> вместо точного URL.
              Атакующий может подставить любой path под твоим доменом и перехватить code.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: точный redirect_uri: https://app.com/auth/callback</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Не верифицировать id_token</p>
            <p className={s.pitfallDesc}>
              Принимать payload из id_token без проверки подписи, iss и aud.
              Атакующий может сгенерировать поддельный id_token с нужным sub.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: jwtVerify с JWKS провайдера + проверка issuer и audience</p>
          </div>
        </div>
      </section>

      {/* ── 10. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
