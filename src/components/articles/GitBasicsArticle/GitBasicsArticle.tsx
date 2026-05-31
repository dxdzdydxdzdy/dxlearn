import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { SnapshotDemo } from './SnapshotDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './GitBasicsArticle.module.scss';

export function GitBasicsArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Проблема ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Жизнь без Git</SectionTitle>
        <p className={s.lead}>
          Ты правишь файл. Что-то пошло не так — хочешь вернуться назад,
          но Ctrl+Z уже не помогает. Или делаешь большую правку, а потом понимаешь
          что старая версия была лучше. Или работаешь с коллегой — кто-то перезаписал чужие изменения.
        </p>
        <div className={s.chaosBox}>
          <div className={s.chaosLabel}>// типичная папка без системы контроля версий</div>
          <div className={s.fileList}>
            {[
              { name: 'index.js',               cls: '' },
              { name: 'index_old.js',            cls: 'ques' },
              { name: 'index_backup.js',         cls: 'ques' },
              { name: 'index_FINAL.js',          cls: 'ques' },
              { name: 'index_FINAL_v2.js',       cls: 'ques' },
              { name: 'index_FINAL_v2_REAL.js',  cls: 'bad'  },
              { name: 'index_Masha.js',          cls: 'bad'  },
              { name: 'index_dont_delete!!.js',  cls: 'bad'  },
            ].map(f => (
              <div key={f.name} className={`${s.chaosFile} ${f.cls ? s[f.cls as 'bad' | 'ques'] : ''}`}>
                {f.name}
              </div>
            ))}
          </div>
        </div>
        <p className={s.body}>
          Git решает всё это: хранит полную историю изменений, позволяет вернуться
          в любой момент и даёт инструменты для совместной работы без хаоса.
        </p>
      </section>

      {/* ── 2. Что такое Git ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Git — машина времени для кода</SectionTitle>
        <p className={s.lead}>
          Git — это <strong>система контроля версий</strong>.
          Она следит за изменениями в файлах и позволяет в любой момент
          посмотреть как выглядел проект в прошлом, кто что менял и почему.
        </p>
        <p className={s.body}>
          Вместо папки с копиями — история коммитов. Каждый коммит — это
          точка сохранения с описанием что изменилось.
          Можно вернуться к любой из них, сравнить, разветвиться.
        </p>
        <div className={s.conceptGrid}>
          {[
            {
              num: '01',
              title: 'История',
              desc: 'Каждое изменение фиксируется с автором, временем и описанием. Видно кто что менял и зачем.',
            },
            {
              num: '02',
              title: 'Откат',
              desc: 'Сломал что-то? Одна команда — и проект возвращается в рабочее состояние. Без потери остального.',
            },
            {
              num: '03',
              title: 'Совместная работа',
              desc: 'Несколько человек работают параллельно. Git помогает объединить изменения.',
            },
          ].map(c => (
            <div key={c.num} className={s.conceptCard}>
              <div className={s.conceptNum}>{c.num}</div>
              <div className={s.conceptTitle}>{c.title}</div>
              <div className={s.conceptDesc}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Снапшоты ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как Git хранит данные: снапшоты, а не дельты</SectionTitle>
        <p className={s.lead}>
          Многие думают, что Git хранит «что изменилось» — дельты между версиями.
          На самом деле — иначе. Git делает <strong>снапшот</strong> (фотографию)
          всего проекта при каждом коммите.
        </p>
        <p className={s.body}>
          Если файл не изменился — Git не копирует его заново, а просто ставит ссылку на
          предыдущую версию. Это эффективно по месту, но концептуально — каждый коммит
          это полное состояние проекта, а не «патч» от предыдущего.
        </p>
        <p className={s.body}>
          Нажми на любой коммит ниже — увидишь снапшот проекта в тот момент времени.
          Обрати внимание: у каждого файла есть статус — новый, изменён или не тронут.
        </p>
        <SnapshotDemo />
        <div className={s.callout}>
          <div className={s.calloutLabel}>ПОЧЕМУ ЭТО ВАЖНО</div>
          <div className={s.calloutText}>
            Благодаря снапшотам Git может мгновенно показать состояние проекта
            на любой момент истории — не нужно «проигрывать» все изменения с начала.
            <strong> git checkout</strong> на старый коммит — и у тебя точная копия
            того что было тогда. Это фундамент для веток, отката и сравнения.
          </div>
        </div>
      </section>

      {/* ── 4. Распределённый ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Распределённый: у каждого — полная копия</SectionTitle>
        <p className={s.body}>
          Раньше были централизованные системы (SVN, CVS): вся история на сервере,
          разработчики скачивают только файлы. Без сервера — работа невозможна.
        </p>
        <p className={s.body}>
          Git — <strong>распределённый</strong>. Когда ты клонируешь репозиторий,
          ты получаешь не просто файлы — а <em>всю историю целиком</em>.
          GitHub или GitLab — это просто удобное место для синхронизации,
          а не единственный источник правды.
        </p>
        <div className={s.compare}>
          <div className={s.compareCard}>
            <div className={s.compareHead} style={{ color: '#ff7b72' }}>SVN — централизованный</div>
            <div className={s.compareBody}>
              <div className={`${s.compareItem} ${s.con}`}>История только на сервере</div>
              <div className={`${s.compareItem} ${s.con}`}>Нет интернета — нет работы</div>
              <div className={`${s.compareItem} ${s.con}`}>Сервер упал — потеряли историю</div>
              <div className={`${s.compareItem} ${s.pro}`}>Проще концептуально</div>
            </div>
          </div>
          <div className={s.compareCard}>
            <div className={s.compareHead} style={{ color: '#00e5a0' }}>Git — распределённый</div>
            <div className={s.compareBody}>
              <div className={`${s.compareItem} ${s.pro}`}>Полная история у каждого</div>
              <div className={`${s.compareItem} ${s.pro}`}>Работаешь офлайн — коммиты, история</div>
              <div className={`${s.compareItem} ${s.pro}`}>Сервер упал — данные у всех</div>
              <div className={`${s.compareItem} ${s.con}`}>Концепция сложнее для новичков</div>
            </div>
          </div>
        </div>
        <Callout variant="info">
          GitHub, GitLab, Bitbucket — это не Git. Это хостинг для Git-репозиториев
          с удобным интерфейсом, pull request-ами и CI/CD. Git — инструмент,
          который работает локально. GitHub — место для синхронизации и совместной работы.
        </Callout>
      </section>

      {/* ── 5. Установка и настройка ─────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Установка и первоначальная настройка</SectionTitle>
        <CodeHighlight lang="bash" code={`# macOS (через Homebrew)
brew install git

# Ubuntu / Debian
sudo apt install git

# Windows — скачай с git-scm.com

# Проверь что установлен
git --version
# git version 2.44.0`} />

        <p className={s.body}>
          После установки — обязательно представиться. Git прикрепляет имя и email
          к каждому коммиту. Это не авторизация — просто метаданные в истории.
        </p>
        <div className={s.configSteps}>
          {[
            {
              num: '1',
              title: 'Имя и email',
              code: `git config --global user.name "Иван Петров"
git config --global user.email "ivan@example.com"`,
              note: '--global означает для всех репозиториев на этом компьютере. Без --global — только для текущего репозитория.',
            },
            {
              num: '2',
              title: 'Редактор (необязательно)',
              code: `# Git иногда открывает редактор для сообщений коммитов
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "nano"          # или nano`,
              note: 'По умолчанию — vim. Если не знаешь vim, лучше сменить.',
            },
            {
              num: '3',
              title: 'Проверь настройки',
              code: `git config --list
# user.name=Иван Петров
# user.email=ivan@example.com
# ...`,
              note: '',
            },
          ].map(step => (
            <div key={step.num} className={s.configStep}>
              <div className={s.configNum}>{step.num}</div>
              <div className={s.configBody}>
                <div className={s.configTitle}>{step.title}</div>
                <CodeHighlight lang="bash" code={step.code} />
                {step.note && <div className={s.configNote}>{step.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Итог ──────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что мы узнали</SectionTitle>
        <p className={s.body}>
          <strong>Git</strong> — система контроля версий, которая хранит историю изменений
          проекта в виде снапшотов. Каждый коммит — точка сохранения с автором,
          временем и описанием. У каждого разработчика — полная копия всей истории.
        </p>
        <p className={s.body}>
          В следующей статье — практика: создаём первый репозиторий,
          делаем первый коммит и разбираемся с тремя зонами Git которые путают всех.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>ГЛАВНЫЕ ТЕРМИНЫ</div>
          <div className={s.calloutText}>
            <strong>Репозиторий</strong> — папка с проектом + история всех изменений (хранится в скрытой папке <code>.git</code>)<br />
            <strong>Коммит</strong> — снапшот состояния проекта с метаданными<br />
            <strong>Клонировать</strong> — скачать репозиторий целиком включая всю историю<br />
            <strong>GitHub/GitLab</strong> — хостинг для репозиториев, не сам Git
          </div>
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
