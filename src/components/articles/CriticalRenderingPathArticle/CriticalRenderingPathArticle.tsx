import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { WaterfallDemo } from './WaterfallDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './CriticalRenderingPathArticle.module.scss';

const PIPELINE_STEPS = [
  { title: 'DOM', sub: 'парсинг HTML' },
  { title: 'CSSOM', sub: 'парсинг CSS' },
  { title: 'Render Tree', sub: 'видимые узлы' },
  { title: 'Layout', sub: 'геометрия' },
  { title: 'Paint', sub: 'пиксели' },
  { title: 'Composite', sub: 'слои' },
];

export function CriticalRenderingPathArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Что такое Critical Rendering Path</SectionTitle>
        <p className={s.prose}>
          <strong>Critical Rendering Path</strong> (CRP) — последовательность шагов, которые браузер
          выполняет от получения первого байта HTML до отображения первого пикселя на экране.
          Понимание CRP критично для оптимизации метрик <code>FCP</code>, <code>LCP</code> и <code>TTI</code>.
        </p>
        <div className={s.pipeline}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.title} className={s.pipeStep}>
              <div className={s.pipeBox}>
                <div className={s.pipeBoxTitle}>{step.title}</div>
                <div className={s.pipeBoxSub}>{step.sub}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className={s.pipeArrow}>→</div>
              )}
            </div>
          ))}
        </div>
        <p className={s.prose}>
          Браузер не может начать рендер, пока не построит <code>Render Tree</code> — объединение DOM
          (структура контента) и CSSOM (применённые стили). Любой ресурс, задерживающий построение
          одного из них, называется <strong>render-blocking</strong>.
        </p>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>DOM и CSSOM</SectionTitle>
        <p className={s.prose}>
          HTML-парсер строит DOM по мере чтения потока байт. CSS-парсер строит CSSOM — дерево,
          описывающее финальные стили каждого узла. Оба процесса инкрементальны, но CSSOM не
          публикуется частично: браузер ждёт полного файла, прежде чем продолжить рендер.
        </p>
        <CodeHighlight lang="html" code={`<!-- render-blocking: браузер ждёт загрузки И парсинга CSS -->
<link rel="stylesheet" href="styles.css">

<!-- parser-blocking: останавливает парсер HTML -->
<script src="app.js"></script>

<!-- НЕ блокирует рендер: загружается параллельно -->
<script src="analytics.js" async></script>

<!-- НЕ блокирует парсер: выполняется после HTML -->
<script src="bundle.js" defer></script>`} />
        <Callout variant="warn">
          <code>{'<link rel="stylesheet">'}</code> всегда блокирует рендер — у браузера нет
          выбора, ведь JS может читать <code>getComputedStyle()</code>. Если CSSOM не достроен,
          выполнение любого <code>{'<script>'}</code> без <code>async</code>/<code>defer</code>
          тоже блокируется.
        </Callout>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Waterfall: до и после оптимизаций</SectionTitle>
        <p className={s.prose}>
          Переключи сценарий, чтобы увидеть, как async/defer, preload и inline-CSS меняют
          порядок и параллельность загрузки ресурсов.
        </p>
        <WaterfallDemo />
        <p className={s.prose}>
          В сценарии «с оптимизациями» все ресурсы загружаются параллельно: JS помечен
          <code>defer</code>/<code>async</code>, критический CSS встроен инлайн, шрифт и
          изображение-герой объявлены через <code>preload</code>.
        </p>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>Layout, Paint, Composite</SectionTitle>
        <p className={s.prose}>
          После построения Render Tree браузер вычисляет геометрию (<strong>Layout</strong> /
          reflow), рисует пиксели (<strong>Paint</strong>) и склеивает слои (<strong>Composite</strong>).
          Изменение разных CSS-свойств запускает разные этапы.
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Свойство</th>
              <th>Запускает</th>
              <th>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['width / height / margin', 'Layout → Paint → Composite', 'высокая'],
              ['color / background', 'Paint → Composite', 'средняя'],
              ['transform / opacity', 'Composite only', 'низкая'],
              ['will-change: transform', 'создаёт слой заранее', 'низкая'],
            ].map(([prop, triggers, cost]) => (
              <tr key={prop} className={s.tableRow}>
                <td><code>{prop}</code></td>
                <td>{triggers}</td>
                <td className={cost === 'низкая' ? s.tip : cost === 'высокая' ? s.errTip : undefined}>
                  {cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeHighlight lang="js" code={`// Layout Thrashing — антипаттерн
items.forEach(el => {
  const h = el.offsetHeight;      // чтение → форсирует layout
  el.style.height = h + 10 + 'px'; // запись → инвалидирует layout
});

// Решение: batch reads, then writes
const heights = items.map(el => el.offsetHeight); // все чтения
items.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';       // все записи
});

// Ещё лучше — анимировать только transform/opacity
el.style.transform = 'translateY(10px)'; // только Composite`} />
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Ключевые метрики</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Метрика</th>
              <th>Что измеряет</th>
              <th>Цель</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['FCP', 'First Contentful Paint — первый контент', '< 1.8s'],
              ['LCP', 'Largest Contentful Paint — главный элемент', '< 2.5s'],
              ['TTI', 'Time to Interactive — страница отвечает', '< 3.8s'],
              ['CLS', 'Cumulative Layout Shift — визуальная стабильность', '< 0.1'],
              ['INP', 'Interaction to Next Paint — задержка ввода', '< 200ms'],
            ].map(([metric, desc, goal]) => (
              <tr key={metric} className={s.tableRow}>
                <td><code>{metric}</code></td>
                <td>{desc}</td>
                <td className={s.tip}>{goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Callout variant="accent">
          LCP, CLS и INP — это три метрики <strong>Core Web Vitals</strong>. Google использует их
          как сигнал ранжирования. Улучшение CRP напрямую влияет на LCP.
        </Callout>
      </section>

      {/* 6 */}
      <section className={s.section}>
        <SectionTitle>Чеклист оптимизаций</SectionTitle>
        <CodeHighlight lang="html" code={`<!-- 1. Встроить критический CSS -->
<style>/* только above-the-fold стили */</style>

<!-- 2. Preload критических ресурсов -->
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 3. Defer/async для некритичных скриптов -->
<script src="app.js" defer></script>
<script src="analytics.js" async></script>

<!-- 4. DNS prefetch для сторонних доменов -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- 5. Размеры изображений — предотвращают CLS -->
<img src="hero.jpg" width="800" height="400" alt="...">`} />
      </section>

      {/* 7 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <p className={s.prose}>5 задач — от базового понимания блокировки до layout thrashing.</p>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
