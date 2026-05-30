import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { SpecificityCalc } from './SpecificityCalc';
import { QUIZ_QUESTIONS } from './quizData';
import s from './CascadeArticle.module.scss';

const SPECIFICITY_TABLE = [
  { selector: 'style=""', example: '<p style="color:red">', score: '(1,0,0,0)', label: 'Инлайн', color: '#b48eff' },
  { selector: '#id', example: '#header', score: '(0,1,0,0)', label: 'ID', color: '#ff5f6a' },
  { selector: '.class / [attr] / :pseudo-class', example: '.btn, [type], :hover', score: '(0,0,1,0)', label: 'Класс', color: '#f0c040' },
  { selector: 'tag / ::pseudo-element', example: 'p, div, ::before', score: '(0,0,0,1)', label: 'Тег', color: '#00e5a0' },
  { selector: '*', example: '* (универсальный)', score: '(0,0,0,0)', label: 'Ноль', color: '#3d5562' },
];

export function CascadeArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Что такое каскад</SectionTitle>
        <p className={s.prose}>
          <strong>Каскад</strong> — алгоритм, по которому браузер решает, какое CSS-правило применить
          к элементу, если несколько правил претендуют на одно свойство. Его называют «каскадом»,
          потому что решение принимается по уровням: каждый уровень перекрывает предыдущий.
        </p>
        <p className={s.prose}>
          Порядок рассмотрения (от наивысшего приоритета к наименьшему):
        </p>
        <div className={s.pyramid}>
          {[
            { label: '!important', sub: '+ origin (user > author > browser)', badge: '!', bg: '#ff5f6a' },
            { label: 'Инлайн-стиль', sub: 'style="..."', badge: '1,0,0,0', bg: '#b48eff' },
            { label: 'Специфичность', sub: 'ID > Class > Tag', badge: '0,x,x,x', bg: '#f0c040' },
            { label: 'Порядок в таблице', sub: 'позиция в CSS-файле', badge: 'pos', bg: '#4e9eff' },
            { label: 'Наследование', sub: 'от родителя', badge: '↑', bg: '#00e5a0' },
            { label: 'Начальное значение', sub: 'initial / браузерный дефолт', badge: '∅', bg: '#3d5562' },
          ].map(layer => (
            <div key={layer.label} className={s.pyramidLayer}>
              <span className={s.layerBadge} style={{ background: layer.bg }}>{layer.badge}</span>
              <span className={s.layerLabel}>{layer.label}</span>
              <span className={s.layerSub}>— {layer.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>Специфичность</SectionTitle>
        <p className={s.prose}>
          Специфичность — вес селектора, записываемый как четыре числа{' '}
          <code>(инлайн, ID, класс, тег)</code>. Числа сравниваются слева направо.
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Тип</th>
              <th>Пример</th>
              <th>Вес</th>
            </tr>
          </thead>
          <tbody>
            {SPECIFICITY_TABLE.map(row => (
              <tr key={row.selector} className={s.tableRow}>
                <td><code style={{ color: row.color }}>{row.selector}</code></td>
                <td><code>{row.example}</code></td>
                <td style={{ color: row.color, fontWeight: 700 }}>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeHighlight lang="css" code={`/* Специфичность: (0, 0, 1, 1) */
div.container { color: red; }

/* Специфичность: (0, 1, 0, 0) — побеждает */
#app { color: blue; }

/* Комбинированный: (0, 1, 1, 2) */
#nav ul li a.active { color: green; }
/*    ID cls tag tag cls */`} />
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Калькулятор специфичности</SectionTitle>
        <p className={s.prose}>
          Введи два CSS-селектора и сравни их специфичность. Числа вычисляются по стандарту CSS Selectors Level 4.
        </p>
        <SpecificityCalc />
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>!important и инлайн-стили</SectionTitle>
        <CodeHighlight lang="css" code={`/* !important перекрывает всё, кроме инлайн + !important */
.btn { color: blue !important; }
#app .btn { color: red; } /* проигрывает !important выше */

/* Инлайн: style="color: green" — (1,0,0,0) */
/* Побеждает любой селектор без !important */

/* Единственный способ перебить инлайн из CSS: */
.btn { color: purple !important; }`} />
        <Callout variant="warn">
          <code>!important</code> выламывается из нормального каскада и превращается в отладочный
          кошмар. Используйте только в крайних случаях: переопределение сторонних библиотек,
          стили для печати, utility-классы (типа <code>.hidden {'{ display: none !important }'}</code>).
        </Callout>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Наследование</SectionTitle>
        <p className={s.prose}>
          Некоторые CSS-свойства автоматически наследуются от родителя. Другие — нет.
          Поведение определяется спецификацией.
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Наследуется</th>
              <th>Не наследуется</th>
            </tr>
          </thead>
          <tbody>
            <tr className={s.tableRow}>
              <td><code>color, font-*, line-height, text-align, cursor, visibility</code></td>
              <td><code>background, border, margin, padding, width, height, display</code></td>
            </tr>
          </tbody>
        </table>
        <CodeHighlight lang="css" code={`/* Явное управление наследованием */
.child {
  color: inherit;     /* взять от родителя принудительно */
  color: initial;     /* сбросить к начальному значению */
  color: unset;       /* inherit если наследуется, иначе initial */
  color: revert;      /* браузерный дефолт */
}`} />
      </section>

      {/* 6 */}
      <section className={s.section}>
        <SectionTitle>Origin: откуда взялись стили</SectionTitle>
        <p className={s.prose}>
          Помимо специфичности, каскад учитывает <strong>происхождение</strong> стилей. Порядок
          приоритета (от высшего к низшему):
        </p>
        <CodeHighlight lang="bash" code={`!important user-agent   (браузерные стили, помечённые !important)
!important user          (пользовательские, напр. accessibility overrides)
!important author        (ваши стили с !important)

author                   (ваши обычные стили)
user                     (пользовательские без !important)
user-agent               (браузерный дефолт, напр. h1 { font-size: 2em })`} />
        <p className={s.prose}>
          На практике вы работаете только с <em>author</em>-стилями. Понимание origin помогает
          отладить ситуации, когда <code>!important</code> не помогает — возможно, браузерный агент
          имеет свой <code>!important</code>.
        </p>
      </section>

      {/* 7 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <p className={s.prose}>6 задач — от базового порядка правил до !important и наследования.</p>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
