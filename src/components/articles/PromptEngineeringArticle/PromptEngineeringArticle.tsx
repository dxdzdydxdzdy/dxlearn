import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { PromptLab } from './PromptLab';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './PromptEngineeringArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function PromptEngineeringArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Не магия — инженерия ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Промпт — это спецификация, не заклинание</SectionTitle>
        <p className={s.lead}>
          Prompt engineering — не про магические слова. Это про точность.
          LLM — вероятностная машина: промпт смещает распределение вероятностей
          токенов в нужную сторону. Чем точнее ты говоришь что хочешь, тем меньше
          модели приходится угадывать.
        </p>
        <div className={s.compareBlock}>
          <div className={s.compareRow}>
            <div className={s.compareBad}>
              <div className={s.compareLabel} style={{ color: '#ff5f6a' }}>❌ Плохо</div>
              <div className={s.comparePrompt}>&ldquo;Помоги мне с кодом.&rdquo;</div>
              <div className={s.compareResult}>Чем помочь? Покажи код. (бесполезный ответ)</div>
            </div>
            <div className={s.compareGood}>
              <div className={s.compareLabel} style={{ color: '#00e5a0' }}>✓ Хорошо</div>
              <div className={s.comparePrompt}>&ldquo;Ты senior TypeScript разработчик. Проведи code review функции ниже. Укажи: 1) баги 2) нарушения принципов SOLID 3) проблемы производительности. Для каждого: проблема → почему плохо → исправленный код.&rdquo;</div>
              <div className={s.compareResult}>Структурированный review с конкретными замечаниями.</div>
            </div>
          </div>
        </div>
        <p className={s.body}>
          Разница в качестве ответа — огромная. Не потому что хороший промпт длиннее,
          а потому что он <strong>убирает неопределённость</strong>: кто отвечает,
          что именно сделать, в каком формате вернуть результат.
        </p>
      </section>

      {/* ── 2. Анатомия хорошего промпта ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Анатомия промпта: 5 строительных блоков</SectionTitle>
        <p className={s.lead}>
          Хороший промпт отвечает на 5 вопросов. Не каждый раз нужны все пять —
          но чем больше ответов, тем предсказуемее результат.
        </p>
        <div className={s.blocksGrid}>
          {[
            {
              num: '1',
              name: 'Роль',
              question: 'Кто ты?',
              example: '"Ты senior backend-разработчик с опытом в Node.js и PostgreSQL."',
              why: 'Активирует нужный кластер знаний. Конкретная роль > "полезный ассистент".',
              color: '#4db8ff',
            },
            {
              num: '2',
              name: 'Задача',
              question: 'Что сделать?',
              example: '"Проведи code review функции и найди потенциальные баги."',
              why: 'Один глагол действия. Несколько задач в одном промпте = снижение качества каждой.',
              color: '#f0c040',
            },
            {
              num: '3',
              name: 'Контекст',
              question: 'На каких данных?',
              example: '"Вот функция: [код]"',
              why: 'Чем меньше модели нужно домысливать контекст — тем точнее ответ.',
              color: '#ff9070',
            },
            {
              num: '4',
              name: 'Ограничения',
              question: 'Что важно учесть?',
              example: '"Проект на Node.js 18, используем ESM, без сторонних библиотек."',
              why: 'Без ограничений модель даст общий ответ. С ними — точный и применимый.',
              color: '#c084fc',
            },
            {
              num: '5',
              name: 'Формат',
              question: 'Как вернуть результат?',
              example: '"Для каждой проблемы: название → описание → исправленный код."',
              why: 'Без формата ответ непредсказуем. С форматом — легко парсить и читать.',
              color: '#00e5a0',
            },
          ].map(b => (
            <div key={b.num} className={s.block} style={{ borderLeft: `3px solid ${b.color}` }}>
              <div className={s.blockNum} style={{ color: b.color }}>{b.num}</div>
              <div className={s.blockBody}>
                <div className={s.blockName} style={{ color: b.color }}>{b.name} <span className={s.blockQ}>— {b.question}</span></div>
                <div className={s.blockEx}>{b.example}</div>
                <div className={s.blockWhy}>{b.why}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Few-shot ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Few-shot: примеры говорят лучше слов</SectionTitle>
        <p className={s.lead}>
          «Классифицируй отзывы как позитивные или негативные» — звучит понятно.
          Но что считать нейтральным? Как обрабатывать сарказм?
          Три примера ответят на это лучше любого описания.
        </p>
        <CodeHighlight lang="ts" code={`// Zero-shot — только инструкция:
"Классифицируй отзыв: 'Ну такое, ожидал лучшего'"

// Ответ: NEGATIVE  ← спорно

// ─────────────────────────────────────────
// Few-shot — инструкция + примеры:
"Классифицируй отзыв. Примеры:
'Отличный товар!'                        → POSITIVE
'Нормально, соответствует описанию'      → NEUTRAL
'Сломалось на второй день, ужас'         → NEGATIVE
'Ну такое, ожидал лучшего'              → ???"

// Ответ: NEUTRAL (0.71)  ← точнее, модель видит паттерн

// ─────────────────────────────────────────
// Правила хороших примеров:
// ✓ Покрывают все классы равномерно
// ✓ Включают edge cases из продакшена
// ✓ Показывают формат ответа который нужен
// ✗ Не противоречат друг другу`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>СКОЛЬКО ПРИМЕРОВ?</div>
          <p className={s.infoText}>
            3–5 обычно достаточно. 10+ почти не даёт прироста качества, но увеличивает токены и стоимость.
            Качество примеров важнее их количества.
            Если примеры противоречат друг другу — результат хуже чем zero-shot.
          </p>
        </div>
      </section>

      {/* ── 4. Chain-of-Thought ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Chain-of-Thought: заставь модель думать вслух</SectionTitle>
        <p className={s.lead}>
          LLM генерирует токен за токеном. Если следующий токен — сразу ответ,
          модель «угадывает». Если до ответа идут шаги рассуждения — каждый токен
          обусловлен правильными промежуточными выводами.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>Без CoT</div>
            <div className={s.codeBlockSm}><code>{`Вопрос: У Маши 5 яблок.
Она отдала половину Ване,
а потом купила ещё 3.
Сколько у неё теперь?

Ответ: 5  ← НЕВЕРНО`}</code></div>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>С CoT</div>
            <div className={s.codeBlockSm}><code>{`...Давай думать пошагово:

1. Начало: 5 яблок
2. Отдала половину: 5 / 2 = 2.5 → 2
3. Купила ещё 3: 2 + 3 = 5

Ответ: 5  ← верно, но по другой причине!

// (пример с целыми числами: было 6)
// 6 / 2 = 3, 3 + 3 = 6 → 6`}</code></div>
          </div>
        </div>
        <CodeHighlight lang="ts" code={`// Zero-shot CoT — магическая фраза работает:
"Реши задачу. Думай пошагово перед ответом."

// Few-shot CoT — ещё лучше, показываем формат рассуждения:
"Задача: [пример 1]
Рассуждение: Шаг 1... Шаг 2... Итог: X

Задача: [пример 2]
Рассуждение: Шаг 1... Шаг 2... Итог: Y

Задача: [реальная задача]
Рассуждение:"  ← модель продолжает паттерн

// Для Claude — явная инструкция:
"Перед ответом напиши <thinking>рассуждение</thinking>,
затем <answer>итоговый ответ</answer>"`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>КОГДА CoT РЕАЛЬНО ПОМОГАЕТ</div>
          <p className={s.calloutText}>
            Многошаговые задачи: математика, логика, code review, анализ документов.
            Для простых задач («переведи слово», «скажи привет») — избыточно.
            CoT увеличивает длину ответа → больше токенов → дороже. Используй осознанно.
          </p>
        </div>
      </section>

      {/* ── 5. XML структура ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>XML-разметка: чёткие границы секций</SectionTitle>
        <p className={s.lead}>
          Когда промпт длинный — модель может «перемешать» секции.
          XML-теги создают явные семантические границы,
          которые модель надёжно распознаёт.
        </p>
        <CodeHighlight lang="ts" code={`<!-- Anthropic рекомендует XML для Claude -->

<system>
  <role>Ты технический писатель, специализирующийся на документации API.</role>
  <rules>
    - Пиши только на русском языке
    - Используй активный залог
    - Каждый метод: описание → параметры → пример
  </rules>
</system>

<context>
  {{paste_existing_docs}}
</context>

<task>
  Задокументируй метод createUser() по образцу существующей документации.
</task>

<input>
  {{paste_function_signature_and_code}}
</input>

<output_format>
  ## createUser(params)
  [описание]
  ### Parameters
  [таблица параметров]
  ### Example
  [код примера]
</output_format>

<!-- Результат: документация точно по шаблону, без отклонений -->`} />
        <p className={s.body}>
          Без XML при длинном промпте модель может «забыть» что в разделе rules
          и начать нарушать ограничения. С тегами — каждая секция чётко отделена.
          Особенно важно при подстановке user-контента: тег
          {' '}<code>&lt;context&gt;</code> изолирует вставляемые данные от инструкций.
        </p>
      </section>

      {/* ── 6. PromptLab ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Интерактив: собери промпт из техник</SectionTitle>
        <p className={s.body}>
          Включай техники по одной и смотри как собирается промпт и меняется качество ответа.
          Начни без всего — потом добавляй: роль, примеры, цепочку мыслей, формат.
        </p>
        <PromptLab />
      </section>

      {/* ── 7. JSON из LLM ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>JSON из LLM: надёжные паттерны</SectionTitle>
        <p className={s.lead}>
          Если нужен машиночитаемый результат — недостаточно написать «верни JSON».
          Вот паттерны от наименее к наиболее надёжному.
        </p>
        <div className={s.jsonLadder}>
          {[
            {
              level: '1',
              label: 'Просто попросить',
              reliability: 40,
              color: '#ff5f6a',
              code: `"Верни результат в формате JSON."
// Проблема: модель может добавить текст вокруг,
// нарушить схему, вернуть комментарии в JSON`,
            },
            {
              level: '2',
              label: 'Пример схемы в промпте',
              reliability: 70,
              color: '#f0c040',
              code: `"Верни строго в JSON без лишнего текста:
{
  \\"sentiment\\": \\"POSITIVE\\" | \\"NEUTRAL\\" | \\"NEGATIVE\\",
  \\"confidence\\": number
}"
// Лучше, но всё ещё не гарантировано`,
            },
            {
              level: '3',
              label: 'JSON mode + temperature=0',
              reliability: 85,
              color: '#ff9070',
              code: `openai.chat.completions.create({
  response_format: { type: 'json_object' },
  temperature: 0,
  // Гарантирует валидный JSON, но не схему
})`,
            },
            {
              level: '4',
              label: 'Structured Outputs + Zod',
              reliability: 99,
              color: '#00e5a0',
              code: `import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

const Schema = z.object({
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  confidence: z.number().min(0).max(1),
});

const res = await openai.beta.chat.completions.parse({
  model: 'gpt-4o-2024-08-06',
  response_format: zodResponseFormat(Schema, 'result'),
  // Гарантирует ТОЧНУЮ схему — TypeScript-типы из коробки`,
            },
          ].map(item => (
            <div key={item.level} className={s.ladderItem}>
              <div className={s.ladderLeft}>
                <div className={s.ladderNum} style={{ color: item.color }}>{item.level}</div>
                <div className={s.ladderBar}>
                  <div className={s.ladderBarFill} style={{ height: `${item.reliability}%`, background: item.color }} />
                </div>
                <div className={s.ladderPct} style={{ color: item.color }}>{item.reliability}%</div>
              </div>
              <div className={s.ladderRight}>
                <div className={s.ladderLabel} style={{ color: item.color }}>{item.label}</div>
                <div className={s.codeBlock}>
                  <code>{item.code}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Типичные ошибки ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>10 ошибок которые делают все</SectionTitle>
        <div className={s.mistakesList}>
          {[
            {
              n: '01',
              bad:  'Не указан формат вывода',
              good: 'Добавь явный пример JSON или шаблон ответа',
              color: '#ff5f6a',
            },
            {
              n: '02',
              bad:  '"Не делай X" вместо "делай Y"',
              good: 'Переформулируй запреты в позитивные требования',
              color: '#ff9070',
            },
            {
              n: '03',
              bad:  'Несколько задач в одном промпте',
              good: 'Одна задача = один промпт. Используй prompt chaining',
              color: '#f0c040',
            },
            {
              n: '04',
              bad:  'Слишком расплывчатая роль ("полезный ассистент")',
              good: 'Конкретная роль с опытом и специализацией',
              color: '#f0c040',
            },
            {
              n: '05',
              bad:  'Контекст не передаётся — модель домысливает',
              good: 'Вставляй релевантные данные явно в промпт',
              color: '#4db8ff',
            },
            {
              n: '06',
              bad:  'User input интерполируется в system prompt',
              good: 'User input строго в role:"user". XML-теги для изоляции',
              color: '#4db8ff',
            },
            {
              n: '07',
              bad:  'Промпт меняется вручную без тестирования',
              good: 'Eval-набор из 50+ примеров. Проверяй при каждом изменении',
              color: '#00e5a0',
            },
            {
              n: '08',
              bad:  'Нет версионирования промптов',
              good: 'Промпты = константы в коде или prompt management system',
              color: '#00e5a0',
            },
            {
              n: '09',
              bad:  'Примеры в few-shot несбалансированы по классам',
              good: 'Равное число примеров каждого класса. Включай edge cases',
              color: '#c084fc',
            },
            {
              n: '10',
              bad:  'Temperature=1 для структурированного вывода',
              good: 'temperature=0 для JSON/code. Temperature > 0 только для текста',
              color: '#c084fc',
            },
          ].map(m => (
            <div key={m.n} className={s.mistake}>
              <div className={s.mistakeNum} style={{ color: m.color }}>{m.n}</div>
              <div className={s.mistakeBody}>
                <div className={s.mistakeBad}>✗ {m.bad}</div>
                <div className={s.mistakeGood}>✓ {m.good}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Продвинутые техники ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Продвинутые техники</SectionTitle>
        <div className={s.advGrid}>
          {[
            {
              name: 'Self-Consistency',
              desc: 'Запусти один промпт 5–10 раз с temperature=0.7. Возьми ответ-мажоритарий. Дороже, но значительно точнее на сложных задачах.',
              when: 'Математика, логика, медицинская классификация',
              color: '#4db8ff',
            },
            {
              name: 'ReAct',
              desc: 'Thought → Action → Observation → Thought... Модель чередует рассуждение с вызовами инструментов. Основа AI-агентов.',
              when: 'Многошаговые задачи с внешними данными',
              color: '#f0c040',
            },
            {
              name: 'Prompt Chaining',
              desc: 'Разбей задачу на шаги. Выход шага N → вход шага N+1. Каждый промпт фокусированный и качественный.',
              when: 'Создание контента, анализ документов, код с тестами',
              color: '#ff9070',
            },
            {
              name: 'Least-to-Most',
              desc: 'Сначала попроси разбить задачу на подзадачи, потом реши их по порядку. Особенно хорошо для сложных coding задач.',
              when: 'Задачи с неявными промежуточными шагами',
              color: '#00e5a0',
            },
            {
              name: 'Self-Critique',
              desc: '"Напиши ответ. Теперь найди в нём ошибки и слабые места. Теперь напиши улучшенную версию." Один промпт, три шага.',
              when: 'Code review, написание текстов, анализ',
              color: '#c084fc',
            },
            {
              name: 'Role-Playing + Critic',
              desc: 'Роль A генерирует идею. Роль B (скептик/критик) находит проблемы. Роль A улучшает. Эмулирует peer review.',
              when: 'Архитектурные решения, бизнес-анализ',
              color: '#fb7185',
            },
          ].map(t => (
            <div key={t.name} className={s.advCard} style={{ borderTop: `3px solid ${t.color}` }}>
              <div className={s.advName} style={{ color: t.color }}>{t.name}</div>
              <div className={s.advDesc}>{t.desc}</div>
              <div className={s.advWhen}>
                <span className={s.advWhenLabel}>Когда:</span> {t.when}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
