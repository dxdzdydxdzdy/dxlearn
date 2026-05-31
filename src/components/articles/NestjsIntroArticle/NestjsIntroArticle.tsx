import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { HomeworkBlock } from '@/components/ui/HomeworkBlock/HomeworkBlock';
import { ArchitectureFlow } from './ArchitectureFlow';
import { QUIZ_QUESTIONS } from './quizData';
import s from './NestjsIntroArticle.module.scss';

const BLOCKS = [
  {
    name: 'Module',
    role: 'контейнер',
    desc: 'Группирует контроллеры, сервисы и другие модули по функциональности. AppModule — корень дерева.',
  },
  {
    name: 'Controller',
    role: 'маршрутизатор',
    desc: 'Принимает HTTP-запросы и делегирует их сервисам. Никакой логики — только вызовы методов сервиса.',
  },
  {
    name: 'Service',
    role: 'бизнес-логика',
    desc: 'Здесь всё самое важное: работа с данными, валидация, обращения к базе. Мозг приложения.',
  },
];

export function NestjsIntroArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Что такое NestJS ───────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Что такое NestJS</SectionTitle>
        <p className={s.lead}>
          NestJS — это <strong>TypeScript-фреймворк</strong> для разработки серверных приложений.
          Он построен поверх Node.js и использует Express под капотом, добавляя строгую
          архитектуру, декораторы и встроенный IoC-контейнер.
        </p>
        <p className={s.body}>
          Если Express — это набор инструментов без правил, то NestJS — это Angular для бэкенда:
          он диктует как структурировать код, как делать зависимости, как писать тесты.
          Это сильно облегчает масштабирование и поддержку больших проектов.
        </p>
        <div className={s.compare}>
          <div className={s.compareCol}>
            <span className={`${s.compareLabel} ${s.neutral}`}>Express</span>
            <CodeHighlight lang="js" code={`const express = require('express');
const app = express();

// Всё вручную — структура на твоё усмотрение
app.get('/tasks', (req, res) => {
  // логика прямо здесь? в отдельном файле?
  // зависимости? IoC? сам разберись
  res.json(tasks);
});`} />
          </div>
          <div className={s.compareCol}>
            <span className={`${s.compareLabel} ${s.nest}`}>NestJS</span>
            <CodeHighlight lang="ts" code={`@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService
  ) {}

  @Get()
  findAll() {
    return this.taskService.findAll();
  }
}`} />
          </div>
        </div>
        <p className={s.body}>
          NestJS поддерживает <strong>REST API</strong>, <strong>GraphQL</strong>,{' '}
          <strong>WebSockets</strong> и микросервисы. В этом курсе сосредоточимся на REST —
          это то, с чем ты столкнёшься в большинстве реальных проектов.
        </p>
      </section>

      {/* ── 2. Установка ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Установка CLI и создание проекта</SectionTitle>
        <p className={s.body}>
          NestJS CLI — это инструмент который генерирует структуру проекта, создаёт
          сущности командой, запускает приложение. Устанавливается глобально:
        </p>
        <CodeHighlight lang="bash" code={`npm install -g @nestjs/cli

# Проверяем установку
nest --version
# 10.x.x`} />
        <p className={s.body}>
          Создаём новое приложение командой <code>nest new</code>. CLI предложит выбрать
          пакетный менеджер — npm, yarn или pnpm:
        </p>
        <CodeHighlight lang="bash" code={`nest new my-app

# ? Which package manager would you like to use?
#   npm
# ❯ yarn
#   pnpm

# После выбора CLI:
# ✓ создаёт структуру файлов
# ✓ устанавливает зависимости
# ✓ инициализирует git`} />
        <div className={s.callout}>
          <div className={s.calloutLabel}>ЧТО ЗНАЧИТ НАЗВАНИЕ ПРОЕКТА</div>
          <div className={s.calloutText}>
            Для учебных целей называй <code>nestjs</code> или <code>my-app</code>.
            В реальном проекте — <code>backend</code>, <code>api</code> или название сервиса.
            Название влияет только на папку и <code>package.json</code>.
          </div>
        </div>
      </section>

      {/* ── 3. Структура проекта ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Структура проекта</SectionTitle>
        <p className={s.body}>
          После создания проекта ты увидишь такую структуру. Самое важное — папка <code>src/</code>:
        </p>
        <div className={s.fileTree}>
          <div><span className={s.fileDir}>my-app/</span></div>
          <div>&nbsp;&nbsp;<span className={s.fileDir}>src/</span> <span className={s.fileNote}>← весь твой код здесь</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={s.fileKey}>main.ts</span> <span className={s.fileNote}>← точка входа, запуск сервера</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={s.fileKey}>app.module.ts</span> <span className={s.fileNote}>← корневой модуль</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={s.fileKey}>app.controller.ts</span> <span className={s.fileNote}>← контроллер главного маршрута</span></div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className={s.fileKey}>app.service.ts</span> <span className={s.fileNote}>← главный сервис</span></div>
          <div>&nbsp;&nbsp;<span className={s.fileFile}>nest-cli.json</span> <span className={s.fileNote}>← настройки CLI</span></div>
          <div>&nbsp;&nbsp;<span className={s.fileFile}>tsconfig.json</span> <span className={s.fileNote}>← настройки TypeScript</span></div>
          <div>&nbsp;&nbsp;<span className={s.fileFile}>package.json</span></div>
        </div>

        <p className={s.body}><strong>Разберём ключевые файлы:</strong></p>

        <CodeHighlight lang="ts" filename="src/main.ts" code={`import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();`} />
        <p className={s.body}>
          <code>main.ts</code> — единственная точка запуска. Создаёт приложение из корневого
          модуля и начинает слушать порт. Обычно здесь же настраивают CORS, валидацию, Swagger.
        </p>

        <CodeHighlight lang="ts" filename="src/app.module.ts" code={`import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],          // другие модули (TaskModule, UserModule...)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`} />
        <p className={s.body}>
          <code>app.module.ts</code> — корневой модуль. Сюда будем добавлять все новые
          модули при масштабировании приложения.
        </p>
      </section>

      {/* ── 4. Запуск ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Запуск приложения</SectionTitle>
        <CodeHighlight lang="bash" code={`# Режим разработки с hot-reload (рекомендуется)
yarn start:dev

# или npm
npm run start:dev`} />
        <p className={s.body}>
          После запуска в терминале появятся логи с маршрутами. Открой{' '}
          <code>http://localhost:3000</code> — увидишь <code>Hello World!</code> от
          AppController. Это означает что сервер работает.
        </p>
        <Callout variant="info">
          <code>start:dev</code> следит за изменениями файлов. При сохранении — автоматически
          перекомпилирует и перезапустит сервер. Используй именно его во время разработки.
        </Callout>
      </section>

      {/* ── 5. Архитектура ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Архитектура: модули, контроллеры, сервисы</SectionTitle>
        <p className={s.lead}>
          Три кита NestJS — и у каждого строго своя роль.
        </p>
        <div className={s.blockGrid}>
          {BLOCKS.map(b => (
            <div key={b.name} className={s.block}>
              <div className={s.blockName}>{b.name}</div>
              <div className={s.blockRole}>{b.role}</div>
              <div className={s.blockDesc}>{b.desc}</div>
            </div>
          ))}
        </div>
        <p className={s.body}>
          Представь что строишь интернет-магазин. У тебя будет <strong>ProductModule</strong>
          — он содержит ProductController (принимает запросы) и ProductService (получает
          данные из БД). А UserModule — то же самое, но для пользователей. Все модули
          подключаются в AppModule.
        </p>
        <CodeHighlight lang="ts" code={`// Пример: как выглядит цепочка Module → Controller → Service

@Module({
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll() {
    return this.taskService.findAll();  // логика — в сервисе
  }
}

@Injectable()
export class TaskService {
  private tasks = [{ id: 1, title: 'Изучить NestJS' }];

  findAll() {
    return this.tasks;
  }
}`} />
        <p className={s.body}>
          Нажми кнопку ниже и посмотри как работает цикл обработки запроса в NestJS.
          Можно кликать на блоки чтобы изучить каждый из них.
        </p>
        <ArchitectureFlow />
      </section>

      {/* ── 6. Dependency Injection ───────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Dependency Injection — магия конструктора</SectionTitle>
        <p className={s.body}>
          Ты уже заметил конструктор в контроллере:{' '}
          <code>constructor(private readonly taskService: TaskService)</code>.
          Это и есть <strong>Dependency Injection</strong> — NestJS сам создаёт и передаёт
          нужные зависимости.
        </p>
        <CodeHighlight lang="ts" code={`// Ты пишешь это...
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
}

// ...NestJS делает это за тебя:
// const taskService = new TaskService();
// const taskController = new TaskController(taskService);
//
// Сервис создаётся один раз и шарится между всеми кто его запрашивает
// (Singleton-паттерн по умолчанию)`} />
        <p className={s.body}>
          Это называется <strong>IoC-контейнер</strong> (Inversion of Control).
          Ты не создаёшь объекты вручную — объявляешь зависимости в конструкторе,
          а NestJS сам разбирается как их создать и где переиспользовать.
        </p>
        <Callout variant="warn">
          Чтобы сервис можно было инъецировать, он должен быть декорирован <code>@Injectable()</code>
          и зарегистрирован в <code>providers</code> своего модуля. Иначе NestJS не найдёт его и выбросит ошибку.
        </Callout>
      </section>

      {/* ── Quiz ──────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

      {/* ── Homework ──────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Домашнее задание</SectionTitle>
        <HomeworkBlock items={[
          <>Установи Nest CLI глобально и убедись что команда <code>nest --version</code> работает.</>,
          <>Создай новое приложение командой <code>nest new my-first-nest</code>, выбери yarn или npm.</>,
          <>Запусти в режиме разработки (<code>yarn start:dev</code>) и открой <code>localhost:3000</code> в браузере.</>,
          <>Открой <code>src/app.service.ts</code> и измени текст возвращаемой строки. Убедись что браузер показывает обновлённый текст без перезапуска сервера.</>,
          <>В <code>app.module.ts</code> проверь что AppController и AppService объявлены. Убери AppController из <code>controllers</code> и посмотри что изменится. Верни обратно.</>,
        ]} />
      </section>

    </div>
  );
}
