import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ArticleLink } from '@/components/ui/ArticleLink/ArticleLink';
import { ServerPlayground } from './ServerPlayground';
import { QUIZ_QUESTIONS } from './quizData';
import s from './HttpServerBasicsArticle.module.scss';

const STATUS_CODES = [
  { code: '2xx', color: '#00e5a0', name: 'Успех', desc: '200 — всё хорошо. 201 — создано. 204 — успех, но ответа нет.' },
  { code: '4xx', color: '#ff5f6a', name: 'Ошибка клиента', desc: '400 — неверный запрос. 401 — нужна авторизация. 404 — не найдено.' },
  { code: '5xx', color: '#f0c040', name: 'Ошибка сервера', desc: '500 — что-то сломалось на сервере. 503 — сервер недоступен.' },
];

export function HttpServerBasicsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое сервер ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое сервер</SectionTitle>
        <p className={s.lead}>
          Сервер — это программа, которая <strong>ждёт запросов</strong> и <strong>отвечает на них</strong>.
          Вот и всё. Никакой магии.
        </p>
        <div className={s.analogy}>
          <div className={s.analogyLabel}>// аналогия</div>
          <div className={s.analogyRow}>
            <div className={s.analogyCol}>
              <div className={s.analogyTerm}>Официант в ресторане</div>
              <div className={s.analogyDesc}>Стоит и ждёт. Гость подходит с заказом — официант принимает, уходит на кухню, возвращается с едой.</div>
            </div>
            <div className={s.analogyArrow}>≈</div>
            <div className={s.analogyCol}>
              <div className={s.analogyTerm}>Сервер</div>
              <div className={s.analogyDesc}>Запущен и ждёт. Браузер отправляет запрос — сервер принимает, обрабатывает, возвращает ответ.</div>
            </div>
          </div>
        </div>
        <p className={s.body}>
          Когда ты открываешь сайт, твой браузер отправляет запрос на сервер.
          Сервер смотрит что именно просят, готовит ответ и отправляет обратно.
          Браузер получает ответ и показывает тебе страницу.
        </p>
        <p className={s.body}>
          Node.js позволяет написать такую программу-сервер на JavaScript.
          Давай сделаем это шаг за шагом.
        </p>
      </section>

      {/* ── 2. Минимальный сервер ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Минимальный сервер — 5 строк</SectionTitle>
        <p className={s.body}>
          В Node.js есть встроенный модуль <code>http</code> — он умеет принимать запросы из сети.
          Вот самый простой сервер, который можно написать:
        </p>
        <CodeHighlight lang="js" filename="server.js" code={`import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.end('Привет, мир!');
});

server.listen(3000);`} />
        <div className={s.steps}>
          {[
            {
              num: '1',
              title: 'createServer()',
              desc: 'Создаёт сервер. Передаём функцию — она будет вызываться на каждый входящий запрос. req — информация о запросе, res — инструмент для отправки ответа.',
            },
            {
              num: '2',
              title: 'res.end(\'Привет, мир!\')',
              desc: 'Отправляет ответ и закрывает соединение. Всё что передаём в end() — это тело ответа, то что увидит браузер.',
            },
            {
              num: '3',
              title: 'server.listen(3000)',
              desc: 'Говорит серверу начать слушать на порту 3000. Порт — это как номер квартиры в доме: у одного IP-адреса может быть тысячи портов для разных программ.',
            },
          ].map(step => (
            <div key={step.num} className={s.step}>
              <div className={s.stepNum}>{step.num}</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>{step.title}</div>
                <div className={s.stepDesc} dangerouslySetInnerHTML={{ __html: step.desc.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
              </div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="bash" code={`# Запустить сервер
node server.js

# Открой в браузере: http://localhost:3000
# Или проверь в терминале:
curl http://localhost:3000
# → Привет, мир!`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>ЧТО ТАКОЕ ПОРТ</div>
          <div className={s.calloutText}>
            Компьютер — это как многоквартирный дом. IP-адрес — адрес дома, порт — номер квартиры.
            Браузер по умолчанию стучится на порт <code>80</code> (HTTP) или <code>443</code> (HTTPS).
            Когда ты пишешь <code>localhost:3000</code> — указываешь явно на «квартиру 3000».
            На твоём компьютере могут одновременно работать много серверов — каждый на своём порту.
          </div>
        </div>
      </section>

      {/* ── 3. Коды ответа ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Коды ответа: как сервер говорит «всё хорошо» или «не нашёл»</SectionTitle>
        <p className={s.body}>
          Вместе с каждым ответом сервер отправляет трёхзначный код — стандартный способ
          сказать браузеру, как всё прошло. Ты наверняка видел 404 — это он и есть.
        </p>
        <div className={s.statusGrid}>
          {STATUS_CODES.map(s2 => (
            <div key={s2.code} className={s.statusCard} style={{ borderTop: `3px solid ${s2.color}` }}>
              <div className={s.statusCode} style={{ color: s2.color }}>{s2.code}</div>
              <div className={s.statusName}>{s2.name}</div>
              <div className={s.statusDesc}>{s2.desc}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="js" code={`createServer((req, res) => {
  // writeHead() устанавливает код и заголовки
  res.writeHead(200);           // 200 = всё хорошо
  res.end('Вот твои данные');

  // или если что-то пошло не так:
  res.writeHead(404);           // 404 = не нашли
  res.end('Такой страницы нет');
});`} />
      </section>

      {/* ── 4. Разные адреса — разные ответы ────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Разные адреса — разные ответы</SectionTitle>
        <p className={s.lead}>
          Настоящий сервер умеет отвечать по-разному в зависимости от того,
          что запросили. Для этого смотрим на <code>req.url</code> и <code>req.method</code>.
        </p>
        <p className={s.body}>
          <code>req.url</code> — адрес запроса: <code>/</code>, <code>/users</code>, <code>/about</code>.{' '}
          <code>req.method</code> — тип запроса: <code>GET</code> (получить данные), <code>POST</code> (отправить данные).
        </p>
        <CodeHighlight lang="js" filename="server.js" code={`import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end('Главная страница');

  } else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200);
    res.end('О нас');

  } else {
    // Всё остальное — не нашли
    res.writeHead(404);
    res.end('Страница не найдена');
  }
});

server.listen(3000);`} />
        <p className={s.body}>
          Такой подход называют <strong>роутингом</strong> — распределением запросов по адресам.
          Пока у нас два адреса — это удобно. Что будет когда их станет двадцать — увидим в конце статьи.
        </p>
      </section>

      {/* ── 5. Отдаём JSON ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Отдаём данные в формате JSON</SectionTitle>
        <p className={s.body}>
          Сайты обычно обмениваются данными в формате JSON — это просто текст,
          который удобно разбирать программно. Чтобы отправить JSON, нужно
          сделать две вещи: сообщить браузеру формат и превратить объект в строку.
        </p>
        <CodeHighlight lang="js" code={`createServer((req, res) => {
  if (req.url === '/users' && req.method === 'GET') {

    const users = [
      { id: 1, name: 'Алиса', age: 25 },
      { id: 2, name: 'Боб',   age: 30 },
    ];

    res.writeHead(200, {
      'Content-Type': 'application/json', // говорим: внутри JSON
    });
    res.end(JSON.stringify(users)); // объект → строка
  }
});`} />
        <Callout variant="info">
          <code>JSON.stringify()</code> превращает JavaScript-объект в строку формата JSON.
          Обратная операция — <code>JSON.parse()</code> — строку обратно в объект.
          Это нужно потому что по сети можно передать только текст.
        </Callout>
      </section>

      {/* ── 6. Принимаем данные ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Принимаем данные от пользователя</SectionTitle>
        <p className={s.body}>
          Когда пользователь заполняет форму или приложение отправляет данные —
          это POST-запрос. Данные приходят в теле запроса. Читаем их так:
        </p>
        <CodeHighlight lang="js" code={`createServer((req, res) => {
  if (req.url === '/users' && req.method === 'POST') {

    let body = '';

    // Данные приходят кусками — собираем их
    req.on('data', chunk => {
      body += chunk;
    });

    // Все куски пришли — разбираем
    req.on('end', () => {
      const newUser = JSON.parse(body); // строка → объект

      console.log('Создаём пользователя:', newUser);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 3, ...newUser }));
    });
  }
});`} />
        <p className={s.body}>
          Данные приходят кусками потому что сеть работает именно так — поток байт,
          а не одно целое сообщение. Это та же неблокирующая модель Node.js в действии:{' '}
          <ArticleLink course="backend" article="nodejs-basics">подробнее про non-blocking I/O</ArticleLink>.
        </p>
      </section>

      {/* ── 7. Интерактив ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: отправь запрос к серверу</SectionTitle>
        <p className={s.body}>
          Выбери запрос слева — справа увидишь ответ, а в коде подсветится
          именно тот участок, который его обрабатывает.
        </p>
        <ServerPlayground />
      </section>

      {/* ── 8. Обработка ошибок ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Обработка ошибок</SectionTitle>
        <p className={s.body}>
          Всегда добавляй обработку непредвиденных ситуаций — иначе сервер упадёт
          и перестанет отвечать на все запросы.
        </p>
        <CodeHighlight lang="js" code={`createServer(async (req, res) => {
  try {

    if (req.url === '/users') {
      // какая-то логика...
      res.writeHead(200);
      res.end('OK');
    } else {
      res.writeHead(404);
      res.end('Не найдено');
    }

  } catch (error) {
    // Что-то пошло не так — сообщаем об ошибке
    console.error(error);
    res.writeHead(500);
    res.end('Внутренняя ошибка сервера');
  }
});`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>ВАЖНО</div>
          <div className={s.warnText}>
            Если в обработчике запроса произойдёт необработанная ошибка —
            соединение зависнет и браузер будет ждать ответа вечно.
            Всегда оборачивай логику в <strong>try/catch</strong> и всегда отправляй какой-то ответ.
          </div>
        </div>
      </section>

      {/* ── 9. Переход к следующему ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда это перестаёт быть удобным</SectionTitle>
        <p className={s.body}>
          Пока у сервера 3–4 адреса — всё нормально. Но представь что их стало 30:
        </p>
        <CodeHighlight lang="js" code={`// Через некоторое время код начинает выглядеть вот так:
if (url === '/' && method === 'GET') { ... }
else if (url === '/users' && method === 'GET') { ... }
else if (url === '/users' && method === 'POST') { ... }
else if (url === '/users/1' && method === 'GET') { ... }
else if (url === '/users/1' && method === 'PUT') { ... }
else if (url === '/users/1' && method === 'DELETE') { ... }
else if (url === '/posts' && method === 'GET') { ... }
else if (url === '/posts' && method === 'POST') { ... }
// ... ещё 22 строки`} />
        <p className={s.body}>
          Именно для решения этой проблемы существуют библиотеки — они берут
          на себя роутинг, парсинг тела и многое другое, чтобы ты мог сосредоточиться
          на логике, а не на шаблонном коде. Про это — в следующей статье.
        </p>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
