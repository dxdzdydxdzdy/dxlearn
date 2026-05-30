import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ArticleLink } from '@/components/ui/ArticleLink/ArticleLink';
import { BlockingDemo } from './BlockingDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './NodejsBasicsArticle.module.scss';

export function NodejsBasicsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что это ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Node.js — это V8 без браузера</SectionTitle>
        <p className={s.lead}>
          До 2009 года JavaScript работал только в браузере. Node.js изменил это:
          он взял V8 — движок Chrome — и запустил его <strong>отдельно, на сервере</strong>.
          Один язык, два окружения. Код один и тот же, возможности — разные.
        </p>
        <div className={s.anatomy}>
          {[
            {
              name: 'V8',
              origin: 'из Chrome',
              color: '#00e5a0',
              desc: 'Компилирует и выполняет JavaScript. Тот же движок, что в браузере. Понимает весь современный JS.',
            },
            {
              name: 'libuv',
              origin: 'написан для Node.js',
              color: '#4db8ff',
              desc: 'Кроссплатформенная библиотека на C. Даёт Event Loop, пул потоков для I/O, работу с файлами, сетью, таймерами.',
            },
            {
              name: 'Core APIs',
              origin: 'встроенные модули',
              color: '#b48eff',
              desc: 'fs, http, crypto, path, child_process, worker_threads — то, чего нет в браузере, но нужно на сервере.',
            },
          ].map(card => (
            <div key={card.name} className={s.anatomyCard} style={{ '--card-color': card.color } as React.CSSProperties}>
              <div className={s.anatomyName}>{card.name}</div>
              <div className={s.anatomyOrigin}>{card.origin}</div>
              <div className={s.anatomyDesc}>{card.desc}</div>
            </div>
          ))}
        </div>
        <ArticleLink course="general" article="what-is-browser">
          Как устроен V8 изнутри: Ignition, TurboFan, hidden classes, многопроцессная архитектура
        </ArticleLink>
        <p className={s.body}>
          В браузере у JavaScript есть <code>window</code>, <code>document</code>, <code>fetch</code>.
          В Node.js вместо них — <code>process</code>, <code>fs</code>, <code>http</code>.
          Глобальный объект не <code>window</code>, а <code>global</code>.
          Но <code>setTimeout</code>, <code>Promise</code>, <code>Array</code> — одинаковые,
          потому что это стандарт языка, а не среды.
        </p>
      </section>

      {/* ── 2. История ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Почему Node.js вообще появился</SectionTitle>
        <p className={s.lead}>
          В 2009 году Райан Даль (Ryan Dahl) выступил на JSConf с докладом «Node.js:
          Evented I/O for V8 JavaScript». До этого он несколько лет писал серверы на C и Ruby
          и раздражался одним и тем же.
        </p>
        <div className={s.quote}>
          <div className={s.quoteText}>
            «Я смотрел на индикатор загрузки Flickr и понял — браузер не знает, сколько файла
            уже загрузилось. Потому что веб-сервер заблокировал соединение. Это глупо.
            Сервер должен уметь отвечать на другие запросы пока ждёт диск.»
          </div>
          <div className={s.quoteAuthor}>— Ryan Dahl, JSConf 2009</div>
        </div>
        <p className={s.body}>
          Проблема была в том, как традиционные серверы (Apache, nginx того времени, Rails)
          обрабатывали запросы. Каждый запрос → отдельный поток. Поток ждёт ответа от базы данных —
          и просто висит, занимая память. Tысяча запросов = тысяча потоков = гигабайты RAM впустую.
        </p>
        <div className={s.problemBox}>
          <div className={s.problemTitle}>ПРОБЛЕМА THREAD-PER-REQUEST</div>
          <ul className={s.problemList}>
            <li className={s.problemItem}>Каждый поток занимает ~1–2 MB стека + RAM под контекст</li>
            <li className={s.problemItem}>Поток ждёт I/O — CPU простаивает, но поток занят</li>
            <li className={s.problemItem}>1000 одновременных запросов = 1000 потоков = ~1GB RAM только на ожидание</li>
            <li className={s.problemItem}>Переключение между потоками (context switching) — дорогая операция</li>
          </ul>
        </div>
        <p className={s.body}>
          Даль понял: JavaScript — идеальный язык для решения этой проблемы.
          В браузере он уже работал асинхронно — нельзя же заблокировать UI пока грузится картинка.{' '}
          <ArticleLink course="javascript" article="event-loop">Event Loop</ArticleLink> уже был.
          Нужно было только вытащить V8 из браузера и добавить серверные API.
        </p>
      </section>

      {/* ── 3. Blocking vs Non-blocking ──────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Non-blocking I/O: главная идея</SectionTitle>
        <p className={s.lead}>
          Вот четыре запроса к базе данных, каждый из которых занимает разное время.
          Нажми «simulate» и сравни, как их обрабатывает blocking-сервер и Node.js.
        </p>
        <BlockingDemo />
        <p className={s.body}>
          В blocking-модели запросы идут <strong>строго по очереди</strong>: второй ждёт пока
          завершится первый, третий — пока второй. Суммарное время = сумма всех задержек.
        </p>
        <p className={s.body}>
          Node.js запускает <strong>все запросы сразу</strong>. Каждый «ждёт» БД независимо.
          Суммарное время = самый медленный из них. При тысяче пользователей разница огромная.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>КАК ЭТО РАБОТАЕТ ВНУТРИ</div>
          <div className={s.calloutText}>
            Node.js не создаёт тысячу потоков. Он запускает один поток с{' '}
            <ArticleLink course="javascript" article="event-loop">Event Loop</ArticleLink>.
            Когда код говорит «прочитай файл» — libuv отправляет запрос ОС и тут же
            возвращает управление. Когда ОС закончила — кладёт callback в очередь Event Loop.
            В следующем «тике» Event Loop вызывает callback. <strong>Ожидание I/O не блокирует поток.</strong>
          </div>
        </div>
      </section>

      {/* ── 4. Event Loop ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Event Loop в Node.js — те же принципы, больше фаз</SectionTitle>
        <p className={s.body}>
          Event Loop в Node.js устроен похоже на браузерный, но с нюансами: у него есть
          дополнительные фазы специфичные для сервера — таймеры, I/O callbacks, setImmediate.
        </p>
        <CodeHighlight lang="js" code={`// Порядок выполнения в Node.js Event Loop
// (упрощённо: одна итерация цикла)

// ① Timers phase — setTimeout, setInterval чьё время пришло
setTimeout(() => console.log('timer'), 0);

// ② I/O callbacks — завершённые async операции (fs, net)
fs.readFile('file.txt', (err, data) => {
  console.log('file read');       // выполнится здесь
});

// ③ setImmediate — после I/O, до следующих таймеров
setImmediate(() => console.log('immediate'));

// ④ Microtasks — Promise.then и queueMicrotask
//    выполняются МЕЖДУ каждой фазой (не только в конце)
Promise.resolve().then(() => console.log('promise'));

// Вывод (примерный):
// promise   ← microtask, первым делом
// timer     ← фаза Timers
// immediate ← фаза Check
// file read ← зависит от скорости чтения`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ПОЛНЫЙ РАЗБОР</div>
          <div className={s.infoText}>
            Детальный разбор с интерактивным симулятором — Call Stack, Microtask Queue,
            Macrotask Queue, порядок выполнения на конкретных примерах.
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <ArticleLink course="javascript" article="event-loop" />
            <ArticleLink course="javascript" article="promises" />
          </div>
        </div>
      </section>

      {/* ── 5. Первый сервер ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>HTTP-сервер за 6 строк</SectionTitle>
        <p className={s.body}>
          Node.js позволяет поднять HTTP-сервер без фреймворков — через встроенный модуль <code>http</code>.
          На практике используют Express, Fastify, Hono, но понять что под капотом полезно.
        </p>
        <CodeHighlight lang="js" filename="server.js" code={`import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js\\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});`} />
        <CodeHighlight lang="bash" code={`node server.js
# Server running at http://localhost:3000

curl http://localhost:3000
# Hello from Node.js`} />
        <p className={s.body}>
          Каждый входящий запрос вызывает callback-функцию — это и есть event-driven подход.
          Один процесс, один поток, тысячи соединений.
        </p>
        <ArticleLink course="general" article="http-request">
          Анатомия HTTP-запроса: метод, заголовки, тело, коды ответа
        </ArticleLink>
      </section>

      {/* ── 6. npm ───────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>npm: 2+ миллиона пакетов</SectionTitle>
        <p className={s.lead}>
          Вместе с Node.js установился <strong>npm</strong> — менеджер пакетов.
          Это и реестр (registry), и CLI-инструмент. Самый большой реестр пакетов в мире.
        </p>
        <CodeHighlight lang="bash" code={`# Инициализировать проект
npm init -y              # создаст package.json

# Установить пакеты
npm install express      # зависимость проекта → dependencies
npm install -D jest      # только для разработки → devDependencies

# Запустить скрипт из package.json
npm run dev
npm test

# Посмотреть что установлено
npm list --depth=0`} />
        <CodeHighlight lang="js" filename="package.json" code={`{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev":   "node --watch server.js",
    "start": "node server.js",
    "test":  "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}`} />
        <p className={s.body}>
          <code>node_modules/</code> — папка куда npm скачивает пакеты. Никогда не коммить её в git.
          Вместо этого коммитится <code>package.json</code> и <code>package-lock.json</code> —
          по ним любой разработчик восстановит точно те же версии через <code>npm install</code>.
        </p>
        <div className={s.ecosystemRow}>
          {['express', 'fastify', 'prisma', 'jest', 'zod', 'axios', 'lodash', 'dayjs', 'dotenv', 'ts-node', 'nodemon', 'socket.io'].map(pkg => (
            <span key={pkg} className={s.ecosystemPkg}>{pkg}</span>
          ))}
        </div>
      </section>

      {/* ── 7. Встроенные модули ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что умеет Node.js «из коробки»</SectionTitle>
        <CodeHighlight lang="js" code={`// Файловая система
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const content = await readFile('./data.json', 'utf-8');

// HTTP-клиент (встроенный fetch с Node 18+)
const res = await fetch('https://api.example.com/users');
const users = await res.json();

// Криптография
import { createHash, randomBytes } from 'node:crypto';
const hash = createHash('sha256').update('password').digest('hex');
const token = randomBytes(32).toString('hex');

// Переменные окружения
const PORT = process.env.PORT ?? 3000;
const DB_URL = process.env.DATABASE_URL;

// Дочерние процессы (запустить команду в shell)
import { exec } from 'node:child_process';
exec('git log --oneline -5', (err, stdout) => console.log(stdout));

// CPU-задачи в отдельном потоке
import { Worker } from 'node:worker_threads';`} />
      </section>

      {/* ── 8. Когда Node.js (и когда нет) ──────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда использовать Node.js — и когда нет</SectionTitle>
        <p className={s.body}>
          Node.js отлично справляется с I/O-задачами и плохо — с CPU-intensive.
          Это не недостаток, это архитектурный выбор.
        </p>
        <div className={s.useCaseGrid}>
          <div className={s.useCaseCard}>
            <div className={s.useCaseHead} style={{ color: '#00e5a0', background: 'rgba(0,229,160,0.05)' }}>
              Node.js — хороший выбор
            </div>
            <ul className={s.useCaseList}>
              {[
                { text: 'REST API и GraphQL серверы', course: 'backend', article: 'rest-api-design' },
                { text: 'Real-time приложения (чат, live-уведомления, WebSocket)', course: null, article: null },
                { text: 'BFF (Backend for Frontend) — агрегация данных из нескольких API', course: null, article: null },
                { text: 'Микросервисы с I/O-нагрузкой', course: null, article: null },
                { text: 'CLI-инструменты и скрипты', course: null, article: null },
                { text: 'Streaming данных (аудио, видео, файлы)', course: null, article: null },
              ].map(item => (
                <li key={item.text} className={s.useCaseItem}>
                  <span className={`${s.icon} ${s.ok}`}>✓</span>
                  {item.course
                    ? <ArticleLink course={item.course} article={item.article!}>{item.text}</ArticleLink>
                    : item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className={s.useCaseCard}>
            <div className={s.useCaseHead} style={{ color: '#ff5f6a', background: 'rgba(255,95,106,0.05)' }}>
              Лучше другой инструмент
            </div>
            <ul className={s.useCaseList}>
              {[
                'Тяжёлые вычисления: ML, кодирование видео, криптомайнинг',
                'CPU-intensive операции на каждый запрос (блокируют Event Loop)',
                'Задачи где Go/Rust нужны по производительности',
                'Приложения с огромным монолитным состоянием в памяти',
              ].map(item => (
                <li key={item} className={s.useCaseItem}>
                  <span className={`${s.icon} ${s.no}`}>✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Callout variant="warn">
          Самая частая ошибка новичков — запустить тяжёлый цикл или синхронное шифрование
          прямо в обработчике запроса. Event Loop встаёт колом, все остальные запросы
          ждут. Для CPU-задач есть <code>worker_threads</code> или выносят логику в отдельный сервис.
        </Callout>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
