import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { FlexboxPlayground } from './FlexboxPlayground';
import { QUIZ_QUESTIONS } from './quizData';
import s from './FlexboxArticle.module.scss';

export function FlexboxArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Что такое Flexbox</SectionTitle>
        <p className={s.prose}>
          <strong>Flexbox</strong> (Flexible Box Layout) — модель CSS для раскладки элементов в
          одном измерении: либо по строке, либо по столбцу. В отличие от float и inline-block,
          Flexbox даёт контейнеру контроль над выравниванием, порядком и распределением пространства
          между дочерними элементами.
        </p>
        <CodeHighlight lang="css" code={`.container {
  display: flex;        /* включаем flex-контекст */
}

/* Дочерние элементы становятся flex-items */`} />
        <p className={s.prose}>
          Flexbox работает по двум осям: <strong>главной</strong> (main axis, по умолчанию
          горизонталь) и <strong>поперечной</strong> (cross axis, перпендикулярна главной).
          Направление задаётся через <code>flex-direction</code>.
        </p>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>Свойства контейнера</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Свойство</th>
              <th>Что делает</th>
              <th>Значения</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['flex-direction', 'Направление главной оси', 'row | row-reverse | column | column-reverse'],
              ['flex-wrap', 'Перенос элементов на новую строку', 'nowrap | wrap | wrap-reverse'],
              ['justify-content', 'Выравнивание вдоль главной оси', 'flex-start | flex-end | center | space-between | space-around | space-evenly'],
              ['align-items', 'Выравнивание вдоль поперечной оси (одна строка)', 'flex-start | flex-end | center | stretch | baseline'],
              ['align-content', 'Выравнивание строк при wrap (несколько строк)', 'flex-start | flex-end | center | space-between | space-around | stretch'],
              ['gap', 'Отступы между элементами', 'row-gap column-gap'],
            ].map(([prop, desc, vals]) => (
              <tr key={prop} className={s.tableRow}>
                <td><code>{prop}</code></td>
                <td>{desc}</td>
                <td><code>{vals}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeHighlight lang="css" code={`.container {
  display: flex;
  flex-direction: row;          /* → горизонталь (по умолчанию) */
  flex-wrap: wrap;              /* перенос при нехватке места */
  justify-content: space-between; /* пространство между элементами */
  align-items: center;          /* по центру поперечной оси */
  gap: 16px;                    /* отступ между всеми элементами */
}`} />
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Свойства элементов</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Свойство</th>
              <th>Что делает</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['flex-grow', 'Коэффициент роста при наличии свободного места'],
              ['flex-shrink', 'Коэффициент сжатия при нехватке места'],
              ['flex-basis', 'Базовый размер до применения grow/shrink'],
              ['flex', 'Сокращение: flex-grow flex-shrink flex-basis'],
              ['align-self', 'Переопределяет align-items для конкретного элемента'],
              ['order', 'Визуальный порядок (по умолчанию 0, меньше = раньше)'],
            ].map(([prop, desc]) => (
              <tr key={prop} className={s.tableRow}>
                <td><code>{prop}</code></td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeHighlight lang="css" code={`/* flex: grow shrink basis */
.item { flex: 1; }          /* = flex: 1 1 0%  — растёт и сжимается */
.item { flex: auto; }       /* = flex: 1 1 auto */
.item { flex: none; }       /* = flex: 0 0 auto — жёсткий размер */

/* Распределение свободного места */
.sidebar { flex: 0 0 240px; } /* фиксированная ширина */
.content  { flex: 1; }        /* занимает всё остальное */

/* Порядок */
.promo { order: -1; } /* показать первым, даже если в DOM второй */`} />
        <Callout variant="info">
          <code>flex: 1</code> — самое частое значение. Оно означает «занять всё доступное
          пространство». Если у нескольких элементов <code>flex: 1</code>, они делят пространство
          поровну. Дробные значения (<code>flex: 2</code> vs <code>flex: 1</code>) задают пропорцию.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>Интерактивная песочница</SectionTitle>
        <p className={s.prose}>
          Меняй параметры и наблюдай, как они влияют на раскладку. Справа — CSS-код, который
          будет применён к контейнеру.
        </p>
        <FlexboxPlayground />
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Типичные паттерны</SectionTitle>
        <CodeHighlight lang="css" code={`/* 1. Центрирование по обеим осям */
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Sticky footer */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; } /* растягивается, прижимая footer */

/* 3. Равные колонки */
.columns {
  display: flex;
  gap: 24px;
}
.columns > * { flex: 1; }

/* 4. Карточная сетка с переносом */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  flex: 1 1 calc(33.333% - 16px);
  min-width: 200px; /* контрольный минимум */
}

/* 5. Навигация: лого слева, кнопки справа */
.nav {
  display: flex;
  align-items: center;
}
.nav-spacer { flex: 1; } /* или: justify-content: space-between */`} />
      </section>

      {/* 6 */}
      <section className={s.section}>
        <SectionTitle>Flexbox vs Grid</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr>
              <th>Аспект</th>
              <th>Flexbox</th>
              <th>Grid</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Измерения', '1D (строка или столбец)', '2D (строки и столбцы)'],
              ['Подходит для', 'Навигация, карточки, выравнивание', 'Макет страницы, сложные сетки'],
              ['Размер элементов', 'Определяется контентом + flex', 'Определяется дорожками (tracks)'],
              ['Порядок', 'order, flex-direction', 'grid-area, grid-column/row'],
            ].map(([aspect, flex, grid]) => (
              <tr key={aspect} className={s.tableRow}>
                <td>{aspect}</td>
                <td>{flex}</td>
                <td>{grid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Callout variant="accent">
          Flexbox и Grid не конкуренты — они дополняют друг друга. Grid строит двумерный каркас
          страницы; Flexbox выравнивает элементы внутри каждой ячейки этого каркаса.
        </Callout>
      </section>

      {/* 7 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <p className={s.prose}>6 задач — от базовых осей до расчёта flex-grow.</p>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
