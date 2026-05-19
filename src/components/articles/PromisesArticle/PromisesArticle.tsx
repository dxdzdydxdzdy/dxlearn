import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { PromiseStateDemo } from './PromiseStateDemo';
import { ChainingDemo } from './ChainingDemo';
import { CombinatorsDemo } from './CombinatorsDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './PromisesArticle.module.scss';

export function PromisesArticle() {
  return (
    <div className={s.root}>

      {/* 1 — Зачем промисы? */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Зачем промисы?</h2>
        <p className={s.prose}>
          До промисов асинхронный код в JavaScript писался на колбэках. Когда операций несколько —
          колбэки вкладывались друг в друга, образуя знаменитую «пирамиду смерти» (callback hell):
          код становился нечитаемым, ошибки терялись, логика размывалась.
        </p>
        <CodeHighlight
          lang="js"
          filename="callback-hell.js"
          code={`// Колбэк-ад: три последовательных запроса
getUser(userId, function(err, user) {
  if (err) return handleError(err);
  getOrders(user.id, function(err, orders) {
    if (err) return handleError(err);
    getInvoice(orders[0].id, function(err, invoice) {
      if (err) return handleError(err);
      // наконец делаем что-то с данными
      console.log(invoice);
    });
  });
});`}
        />
        <p className={s.prose}>
          Каждый уровень вложенности добавляет отступ, требует отдельной обработки ошибки, затрудняет
          повторное использование кода. Промисы решают эту проблему — они представляют собой объект,
          инкапсулирующий результат асинхронной операции. Вместо «передай мне колбэк» говоришь
          «верни мне обещание», с которым можно работать по цепочке:
        </p>
        <CodeHighlight
          lang="js"
          filename="promises-chain.js"
          code={`// Тот же код с промисами
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getInvoice(orders[0].id))
  .then(invoice => console.log(invoice))
  .catch(err => handleError(err)); // одна точка обработки всех ошибок`}
        />
        <Callout variant="accent">
          Промисы — это не просто синтаксический сахар. Они стандартизированы в спецификации
          Promises/A+ и встроены в язык начиная с ES2015. Async/await, появившийся в ES2017,
          построен поверх промисов и лишь делает работу с ними ещё удобнее.
        </Callout>
      </section>

      {/* 2 — Три состояния */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Три состояния промиса</h2>
        <p className={s.prose}>
          Любой промис в каждый момент времени находится ровно в одном из трёх состояний:
        </p>
        <div className={s.twoCol}>
          <div>
            <p className={s.prose}>
              <strong>pending</strong> — начальное состояние. Промис создан, но операция ещё не завершена.
              Промис остаётся в этом состоянии до тех пор, пока не будет вызван <code>resolve</code> или <code>reject</code>.
            </p>
            <p className={s.prose}>
              <strong>fulfilled</strong> — операция завершилась успешно. Промис содержит значение
              (result), переданное в <code>resolve(value)</code>. Обработчики <code>.then(onFulfilled)</code> будут вызваны.
            </p>
            <p className={s.prose}>
              <strong>rejected</strong> — операция завершилась с ошибкой. Промис содержит причину
              отклонения (reason), переданную в <code>reject(reason)</code>. Обработчики <code>.catch()</code> будут вызваны.
            </p>
          </div>
          <div>
            <p className={s.prose}>
              Состояния <strong>fulfilled</strong> и <strong>rejected</strong> объединяются термином
              <strong> settled</strong> («осевший»). Как только промис перешёл в settled — это необратимо.
              Повторные вызовы <code>resolve</code> или <code>reject</code> игнорируются. Это принципиально
              отличает промисы от EventEmitter, который может отправлять события снова и снова.
            </p>
          </div>
        </div>
        <PromiseStateDemo />
      </section>

      {/* 3 — Создание промиса */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Создание промиса</h2>
        <p className={s.prose}>
          Промис создаётся через конструктор <code>new Promise(executor)</code>, где <code>executor</code> —
          функция, которая принимает два колбэка: <code>resolve</code> и <code>reject</code>.
        </p>
        <CodeHighlight
          lang="js"
          filename="new-promise.js"
          code={`const p = new Promise((resolve, reject) => {
  // executor запускается СИНХРОННО — сразу при создании
  console.log('executor runs synchronously');

  setTimeout(() => {
    resolve(42); // переводит промис в fulfilled
    // reject(new Error('fail')); // перевёл бы в rejected
  }, 1000);
});

console.log('after new Promise');
p.then(val => console.log('resolved:', val));

// Вывод:
// executor runs synchronously
// after new Promise
// (через 1 с) resolved: 42`}
        />
        <Callout variant="info">
          Executor выполняется синхронно — ещё до того, как <code>new Promise()</code> вернёт результат.
          Это важно: не помещай в executor тяжёлых синхронных вычислений — они заблокируют Call Stack.
        </Callout>
        <p className={s.prose}>
          Реальный пример — оборачивание колбэкового API Node.js в промис:
        </p>
        <CodeHighlight
          lang="js"
          filename="promisify.js"
          code={`import fs from 'node:fs';

// Оборачиваем fs.readFile в промис вручную
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Использование
readFileAsync('./config.json')
  .then(data => JSON.parse(data))
  .then(config => console.log(config))
  .catch(err => console.error('Ошибка чтения:', err));

// В современном Node.js это уже встроено:
import { readFile } from 'node:fs/promises';
const data = await readFile('./config.json', 'utf8');`}
        />
        <p className={s.prose}>
          Для создания уже-resolved и уже-rejected промисов используются статические методы
          <code>Promise.resolve(value)</code> и <code>Promise.reject(reason)</code> — они мгновенно
          возвращают settled промис без executor.
        </p>
      </section>

      {/* 4 — .then .catch .finally */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>.then, .catch, .finally</h2>
        <p className={s.prose}>
          Эти три метода — основной интерфейс работы с промисами. Каждый из них возвращает
          <strong> новый промис</strong>, что позволяет строить цепочки.
        </p>
        <CodeHighlight
          lang="js"
          code={`// .then(onFulfilled, onRejected) — оба колбэка необязательны
p.then(
  value  => console.log('resolved:', value),  // при fulfilled
  reason => console.log('rejected:', reason)  // при rejected
);

// .catch(fn) — сокращение для .then(undefined, fn)
p.catch(err => console.error(err));
// эквивалентно:
p.then(undefined, err => console.error(err));

// .finally(fn) — выполняется ВСЕГДА, независимо от состояния
// НЕ получает значение/причину, пропускает их насквозь
p.finally(() => hideLoader())
 .then(value => render(value));  // value дошёл через finally`}
        />
        <Callout variant="info">
          <code>.finally()</code> не изменяет значение цепочки — оно проходит «насквозь».
          Исключение: если внутри <code>.finally()</code> бросить ошибку или вернуть
          rejected промис — цепочка перейдёт в rejected с этой причиной.
        </Callout>
        <CodeHighlight
          lang="js"
          code={`// Типичный паттерн: показать лоадер, скрыть в finally
async function fetchData() {
  showLoader();
  try {
    const data = await api.get('/data');
    return data;
  } finally {
    hideLoader(); // вызовется и при успехе, и при ошибке
  }
}

// Тоже самое через промисы:
api.get('/data')
  .then(data => processData(data))
  .catch(err => handleError(err))
  .finally(() => hideLoader());`}
        />
      </section>

      {/* 5 — Цепочки */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Цепочки промисов</h2>
        <p className={s.prose}>
          Ключевое свойство <code>.then()</code>: он всегда возвращает <strong>новый промис</strong>.
          Значение, возвращённое из колбэка, становится значением этого нового промиса. Если
          из <code>.then()</code> вернуть промис — он «разворачивается» (flattening): цепочка
          ждёт его завершения.
        </p>
        <CodeHighlight
          lang="js"
          code={`Promise.resolve(10)
  .then(x => x * 2)          // возвращает 20
  .then(x => x + 5)          // возвращает 25
  .then(x => {
    // возвращаем промис — цепочка ждёт его
    return fetch('/api/' + x);
  })
  .then(response => response.json()) // ← значение уже не Promise<Response>, а Response
  .then(data => console.log(data))
  .catch(err => console.error(err)); // ловит ошибки ВСЕЙ цепочки`}
        />
        <p className={s.prose}>
          Это отличается от вложенных колбэков: вместо пирамиды получается плоская последовательность
          шагов, каждый из которых трансформирует значение и передаёт его дальше. Ошибка на любом шаге
          пропускает все последующие <code>.then()</code> и попадает в ближайший <code>.catch()</code>.
        </p>
        <ChainingDemo />
        <p className={s.prose}>
          Частая ошибка — <strong>не вернуть</strong> значение из <code>.then()</code>. Тогда следующий шаг
          получает <code>undefined</code>:
        </p>
        <CodeHighlight
          lang="js"
          code={`// ❌ Неправильно — забыли return
fetch('/api/user')
  .then(res => {
    res.json(); // ← return забыт! функция вернёт undefined
  })
  .then(user => console.log(user)); // user === undefined

// ✅ Правильно
fetch('/api/user')
  .then(res => res.json()) // ← return подразумевается (стрелочная функция)
  .then(user => console.log(user));`}
        />
      </section>

      {/* 6 — Комбинаторы */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Комбинаторы</h2>
        <p className={s.prose}>
          Комбинаторы — статические методы <code>Promise</code>, которые принимают массив промисов
          и возвращают один промис, агрегирующий их результаты. Каждый комбинатор ведёт себя по-разному
          при отклонении или выполнении входных промисов.
        </p>
        <div className={s.twoCol}>
          <div>
            <p className={s.prose}>
              <strong>Promise.all([...])</strong> — разрешается когда <em>все</em> промисы fulfilled,
              возвращая массив значений в том же порядке. Немедленно отклоняется при первом rejected.
              Подходит для параллельной загрузки независимых данных.
            </p>
            <p className={s.prose}>
              <strong>Promise.race([...])</strong> — разрешается или отклоняется вместе с первым
              промисом, который сделает это. Удобен для тайм-аутов: <code>Promise.race([fetch(...), timeout(5000)])</code>.
            </p>
          </div>
          <div>
            <p className={s.prose}>
              <strong>Promise.allSettled([...])</strong> — разрешается когда <em>все</em> промисы
              завершились (fulfilled или rejected). Никогда не отклоняется. Возвращает массив
              объектов <code>{"{ status, value }"}</code> или <code>{"{ status, reason }"}</code>.
            </p>
            <p className={s.prose}>
              <strong>Promise.any([...])</strong> — разрешается с первым fulfilled промисом.
              Отклоняется с <code>AggregateError</code> только если все промисы rejected.
              Удобен для запроса к нескольким зеркалам — берём ответ от того, кто ответил первым.
            </p>
          </div>
        </div>
        <CombinatorsDemo />
        <Callout variant="warn">
          Разница между <code>Promise.race</code> и <code>Promise.any</code>: <code>race</code> реагирует на
          первое <em>любое</em> событие (включая reject), а <code>any</code> — только на первый
          <em> fulfill</em>. Если нужен первый успешный ответ — используй <code>any</code>.
          Если нужен первый завершившийся (даже если с ошибкой) — <code>race</code>.
        </Callout>
        <CodeHighlight
          lang="js"
          code={`// Promise.all — параллельная загрузка
const [user, posts, comments] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json()),
]);

// Promise.allSettled — независимые операции, нужны все результаты
const results = await Promise.allSettled([
  sendEmail(user),
  sendSMS(user),
  sendPushNotification(user),
]);
results.forEach(r => {
  if (r.status === 'rejected') logger.error(r.reason);
});

// Promise.any — запрос к нескольким CDN, берём быстрейший
const data = await Promise.any([
  fetch('https://cdn1.example.com/data'),
  fetch('https://cdn2.example.com/data'),
  fetch('https://cdn3.example.com/data'),
]);`}
        />
      </section>

      {/* 7 — async/await */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>async/await</h2>
        <p className={s.prose}>
          <code>async</code>/<code>await</code> — синтаксический сахар над промисами, появившийся в
          ES2017. Любая функция с ключевым словом <code>async</code> автоматически возвращает промис.
          <code>await</code> внутри неё приостанавливает выполнение функции (но не блокирует поток!)
          до завершения промиса.
        </p>
        <CodeHighlight
          lang="js"
          code={`// Эквивалентные записи

// С промисами:
function getUser(id) {
  return fetch('/api/users/' + id)
    .then(res => res.json())
    .then(user => user.name)
    .catch(err => { throw new Error('Не удалось получить пользователя: ' + err.message); });
}

// С async/await:
async function getUser(id) {
  try {
    const res = await fetch('/api/users/' + id);
    const user = await res.json();
    return user.name;
  } catch (err) {
    throw new Error('Не удалось получить пользователя: ' + err.message);
  }
}`}
        />
        <p className={s.prose}>
          <code>async</code>-функция <em>всегда</em> возвращает промис — даже если внутри нет
          <code> await</code>. Значение, которое возвращает функция, становится resolved-значением промиса.
          Брошенная ошибка — rejected-причиной.
        </p>
        <CodeHighlight
          lang="js"
          code={`async function double(x) { return x * 2; }
// эквивалентно: function double(x) { return Promise.resolve(x * 2); }

const result = await double(21); // 42

// Параллельный await через Promise.all
async function loadDashboard(userId) {
  // ❌ последовательно — медленно (3 запроса по очереди)
  const user    = await fetchUser(userId);
  const orders  = await fetchOrders(userId);
  const balance = await fetchBalance(userId);

  // ✅ параллельно — быстро
  const [user2, orders2, balance2] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchBalance(userId),
  ]);
}`}
        />
        <Callout variant="info">
          <code>await</code> можно использовать только внутри <code>async</code>-функции (или
          на верхнем уровне модуля — top-level await, ES2022). За пределами async-функции
          нужно использовать <code>.then()</code>.
        </Callout>
      </section>

      {/* 8 — Обработка ошибок */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Обработка ошибок</h2>
        <p className={s.prose}>
          Необработанный rejected промис в Node.js вызывает <code>UnhandledPromiseRejectionWarning</code>
          (а в новых версиях — завершает процесс). В браузере срабатывает событие
          <code> window.unhandledrejection</code>. Всегда прикрепляй <code>.catch()</code> или
          используй <code>try/catch</code> в async-функциях.
        </p>
        <CodeHighlight
          lang="js"
          code={`// Ошибки распространяются по цепочке
Promise.resolve()
  .then(() => { throw new Error('что-то пошло не так'); })
  .then(() => console.log('это не выполнится'))
  .then(() => console.log('и это тоже'))
  .catch(err => console.error('поймали:', err.message)) // 'поймали: что-то пошло не так'
  .then(() => console.log('а это выполнится — catch сбросил ошибку'));

// После .catch() цепочка продолжается в fulfilled-состоянии
// (если сам .catch() не бросил ошибку)`}
        />
        <p className={s.prose}>
          Паттерн <strong>finally для очистки ресурсов</strong> — закрытие соединений, скрытие лоадеров,
          освобождение блокировок:
        </p>
        <CodeHighlight
          lang="js"
          code={`const conn = await db.connect();
try {
  const rows = await conn.query('SELECT * FROM users');
  return rows;
} catch (err) {
  logger.error('Ошибка запроса:', err);
  throw err; // пробрасываем дальше
} finally {
  await conn.close(); // выполнится в любом случае
}

// Глобальный обработчик необработанных rejection (Node.js)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанный rejection:', reason);
  // в продакшене — завершить процесс корректно
});`}
        />
        <Callout variant="warn">
          Никогда не оставляй «голые» промисы без <code>.catch()</code>. Даже если ты уверен,
          что операция не упадёт — добавь обработчик. Это защитит от непредвиденных ошибок
          в будущем.
        </Callout>
      </section>

      {/* 9 — Антипаттерны */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Антипаттерны</h2>
        <p className={s.prose}>
          <strong>1. Promise constructor antipattern</strong> — оборачивание промиса в <code>new Promise()</code>
          без необходимости. Вместо того чтобы просто вернуть уже существующий промис, разработчик
          создаёт лишний слой:
        </p>
        <CodeHighlight
          lang="js"
          code={`// ❌ Антипаттерн: обёртка вокруг fetch — ненужный new Promise
function getUser(id) {
  return new Promise((resolve, reject) => {
    fetch('/api/users/' + id)
      .then(res => res.json())
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
}

// ✅ Правильно: просто возвращаем цепочку
function getUser(id) {
  return fetch('/api/users/' + id).then(res => res.json());
}`}
        />
        <p className={s.prose}>
          <strong>2. Забытый return в .then()</strong> — возвращает <code>undefined</code> вместо
          значения, разрывает цепочку:
        </p>
        <CodeHighlight
          lang="js"
          code={`// ❌ return забыт — следующий .then получит undefined
fetch('/api')
  .then(res => {
    res.json(); // ← нет return
  })
  .then(data => console.log(data)); // data === undefined

// ✅ Правильно
fetch('/api')
  .then(res => res.json())    // стрелочная функция: тело = выражение
  .then(data => {
    const processed = transform(data);
    return processed;         // ← явный return при блочном теле
  })
  .then(result => render(result));`}
        />
        <p className={s.prose}>
          <strong>3. Последовательный await вместо параллельного</strong> — самый частый источник
          излишней медленности в async-коде:
        </p>
        <CodeHighlight
          lang="js"
          code={`// ❌ Последовательно: общее время = 1s + 2s + 1.5s = 4.5s
async function loadData() {
  const users    = await fetch('/api/users');    // 1s
  const products = await fetch('/api/products'); // 2s
  const settings = await fetch('/api/settings'); // 1.5s
  return { users, products, settings };
}

// ✅ Параллельно: общее время = max(1s, 2s, 1.5s) = 2s
async function loadData() {
  const [users, products, settings] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/products'),
    fetch('/api/settings'),
  ]);
  return { users, products, settings };
}`}
        />
      </section>

      {/* 10 — Промисы и микрозадачи */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Промисы и микрозадачи</h2>
        <p className={s.prose}>
          Колбэки промисов (<code>.then()</code>, <code>.catch()</code>, <code>.finally()</code>) помещаются
          в <strong>Microtask Queue</strong>, а не в Macrotask Queue. Это означает, что они выполнятся
          <em> до следующего</em> <code>setTimeout</code> или любого другого макрозадачного колбэка.
        </p>
        <CodeHighlight
          lang="js"
          code={`console.log('1: sync start');

setTimeout(() => console.log('4: macro (setTimeout)'), 0);

Promise.resolve()
  .then(() => console.log('3: micro (Promise.then)'));

console.log('2: sync end');

// Вывод:
// 1: sync start
// 2: sync end
// 3: micro (Promise.then)   ← microtask, до следующего macro
// 4: macro (setTimeout)     ← macrotask, после всех micro`}
        />
        <Callout variant="accent">
          Подробнее о том, как микрозадачи соотносятся с макрозадачами, рендером браузера и
          Event Loop в целом — читай в статье «Event Loop и асинхронная модель браузера».
          Там разобраны все очереди, порядок их выполнения и практические примеры.
        </Callout>
        <p className={s.prose}>
          Важно помнить: бесконечная цепочка промисов (<code>Promise.resolve().then(loop)</code>)
          заблокирует Microtask Queue и не даст браузеру отрисовать кадр. Рендер происходит
          между макрозадачами — если micro никогда не заканчиваются, страница зависнет.
        </p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>Самопроверка</h2>
        <p className={s.prose}>
          10 задач на порядок выполнения, цепочки, комбинаторы и async/await.
          Сложность нарастает от easy к hard.
        </p>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
