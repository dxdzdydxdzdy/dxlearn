import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { LoraVisualizer } from './LoraVisualizer';
import { QUIZ_QUESTIONS } from './quizData';
import s from './FineTuningArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function FineTuningArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое fine-tuning ──────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое fine-tuning</SectionTitle>
        <p className={s.lead}>
          Большие языковые модели — GPT, Claude, Llama — обучены на триллионах
          слов из интернета. Они знают язык, умеют рассуждать, понимают контекст.
          Но иногда этого мало: нужен чат-бот, который отвечает{' '}
          <strong>строго в корпоративном стиле</strong>, или модель, которая{' '}
          <strong>всегда выдаёт JSON</strong> определённой схемы, или
          ассистент для медицинской документации, понимающий специфические термины.
        </p>
        <p className={s.body}>
          Fine-tuning (дообучение) — это продолжение обучения уже готовой модели
          на <strong>небольшом специализированном датасете</strong>. Модель не
          учится с нуля: она берёт все знания, накопленные за предобучение, и
          адаптирует поведение к новой задаче. Это как нанять специалиста с
          хорошим образованием и провести внутренний тренинг — быстрее, чем
          растить с нуля.
        </p>

        <div className={s.decisionFlow}>
          <div className={s.decisionTitle}>Когда что использовать — принятие решения</div>
          <div className={s.decisionSteps}>
            <div className={s.decisionStep}>
              <div className={s.decisionStepNum}>1</div>
              <div className={s.decisionStepBody}>
                <div className={s.decisionStepQ}>Решает ли задачу хороший промпт с примерами?</div>
                <div className={s.decisionStepA}>→ Да: <strong>Prompt Engineering</strong> (быстро, бесплатно)</div>
              </div>
            </div>
            <div className={s.decisionArrow}>↓ Нет</div>

            <div className={s.decisionStep}>
              <div className={s.decisionStepNum}>2</div>
              <div className={s.decisionStepBody}>
                <div className={s.decisionStepQ}>Нужны внешние данные / документы компании?</div>
                <div className={s.decisionStepA}>→ Да: <strong>RAG</strong> (актуальные знания, обновляемо)</div>
              </div>
            </div>
            <div className={s.decisionArrow}>↓ Нет</div>

            <div className={s.decisionStep}>
              <div className={s.decisionStepNum}>3</div>
              <div className={s.decisionStepBody}>
                <div className={s.decisionStepQ}>Нужен устойчивый стиль / формат / предметная область?</div>
                <div className={s.decisionStepA}>→ Да: <strong>Fine-Tuning</strong> — вот оно</div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>ВАЖНО ПОНЯТЬ</div>
          <p className={s.calloutText}>
            Fine-tuning <strong>не добавляет новые знания</strong> о мире так надёжно,
            как RAG. Он меняет <em>поведение</em>: стиль ответа, следование формату,
            акцент на нужной предметной области. Для свежих фактов лучше RAG.
          </p>
        </div>
      </section>

      {/* ── 2. Полный vs LoRA vs QLoRA ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Full Fine-Tuning vs LoRA vs QLoRA</SectionTitle>
        <p className={s.body}>
          Первый вопрос при fine-tuning: <strong>какой метод использовать</strong>?
          Полное обучение всех весов даёт максимальное качество, но требует
          огромных ресурсов. LoRA и QLoRA — умные компромиссы.
        </p>

        {/* LoRA explanation */}
        <div className={s.loraExplain}>
          <div className={s.loraExplainTitle}>Как работает LoRA</div>
          <p className={s.loraExplainText}>
            У трансформера есть матрицы весов W (например, 4096 × 4096 = 16 млн
            параметров в одном слое). При полном fine-tuning все они обновляются.
            LoRA говорит: «заморозим W, а рядом добавим две маленькие матрицы
            A и B, где rank r ≪ 4096».
          </p>
          <div className={s.loraFormula}>
            <span className={s.loraFormulaText}>output = W·x + </span>
            <span className={s.loraFormulaHL}>(alpha/r) · B·A·x</span>
          </div>
          <p className={s.loraExplainText}>
            При r=8 вместо 16 млн параметров обучается{' '}
            <strong>2 × (4096 × 8) = 65 536</strong> — в{' '}
            <strong>244 раза меньше</strong>. Итоговый адаптер весит
            10-100 МБ вместо 14 ГБ.
          </p>
        </div>

        <LoraVisualizer />
      </section>

      {/* ── 3. Датасет ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как подготовить датасет</SectionTitle>
        <p className={s.body}>
          Качество датасета важнее его размера. 200 идеально написанных
          примеров лучше 2000 с ошибками и противоречиями. Модель буквально
          копирует стиль твоих примеров — мусор на входе, мусор на выходе.
        </p>

        <div className={s.formatsGrid}>
          <div className={s.formatCard}>
            <div className={s.formatName}>Instruction format (Alpaca)</div>
            <div className={s.formatDesc}>Для задач типа «дай инструкцию → получи выход». Подходит для классификации, генерации, трансформации.</div>
            <div className={s.formatCode}>{`{
  "instruction": "Переведи на английский",
  "input": "Привет, как дела?",
  "output": "Hi, how are you?"
}`}</div>
          </div>

          <div className={s.formatCard}>
            <div className={s.formatName}>Chat format (OpenAI/ShareGPT)</div>
            <div className={s.formatDesc}>Для диалоговых задач. Есть system prompt, роли user и assistant. Самый популярный формат.</div>
            <div className={s.formatCode}>{`{
  "messages": [
    { "role": "system",    "content": "Ты ..." },
    { "role": "user",      "content": "Вопрос" },
    { "role": "assistant", "content": "Ответ" }
  ]
}`}</div>
          </div>

          <div className={s.formatCard}>
            <div className={s.formatName}>Preference format (DPO)</div>
            <div className={s.formatDesc}>Для обучения на предпочтениях. Модель учится, что «хороший» ответ лучше «плохого».</div>
            <div className={s.formatCode}>{`{
  "prompt":   "Напиши email клиенту",
  "chosen":   "Уважаемый...",
  "rejected": "Привет, вот..."
}`}</div>
          </div>
        </div>

        <div className={s.datasetTips}>
          <div className={s.datasetTipsTitle}>Советы по сбору данных</div>
          <div className={s.tipsList}>
            <div className={s.tip}>
              <div className={s.tipIcon}>📏</div>
              <div className={s.tipBody}>
                <div className={s.tipTitle}>Размер: 500–5000 примеров</div>
                <div className={s.tipDesc}>
                  Модель уже знает язык — ей нужно лишь адаптироваться к стилю.
                  500–1000 примеров достаточно для смены формата/тона.
                  Для новой предметной области — 2000–5000.
                </div>
              </div>
            </div>

            <div className={s.tip}>
              <div className={s.tipIcon}>⚖️</div>
              <div className={s.tipBody}>
                <div className={s.tipTitle}>Баланс классов и тем</div>
                <div className={s.tipDesc}>
                  Если 90% примеров — один тип запросов, модель будет плохо
                  работать с другими. Обеспечь равномерное распределение
                  по всем сценариям использования.
                </div>
              </div>
            </div>

            <div className={s.tip}>
              <div className={s.tipIcon}>✅</div>
              <div className={s.tipBody}>
                <div className={s.tipTitle}>Human review обязателен</div>
                <div className={s.tipDesc}>
                  Прочитай минимум 10-20% примеров руками. Ошибки в датасете
                  воспроизводятся моделью стабильно — она не исправляет твои
                  ошибки, а учится им.
                </div>
              </div>
            </div>

            <div className={s.tip}>
              <div className={s.tipIcon}>🔀</div>
              <div className={s.tipBody}>
                <div className={s.tipTitle}>Hold-out set (10-20%)</div>
                <div className={s.tipDesc}>
                  Часть примеров не попадает в обучение — только в оценку.
                  Так проверяешь, что модель научилась обобщать, а не
                  просто запоминать ответы.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Процесс обучения ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Процесс: от датасета до модели</SectionTitle>
        <p className={s.body}>
          Инструменты для fine-tuning сейчас доступны всем. Основной стек —
          Hugging Face. Вот как выглядит весь процесс:
        </p>

        <div className={s.processSteps}>
          <div className={s.processStep}>
            <div className={s.processStepNum}>1</div>
            <div className={s.processStepContent}>
              <div className={s.processStepName}>Выбор базовой модели</div>
              <p className={s.processStepDesc}>
                Начни с instruct-версии (Llama-3-8B-Instruct, Mistral-7B-Instruct),
                не с base — она уже умеет следовать инструкциям. Меньше данных
                нужно для адаптации.
              </p>
            </div>
          </div>

          <div className={s.processStep}>
            <div className={s.processStepNum}>2</div>
            <div className={s.processStepContent}>
              <div className={s.processStepName}>Настройка LoRA конфига</div>
              <div className={s.processCode}>{`from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,            # rank — больше = мощнее, но дороже
    lora_alpha=32,   # масштаб: обычно alpha = 2 * r
    target_modules=["q_proj", "v_proj"],  # attention слои
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 8,030,261,248 (0.052%)`}</div>
            </div>
          </div>

          <div className={s.processStep}>
            <div className={s.processStepNum}>3</div>
            <div className={s.processStepContent}>
              <div className={s.processStepName}>Обучение через SFTTrainer (TRL)</div>
              <div className={s.processCode}>{`from trl import SFTTrainer, SFTConfig

trainer = SFTTrainer(
    model=model,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    args=SFTConfig(
        output_dir="./output",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,  # effective batch = 16
        learning_rate=2e-4,
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        logging_steps=10,
        save_steps=100,
        evaluation_strategy="steps",
        eval_steps=100,
        fp16=True,                       # mixed precision
        gradient_checkpointing=True,     # экономим VRAM
    ),
)

trainer.train()`}</div>
            </div>
          </div>

          <div className={s.processStep}>
            <div className={s.processStepNum}>4</div>
            <div className={s.processStepContent}>
              <div className={s.processStepName}>QLoRA: квантизация для маленьких GPU</div>
              <div className={s.processCode}>{`from transformers import BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",          # NormalFloat4 — лучше для LLM
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,     # 2x квантизация scale factors
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization_config=bnb_config,
    device_map="auto",
)
# 8B модель: было ~16 ГБ → стало ~5 ГБ VRAM`}</div>
            </div>
          </div>

          <div className={s.processStep}>
            <div className={s.processStepNum}>5</div>
            <div className={s.processStepContent}>
              <div className={s.processStepName}>Слияние и сохранение</div>
              <div className={s.processCode}>{`from peft import PeftModel

# Загрузить базовую модель + адаптер
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")
model = PeftModel.from_pretrained(base_model, "./output/checkpoint-500")

# Слить адаптер с моделью (W_new = W + A×B)
merged_model = model.merge_and_unload()

# Сохранить как обычную модель (без LoRA overhead)
merged_model.save_pretrained("./my-finetuned-model")
tokenizer.save_pretrained("./my-finetuned-model")

# Загрузить на Hugging Face Hub
merged_model.push_to_hub("username/my-model")`}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Оценка качества ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как оценивать результат</SectionTitle>
        <p className={s.body}>
          После обучения нужно понять: стало ли лучше? Есть несколько подходов,
          которые обычно комбинируют:
        </p>

        <div className={s.evalGrid}>
          <div className={s.evalCard}>
            <div className={s.evalIcon}>📊</div>
            <div className={s.evalName}>Автоматические метрики</div>
            <div className={s.evalDesc}>
              <strong>BLEU/ROUGE</strong> — считают n-gram совпадение с
              референсным ответом. Быстро, но плохо улавливают смысловое качество.
              Полезны как sanity check, не как главная метрика.
            </div>
          </div>

          <div className={s.evalCard}>
            <div className={s.evalIcon}>🤖</div>
            <div className={s.evalName}>LLM-as-Judge</div>
            <div className={s.evalDesc}>
              GPT-4 или Claude оценивает ответы по критериям (точность, стиль,
              полнота) и выставляет оценку 1-5. Хорошо масштабируется, коррелирует
              с человеческой оценкой. Популярный подход в продакшн.
            </div>
          </div>

          <div className={s.evalCard}>
            <div className={s.evalIcon}>👥</div>
            <div className={s.evalName}>Human Evaluation</div>
            <div className={s.evalDesc}>
              Люди оценивают ответы — самый надёжный метод. Дорого и медленно,
              поэтому обычно на небольшой выборке (100-200 примеров). Используй
              blind comparison: модель A vs модель B без подписей.
            </div>
          </div>

          <div className={s.evalCard}>
            <div className={s.evalIcon}>🎯</div>
            <div className={s.evalName}>Task-specific метрики</div>
            <div className={s.evalDesc}>
              Если обучаешь на конкретную задачу — используй её метрику.
              JSON parsing → % валидных JSON. Классификация → F1, accuracy.
              Перевод → BLEU + human eval. Кодогенерация → % проходящих тесты.
            </div>
          </div>
        </div>

        <div className={s.warningCard}>
          <div className={s.warningLabel}>⚠️ РАСПРОСТРАНЁННЫЕ ОШИБКИ</div>
          <div className={s.warningList}>
            <div className={s.warningItem}>
              <strong>Оверфиттинг:</strong> loss на обучении падает, на eval — растёт.
              Признак: модель воспроизводит примеры буквально, а не обобщает.
              Решение: меньше эпох, больше dropout, регуляризация.
            </div>
            <div className={s.warningItem}>
              <strong>Catastrophic forgetting:</strong> модель хорошо отвечает на
              задачи из датасета, но ломается на всём остальном. Решение: добавь
              в датасет general-purpose примеры (5-10%).
            </div>
            <div className={s.warningItem}>
              <strong>Learning rate слишком высокий:</strong> обычные значения
              для LoRA — 1e-4 до 5e-4. Слишком высокий lr нестабилизирует
              обучение.
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DPO: обучение на предпочтениях ────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>DPO: когда нужно улучшить качество ответов</SectionTitle>
        <p className={s.body}>
          Instruction fine-tuning учит модель <em>что говорить</em>. Но иногда нужно
          учить <em>как выбирать между вариантами</em> — делать ответы более
          helpful, менее harmful, более точными. Для этого существует{' '}
          <strong>DPO (Direct Preference Optimization)</strong>.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>RLHF (старый подход)</div>
            <div className={s.colContent}>
              <div className={s.colStep}>1. Обучить Reward Model на парах предпочтений</div>
              <div className={s.colStep}>2. Оптимизировать LLM через PPO (RL), используя Reward Model как сигнал</div>
              <div className={s.colStep}>3. Сложно: нужны 3 модели одновременно (policy, reward, reference)</div>
              <div className={s.colStep} style={{ color: '#ff5f6a' }}>❌ Нестабильно, дорого, сложно</div>
            </div>
          </div>

          <div className={s.colCard}>
            <div className={s.colTitle}>DPO (современный подход)</div>
            <div className={s.colContent}>
              <div className={s.colStep}>1. Датасет: (prompt, chosen_response, rejected_response)</div>
              <div className={s.colStep}>2. Прямая оптимизация: chosen становится вероятнее, rejected — менее</div>
              <div className={s.colStep}>3. Нужны только 2 модели (policy + frozen reference)</div>
              <div className={s.colStep} style={{ color: '#00e5a0' }}>✅ Проще, стабильнее, сопоставимое качество</div>
            </div>
          </div>
        </div>

        <CodeHighlight lang="ts" filename="DPO через TRL" code={`from trl import DPOTrainer, DPOConfig

# Датасет нужен в формате: prompt, chosen, rejected
dpo_dataset = load_dataset("your-preference-dataset")

trainer = DPOTrainer(
    model=model,                     # обучаемая модель
    ref_model=ref_model,             # замороженная reference копия
    args=DPOConfig(
        beta=0.1,                    # KL-регуляризация (обычно 0.1-0.5)
        output_dir="./dpo-output",
        num_train_epochs=1,
        per_device_train_batch_size=2,
        learning_rate=5e-7,          # DPO требует очень маленький lr
    ),
    train_dataset=dpo_dataset["train"],
    tokenizer=tokenizer,
)

trainer.train()`} />
      </section>

      {/* ── 7. Облачные сервисы ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Fine-tuning без своих GPU</SectionTitle>
        <p className={s.body}>
          Не у всех есть кластер с A100. Вот где можно обучать в облаке:
        </p>

        <div className={s.serviceTable}>
          <div className={s.serviceHead}>
            <div className={s.serviceHCell}>Сервис</div>
            <div className={s.serviceHCell}>Особенности</div>
            <div className={s.serviceHCell}>Цена</div>
            <div className={s.serviceHCell}>Когда подходит</div>
          </div>

          {[
            [
              'OpenAI Fine-Tuning',
              'GPT-4o mini, GPT-4o. Загружаешь JSONL — они обучают. Нет доступа к весам.',
              '~$0.003/1K train tokens',
              'Быстрый старт, нет своей инфры. OpenAI-модели.',
            ],
            [
              'Hugging Face AutoTrain',
              'Open-source модели, LoRA/QLoRA, загрузка датасета через UI или API.',
              'От $0/час (Spaces) + GPU',
              'Open-source модели, нужен контроль над весами.',
            ],
            [
              'RunPod / vast.ai',
              'Аренда GPU (A100/H100) по часам. Запускаешь свои скрипты в Docker.',
              '$0.9–3.5/час A100',
              'Полный контроль, custom training loop, долгие обучения.',
            ],
            [
              'Google Colab Pro+',
              'A100 40GB, 24 часа сессия. Хватает для QLoRA 7-13B моделей.',
              '$50/мес',
              'Эксперименты, обучение небольших моделей. Нет persistence.',
            ],
            [
              'Replicate',
              'API для fine-tuning open-source моделей. Serverless. Не нужно управлять GPU.',
              'По времени GPU',
              'Если нужен API-интерфейс без DevOps. Быстрый прототип.',
            ],
          ].map(([svc, feat, price, when]) => (
            <div key={svc} className={s.serviceRow}>
              <div className={s.serviceName}>{svc}</div>
              <div className={s.serviceCell}>{feat}</div>
              <div className={s.serviceCell}>{price}</div>
              <div className={s.serviceCell}>{when}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Quiz ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
