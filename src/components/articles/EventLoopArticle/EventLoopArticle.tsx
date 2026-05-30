import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { EventLoopDemo } from './EventLoopDemo';
import { RenderPipelineDemo } from './RenderPipelineDemo';
import { QuizBlock } from './QuizBlock';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import s from './EventLoopArticle.module.scss';

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrowserArchDiagram() {
  const parts = [
    { title: 'User Interface', desc: 'Адресная строка, кнопки вперёд/назад, закладки — всё с чем ты кликаешь.' },
    { title: 'Browser Engine', desc: 'Прослойка между UI и движком рендеринга. Управляет взаимодействием частей.' },
    { title: 'Rendering Engine', desc: 'Разбирает HTML/CSS, строит деревья, рисует страницу. WebKit (Chrome), Gecko (Firefox).' },
    { title: 'Networking', desc: 'HTTP/HTTPS, DNS, TCP/UDP, история посещений — всё что связано с сетью.' },
    { title: 'JS Engine (V8)', desc: 'Компилирует JS в машинный код. Предоставляет Heap и Call Stack. НЕ содержит Event Loop.', accent: true },
    { title: 'Data Storage', desc: 'localStorage, sessionStorage, IndexedDB, Cookie, кэш — локальное хранилище.' },
  ];

  return (
    <div className={s.archGrid}>
      {parts.map((p) => (
        <div key={p.title} className={p.accent ? s.archCardAccent : s.archCard}>
          <div className={s.archCardTitle}>{p.title}</div>
          <div className={s.archCardDesc}>{p.desc}</div>
        </div>
      ))}
    </div>
  );
}

function CallStackExample() {
  return (
    <div className={s.stackVisual}>
      <div className={s.stackRow}>
        <span className={s.stackLabel}>factorial(1)</span>
        <div className={s.stackFrames}>
          <span className={`${s.stackFrame} ${s.top}`}>factorial(1) ← выполняется</span>
          <span className={s.stackFrame}>factorial(2)</span>
          <span className={s.stackFrame}>factorial(3)</span>
          <span className={s.stackFrame}>factorial(4)</span>
          <span className={s.stackFrame}>factorial(5)</span>
        </div>
      </div>
    </div>
  );
}

function SourcesTable() {
  return (
    <div className={s.sourcesGrid}>
      <div className={s.sourcesCol}>
        <div className={`${s.sourcesHead} ${s.micro}`}>◆ Microtask Queue</div>
        <div className={s.sourcesList}>
          {[
            { code: 'Promise.then/catch/finally', label: '99% случаев' },
            { code: 'queueMicrotask(fn)', label: 'явная регистрация' },
            { code: 'MutationObserver', label: 'слежение за DOM' },
            { code: 'async/await', label: 'под капотом — Promise' },
          ].map((item) => (
            <span key={item.code} className={s.sourcesItem}>
              <code>{item.code}</code>
              <span style={{ color: 'var(--text-muted, #3d5562)', fontSize: '0.625rem' }}>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className={s.sourcesCol}>
        <div className={`${s.sourcesHead} ${s.macro}`}>◆ Macrotask Queue</div>
        <div className={s.sourcesList}>
          {[
            { code: 'setTimeout / setInterval', label: 'таймеры' },
            { code: 'DOM events (click, input…)', label: 'пользовательские события' },
            { code: 'fetch / XHR callbacks', label: 'сетевые запросы' },
            { code: 'MessageChannel', label: 'межпоточная связь' },
          ].map((item) => (
            <span key={item.code} className={`${s.sourcesItem} ${s.macro}`}>
              <code>{item.code}</code>
              <span style={{ color: 'var(--text-muted, #3d5562)', fontSize: '0.625rem' }}>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


function ExecutionOrder() {
  const items = [
    { num: '1', text: 'Весь синхронный код из Call Stack', badge: 'sync', badgeLabel: 'sync' },
    { num: '2', text: 'Все задачи из Microtask Queue (сразу все, до опустошения)', badge: 'micro', badgeLabel: 'micro' },
    { num: '3', text: 'Одна задача из Macrotask Queue', badge: 'macro', badgeLabel: 'macro' },
    { num: '→2', text: 'Если макрозадача породила микрозадачи — снова все micro', badge: 'micro', badgeLabel: 'micro' },
    { num: '→3', text: 'Следующая макрозадача... и так по кругу', badge: 'macro', badgeLabel: 'macro' },
  ];

  return (
    <div className={s.orderList}>
      {items.map((item) => (
        <div key={item.num} className={s.orderItem}>
          <span className={s.orderNum}>{item.num}</span>
          <span className={s.orderText} dangerouslySetInnerHTML={{ __html: item.text }} />
          <span className={`${s.orderBadge} ${s[item.badge]}`}>{item.badgeLabel}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main article ─────────────────────────────────────────────────────────────

export function EventLoopArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Зачем нужен Event Loop</SectionTitle>
        <p className={s.prose}>
          JavaScript — однопоточный язык. В любой момент времени выполняется ровно одна инструкция.
          Но браузер при этом одновременно обрабатывает клики, показывает анимации, делает сетевые запросы
          и никогда не «замерзает» в ожидании ответа сервера. Как это возможно?
        </p>
        <p className={s.prose}>
          Ответ — <strong>неблокирующая модель ввода/вывода</strong>. Вместо того чтобы ждать завершения
          операции (запрос, таймер, событие), движок регистрирует колбэк и продолжает выполнять остальной
          код. Когда операция завершается — колбэк попадает в очередь, откуда его забирает Event Loop.
        </p>
        <Callout variant="accent">
          Event Loop — это не часть JavaScript движка. V8 отвечает только за Call Stack и Heap.
          Event Loop предоставляется средой — браузером или Node.js. Именно поэтому их реализации
          отличаются, несмотря на одинаковый движок.
        </Callout>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>Архитектура браузера</SectionTitle>
        <p className={s.prose}>
          Браузер — это не монолит. Он состоит из нескольких независимых подсистем.
          Для понимания Event Loop важно видеть, что JS-движок — лишь одна из них.
        </p>
        <BrowserArchDiagram />
        <p className={s.prose}>
          Chrome использует <strong>V8</strong> как JS-движок и <strong>WebKit</strong> как движок рендеринга.
          Firefox использует <strong>SpiderMonkey</strong> и <strong>Gecko</strong> соответственно.
          Node.js использует тот же V8, но работает без рендеринга — и поэтому его Event Loop
          устроен совершенно иначе (об этом — в отдельной статье).
        </p>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Call Stack — стек вызовов</SectionTitle>
        <p className={s.prose}>
          Call Stack — это структура данных типа «стопка»: последний вошёл — первый вышел (LIFO).
          Каждый вызов функции кладёт фрейм на вершину стека. Когда функция возвращает результат —
          фрейм снимается.
        </p>
        <CodeHighlight
          lang="js"
          code={`function first()  { console.log("first"); }
function second() { first(); }
function third()  { second(); }

third();
// Стек: third → second → first → (first завершилась) → (second) → (third)`}
        />
        <p className={s.prose}>
          При рекурсии стек растёт с каждым вызовом. Вот как он выглядит для <code>factorial(5)</code>:
        </p>
        <CallStackExample />
        <p className={s.prose}>
          Стек <strong>конечен</strong>. Рекурсия без базового случая или с очень большим числом итераций
          приведёт к переполнению:
        </p>
        <CodeHighlight
          lang="js"
          code={`// RangeError: Maximum call stack size exceeded
function factorial(n) {
  return n * factorial(n - 1); // нет базового случая
}
factorial(100000);

// Решение — заменить рекурсию циклом:
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}`}
        />
        <Callout variant="info">
          На собеседованиях часто дают рекурсивную задачу и спрашивают: «что будет при большом n?»
          Правильный ответ — stack overflow — и предложение переписать через цикл или итеративный стек.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>Web API — мост между движком и очередями</SectionTitle>
        <p className={s.prose}>
          <code>setTimeout</code>, обработчики событий, <code>fetch</code> — это не спецификация
          JavaScript. Это <strong>браузерные API</strong>. Когда ты вызываешь <code>setTimeout(fn, 300)</code>,
          движок передаёт колбэк браузеру и немедленно возвращает управление. Браузер запускает таймер
          в отдельном потоке.
        </p>
        <CodeHighlight
          lang="js"
          code={`// 1. setTimeout попадает в Call Stack
// 2. Движок передаёт callback браузерному Web API и снимает setTimeout со стека
// 3. Браузер запускает таймер независимо от JS-потока
// 4. После 300мс — callback помещается в Macrotask Queue
// 5. Event Loop видит пустой Call Stack → берёт callback из очереди
setTimeout(() => console.log("300ms later"), 300);
console.log("this runs first"); // ← выполнится раньше`}
        />
        <p className={s.prose}>
          Слушатели событий работают аналогично: <code>addEventListener</code> регистрирует обработчик
          в Web API. При клике браузер помещает колбэк в Macrotask Queue — он попадёт в Call Stack
          только когда стек будет пуст. Именно поэтому можно иметь тысячи слушателей без блокировки UI.
        </p>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Micro и Macro очереди</SectionTitle>
        <p className={s.prose}>
          Очередей на самом деле <strong>две</strong>, и у них разный приоритет.
          После каждого шага (синхронный код или одна макрозадача) Event Loop сначала опустошает
          Microtask Queue целиком, и лишь затем берёт следующую макрозадачу.
        </p>
        <SourcesTable />
        <p className={s.prose}>
          <code>async/await</code> — синтаксический сахар над промисами. Каждый <code>await</code> внутри
          превращается в <code>.then()</code>, то есть генерирует микрозадачу.
        </p>
      </section>

      {/* 6 */}
      <section className={s.section}>
        <SectionTitle>Порядок выполнения</SectionTitle>
        <ExecutionOrder />
        <p className={s.prose} style={{ marginTop: 'var(--space-4, 1rem)' }}>
          Это означает: если макрозадача порождает промис — следующая макрозадача начнёт выполняться
          только после того, как разрешится этот промис. Посмотри на это в симуляторе (сниппет «Макро → Микро»).
        </p>
      </section>

      {/* 7 */}
      <section className={s.section}>
        <SectionTitle>Интерактивный симулятор</SectionTitle>
        <p className={s.prose}>
          Выбери сниппет, жми «next →» и наблюдай, как каждая строка кода двигает задачи между
          Call Stack, Microtask Queue, Macrotask Queue и консолью.
          Новые сниппеты — <strong>queueMicrotask</strong> и <strong>Макро → Микро</strong>.
        </p>
        <EventLoopDemo />
      </section>

      {/* 8 */}
      <section className={s.section}>
        <SectionTitle>queueMicrotask и MutationObserver</SectionTitle>
        <p className={s.prose}>
          <code>queueMicrotask(fn)</code> — явный способ добавить задачу в Microtask Queue, минуя
          промис. Полезен когда нужно запустить код «после текущей синхронной работы, но до любого
          таймера»:
        </p>
        <CodeHighlight
          lang="js"
          code={`queueMicrotask(() => console.log("runs after sync, before any setTimeout"));
console.log("sync");
setTimeout(() => console.log("macro"), 0);

// Вывод: sync → runs after sync... → macro`}
        />
        <p className={s.prose}>
          <strong>MutationObserver</strong> — API для слежения за изменениями в DOM. Когда DOM-нода
          изменяется, он генерирует <em>микрозадачу</em> — не макрозадачу. Это значит,
          что обработчик мутации выполнится перед следующим <code>setTimeout</code>:
        </p>
        <CodeHighlight
          lang="js"
          code={`const observer = new MutationObserver((mutations) => {
  console.log("DOM changed"); // ← микрозадача
});
observer.observe(document.body, { childList: true });

document.body.appendChild(document.createElement("div"));
setTimeout(() => console.log("macro"), 0);
console.log("sync");

// Вывод: sync → DOM changed → macro`}
        />
        <Callout variant="info">
          MutationObserver как источник микрозадач — частый вопрос на senior-собеседованиях.
          Большинство разработчиков знают только промисы.
        </Callout>
      </section>

      {/* 9 */}
      <section className={s.section}>
        <SectionTitle>Стадии рендера</SectionTitle>
        <p className={s.prose}>
          Рендер страницы — не одна операция, а конвейер из четырёх стадий. Браузер запускает его
          не после каждой задачи, а порциями — накапливает изменения и перерисовывает разом
          (~60 раз в секунду, ~16.6мс на кадр).
        </p>
        <RenderPipelineDemo />
        <p className={s.prose}>
          Рендер в цикле Event Loop стоит <em>между макрозадачами</em> — после обработки очередной
          макрозадачи (и всех порождённых микрозадач) браузер решает, нужно ли обновить экран.
          Именно поэтому бесконечная цепочка микрозадач блокирует рендер: очередь никогда не
          опустошается, до рендера очередь не доходит.
        </p>
        <p className={s.prose}>
          <strong>Что триггерит рендер:</strong> изменение шрифтов, добавление/удаление DOM-нод,
          изменение стилей, resize окна, изменение ориентации устройства.
          Рендер — дорогая операция. Манипулируй DOM как можно реже и как можно глубже в дереве.
        </p>
        <Callout variant="warn">
          <code>transform</code> и <code>opacity</code> работают только на стадии Composite и не
          вызывают Layout/Paint. Поэтому CSS-анимации на этих свойствах значительно быстрее, чем
          анимации через <code>left/top</code> или <code>width/height</code>.
        </Callout>
      </section>

      {/* 10 */}
      <section className={s.section}>
        <SectionTitle>Ключевые правила</SectionTitle>
        <p className={s.prose}>
          <strong>1. Event Loop ≠ JS движок.</strong>{' '}
          V8 предоставляет Call Stack и Heap. Event Loop — браузер или Node.js.
          У одного движка (V8) в разных средах разные Event Loop.
        </p>
        <p className={s.prose}>
          <strong>2. Microtasks — всегда перед следующей Macrotask.</strong>{' '}
          И это рекурсивно: если микрозадача порождает микрозадачу — та тоже выполнится до следующего
          таймера.
        </p>
        <p className={s.prose}>
          <strong>3. setTimeout(fn, 0) — не «немедленно».</strong>{' '}
          «0» означает минимально допустимую задержку. Реальная задержка — минимум 4мс в большинстве
          браузеров. Колбэк в любом случае выполнится после всех ожидающих промисов.
        </p>
        <p className={s.prose}>
          <strong>4. Бесконечная цепочка микрозадач блокирует рендер.</strong>{' '}
          Рендер не может вклиниться, пока Microtask Queue не пуста.
        </p>
        <CodeHighlight
          lang="js"
          code={`// ⚠ страница зависнет — рендер никогда не произойдёт
function loop() {
  Promise.resolve().then(loop);
}
loop();`}
        />
        <p className={s.prose}>
          <strong>5. Тяжёлые синхронные вычисления блокируют UI.</strong>{' '}
          Пока Call Stack занят — браузер не может обработать ни один клик, ни одну анимацию.
          Для тяжёлых задач используй Web Workers или разбивай на чанки через
          <code>setTimeout(chunk, 0)</code>.
        </p>
        <CodeHighlight
          lang="js"
          code={`// Правильно: разбиваем тяжёлую задачу на чанки
function processChunk(items, index = 0) {
  const CHUNK = 1000;
  for (let i = index; i < Math.min(index + CHUNK, items.length); i++) {
    heavyWork(items[i]);
  }
  if (index + CHUNK < items.length) {
    setTimeout(() => processChunk(items, index + CHUNK), 0);
    // ↑ отдаём управление браузеру между чанками
  }
}`}
        />
      </section>

      {/* 11 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <p className={s.prose}>
          Проверь, насколько хорошо ты усвоил порядок выполнения задач.
          В каждом вопросе — фрагмент кода с несколькими <code>console.log</code>.
        </p>
        <QuizBlock />
      </section>

    </div>
  );
}
