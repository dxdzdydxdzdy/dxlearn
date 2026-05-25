import { EmbeddingExplorer } from './EmbeddingExplorer';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './EmbeddingsArticle.module.scss';

export function EmbeddingsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое эмбеддинг ──────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Числа со смыслом</h2>
        <p className={s.lead}>
          Нейросеть не понимает слова. Она понимает числа.
          Значит, любой текст нужно превратить в числа — так, чтобы похожие тексты
          давали похожие числа. Это и есть <strong>эмбеддинг</strong>.
        </p>
        <div className={s.codeBlock}>
          <code>{`# Каждое слово → вектор (список чисел):
"кошка"  → [0.21, -0.87,  1.45, 0.03, ..., -0.12]   # 1536 чисел
"кот"    → [0.19, -0.91,  1.43, 0.01, ..., -0.10]   # очень похоже!
"машина" → [-1.2,  0.34, -0.87, 0.67, ...,  0.45]   # совсем другое

# Это не просто ID — это точка в пространстве.
# Похожие слова → близкие точки → близкие векторы.`}</code>
        </div>
        <p className={s.body}>
          Представь карту мира: города одной страны рядом, континенты разделены океанами.
          Эмбеддинговое пространство — то же самое, только для смыслов.
          «Кошка» и «кот» — соседние города. «Кошка» и «двигатель» — разные континенты.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>КЛЮЧЕВОЙ ИНСАЙТ</div>
          <p className={s.calloutText}>
            Эмбеддинг — это не просто «числа вместо текста».
            Это <strong>смысл, закодированный в геометрию</strong>.
            Близость в пространстве = похожесть смысла. Это открывает
            математические операции над языком.
          </p>
        </div>
      </section>

      {/* ── 2. Как обучают ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Откуда берутся похожие векторы</h2>
        <p className={s.lead}>
          Никто не задаёт вручную: «кошке поставь 0.21 по первой оси».
          Векторы возникают из обучения.
        </p>
        <p className={s.body}>
          Идея word2vec (2013): обучи модель предсказывать соседние слова в предложении.
          «Кот лежал на диване» → попробуй предсказать «лежал» зная «кот» и «диване».
          «Собака лежала на диване» — то же самое, похожий контекст.
        </p>
        <div className={s.codeBlock}>
          <code>{`# Обучение по контексту:
"[кот] лежал на диване"   → кот видит этот контекст
"[собака] лежала на диване" → собака видит тот же контекст

# Модель обучается так, чтобы слова с похожим контекстом
# давали похожие предсказания → похожие веса → похожие векторы.

# Результат: "кошка" ≈ "кот" ≈ "собака" — все животные-питомцы
# Хотя никто не объяснял модели что это животные!`}</code>
        </div>
        <p className={s.body}>
          Современные модели (text-embedding-3, E5, BGE) учатся на парах «похожий/непохожий текст»:
          «эти два предложения похожи по смыслу — сделай их векторы близкими».
          «Эти два — разные — сделай дальними». После обучения на миллиардах пар пространство
          структурировано очень тонко.
        </p>
      </section>

      {/* ── 3. Косинусное сходство ──────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Как измерить близость: cosine similarity</h2>
        <p className={s.lead}>
          Два вектора есть. Как понять — похожи они или нет?
          Самый популярный способ — <strong>косинусное сходство</strong>.
        </p>
        <div className={s.mathBox}>
          <div className={s.mathFormula}>
            <span className={s.mathVar}>cos(θ)</span>
            <span className={s.mathOp}> = </span>
            <span className={s.mathFrac}>
              <span className={s.mathNum}>a · b</span>
              <span className={s.mathDen}>|a| × |b|</span>
            </span>
          </div>
          <div className={s.mathLegend}>
            <span><code>a · b</code> — скалярное произведение (сумма поэлементных произведений)</span>
            <span><code>|a|</code> — длина вектора (корень из суммы квадратов)</span>
          </div>
        </div>
        <p className={s.body}>
          Формула измеряет <strong>угол</strong> между векторами, а не расстояние.
          Одно направление = 1.0 (максимум). Перпендикулярно = 0. Противоположно = −1.
        </p>
        <div className={s.simTable}>
          <div className={s.simHeader}>
            <span>Пара слов</span>
            <span>Similarity</span>
            <span>Интерпретация</span>
          </div>
          {[
            { a: 'кошка',    b: 'кот',       sim: '0.95', interp: 'Почти одно и то же',     color: '#00e5a0' },
            { a: 'король',   b: 'королева',  sim: '0.89', interp: 'Очень похожи',            color: '#00e5a0' },
            { a: 'врач',     b: 'учитель',   sim: '0.71', interp: 'Одна категория (люди)',   color: '#f0c040' },
            { a: 'радость',  b: 'гнев',      sim: '0.82', interp: 'Оба эмоции',              color: '#f0c040' },
            { a: 'кошка',    b: 'компьютер', sim: '0.04', interp: 'Не связаны',              color: '#ff5f6a' },
          ].map(row => (
            <div key={row.a + row.b} className={s.simRow}>
              <span className={s.simPair}>{row.a} ↔ {row.b}</span>
              <span className={s.simScore} style={{ color: row.color }}>{row.sim}</span>
              <span className={s.simInterp}>{row.interp}</span>
            </div>
          ))}
        </div>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>НА ПРАКТИКЕ</div>
          <p className={s.infoText}>
            Эмбеддинги обычно нормализуют до единичной длины (|v| = 1).
            Тогда косинус = скалярное произведение — быстрее вычислять.
            Векторные базы данных (pgvector, Qdrant, Pinecone) именно это и делают при поиске.
          </p>
        </div>
      </section>

      {/* ── 4. Интерактив ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Попробуй: карта смыслов</h2>
        <p className={s.body}>
          Ниже — 20 слов в 2D-проекции их эмбеддингового пространства.
          Слова в кластерах потому что имеют похожие векторы.
          Кликни два слова — увидишь cosine similarity и мини-визуализацию их векторов.
        </p>
        <EmbeddingExplorer />
      </section>

      {/* ── 5. Векторная арифметика ─────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Магия: арифметика смыслов</h2>
        <p className={s.lead}>
          Если смыслы — это точки в пространстве, можно делать с ними математику.
          Самый знаменитый пример:
        </p>
        <div className={s.analogyDisplay}>
          <div className={s.analogyEq}>
            <span className={s.analogyTerm} style={{ color: '#f0c040' }}>король</span>
            <span className={s.analogyOp}>−</span>
            <span className={s.analogyTerm} style={{ color: '#4db8ff' }}>мужчина</span>
            <span className={s.analogyOp}>+</span>
            <span className={s.analogyTerm} style={{ color: '#4db8ff' }}>женщина</span>
            <span className={s.analogyOp}>≈</span>
            <span className={s.analogyTerm} style={{ color: '#00e5a0' }}>королева</span>
          </div>
          <div className={s.analogyNote}>
            Это не метафора — это буквально работает с реальными векторами
          </div>
        </div>
        <p className={s.body}>
          Что происходит: «король» − «мужчина» вычитает «мужское» из «королевского».
          Плюс «женщина» добавляет «женское». Результат — вектор, ближайший к которому в словаре «королева».
        </p>
        <div className={s.codeBlock}>
          <code>{`# Другие примеры — все работают:
"Москва" − "Россия" + "Франция"  ≈ "Париж"
"большой" − "большой" + "маленький" ≈ "маленький"
"бежать" − "бежал" + "ходить"    ≈ "ходил"

# Это значит что в пространстве эмбеддингов
# отношения между понятиями закодированы как направления.
# "Столица → страна" = единое направление для всех стран.`}</code>
        </div>
        <p className={s.body}>
          Это наглядно показывает: эмбеддинги не просто «числа» — они кодируют
          структуру языка и понятий. Пространство организовано осмысленно,
          хотя никто не задавал эти правила вручную.
        </p>
      </section>

      {/* ── 6. Sentence embeddings ──────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Эмбеддинг предложения, а не слова</h2>
        <p className={s.lead}>
          Word embeddings — вектор одного слова. Но чаще нужно сравнивать целые предложения
          или параграфы. Для этого есть <strong>sentence embeddings</strong>.
        </p>
        <p className={s.body}>
          Sentence embedding модель принимает произвольный текст (одно предложение, абзац,
          несколько параграфов) и выдаёт один вектор — «суть» всего текста.
        </p>
        <div className={s.codeBlock}>
          <code>{`// OpenAI: text-embedding-3-small
const res = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: [
    'Как лечить грипп?',
    'Способы борьбы с ОРВИ',
    'Рецепт шоколадного торта',
  ],
});

// res.data[0].embedding → вектор [1536 чисел] для запроса 0
// res.data[1].embedding → вектор для запроса 1
// res.data[2].embedding → вектор для запроса 2

// cosine("грипп", "ОРВИ")     ≈ 0.91  ← очень похожи
// cosine("грипп", "торт")     ≈ 0.12  ← не связаны

// Можно передавать batches — экономит запросы к API`}</code>
        </div>
        <div className={s.modelsGrid}>
          {[
            { name: 'text-embedding-3-small', dims: '1536', note: 'OpenAI, быстро, дёшево', color: '#4db8ff' },
            { name: 'text-embedding-3-large', dims: '3072', note: 'OpenAI, точнее, дороже', color: '#4db8ff' },
            { name: 'E5-large-v2',            dims: '1024', note: 'Open source, локально',  color: '#00e5a0' },
            { name: 'nomic-embed-text',        dims: '768',  note: 'Open source, быстрый',   color: '#00e5a0' },
          ].map(m => (
            <div key={m.name} className={s.modelCard}>
              <div className={s.modelName} style={{ color: m.color }}>{m.name}</div>
              <div className={s.modelDims}>{m.dims}D</div>
              <div className={s.modelNote}>{m.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Семантический поиск ──────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Семантический поиск: поиск по смыслу</h2>
        <p className={s.lead}>
          Классический поиск (LIKE, BM25) ищет точные слова.
          Семантический — ищет похожий <em>смысл</em>.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#ff5f6a' }}>Keyword поиск</div>
            <div className={s.codeBlockSm}>
              <code>{`Запрос: "лечить простуду"

✗ "терапия при ОРВИ"
✗ "как быстро выздороветь"
✓ "как лечить простуду дома"

Ищет точные слова.
Синонимы не находит.`}</code>
            </div>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#00e5a0' }}>Semantic поиск</div>
            <div className={s.codeBlockSm}>
              <code>{`Запрос: "лечить простуду"

✓ "терапия при ОРВИ"     sim=0.88
✓ "как быстро выздороветь" sim=0.82
✓ "как лечить простуду дома" sim=0.96

Понимает смысл.
Находит синонимы и перефразировки.`}</code>
            </div>
          </div>
        </div>
        <p className={s.body}>
          Как работает семантический поиск:
        </p>
        <div className={s.flowSteps}>
          {[
            { num: '1', title: 'Индексация', desc: 'Все документы → эмбеддинги → сохраняем в vector database' },
            { num: '2', title: 'Запрос',     desc: 'Пользователь пишет запрос → тот же эмбеддинг → вектор запроса' },
            { num: '3', title: 'Поиск',      desc: 'Находим топ-K векторов с наибольшим cosine similarity в базе' },
            { num: '4', title: 'Результат',  desc: 'Возвращаем оригинальный текст найденных документов' },
          ].map(step => (
            <div key={step.num} className={s.flowStep}>
              <div className={s.stepNum}>{step.num}</div>
              <div className={s.stepBody}>
                <div className={s.stepTitle}>{step.title}</div>
                <div className={s.stepDesc}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={s.warningCard}>
          <div className={s.warningLabel}>КОГДА KEYWORD ЛУЧШЕ</div>
          <p className={s.warningText}>
            Точные технические термины: «ошибка CORS 403», артикулы товаров «XB-2024-A»,
            имена собственные, коды и идентификаторы.
            Семантический поиск «размывает» точность: «XB-2024-A» может найти «XB-2023-B»
            потому что векторы похожи. Гибридный поиск (BM25 + semantic) = лучшее из обоих.
          </p>
        </div>
      </section>

      {/* ── 8. Куда ещё применяются ─────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Эмбеддинги везде</h2>
        <p className={s.lead}>
          Семантический поиск — лишь одно применение. Раз у нас есть вектор «смысла» текста —
          с ним можно делать многое.
        </p>
        <div className={s.usecaseGrid}>
          {[
            {
              title: 'RAG (Retrieval-Augmented Generation)',
              desc: 'Найти релевантные документы → вставить в промпт LLM → модель отвечает по ним. Основа любого AI-чатбота над базой знаний.',
              color: '#00e5a0',
            },
            {
              title: 'Кластеризация',
              desc: 'Сгруппировать 10K тикетов поддержки по теме без ручной разметки. Близкие векторы = одна тема.',
              color: '#4db8ff',
            },
            {
              title: 'Классификация',
              desc: 'Обучить простой классификатор поверх эмбеддингов: спам/не-спам, тональность, категория — быстрее чем fine-tuning LLM.',
              color: '#f0c040',
            },
            {
              title: 'Дедупликация',
              desc: 'Найти почти одинаковые тексты: статьи-копии, дублирующие товары в каталоге, похожие резюме.',
              color: '#ff9070',
            },
            {
              title: 'Рекомендации',
              desc: '"Похожие статьи", "вам может понравиться" — найти контент близкий к тому, что пользователь уже читал.',
              color: '#c084fc',
            },
            {
              title: 'Аномалии',
              desc: 'Вектор далёкий от всех остальных = аномальное поведение, мошенничество, нестандартный запрос.',
              color: '#fb7185',
            },
          ].map(uc => (
            <div key={uc.title} className={s.usecaseCard} style={{ borderLeft: `3px solid ${uc.color}` }}>
              <div className={s.usecaseTitle} style={{ color: uc.color }}>{uc.title}</div>
              <div className={s.usecaseDesc}>{uc.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Практика: что учесть ─────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Практика: что важно знать</h2>
        <div className={s.practiceList}>
          {[
            {
              title: 'Фиксируй версию модели',
              desc: 'Векторы из разных версий несовместимы. text-embedding-3-small и text-embedding-ada-002 — разные пространства. Обновляешь модель → пересчитываешь все векторы.',
              icon: '⚠',
              color: '#f0c040',
            },
            {
              title: 'Chunking важнее, чем кажется',
              desc: 'Один вектор на 10 страниц — слишком грубо. Режь на куски 256–512 токенов с перекрытием 50–100. Качество RAG зависит от chunking больше, чем от выбора модели.',
              icon: '✂',
              color: '#4db8ff',
            },
            {
              title: 'Batch запросы',
              desc: 'embeddings.create({ input: [str1, str2, ...str1000] }) — дешевле и быстрее 1000 отдельных запросов. Обрабатывай документы батчами при индексации.',
              icon: '⚡',
              color: '#00e5a0',
            },
            {
              title: 'Размерность vs скорость',
              desc: '3072D точнее 1536D, но занимает в 2× больше памяти и медленнее при поиске. Для большинства задач small достаточно. Тестируй на своих данных.',
              icon: '📐',
              color: '#ff9070',
            },
          ].map(p => (
            <div key={p.title} className={s.practiceItem}>
              <div className={s.practiceIcon} style={{ color: p.color }}>{p.icon}</div>
              <div className={s.practiceBody}>
                <div className={s.practiceTitle} style={{ color: p.color }}>{p.title}</div>
                <div className={s.practiceDesc}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
