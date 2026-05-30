import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ArticleLink } from '@/components/ui/ArticleLink/ArticleLink';
import { MiddlewareDemo } from './MiddlewareDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './ExpressBasicsArticle.module.scss';

const HTTP_METHODS = [
  { name: 'GET',    color: '#00e5a0', desc: 'Получить данные' },
  { name: 'POST',   color: '#4db8ff', desc: 'Создать что-то новое' },
  { name: 'PUT',    color: '#f0c040', desc: 'Заменить целиком' },
  { name: 'PATCH',  color: '#b48eff', desc: 'Изменить частично' },
  { name: 'DELETE', color: '#ff5f6a', desc: 'Удалить' },
];

const REQ_PROPS = [
  { name: 'req.params', desc: 'Параметры из URL-пути. Для маршрута /users/:id запрос на /users/42 даст req.params.id === "42"' },
  { name: 'req.query',  desc: 'Параметры после ?. Запрос /users?page=2&limit=10 даст req.query.page === "2"' },
  { name: 'req.body',   desc: 'Тело запроса. Доступно после middleware express.json(). Для POST с JSON получишь готовый объект.' },
  { name: 'req.headers',desc: 'Заголовки запроса. req.headers[\'authorization\'] — например для чтения токена.' },
  { name: 'req.method', desc: 'HTTP-метод запроса: "GET", "POST", "PUT" и т.д.' },
  { name: 'req.url',    desc: 'Полный URL запроса включая query-строку: "/users?page=1"' },
];

const RES_METHODS = [
  { name: 'res.json(data)',         desc: 'Отправляет JSON-ответ. Автоматически ставит Content-Type: application/json.' },
  { name: 'res.send(text)',         desc: 'Отправляет текстовый ответ. Подходит для строк и HTML.' },
  { name: 'res.status(code)',       desc: 'Устанавливает код ответа. Возвращает res, поэтому можно цепочкой: res.status(201).json(...)' },
  { name: 'res.sendFile(path)',     desc: 'Отправляет файл. Удобно для отдачи HTML-страниц или картинок.' },
  { name: 'res.redirect(url)',      desc: 'Перенаправляет на другой URL с кодом 302.' },
];

export function ExpressBasicsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое Express ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое Express и зачем он нужен</SectionTitle>
        <p className={s.lead}>
          Express — это <strong>библиотека для Node.js</strong> которая берёт на себя
          скучную часть написания сервера: разбор маршрутов, чтение тела запроса,
          установку заголовков. Ты описываешь только логику, а не инфраструктуру.
        </p>
        <p className={s.body}>
          В прошлой статье мы написали сервер на чистом Node.js. Вот что получилось
          когда маршрутов стало больше:
        </p>
        <div className={s.compare}>
          <div className={s.compareCol}>
            <span className={`${s.compareLabel} ${s.bad}`}>без Express</span>
            <CodeHighlight lang="js" code={`if (url === '/users' && method === 'GET') {
  // ...
} else if (url === '/users' && method === 'POST') {
  // ...
} else if (url.startsWith('/users/') && method === 'GET') {
  const id = url.split('/')[2]; // парсим вручную
  // ...
} else if (url.startsWith('/users/') && method === 'DELETE') {
  // ...
} else {
  res.writeHead(404);
  res.end('Not found');
}`} />
          </div>
          <div className={s.compareCol}>
            <span className={`${s.compareLabel} ${s.good}`}>с Express</span>
            <CodeHighlight lang="js" code={`app.get('/users', getUsers);
app.post('/users', createUser);
app.get('/users/:id', getUserById);
app.delete('/users/:id', deleteUser);

// Express сам:
// - разберёт маршрут
// - извлечёт :id
// - вернёт 404 если нет совпадения`} />
          </div>
        </div>
        <p className={s.body}>
          Один и тот же результат — в несколько раз меньше кода, который к тому же
          легче читать и поддерживать.
        </p>
      </section>

      {/* ── 2. Установка ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Установка и первый запуск</SectionTitle>
        <CodeHighlight lang="bash" code={`npm install express
npm install -D @types/express   # если используешь TypeScript`} />
        <CodeHighlight lang="js" filename="server.js" code={`import express from 'express';

const app = express();

// Middleware: разрешаем принимать JSON в теле запросов
app.use(express.json());

// Первый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Запускаем на порту 3000
app.listen(3000, () => {
  console.log('http://localhost:3000');
});`} />
        <CodeHighlight lang="bash" code={`node server.js
# http://localhost:3000

curl http://localhost:3000
# { "message": "Сервер работает!" }`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>ЧТО ТАКОЕ app</div>
          <div className={s.calloutText}>
            <code>express()</code> возвращает объект приложения — обычно называют <code>app</code>.
            Через него регистрируются маршруты, middleware, и запускается сервер.
            Под капотом это тот же Node.js <code>http.createServer()</code> — Express просто
            добавляет удобный слой поверх него.
          </div>
        </div>
      </section>

      {/* ── 3. Маршруты ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Маршруты: кто отвечает на какой запрос</SectionTitle>
        <p className={s.lead}>
          Маршрут — это связка <em>HTTP-метода + URL + функции-обработчика</em>.
          Express вызывает обработчик когда входящий запрос совпадает.
        </p>
        <div className={s.methodGrid}>
          {HTTP_METHODS.map(m => (
            <div key={m.name} className={s.methodCard} style={{ borderTop: `2px solid ${m.color}` }}>
              <div className={s.methodName} style={{ color: m.color }}>{m.name}</div>
              <div className={s.methodDesc}>{m.desc}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="js" code={`// Синтаксис: app.метод(путь, обработчик)

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Алиса' }]);
});

app.post('/users', (req, res) => {
  const newUser = req.body;           // данные из тела запроса
  // ... сохраняем пользователя
  res.status(201).json(newUser);      // 201 = Created
});

app.get('/users/:id', (req, res) => {
  const id = req.params.id;           // извлекаем :id из URL
  res.json({ id, name: 'Боб' });
});

app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  // ... обновляем пользователя
  res.json({ id, ...updates });
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  // ... удаляем пользователя
  res.status(204).send();             // 204 = No Content (удалено, ответа нет)
});`} />
        <p className={s.body}>
          Двоеточие в пути (<code>:id</code>) — это <strong>параметр маршрута</strong>.
          Express автоматически извлечёт его из URL и положит в <code>req.params</code>.
          Можно иметь несколько параметров: <code>/courses/:courseId/articles/:articleId</code>.
        </p>
      </section>

      {/* ── 4. req и res ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>req и res — запрос и ответ</SectionTitle>
        <p className={s.body}>
          Каждый обработчик получает два объекта: <code>req</code> (request — запрос)
          и <code>res</code> (response — ответ). В них всё что нужно для работы.
        </p>

        <p className={s.body}><strong>Объект запроса (req) — что пришло от клиента:</strong></p>
        <div className={s.propTable}>
          {REQ_PROPS.map(p => (
            <div key={p.name} className={s.propRow}>
              <div className={s.propName}>{p.name}</div>
              <div className={s.propDesc} dangerouslySetInnerHTML={{ __html:
                p.desc.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          ))}
        </div>

        <CodeHighlight lang="js" code={`// Пример: GET /users/42?format=short
app.get('/users/:id', (req, res) => {
  console.log(req.params.id);     // "42"
  console.log(req.query.format);  // "short"
  console.log(req.method);        // "GET"
  console.log(req.headers['user-agent']); // браузер или curl
});

// Пример: POST /users с телом { "name": "Алиса" }
app.post('/users', (req, res) => {
  console.log(req.body.name);     // "Алиса"
  // (работает только после app.use(express.json()))
});`} />

        <p className={s.body}><strong>Объект ответа (res) — что отправить клиенту:</strong></p>
        <div className={s.propTable}>
          {RES_METHODS.map(p => (
            <div key={p.name} className={s.propRow}>
              <div className={s.propName}>{p.name}</div>
              <div className={s.propDesc} dangerouslySetInnerHTML={{ __html:
                p.desc.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          ))}
        </div>

        <CodeHighlight lang="js" code={`// Можно цепочкой: сначала статус, потом json
res.status(201).json({ id: 3, name: 'Новый пользователь' });
res.status(404).json({ error: 'Пользователь не найден' });
res.status(400).json({ error: 'Неверный формат данных' });

// Просто текст
res.status(200).send('Всё хорошо');

// Перенаправление
res.redirect('/login');`} />
      </section>

      {/* ── 5. Middleware ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Middleware — цепочка обработчиков</SectionTitle>
        <p className={s.lead}>
          Middleware — это функция, которая запускается <em>между</em> получением запроса
          и отправкой ответа. Каждый запрос проходит через все middleware по очереди.
        </p>
        <p className={s.body}>
          Функция middleware принимает три параметра: <code>req</code>, <code>res</code> и <code>next</code>.
          Вызов <code>next()</code> передаёт управление следующему middleware в цепочке.
          Если не вызвать <code>next()</code> и не отправить ответ — запрос зависнет.
        </p>
        <CodeHighlight lang="js" code={`// Middleware — это просто функция с тремя аргументами
function myMiddleware(req, res, next) {
  // делаем что-то...
  console.log('Запрос:', req.method, req.url);

  // передаём управление следующему
  next();
}

// Регистрируем через app.use()
app.use(myMiddleware);

// Встроенный middleware для парсинга JSON-тела
app.use(express.json());

// Middleware только для конкретного пути
app.use('/admin', checkAdminRights);`} />

        <p className={s.body}><strong>Порядок важен.</strong> Middleware выполняются в том порядке, в котором зарегистрированы.</p>

        <CodeHighlight lang="js" code={`// ✓ Правильно: express.json() стоит ДО маршрутов
app.use(express.json());        // сначала парсим тело
app.use(logger);                // логируем
app.post('/users', createUser); // только потом обработчик

// ✗ Неправильно: express.json() ПОСЛЕ маршрута
app.post('/users', createUser); // req.body = undefined!
app.use(express.json());        // слишком поздно`} />

        <p className={s.body}>
          Нажми simulate ниже — посмотри как запрос проходит через цепочку.
          Переключи режим «без токена» чтобы увидеть как middleware прерывает цепочку.
        </p>
        <MiddlewareDemo />
      </section>

      {/* ── 6. Собственный middleware ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Пишем свой middleware</SectionTitle>
        <p className={s.body}>
          Middleware — мощный инструмент для вещей которые нужны на многих маршрутах:
          логирование, проверка авторизации, обработка ошибок.
        </p>
        <CodeHighlight lang="js" code={`// Логгер — записывает каждый запрос
function logger(req, res, next) {
  const start = Date.now();
  console.log(\`→ \${req.method} \${req.url}\`);

  // res.on('finish') срабатывает когда ответ отправлен
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(\`← \${res.statusCode} \${ms}ms\`);
  });

  next();
}

// Проверка авторизации
function requireAuth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).json({ error: 'Нужна авторизация' });
    return; // важно: остановить выполнение после ответа
  }

  // Токен есть — передаём управление дальше
  next();
}

// Применяем middleware
app.use(logger);                          // для всех маршрутов
app.get('/public', getPublicData);        // без авторизации
app.get('/private', requireAuth, getPrivateData); // с авторизацией`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>ЧАСТАЯ ОШИБКА</div>
          <div className={s.warnText}>
            Всегда ставь <code>return</code> после <code>res.json()</code> в middleware.
            Без <code>return</code> код продолжит выполняться и вызовет <code>next()</code> —
            ты отправишь два ответа на один запрос и получишь ошибку
            <strong> «Cannot set headers after they are sent»</strong>.
          </div>
        </div>
      </section>

      {/* ── 7. Роутер ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Router — организуем маршруты по файлам</SectionTitle>
        <p className={s.body}>
          Когда маршрутов становится много — удобно разбить их по файлам.
          <code>express.Router()</code> создаёт мини-приложение с собственными маршрутами,
          которое потом подключается к основному app.
        </p>
        <div className={s.folder}>
          <div><span className="dir">src/</span></div>
          <div>&nbsp;&nbsp;<span className="file">server.js</span> <span className="note">← точка входа</span></div>
          <div>&nbsp;&nbsp;<span className="dir">routes/</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="file">users.js</span> <span className="note">← маршруты /users</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="file">tasks.js</span> <span className="note">← маршруты /tasks</span></div>
          <div>&nbsp;&nbsp;<span className="dir">middleware/</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="file">auth.js</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="file">logger.js</span></div>
        </div>
        <CodeHighlight lang="js" filename="routes/users.js" code={`import { Router } from 'express';
const router = Router();

// Все пути здесь относительны: '/' = '/users'
router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Алиса' }]);
});

router.post('/', (req, res) => {
  res.status(201).json(req.body);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;`} />
        <CodeHighlight lang="js" filename="server.js" code={`import express from 'express';
import usersRouter from './routes/users.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(express.json());

// Подключаем роутеры с префиксами
app.use('/users', usersRouter); // /users, /users/:id
app.use('/tasks', tasksRouter); // /tasks, /tasks/:id

app.listen(3000);`} />
      </section>

      {/* ── 8. Обработка ошибок ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Обработка ошибок</SectionTitle>
        <p className={s.body}>
          В Express есть специальный вид middleware для ошибок — он принимает
          <strong> четыре параметра</strong>: <code>err, req, res, next</code>.
          Express определяет его именно по количеству параметров.
        </p>
        <CodeHighlight lang="js" code={`// Обычный маршрут — передаём ошибку через next(err)
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Не найден' });
    }
    res.json(user);
  } catch (err) {
    next(err); // передаём в error middleware
  }
});

// 404 — маршрут не найден (ставим перед error handler)
app.use((req, res) => {
  res.status(404).json({ error: \`\${req.url} не найден\` });
});

// Error handler — 4 параметра, ставим последним!
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status ?? 500).json({
    error: err.message ?? 'Внутренняя ошибка сервера',
  });
});`} />
        <Callout variant="warn">
          Error handler должен быть <strong>последним</strong> в цепочке — после всех маршрутов и middleware.
          Иначе ошибки из маршрутов зарегистрированных позже не попадут в него.
        </Callout>
      </section>

      {/* ── 9. Полный пример ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Полный пример: CRUD для задач</SectionTitle>
        <p className={s.body}>
          Соберём всё вместе — небольшой API для списка задач.
          GET, POST, PUT, DELETE — четыре операции, которые нужны в любом приложении.
        </p>
        <CodeHighlight lang="js" filename="server.js" code={`import express from 'express';

const app = express();
app.use(express.json());

// "База данных" в памяти (в реальном проекте — PostgreSQL, MongoDB...)
let tasks = [
  { id: 1, title: 'Изучить Express', done: false },
  { id: 2, title: 'Написать API',    done: false },
];
let nextId = 3;

// GET /tasks — получить все задачи
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id — получить одну задачу
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Задача не найдена' });
  res.json(task);
});

// POST /tasks — создать задачу
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Нужен title' });

  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /tasks/:id — обновить задачу
app.put('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Задача не найдена' });

  tasks[index] = { ...tasks[index], ...req.body };
  res.json(tasks[index]);
});

// DELETE /tasks/:id — удалить задачу
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Задача не найдена' });

  tasks.splice(index, 1);
  res.status(204).send();
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Ошибка сервера' });
});

app.listen(3000, () => console.log('http://localhost:3000'));`} />
        <CodeHighlight lang="bash" code={`# Получить все задачи
curl http://localhost:3000/tasks

# Создать задачу
curl -X POST http://localhost:3000/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Новая задача"}'

# Обновить задачу (отметить выполненной)
curl -X PUT http://localhost:3000/tasks/1 \\
  -H "Content-Type: application/json" \\
  -d '{"done": true}'

# Удалить задачу
curl -X DELETE http://localhost:3000/tasks/2`} />
        <p className={s.body}>
          Это полноценный рабочий API. В реальном проекте вместо массива в памяти
          будет подключение к базе данных. О том как это сделать — в разделе{' '}
          <ArticleLink course="databases" article="databases-intro">Введение в базы данных</ArticleLink>.
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
