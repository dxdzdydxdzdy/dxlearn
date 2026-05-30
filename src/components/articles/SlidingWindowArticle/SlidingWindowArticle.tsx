import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { SlidingWindowDemo } from './SlidingWindowDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './SlidingWindowArticle.module.scss';

export function SlidingWindowArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Суть ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Суть паттерна</SectionTitle>
        <p className={s.lead}>
          Скользящее окно — это диапазон <code>[lo, hi]</code>, который движется
          по массиву слева направо. На каждом шаге мы добавляем
          один элемент справа и убираем один слева.
          Вместо пересчёта с нуля — <strong>O(1) обновление</strong>.
        </p>
        <div className={s.twoTypes}>
          <div className={s.typeCard}>
            <div className={s.typeTitle}>Фиксированный размер</div>
            <div className={s.typeDesc}>k задано заранее. Окно всегда длиной k, просто сдвигается.</div>
            <div className={s.typeExample}>max сумма k элементов, среднее k элементов</div>
          </div>
          <div className={s.typeCard}>
            <div className={s.typeTitle}>Переменный размер</div>
            <div className={s.typeDesc}>Расширяем пока условие выполняется, сужаем когда нет.</div>
            <div className={s.typeExample}>самая длинная подстрока без повторов, min покрывающее окно</div>
          </div>
        </div>
      </section>

      {/* ── 2. Демо ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Интерактив: максимальная сумма</SectionTitle>
        <p className={s.body}>
          Желтые ячейки — текущее окно, звёздочкой отмечен лучший найденный подмассив.
          Попробуй разные значения k.
        </p>
        <SlidingWindowDemo />
      </section>

      {/* ── 3. Код ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Шаблоны кода</SectionTitle>

        <p className={s.body}><strong>Фиксированный размер — максимальная сумма:</strong></p>
        <CodeHighlight lang="ts" filename="maxSumFixed.ts" code={`function maxSumFixed(arr: number[], k: number): number {
  // Считаем сумму первого окна
  let sum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let max = sum;

  // Скользим: +правый, -левый
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];
    max = Math.max(max, sum);
  }
  return max;
}`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Переменный размер — длиннейшая подстрока без повторов:</strong></p>
        <CodeHighlight lang="ts" filename="longestUnique.ts" code={`function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>(); // символ → последний индекс
  let lo = 0, max = 0;

  for (let hi = 0; hi < s.length; hi++) {
    const ch = s[hi];
    // Если символ уже в окне — сдвигаем lo за него
    if (seen.has(ch) && seen.get(ch)! >= lo) {
      lo = seen.get(ch)! + 1;
    }
    seen.set(ch, hi);
    max = Math.max(max, hi - lo + 1);
  }
  return max;
}
// "abcabcbb" → 3 ("abc"), "pwwkew" → 3 ("wke")`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Шаблон с явным счётчиком условия:</strong></p>
        <CodeHighlight lang="ts" filename="longestWithKDistinct.ts" code={`// Самая длинная подстрока с не более чем k различных символов
function lengthOfLongestSubstringKDistinct(s: string, k: number): number {
  const freq = new Map<string, number>();
  let lo = 0, max = 0;

  for (let hi = 0; hi < s.length; hi++) {
    // Добавляем правый символ
    freq.set(s[hi], (freq.get(s[hi]) ?? 0) + 1);

    // Сужаем пока нарушено условие
    while (freq.size > k) {
      const ch = s[lo++];
      freq.set(ch, freq.get(ch)! - 1);
      if (freq.get(ch) === 0) freq.delete(ch);
    }
    max = Math.max(max, hi - lo + 1);
  }
  return max;
}`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Минимальное покрывающее окно:</strong></p>
        <CodeHighlight lang="ts" filename="minWindow.ts" code={`function minWindow(s: string, t: string): string {
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);

  let have = 0, required = need.size;
  const window = new Map<string, number>();
  let lo = 0, minLen = Infinity, minLo = 0;

  for (let hi = 0; hi < s.length; hi++) {
    const c = s[hi];
    window.set(c, (window.get(c) ?? 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;

    while (have === required) {
      if (hi - lo + 1 < minLen) { minLen = hi - lo + 1; minLo = lo; }
      const lc = s[lo++];
      window.set(lc, window.get(lc)! - 1);
      if (need.has(lc) && window.get(lc)! < need.get(lc)!) have--;
    }
  }
  return minLen === Infinity ? '' : s.slice(minLo, minLo + minLen);
}`} />
      </section>

      {/* ── 4. Анаграмма в строке ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Анаграмма в строке</SectionTitle>
        <p className={s.body}>
          Проверить, содержит ли строка <code>s</code> анаграмму строки <code>p</code> —
          частый вопрос на интервью. Фиксированное окно длиной <code>p.length</code>,
          сравниваем частоты символов.
        </p>
        <CodeHighlight lang="ts" filename="findAnagrams.ts" code={`// Найти все стартовые индексы анаграмм p в s
function findAnagrams(s: string, p: string): number[] {
  if (s.length < p.length) return [];
  const result: number[] = [];
  const pCount = new Array(26).fill(0);
  const wCount = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);

  for (let i = 0; i < p.length; i++) {
    pCount[p.charCodeAt(i) - a]++;
    wCount[s.charCodeAt(i) - a]++;
  }

  if (pCount.join() === wCount.join()) result.push(0);

  for (let i = p.length; i < s.length; i++) {
    wCount[s.charCodeAt(i) - a]++;             // добавляем правый
    wCount[s.charCodeAt(i - p.length) - a]--;  // убираем левый
    if (pCount.join() === wCount.join()) result.push(i - p.length + 1);
  }
  return result;
}
// "cbaebabacd", p="abc" → [0, 6]`} />
      </section>

      {/* ── 5. Max consecutive ones с K заменами ───────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Максимальная серия с K заменами</SectionTitle>
        <p className={s.body}>
          «Самая длинная серия единиц, если можно заменить не более K нулей» —
          переменное окно с инвариантом: нулей в окне ≤ K.
        </p>
        <CodeHighlight lang="ts" filename="maxOnes.ts" code={`function longestOnes(nums: number[], k: number): number {
  let lo = 0, zeros = 0, max = 0;
  for (let hi = 0; hi < nums.length; hi++) {
    if (nums[hi] === 0) zeros++;
    // нарушили инвариант — сужаем слева
    while (zeros > k) {
      if (nums[lo] === 0) zeros--;
      lo++;
    }
    max = Math.max(max, hi - lo + 1);
  }
  return max;
}
// [1,1,0,0,1,1,1,0,1], k=2 → 7 (заменяем оба нуля в середине)`} />
      </section>

      {/* ── 6. Таблица задач ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Популярные задачи по типу окна</SectionTitle>
        <div className={s.problemsTable}>
          <div className={s.problemsHeader}>
            <span>Задача</span><span>Тип окна</span><span>Инвариант</span>
          </div>
          {[
            { task: 'Max sum k elements',             type: 'Фиксированное', inv: 'Размер окна = k' },
            { task: 'Longest substring no repeat',    type: 'Переменное',    inv: 'Все символы уникальны' },
            { task: 'Min window substring',           type: 'Переменное',    inv: 'Покрывает все символы t' },
            { task: 'Permutation in string',          type: 'Фиксированное', inv: 'Частоты = частоты p' },
            { task: 'Longest ones with K flips',      type: 'Переменное',    inv: 'Нулей в окне ≤ k' },
            { task: 'Fruit into baskets',             type: 'Переменное',    inv: 'Уникальных ≤ 2' },
            { task: 'Subarray sum equals k',          type: 'Prefix sum',    inv: 'Отриц. числа → не окно' },
          ].map(row => (
            <div key={row.task} className={s.problemsRow}>
              <span className={s.problemTask}>{row.task}</span>
              <span className={s.problemType} style={{ color: row.type === 'Фиксированное' ? '#4db8ff' : row.type === 'Переменное' ? '#f0db4f' : '#7a9aaa' }}>{row.type}</span>
              <span className={s.problemInv}>{row.inv}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Когда применять ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Сигналы в задаче</SectionTitle>
        <div className={s.signalList}>
          {[
            'Подмассив / подстрока',
            'Наибольший / наименьший / самый длинный',
            'k соседних элементов',
            'Без повторов / с ограничением уникальных',
            'Все элементы положительные (монотонность суммы)',
          ].map(sig => (
            <div key={sig} className={s.signal}>
              <span className={s.signalDot}>◆</span>
              <span>{sig}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
