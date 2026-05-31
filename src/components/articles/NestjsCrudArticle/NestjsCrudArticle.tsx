import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { HomeworkBlock } from '@/components/ui/HomeworkBlock/HomeworkBlock';
import { CrudPlayground } from './CrudPlayground';
import { QUIZ_QUESTIONS } from './quizData';
import s from './NestjsCrudArticle.module.scss';

const METHODS = [
  { name: 'PUT',    action: 'Заменить целиком',    body: 'Да — полный объект, все поля обязательны', returns: 'Обновлённый объект' },
  { name: 'PATCH',  action: 'Обновить часть полей', body: 'Да — только изменяемые поля',              returns: 'Обновлённый объект' },
  { name: 'DELETE', action: 'Удалить ресурс',       body: 'Нет — только ID в параметре URL',          returns: 'Удалённый объект или 204' },
];

export function NestjsCrudArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Сравнение методов ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>PUT, PATCH и DELETE — в чём разница</SectionTitle>
        <p className={s.lead}>
          Три метода для изменения данных — и у каждого своя семантика.
          Путаница между PUT и PATCH — одна из самых частых ошибок при проектировании API.
        </p>

        <div className={s.methodTable}>
          <div className={s.methodHead}>
            <div className={s.mhCell}>МЕТОД</div>
            <div className={s.mhCell}>НАЗНАЧЕНИЕ</div>
            <div className={s.mhCell}>ТЕЛО ЗАПРОСА</div>
            <div className={s.mhCell}>ОТВЕТ</div>
          </div>
          {METHODS.map(m => (
            <div key={m.name} className={s.methodRow}>
              <div className={s.mCell}><span className={s.mName}>{m.name}</span></div>
              <div className={s.mCell}>{m.action}</div>
              <div className={s.mCell}>{m.body}</div>
              <div className={s.mCell}>{m.returns}</div>
            </div>
          ))}
        </div>

        <p className={s.body}>
          <strong>Практический ориентир:</strong> если форма редактирования отправляет
          весь объект — используй PUT. Если это отдельная кнопка «отметить выполненным»
          которая меняет только одно поле — PATCH.
        </p>
      </section>

      {/* ── 2. UpdateTaskDto ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>UpdateTaskDto — DTO для обновления</SectionTitle>
        <p className={s.body}>
          Для PUT и PATCH нужен отдельный DTO. В папке{' '}
          <code>src/task/dto/</code> создаём файл <code>update-task.dto.ts</code>:
        </p>
        <CodeHighlight lang="ts" filename="src/task/dto/update-task.dto.ts" code={`export class UpdateTaskDto {
  title: string;
  isCompleted: boolean;
}`} />
        <p className={s.body}>
          Этот DTO описывает <strong>полный объект задачи</strong> — оба поля обязательны.
          Для PATCH мы обернём его в <code>Partial&lt;UpdateTaskDto&gt;</code>, сделав все поля опциональными.
        </p>
      </section>

      {/* ── 3. PUT ───────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>PUT — полная замена ресурса</SectionTitle>
        <p className={s.body}>
          PUT заменяет объект целиком. Клиент обязан передать все поля —
          те что не переданы считаются пустыми или сбрасываются в значение по умолчанию.
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`updateTask(id: number, dto: UpdateTaskDto) {
  const { title, isCompleted } = dto;

  // findById уже содержит NotFoundException — не дублируем логику
  const task = this.findById(id);

  task.title       = title;
  task.isCompleted = isCompleted;

  return task;
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Body, Controller, Put, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  // ...

  @Put(':id')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(+id, dto);
    // PUT /task/1  body: { "title": "Updated", "isCompleted": true }
    // → { id: 1, title: "Updated", isCompleted: true }
  }
}`} />
        <p className={s.body}>
          <strong>+id</strong> — унарный плюс, краткая форма <code>Number(id)</code>.
          Строка <code>"42"</code> превращается в число <code>42</code>.
        </p>
        <Callout variant="warn">
          PUT-запрос без какого-либо поля должен сбрасывать его значение. Если клиент
          отправил только <code>title</code> и забыл <code>isCompleted</code> — поле
          получит <code>undefined</code>. Именно поэтому PUT требует полного объекта,
          а не частичного.
        </Callout>
      </section>

      {/* ── 4. PATCH ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>PATCH — частичное обновление</SectionTitle>
        <p className={s.body}>
          PATCH обновляет только переданные поля, остальные не трогает.
          Это делает его удобным для кнопок-переключателей и форм с частичным редактированием.
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`patchTask(id: number, dto: Partial<UpdateTaskDto>) {
  const task = this.findById(id);

  Object.assign(task, dto);

  return task;
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Body, Controller, Patch, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  // ...

  @Patch(':id')
  patchTask(@Param('id') id: string, @Body() dto: Partial<UpdateTaskDto>) {
    return this.taskService.patchTask(+id, dto);
    // PATCH /task/1  body: { "isCompleted": true }
    // → { id: 1, title: "do something", isCompleted: true }
    //   title не изменился — его не передавали
  }
}`} />

        {/* Сноска о Partial<T> и Object.assign */}
        <div className={s.aside}>
          <div className={s.asideTitle}>// Partial&lt;T&gt; и Object.assign под капотом</div>
          <p className={s.asideBody}>
            <strong>Partial&lt;T&gt;</strong> — утилитарный тип TypeScript. Он берёт все поля типа T
            и делает их опциональными. То есть:
          </p>
          <CodeHighlight lang="ts" code={`// UpdateTaskDto
type UpdateTaskDto = {
  title: string;        // обязательное
  isCompleted: boolean; // обязательное
}

// Partial<UpdateTaskDto> эквивалентно:
type PartialUpdateTaskDto = {
  title?: string;        // опциональное
  isCompleted?: boolean; // опциональное
}

// Теперь TypeScript не ругается если передать только одно поле:
const dto: Partial<UpdateTaskDto> = { isCompleted: true }; // OK`} />
          <p className={s.asideBody}>
            <strong>Object.assign(target, source)</strong> — копирует все перечисляемые
            собственные поля из <code>source</code> в <code>target</code>, <em>мутируя target</em>.
            Поля которых нет в source — остаются нетронутыми:
          </p>
          <CodeHighlight lang="ts" code={`const task = { id: 1, title: 'old', isCompleted: false };
const dto  = { isCompleted: true };   // Partial — только одно поле

Object.assign(task, dto);
// task теперь: { id: 1, title: 'old', isCompleted: true }
//                              ^^^^ не изменился, dto его не содержал

// Важно: task мутирован in-place
// Если task — объект из массива this.tasks[], массив тоже обновился`} />
          <p className={s.asideBody}>
            Именно поэтому после <code>Object.assign</code> можно сразу делать{' '}
            <code>return task</code> — он уже содержит актуальные данные.
          </p>
        </div>
      </section>

      {/* ── 5. DELETE ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>DELETE — удаление ресурса</SectionTitle>
        <p className={s.body}>
          DELETE принимает только ID из URL — тело запроса не нужно.
          Перед удалением мы ищем таск через <code>findById</code>, чтобы получить 404
          если его нет, и сохраняем ссылку на объект чтобы вернуть клиенту.
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.service.ts" code={`delete(id: number) {
  // 1. Ищем — findById бросит NotFoundException если нет
  const deletedTask = this.findById(id);

  // 2. Фильтруем массив, исключая удаляемый таск
  this.tasks = this.tasks.filter(task => task.id !== deletedTask.id);

  // 3. Возвращаем удалённый объект — клиент знает что именно удалили
  return deletedTask;
}`} />
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import { Controller, Delete, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  // ...

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.taskService.delete(+id);
    // DELETE /task/2
    // → { id: 2, title: "get something", isCompleted: true }
    // DELETE /task/99
    // → 404 { message: "Задание не найдено" }
  }
}`} />
        <p className={s.body}>
          <code>filter</code> создаёт новый массив без изменения оригинала.
          <code>this.tasks = ...</code> — заменяем всё поле сразу новым массивом.
          Это безопаснее <code>splice</code>, который мутирует массив in-place
          и требует знания индекса.
        </p>
      </section>

      {/* ── 6. Полный контроллер ─────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Итог: полный CRUD-контроллер</SectionTitle>
        <p className={s.body}>
          После добавления всех методов контроллер выглядит так.
          Пять эндпоинтов — пять операций: получить все, получить один, создать, обновить, удалить.
        </p>
        <CodeHighlight lang="ts" filename="src/task/task.controller.ts" code={`import {
  Body, Controller,
  Get, Post, Put, Patch, Delete,
  Param,
} from '@nestjs/common';
import { TaskService }     from './task.service';
import { CreateTaskDto }   from './dto/create-task.dto';
import { UpdateTaskDto }   from './dto/update-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('all')
  findAll() {
    return this.taskService.findAll();
  }

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    return this.taskService.findById(+id);
  }

  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
  }

  @Put(':id')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(+id, dto);
  }

  @Patch(':id')
  patchTask(@Param('id') id: string, @Body() dto: Partial<UpdateTaskDto>) {
    return this.taskService.patchTask(+id, dto);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.taskService.delete(+id);
  }
}`} />
      </section>

      {/* ── 7. Playground ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>CRUD Playground</SectionTitle>
        <p className={s.body}>
          Все пять операций в одном месте. Состояние хранится в памяти — как в нашем сервисе.
          Попробуй: создай задачу, обнови через PUT и PATCH, удали. Следи за state-баром сверху.
        </p>
        <CrudPlayground />
      </section>

      {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

      {/* ── Homework ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Домашнее задание</SectionTitle>
        <HomeworkBlock items={[
          <>Добавь <code>UpdateAuthorDto</code> с полями <code>name: string</code> и <code>surname: string</code> в директорию <code>src/author/dto/</code>.</>,
          <>Реализуй метод <code>updateAuthor(id, dto)</code> в <code>AuthorService</code> — полная замена через PUT.</>,
          <>Реализуй метод <code>patchAuthor(id, dto)</code> через <code>Partial&lt;UpdateAuthorDto&gt;</code> и <code>Object.assign</code>.</>,
          <>Добавь метод <code>deleteAuthor(id)</code> — найди через <code>findById</code>, отфильтруй массив, верни удалённый объект.</>,
          <>Опиши в <code>AuthorController</code> эндпоинты <code>PUT /author/:id</code>, <code>PATCH /author/:id</code>, <code>DELETE /author/:id</code> и протестируй все сценарии включая 404.</>,
        ]} />
      </section>

    </div>
  );
}
