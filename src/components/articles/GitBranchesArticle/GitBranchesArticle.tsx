import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BranchVisualizer } from './BranchVisualizer';
import { ConflictResolver } from './ConflictResolver';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitBranchesArticle.module.scss';

// ── Static merge diagrams ─────────────────────────────────────────────────────

const FF_ASCII = `# Ситуация: main не добавляла коммитов после расхождения
# feature ушла вперёд по прямой цепочке

  C0 ── C1 ── C2
  ↑main        ↑feature

# git merge feature → fast-forward, main просто сдвигается
  C0 ── C1 ── C2
              ↑main ↑feature   (merge-коммита нет)`;

const THREE_WAY_ASCII = `# Ситуация: и main, и feature добавляли коммиты
#
#   C0 ── C3              ← main
#    \\         \\
#     C1 ── C2  M (merge commit)
#              ↑feature

# git merge feature → создаётся merge-коммит M
# M имеет двух родителей: C3 (из main) и C2 (из feature)
# git log покажет: "Merge branch 'feature'"`;

export function GitBranchesArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое ветка ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Ветка — это просто указатель</SectionTitle>
        <p className={s.lead}>
          В Git <strong>ветка не хранит файлы</strong>. Ветка — это текстовый файл
          внутри <code>.git/refs/heads/</code>, который содержит один хэш коммита.
          Всё. Создать ветку означает создать файл с 40 символами.
        </p>
        <div className={s.twoCols}>
          <div className={s.factCard}>
            <div className={s.factLabel}>// как хранится</div>
            <div className={s.factText}>
              Ветка <code>main</code> — это файл <code>.git/refs/heads/main</code>,
              внутри которого один хэш: <code>a1b2c3d4...</code>
            </div>
          </div>
          <div className={s.factCard}>
            <div className={s.factLabel}>// создание = мгновенно</div>
            <div className={s.factText}>
              Git не копирует файлы при создании ветки. Просто создаётся
              новый файл-указатель. 10 000 файлов в проекте — всё равно мгновенно.
            </div>
          </div>
        </div>
        <CodeHighlight lang="bash" code={`# Посмотреть что внутри ветки
cat .git/refs/heads/main
# a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0

# Это тот же хэш что показывает git log
git log --oneline -1
# a1b2c3d (HEAD -> main) initial commit`} />
      </section>

      {/* ── 2. Визуализатор ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как работают ветки — пошаговая визуализация</SectionTitle>
        <p className={s.body}>
          Пройди все шаги: от создания ветки до слияния.
          Смотри как перемещается HEAD и куда указывают ветки после каждой команды.
        </p>
        <BranchVisualizer />
      </section>

      {/* ── 3. Команды ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Команды для работы с ветками</SectionTitle>
        <div className={s.cmdTable}>
          {[
            { cmd: 'git branch',                   desc: 'Список всех локальных веток. * отмечает текущую' },
            { cmd: 'git branch feature',            desc: 'Создать ветку feature от текущего коммита' },
            { cmd: 'git branch feature abc123',     desc: 'Создать ветку feature от конкретного коммита' },
            { cmd: 'git switch feature',            desc: 'Переключиться на ветку feature (современный способ)' },
            { cmd: 'git switch -c feature',         desc: 'Создать ветку и сразу переключиться (самое частое)' },
            { cmd: 'git branch -d feature',         desc: 'Удалить влитую ветку (-D удалит даже если не влита)' },
            { cmd: 'git branch -m old new',         desc: 'Переименовать ветку old в new' },
            { cmd: 'git branch -a',                 desc: 'Показать и локальные, и удалённые ветки' },
          ].map(row => (
            <div key={row.cmd} className={s.cmdRow}>
              <div className={s.cmdCell}>{row.cmd}</div>
              <div className={s.cmdDesc}>{row.desc}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="bash" code={`# Типичный рабочий процесс
git switch -c feature/login   # создать ветку и переключиться
# ... работаешь, делаешь коммиты ...
git switch main               # вернуться на main
git merge feature/login       # слить результат

# Старый способ (checkout) — тоже работает
git checkout -b feature/login  # = git switch -c feature/login
git checkout main`} />
        <Callout variant="info">
          <code>git switch</code> появился в Git 2.23 (2019) как чистая замена <code>git checkout</code>
          для переключения веток. <code>git checkout</code> делает слишком много вещей сразу —
          переключает ветки, восстанавливает файлы, создаёт ветки. <code>git switch</code> делает
          только одно и его проще запомнить.
        </Callout>
      </section>

      {/* ── 4. Merge: fast-forward ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git merge: fast-forward vs 3-way</SectionTitle>
        <p className={s.lead}>
          Когда делаешь <code>git merge feature</code>, Git выбирает стратегию:
          если история линейная — <strong>fast-forward</strong>, если ветки расходились — <strong>3-way merge</strong>.
        </p>
        <CodeHighlight lang="bash" code={FF_ASCII} />
        <CodeHighlight lang="bash" code={THREE_WAY_ASCII} />
        <div className={s.mergeTable}>
          <div className={s.mergeRow}>
            <div className={s.mergeHead}>Fast-forward</div>
            <div className={s.mergeHead}>3-way merge</div>
          </div>
          <div className={s.mergeRow}>
            <div className={s.mergeCell}>main не добавляла коммитов после расхождения</div>
            <div className={s.mergeCell}>обе ветки добавляли коммиты независимо</div>
          </div>
          <div className={s.mergeRow}>
            <div className={s.mergeCell}>merge-коммит не создаётся, main сдвигается</div>
            <div className={s.mergeCell}>создаётся merge-коммит с двумя родителями</div>
          </div>
          <div className={s.mergeRow}>
            <div className={s.mergeCell}><code>git merge --no-ff feature</code> запрещает fast-forward</div>
            <div className={s.mergeCell}>возможен конфликт если одни строки изменены в обоих</div>
          </div>
        </div>
        <CodeHighlight lang="bash" code={`# Запретить fast-forward — всегда создавать merge-коммит
git merge --no-ff feature
# Это популярно в командах: история явно показывает все слияния веток`} />
      </section>

      {/* ── 5. Конфликты ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Конфликты: почему возникают</SectionTitle>
        <p className={s.lead}>
          Конфликт возникает когда <strong>оба</strong> коммита изменили одну и ту же строку
          по-разному. Git не знает чей вариант правильный — он помечает конфликт маркерами
          и ждёт пока ты сам выберешь.
        </p>
        <CodeHighlight lang="bash" code={`# Пример конфликта в файле auth.js:

<<<<<<< HEAD                          ← наш вариант (текущая ветка)
function authenticate(user) {
  if (!user.token) return false;
=======                               ← разделитель
async function authenticate(user) {
  if (!user || !user.token) return false;
>>>>>>> feature/auth-update           ← их вариант (сливаемая ветка)

# Нужно: удалить маркеры, оставить нужный код, потом git add`} />
        <div className={s.twoCols}>
          <div className={s.warnCard}>
            <div className={s.warnLabel}>// что НЕ делать</div>
            <div className={s.warnText}>
              Никогда не коммить файл с маркерами конфликта (<code>{'<<<'}</code>, <code>{'==='}</code>, <code>{'>>>'}</code>).
              Это сломает код. Всегда разреши конфликт и убедись что файл валидный.
            </div>
          </div>
          <div className={s.infoCard}>
            <div className={s.infoLabel}>// как выйти из merge</div>
            <div className={s.infoText}>
              Если передумал сливать — <code>git merge --abort</code> отменит merge
              и вернёт всё в состояние до команды.
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Резолвер конфликтов ──────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: разреши конфликт</SectionTitle>
        <p className={s.body}>
          Слева — файл с двумя конфликтами после <code>git merge</code>.
          Выбери для каждого конфликта чей вариант оставить — справа появится итоговый файл.
        </p>
        <ConflictResolver />
      </section>

      {/* ── 7. merge vs rebase ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>merge vs rebase — когда что</SectionTitle>
        <p className={s.body}>
          <code>git merge</code> — не единственный способ интегрировать изменения.
          <code>git rebase</code> переписывает историю, перемещая коммиты ветки поверх цели.
        </p>
        <CodeHighlight lang="bash" code={`# merge: сохраняет историю как есть, создаёт merge-коммит
git switch main
git merge feature
# История: C0 - C3 - M (merge-коммит)
#               \\  /
#            C1 - C2

# rebase: переписывает коммиты feature поверх main
git switch feature
git rebase main
# История: C0 - C3 - C1' - C2' (линейная, без merge-коммита)
# Коммиты C1' и C2' — копии с новыми хэшами`} />
        <div className={s.twoCols}>
          <div className={s.factCard}>
            <div className={s.factLabel}>// merge — когда выбрать</div>
            <div className={s.factText}>
              Публичные ветки (main, develop). Когда важно сохранить когда и что было слито.
              Никогда не переписывает хэши.
            </div>
          </div>
          <div className={s.factCard}>
            <div className={s.factLabel}>// rebase — когда выбрать</div>
            <div className={s.factText}>
              Локальные feature-ветки перед push. Чистая линейная история.
              <strong> Никогда не rebase публичных веток</strong> — меняет хэши, ломает историю у других.
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Рабочий процесс ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Feature branch workflow</SectionTitle>
        <p className={s.body}>
          Самый распространённый способ работы в команде: каждая задача — отдельная ветка.
        </p>
        <div className={s.workflow}>
          {[
            {
              num: '1',
              title: 'Создай ветку от main',
              code: 'git switch -c feature/login-form',
              desc: 'Имя ветки — описание задачи. Принято: feature/, fix/, hotfix/, chore/.',
            },
            {
              num: '2',
              title: 'Работай и коммить',
              code: 'git add .\ngit commit -m "feat: add login form"',
              desc: 'Коммить часто, маленькими логическими кусками. На ветке никто не мешает.',
            },
            {
              num: '3',
              title: 'Подтяни изменения из main',
              code: 'git switch main && git pull\ngit switch feature/login-form\ngit merge main',
              desc: 'Пока ты работал — main могла уйти вперёд. Обнови ветку чтобы избежать конфликтов позже.',
            },
            {
              num: '4',
              title: 'Открой Pull Request',
              code: 'git push origin feature/login-form',
              desc: 'PR — запрос на слияние в GitHub/GitLab. Коллеги ревьюят код, потом мержат в main.',
            },
            {
              num: '5',
              title: 'Удали ветку после merge',
              code: 'git branch -d feature/login-form',
              desc: 'Слитая ветка больше не нужна. GitHub обычно предлагает удалить автоматически.',
            },
          ].map(step => (
            <div key={step.num} className={s.wfStep}>
              <div className={s.wfNum}>{step.num}</div>
              <div className={s.wfBody}>
                <div className={s.wfTitle}>{step.title}</div>
                <div className={s.wfCode}>{step.code}</div>
                <div className={s.wfDesc}>{step.desc}</div>
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
