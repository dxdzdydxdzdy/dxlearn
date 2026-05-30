import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { LlmGenerator } from './LlmGenerator';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './LlmArchitectureArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function LlmArchitectureArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Главная идея ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>LLM не думает — он угадывает следующий токен</SectionTitle>
        <p className={s.lead}>
          ChatGPT, Claude, Gemini — как бы умно они ни звучали, внутри происходит одно и то же:
          модель смотрит на весь текст до этого момента и предсказывает, какой кусочек текста
          должен идти следующим.
        </p>
        <CodeHighlight lang="ts" code={`Промпт: "Столица Франции —"

Модель вычисляет вероятности следующего токена:
  "Пар"     → 94.2%  ← побеждает
  "Лион"    →  3.1%
  "Берлин"  →  0.8%
  ...       →  1.9%

Выбирает "Пар", добавляет к тексту.
Смотрит: "Столица Франции — Пар"
Снова вычисляет... → "иж" → 99.7%
Добавляет "иж". Итог: "Париж".

Вот и весь "интеллект" — один токен за раз.`} />
        <p className={s.body}>
          Каждый шаг — отдельный прогон через всю модель. Никакого «обдумывания» —
          только статистика паттернов из обучающих данных. Сложность ответов возникает не потому что
          модель «думает», а потому что обучена на огромном количестве текста, где такие паттерны встречались.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>КЛЮЧЕВОЙ ИНСАЙТ</div>
          <p className={s.calloutText}>
            LLM — это предсказатель продолжения текста. Это объясняет и его силу
            (видел миллиарды примеров) и его слабости (может уверенно продолжить неверную цепочку —
            галлюцинация).
          </p>
        </div>
      </section>

      {/* ── 2. Токены ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Токен — единица текста для модели</SectionTitle>
        <p className={s.lead}>
          Модель не работает с буквами и не работает со словами. Она работает с <strong>токенами</strong> —
          кусочками текста, которые определяет специальный алгоритм — <strong>токенизатор</strong>.
        </p>
        <p className={s.body}>
          Алгоритм называется BPE (Byte Pair Encoding). Он смотрит на обучающий корпус и находит
          самые частые последовательности символов. Частые последовательности становятся одним токеном.
          Редкие — разбиваются на несколько. Словарь GPT-4 содержит около 100 000 токенов.
        </p>
        <div className={s.tokenExamples}>
          {[
            { text: '"transformer"', tokens: ['"transform"', '"er"'], note: '2 токена — слово редкое в обучающих данных' },
            { text: '"hello"', tokens: ['"hello"'], note: '1 токен — частое слово' },
            { text: '"нейросеть"', tokens: ['"ней"', '"ро"', '"сеть"'], note: '3 токена — кириллица дороже' },
            { text: '"2024"', tokens: ['"20"', '"24"'], note: '2 токена — числа разбиваются' },
          ].map(ex => (
            <div key={ex.text} className={s.tokenExample}>
              <div className={s.tokenExText}>{ex.text}</div>
              <div className={s.tokenExArrow}>→</div>
              <div className={s.tokenExTokens}>
                {ex.tokens.map(t => <span key={t} className={s.tokenBadge}>{t}</span>)}
              </div>
              <div className={s.tokenExNote}>{ex.note}</div>
            </div>
          ))}
        </div>
        <div className={s.warningCard}>
          <div className={s.warningLabel}>ПОЧЕМУ ЭТО ВАЖНО</div>
          <p className={s.warningText}>
            Токены — это деньги. API берёт оплату за токены, а не за слова.
            Русский и другие нелатинские языки = ~1.5–2× токенов на тот же смысл = в 1.5–2× дороже.
            Длинные числа и нестандартный текст — тоже дороже.
            Плюс: у модели есть лимит токенов (context window) — и редкий язык занимает его быстрее.
          </p>
        </div>
      </section>

      {/* ── 3. Interactive ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: токенизация и temperature</SectionTitle>
        <p className={s.body}>
          Посмотри как реально разбивается текст на токены — и как параметр temperature
          меняет выбор следующего слова.
        </p>
        <LlmGenerator />
      </section>

      {/* ── 4. Embeddings ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Токены → векторы: пространство смыслов</SectionTitle>
        <p className={s.lead}>
          Модель не работает с токенами напрямую. Каждый токен сначала превращается
          в <strong>вектор чисел</strong> — длинный список вроде [0.21, -0.87, 1.45, ...].
          Это называется <strong>embedding</strong>.
        </p>
        <CodeHighlight lang="ts" code={`# Каждый токен → вектор из 4096 чисел (в GPT-4)
"кот"    → [0.21, -0.87,  1.45, ..., -0.12]
"кошка"  → [0.19, -0.91,  1.43, ..., -0.10]  ← близко к "кот"
"автомобиль" → [-1.2, 0.34, -0.87, ..., 0.67]  ← далеко

# Математически:
# расстояние("кот", "кошка") << расстояние("кот", "автомобиль")

# Знаменитый пример:
# вектор("король") - вектор("мужчина") + вектор("женщина")
# ≈ вектор("королева")  ← это работает буквально!`} />
        <p className={s.body}>
          Близкие по смыслу слова — близкие векторы в этом пространстве. Модель обучает эти векторы
          вместе со всеми остальными весами. После обучения в этом пространстве закодирована
          семантика языка. В следующей статье — детальный разбор эмбеддингов и как их использовать
          для семантического поиска.
        </p>
      </section>

      {/* ── 5. Трансформер ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Трансформер: архитектура за 5 минут</SectionTitle>
        <p className={s.lead}>
          «Трансформер» — это архитектура нейросети, предложенная в 2017 году в статье
          «Attention is All You Need». Она заменила RNN и стала основой всех современных LLM.
        </p>
        <p className={s.body}>
          Есть три вида трансформеров:
        </p>
        <div className={s.archGrid}>
          <div className={s.archCard} style={{ borderColor: 'rgba(77,184,255,0.3)' }}>
            <div className={s.archName} style={{ color: '#4db8ff' }}>Encoder-only</div>
            <div className={s.archExample}>BERT, RoBERTa</div>
            <div className={s.archDesc}>
              Видит весь текст сразу с обеих сторон.
              Хорош для понимания: классификация, NER, Q&amp;A без генерации.
            </div>
          </div>
          <div className={s.archCard} style={{ borderColor: 'rgba(0,229,160,0.3)' }}>
            <div className={s.archName} style={{ color: '#00e5a0' }}>Decoder-only</div>
            <div className={s.archExample}>GPT, Claude, Llama, Gemini</div>
            <div className={s.archDesc}>
              Каждый токен видит только предыдущие.
              Для авторегрессивной генерации. Стандарт для LLM.
            </div>
          </div>
          <div className={s.archCard} style={{ borderColor: 'rgba(240,192,64,0.3)' }}>
            <div className={s.archName} style={{ color: '#f0c040' }}>Encoder-Decoder</div>
            <div className={s.archExample}>T5, BART, переводчики</div>
            <div className={s.archDesc}>
              Encoder читает вход целиком, Decoder генерирует выход.
              Для перевода, суммаризации, seq2seq задач.
            </div>
          </div>
        </div>
        <p className={s.body}>
          Внутри decoder-only модели (как GPT или Claude) — стек из одинаковых блоков,
          каждый содержит два ключевых компонента: <strong>Attention</strong> и <strong>Feed-Forward</strong>.
          GPT-3: 96 блоков. Llama 3 70B: 80 блоков.
        </p>
        <div className={s.blockDiagram}>
          <div className={s.blockLabel}>Входные токены → embeddings</div>
          <div className={s.blockArrow}>↓</div>
          <div className={s.blockRepeat}>
            <div className={s.blockRepeatLabel}>× N блоков (96 в GPT-3)</div>
            <div className={s.blockInner}>
              <div className={s.blockBox} style={{ borderColor: 'rgba(0,229,160,0.4)', background: 'rgba(0,229,160,0.05)' }}>
                <div className={s.blockName}>Multi-Head Attention</div>
                <div className={s.blockSub}>Каждый токен смотрит на всех предыдущих</div>
              </div>
              <div className={s.blockBox} style={{ borderColor: 'rgba(77,184,255,0.4)', background: 'rgba(77,184,255,0.05)' }}>
                <div className={s.blockName}>Feed-Forward Network</div>
                <div className={s.blockSub}>Трансформирует каждый токен отдельно</div>
              </div>
            </div>
          </div>
          <div className={s.blockArrow}>↓</div>
          <div className={s.blockLabel}>Выходной слой → вероятности токенов (softmax)</div>
        </div>
      </section>

      {/* ── 6. Attention ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Attention: нейрон смотрит на контекст</SectionTitle>
        <p className={s.lead}>
          Главная инновация трансформера — механизм <strong>Attention</strong>.
          Он решает проблему, которая была у предыдущих архитектур:
          как токен может учитывать любой другой токен в тексте, независимо от расстояния?
        </p>
        <CodeHighlight lang="ts" code={`Текст: "Иван пришёл домой. Он был уставший."

Вопрос: кто такой "Он"?

Attention для слова "Он":
  "Иван"    → вес 0.89  ← очень важен (это он и есть)
  "пришёл"  → вес 0.05
  "домой"   → вес 0.03
  "был"     → вес 0.02
  "уставший"→ вес 0.01

Итог: "Он" получает вектор = сумма векторов,
взвешенная по этим весам → смысл разрешён.`} />
        <p className={s.body}>
          Каждый токен задаёт три вектора: <strong>Query</strong> (что ищу),
          <strong> Key</strong> (что я из себя представляю) и <strong>Value</strong> (что я передам).
          Attention веса = совместимость Query одного токена с Key всех остальных.
          Итог = взвешенная сумма Value.
        </p>
        <p className={s.body}>
          <strong>Multi-Head Attention</strong> — это то же самое, но параллельно несколько раз
          (например, 32 «головы»). Каждая голова обращает внимание на разные аспекты:
          одна — на синтаксис, другая — на семантику, третья — на позицию.
          Результаты конкатенируются.
        </p>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ПОЧЕМУ ЭТО РЕВОЛЮЦИОННО</div>
          <p className={s.infoText}>
            В предыдущих архитектурах (RNN, LSTM) информация передавалась последовательно —
            первое слово должно было «выжить» через 100 шагов чтобы влиять на 101-е.
            Attention даёт прямой доступ к любому токену за один шаг.
            Это почему трансформеры так хорошо справляются с длинными текстами.
          </p>
        </div>
      </section>

      {/* ── 7. Context Window ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Context Window: сколько модель может «видеть»</SectionTitle>
        <p className={s.lead}>
          Attention вычисляется между всеми токенами сразу — но это ограничено числом токенов,
          которые модель может обработать за один раз. Это и есть <strong>context window</strong>.
        </p>
        <div className={s.contextTable}>
          <div className={s.ctxHeader}>
            <span>Модель</span>
            <span>Context</span>
            <span>~страниц текста</span>
          </div>
          {[
            { model: 'GPT-3', ctx: '4K',   pages: '~3' },
            { model: 'GPT-4', ctx: '128K', pages: '~100' },
            { model: 'Claude 3 Opus', ctx: '200K', pages: '~150' },
            { model: 'Gemini 1.5 Pro', ctx: '1M',  pages: '~750' },
          ].map(r => (
            <div key={r.model} className={s.ctxRow}>
              <span className={s.ctxModel}>{r.model}</span>
              <span className={s.ctxNum}>{r.ctx}</span>
              <span className={s.ctxPages}>{r.pages}</span>
            </div>
          ))}
        </div>
        <p className={s.body}>
          Что не вошло в context window — модель не знает и не помнит. Никакой «долгосрочной памяти»
          внутри базовой архитектуры нет. Если чат длинный — старые сообщения обрезаются или
          нужно явно суммаризировать историю. Также: длинный контекст = дорого.
          Attention растёт как <strong>O(n²)</strong> по числу токенов.
        </p>
      </section>

      {/* ── 8. Температура и генерация ───────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как рождается текст: sampling</SectionTitle>
        <p className={s.lead}>
          Модель выдаёт вероятности для каждого токена в словаре (~100K токенов).
          Как выбрать один? Это называется <strong>sampling стратегия</strong>.
        </p>
        <div className={s.samplingGrid}>
          {[
            {
              name: 'Greedy (temperature=0)',
              desc: 'Всегда берём самый вероятный токен. Детерминировано, но скучно — модель зацикливается.',
              color: '#4db8ff',
            },
            {
              name: 'Temperature sampling',
              desc: 'Делим логиты на T перед softmax. T<1: заостряет распределение. T>1: сглаживает. T=0.7–1.0 — стандарт.',
              color: '#f0c040',
            },
            {
              name: 'Top-p (nucleus)',
              desc: 'Берём минимальный набор токенов с суммарной вероятностью ≥ p (обычно 0.9). Лучше top-k для разнообразия.',
              color: '#00e5a0',
            },
            {
              name: 'Top-k',
              desc: 'Берём только k самых вероятных токенов. Просто, но k фиксирован — не адаптируется к уверенности модели.',
              color: '#ff9070',
            },
          ].map(m => (
            <div key={m.name} className={s.samplingCard} style={{ borderTop: `3px solid ${m.color}` }}>
              <div className={s.samplingName} style={{ color: m.color }}>{m.name}</div>
              <div className={s.samplingDesc}>{m.desc}</div>
            </div>
          ))}
        </div>
        <p className={s.body}>
          На практике обычно используют комбинацию: temperature + top-p. Для кода и фактических вопросов —
          низкая temperature (0.0–0.3), детерминированный ответ. Для творческих текстов — 0.7–1.2.
          Выше 1.5 — обычно шум.
        </p>
      </section>

      {/* ── 9. Масштаб ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Почему больше = умнее: scaling laws</SectionTitle>
        <p className={s.lead}>
          В 2020 году OpenAI обнаружили <strong>scaling laws</strong>: качество модели предсказуемо
          растёт с увеличением трёх вещей — числа параметров, объёма данных и вычислительного бюджета.
        </p>
        <CodeHighlight lang="ts" code={`# Scaling laws (Kaplan et al., 2020):
Loss ∝ (параметры)^(-0.076)
Loss ∝ (токены данных)^(-0.095)
Loss ∝ (FLOPs)^(-0.050)

# GPT эволюция:
GPT-1  (2018):    117M параметров
GPT-2  (2019):    1.5B параметров
GPT-3  (2020):    175B параметров
GPT-4  (2023):    ~1T параметров (оценка)

# Chinchilla (DeepMind, 2022):
# Для оптимального обучения нужно:
# токены ≈ 20 × параметры
# Llama 3 8B обучен на 15T токенах`} />
        <p className={s.body}>
          С ростом масштаба появились <strong>emergent abilities</strong> — способности, которых
          нет у малых моделей. Арифметика, chain-of-thought рассуждения, программирование,
          in-context learning — они возникают как фазовый переход при достижении определённого размера.
          Именно поэтому GPT-3 (175B) так резко превзошёл GPT-2 (1.5B).
        </p>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>RLHF: из «завершателя текста» в «ассистента»</div>
          <p className={s.infoText}>
            Базовая модель обучена предсказывать следующий токен — она может продолжить
            «Как сделать бомбу» столь же охотно, как «Как испечь торт». Чтобы получить
            полезного ассистента, модель дообучают через <strong>RLHF (Reinforcement Learning from Human Feedback)</strong>:
            люди оценивают ответы, обучается reward model, модель оптимизируется под reward.
            Так из GPT получается ChatGPT, из Anthropic base model — Claude.
          </p>
        </div>
      </section>

      {/* ── 10. Итог ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Итог: как всё работает вместе</SectionTitle>
        <div className={s.flowSteps}>
          {[
            { num: '1', title: 'Токенизация', desc: 'Текст → список токенов через BPE словарь (~100K токенов)' },
            { num: '2', title: 'Embeddings', desc: 'Каждый токен → вектор 4096 чисел + positional encoding (позиция в тексте)' },
            { num: '3', title: 'N блоков трансформера', desc: 'Каждый блок: Multi-Head Attention (смотрим на контекст) + Feed-Forward (трансформируем)' },
            { num: '4', title: 'Выходной слой', desc: 'Финальный вектор → логиты для всех ~100K токенов словаря' },
            { num: '5', title: 'Sampling', desc: 'Temperature + top-p → выбираем один токен → добавляем к тексту' },
            { num: '→', title: 'Повторяем', desc: 'Весь процесс заново с новым токеном в конце, пока не выдадим токен <EOS>' },
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
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
