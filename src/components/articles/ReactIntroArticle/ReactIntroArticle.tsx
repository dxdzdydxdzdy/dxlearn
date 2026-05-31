import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { StateToUiDemo } from './StateToUiDemo';
import { ReconciliationDemo } from './ReconciliationDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './ReactIntroArticle.module.scss';

// ── Static diagrams ───────────────────────────────────────────────────────────

const IMPERATIVE_CODE = `// Vanilla JS — ты управляешь КАЖДЫМ шагом вручную
let count = 0;

function increment() {
  count++;

  // Нужно самому найти элемент...
  const el = document.getElementById('counter');
  // ...и вручную обновить его содержимое
  el.textContent = count;

  // А если кнопка должна менять цвет при count > 10?
  const btn = document.getElementById('btn');
  btn.classList.toggle('danger', count > 10);

  // А если нужно сохранить в localStorage при каждом клике?
  localStorage.setItem('count', count);

  // Больше логики → больше мест которые нужно не забыть обновить
}`;

const DECLARATIVE_CODE = `// React — ты описываешь ЧТО должно быть на экране
function Counter() {
  const [count, setCount] = useState(0);

  // Просто описываешь UI как функцию от состояния
  return (
    <div>
      <p>{count}</p>
      <button
        className={count > 10 ? 'danger' : ''}
        onClick={() => setCount(count + 1)}
      >
        +1
      </button>
    </div>
  );
  // React сам обновит DOM, применит класс, запустит эффекты
}`;

const COMPONENT_EXAMPLE = `// Компонент — это просто функция
function UserCard({ name, role, online }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{role}</p>
      <span className={online ? 'green' : 'grey'}>
        {online ? 'онлайн' : 'офлайн'}
      </span>
    </div>
  );
}

// Используешь как HTML-тег — передаёшь данные через атрибуты (props)
<UserCard name="Алиса" role="Разработчик" online={true} />
<UserCard name="Боб"   role="Дизайнер"    online={false} />`;

const APP_TREE_CODE = `// Приложение — это дерево компонентов
function App() {
  return (
    <div>
      <Header />          {/* независимый компонент */}
      <main>
        <Sidebar />       {/* свои данные и логика */}
        <Feed>            {/* может принимать дочерние */}
          <Post />
          <Post />
        </Feed>
      </main>
      <Footer />
    </div>
  );
}
// Каждый компонент отвечает только за свою часть UI
// Легко переиспользовать, тестировать, понимать`;

export function ReactIntroArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Проблема ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проблема: UI — это данные плюс состояние</SectionTitle>
        <p className={s.lead}>
          Представь интерфейс любого приложения: счётчик уведомлений, список постов,
          форма с валидацией. Всё это — <strong>данные отображённые на экране</strong>.
          Когда данные меняются, экран должен обновиться.
        </p>
        <p className={s.body}>
          На заре веба это делали вручную: нашёл нужный DOM-элемент,
          изменил его содержимое, не забыл обновить три соседних элемента,
          которые тоже зависят от этих данных. Звучит несложно — пока
          у тебя не 3 элемента, а 300, и они зависят друг от друга.
        </p>
        <CodeHighlight lang="js" code={IMPERATIVE_CODE} />
        <div className={s.problemNote}>
          <span className={s.problemIcon}>↑</span>
          <span>
            Это называется <strong>императивный подход</strong> — ты описываешь
            каждый шаг: «возьми элемент», «поставь ему класс», «запиши в localStorage».
            При росте приложения это превращается в хаос: легко забыть обновить один
            из зависимых элементов.
          </span>
        </div>
      </section>

      {/* ── 2. Решение: декларативность ─────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Решение: описывай ЧТО, а не КАК</SectionTitle>
        <p className={s.lead}>
          React меняет способ мышления. Вместо «сделай вот это с DOM»
          ты говоришь «вот как UI должен выглядеть при этих данных» —
          и React сам разберётся как это отобразить.
        </p>
        <div className={s.compareWrap}>
          <div className={s.compareSide}>
            <div className={s.compareLabel} data-bad="true">// императивно (Vanilla JS)</div>
            <div className={s.compareDesc}>
              Ты думаешь о <em>шагах</em>: найди → измени → не забудь обновить везде
            </div>
          </div>
          <div className={s.compareSide}>
            <div className={s.compareLabel}>// декларативно (React)</div>
            <div className={s.compareDesc}>
              Ты думаешь о <em>результате</em>: вот данные → вот как выглядит UI
            </div>
          </div>
        </div>
        <CodeHighlight lang="tsx" code={DECLARATIVE_CODE} />
        <Callout variant="info">
          Ключевая формула React: <strong>UI = f(state)</strong>.
          UI — это функция от состояния. Меняется состояние — React пересчитывает
          что должно быть на экране и обновляет только то что изменилось.
          Ты никогда не трогаешь DOM напрямую.
        </Callout>
      </section>

      {/* ── 3. StateToUiDemo ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: state → UI</SectionTitle>
        <p className={s.body}>
          Измени любое поле в блоке <code>state</code> — UI справа обновится мгновенно.
          Ни строчки кода для обновления DOM ты не написал.
        </p>
        <StateToUiDemo />
      </section>

      {/* ── 4. Компонент ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Компонент — это функция</SectionTitle>
        <p className={s.lead}>
          Весь React строится на одной простой идее: <strong>компонент</strong> — это
          функция которая принимает данные (<em>props</em>) и возвращает описание UI
          (JSX). Ничего сложного.
        </p>
        <CodeHighlight lang="tsx" code={COMPONENT_EXAMPLE} />
        <div className={s.threePoints}>
          {[
            {
              n: '01',
              title: 'Функция',
              body: 'Компонент — обычная JavaScript-функция. Никакой магии. Можешь вызвать её, отладить, протестировать как любую другую функцию.',
            },
            {
              n: '02',
              title: 'Props — входные данные',
              body: 'Props (от properties) — это аргументы компонента. Они всегда передаются снаружи: родительский компонент решает что передать дочернему.',
            },
            {
              n: '03',
              title: 'JSX — описание UI',
              body: 'Возвращаемый JSX описывает что нужно отобразить. Это не строки и не HTML — это JavaScript-объекты. React потом превратит их в реальный DOM.',
            },
          ].map(p => (
            <div key={p.n} className={s.point}>
              <div className={s.pointNum}>{p.n}</div>
              <div className={s.pointBody}>
                <div className={s.pointTitle}>{p.title}</div>
                <div className={s.pointText}>{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Компонентное дерево ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Дерево компонентов</SectionTitle>
        <p className={s.body}>
          Реальное приложение — это дерево вложенных компонентов.
          Каждый компонент отвечает за свою часть экрана и не знает
          о том как устроены остальные.
        </p>
        <CodeHighlight lang="tsx" code={APP_TREE_CODE} />
        <div className={s.treeAdvantages}>
          {[
            { icon:'◈', title:'Переиспользование',  desc:'Один компонент Post — десятки постов в списке. Изменил один раз — обновилось везде.' },
            { icon:'§', title:'Изоляция',           desc:'Баг в Sidebar не ломает Header. Каждый компонент — независимый кусок системы.' },
            { icon:'⊕', title:'Читаемость',         desc:'Смотришь на App и сразу понимаешь из чего состоит страница — без чтения 500 строк HTML.' },
          ].map(a => (
            <div key={a.icon} className={s.advantage}>
              <span className={s.advantageIcon}>{a.icon}</span>
              <div>
                <div className={s.advantageTitle}>{a.title}</div>
                <div className={s.advantageDesc}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Virtual DOM ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Virtual DOM: почему React быстрый</SectionTitle>
        <p className={s.lead}>
          Изменение реального DOM — дорогая операция: браузер
          пересчитывает стили, перестраивает layout, перерисовывает пиксели.
          React не трогает реальный DOM при каждом изменении состояния.
          Вместо этого он работает с <strong>Virtual DOM</strong> — лёгкой
          JavaScript-копией дерева элементов.
        </p>
        <div className={s.vdomSteps}>
          {[
            { step:'1', title:'Состояние изменилось',    desc:'Пользователь кликнул кнопку → setCount(count + 1)' },
            { step:'2', title:'React строит новый VDOM', desc:'Пересчитывает JSX и создаёт новое дерево JavaScript-объектов' },
            { step:'3', title:'Diffing (сравнение)',      desc:'Сравнивает новый VDOM со старым — находит что именно изменилось' },
            { step:'4', title:'Patch (обновление DOM)',   desc:'Обновляет только изменившиеся узлы реального DOM. Всё остальное не трогает' },
          ].map(step => (
            <div key={step.step} className={s.vdomStep}>
              <div className={s.vdomStepNum}>{step.step}</div>
              <div className={s.vdomStepBody}>
                <div className={s.vdomStepTitle}>{step.title}</div>
                <div className={s.vdomStepDesc}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. ReconciliationDemo ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: reconciliation в действии</SectionTitle>
        <p className={s.body}>
          Нажми кнопку — увидишь как React проходит фазы: trigger → virtual DOM →
          diff → patch. Только один компонент обновится. Остальные 7 не тронуты.
        </p>
        <ReconciliationDemo />
      </section>

      {/* ── 8. Когда НЕ нужен React ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда React — это правильный выбор</SectionTitle>
        <p className={s.body}>
          React отлично подходит для приложений с <strong>динамическим UI</strong>:
          когда пользователь активно взаимодействует с интерфейсом, данные часто
          обновляются, много состояния нужно синхронизировать между компонентами.
        </p>
        <div className={s.twoCols}>
          <div className={s.goodCard}>
            <div className={s.cardLabel}>// хороший кандидат для React</div>
            <ul className={s.cardList}>
              <li>Дашборды и SPA с богатым интерфейсом</li>
              <li>Формы с валидацией и живым preview</li>
              <li>Real-time данные (чаты, уведомления)</li>
              <li>Приложения с множеством интерактивных состояний</li>
            </ul>
          </div>
          <div className={s.badCard}>
            <div className={s.cardLabel}>// может быть избыточным</div>
            <ul className={s.cardList}>
              <li>Простой лендинг без динамики</li>
              <li>Страница с одной кнопкой и одним эффектом</li>
              <li>Сайт где контент полностью статичен</li>
              <li>Когда нужна максимальная скорость первой загрузки</li>
            </ul>
          </div>
        </div>
        <Callout variant="info">
          React — это инструмент, а не религия. Для простых задач Vanilla JS
          может быть быстрее и проще. Для больших интерактивных приложений
          React даёт структуру, предсказуемость и огромную экосистему.
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
