import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'r1',
    difficulty: 'easy',
    question: 'Что делает команда nest g res task?',
    options: [
      'Устанавливает пакет task',
      'Генерирует сущность task: контроллер, сервис, модуль',
      'Запускает сервер на порту task',
      'Удаляет сущность task',
    ],
    correct: 1,
    explanation: 'nest g res (generate resource) генерирует полный набор файлов для сущности: controller, service, module, и опционально dto и тесты.',
  },
  {
    id: 'r2',
    difficulty: 'easy',
    question: 'Какой декоратор нужно поставить на метод чтобы он отвечал на GET-запросы?',
    options: ['@Request()', '@HttpGet()', '@Get()', '@Route("GET")'],
    correct: 2,
    explanation: '@Get() из @nestjs/common регистрирует метод как обработчик GET-запроса. Аргумент задаёт под-путь: @Get("all") ответит на /controller-path/all.',
  },
  {
    id: 'r3',
    difficulty: 'easy',
    question: 'Как в NestJS получить параметр из URL-пути (например /tasks/:id)?',
    options: [
      'req.params.id',
      '@Param("id") id: string',
      '@Query("id") id: string',
      '@Body("id") id: string',
    ],
    correct: 1,
    explanation: '@Param("id") вытаскивает именованный параметр из URL. Важно: тип всегда string — URL не может быть числом, преобразование делаешь вручную через Number(id).',
  },
  {
    id: 'r4',
    difficulty: 'easy',
    question: 'Что такое DTO в NestJS?',
    options: [
      'Декоратор для типов объектов',
      'Класс описывающий форму входящих данных запроса',
      'Сокращение для Database Table Object',
      'Специальный тип для работы с базой данных',
    ],
    correct: 1,
    explanation: 'DTO (Data Transfer Object) — класс с полями, которые ожидаются в запросе. Он чётко документирует контракт API и служит основой для валидации через class-validator.',
  },
  {
    id: 'r5',
    difficulty: 'easy',
    question: 'Какой декоратор используется для чтения тела POST-запроса?',
    options: ['@Req()', '@Param()', '@Query()', '@Body()'],
    correct: 3,
    explanation: '@Body() прочитает весь объект тела запроса и передаст в параметр. Часто типизируют через DTO: @Body() dto: CreateTaskDto.',
  },
  {
    id: 'r6',
    difficulty: 'medium',
    question: 'Почему параметр @Param("id") всегда должен быть типа string?',
    options: [
      'NestJS не поддерживает числовые параметры',
      'Потому что URL всегда строка, числа нельзя вставить в путь',
      'Это требование TypeScript',
      'Чтобы избежать SQL-инъекций',
    ],
    correct: 1,
    explanation: 'URL — это строка. :id в /tasks/42 — тоже строка "42". Если объявить тип number, TypeScript не даст ошибку, но сравнение task.id === id всегда будет false. Используй Number(id) явно.',
  },
  {
    id: 'r7',
    difficulty: 'medium',
    question: 'Что вернёт NestJS если бросить new NotFoundException("Task not found")?',
    options: [
      'Пустой ответ с кодом 200',
      'JSON { message: "Task not found", statusCode: 404, error: "Not Found" }',
      'Строку "Task not found" с кодом 500',
      'Необработанное исключение Node.js',
    ],
    correct: 1,
    explanation: 'NestJS перехватывает HTTP-исключения и автоматически формирует JSON-ответ. NotFoundException даёт 404, BadRequestException — 400, UnauthorizedException — 401 и т.д.',
  },
  {
    id: 'r8',
    difficulty: 'medium',
    question: 'Где в NestJS должны быть dto-файлы по соглашению?',
    options: [
      'В корне src/',
      'В папке dto/ внутри модуля сущности',
      'В отдельной папке shared/dto/',
      'Рядом с main.ts',
    ],
    correct: 1,
    explanation: 'По соглашению dto файлы хранятся в src/task/dto/create-task.dto.ts. CLI автоматически создаёт эту структуру если ответить yes при генерации сущности.',
  },
  {
    id: 'r9',
    difficulty: 'medium',
    code: `@Get('by-id/:id')
findById(@Param('id') id: string) {
  return this.taskService.findById(Number(id));
}`,
    question: 'По какому URL отработает этот метод контроллера с @Controller("task")?',
    options: [
      '/task/id/:id',
      '/by-id/:id',
      '/task/by-id/42 (при id=42)',
      '/42 (при id=42)',
    ],
    correct: 2,
    explanation: '@Controller("task") задаёт базовый путь /task. @Get("by-id/:id") добавляет под-путь. Итого: /task/by-id/42 при запросе с id=42.',
  },
  {
    id: 'r10',
    difficulty: 'medium',
    question: 'Флаг --no-spec при nest g res отключает генерацию:',
    options: [
      'Файлов контроллера',
      'Файлов сервиса',
      'Файлов тестов (.spec.ts)',
      'Файлов модуля',
    ],
    correct: 2,
    explanation: '*.spec.ts — файлы тестов. --no-spec позволяет пропустить их генерацию если ты не готов к написанию тестов прямо сейчас.',
  },
  {
    id: 'r11',
    difficulty: 'medium',
    code: `@Post()
create(@Body() dto: CreateTaskDto) {
  return this.taskService.create(dto);
}`,
    question: 'Что произойдёт если в теле POST-запроса не передать ожидаемые поля?',
    options: [
      'NestJS автоматически вернёт 400',
      'Поля будут undefined, без автоматической ошибки',
      'Выпадет ошибка компиляции TypeScript',
      'Запрос будет отклонён на уровне TCP',
    ],
    correct: 1,
    explanation: 'Без class-validator поля просто будут undefined. Валидация не автоматическая — нужно добавить декораторы (@IsString, @IsNotEmpty) и подключить ValidationPipe.',
  },
  {
    id: 'r12',
    difficulty: 'hard',
    question: 'В каком файле NestJS автоматически регистрирует новый TaskModule при генерации сущности?',
    options: ['nest-cli.json', 'tsconfig.json', 'app.module.ts', 'main.ts'],
    correct: 2,
    explanation: 'CLI при генерации сущности автоматически добавляет TaskModule в imports[] корневого AppModule. Это можно увидеть в app.module.ts сразу после генерации.',
  },
  {
    id: 'r13',
    difficulty: 'hard',
    code: `@Controller('task')
export class TaskController {
  @Get()
  findAll() { /* ... */ }

  @Get(':id')
  findOne(@Param('id') id: string) { /* ... */ }
}`,
    question: 'Зачем при наличии @Get("all") лучше использовать путь by-id/:id вместо просто :id?',
    options: [
      'Это обязательное соглашение NestJS',
      'Чтобы избежать конфликта с другими GET-маршрутами (например all)',
      'Потому что :id работает только с POST',
      'Для совместимости с GraphQL',
    ],
    correct: 1,
    explanation: 'Если добавить @Get("all"), маршрут /task/all может совпасть с @Get(":id") (NestJS решает конфликт в пользу более раннего). Явный префикс by-id устраняет неоднозначность.',
  },
  {
    id: 'r14',
    difficulty: 'hard',
    question: 'Что вернёт метод findById если таск не найден, без NotFoundException?',
    options: [
      'null',
      'undefined (и NestJS отправит пустой ответ 200)',
      'Пустой массив []',
      'Ошибку 500',
    ],
    correct: 1,
    explanation: 'Array.find() возвращает undefined когда ничего не нашёл. NestJS сериализует это как пустое тело с кодом 200. Для правильной обработки нужно явно бросать NotFoundException.',
  },
  {
    id: 'r15',
    difficulty: 'hard',
    question: 'Можно ли использовать один DTO для создания и обновления сущности?',
    options: [
      'Нет, NestJS не поддерживает это',
      'Да, но плохая практика — лучше CreateTaskDto и UpdateTaskDto',
      'Да, и это рекомендуется',
      'Только если поля помечены как optional',
    ],
    correct: 1,
    explanation: 'Технически можно, но при обновлении обычно все поля необязательны (PATCH). NestJS предоставляет PartialType(CreateTaskDto) — автоматически делает все поля optional для UpdateTaskDto.',
  },
];
