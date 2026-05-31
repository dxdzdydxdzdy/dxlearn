import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { HomeworkBlock } from '@/components/ui/HomeworkBlock/HomeworkBlock';
import { ApiPlayground } from './ApiPlayground';
import { QUIZ_QUESTIONS } from './quizData';
import s from './NestjsRestArticle.module.scss';

const DECORATORS = [
  { name: '@Get(path?)',    desc: 'Обработчик GET-запроса. path опционален: @Get() → /controller, @Get("all") → /controller/all' },
  { name: '@Post(path?)',   desc: 'Обработчик POST-запроса. Используется для создания новых ресурсов.' },
  { name: '@Put(path?)',    desc: 'Замена ресурса целиком. Принимает полный объект.' },
  { name: '@Patch(path?)',  desc: 'Частичное обновление ресурса. Принимает только изменяемые поля.' },
  { name: '@Delete(path?)', desc: 'Удаление ресурса. Обычно возвращает 204 No Content.' },
  { name: '@Param(key)',    desc: 'Читает динамический сегмент URL. @Param("id") id: string → /tasks/:id.' },
  { name: '@Body()',        desc: 'Читает тело запроса целиком. Обычно типизируется через DTO-класс.' },
  { name: '@Query(key?)',   desc: 'Читает query-параметры (?page=2). @Query("page") — конкретный ключ, @Query() — весь объект.' },
];

const EXCEPTIONS = [
  { code: '400', name: 'BadRequestException',       desc: 'Неверные данные в запросе' },
  { code: '401', name: 'UnauthorizedException',     desc: 'Не авторизован' },
  { code: '403', name: 'ForbiddenException',        desc: 'Нет прав доступа' },
  { code: '404', name: 'NotFoundException',         desc: 'Ресурс не найден' },
  { code: '409', name: 'ConflictException',         desc: 'Конфликт (уже существует)' },
  { code: '500', name: 'InternalServerErrorException', desc: 'Ошибка сервера' },
];

export function NestjsRestArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Генерация ресурса ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Генерация сущности через CLI</SectionTitle>
        <p className={s.lead}>
          В прошлой статье мы видели структуру из трёх файлов (module, controller, service).
          Создавать их вручную — долго. NestJS CLI умеет генерировать всё это за одну команду.
        </p>
        <CodeHighlight lang="bash" code={`# Полная форма
nest generate resource task

# Сокращённая (одинаковый результат)
nest g res task

# С флагом --no-spec: без генерации тестов
nest g res task --no-spec`} />
        <p className={s.body}>
          CLI спросит два вопроса: транспорт (выбираем <strong>REST API</strong>) и нужны ли
          entry points. Если ответить yes — сгенерируются заготовки методов и DTO.
          На старте удобнее ответить no и писать всё самостоятельно.
        </p>
        <p className={s.body}>После генерации в <code>src/</code> появится папка <code>task/</code>:</p>
        <CodeHighlight lang="bash" code={`src/
  task/
    dto/
      create-task.dto.ts   ← сюда опишем входные данные
    task.controller.ts     ← HTTP-маршруты
    task.module.ts         ← объединяет контроллер и сервис
    task.service.ts        ← бизнес-логика`} />
        <Callout variant="info">
          CLI автоматически добавит <code>TaskModule</code> в <code>imports</code> корневого{' '}
          <code>AppModule</code>. Проверь <code>app.module.ts</code> — он уже обновлён.
        </Callout>
      </section>

      {/* ── 2. GET-запросы ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>GET-запросы: получение данных</SectionTitle>
        <p className={s.body}>
          Начнём с самого простого — метода который возвращает все задачи. Данные пока
          хранятся прямо в сервисе в виде массива — без базы данных, для простоты.
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  private tasks = [
    { id: 1, title: 'Learn NestJS', isCompleted: false },
    { id: 2, title: 'Build REST API', isCompleted: true },
  ];

  findAll() {
    return this.tasks;
  }
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Controller, Get } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('all')
  findAll() {
    return this.taskService.findAll();
    // GET /task/all → [{ id: 1, ... }, { id: 2, ... }]
  }
}`} />
        <p className={s.body}>
          <code>@Get('all')</code> означает что метод ответит на путь <code>/task/all</code>.
          Если аргумент не передать — <code>@Get()</code> — ответит на <code>/task</code>.
        </p>
      </section>

      {/* ── 3. Параметры URL ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>@Param — параметры из URL</SectionTitle>
        <p className={s.body}>
          Чтобы получить конкретную задачу по ID, нужен динамический сегмент в пути
          и декоратор <code>@Param</code> для его чтения:
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TaskService {
  private tasks = [ /* ... */ ];

  findById(id: number) {
    const task = this.tasks.find(task => task.id === id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Controller, Get, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    // id здесь всегда string — URL это строка
    return this.taskService.findById(Number(id));
    // GET /task/by-id/1 → { id: 1, title: "...", isCompleted: false }
    // GET /task/by-id/99 → 404 { message: "Task not found" }
  }
}`} />
        <div className={s.warnCard}>
          <div className={s.warnLabel}>ВАЖНО: ТИП ПАРАМЕТРА</div>
          <div className={s.warnText}>
            <code>@Param("id")</code> всегда возвращает <strong>string</strong>, даже если
            в URL число. Если объявишь тип <code>number</code> — TypeScript не выдаст ошибку,
            но <code>task.id === id</code> всегда вернёт <code>false</code> (1 !== "1").
            Всегда преобразуй явно: <code>Number(id)</code>.
          </div>
        </div>
      </section>

      {/* ── 4. POST и DTO ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>POST-запросы и DTO</SectionTitle>
        <p className={s.lead}>
          POST-запросы используются для создания ресурсов. Данные передаются в теле запроса —
          мы читаем их через <code>@Body()</code>. Но как типизировать то что ожидаем?
          Для этого — <strong>DTO</strong>.
        </p>
        <p className={s.body}>
          <strong>DTO (Data Transfer Object)</strong> — класс с полями которые ожидаем в запросе.
          Это контракт: клиент знает что передавать, сервер знает что получить.
        </p>
        <CodeHighlight lang="ts" filename="src/task/dto/create-task.dto.ts" code={`export class CreateTaskDto {
  title: string;
  // В следующей статье добавим сюда @IsString(), @IsNotEmpty()
  // и включим автоматическую валидацию через ValidationPipe
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
  private tasks = [ /* ... */ ];

  create(dto: CreateTaskDto) {
    const { title } = dto;

    const task = {
      id: this.tasks.length + 1,
      title,
      isCompleted: false,
    };

    this.tasks.push(task);
    return this.tasks; // возвращаем обновлённый список
  }
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('all')
  findAll() {
    return this.taskService.findAll();
  }

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    return this.taskService.findById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
    // POST /task  body: { "title": "New task" }
    // → возвращает обновлённый массив задач
  }
}`} />
      </section>

      {/* ── 5. Все декораторы ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Справочник HTTP-декораторов</SectionTitle>
        <div className={s.decTable}>
          {DECORATORS.map(d => (
            <div key={d.name} className={s.decRow}>
              <div className={s.decName}>{d.name}</div>
              <div className={s.decDesc} dangerouslySetInnerHTML={{ __html:
                d.desc.replace(/`([^`]+)`/g, '<code>$1</code>')
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Обработка ошибок ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Обработка ошибок</SectionTitle>
        <p className={s.body}>
          В NestJS для каждого HTTP-статуса есть отдельный класс исключения.
          Бросаешь его через <code>throw</code> — NestJS поймает и вернёт правильный JSON-ответ.
        </p>
        <div className={s.errGrid}>
          {EXCEPTIONS.map(e => (
            <div key={e.name} className={s.errCard}>
              <div className={s.errCode}>{e.code}</div>
              <div className={s.errName}>{e.name}</div>
              <div className={s.errDesc}>{e.desc}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="ts" code={`import { NotFoundException, BadRequestException } from '@nestjs/common';

// В сервисе
findById(id: number) {
  const task = this.tasks.find(t => t.id === id);

  if (!task) {
    throw new NotFoundException('Task not found');
    // → { statusCode: 404, message: "Task not found", error: "Not Found" }
  }

  return task;
}

create(dto: CreateTaskDto) {
  if (!dto.title) {
    throw new BadRequestException('Title is required');
    // → { statusCode: 400, message: "Title is required", error: "Bad Request" }
  }
  // ...
}`} />
        <Callout variant="info">
          NestJS перехватывает все HTTP-исключения глобально. Тебе не нужно оборачивать
          каждый метод в try/catch — просто бросай нужное исключение из любого места в сервисе.
        </Callout>
      </section>

      {/* ── 7. Playground ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>API Playground</SectionTitle>
        <p className={s.body}>
          Попробуй отправить запросы — поведение соответствует реальному NestJS приложению.
          GET all, GET by-id (с существующим и несуществующим ID), POST с названием задачи.
        </p>
        <ApiPlayground />
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
          <>Сгенерируй сущность <code>nest g res author --no-spec</code>. Убедись что в <code>app.module.ts</code> появился <code>AuthorModule</code>.</>,
          <>В <code>AuthorService</code> создай массив авторов с полями <code>id</code>, <code>name</code>, <code>surname</code>. Добавь методы <code>findAll()</code> и <code>findById(id: number)</code> с <code>NotFoundException</code>.</>,
          <>Создай <code>CreateAuthorDto</code> с полями <code>name: string</code> и <code>surname: string</code>. Добавь метод <code>create(dto)</code> в сервис.</>,
          <>Опиши в <code>AuthorController</code> три маршрута: <code>GET /author/all</code>, <code>GET /author/by-id/:id</code>, <code>POST /author</code>.</>,
          <>Протестируй все три маршрута через Postman или встроенный плагин в VS Code. Убедись что 404 возвращается при несуществующем ID.</>,
        ]} />
      </section>

    </div>
  );
}
