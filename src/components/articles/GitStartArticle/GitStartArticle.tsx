import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ThreeZonesDemo } from './ThreeZonesDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitStartArticle.module.scss';

export function GitStartArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Три зоны ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Три зоны — главная концепция Git</SectionTitle>
        <p className={s.lead}>
          В Git каждый файл проходит через три состояния прежде чем попасть в историю.
          Это сбивает с толку поначалу, но именно здесь вся сила Git —
          ты сам решаешь что именно войдёт в следующий коммит.
        </p>
        <div className={s.zonesExplain}>
          {[
            {
              num: '01',
              color: '#7a9aaa',
              name: 'Рабочая директория',
              cmd: 'working directory',
              desc: 'Обычные файлы на диске. Ты их редактируешь как обычно. Git видит изменения, но ещё не фиксирует.',
            },
            {
              num: '02',
              color: '#f0c040',
              name: 'Staging Area',
              cmd: 'git add → индекс',
              desc: 'Зона подготовки. Сюда кладёшь только то, что хочешь включить в следующий коммит. Можно добавлять по одному файлу.',
            },
            {
              num: '03',
              color: '#00e5a0',
              name: 'Репозиторий',
              cmd: 'git commit → .git',
              desc: 'База данных Git. Всё что попало сюда — часть истории навсегда. Хранится в скрытой папке .git.',
            },
          ].map(z => (
            <div key={z.num} className={s.zoneCard}>
              <div className={s.zoneNum} style={{ color: z.color }}>{z.num}</div>
              <div className={s.zoneName}>{z.name}</div>
              <div className={s.zoneCmd}>{z.cmd}</div>
              <div className={s.zoneDesc}>{z.desc}</div>
            </div>
          ))}
        </div>
        <p className={s.body}>
          Зачем нужна промежуточная staging area? Она даёт контроль.
          Например, ты поправил три файла, но в коммит хочешь включить только два —
          добавляешь только их. Третий останется в рабочей директории для следующего коммита.
        </p>
      </section>

      {/* ── 2. git init ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Создаём репозиторий: git init</SectionTitle>
        <p className={s.body}>
          Чтобы Git начал следить за проектом — нужно инициализировать репозиторий.
          Это создаёт скрытую папку <code>.git</code> где хранится вся история.
        </p>
        <CodeHighlight lang="bash" code={`# Создаём папку и заходим в неё
mkdir my-project
cd my-project

# Инициализируем репозиторий
git init
# Initialized empty Git repository in /my-project/.git/

# Проверяем статус — Git уже работает
git status
# On branch main
# No commits yet
# nothing to commit`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>ЧТО ТАКОЕ .git</div>
          <div className={s.calloutText}>
            Папка <code>.git</code> — это и есть репозиторий. Внутри: все коммиты,
            ветки, конфигурация. Если удалить <code>.git</code> — удалишь всю историю,
            останутся только текущие файлы. Никогда не редактируй содержимое <code>.git</code> вручную.
          </div>
        </div>
      </section>

      {/* ── 3. git status ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git status — смотрим что происходит</SectionTitle>
        <p className={s.body}>
          Первая команда которую запускают после любого действия — <code>git status</code>.
          Она показывает в каком состоянии находятся файлы.
        </p>
        <CodeHighlight lang="bash" code={`# Создали файлы
echo "<h1>Hello</h1>" > index.html
echo "body { margin: 0 }" > style.css

git status
# Untracked files:
#   index.html
#   style.css
# (use "git add <file>..." to include in what will be committed)

# После git add index.html:
git status
# Changes to be committed:
#   new file: index.html    ← в staging, готов к коммиту
# Untracked files:
#   style.css               ← ещё не добавлен`} />
        <p className={s.body}>
          Git выводит файлы в трёх группах: <strong>Changes to be committed</strong> — в staging,
          готовы к коммиту. <strong>Changes not staged</strong> — изменены, но не добавлены.
          <strong> Untracked files</strong> — новые файлы, которые Git ещё не видит.
        </p>
      </section>

      {/* ── 4. Интерактив ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Попробуй сам: добавь файлы и сделай коммит</SectionTitle>
        <p className={s.body}>
          Слева — рабочая директория с тремя изменёнными файлами.
          Нажимай «git add» чтобы переместить их в staging, потом введи сообщение и сделай коммит.
          Попробуй закоммитить только часть файлов.
        </p>
        <ThreeZonesDemo />
      </section>

      {/* ── 5. git add ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git add — добавляем в staging</SectionTitle>
        <CodeHighlight lang="bash" code={`# Добавить один файл
git add index.html

# Добавить несколько файлов
git add index.html style.css

# Добавить все изменения в текущей папке
git add .

# Добавить все файлы с расширением .js
git add *.js

# Интерактивный режим — добавлять по кускам внутри файла
git add -p`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>НЕ ВСЕГДА НУЖЕН git add .</div>
          <div className={s.warnText}>
            <code>git add .</code> добавляет <strong>всё</strong> — включая временные файлы,
            секреты, логи. Перед этим убедись что в <code>.gitignore</code> прописано всё лишнее.
            На первых порах лучше добавлять файлы по одному — так понятнее что именно идёт в коммит.
          </div>
        </div>
      </section>

      {/* ── 6. git commit ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>git commit — фиксируем снапшот</SectionTitle>
        <p className={s.body}>
          После <code>git add</code> — фиксируем что в staging.
          Каждый коммит требует сообщения: что и зачем сделано.
        </p>
        <CodeHighlight lang="bash" code={`# Базовый коммит с сообщением
git commit -m "добавил главную страницу"

# Добавить и закоммитить уже отслеживаемые файлы за один шаг
# (новые untracked файлы всё равно нужно git add вручную)
git commit -am "обновил стили"

# Если забыл добавить файл или сделал опечатку в сообщении
git add забытый-файл.js
git commit --amend -m "правильное сообщение"

# Посмотреть историю коммитов
git log --oneline
# j0k1l2 исправил баг в навигации
# g7h8i9 добавил навигацию
# d4e5f6 добавил скрипт
# a1b2c3 первый коммит: создал проект`} />
        <Callout variant="info">
          После коммита у тебя остаётся его <strong>хэш</strong> — уникальный идентификатор вроде <code>a1b2c3d</code>.
          По нему можно вернуться к этому моменту, сравнить с другим коммитом,
          отменить именно этот коммит. Хэш генерируется автоматически из содержимого снапшота.
        </Callout>
      </section>

      {/* ── 7. Хорошие сообщения ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Хорошие сообщения коммитов</SectionTitle>
        <p className={s.body}>
          Сообщение коммита — это письмо себе из прошлого. Через год ты откроешь
          историю и поймёшь что происходило только по сообщениям.
        </p>
        <div className={s.msgGrid}>
          <div className={s.msgCol}>
            <span className={`${s.msgLabel} ${s.bad}`}>плохо</span>
            {['fix', 'wip', 'asdasd', 'обновил файлы', 'изменения', 'финальная версия'].map(m => (
              <div key={m} className={`${s.msgItem} ${s.bad}`}>{m}</div>
            ))}
          </div>
          <div className={s.msgCol}>
            <span className={`${s.msgLabel} ${s.good}`}>хорошо</span>
            {[
              'fix: исправил падение при пустом массиве',
              'feat: добавил форму регистрации',
              'refactor: упростил логику авторизации',
              'docs: обновил README',
              'style: исправил отступы в header',
            ].map(m => (
              <div key={m} className={`${s.msgItem} ${s.good}`}>{m}</div>
            ))}
          </div>
        </div>
        <p className={s.body}>
          Популярное соглашение — <strong>Conventional Commits</strong>: начинать с типа
          (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>).
          Это помогает автоматически генерировать changelog и понимать характер изменений.
        </p>
      </section>

      {/* ── 8. .gitignore ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>.gitignore — что не нужно в репозитории</SectionTitle>
        <p className={s.body}>
          Некоторые файлы не должны попадать в историю: зависимости, секреты,
          файлы сборки, временные файлы редактора. Для этого — файл <code>.gitignore</code>.
        </p>
        <CodeHighlight lang="bash" filename=".gitignore" code={`# Зависимости — устанавливаются через npm install
node_modules/

# Переменные окружения и секреты — НИКОГДА в git
.env
.env.local
.env.*.local

# Файлы сборки
dist/
build/
.next/
out/

# Логи
*.log
npm-debug.log*

# Файлы редактора
.DS_Store        # macOS
Thumbs.db        # Windows
.vscode/settings.json`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>ПАРОЛИ И КЛЮЧИ</div>
          <div className={s.warnText}>
            <strong>Никогда не коммить секреты.</strong> API-ключи, пароли, токены — всё это в <code>.env</code>,
            который в <code>.gitignore</code>. Если случайно закоммитил — считай что секрет скомпрометирован,
            даже если ты сразу удалил: в истории он остаётся навсегда.
            Нужно немедленно сменить ключ/пароль.
          </div>
        </div>
      </section>

      {/* ── 9. Рабочий цикл ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Типичный рабочий цикл</SectionTitle>
        <div className={s.workflow}>
          {[
            { num: '1', title: 'Меняешь файлы',           desc: 'Пишешь код, правишь, удаляешь — обычная работа в редакторе.' },
            { num: '2', title: 'git status',               desc: 'Смотришь что изменилось. Хорошая привычка — запускать часто.' },
            { num: '3', title: 'git add <файлы>',          desc: 'Выбираешь что войдёт в следующий коммит и отправляешь в staging.' },
            { num: '4', title: 'git commit -m "..."',      desc: 'Фиксируешь снапшот с понятным сообщением. Коммит — точка сохранения.' },
            { num: '↺', title: 'Повторяешь',              desc: 'Возвращаешься к шагу 1. Коммить часто — маленькие коммиты проще откатить и понять.' },
          ].map(step => (
            <div key={step.num} className={s.workflowStep}>
              <div className={s.workflowNum} style={{ color: step.num === '↺' ? '#7a9aaa' : '#00e5a0' }}>
                {step.num}
              </div>
              <div className={s.workflowBody}>
                <div className={s.workflowTitle}>{step.title}</div>
                <div className={s.workflowDesc}>{step.desc}</div>
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
