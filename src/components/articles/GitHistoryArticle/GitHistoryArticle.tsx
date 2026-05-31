import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { LogExplorer } from './LogExplorer';
import { BlameExplorer } from './BlameExplorer';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitHistoryArticle.module.scss';

const DIFF_COMMANDS = [
  { cmd: 'git diff',                desc: 'Изменения в рабочей директории которые ещё не в staging (не прошли git add)' },
  { cmd: 'git diff --staged',       desc: 'Изменения в staging которые войдут в следующий коммит' },
  { cmd: 'git diff HEAD',           desc: 'Все изменения относительно последнего коммита (и staged, и unstaged)' },
  { cmd: 'git diff abc123 def456',  desc: 'Разница между двумя конкретными коммитами' },
  { cmd: 'git diff main feature',   desc: 'Разница между двумя ветками' },
];

const LOG_FLAGS = [
  { flag: '--oneline',          desc: 'Краткий формат: хэш + сообщение в одну строку. Удобно для обзора' },
  { flag: '--graph',            desc: 'Рисует ASCII-граф ветвления. Видно где ветки расходились и сливались' },
  { flag: '--all',              desc: 'Показывает все ветки, а не только текущую' },
  { flag: '-n 5',               desc: 'Последние 5 коммитов. Любое число вместо 5' },
  { flag: '--author="Иван"',    desc: 'Только коммиты конкретного автора' },
  { flag: '--since="2 weeks"',  desc: 'Коммиты за последние 2 недели. Работает: "yesterday", "2024-01-15"' },
  { flag: '--grep="fix"',       desc: 'Коммиты где в сообщении есть "fix"' },
  { flag: '-S "функция"',       desc: 'Коммиты где строка была добавлена или удалена в коде (pickaxe)' },
  { flag: '-p',                 desc: 'Показывает diff каждого коммита. Подробно, но много текста' },
];

export function GitHistoryArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. git log ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git log — читаем историю</SectionTitle>
        <p className={s.lead}>
          История коммитов — это главная ценность Git.
          <code>git log</code> показывает все коммиты от последнего к первому:
          хэш, автор, дата, сообщение.
        </p>
        <CodeHighlight lang="bash" code={`git log
# commit a3f2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
# Author: Иван Петров <ivan@example.com>
# Date:   Mon Jan 15 16:42:00 2025
#
#     feat: добавил авторизацию
#
# commit 9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0
# Author: Мария Сидорова <maria@example.com>
# ...

# Краткий и удобный формат
git log --oneline
# a3f2b1c (HEAD -> main) feat: добавил авторизацию
# 9e8d7c6 fix: исправил баг с пустым массивом
# 5b4a3f2 feat: добавил загрузку пользователей
# 2c1b0a9 initial commit

# Граф ветвления
git log --oneline --graph --all`} />
        <div className={s.flagsTable}>
          {LOG_FLAGS.map(f => (
            <div key={f.flag} className={s.flagRow}>
              <div className={s.flagName}>{f.flag}</div>
              <div className={s.flagDesc} dangerouslySetInnerHTML={{
                __html: f.desc.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Интерактив ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Изучи историю коммитов</SectionTitle>
        <p className={s.body}>
          Нажми на любой коммит — увидишь автора, дату и точные изменения в коде.
          Зелёным выделено добавленное, красным — удалённое.
        </p>
        <LogExplorer />
      </section>

      {/* ── 3. HEAD ───────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>HEAD — где ты находишься</SectionTitle>
        <p className={s.lead}>
          <strong>HEAD</strong> — специальный указатель который всегда показывает
          «где ты сейчас». Обычно HEAD указывает на ветку, а ветка указывает на последний коммит.
        </p>
        <div className={s.headDiagram}>
          <div className={s.headRow}>
            <span className={s.headPointer}>HEAD</span>
            <span className={s.headArrow}>→</span>
            <span className={s.headBranch}>main</span>
            <span className={s.headArrow}>→</span>
            <span className={s.headCommit}>a3f2b1c (последний коммит)</span>
          </div>
          <div className={s.headNote}>// когда делаешь git commit — main и HEAD автоматически сдвигаются на новый коммит</div>
        </div>
        <CodeHighlight lang="bash" code={`# Посмотреть куда указывает HEAD
cat .git/HEAD
# ref: refs/heads/main

# HEAD~1 — один коммит назад от HEAD
# HEAD~3 — три коммита назад
git log HEAD~3..HEAD --oneline  # последние 3 коммита

# @ — короткий синоним HEAD
git diff @~1 @   # разница между предпоследним и последним коммитом`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>DETACHED HEAD</div>
          <div className={s.calloutText}>
            Если переключиться на конкретный коммит (<code>git checkout a3f2b1c</code>),
            HEAD перестаёт указывать на ветку — он указывает прямо на коммит.
            Это называется <strong>detached HEAD</strong> («оторванная голова»).
            В таком режиме можно смотреть старый код, но новые коммиты не будут
            привязаны ни к какой ветке. Чтобы вернуться: <code>git checkout main</code>.
          </div>
        </div>
      </section>

      {/* ── 4. git diff ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git diff — что изменилось</SectionTitle>
        <p className={s.body}>
          <code>git diff</code> показывает точные изменения построчно.
          Строки с <code>+</code> — добавлены, с <code>-</code> — удалены, без знака — контекст.
        </p>
        <div className={s.diffTable}>
          {DIFF_COMMANDS.map(d => (
            <div key={d.cmd} className={s.diffRow}>
              <div className={s.diffCmd}>{d.cmd}</div>
              <div className={s.diffDesc}>{d.desc}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="bash" code={`git diff HEAD~1
# diff --git a/auth.js b/auth.js
# --- a/auth.js          ← было
# +++ b/auth.js          ← стало
# @@ -12,6 +12,8 @@    ← строки 12-17 в старом, 12-19 в новом
#  function init() {
# +  setupAuth();         ← добавлено
# +  checkToken();        ← добавлено
#  }`} />
      </section>

      {/* ── 5. git show ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git show — смотрим конкретный коммит</SectionTitle>
        <p className={s.body}>
          <code>git show</code> — это <code>git log</code> + <code>git diff</code> для одного коммита.
          Показывает метаданные и все изменения.
        </p>
        <CodeHighlight lang="bash" code={`# Последний коммит
git show

# Конкретный коммит по хэшу (достаточно первых 4-7 символов)
git show a3f2b1c

# Только список изменённых файлов без diff
git show --stat a3f2b1c
# feat: добавил авторизацию
#  auth.js    | 12 ++++++++++
#  index.html | 3 +++
#  2 files changed, 15 insertions(+)

# Содержимое конкретного файла в конкретном коммите
git show a3f2b1c:auth.js`} />
      </section>

      {/* ── 6. Поиск в истории ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Поиск: кто что когда менял</SectionTitle>
        <p className={s.body}>
          История бесполезна если по ней нельзя найти нужное.
          Git умеет искать по сообщениям, по коду и по строкам файла.
        </p>
        <CodeHighlight lang="bash" code={`# Когда появилась функция fetchUsers?
git log -S "fetchUsers" --oneline
# 5b4a3f2 feat: добавил загрузку пользователей

# Кто последний трогал каждую строку файла?
git blame auth.js
# a3f2b1c (Иван  15 янв 16:42) function setupAuth() {
# 9e8d7c6 (Мария 14 янв 11:20)   validateToken();
# 2c1b0a9 (Иван  12 янв 14:00) }

# Найти коммит который сломал что-то — бинарный поиск по истории
git bisect start
git bisect bad           # текущий коммит сломан
git bisect good 2c1b0a9  # этот коммит работал
# Git сам переключается между коммитами, ты говоришь good/bad
# Находит сломавший коммит за log₂(n) шагов`} />
        <Callout variant="info">
          <code>git blame</code> часто воспринимают как инструмент для поиска виноватых.
          На практике это инструмент для понимания контекста: почему эта строка такая,
          в каком коммите появилась, с каким PR связана. Используй для понимания кода, не для обвинений.
        </Callout>
      </section>

      {/* ── 7. blame интерактив ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй: git blame</SectionTitle>
        <p className={s.body}>
          Кликни на любую строку — увидишь кто её написал, в каком коммите и когда.
          Подсветятся все строки из того же коммита.
        </p>
        <BlameExplorer />
      </section>

      {/* ── 8. git reflog ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git reflog — история HEAD</SectionTitle>
        <p className={s.lead}>
          <strong>reflog</strong> — секретный журнал всех перемещений HEAD.
          Даже если ты «потерял» коммиты после <code>reset --hard</code> или
          переключения веток — reflog помнит всё. Это страховка от большинства
          ошибок в Git.
        </p>
        <CodeHighlight lang="bash" code={`git reflog
# a3f2b1c (HEAD -> main) HEAD@{0}: commit: feat: добавил авторизацию
# 9e8d7c6               HEAD@{1}: commit: fix: исправил баг
# 5b4a3f2               HEAD@{2}: commit: feat: загрузка пользователей
# 2c1b0a9               HEAD@{3}: commit (initial): initial commit
# a3f2b1c               HEAD@{4}: checkout: moving from feature to main`} />
        <p className={s.body}>
          Каждая строка — одно перемещение HEAD: коммит, checkout, merge, reset.
          <code>HEAD@{'{0}'}</code> — текущее, <code>HEAD@{'{1}'}</code> — предыдущее и так далее.
        </p>
        <CodeHighlight lang="bash" code={`# Сценарий: случайно сделал reset --hard и «потерял» последний коммит
git reset --hard HEAD~1   # ой, откатил лишнее

# reflog покажет куда HEAD был до reset
git reflog
# 9e8d7c6 HEAD@{0}: reset: moving to HEAD~1
# a3f2b1c HEAD@{1}: commit: feat: добавил авторизацию  ← вот он

# Возвращаемся к потерянному коммиту
git reset --hard a3f2b1c  # или: git reset --hard HEAD@{1}
# HEAD is now at a3f2b1c feat: добавил авторизацию`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>REFLOG ЖИВЁТ 90 ДНЕЙ</div>
          <div className={s.calloutText}>
            По умолчанию reflog хранит записи 90 дней. После этого старые записи
            удаляются при <code>git gc</code>. Если ты потерял коммит — действуй быстро,
            reflog точно его помнит. <code>git reflog expire</code> управляет временем хранения.
          </div>
        </div>
        <p className={s.body}>
          reflog — <strong>локальный</strong>: он есть только у тебя на машине, не синхронизируется с GitHub.
          Это значит что он может спасти твою локальную работу, но не поможет восстановить
          коммиты которые никогда не были на удалённом репозитории у коллеги.
        </p>
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
