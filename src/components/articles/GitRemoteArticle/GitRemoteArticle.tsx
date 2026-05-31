import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { RemoteVisualizer } from './RemoteVisualizer';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitRemoteArticle.module.scss';

export function GitRemoteArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое remote ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Remote — репозиторий в сети</SectionTitle>
        <p className={s.lead}>
          До сих пор всё что ты делал с Git было <strong>локальным</strong> —
          только на твоей машине. Remote — это копия репозитория где-то в сети.
          GitHub, GitLab, Bitbucket — сервисы которые хранят remote-репозитории
          и добавляют вокруг них инфраструктуру: PR, issues, CI/CD.
        </p>
        <div className={s.twoCols}>
          <div className={s.factCard}>
            <div className={s.factLabel}>// зачем нужен remote</div>
            <div className={s.factText}>
              Резервная копия, совместная работа, деплой. Без remote твой код живёт
              только на одном компьютере — это риск и изоляция.
            </div>
          </div>
          <div className={s.factCard}>
            <div className={s.factLabel}>// GitHub ≠ Git</div>
            <div className={s.factText}>
              Git — это инструмент, протокол. GitHub — один из многих хостингов.
              Git работает и без GitHub: можно хранить remote на своём сервере,
              в S3, в локальной сети.
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. git clone ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git clone — скопировать репозиторий</SectionTitle>
        <p className={s.body}>
          Клонирование делает три вещи за один шаг: скачивает все коммиты и ветки,
          создаёт папку с рабочей директорией и настраивает remote с именем <code>origin</code>.
        </p>
        <CodeHighlight lang="bash" code={`# Клонировать публичный репозиторий
git clone https://github.com/user/repo.git

# Клонировать в конкретную папку
git clone https://github.com/user/repo.git my-folder

# Клонировать по SSH (нужен SSH-ключ, зато не надо вводить пароль)
git clone git@github.com:user/repo.git

# После клонирования:
cd repo
git remote -v
# origin  https://github.com/user/repo.git (fetch)
# origin  https://github.com/user/repo.git (push)`} />
        <Callout variant="info">
          После клонирования Git автоматически создаёт <strong>tracking branch</strong>:
          локальная ветка <code>main</code> привязана к <code>origin/main</code>.
          Это значит <code>git pull</code> и <code>git push</code> знают откуда тянуть
          и куда пушить — без лишних аргументов.
        </Callout>
      </section>

      {/* ── 3. Визуализатор ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как работают push, fetch и pull</SectionTitle>
        <p className={s.body}>
          Пройди все шаги: клонирование, локальный коммит, push, изменение от коллеги,
          fetch и merge. Смотри как данные движутся между LOCAL и GITHUB.
        </p>
        <RemoteVisualizer />
        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={`${s.legendTag} ${s.tagLocal}`}>main</span>
            <span className={s.legendDesc}>локальная ветка</span>
          </div>
          <div className={s.legendItem}>
            <span className={`${s.legendTag} ${s.tagTracking}`}>origin/main</span>
            <span className={s.legendDesc}>локальная копия состояния remote</span>
          </div>
        </div>
      </section>

      {/* ── 4. git remote ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git remote — управление remote-адресами</SectionTitle>
        <p className={s.body}>
          Remote — это просто имя + URL. <code>origin</code> создаётся автоматически при клонировании.
          Можно иметь несколько remote — например, отдельный для staging-сервера.
        </p>
        <div className={s.cmdTable}>
          {[
            { cmd: 'git remote -v',                          desc: 'Показать все remote: имя + URL (fetch и push могут различаться)' },
            { cmd: 'git remote add origin <url>',            desc: 'Добавить remote с именем origin — если репозиторий создан локально' },
            { cmd: 'git remote add staging <url>',           desc: 'Добавить второй remote — можно пушить в разные места' },
            { cmd: 'git remote rename origin upstream',      desc: 'Переименовать remote' },
            { cmd: 'git remote remove staging',              desc: 'Удалить remote (только запись, репозиторий не удаляется)' },
            { cmd: 'git remote set-url origin <new-url>',   desc: 'Изменить URL remote — нужно при смене домена или переходе HTTP → SSH' },
          ].map(row => (
            <div key={row.cmd} className={s.cmdRow}>
              <div className={s.cmdCell}>{row.cmd}</div>
              <div className={s.cmdDesc}>{row.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. push ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git push — отправить коммиты</SectionTitle>
        <p className={s.body}>
          Push отправляет коммиты из локальной ветки в remote. Если ветка новая —
          нужно указать upstream при первом push.
        </p>
        <CodeHighlight lang="bash" code={`# Обычный push (когда upstream уже настроен)
git push

# Первый push новой ветки — установить upstream
git push -u origin feature/login
# Теперь git push и git pull работают без аргументов

# Push в конкретный remote и ветку
git push origin main

# Удалить ветку на remote
git push origin --delete feature/old-branch

# Force push — ОПАСНО для общих веток
git push --force-with-lease  # безопаснее чем --force`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>// force push на общих ветках</div>
          <div className={s.warnText}>
            <code>git push --force</code> перезаписывает историю remote. Если коллеги уже
            взяли коммиты которые ты удаляешь — у них сломается история.
            Используй <code>--force-with-lease</code>: он отклонит force push если
            кто-то успел запушить после тебя. На <code>main</code> лучше никогда не форс-пушить.
          </div>
        </div>
      </section>

      {/* ── 6. fetch vs pull ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>fetch vs pull — в чём разница</SectionTitle>
        <p className={s.lead}>
          Это самая частая точка путаницы. Запомни одну фразу:
          <strong> fetch скачивает, pull скачивает и применяет.</strong>
        </p>
        <div className={s.twoCols}>
          <div className={s.compareCard}>
            <div className={s.compareTitle}>git fetch</div>
            <ul className={s.compareList}>
              <li>Скачивает новые коммиты с remote</li>
              <li>Обновляет <code>origin/main</code></li>
              <li>Рабочая директория <strong>не меняется</strong></li>
              <li>Можно осмотреть изменения перед применением</li>
              <li>Безопасен в любой момент</li>
            </ul>
          </div>
          <div className={s.compareCard}>
            <div className={s.compareTitle}>git pull</div>
            <ul className={s.compareList}>
              <li>= <code>git fetch</code> + <code>git merge origin/main</code></li>
              <li>Скачивает и сразу вливает в текущую ветку</li>
              <li>Рабочая директория <strong>изменится</strong></li>
              <li>Могут возникнуть конфликты</li>
              <li>Удобно, но менее прозрачно</li>
            </ul>
          </div>
        </div>
        <CodeHighlight lang="bash" code={`# Вариант 1: fetch + проверка + merge
git fetch
git log HEAD..origin/main --oneline  # что нового на remote?
git diff HEAD origin/main            # что изменилось?
git merge origin/main                # теперь применяем

# Вариант 2: pull — сразу всё
git pull

# pull с rebase вместо merge (линейная история)
git pull --rebase`} />
        <Callout variant="info">
          В командах с активным remote-репозиторием лучше делать <code>git fetch</code>
          регулярно, а merge — осознанно. Так ты всегда знаешь что происходит
          до того как изменения попали в твою рабочую директорию.
        </Callout>
      </section>

      {/* ── 7. Tracking branches ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>origin/main — что это такое</SectionTitle>
        <p className={s.body}>
          <code>origin/main</code> — это не ветка на GitHub. Это <strong>локальная</strong> копия
          того, где находился <code>main</code> на remote в момент последнего fetch/push/pull.
          Git хранит её в <code>.git/refs/remotes/origin/main</code>.
        </p>
        <CodeHighlight lang="bash" code={`# Посмотреть все tracking branches
git branch -vv
# * main  b2c3d4 [origin/main: ahead 1] add feature
#          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
#          [origin/main: ahead 1] — ты на 1 коммит впереди remote
#          [origin/main: behind 2] — remote на 2 коммита впереди тебя
#          [origin/main] — синхронизированы

# Настроить tracking вручную (если нужно)
git branch --set-upstream-to=origin/main main`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>// ahead / behind</div>
          <div className={s.infoText}>
            <strong>ahead N</strong> — у тебя есть N коммитов которых нет на remote. Нужен push.<br />
            <strong>behind N</strong> — на remote есть N коммитов которых нет у тебя. Нужен pull/fetch.<br />
            <strong>ahead X, behind Y</strong> — ветки разошлись. Нужен merge или rebase, возможен конфликт.
          </div>
        </div>
      </section>

      {/* ── 8. Pull Request ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Pull Request — запрос на слияние</SectionTitle>
        <p className={s.body}>
          Pull Request (PR) — это функция GitHub (не Git). Ты пушишь feature-ветку,
          открываешь PR — и просишь влить её в main. Коллеги ревьюят код, оставляют
          комментарии, потом GitHub делает merge.
        </p>
        <CodeHighlight lang="bash" code={`# Типичный workflow с PR:

# 1. Создать ветку и сделать коммиты
git switch -c feature/dark-mode
# ... работа ...
git commit -m "feat: add dark mode toggle"

# 2. Push ветки на GitHub
git push -u origin feature/dark-mode

# 3. GitHub покажет кнопку "Compare & pull request"
# Открываешь PR → коллеги ревьюят → merge в main

# 4. После merge — удалить ветку локально
git switch main
git pull                           # подтянуть изменения после merge
git branch -d feature/dark-mode    # удалить локальную ветку`} />
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
