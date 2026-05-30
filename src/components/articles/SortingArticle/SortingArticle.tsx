import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { SortingDemo } from './SortingDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './SortingArticle.module.scss';

export function SortingArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Обзор ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Сравнение алгоритмов</SectionTitle>
        <p className={s.lead}>
          Сортировка — одна из самых изученных задач в CS. Нижняя граница
          для <em>сравнительной</em> сортировки — <strong>Ω(n log n)</strong>.
          Алгоритмы различаются константами, поведением на реальных данных
          и использованием памяти.
        </p>

        <div className={s.compareTable}>
          <div className={s.compareHeader}>
            <span>Алгоритм</span><span>Лучший</span><span>Средний</span><span>Худший</span><span>Память</span><span>Стабильный</span>
          </div>
          {[
            { name: 'Bubble Sort',     best: 'O(n)',      avg: 'O(n²)',      worst: 'O(n²)',     mem: 'O(1)',  stable: true  },
            { name: 'Selection Sort',  best: 'O(n²)',     avg: 'O(n²)',      worst: 'O(n²)',     mem: 'O(1)',  stable: false },
            { name: 'Insertion Sort',  best: 'O(n)',      avg: 'O(n²)',      worst: 'O(n²)',     mem: 'O(1)',  stable: true  },
            { name: 'Merge Sort',      best: 'O(n log n)',avg: 'O(n log n)', worst: 'O(n log n)',mem: 'O(n)', stable: true  },
            { name: 'Quick Sort',      best: 'O(n log n)',avg: 'O(n log n)', worst: 'O(n²)',     mem: 'O(log n)', stable: false },
            { name: 'Heap Sort',       best: 'O(n log n)',avg: 'O(n log n)', worst: 'O(n log n)',mem: 'O(1)', stable: false },
          ].map(row => (
            <div key={row.name} className={s.compareRow}>
              <span className={s.algoName}>{row.name}</span>
              <span className={s.complexity} style={{ color: row.best === 'O(n)' ? '#00e5a0' : '#7a9aaa' }}>{row.best}</span>
              <span className={s.complexity}>{row.avg}</span>
              <span className={s.complexity} style={{ color: row.worst === 'O(n²)' ? '#ff7b72' : '#7a9aaa' }}>{row.worst}</span>
              <span className={s.complexity}>{row.mem}</span>
              <span className={s.stableFlag} style={{ color: row.stable ? '#00e5a0' : '#ff7b72' }}>{row.stable ? '✓' : '✗'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Демо ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Визуализация: Bubble vs Merge</SectionTitle>
        <p className={s.body}>
          Оранжевые столбики — сравниваемые элементы. Зелёные — отсортированная часть.
          Сравни количество операций между алгоритмами.
        </p>
        <SortingDemo />
      </section>

      {/* ── 3. Selection Sort ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Selection Sort</SectionTitle>
        <p className={s.body}>
          На каждом шаге ищем <strong>минимальный элемент</strong> в неотсортированной части
          и ставим его на нужное место. Всегда ровно <em>n–1 свопов</em> — независимо от данных.
          Полезно, когда запись дороже чтения (например, flash-память).
        </p>
        <CodeHighlight lang="ts" filename="selectionSort.ts" code={`function selectionSort(arr: number[]): number[] {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) minIdx = j;        // ищем минимум
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]]; // ставим на место
  }
  return a;
}
// [64, 25, 12, 22, 11] → шаг 1: найден min=11, своп → [11, 25, 12, 22, 64]
//                         шаг 2: найден min=12, своп → [11, 12, 25, 22, 64] ...`} />
      </section>

      {/* ── 4. Insertion Sort ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Insertion Sort</SectionTitle>
        <p className={s.body}>
          Берём следующий элемент и <strong>вставляем его в нужное место</strong> уже отсортированной части.
          Как сортируют карты в руке. При почти отсортированных данных — <em>O(n)</em>.
          Именно поэтому его использует <strong>TimSort</strong> (V8, Java) для малых подмассивов.
        </p>
        <CodeHighlight lang="ts" filename="insertionSort.ts" code={`function insertionSort(arr: number[]): number[] {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    // сдвигаем больших вправо, освобождая место для key
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}
// Лучший случай: [1,2,3,4,5] → 0 свопов, O(n)
// Худший случай: [5,4,3,2,1] → n(n-1)/2 свопов, O(n²)`} />
      </section>

      {/* ── 5. Bubble Sort ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Bubble Sort</SectionTitle>
        <p className={s.body}>
          Самый простой в реализации. На каждом проходе «всплывает»
          наибольший элемент. Используется только для обучения — в продакшне неприменим.
        </p>
        <CodeHighlight lang="ts" filename="bubbleSort.ts" code={`function bubbleSort(arr: number[]): number[] {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // оптимизация: уже отсортирован
  }
  return a;
}`} />
      </section>

      {/* ── 4. Merge Sort ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Merge Sort</SectionTitle>
        <p className={s.body}>
          Разделяй и властвуй. Делим массив пополам рекурсивно до
          одного элемента, затем сливаем обратно в отсортированном порядке.
          Гарантированный <strong>O(n log n)</strong>, стабильный.
        </p>
        <CodeHighlight lang="ts" filename="mergeSort.ts" code={`function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid   = arr.length >> 1;
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`} />
      </section>

      {/* ── 5. Quick Sort ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Quick Sort</SectionTitle>
        <p className={s.body}>
          Выбираем pivot, разбиваем на «меньше» и «больше», рекурсивно сортируем.
          На практике быстрее Merge Sort благодаря кеш-эффективности.
          Случайный pivot — защита от O(n²).
        </p>
        <CodeHighlight lang="ts" filename="quickSort.ts" code={`function quickSort(arr: number[], lo = 0, hi = arr.length - 1): void {
  if (lo >= hi) return;
  const p = partition(arr, lo, hi);
  quickSort(arr, lo, p - 1);
  quickSort(arr, p + 1, hi);
}

function partition(arr: number[], lo: number, hi: number): number {
  // Случайный pivot — защита от вырожденных случаев
  const randIdx = lo + Math.floor(Math.random() * (hi - lo + 1));
  [arr[randIdx], arr[hi]] = [arr[hi], arr[randIdx]];

  const pivot = arr[hi];
  let i = lo - 1;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) [arr[++i], arr[j]] = [arr[j], arr[i]];
  }
  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
  return i + 1;
}`} />
      </section>

      {/* ── 7. Стабильность ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Стабильность: почему это важно</SectionTitle>
        <p className={s.body}>
          Стабильная сортировка сохраняет <strong>относительный порядок равных элементов</strong>.
          Это критично при многоуровневой сортировке.
        </p>
        <CodeHighlight lang="ts" code={`// Сортируем сотрудников: сначала по отделу, потом по зарплате
const employees = [
  { name: 'Alice', dept: 'Eng', salary: 90 },
  { name: 'Bob',   dept: 'Eng', salary: 80 },
  { name: 'Carol', dept: 'HR',  salary: 70 },
];

// Шаг 1: стабильная сортировка по зарплате (возр.)
employees.sort((a, b) => a.salary - b.salary);
// → Carol(70), Bob(80), Alice(90)

// Шаг 2: стабильная сортировка по отделу
employees.sort((a, b) => a.dept.localeCompare(b.dept));
// → Bob(80), Alice(90), Carol(70)  ← Eng отсортирован по зарплате ✓

// Если бы sort был НЕстабильным — порядок Bob/Alice мог бы сломаться`} />
        <p className={s.body}>
          <strong>Стабильные:</strong> Merge Sort, Insertion Sort, Bubble Sort, TimSort.<br />
          <strong>Нестабильные:</strong> Quick Sort, Heap Sort, Selection Sort.
        </p>
      </section>

      {/* ── 8. TimSort — что использует JS ─────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что использует Array.sort()</SectionTitle>
        <p className={s.body}>
          Современные движки (V8, SpiderMonkey, JavaCore) используют <strong>TimSort</strong> —
          гибрид Merge Sort и Insertion Sort. Логика проста:
        </p>
        <div className={s.timSortSteps}>
          {[
            { step: '01', title: 'Найти runs', desc: 'Разбить массив на уже отсортированные участки (натуральные «runs») или достроить их через Insertion Sort до минимального размера (minRun ≈ 32–64).' },
            { step: '02', title: 'Слить runs', desc: 'Объединять соседние runs через merge, как в Merge Sort. Благодаря натуральным runs реальные данные сортируются намного быстрее теоретического O(n log n).' },
          ].map(r => (
            <div key={r.step} className={s.timSortStep}>
              <span className={s.timStepNum}>{r.step}</span>
              <div>
                <div className={s.timStepTitle}>{r.title}</div>
                <div className={s.timStepDesc}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="ts" code={`// Array.sort() в JS — стабильный с ES2019 (раньше поведение не было гарантировано)
[3, 1, 4, 1, 5].sort((a, b) => a - b); // → [1, 1, 3, 4, 5]

// Без компаратора — СТРОКОВОЕ сравнение! Частая ловушка:
[10, 9, 2, 1, 100].sort();   // → [1, 10, 100, 2, 9] ← неверно!
[10, 9, 2, 1, 100].sort((a, b) => a - b); // → [1, 2, 9, 10, 100] ← верно`} />
      </section>

      {/* ── 9. Когда что применять ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда что применять</SectionTitle>
        <div className={s.whenGrid}>
          {[
            { algo: 'Insertion Sort', when: 'n < 20, почти отсортированные данные, онлайн-сортировка (данные приходят по одному)' },
            { algo: 'Merge Sort',     when: 'Нужна стабильность, сортировка связных списков, внешняя сортировка больших файлов' },
            { algo: 'Quick Sort',     when: 'Общее использование в памяти, быстро на реальных данных, есть random pivot' },
            { algo: 'Heap Sort',      when: 'Нужен O(1) памяти и O(n log n) гарантия, важно найти k наибольших элементов' },
            { algo: 'Counting/Radix', when: 'Целые числа с известным диапазоном, k << n' },
          ].map(row => (
            <div key={row.algo} className={s.whenCard}>
              <div className={s.whenAlgo}>{row.algo}</div>
              <div className={s.whenWhen}>{row.when}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
