import { siNpm, siYarn, siPnpm } from 'simple-icons';
import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BrandIcon } from '@/components/ui/BrandIcon/BrandIcon';
import { CommandTranslator } from './CommandTranslator';
import { QUIZ_QUESTIONS } from './quizData';
import s from './PackageManagersArticle.module.scss';

const MANAGERS = [
  {
    icon: siNpm, color: '#CB3837', name: 'npm', year: '2010',
    desc: 'Идёт в комплекте с Node.js. Самый распространённый — почти все туториалы используют его.',
    pros: ['Установлен автоматически с Node.js', 'Огромное сообщество и документация', 'workspaces с npm v7+'],
    cons: ['Исторически медленнее конкурентов', 'node_modules занимает много места', 'phantom dependencies'],
  },
  {
    icon: siYarn, color: '#2C8EBB', name: 'yarn', year: '2016',
    desc: 'Создан командой Facebook как ответ на проблемы npm v3. Первым ввёл lock-файл и параллельную установку.',
    pros: ['Workspaces для монорепозиториев', 'Plug\'n\'Play режим (без node_modules)', 'Быстрее npm на крупных проектах'],
    cons: ['Нужно устанавливать отдельно', 'Два несовместимых поколения: v1 и berry (v2+)', 'PnP ломает некоторые пакеты'],
  },
  {
    icon: siPnpm, color: '#F69220', name: 'pnpm', year: '2017',
    desc: 'Радикально другой подход к хранению пакетов. Экономит гигабайты диска и устанавливает быстрее всех.',
    pros: ['Экономия места: один пакет — одна копия в системе', 'Строгая изоляция: нет phantom deps', 'Самый быстрый при повторной установке'],
    cons: ['Меньше распространён — иногда пакеты несовместимы', 'Требует отдельной установки'],
  },
];

const PKG_FIELDS = [
  { name: 'name',            desc: 'Уникальное имя пакета. Если публикуешь в npm registry — должно быть глобально уникальным.' },
  { name: 'version',         desc: 'Версия по semver: major.minor.patch. Начинай с 0.1.0, релиз — 1.0.0.' },
  { name: 'scripts',         desc: 'Команды для запуска через npm run. Например: "dev": "node server.js". Специальные: start, test, build — запускаются без run.' },
  { name: 'dependencies',    desc: 'Пакеты нужные в production. Устанавливаются всегда. Пример: express, react, axios.' },
  { name: 'devDependencies', desc: 'Только для разработки. В production не устанавливаются. Пример: jest, typescript, eslint.' },
  { name: 'main',            desc: 'Точка входа если это библиотека: какой файл загружается при import yourPackage.' },
  { name: 'engines',         desc: 'Минимальная версия Node.js: { "node": ">=18.0.0" }. npm предупредит при несовместимости.' },
  { name: 'private',         desc: 'true — запрещает случайную публикацию в npm registry. Всегда ставь для приложений.' },
];

const COMP_ROWS = [
  { criteria: 'Скорость первой установки',  npm: '⚡',     yarn: '⚡⚡',  pnpm: '⚡⚡⚡' },
  { criteria: 'Скорость повторной установки',npm: '⚡',     yarn: '⚡⚡',  pnpm: '⚡⚡⚡' },
  { criteria: 'Место на диске',              npm: '📦📦📦',  yarn: '📦📦📦', pnpm: '📦'    },
  { criteria: 'Phantom dependencies',        npm: '✗',     yarn: '✗',    pnpm: '✓'     },
  { criteria: 'Workspaces (монорепо)',        npm: '✓',     yarn: '✓✓',   pnpm: '✓✓'   },
  { criteria: 'Работа без node_modules',     npm: '✗',     yarn: '✓ PnP', pnpm: '✗'    },
  { criteria: 'Встроен в Node.js',           npm: '✓',     yarn: '✗',    pnpm: '✗'     },
];

export function PackageManagersArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое пакетный менеджер ───────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое пакетный менеджер</SectionTitle>
        <p className={s.lead}>
          Представь что ты начинаешь проект и тебе нужны готовые библиотеки:
          Express для сервера, Lodash для утилит, Jest для тестов.
          Без пакетного менеджера — ищи каждую вручную, скачивай, следи за версиями,
          обновляй вручную. С ним — одна команда, и всё установлено.
        </p>
        <p className={s.body}>
          Пакетный менеджер делает три вещи: <strong>скачивает пакеты</strong> из центрального
          реестра (registry), <strong>разрешает зависимости</strong> — пакет А зависит от пакета Б,
          Б от В, менеджер разбирается кто что требует, и <strong>фиксирует версии</strong>
          чтобы у всей команды был одинаковый набор пакетов.
        </p>
        <div className={s.callout}>
          <div className={s.calloutLabel}>NPM REGISTRY</div>
          <div className={s.calloutText}>
            Все три менеджера скачивают пакеты из одного места — <strong>npm registry</strong> (registry.npmjs.org).
            Это публичная база из 2+ миллионов пакетов. npm, yarn и pnpm — это клиенты к ней,
            не сами реестры. Разница только в том, как они управляют загруженными пакетами локально.
          </div>
        </div>
      </section>

      {/* ── 2. package.json ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>package.json — манифест проекта</SectionTitle>
        <p className={s.body}>
          Каждый JavaScript-проект начинается с <code>package.json</code>.
          Это JSON-файл, который описывает проект: название, версию, зависимости, скрипты.
          Создаётся командой <code>npm init -y</code>.
        </p>
        <CodeHighlight lang="js" filename="package.json" code={`{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev":   "node server.js",
    "build": "tsc",
    "test":  "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest":       "^29.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`} />
        <div className={s.fieldTable}>
          {PKG_FIELDS.map(f => (
            <div key={f.name} className={s.fieldRow}>
              <div className={s.fieldName}>{f.name}</div>
              <div className={s.fieldDesc} dangerouslySetInnerHTML={{
                __html: f.desc.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. dependencies vs devDependencies ───────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>dependencies и devDependencies: в чём разница</SectionTitle>
        <p className={s.body}>
          Это одна из первых вещей, которую путают новички.
          Разница принципиальная — и это влияет на размер production-сборки.
        </p>
        <CodeHighlight lang="bash" code={`# dependencies — нужны в production
npm install express          # сохраняет в dependencies
npm install react react-dom  # то же

# devDependencies — только для разработки
npm install -D typescript    # флаг -D или --save-dev
npm install -D jest eslint

# При деплое на сервер — только dependencies:
npm install --production
# или
NODE_ENV=production npm install`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>ПРОСТОЕ ПРАВИЛО</div>
          <div className={s.infoText}>
            Спроси себя: <strong>нужен ли этот пакет когда приложение работает у пользователя?</strong>
            Express — да (обрабатывает запросы). Jest — нет (тесты только при разработке).
            TypeScript — нет (компилируется до деплоя, в итоге только JS).
            Если не уверен — ставь в devDependencies, это безопаснее.
          </div>
        </div>
      </section>

      {/* ── 4. Версии и semver ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Версии пакетов: что означают ^ и ~</SectionTitle>
        <p className={s.body}>
          Версия пакета состоит из трёх чисел: <strong>major.minor.patch</strong>.
          Например, <code>4.18.2</code>: major = 4, minor = 18, patch = 2.
          Это соглашение называется <strong>semver</strong> (semantic versioning).
        </p>
        <CodeHighlight lang="bash" code={`# patch (4.18.2 → 4.18.3): баг-фикс, обратно совместимо
# minor (4.18.2 → 4.19.0): новые функции, обратно совместимо
# major (4.18.2 → 5.0.0): breaking changes, может сломать код`} />
        <div className={s.semverGrid}>
          {[
            { prefix: '^', color: '#4db8ff', example: '^4.18.0', desc: 'Разрешает minor и patch. Установит 4.19.0 или 4.18.5, но не 5.0.0. Самый распространённый.' },
            { prefix: '~', color: '#f0c040', example: '~4.18.0', desc: 'Только patch-обновления. Установит 4.18.5, но не 4.19.0. Консервативно.' },
            { prefix: '=', color: '#00e5a0', example: '4.18.0',  desc: 'Строго эта версия. Ни на что не обновится. Максимальная предсказуемость.' },
          ].map(sv => (
            <div key={sv.prefix} className={s.semverCard} style={{ borderTop: `2px solid ${sv.color}` }}>
              <div className={s.semverPrefix} style={{ color: sv.color }}>{sv.prefix}</div>
              <div className={s.semverExample}>{sv.example}</div>
              <div className={s.semverDesc}>{sv.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. package-lock.json ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>package-lock.json: зачем коммитить в git</SectionTitle>
        <p className={s.body}>
          <code>package.json</code> хранит диапазоны: <code>^4.18.0</code> — это «4.18.0 и выше».
          Сегодня установится 4.18.2, через неделю — уже 4.19.0.
          У тебя и у коллеги могут быть разные версии одного пакета.
        </p>
        <p className={s.body}>
          <code>package-lock.json</code> (или <code>yarn.lock</code> / <code>pnpm-lock.yaml</code>) —
          это точный снимок: какая версия каждого пакета и каждой транзитивной зависимости
          была установлена. Всегда коммить его в git.
        </p>
        <CodeHighlight lang="bash" code={`# npm install — установит согласно package.json,
# может обновить patch/minor версии, обновит lock-файл

# npm ci — строго по lock-файлу, не обновляет ничего.
# Удаляет node_modules и ставит заново.
# Используй в CI/CD — гарантирует воспроизводимость.

npm ci`} />
        <Callout variant="warn">
          Никогда не добавляй <code>package-lock.json</code> в <code>.gitignore</code>.
          Без него <code>npm install</code> каждый раз может давать разные результаты.
          Это называется «works on my machine» — и это баг, а не фича.
        </Callout>
      </section>

      {/* ── 6. Три менеджера ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>npm, yarn и pnpm: в чём разница</SectionTitle>
        <p className={s.lead}>
          Все три работают с одним реестром пакетов — разница в том, как они их хранят
          и насколько быстро устанавливают.
        </p>
        <div className={s.managerGrid}>
          {MANAGERS.map(m => (
            <div key={m.name} className={s.managerCard}>
              <div className={s.managerHead}>
                <BrandIcon icon={m.icon} size={20} color={m.color} />
                <span className={s.managerName} style={{ color: m.color }}>{m.name}</span>
                <span className={s.managerYear}>{m.year}</span>
              </div>
              <div className={s.managerBody}>
                <div className={s.managerDesc}>{m.desc}</div>
                <ul className={s.managerPros}>
                  {m.pros.map(p => <li key={p} className={s.managerPro}>{p}</li>)}
                  {m.cons.map(c => <li key={c} className={s.managerCon}>{c}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Phantom dependencies ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Главная скрытая проблема npm: призрачные зависимости</SectionTitle>
        <p className={s.body}>
          npm и yarn поднимают (hoist) вложенные зависимости в корневой <code>node_modules</code>
          для экономии места. Это создаёт неочевидную проблему.
        </p>
        <CodeHighlight lang="js" code={`// Твой package.json зависит только от пакета A
// A внутри зависит от lodash

// node_modules после npm install:
// node_modules/
//   A/
//   lodash/  ← поднят из A/node_modules/ в корень!

// Твой код:
import _ from 'lodash'; // ← РАБОТАЕТ, хотя ты не ставил lodash!

// Проблема:
// Завтра A обновится и перестанет использовать lodash.
// npm удалит lodash из node_modules.
// Твой импорт сломается — без видимой причины.`} />
        <p className={s.body}>
          Это называется <strong>phantom dependency</strong> (призрачная зависимость).
          pnpm решает это принципиально: создаёт symlinks только на явно указанные пакеты.
          Если lodash не в твоём <code>package.json</code> — его не импортировать.
        </p>
      </section>

      {/* ── 8. Переводчик команд ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Как одно и то же делается в разных менеджерах</SectionTitle>
        <p className={s.body}>
          Синтаксис команд немного отличается. Выбери действие — увидишь команду для каждого менеджера.
        </p>
        <CommandTranslator />
      </section>

      {/* ── 9. Сравнение ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Сравнение</SectionTitle>
        <div className={s.compTable}>
          <div className={s.compHeader}>
            <span></span>
            {[
              { icon: siNpm,  color: '#CB3837', name: 'npm'  },
              { icon: siYarn, color: '#2C8EBB', name: 'yarn' },
              { icon: siPnpm, color: '#F69220', name: 'pnpm' },
            ].map(m => (
              <div key={m.name} className={s.compHeaderManager}>
                <BrandIcon icon={m.icon} size={14} color={m.color} />
                <span style={{ color: m.color }}>{m.name}</span>
              </div>
            ))}
          </div>
          {COMP_ROWS.map(row => (
            <div key={row.criteria} className={s.compRow}>
              <span className={s.compCriteria}>{row.criteria}</span>
              <span className={s.compCell}>{row.npm}</span>
              <span className={s.compCell}>{row.yarn}</span>
              <span className={s.compCell}>{row.pnpm}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Что выбрать ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что выбрать в 2025 году</SectionTitle>
        <div className={s.callout}>
          <div className={s.calloutLabel}>РЕКОМЕНДАЦИЯ</div>
          <div className={s.calloutText}>
            <strong>Новый проект, один разработчик</strong> — npm. Уже установлен, работает, учиться надо на нём.{' '}
            <strong>Командный проект</strong> — pnpm. Экономия диска, скорость, строгая изоляция.{' '}
            <strong>Монорепозиторий</strong> — yarn berry или pnpm workspaces, оба хорошо поддерживают monorepo.
            <br /><br />
            В любом случае: не смешивай менеджеры в одном проекте.
            Если проект использует yarn — всей команде использовать yarn.
            Иначе будет два lock-файла и расходящиеся версии.
          </div>
        </div>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
