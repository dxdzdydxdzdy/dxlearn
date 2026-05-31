import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ResetDemo } from './ResetDemo';
import { UndoExplorer } from './UndoExplorer';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitUndoArticle.module.scss';

export function GitUndoArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Три инструмента ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Три инструмента для трёх ситуаций</SectionTitle>
        <p className={s.lead}>
          Отмена в Git зависит от того <strong>где</strong> находятся изменения
          и <strong>что</strong> именно нужно отменить. Один инструмент для рабочей
          директории, другой для staging, третий для коммитов.
        </p>
        <div className={s.threeCards}>
          {[
            {
              cmd:   'git restore',
              zone:  'рабочая директория / staging',
              desc:  'Отменить изменения в файлах до последнего коммита или убрать из staging.',
              safe:  true,
            },
            {
              cmd:   'git reset',
              zone:  'коммиты (локальные)',
              desc:  'Переместить HEAD назад. Три режима: --soft, --mixed, --hard — что происходит с файлами.',
              safe:  false,
            },
            {
              cmd:   'git revert',
              zone:  'коммиты (публичные)',
              desc:  'Создать новый коммит который отменяет изменения. Безопасно для запушенных веток.',
              safe:  true,
            },
          ].map(card => (
            <div key={card.cmd} className={`${s.toolCard} ${card.safe ? '' : s.toolCardWarn}`}>
              <div className={s.toolCmd}>{card.cmd}</div>
              <div className={s.toolZone}>{card.zone}</div>
              <div className={s.toolDesc}>{card.desc}</div>
              <div className={`${s.toolSafe} ${card.safe ? s.toolSafeGreen : s.toolSafeYellow}`}>
                {card.safe ? '✓ безопасно' : '⚠ перезаписывает историю'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. git restore ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git restore — отменить в рабочей директории</SectionTitle>
        <p className={s.body}>
          <code>git restore</code> — самый безопасный инструмент. Работает только с файлами,
          коммиты не трогает.
        </p>
        <CodeHighlight lang="bash" code={`# Отменить изменения в конкретном файле (вернуть к последнему коммиту)
git restore file.js

# Отменить ВСЕ изменения в рабочей директории
git restore .

# Убрать файл из staging (отменить git add)
git restore --staged file.js

# Убрать из staging И отменить изменения в файле
git restore --staged --worktree file.js

# Восстановить файл из конкретного коммита
git restore --source HEAD~2 file.js`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>// git restore . без --staged</div>
          <div className={s.warnText}>
            <code>git restore .</code> без флагов отменяет все изменения в рабочей директории —
            безвозвратно. Убедись что в staging нет ничего важного, или используй
            <code> git restore --staged .</code> сначала.
          </div>
        </div>
      </section>

      {/* ── 3. git reset — объяснение ───────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git reset — переместить HEAD</SectionTitle>
        <p className={s.lead}>
          <code>git reset</code> перемещает HEAD (и текущую ветку) на другой коммит.
          Три флага определяют что происходит с файлами в трёх зонах.
        </p>
        <div className={s.resetTable}>
          <div className={s.resetHead}>
            <div>Флаг</div>
            <div>Репозиторий</div>
            <div>Staging</div>
            <div>Рабочая директория</div>
          </div>
          {[
            { flag:'--soft',  repo:'HEAD ← N',   staging:'сохранено + изменения из коммита', working:'не тронута', safeClass:'safe'   },
            { flag:'--mixed', repo:'HEAD ← N',   staging:'очищено',  working:'изменения из коммита попадают сюда',  safeClass:'caution'},
            { flag:'--hard',  repo:'HEAD ← N',   staging:'очищено',  working:'откат к состоянию коммита',          safeClass:'danger' },
          ].map(row => (
            <div key={row.flag} className={`${s.resetRow} ${s['reset_' + row.safeClass]}`}>
              <div className={s.resetFlag}>{row.flag}</div>
              <div className={s.resetCell}>{row.repo}</div>
              <div className={s.resetCell}>{row.staging}</div>
              <div className={s.resetCell}>{row.working}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. ResetDemo ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: soft, mixed, hard</SectionTitle>
        <p className={s.body}>
          Нажми кнопку режима и посмотри что происходит с каждой из трёх зон.
          Синим выделено что пришло из отменяемого коммита, зелёным — твои изменения, красным — потеря.
        </p>
        <ResetDemo />
      </section>

      {/* ── 5. git revert ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git revert — безопасная отмена</SectionTitle>
        <p className={s.lead}>
          <code>git revert</code> создаёт <strong>новый коммит</strong> который отменяет
          изменения выбранного. История не переписывается — именно поэтому это единственный
          правильный способ отменить уже запушенный коммит.
        </p>
        <CodeHighlight lang="bash" code={`# Отменить последний коммит (создаст новый revert-коммит)
git revert HEAD

# Отменить конкретный коммит по хэшу
git revert abc1234

# Отменить диапазон коммитов (не включая C0, включая C3)
git revert C0..C3

# Создать revert без автоматического коммита (чтобы отредактировать)
git revert --no-commit HEAD
git revert --continue

# История после revert:
# * Revert "feat: add login form"  ← новый коммит
# * feat: add login form           ← оригинал (остался в истории)
# * initial commit`} />
        <Callout variant="info">
          <code>git revert</code> оставляет "оригинальный" коммит в истории — это не баг, а фича.
          Коллеги видят что изменение было сделано и потом отменено. Это важно для прозрачности
          в командах. Если нужно "тихо" убрать коммит — только на локальных незапушенных ветках.
        </Callout>
      </section>

      {/* ── 6. UndoExplorer ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что нужно отменить? Выбери ситуацию</SectionTitle>
        <p className={s.body}>
          Выбери ситуацию из списка — увидишь нужную команду, объяснение и оценку безопасности.
        </p>
        <UndoExplorer />
      </section>

      {/* ── 7. Таблица безопасности ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что опасно, что безопасно</SectionTitle>
        <CodeHighlight lang="bash" code={`# ✅ БЕЗОПАСНО — не теряет данные, не переписывает историю
git restore --staged file.js     # убрать из staging
git revert HEAD                  # создать отменяющий коммит
git commit --amend               # поправить последний коммит (до push)

# ⚠️ ОСТОРОЖНО — меняет историю, но данные не теряются
git reset --soft HEAD~1          # вернуть коммит в staging
git reset --mixed HEAD~1         # вернуть коммит в working dir
git restore file.js              # отменяет несохранённые изменения

# 🔴 ОПАСНО — данные могут быть потеряны безвозвратно
git reset --hard HEAD~1          # откат рабочей директории
git restore .                    # отменить ВСЕ изменения
git push --force                 # перезаписать историю на remote`} />
        <Callout variant="warn">
          Главное правило: <strong>reset --hard и force push</strong> на ветках которые уже
          видели другие люди — почти всегда плохая идея. Всегда предпочитай
          <code> git revert</code> для публичных веток.
        </Callout>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
