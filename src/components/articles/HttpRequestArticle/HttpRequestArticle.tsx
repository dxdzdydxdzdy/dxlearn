import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { HttpInspector } from './HttpInspector';
import { QUIZ_QUESTIONS } from './quizData';
import s from './HttpRequestArticle.module.scss';

const METHODS = [
  { method: 'GET', color: '#00e5a0', use: 'Получить данные', body: 'Нет', safe: 'Да', example: 'GET /api/users' },
  { method: 'POST', color: '#f0c040', use: 'Создать ресурс', body: 'Да', safe: 'Нет', example: 'POST /api/users' },
  { method: 'PUT', color: '#4e9eff', use: 'Заменить ресурс целиком', body: 'Да', safe: 'Нет', example: 'PUT /api/users/42' },
  { method: 'PATCH', color: '#b48eff', use: 'Частично обновить', body: 'Да', safe: 'Нет', example: 'PATCH /api/users/42' },
  { method: 'DELETE', color: '#ff5f6a', use: 'Удалить ресурс', body: 'Нет', safe: 'Нет', example: 'DELETE /api/users/42' },
];

export function HttpRequestArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Зачем знать HTTP</SectionTitle>
        <p className={s.prose}>
          Каждый раз, когда твой код вызывает <code>fetch()</code> или axios — он отправляет HTTP-запрос.
          Каждый раз, когда Next.js получает страницу — это HTTP. REST API, GraphQL, WebSocket upgrade —
          всё начинается с HTTP. <strong>Не понимая HTTP, ты не понимаешь сеть вообще</strong>.
        </p>
        <p className={s.prose}>
          HTTP — текстовый протокол запрос/ответ поверх TCP. Запрос состоит из
          стартовой строки, заголовков и тела. Ответ — из статусной строки, заголовков и тела.
          Ниже — живая анатомия: кликни на любую часть, чтобы увидеть что это и зачем.
        </p>
        <HttpInspector />
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>HTTP-методы</SectionTitle>
        <p className={s.prose}>
          Метод — это <strong>намерение</strong>. REST-архитектура строится на том, что
          URL описывает ресурс, а метод — действие над ним.
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Метод</th><th>Зачем</th><th>Тело</th><th>Пример</th></tr>
          </thead>
          <tbody>
            {METHODS.map(m => (
              <tr key={m.method} className={s.tableRow}>
                <td>
                  <span className={s.methodBadge} style={{ background: m.color }}>{m.method}</span>
                </td>
                <td>{m.use}</td>
                <td>{m.body}</td>
                <td><code>{m.example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Callout variant="info">
          <strong>GET безопасен и идемпотентен</strong> — его можно повторять без побочных эффектов,
          браузер его кэширует. <strong>POST не идемпотентен</strong> — два одинаковых POST создадут
          два ресурса. Это влияет на логику retry в случае ошибки сети.
        </Callout>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Заголовки, которые используешь каждый день</SectionTitle>
        <CodeHighlight lang="js" code={`// Авторизованный POST-запрос с JSON
const res = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',   // формат тела
    'Authorization': \`Bearer \${token}\`,  // аутентификация
    'Accept': 'application/json',         // что хотим получить
  },
  body: JSON.stringify({ title: 'Hello', body: 'World' }),
});

// Читаем заголовки ответа
const contentType = res.headers.get('Content-Type');
const rateLimitLeft = res.headers.get('X-RateLimit-Remaining');`} />
        <CodeHighlight lang="js" code={`// Работа с кэшем
// Cache-Control: max-age=3600   → кэш на 1 час
// Cache-Control: no-store       → не кэшировать вообще
// Cache-Control: stale-while-revalidate → отдавать кэш, обновлять фоново

// В Next.js fetch это конфигурируется напрямую:
fetch('/api/data', { next: { revalidate: 3600 } }); // ISR
fetch('/api/data', { cache: 'no-store' });           // без кэша`} />
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>HTTPS: зачем TLS</SectionTitle>
        <p className={s.prose}>
          HTTP передаёт данные открытым текстом. <strong>HTTPS = HTTP + TLS</strong> — шифрование
          поверх TCP. Без HTTPS провайдер, роутер или публичный Wi-Fi видят всё: токены, пароли, тело запросов.
        </p>
        <p className={s.prose}>
          TLS добавляет задержку — один дополнительный round-trip для handshake. Но с
          <code>TLS 1.3</code> и <code>HTTP/2</code> эта разница минимальна. Браузеры помечают
          HTTP-сайты как "небезопасные", а Google ранжирует HTTPS выше.
        </p>
        <Callout variant="warn">
          Никогда не передавай токены и пароли по HTTP. В prod всегда HTTPS.
          Для локальной разработки используй <code>localhost</code> — браузер делает исключение,
          или настрой <code>mkcert</code> для локальных HTTPS-сертификатов.
        </Callout>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
