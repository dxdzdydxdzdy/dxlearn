import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BigOChart } from './BigOChart';
import { QUIZ_QUESTIONS } from './quizData';
import s from './BigOArticle.module.scss';

export function BigOArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Зачем измерять сложность</SectionTitle>
        <p className={s.lead}>
          Два алгоритма делают одно и то же — но один на миллионе элементов
          работает <strong>секунду</strong>, другой — <strong>12 дней</strong>.
          Big O нотация — это язык, на котором программисты описывают этот разрыв,
          не запуская код.
        </p>
        <p className={s.body}>
          Big O описывает <em>как растёт время выполнения</em> при увеличении n
          в <strong>худшем случае</strong>. Точные секунды нас не интересуют —
          важна только форма роста. Константы отбрасываются, остаётся суть.
        </p>

        <div className={s.ruleBox}>
          <div className={s.ruleTitle}>// правила упрощения</div>
          <div className={s.rules}>
            <div className={s.rule}>
              <code>O(2n)</code><span className={s.ruleArrow}>→</span><code>O(n)</code>
              <span className={s.ruleNote}>константные множители выбрасываем</span>
            </div>
            <div className={s.rule}>
              <code>O(n + n²)</code><span className={s.ruleArrow}>→</span><code>O(n²)</code>
              <span className={s.ruleNote}>берём доминирующий член</span>
            </div>
            <div className={s.rule}>
              <code>O(500)</code><span className={s.ruleArrow}>→</span><code>O(1)</code>
              <span className={s.ruleNote}>любая константа = O(1)</span>
            </div>
            <div className={s.rule}>
              <code>O(n) × O(n)</code><span className={s.ruleArrow}>→</span><code>O(n²)</code>
              <span className={s.ruleNote}>вложенные циклы перемножаются</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. График ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как растут классы сложности</SectionTitle>
        <p className={s.body}>
          График использует <strong>логарифмическую шкалу</strong> по вертикали —
          только так видна разница между O(n) и O(log n). Таблица ниже показывает
          реальные числа: насколько O(n²) хуже O(n) при n = 1M.
        </p>
        <BigOChart />
      </section>

      {/* ── 3. Лучший / средний / худший ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Лучший, средний, худший случай</SectionTitle>
        <p className={s.body}>
          Big O — это <em>верхняя граница</em> (худший случай). Существуют и другие обозначения:
        </p>

        <div className={s.casesGrid}>
          <div className={s.caseCard}>
            <div className={s.caseName}>O (Big O)</div>
            <div className={s.caseSymbol} style={{ color: '#ff7b72' }}>верхняя граница</div>
            <div className={s.caseDesc}>Худший случай. «Не хуже чем X». Самое распространённое.</div>
          </div>
          <div className={s.caseCard}>
            <div className={s.caseName}>Ω (Big Omega)</div>
            <div className={s.caseSymbol} style={{ color: '#00e5a0' }}>нижняя граница</div>
            <div className={s.caseDesc}>Лучший случай. «Не лучше чем X». Редко используется.</div>
          </div>
          <div className={s.caseCard}>
            <div className={s.caseName}>Θ (Big Theta)</div>
            <div className={s.caseSymbol} style={{ color: '#4db8ff' }}>точная оценка</div>
            <div className={s.caseDesc}>Лучший = Худший случай. Сложность точно X.</div>
          </div>
        </div>

        <div className={s.caseExample}>
          <div className={s.caseExTitle}>// Линейный поиск по массиву:</div>
          <div className={s.caseExRow}>
            <span className={s.caseExLabel}>Ω(1)</span>
            <span className={s.caseExValue}>элемент первый в массиве — нашли сразу</span>
          </div>
          <div className={s.caseExRow}>
            <span className={s.caseExLabel}>O(n)</span>
            <span className={s.caseExValue}>элемент последний или отсутствует — обошли весь массив</span>
          </div>
          <div className={s.caseExRow}>
            <span className={s.caseExLabel}>Θ(n)</span>
            <span className={s.caseExValue}>нельзя утверждать — зависит от данных</span>
          </div>
        </div>

        <p className={s.body}>
          Когда говорят «сложность алгоритма» без уточнения — обычно имеют в виду
          Big O (худший случай). Это консервативная оценка: «в любом сценарии будет не хуже».
        </p>
      </section>

      {/* ── 4. Как читать код ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как читать сложность в коде</SectionTitle>
        <p className={s.body}>
          Простые правила, которые покрывают 90% реальных ситуаций:
        </p>

        <div className={s.methodSteps}>
          <div className={s.methodStep}>
            <div className={s.methodNum}>01</div>
            <div className={s.methodBody}>
              <div className={s.methodTitle}>Один цикл по n элементам → O(n)</div>
              <CodeHighlight lang="ts" code={`for (let i = 0; i < n; i++) {
  doSomething(); // O(1) работа
}
// Итого: O(n)`} />
            </div>
          </div>

          <div className={s.methodStep}>
            <div className={s.methodNum}>02</div>
            <div className={s.methodBody}>
              <div className={s.methodTitle}>Два вложенных цикла → O(n²)</div>
              <CodeHighlight lang="ts" code={`for (let i = 0; i < n; i++) {       // n
  for (let j = 0; j < n; j++) {     // n
    doSomething(); // O(1)
  }
}
// n × n = O(n²)`} />
            </div>
          </div>

          <div className={s.methodStep}>
            <div className={s.methodNum}>03</div>
            <div className={s.methodBody}>
              <div className={s.methodTitle}>Цикл, делящий задачу пополам → O(log n)</div>
              <CodeHighlight lang="ts" code={`while (n > 1) {
  n = Math.floor(n / 2); // делим пополам каждый раз
}
// log₂(n) итераций → O(log n)`} />
            </div>
          </div>

          <div className={s.methodStep}>
            <div className={s.methodNum}>04</div>
            <div className={s.methodBody}>
              <div className={s.methodTitle}>Последовательные блоки → сумма (берём максимум)</div>
              <CodeHighlight lang="ts" code={`// Блок A: O(n)
for (let i = 0; i < n; i++) { ... }

// Блок B: O(n²)
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) { ... }
}

// O(n) + O(n²) = O(n²) — берём доминирующий`} />
            </div>
          </div>

          <div className={s.methodStep}>
            <div className={s.methodNum}>05</div>
            <div className={s.methodBody}>
              <div className={s.methodTitle}>Рекурсия → считаем уровни × работа</div>
              <CodeHighlight lang="ts" code={`function f(n: number): void {
  if (n <= 1) return;
  f(n / 2); // вызов с половиной → log n уровней
  f(n / 2); // ещё один вызов

  for (let i = 0; i < n; i++) { ... } // O(n) на каждом уровне
}
// log n уровней × O(n) работы = O(n log n)
// (это Merge Sort)`} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Таблица сложностей структур данных ──────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Шпаргалка: сложность операций</SectionTitle>
        <p className={s.body}>
          Одна из самых полезных таблиц — знать её наизусть значит не гуглить
          на каждом code review.
        </p>

        <div className={s.dsTable}>
          <div className={s.dsHeader}>
            <span>Структура</span>
            <span>Access</span>
            <span>Search</span>
            <span>Insert</span>
            <span>Delete</span>
          </div>
          {[
            { name: 'Array',        access: ['O(1)', 'g'], search: ['O(n)', 'y'], insert: ['O(n)', 'y'], del: ['O(n)', 'y'] },
            { name: 'Linked List',  access: ['O(n)', 'y'], search: ['O(n)', 'y'], insert: ['O(1)†', 'g'], del: ['O(1)†', 'g'] },
            { name: 'Hash Table',   access: ['—', 'n'],    search: ['O(1)*', 'g'], insert: ['O(1)*', 'g'], del: ['O(1)*', 'g'] },
            { name: 'Stack/Queue',  access: ['O(n)', 'y'], search: ['O(n)', 'y'], insert: ['O(1)', 'g'], del: ['O(1)', 'g'] },
            { name: 'BST (ср.)',    access: ['O(log n)', 'g'], search: ['O(log n)', 'g'], insert: ['O(log n)', 'g'], del: ['O(log n)', 'g'] },
            { name: 'BST (худш.)', access: ['O(n)', 'y'], search: ['O(n)', 'y'], insert: ['O(n)', 'y'], del: ['O(n)', 'y'] },
          ].map(row => (
            <div key={row.name} className={s.dsRow}>
              <span className={s.dsName}>{row.name}</span>
              {[row.access, row.search, row.insert, row.del].map(([val, tier], i) => (
                <span key={i} className={s.dsCell} style={{ color: tier === 'g' ? '#00e5a0' : tier === 'y' ? '#f0db4f' : '#3d5562' }}>
                  {val}
                </span>
              ))}
            </div>
          ))}
          <div className={s.dsNote}>† с указателем на узел · * в среднем, O(n) в худшем</div>
        </div>
      </section>

      {/* ── 6. Примеры кода ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Распознай сложность</SectionTitle>
        <p className={s.body}>Типичные паттерны, которые встречаются в задачах:</p>

        <div className={s.examples}>
          <div className={s.example}>
            <div className={s.exampleBadge} style={{ background: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}>O(1)</div>
            <CodeHighlight lang="ts" code={`arr[i]                   // доступ по индексу
map.get(key)             // хеш-таблица (среднее)
stack.push(x)            // стек
queue.enqueue(x)         // очередь`} />
          </div>

          <div className={s.example}>
            <div className={s.exampleBadge} style={{ background: 'rgba(77,184,255,0.12)', color: '#4db8ff' }}>O(log n)</div>
            <CodeHighlight lang="ts" code={`// Задача каждый раз делится пополам
while (n > 1) n = n >> 1;  // битовый сдвиг

// Возведение в степень через divide & conquer
function pow(base: number, exp: number): number {
  if (exp === 0) return 1;
  const half = pow(base, exp >> 1);
  return exp % 2 === 0 ? half * half : half * half * base;
} // O(log exp) вместо O(exp)`} />
          </div>

          <div className={s.example}>
            <div className={s.exampleBadge} style={{ background: 'rgba(240,219,79,0.12)', color: '#f0db4f' }}>O(n)</div>
            <CodeHighlight lang="ts" code={`arr.find(x => x > 5)     // один проход
arr.map(x => x * 2)      // один проход
arr.filter(Boolean)      // один проход
arr.reduce((a,b) => a+b) // один проход

// Хитрый O(n) — кажется вложенным, но j не зависит от i:
function twoSum(arr: number[], t: number) {
  const seen = new Set<number>();
  for (const x of arr) {           // O(n)
    if (seen.has(t - x)) return x; // O(1) lookup
    seen.add(x);
  }
}`} />
          </div>

          <div className={s.example}>
            <div className={s.exampleBadge} style={{ background: 'rgba(255,123,114,0.12)', color: '#ff7b72' }}>O(n²)</div>
            <CodeHighlight lang="ts" code={`// Классика: два вложенных цикла
for (let i = 0; i < n; i++)
  for (let j = 0; j < n; j++) { ... }

// Ловушка: arr.includes() внутри цикла → O(n²)!
for (const x of arr)           // O(n)
  if (result.includes(x)) ...  // O(n) поиск!

// Фикс: использовать Set
const seen = new Set(result);
for (const x of arr)           // O(n)
  if (seen.has(x)) ...         // O(1)`} />
          </div>
        </div>
      </section>

      {/* ── 7. Амортизированная сложность ─────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Амортизированная сложность</SectionTitle>
        <p className={s.body}>
          Иногда одна операция стоит дорого, но <strong>в среднем по серии</strong>
          — всё равно O(1). Самый показательный пример — динамический массив.
        </p>
        <CodeHighlight lang="ts" code={`// Array.push() — амортизировано O(1)
//
// Когда массив полон, он удваивается: O(n) — копируем все элементы.
// НО это происходит редко: после n push'ей было 1+2+4+...+n = 2n копирований.
// 2n операций на n push'ей = O(1) в среднем на push.
//
//  push #1   O(1)   ──────────────────────────────────────── ●
//  push #2   O(1)   ──────────────────────────────────────── ●
//  push #3   O(2)   ●● (удвоение с 2 до 4, копируем 2 эл.)
//  push #4   O(1)   ──────────────────────────────────────── ●
//  push #5   O(4)   ●●●● (удвоение с 4 до 8, копируем 4 эл.)
//  ...
//  Итого: O(1) амортизировано

const arr: number[] = [];
for (let i = 0; i < 1_000_000; i++) {
  arr.push(i); // выглядит как O(n²), но это O(n) суммарно
}`} />
        <p className={s.body}>
          Аналогично: <code>Map.set()</code>, <code>Set.add()</code> — O(1) амортизировано.
          Хеш-таблица иногда перестраивается, но редко.
        </p>
      </section>

      {/* ── 8. Пространственная сложность ─────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Пространственная сложность</SectionTitle>
        <p className={s.body}>
          Big O применяется не только ко времени, но и к <strong>памяти</strong>.
          Space complexity — сколько <em>дополнительной</em> памяти нужно алгоритму.
        </p>

        <div className={s.spaceExamples}>
          <div className={s.spaceRow}>
            <code className={s.spaceNotation} style={{ color: '#00e5a0' }}>O(1)</code>
            <div className={s.spaceDesc}>
              <span className={s.spaceTitle}>Несколько переменных</span>
              <CodeHighlight lang="ts" code={`function sum(arr: number[]): number {
  let total = 0;          // одна переменная
  for (const n of arr) total += n;
  return total;
} // O(1) памяти`} />
            </div>
          </div>

          <div className={s.spaceRow}>
            <code className={s.spaceNotation} style={{ color: '#f0db4f' }}>O(n)</code>
            <div className={s.spaceDesc}>
              <span className={s.spaceTitle}>Копия данных / рекурсия</span>
              <CodeHighlight lang="ts" code={`function reversed(arr: number[]): number[] {
  return [...arr].reverse(); // новый массив = O(n)
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // n фреймов на стеке = O(n)
}`} />
            </div>
          </div>

          <div className={s.spaceRow}>
            <code className={s.spaceNotation} style={{ color: '#ff7b72' }}>O(n²)</code>
            <div className={s.spaceDesc}>
              <span className={s.spaceTitle}>Двумерная структура</span>
              <CodeHighlight lang="ts" code={`// Матрица смежности для графа из n вершин
const matrix = Array.from({ length: n },
  () => new Array(n).fill(0)); // n × n = O(n²) памяти`} />
            </div>
          </div>
        </div>

        <div className={s.tradeof}>
          <span className={s.tradeofLabel}>// классический trade-off</span>
          <p className={s.tradeofText}>
            Часто можно ускорить алгоритм, потратив больше памяти.
            Пример: хранить результаты в хеш-таблице (кэш/мемоизация) —
            время O(1) вместо O(n), но память O(n) вместо O(1).
            Это называется <em>time-space trade-off</em>.
          </p>
        </div>
      </section>

      {/* ── 9. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
