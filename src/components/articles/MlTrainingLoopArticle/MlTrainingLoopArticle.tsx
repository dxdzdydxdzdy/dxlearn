import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { TrainingSimulator } from './TrainingSimulator';
import { QUIZ_QUESTIONS } from './quizData';
import s from './MlTrainingLoopArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function MlTrainingLoopArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем это знать ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Зачем фронтенд-разработчику знать про обучение</SectionTitle>
        <p className={s.lead}>
          Ты не будешь обучать GPT-4 с нуля — это удел крупных лабораторий с
          тысячами GPU. Но понимать <strong>что происходит при обучении</strong>
          {' '}критически важно: почему модель иногда галлюцинирует, что значит
          «переобучение», почему fine-tuning работает или не работает, как
          читать метрики. Эта статья — концептуальный фундамент.
        </p>
        <p className={s.body}>
          Мы будем использовать <strong>PyTorch</strong> — самый популярный
          ML-фреймворк. Код здесь концептуальный: показывает идеи, а не
          production-ready рецепты.
        </p>

        <div className={s.infoCard}>
          <div className={s.infoLabel}>ЧТО ТЫ ЗНАЕШЬ УЖЕ</div>
          <p className={s.infoText}>
            Из статьи «Нейросети: как работает под капотом» — нейрон, веса,
            слои, функция потерь, градиентный спуск. Эта статья разворачивает
            эти понятия в <em>полный цикл обучения</em> с реальным кодом.
          </p>
        </div>
      </section>

      {/* ── 2. Данные ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Данные: откуда начинается всё</SectionTitle>
        <p className={s.body}>
          Обучение без данных невозможно. Модель учится на примерах:{' '}
          <strong>вход (X) → правильный ответ (y)</strong>. Всё обучение —
          это поиск функции, которая по X предсказывает y.
        </p>

        <div className={s.splitsBlock}>
          <div className={s.splitCard} style={{ borderColor: 'rgba(0,229,160,0.3)' }}>
            <div className={s.splitNum} style={{ color: '#00e5a0' }}>~70%</div>
            <div className={s.splitName}>Train set</div>
            <div className={s.splitDesc}>
              На нём обновляются веса. Модель «видит» эти примеры и учится
              на их ошибках. Чем больше — тем лучше (до разумных пределов).
            </div>
          </div>

          <div className={s.splitCard} style={{ borderColor: 'rgba(77,184,255,0.3)' }}>
            <div className={s.splitNum} style={{ color: '#4db8ff' }}>~15%</div>
            <div className={s.splitName}>Validation set</div>
            <div className={s.splitDesc}>
              «Экзамен» во время обучения: измеряем качество на данных,
              которых модель не видела. Показывает, учится ли она обобщать
              или просто запоминает.
            </div>
          </div>

          <div className={s.splitCard} style={{ borderColor: 'rgba(240,192,64,0.3)' }}>
            <div className={s.splitNum} style={{ color: '#f0c040' }}>~15%</div>
            <div className={s.splitName}>Test set</div>
            <div className={s.splitDesc}>
              Используется <strong>только один раз</strong> — финальная
              проверка после всего обучения. Неприкосновенен до конца;
              иначе результат нечестный.
            </div>
          </div>
        </div>

        <CodeHighlight lang="python" filename="PyTorch: загрузка данных" code={`import torch
from torch.utils.data import Dataset, DataLoader, random_split

# Свой датасет — реализуй __len__ и __getitem__
class SentimentDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts   = texts
        self.labels  = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_tensors='pt',
        )
        return {
            'input_ids':      encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'label':          torch.tensor(self.labels[idx], dtype=torch.long),
        }

dataset = SentimentDataset(texts, labels, tokenizer)

# Разбивка 70/15/15
n = len(dataset)
train_ds, val_ds, test_ds = random_split(dataset, [int(n*0.7), int(n*0.15), n - int(n*0.7) - int(n*0.15)])

# DataLoader — батчи + перемешивание
train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader   = DataLoader(val_ds,   batch_size=64, shuffle=False)`} />
      </section>

      {/* ── 3. Forward pass ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Forward pass: модель делает предсказание</SectionTitle>
        <p className={s.body}>
          <strong>Forward pass</strong> — это прогон данных через модель
          от входа к выходу. Модель берёт X, применяет веса, возвращает
          предсказание ŷ (y-hat). Пока модель не учится — веса случайные,
          предсказания плохие.
        </p>

        <div className={s.forwardDiagram}>
          <div className={s.forwardStep}>
            <div className={s.forwardStepLabel}>Вход X</div>
            <div className={s.forwardStepValue}>«Отличный фильм!»</div>
          </div>
          <div className={s.forwardArrow}>→</div>

          <div className={s.forwardStep}>
            <div className={s.forwardStepLabel}>Токенизация</div>
            <div className={s.forwardStepValue}>[101, 5543, 2143, 102]</div>
          </div>
          <div className={s.forwardArrow}>→</div>

          <div className={s.forwardStep}>
            <div className={s.forwardStepLabel}>Embedding слой</div>
            <div className={s.forwardStepValue}>тензор (4, 768)</div>
          </div>
          <div className={s.forwardArrow}>→</div>

          <div className={s.forwardStep}>
            <div className={s.forwardStepLabel}>Transformer слои</div>
            <div className={s.forwardStepValue}>тензор (1, 768)</div>
          </div>
          <div className={s.forwardArrow}>→</div>

          <div className={s.forwardStep}>
            <div className={s.forwardStepLabel}>Классификатор</div>
            <div className={s.forwardStepValue}>logits [-1.2, 0.8]</div>
          </div>
          <div className={s.forwardArrow}>→</div>

          <div className={s.forwardStep} style={{ borderColor: 'rgba(0,229,160,0.4)' }}>
            <div className={s.forwardStepLabel} style={{ color: '#00e5a0' }}>ŷ (предсказание)</div>
            <div className={s.forwardStepValue}>positive (68%)</div>
          </div>
        </div>

        <CodeHighlight lang="python" filename="Определение модели и forward pass" code={`import torch.nn as nn
from transformers import AutoModel

class SentimentClassifier(nn.Module):
    def __init__(self, model_name: str, num_classes: int = 2):
        super().__init__()
        self.encoder  = AutoModel.from_pretrained(model_name)
        self.dropout  = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.encoder.config.hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        # Прогон через BERT/RoBERTa → берём [CLS] токен
        outputs  = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled   = outputs.last_hidden_state[:, 0, :]  # shape: (batch, 768)
        dropped  = self.dropout(pooled)
        logits   = self.classifier(dropped)             # shape: (batch, 2)
        return logits

model = SentimentClassifier("bert-base-multilingual-cased")

# Один forward pass (без обучения):
batch = next(iter(train_loader))
logits = model(batch['input_ids'], batch['attention_mask'])
# logits.shape = (32, 2) — по два числа на каждый из 32 примеров`} />
      </section>

      {/* ── 4. Loss + backward ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Loss и backward: считаем ошибку и обновляем веса</SectionTitle>
        <p className={s.body}>
          После forward pass знаем предсказание ŷ и правильный ответ y.{' '}
          <strong>Loss function</strong> считает разницу между ними — одно число.
          Чем больше, тем хуже модель. Затем <strong>backward pass</strong>
          вычисляет, как каждый вес повлиял на ошибку (через backpropagation),
          и <strong>optimizer</strong> делает шаг в сторону уменьшения loss.
        </p>

        <div className={s.lossTypes}>
          <div className={s.lossCard}>
            <div className={s.lossName}>CrossEntropyLoss</div>
            <div className={s.lossUse}>Классификация (категории)</div>
            <div className={s.lossDesc}>
              Для задач «выбрать из N вариантов»: тональность, тема,
              следующий токен (языковые модели). Принимает logits (числа до softmax).
            </div>
          </div>

          <div className={s.lossCard}>
            <div className={s.lossName}>MSELoss</div>
            <div className={s.lossUse}>Регрессия (числа)</div>
            <div className={s.lossDesc}>
              Для предсказания числовых значений: цена, рейтинг, координата.
              (y - ŷ)² — штраф пропорционален квадрату ошибки.
            </div>
          </div>

          <div className={s.lossCard}>
            <div className={s.lossName}>BCELoss</div>
            <div className={s.lossUse}>Бинарная классификация</div>
            <div className={s.lossDesc}>
              Для задач да/нет: спам/не спам, токсичный/нормальный.
              BCEWithLogitsLoss = BCE + sigmoid, численно стабильнее.
            </div>
          </div>
        </div>

        <CodeHighlight lang="ts" filename="Один шаг обучения: loss → backward → step" code={`criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)

# ── Один batch ────────────────────────────────────────────────────────
model.train()                      # режим обучения (dropout активен)

optimizer.zero_grad()              # сбросить градиенты от прошлого шага

logits = model(                    # 1. Forward pass
    batch['input_ids'].to(device),
    batch['attention_mask'].to(device),
)

loss = criterion(                  # 2. Считаем loss
    logits, batch['label'].to(device)
)

loss.backward()                    # 3. Backward: autograd считает градиенты

# Gradient clipping — защита от "взрыва" градиентов
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

optimizer.step()                   # 4. Обновляем веса: w = w - lr * grad
# ─────────────────────────────────────────────────────────────────────

print(f"loss: {loss.item():.4f}") # 0.6931 в начале → 0.15 после обучения`} />
      </section>

      {/* ── 5. Full training loop ────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Полный training loop</SectionTitle>
        <p className={s.body}>
          Один шаг — это хорошо. Но обучение — это тысячи таких шагов,
          организованных в <strong>эпохи</strong> (один проход по датасету).
          Правильный цикл включает обучение + валидацию + логирование +
          сохранение лучшей модели.
        </p>

        <CodeHighlight lang="python" filename="Полный training loop с валидацией" code={`def train_epoch(model, loader, criterion, optimizer, device, scheduler=None):
    model.train()
    total_loss, correct, total = 0, 0, 0

    for batch in loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)

        optimizer.zero_grad()
        logits = model(input_ids, attention_mask)
        loss = criterion(logits, labels)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        if scheduler: scheduler.step()

        total_loss += loss.item()
        predictions = logits.argmax(dim=1)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)

    return total_loss / len(loader), correct / total


def eval_epoch(model, loader, criterion, device):
    model.eval()                                 # dropout выключен
    total_loss, correct, total = 0, 0, 0

    with torch.no_grad():                        # градиенты не считаем
        for batch in loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)

            logits = model(input_ids, attention_mask)
            loss = criterion(logits, labels)

            total_loss += loss.item()
            correct += (logits.argmax(1) == labels).sum().item()
            total += labels.size(0)

    return total_loss / len(loader), correct / total


# ── Основной цикл ─────────────────────────────────────────────────────────────

NUM_EPOCHS  = 5
best_val_loss = float('inf')
patience      = 2            # early stopping: сколько эпох ждать улучшения
patience_cnt  = 0

from transformers import get_cosine_schedule_with_warmup

total_steps = len(train_loader) * NUM_EPOCHS
scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=total_steps // 10,   # 10% на warmup
    num_training_steps=total_steps,
)

for epoch in range(1, NUM_EPOCHS + 1):
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device, scheduler)
    val_loss,   val_acc   = eval_epoch(model, val_loader, criterion, device)

    print(f"Epoch {epoch:02d} | train_loss: {train_loss:.4f} acc: {train_acc:.3f} | val_loss: {val_loss:.4f} acc: {val_acc:.3f}")

    # Сохраняем лучшую модель
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        patience_cnt  = 0
        torch.save(model.state_dict(), "best_model.pt")
        print("  ✓ saved best model")
    else:
        patience_cnt += 1
        if patience_cnt >= patience:
            print("  ⚠ Early stopping triggered")
            break`} />
      </section>

      {/* ── 6. Simulator ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Симулятор: train loss vs val loss</SectionTitle>
        <p className={s.body}>
          Главный инструмент диагностики — график потерь. По нему можно
          понять, что происходит с обучением, не читая логи. Попробуй три
          сценария:
        </p>

        <TrainingSimulator />
      </section>

      {/* ── 7. Гиперпараметры ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Ключевые гиперпараметры</SectionTitle>
        <p className={s.body}>
          <strong>Гиперпараметры</strong> — это настройки обучения, которые ты
          выбираешь заранее (в отличие от весов, которые модель узнаёт сама).
          Вот самые важные:
        </p>

        <div className={s.hparamsList}>
          <div className={s.hparam}>
            <div className={s.hparamName}>learning_rate</div>
            <div className={s.hparamTypical}>Типично: 1e-4 — 5e-4 (LoRA), 1e-5 — 5e-5 (full)</div>
            <div className={s.hparamDesc}>
              Размер шага при обновлении весов. Слишком большой — обучение
              нестабильно, val_loss скачет. Слишком маленький — долго,
              может застрять в локальном минимуме.
            </div>
          </div>

          <div className={s.hparam}>
            <div className={s.hparamName}>batch_size</div>
            <div className={s.hparamTypical}>Типично: 16–64 (ограничено VRAM)</div>
            <div className={s.hparamDesc}>
              Больше batch — стабильнее градиент, но нужно больше памяти.
              Если VRAM не хватает — используй{' '}
              <code>gradient_accumulation_steps</code>: копи градиенты
              N батчей, потом делай один шаг.
            </div>
          </div>

          <div className={s.hparam}>
            <div className={s.hparamName}>num_epochs</div>
            <div className={s.hparamTypical}>Типично: 3–10 (fine-tuning), сотни/тысячи (с нуля)</div>
            <div className={s.hparamDesc}>
              Сколько раз пройти по датасету. Слишком много → overfitting.
              Используй early stopping: останавливай когда val_loss
              не улучшается N эпох подряд.
            </div>
          </div>

          <div className={s.hparam}>
            <div className={s.hparamName}>warmup_steps</div>
            <div className={s.hparamTypical}>Типично: 5–10% от total_steps</div>
            <div className={s.hparamDesc}>
              Learning rate растёт с 0 до max за первые N шагов. Нужен
              потому что в начале веса случайные — большой lr сразу
              может отправить модель в плохую область.
            </div>
          </div>

          <div className={s.hparam}>
            <div className={s.hparamName}>weight_decay</div>
            <div className={s.hparamTypical}>Типично: 0.01–0.1</div>
            <div className={s.hparamDesc}>
              Регуляризация: каждый шаг веса немного уменьшаются.
              Предотвращает рост очень больших весов, борется с
              overfitting. Передаётся в AdamW как параметр.
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. GPU и оптимизация памяти ──────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>GPU и экономия памяти</SectionTitle>
        <p className={s.body}>
          Обучение требует GPU — CPU слишком медленный. Несколько техник
          позволяют обучать большие модели на меньшей памяти:
        </p>

        <div className={s.gpuTricks}>
          <div className={s.gpuTrick}>
            <div className={s.gpuTrickName}>mixed precision (fp16/bf16)</div>
            <div className={s.gpuTrickSaving}>~2× меньше памяти</div>
            <div className={s.gpuTrickDesc}>
              Веса и активации хранятся в 16-bit вместо 32-bit.
              PyTorch autocast делает это автоматически с минимальной
              потерей точности.
            </div>
            <div className={s.gpuTrickCode}>{`from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()

with autocast():
    logits = model(...)
    loss = criterion(logits, labels)

scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()`}</div>
          </div>

          <div className={s.gpuTrick}>
            <div className={s.gpuTrickName}>gradient checkpointing</div>
            <div className={s.gpuTrickSaving}>~3-5× меньше VRAM</div>
            <div className={s.gpuTrickDesc}>
              Не хранит все активации — перевычисляет при backward pass.
              +20-30% времени, зато огромная экономия памяти.
            </div>
            <div className={s.gpuTrickCode}>{`model.gradient_checkpointing_enable()

# Или для HuggingFace:
# в TrainingArguments: gradient_checkpointing=True`}</div>
          </div>

          <div className={s.gpuTrick}>
            <div className={s.gpuTrickName}>gradient accumulation</div>
            <div className={s.gpuTrickSaving}>эффективный batch без памяти</div>
            <div className={s.gpuTrickDesc}>
              Нет памяти для batch_size=64? Обучай с batch_size=8
              и накапливай градиенты 8 шагов — эффект тот же.
            </div>
            <div className={s.gpuTrickCode}>{`ACCUMULATION_STEPS = 8

for i, batch in enumerate(loader):
    logits = model(...)
    loss = criterion(...) / ACCUMULATION_STEPS
    loss.backward()

    if (i + 1) % ACCUMULATION_STEPS == 0:
        optimizer.step()
        optimizer.zero_grad()`}</div>
          </div>
        </div>
      </section>

      {/* ── 9. Quiz ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
