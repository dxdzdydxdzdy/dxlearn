import { NeuronPlayground } from './NeuronPlayground';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './MlHowItWorksArticle.module.scss';

export function MlHowItWorksArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Почему не if-else ─────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Почему нельзя просто написать if-else</h2>
        <p className={s.lead}>
          Возьмём задачу: определить что нарисовано на картинке — кошка или собака.
          Картинка — это просто сетка пикселей, каждый пиксель — число от 0 до 255.
          Картинка 100×100 = 10 000 чисел. Как написать правило?
        </p>
        <div className={s.codeBlock}>
          <code>{`// Попытка написать правила вручную:
if (pixel[300] > 128 && pixel[450] < 64) → "кошка"?

// Проблема: таких пикселей 10 000.
// Кошки бывают разные. Освещение разное. Углы разные.
// Правила написать невозможно.`}</code>
        </div>
        <p className={s.body}>
          Классическое программирование работает так: программист пишет правила → программа применяет к данным.
          ML переворачивает это: программист даёт данные и правильные ответы → алгоритм сам находит правила.
          Там, где правила нельзя сформулировать вручную — распознавание речи, перевод, изображения — ML незаменим.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>Обычное программирование</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Данные + Правила → Ответы</li>
              <li className={s.colItem}>Правила пишет программист</li>
              <li className={s.colItem}>Работает там, где логика простая</li>
              <li className={s.colItem}>Пример: сортировка, калькулятор</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>Machine Learning</div>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Данные + Ответы → Правила (модель)</li>
              <li className={s.colItemGood}>Правила находит алгоритм</li>
              <li className={s.colItemGood}>Работает там, где логика сложная</li>
              <li className={s.colItemGood}>Пример: распознавание, перевод</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. Нейрон ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Нейрон — строительный блок</h2>
        <p className={s.lead}>
          Нейрон — это просто функция. Она принимает несколько чисел, что-то с ними делает,
          и выдаёт одно число. Всё.
        </p>
        <p className={s.body}>
          Нейрон берёт входы <strong>x₁, x₂, x₃</strong>, умножает каждый на свой <strong>вес (weight)</strong>,
          складывает всё вместе и добавляет число <strong>bias (смещение)</strong>:
        </p>
        <div className={s.mathBox}>
          <div className={s.mathRow}>
            <span className={s.mathVar}>z</span>
            <span className={s.mathOp}> = </span>
            <span className={s.mathBlue}>x₁</span>
            <span className={s.mathOp}> · </span>
            <span className={s.mathYellow}>w₁</span>
            <span className={s.mathOp}> + </span>
            <span className={s.mathBlue}>x₂</span>
            <span className={s.mathOp}> · </span>
            <span className={s.mathYellow}>w₂</span>
            <span className={s.mathOp}> + </span>
            <span className={s.mathBlue}>x₃</span>
            <span className={s.mathOp}> · </span>
            <span className={s.mathYellow}>w₃</span>
            <span className={s.mathOp}> + </span>
            <span className={s.mathOrange}>b</span>
          </div>
          <div className={s.mathLegend}>
            <span className={s.mathBlue}>x — входные данные</span>
            <span className={s.mathYellow}>w — веса (обучаются)</span>
            <span className={s.mathOrange}>b — bias (обучается)</span>
          </div>
        </div>
        <p className={s.body}>
          <strong>Вес (weight)</strong> — это коэффициент важности входа. Большой вес (например, 2.0)
          значит «этот вход очень важен». Маленький (0.01) — «почти не влияет». Отрицательный — «тормозит».
          Именно <strong>веса определяют что нейрон делает</strong>, и именно их ищет алгоритм при обучении.
        </p>
        <p className={s.body}>
          <strong>Bias (смещение)</strong> — это дополнительное число, которое сдвигает порог.
          Представь нейрон как выключатель: bias определяет «насколько трудно его активировать»
          независимо от входов.
        </p>
        <div className={s.analogyCard}>
          <div className={s.analogyLabel}>АНАЛОГИЯ</div>
          <p className={s.analogyText}>
            Нейрон — как голосование с весами. Трое судей дают оценки (x₁, x₂, x₃).
            Один судья авторитетный — его оценке дают вес 2.0 (влияет сильно).
            Другой новичок — вес 0.3 (влияет слабо). Итог = взвешенная сумма мнений + поправка.
          </p>
        </div>
      </section>

      {/* ── 3. Активация ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Активационная функция: добавляем «изгиб»</h2>
        <p className={s.lead}>
          Если просто складывать и умножать числа — это математически линейная операция.
          А цепочка линейных операций — это всё равно одна линейная операция.
          Сколько ни добавляй слоёв — толку нет.
        </p>
        <div className={s.codeBlock}>
          <code>{`// Без активации: цепочка линейных операций схлопывается
z1 = x*w1 + b1     // слой 1
z2 = z1*w2 + b2    // слой 2
z3 = z2*w3 + b3    // слой 3

// Математически это то же самое что:
z3 = x * (w1*w2*w3) + константа  // один слой!

// Хоть 100 слоёв — мощности не добавляют.`}</code>
        </div>
        <p className={s.body}>
          Чтобы сеть могла учить сложные вещи — ей нужна нелинейность.
          Поэтому после каждого нейрона применяют <strong>функцию активации</strong>.
          Самая популярная: <strong>ReLU (Rectified Linear Unit)</strong>.
        </p>
        <div className={s.codeBlock}>
          <code>{`# ReLU — невероятно простая функция:
def relu(z):
    return max(0, z)

relu(-5.0)  → 0      # отрицательное → обнуляем
relu( 0.0)  → 0      # ноль → ноль
relu( 3.7)  → 3.7    # положительное → пропускаем

# Почему это работает? Потому что max() — нелинейная функция.
# Она создаёт "изломы" — модель может учить нелинейные зависимости.`}</code>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ЗАЧЕМ ИМЕННО ReLU?</div>
          <p className={s.infoText}>
            Простота = скорость. Вычислить max(0, z) на миллиардах нейронов быстро.
            Кроме того, ReLU не «насыщается» — у неё нет верхнего предела, поэтому
            градиенты не затухают при обратном распространении (это важно, объясним дальше).
            Sigmoid и Tanh — другие функции активации, но используются реже.
          </p>
        </div>
      </section>

      {/* ── 4. NeuronPlayground ───────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Попробуй сам: один нейрон</h2>
        <p className={s.body}>
          Двигай ползунки и смотри как меняется выход. Обрати внимание:
          когда z становится отрицательным — ReLU обнуляет его, и нейрон «молчит».
          Именно так каждый нейрон в сети решает — «говорить» ему или нет.
        </p>
        <NeuronPlayground />
      </section>

      {/* ── 5. Сеть из нейронов ───────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Сеть = много нейронов в слоях</h2>
        <p className={s.lead}>
          Один нейрон мало на что способен — он просто взвешивает входы.
          Но тысячи нейронов, собранных в слои — это уже мощный инструмент.
        </p>
        <p className={s.body}>
          Нейроны группируют в <strong>слои (layers)</strong>. Каждый нейрон одного слоя
          подключён ко всем нейронам следующего слоя. Выход одного нейрона — вход для другого.
        </p>
        <div className={s.networkDiagram}>
          <div className={s.netLayer}>
            <div className={s.netLayerLabel}>Входной слой</div>
            {['x₁', 'x₂', 'x₃', 'x₄'].map(n => (
              <div key={n} className={s.netNode} style={{ borderColor: 'rgba(77,184,255,0.5)', color: '#4db8ff' }}>{n}</div>
            ))}
            <div className={s.netLayerSub}>пиксели, числа, слова</div>
          </div>
          <div className={s.netArrow}>→</div>
          <div className={s.netLayer}>
            <div className={s.netLayerLabel}>Скрытый слой 1</div>
            {[1,2,3,4,5].map(n => (
              <div key={n} className={s.netNode} style={{ borderColor: 'rgba(240,192,64,0.5)', color: '#f0c040' }}>h</div>
            ))}
            <div className={s.netLayerSub}>простые признаки</div>
          </div>
          <div className={s.netArrow}>→</div>
          <div className={s.netLayer}>
            <div className={s.netLayerLabel}>Скрытый слой 2</div>
            {[1,2,3,4,5].map(n => (
              <div key={n} className={s.netNode} style={{ borderColor: 'rgba(255,144,112,0.5)', color: '#ff9070' }}>h</div>
            ))}
            <div className={s.netLayerSub}>сложные признаки</div>
          </div>
          <div className={s.netArrow}>→</div>
          <div className={s.netLayer}>
            <div className={s.netLayerLabel}>Выходной слой</div>
            {['кошка', 'собака'].map(n => (
              <div key={n} className={s.netNodeOut}>{n}</div>
            ))}
            <div className={s.netLayerSub}>вероятности классов</div>
          </div>
        </div>
        <p className={s.body}>
          Каждый слой учится замечать разные вещи. Первый слой — простые паттерны (края, углы).
          Второй — части объектов (ухо, лапа). Третий — сложные концепции (морда кошки).
          Это и есть <strong>иерархия признаков</strong> — главная сила нейросетей.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>ВАЖНО</div>
          <p className={s.calloutText}>
            Никто не говорит нейросети «ищи края на первом слое». Она сама находит
            полезные признаки из данных. Программист задаёт только архитектуру (сколько слоёв,
            сколько нейронов) — а что замечать, сеть решает сама в процессе обучения.
          </p>
        </div>
      </section>

      {/* ── 6. Loss ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Loss — измеряем насколько сеть ошиблась</h2>
        <p className={s.lead}>
          Чтобы учиться, сеть должна знать насколько она ошиблась.
          Для этого вычисляют <strong>loss (функцию потерь)</strong> — одно число,
          которое показывает «насколько плохо».
        </p>
        <div className={s.codeBlock}>
          <code>{`# Простейший loss — MSE (среднеквадратичная ошибка):
# Сеть предсказала 0.3, правильный ответ 1.0

loss = (правильный - предсказанный)²
loss = (1.0 - 0.3)² = 0.49

# Если предсказали точно: (1.0 - 1.0)² = 0.0  ← идеально
# Если ошиблись сильно:  (1.0 - 0.0)² = 1.0  ← плохо

# Для классификации (кошка/собака) обычно используют cross-entropy:
# чем увереннее модель в правильном ответе — тем меньше loss`}</code>
        </div>
        <p className={s.body}>
          <strong>Цель обучения — минимизировать loss.</strong> Мы хотим найти такие веса,
          при которых loss как можно ближе к нулю. Если loss растёт — что-то пошло не так.
          Если loss падает — сеть становится точнее.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>MSE — для регрессии</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Предсказываем число (цена, температура)</li>
              <li className={s.colItem}>Loss = среднее квадратов ошибок</li>
              <li className={s.colItem}>Квадрат штрафует большие ошибки сильнее</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>Cross-Entropy — для классификации</div>
            <ul className={s.colList}>
              <li className={s.colItem}>Предсказываем класс (кошка/собака)</li>
              <li className={s.colItem}>Loss = -log(вероятность правильного класса)</li>
              <li className={s.colItem}>Штрафует неуверенные правильные ответы</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. Gradient Descent ──────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Градиентный спуск — как сеть учится</h2>
        <p className={s.lead}>
          Мы знаем что хотим (минимальный loss). Но как найти нужные веса из миллиарда вариантов?
          Ответ: <strong>градиентный спуск</strong>.
        </p>
        <div className={s.analogyCard}>
          <div className={s.analogyLabel}>МЕТАФОРА</div>
          <p className={s.analogyText}>
            Представь что ты стоишь на холмистой местности в тумане и ищешь самую низкую точку.
            Видимости нет, но ты чувствуешь наклон под ногами. Алгоритм прост:
            сделай шаг в направлении спуска. Повтори. Со временем дойдёшь до ямы.
          </p>
        </div>
        <p className={s.body}>
          В математике «наклон» — это <strong>градиент</strong>. Он показывает: если немного
          увеличить вес, loss вырастет или упадёт? Мы двигаемся <em>против</em> градиента —
          туда, где loss уменьшается.
        </p>
        <div className={s.codeBlock}>
          <code>{`# Обновление каждого веса:
w = w - learning_rate * gradient

# learning_rate (скорость обучения) — размер шага
# gradient — направление роста loss (мы идём ПРОТИВ него)

# Пример:
# w = 0.5, gradient = 0.3, learning_rate = 0.01
# w = 0.5 - 0.01 * 0.3 = 0.497  ← чуть-чуть сдвинули`}</code>
        </div>
        <p className={s.body}>
          <strong>Learning rate</strong> — важнейший параметр. Слишком большой: шаги огромные,
          «перепрыгиваем» минимум, loss скачет. Слишком маленький: обучение займёт вечность.
          Правильный: loss стабильно и уверенно падает.
        </p>
        <div className={s.flowSteps}>
          {[
            { num: '1', title: 'Прямой проход (forward pass)', desc: 'Подаём данные на вход, проходим через все слои, получаем предсказание' },
            { num: '2', title: 'Вычисляем loss', desc: 'Сравниваем предсказание с правильным ответом, считаем ошибку' },
            { num: '3', title: 'Обратный проход (backward pass)', desc: 'Вычисляем градиент для каждого веса — кто насколько виноват в ошибке' },
            { num: '4', title: 'Обновляем веса', desc: 'Каждый вес сдвигается на маленький шаг в сторону уменьшения loss' },
            { num: '→', title: 'Повторить', desc: 'Миллионы раз. Каждый шаг — чуть точнее. Так и обучается сеть.' },
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

      {/* ── 8. Backpropagation ────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Backpropagation — кто виноват в ошибке?</h2>
        <p className={s.lead}>
          Шаг 3 выше звучит просто: «вычислить градиент для каждого веса».
          Но как это сделать, если весов миллионы и они все связаны?
          Для этого есть <strong>backpropagation</strong>.
        </p>
        <p className={s.body}>
          Backpropagation — алгоритм который идёт от выхода к входу и по правилу
          производной сложной функции (chain rule) вычисляет: на сколько каждый вес
          виноват в ошибке.
        </p>
        <div className={s.codeBlock}>
          <code>{`# Сеть ошиблась. Кто виноват?
Input → Layer1 → Layer2 → Output → LOSS

# Backprop идёт назад:
# ← насколько Output повлиял на LOSS?
# ← насколько Layer2 повлиял на Output?
# ← насколько Layer1 повлиял на Layer2?
# ← насколько каждый вес повлиял?

# Результат: у каждого из миллионов весов есть свой градиент.
# Обновляем их все — один шаг градиентного спуска.`}</code>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoLabel}>КАК ЭТО РАБОТАЕТ В КОДЕ</div>
          <p className={s.infoText}>
            В PyTorch достаточно написать <code>loss.backward()</code> —
            библиотека автоматически посчитает все градиенты через граф вычислений.
            Это называется <strong>автодифференцирование</strong> —
            одно из главных изобретений, сделавших глубокое обучение возможным.
          </p>
        </div>
      </section>

      {/* ── 9. Что значит Deep ────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Что значит «глубокое» обучение</h2>
        <p className={s.lead}>
          «Глубокое» — это просто «много слоёв». В 2012 году нейросеть AlexNet с 8 слоями
          выиграла конкурс ImageNet и обошла все предыдущие методы. С тех пор глубина растёт:
          современные модели имеют сотни слоёв.
        </p>
        <p className={s.body}>
          Почему глубина важна? Каждый слой строит абстракцию поверх предыдущего:
        </p>
        <div className={s.depthDiagram}>
          {[
            { layer: 'Слой 1', learns: 'Пиксели → Края, линии, углы', icon: '╱' },
            { layer: 'Слой 2', learns: 'Края → Текстуры, формы', icon: '◇' },
            { layer: 'Слой 3', learns: 'Формы → Части объектов (ухо, глаз)', icon: '◉' },
            { layer: 'Слой 4', learns: 'Части → Объекты (морда, лапа)', icon: '🐾' },
            { layer: 'Слой 5', learns: 'Объекты → Понятия (кошка, собака)', icon: '🐈' },
          ].map((d, i) => (
            <div key={i} className={s.depthRow}>
              <div className={s.depthIcon}>{d.icon}</div>
              <div className={s.depthContent}>
                <span className={s.depthLayer}>{d.layer}</span>
                <span className={s.depthArrow}>→</span>
                <span className={s.depthLearns}>{d.learns}</span>
              </div>
            </div>
          ))}
        </div>
        <p className={s.body}>
          Один широкий слой не может создать такую иерархию. Именно поэтому «широкая»
          (1 слой × 1000 нейронов) и «глубокая» (10 слоёв × 100 нейронов) сети —
          совершенно разные по возможностям, даже если у них одинаковое число параметров.
        </p>
      </section>

      {/* ── 10. Overfitting & Split ───────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Как понять что сеть действительно научилась</h2>
        <p className={s.lead}>
          Сеть может «выучить» обучающие примеры наизусть, не поняв общих закономерностей.
          Это называется <strong>overfitting (переобучение)</strong>.
        </p>
        <div className={s.codeBlock}>
          <code>{`# Пример переобучения:
Train loss:      0.001  ← "отлично, почти нет ошибок"
Validation loss: 2.800  ← КАТАСТРОФА

# Модель зазубрила 10 000 кошек из обучающего набора.
# Но новую кошку — которую не видела — не распознаёт.

# Как студент, который зазубрил ответы на билеты.
# На экзамене с теми же вопросами — 5. Другие вопросы — не знает.`}</code>
        </div>
        <p className={s.body}>
          Чтобы честно оценить качество модели, данные делят на три части:
        </p>
        <div className={s.splitDiagram}>
          <div className={s.splitPart} style={{ flex: 7, background: 'rgba(0,229,160,0.08)', borderColor: 'rgba(0,229,160,0.2)' }}>
            <div className={s.splitLabel} style={{ color: '#00e5a0' }}>Train — 70%</div>
            <div className={s.splitDesc}>Обучаем модель. Видит данные много раз.</div>
          </div>
          <div className={s.splitPart} style={{ flex: 1.5, background: 'rgba(240,192,64,0.08)', borderColor: 'rgba(240,192,64,0.2)' }}>
            <div className={s.splitLabel} style={{ color: '#f0c040' }}>Val — 15%</div>
            <div className={s.splitDesc}>Подбираем гиперпараметры. Можно смотреть часто.</div>
          </div>
          <div className={s.splitPart} style={{ flex: 1.5, background: 'rgba(77,184,255,0.08)', borderColor: 'rgba(77,184,255,0.2)' }}>
            <div className={s.splitLabel} style={{ color: '#4db8ff' }}>Test — 15%</div>
            <div className={s.splitDesc}>Финальная оценка. Смотрим один раз в конце.</div>
          </div>
        </div>
        <div className={s.warningCard}>
          <div className={s.warningLabel}>⚠ ЛОВУШКА</div>
          <p className={s.warningText}>
            Если смотреть на test-результаты при настройке модели — ты начнёшь подгонять
            под него и обманешь себя. Test — это «запечатанный конверт» который вскрывается
            один раз. Только тогда ты узнаешь, как модель работает на реальных новых данных.
          </p>
        </div>
        <p className={s.body}>
          Переобучение лечат: добавлением данных, <strong>dropout</strong> (случайно отключаем
          часть нейронов при обучении), <strong>regularization</strong> (штрафуем большие веса),
          ранней остановкой (прекращаем когда validation loss перестал падать).
        </p>
      </section>

      {/* ── Итог ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Итог: как всё связано</h2>
        <div className={s.summaryGrid}>
          {[
            { term: 'Нейрон', def: 'Функция: взвешенная сумма + bias + активация' },
            { term: 'Вес (weight)', def: 'Коэффициент важности входа, ищется при обучении' },
            { term: 'ReLU', def: 'Функция активации: max(0, z) — добавляет нелинейность' },
            { term: 'Loss', def: 'Число: насколько сеть ошиблась. Хотим минимизировать' },
            { term: 'Gradient descent', def: 'Итеративно двигаем веса в сторону уменьшения loss' },
            { term: 'Backpropagation', def: 'Алгоритм вычисления градиентов для всех весов сразу' },
            { term: 'Epoch', def: 'Один полный проход по всему датасету' },
            { term: 'Overfitting', def: 'Модель выучила данные наизусть, не обобщает' },
          ].map(({ term, def }) => (
            <div key={term} className={s.summaryItem}>
              <div className={s.summaryTerm}>{term}</div>
              <div className={s.summaryDef}>{def}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверь себя</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
