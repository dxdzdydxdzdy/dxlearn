import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { TwoPointersDemo } from './TwoPointersDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './TwoPointersArticle.module.scss';

export function TwoPointersArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что это ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое два указателя</SectionTitle>
        <p className={s.lead}>
          Два указателя — это паттерн, при котором мы одновременно двигаем
          две «позиции» в массиве или строке. Вместо двух вложенных циклов
          (O(n²)) делаем один проход — <strong>O(n)</strong>.
        </p>
        <p className={s.body}>
          Паттерн работает в двух вариантах:
        </p>
        <div className={s.variants}>
          <div className={s.variant}>
            <div className={s.variantTitle}>← Навстречу →</div>
            <div className={s.variantDesc}>lo=0, hi=n-1, движутся к центру. Two Sum, палиндром, разворот строки.</div>
          </div>
          <div className={s.variant}>
            <div className={s.variantTitle}>→ Медленный / Быстрый →</div>
            <div className={s.variantDesc}>slow и fast, fast обгоняет. Удаление дублей, цикл в списке, середина.</div>
          </div>
        </div>
      </section>

      {/* ── 2. Демо ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Интерактив: Two Sum</SectionTitle>
        <p className={s.body}>
          Найти два числа с заданной суммой. Синий — lo, фиолетовый — hi.
          Если сумма мала — двигаем lo вперёд, велика — hi назад.
        </p>
        <TwoPointersDemo />
      </section>

      {/* ── 3. Код ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Задачи и шаблоны</SectionTitle>

        <p className={s.body}><strong>Two Sum на отсортированном массиве:</strong></p>
        <CodeHighlight lang="ts" filename="twoSum.ts" code={`function twoSum(nums: number[], target: number): [number, number] | null {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    sum < target ? lo++ : hi--;
  }
  return null;
}`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Удаление дублей in-place (slow/fast):</strong></p>
        <CodeHighlight lang="ts" filename="removeDuplicates.ts" code={`function removeDuplicates(nums: number[]): number {
  let write = 1; // позиция для следующего уникального
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) {
      nums[write++] = nums[read]; // перезаписываем дубль
    }
  }
  return write; // новая длина
}
// [1,1,2,3,3] → [1,2,3,...] и возвращает 3`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Цикл Флойда — есть ли цикл в связном списке:</strong></p>
        <CodeHighlight lang="ts" filename="hasCycle.ts" code={`interface ListNode { val: number; next: ListNode | null; }

function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;          // 1 шаг
    fast = fast.next.next;      // 2 шага
    if (slow === fast) return true; // встретились — цикл!
  }
  return false;
}
// O(n) время, O(1) память`} />

        <p className={s.body} style={{ marginTop: 16 }}><strong>Контейнер с водой (max area):</strong></p>
        <CodeHighlight lang="ts" filename="maxWater.ts" code={`function maxArea(heights: number[]): number {
  let lo = 0, hi = heights.length - 1, max = 0;
  while (lo < hi) {
    const h = Math.min(heights[lo], heights[hi]);
    max = Math.max(max, h * (hi - lo));
    // сдвигаем сторону с меньшей высотой
    heights[lo] < heights[hi] ? lo++ : hi--;
  }
  return max;
}`} />
      </section>

      {/* ── 4. 3Sum — расширение паттерна ─────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>3Sum: фиксируем первый, ищем пару</SectionTitle>
        <p className={s.body}>
          Классическая задача: найти все тройки с суммой 0.
          Перебор трёх циклов — O(n³). С двумя указателями — <strong>O(n²)</strong>.
          Ключевой приём: зафиксировать один элемент, искать пару в остатке.
        </p>
        <CodeHighlight lang="ts" filename="threeSum.ts" code={`function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b); // сортируем — иначе два указателя не работают
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // пропускаем дубли

    let lo = i + 1, hi = nums.length - 1;
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      if (sum === 0) {
        result.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++; // пропускаем дубли
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++; hi--;
      } else if (sum < 0) lo++;
      else hi--;
    }
  }
  return result;
}
// [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]`} />
      </section>

      {/* ── 5. Слияние двух отсортированных массивов ───────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Слияние отсортированных массивов</SectionTitle>
        <p className={s.body}>
          Два указателя начинают с начала каждого массива — это основа Merge Sort.
          Также встречается в задаче «объединить k отсортированных списков».
        </p>
        <CodeHighlight lang="ts" filename="mergeSorted.ts" code={`// Слить два отсортированных массива за O(n + m)
function mergeSorted(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    result.push(a[i] <= b[j] ? a[i++] : b[j++]);
  }
  // дописываем остаток
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

// Merge in-place (LeetCode 88): второй массив уже в хвосте первого
function mergeInPlace(nums1: number[], m: number, nums2: number[], n: number): void {
  let i = m - 1, j = n - 1, k = m + n - 1;
  // Идём с конца — не затираем данные
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else                                nums1[k--] = nums2[j--];
  }
}`} />
      </section>

      {/* ── 6. Когда применять ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда применять</SectionTitle>
        <div className={s.whenTable}>
          {[
            { signal: 'Отсортированный массив + сумма/произведение/разность двух элементов', pattern: 'lo/hi навстречу' },
            { signal: 'Палиндром, симметрия, разворот', pattern: 'lo/hi навстречу' },
            { signal: 'Удаление/перемещение элементов in-place', pattern: 'slow/fast' },
            { signal: 'Обнаружение цикла в списке', pattern: 'slow/fast (Флойд)' },
            { signal: 'Середина, n-й с конца в связном списке', pattern: 'slow/fast' },
          ].map(row => (
            <div key={row.signal} className={s.whenRow}>
              <span className={s.whenSignal}>{row.signal}</span>
              <span className={s.whenPattern}>→ {row.pattern}</span>
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
