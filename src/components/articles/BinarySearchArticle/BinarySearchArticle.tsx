import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BinarySearchDemo } from './BinarySearchDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './BinarySearchArticle.module.scss';

export function BinarySearchArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Идея ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Идея за 30 секунд</SectionTitle>
        <p className={s.lead}>
          Ты ищешь слово в бумажном словаре. Открываешь середину — слово левее.
          Открываешь середину левой половины — снова левее. Три открытия вместо
          листания тысяч страниц. Это и есть бинарный поиск.
        </p>
        <p className={s.body}>
          Обязательное условие — <strong>отсортированный массив</strong>.
          На каждом шаге мы смотрим на средний элемент и выбрасываем
          половину оставшихся. За <em>log₂(n)</em> шагов найдём любой элемент.
        </p>

        <div className={s.comparison}>
          <div className={s.compCard}>
            <div className={s.compLabel} style={{ color: '#ff7b72' }}>Линейный поиск</div>
            <div className={s.compComplexity}>O(n)</div>
            <ul className={s.compList}>
              <li>1 000 элементов → до 1 000 шагов</li>
              <li>1 000 000 → до 1 000 000 шагов</li>
              <li>Работает на несортированных</li>
            </ul>
          </div>
          <div className={s.compCard}>
            <div className={s.compLabel} style={{ color: '#00e5a0' }}>Бинарный поиск</div>
            <div className={s.compComplexity}>O(log n)</div>
            <ul className={s.compList}>
              <li>1 000 элементов → до 10 шагов</li>
              <li>1 000 000 → до 20 шагов</li>
              <li>Только отсортированные</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. Демо ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Интерактив: пошаговый поиск</SectionTitle>
        <p className={s.body}>
          Выбери целевое значение и нажимай «Следующий шаг».
          Синие ячейки — активная зона, серые — исключены, оранжевая — mid.
        </p>
        <BinarySearchDemo />
      </section>

      {/* ── 3. Код ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Шаблон и вариации</SectionTitle>
        <p className={s.body}>Базовая реализация — 10 строк:</p>
        <CodeHighlight lang="ts" filename="binarySearch.ts" code={`function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);

    if (arr[middle] === target) {
      return middle;
    }

    if (arr[middle] < target) {
      left = middle + 1;  // target правее — отбрасываем левую половину
    } else {
      right = middle - 1; // target левее  — отбрасываем правую половину
    }
  }

  return -1; // не найдено
}`} />

        <p className={s.body} style={{ marginTop: 16 }}>
          <strong>Lower bound</strong> — первая позиция, где элемент ≥ target:
        </p>
        <CodeHighlight lang="ts" filename="lowerBound.ts" code={`// Первый индекс с arr[i] >= target
function lowerBound(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length; // не length-1: right — позиция за концом массива

  while (left < right) {
    const middle = Math.floor((left + right) / 2);

    if (arr[middle] < target) {
      left = middle + 1;
    } else {
      right = middle; // не middle-1: middle ещё может быть ответом
    }
  }

  return left; // left === right — первая позиция >= target
}`} />

        <p className={s.body} style={{ marginTop: 16 }}>
          <strong>Бинарный поиск на ответе</strong> — когда ищем не элемент, а граничное условие:
        </p>
        <CodeHighlight lang="ts" filename="binaryOnAnswer.ts" code={`// Минимальная скорость, при которой успеваем сделать задачи
function minSpeed(tasks: number[], hours: number): number {
  function canFinish(speed: number): boolean {
    const totalHours = tasks.reduce((sum, t) => sum + Math.ceil(t / speed), 0);
    return totalHours <= hours;
  }

  let left = 1;
  let right = Math.max(...tasks);

  while (left < right) {
    const middle = Math.floor((left + right) / 2);

    if (canFinish(middle)) {
      right = middle;     // скорость подходит — пробуем меньше
    } else {
      left = middle + 1;  // слишком медленно — увеличиваем
    }
  }

  return left;
}`} />
      </section>

      {/* ── 4. Ротированный массив ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Ротированный массив</SectionTitle>
        <p className={s.body}>
          Классическая задача на интервью. Массив <code>[0,1,2,4,5,6,7]</code> превращается в
          <code>[4,5,6,7,0,1,2]</code>. Одна из половин всегда отсортирована — используем это:
        </p>
        <CodeHighlight lang="ts" filename="searchRotated.ts" code={`function searchRotated(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);

    if (arr[middle] === target) {
      return middle;
    }

    // Одна из половин всегда отсортирована — определяем какая
    const leftHalfSorted = arr[left] <= arr[middle];

    if (leftHalfSorted) {
      // target попадает в левую отсортированную половину?
      if (arr[left] <= target && target < arr[middle]) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    } else {
      // Правая половина отсортирована
      if (arr[middle] < target && target <= arr[right]) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
  }

  return -1;
}`} />
      </section>

      {/* ── 5. Upper bound и счёт вхождений ───────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда элемент встречается несколько раз</SectionTitle>
        <p className={s.body}>
          Что если в отсортированном массиве одно и то же число встречается несколько раз?
          Например, <code>[1, 2, 2, 2, 3, 4]</code>. Базовый бинарный поиск найдёт <em>какую-то</em> двойку,
          но не скажет ни где первая, ни где последняя, ни сколько их всего.
        </p>
        <p className={s.body}>
          Для этого используют две функции — обе работают как бинарный поиск, но ищут немного другое:
        </p>
        <p className={s.body}>
          <strong>lowerBound</strong> — находит первое место где стоит число (или куда бы оно встало).
          Например, для двойки в массиве выше вернёт индекс 1.
        </p>
        <p className={s.body}>
          <strong>upperBound</strong> — находит первое место <em>после</em> всех вхождений числа.
          Для двойки вернёт индекс 4 — именно там заканчивается диапазон двоек.
        </p>
        <p className={s.body}>
          Разница между ними и есть количество вхождений: <code>4 - 1 = 3</code>.
        </p>
        <CodeHighlight lang="ts" filename="bounds.ts" code={`// Upper bound — первый индекс с arr[i] > target
function upperBound(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length;

  while (left < right) {
    const middle = Math.floor((left + right) / 2);

    if (arr[middle] <= target) {
      left = middle + 1; // отличие от lowerBound: <= вместо <
    } else {
      right = middle;
    }
  }

  return left;
}

// Количество вхождений target в отсортированном массиве
function countOccurrences(arr: number[], target: number): number {
  const firstIndex = lowerBound(arr, target); // первый индекс >= target
  const lastIndex  = upperBound(arr, target); // первый индекс > target
  return lastIndex - firstIndex;
}

// Пример: [1, 2, 2, 2, 3, 4], target = 2
// lowerBound → 1, upperBound → 4, count = 4 - 1 = 3 ✓`} />
      </section>

      {/* ── 6. Бинарный поиск на ответе ────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Бинарный поиск без массива: ищем ответ, а не элемент</SectionTitle>
        <p className={s.body}>
          Бинарный поиск можно применять не только к массивам.
          Главное условие — не «массив отсортирован», а более общее:
          существует какое-то число, ниже которого ответ «нет», выше — «да».
          Тогда можно бинарить само число, а не позицию в массиве.
        </p>
        <p className={s.body}>
          Конкретный пример. Есть задачи с объёмом <code>[3, 6, 7, 11]</code> и <code>8</code> часов на всё.
          Нужно найти минимальную скорость работы, при которой успеваем.
          При скорости 1 — не успеваем. При скорости 100 — успеваем.
          Где-то между ними есть минимально достаточная скорость —
          бинарным поиском находим эту границу:
        </p>
        <CodeHighlight lang="ts" code={`const tasks = [3, 6, 7, 11];
const hoursLimit = 8;

// Вопрос: можно ли справиться со всеми задачами за hoursLimit часов
// если работать со скоростью speed задач в час?
function canFinish(speed: number): boolean {
  const totalHours = tasks.reduce((sum, task) => sum + Math.ceil(task / speed), 0);
  return totalHours <= hoursLimit;
}

// speed=1:  ceil(3/1)+ceil(6/1)+ceil(7/1)+ceil(11/1) = 27 — не успеваем
// speed=4:  ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8  — успеваем
// speed=3:  1+2+3+4 = 10 — не успеваем
// Ответ: 4

let left = 1;
let right = Math.max(...tasks); // быстрее максимума смысла нет

while (left < right) {
  const middle = Math.floor((left + right) / 2);

  if (canFinish(middle)) {
    right = middle;     // эта скорость подходит — пробуем меньше
  } else {
    left = middle + 1;  // слишком медленно — увеличиваем
  }
}

console.log(left); // 4`} />
        <p className={s.body}>
          Такой приём называют <strong>«бинарный поиск на ответе»</strong>.
          Признак задачи: формулировка «найди минимальный X при котором выполняется условие»
          или «найди максимальный X при котором ещё возможно».
          Если перебирать X по одному — слишком медленно. Бинарный поиск делает это за <code>O(log X)</code>.
        </p>
      </section>

      {/* ── 7. Типичные ошибки ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Типичные ошибки</SectionTitle>
        <div className={s.pitfalls}>
          {[
            {
              bad:  'const mid = (lo + hi) / 2',
              good: 'const mid = Math.floor((lo + hi) / 2)',
              why:  'Деление в JS не усекает дробную часть. При нечётной сумме lo + hi получишь 1.5 — mid будет дробным, и arr[1.5] вернёт undefined.',
            },
            {
              bad:  'while (left < right) { ... right = middle - 1 }',
              good: 'while (left <= right) { ... right = middle - 1 }',
              why:  'left < right пропускает одноэлементный случай когда left === right. Элемент есть, но цикл заканчивается не проверив его.',
            },
            {
              bad:  'Бинарный поиск на несортированном массиве',
              good: 'arr.every((v, i) => i === 0 || v >= arr[i - 1])',
              why:  'Без сортировки алгоритм молча выдаёт неверный результат. Нет исключения, нет предупреждения — просто wrong answer.',
            },
            {
              bad:  'return left после lowerBound (забыли проверить совпадение)',
              good: 'return left < arr.length && arr[left] === target ? left : -1',
              why:  'lowerBound возвращает позицию вставки — не гарантию что элемент там есть. Нужна дополнительная проверка.',
            },
          ].map((p, i) => (
            <div key={i} className={s.pitfall}>
              <div className={s.pitfallBad}><span className={s.pitfallSign}>✗</span>{p.bad}</div>
              <div className={s.pitfallGood}><span className={s.pitfallSign}>✓</span>{p.good}</div>
              <div className={s.pitfallWhy}>{p.why}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
