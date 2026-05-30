import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ProcessArchitectureDemo } from './ProcessArchitectureDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './WhatIsBrowserArticle.module.scss';

const HISTORY = [
  { year: '1990', name: 'WorldWideWeb', desc: 'Первый браузер Тима Бернерса-Ли — текстовый, только NeXT. Также мог редактировать страницы.' },
  { year: '1993', name: 'Mosaic', desc: 'NCSA Mosaic — первый браузер с поддержкой изображений inline. Сделал веб визуальным. Создан студентом Марком Андрессеном.' },
  { year: '1994', name: 'Netscape Navigator', desc: 'Andreessen уходит из NCSA и создаёт Netscape. Доминировал 80%+ рынка. Ввёл cookies, JavaScript (1995, Brendan Eich за 10 дней), SSL.' },
  { year: '1995', name: 'Internet Explorer', desc: 'Microsoft входит в игру — Browser Wars I. IE 3.0 поддерживал CSS, ActiveX, JScript (клон JS). К 2002 году — 96% рынка, Netscape умер.' },
  { year: '2003', name: 'Safari + WebKit', desc: 'Apple форкает KHTML (KDE) → WebKit. Safari становится браузером macOS. WebKit — rendering engine для iOS по сей день.' },
  { year: '2004', name: 'Firefox + Gecko', desc: 'Mozilla (наследник Netscape) выпускает Firefox. Gecko engine. За год — 100M загрузок. Вернул конкуренцию в рынок.' },
  { year: '2008', name: 'Chrome + V8', desc: 'Google выпускает Chrome с V8 (JIT-компилятор JS) и многопроцессной архитектурой. Каждая вкладка = отдельный процесс. Полностью меняет ожидания по скорости JS.' },
  { year: '2013', name: 'Blink', desc: 'Google форкает WebKit → Blink (rendering engine Chrome). Opera, Samsung, Vivaldi, Brave — все переходят на Blink. WebKit остаётся только у Safari.' },
  { year: '2015', name: 'Edge (EdgeHTML)', desc: 'Microsoft убивает IE, выпускает Edge на EdgeHTML. Попытка с нуля — но слишком мало сайтов тестировалось под EdgeHTML.' },
  { year: '2020', name: 'Edge Chromium', desc: 'Microsoft капитулирует: Edge переписывается на Chromium/Blink. Остаётся три реальных движка: Blink, WebKit, Gecko.' },
];

const ENGINES = [
  { browser: 'Chrome / Edge / Opera / Brave', render: 'Blink', renderColor: '#4db8ff', js: 'V8', jsColor: '#00e5a0' },
  { browser: 'Firefox', render: 'Gecko', renderColor: '#f0c040', js: 'SpiderMonkey', jsColor: '#f0c040' },
  { browser: 'Safari / WebView iOS', render: 'WebKit', renderColor: '#b48eff', js: 'JavaScriptCore', jsColor: '#b48eff' },
];

export function WhatIsBrowserArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое браузер ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Браузер — это не просто «программа для сайтов»</SectionTitle>
        <p className={s.lead}>
          Браузер — один из самых сложных кусков software, который большинство людей использует каждый день.
          Внутри — компилятор (JS-движок), layout-движок, сетевой стек, менеджер процессов,
          криптографическая библиотека, sandbox, GPU-рендерер и ещё несколько операционных систем в миниатюре.
        </p>
        <p className={s.body}>
          Формально браузер — это <strong>userspace-приложение</strong>, которое принимает URL,
          загружает ресурсы по сети и превращает HTML + CSS + JS в пиксели на экране.
          Но это как назвать компилятор «программой, которая переводит текст в байты» — технически верно,
          но совершенно не передаёт масштаб задачи.
        </p>
        <div className={s.statGrid}>
          {[
            { value: '~35M', label: 'строк кода в Chromium (больше, чем ядро Linux × 10)' },
            { value: '~1000', label: 'инженеров в команде Chrome full-time' },
            { value: '3', label: 'живых rendering engine в 2025: Blink, WebKit, Gecko' },
          ].map(stat => (
            <div key={stat.value} className={s.statCard}>
              <div className={s.statValue}>{stat.value}</div>
              <div className={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. История ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>История: от текстового редактора до OS внутри OS</SectionTitle>
        <p className={s.body}>
          За 30 лет браузеры прошли путь от инструмента для учёных CERN до платформы,
          на которой работают офисные приложения, игры и IDE. Каждый переломный момент
          двигал не технологию — а рынок.
        </p>
        <div className={s.timeline}>
          {HISTORY.map(item => (
            <div key={item.year} className={s.timelineItem}>
              <div className={s.timelineYear}>{item.year}</div>
              <div className={s.timelineBody}>
                <div className={s.timelineName}>{item.name}</div>
                <div className={s.timelineDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>BROWSER WARS В ДВУХ СЛОВАХ</div>
          <div className={s.calloutText}>
            Войны браузеров шли дважды. Первая (1995–2001): Netscape vs IE — Microsoft выиграл монополией Windows.
            Вторая (2008–2020): Chrome vs все — Google выиграл скоростью V8 и маркетингом Google.com.
            Монополии опасны: в эпоху IE-доминирования веб застрял на 6 лет без новых стандартов.
          </div>
        </div>
      </section>

      {/* ── 3. Два движка ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Два движка внутри каждого браузера</SectionTitle>
        <p className={s.lead}>
          В современном браузере всегда два разных движка, решающих принципиально разные задачи.
          Их часто путают, называя оба «движком».
        </p>
        <div className={s.engineTable}>
          <div className={s.engineHead}>
            <span>Браузер</span>
            <span>Rendering engine</span>
            <span>JavaScript engine</span>
          </div>
          {ENGINES.map(row => (
            <div key={row.browser} className={s.engineRow}>
              <div className={s.engineCell}>{row.browser}</div>
              <div className={s.engineCell}>
                <span className={s.engineBadge} style={{ color: row.renderColor, borderColor: `${row.renderColor}44`, background: `${row.renderColor}10` }}>
                  {row.render}
                </span>
              </div>
              <div className={s.engineCell}>
                <span className={s.engineBadge} style={{ color: row.jsColor, borderColor: `${row.jsColor}44`, background: `${row.jsColor}10` }}>
                  {row.js}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className={s.body}>
          <strong>Rendering engine</strong> (Blink, WebKit, Gecko) — парсит HTML и CSS,
          строит DOM и CSSOM, вычисляет layout, управляет слоями и отправляет draw-команды в GPU.
          Это про пиксели.
        </p>
        <p className={s.body}>
          <strong>JS engine</strong> (V8, SpiderMonkey, JavaScriptCore) — парсит и выполняет JavaScript.
          Оба движка плотно интегрированы: JS может менять DOM (через Blink API),
          но это две разные кодовые базы с разными командами.
        </p>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ПОЧЕМУ ЭТО ВАЖНО ТЕБЕ КАК РАЗРАБОТЧИКУ</div>
          <div className={s.infoText}>
            <strong>Safari — единственный браузер на iOS.</strong> Apple обязывает все браузеры на iOS
            использовать WebKit (даже Chrome на iPhone внутри — WebKit). Это значит:
            если твоя фича работает в Chrome на macOS, но не в Safari — проблема в движке,
            и 30% мобильных пользователей её не увидят. caniuse.com всегда показывает поддержку по движкам.
          </div>
        </div>
      </section>

      {/* ── 4. V8 под капотом ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>V8: как JavaScript компилируется в машинный код</SectionTitle>
        <p className={s.lead}>
          V8 появился в 2008 году и поменял всё. До него JS-движки были интерпретаторами —
          читали код строчку за строчкой. V8 ввёл JIT (Just-In-Time) компиляцию:
          горячий код компилируется в нативные инструкции процессора прямо во время выполнения.
        </p>
        <div className={s.pipelineRow}>
          {[
            { name: 'Parse', sub: 'JS → AST (абстрактное синтаксическое дерево)' },
            { name: 'Ignition', sub: 'AST → байткод (интерпретируется быстро)' },
            { name: 'TurboFan', sub: 'Горячий байткод → нативный машинный код' },
            { name: 'Deopt', sub: 'Тип изменился → откат к байткоду и рекомпиляция' },
          ].map(step => (
            <div key={step.name} className={s.pipelineStep}>
              <div className={s.pipelineStepName}>{step.name}</div>
              <div className={s.pipelineStepSub}>{step.sub}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="js" code={`// Hidden classes — ключ к скорости V8
// Объекты с одинаковой структурой → один "hidden class" → быстрый доступ

// ✓ Хорошо: структура не меняется
function Point(x, y) {
  this.x = x;  // всегда x, потом y
  this.y = y;
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 и p2 → один hidden class → V8 компилирует в прямой offset к полю

// ✗ Плохо: разный порядок свойств → разные hidden classes
const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };  // другой hidden class!
// V8 не может применить inline cache → медленнее`} />
        <p className={s.body}>
          На практике для большинства приложений это не критично — движки достаточно умны.
          Но знание hidden classes объясняет, <em>почему</em> JIT работает: он делает ставку
          на стабильность типов и структур. Когда ставка проигрывает (deoptimization) — откатывается к интерпретатору.
        </p>
      </section>

      {/* ── 5. Многопроцессная архитектура ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Многопроцессная архитектура: почему браузер — это ОС</SectionTitle>
        <p className={s.lead}>
          До Chrome 2008 все браузеры работали в одном процессе. Crash в Flash на одной вкладке —
          crash всего браузера. Вредоносный сайт мог читать данные другого открытого сайта.
          Chrome это сломал.
        </p>
        <p className={s.body}>
          Современный Chrome при старте запускает <strong>несколько независимых OS-процессов</strong>.
          Каждый процесс изолирован операционной системой — у них разные адресные пространства памяти.
          Crash одного не затрагивает других. Кликни на процесс ниже, чтобы увидеть его роль и ограничения.
        </p>
        <ProcessArchitectureDemo />
        <Callout variant="warn">
          Больше процессов = больше памяти. Chrome печально известен потреблением RAM именно из-за этой архитектуры.
          На слабых устройствах Chrome переключается в «режим экономии» и объединяет вкладки в один процесс.
          Это компромисс между безопасностью и потреблением ресурсов.
        </Callout>
      </section>

      {/* ── 6. Что происходит когда вводишь URL ──────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что на самом деле происходит, когда вводишь URL</SectionTitle>
        <p className={s.body}>
          Сетевая часть (DNS, TCP, TLS, HTTP) подробно разобрана в соседней статье «Как работает браузер».
          Здесь — про то, что происходит <em>внутри браузера</em> с точки зрения процессов.
        </p>
        <CodeHighlight lang="bash" code={`// Оркестрация процессов при вводе URL

1. Browser Process
   ← Пользователь нажал Enter
   → Запрос в Network Process: "загрузи https://example.com"

2. Network Process
   → DNS lookup → TCP → TLS → HTTP запрос
   ← Получает байты HTML (streaming)
   → IPC к Browser Process: "вот данные, это text/html"

3. Browser Process
   → Создаёт новый Renderer Process для example.com
   → Передаёт данные через IPC

4. Renderer Process (sandbox)
   ← Blink начинает парсить HTML из потока байт
   ← По мере парсинга встречает <script>, <img>, <link>
   → IPC к Network Process: "загрузи ещё эти ресурсы"
   ← Строит DOM + CSSOM → Render Tree → Layout → Paint

5. GPU Process
   ← Compositor получает layer-список от Renderer
   → Растеризует слои на GPU
   → Результат появляется на экране (frame commit)`} />
        <p className={s.body}>
          Весь этот обмен идёт через <strong>IPC (inter-process communication)</strong> —
          браузер-специфичный протокол поверх pipe/socket. Renderer не может напрямую
          вызвать сеть или файловую систему — только попросить через IPC.
          Именно это делает sandbox надёжным.
        </p>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>DEVTOOLS — ВХОД В ПОТРОХА</div>
          <div className={s.infoText}>
            <code>chrome://process-internals</code> — список всех процессов браузера с PID.{' '}
            <code>chrome://tracing</code> — трейсинг на уровне каждого потока каждого процесса.
            Task Manager браузера (Shift+Esc) — память и CPU по процессам.
            Именно так Chrome-команда отлаживает вещи, которые Lighthouse не покажет.
          </div>
        </div>
      </section>

      {/* ── 7. Sandbox ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Sandbox: почему вредоносный сайт не может читать твои файлы</SectionTitle>
        <p className={s.body}>
          Renderer process — самый опасный с точки зрения безопасности: он исполняет JS
          с любого сайта в интернете, включая вредоносные. Поэтому он работает в
          <strong> sandbox</strong> — режиме, в котором ОС ограничивает возможности процесса.
        </p>
        <CodeHighlight lang="bash" code={`// Что sandbox запрещает renderer process:

✗  Открыть/прочитать файл на диске
✗  Создать сетевое соединение напрямую
✗  Получить доступ к буферу обмена без явного действия пользователя
✗  Запустить другой процесс
✗  Обратиться к системным API (registry, keychain)

// Всё это идёт через Browser Process с явной валидацией:
Renderer: "хочу загрузить https://api.example.com/data"
Browser:  проверяет CORS, CSP, permissions → если ок → Network Process делает запрос
Browser:  возвращает результат в Renderer через IPC

// Именно поэтому даже RCE-уязвимость в Blink (выполнение
// произвольного кода) не даёт атакующему доступ к системе —
// он в sandbox. Нужен второй эксплойт (sandbox escape).`} />
        <Callout variant="accent">
          Это объясняет, почему браузерные уязвимости ценятся так высоко — они требуют двух эксплойтов:
          один в rendering engine (RCE), второй — sandbox escape. Именно поэтому Chrome платит
          до $250 000 за такую цепочку в своей bug bounty программе.
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
