import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'c1',
    difficulty: 'easy',
    question: 'Когда нужно использовать PUT, а не PATCH?',
    options: [
      'Когда нужно удалить ресурс',
      'Когда нужно заменить весь объект целиком',
      'Когда нужно обновить только одно поле',
      'Когда нужно получить ресурс',
    ],
    correct: 1,
    explanation: 'PUT заменяет ресурс полностью — клиент отправляет полный объект. PATCH — частичное обновление, достаточно передать только изменяемые поля.',
  },
  {
    id: 'c2',
    difficulty: 'easy',
    question: 'Что такое Partial<T> в TypeScript?',
    options: [
      'Утилита, которая делает все поля T обязательными',
      'Утилита, которая делает все поля T опциональными',
      'Тип, который исключает часть полей T',
      'Тип, который берёт только первые поля T',
    ],
    correct: 1,
    explanation: 'Partial<T> создаёт новый тип, где все поля T становятся optional (?: вместо :). Это позволяет передавать только те поля, которые хочешь обновить.',
  },
  {
    id: 'c3',
    difficulty: 'easy',
    question: 'Что делает Object.assign(target, source)?',
    options: [
      'Создаёт глубокую копию target',
      'Сравнивает два объекта',
      'Копирует перечисляемые поля из source в target, мутируя target',
      'Объединяет два объекта в новый, не меняя оригиналы',
    ],
    correct: 2,
    explanation: 'Object.assign мутирует первый аргумент (target), копируя в него поля из source. Это ключевой момент: если task — объект из массива, его поля обновятся in-place.',
  },
  {
    id: 'c4',
    difficulty: 'easy',
    question: 'Какой декоратор NestJS используется для обработки DELETE-запроса?',
    options: ['@Remove()', '@Destroy()', '@Delete()', '@Del()'],
    correct: 2,
    explanation: '@Delete() из @nestjs/common. Принимает опциональный путь: @Delete(":id") ответит на DELETE /task/42.',
  },
  {
    id: 'c5',
    difficulty: 'easy',
    question: 'Что обычно возвращает метод DELETE в NestJS?',
    options: [
      'Обновлённый список всех ресурсов',
      'Удалённый объект или пустой ответ 204',
      'Всегда null',
      'Всегда строку "deleted"',
    ],
    correct: 1,
    explanation: 'Варианты: вернуть удалённый объект (чтобы клиент знал что именно было удалено), или пустой 204 No Content. Оба подхода распространены — выбор за тобой.',
  },
  {
    id: 'c6',
    difficulty: 'medium',
    code: `patchTask(id: number, dto: Partial<UpdateTaskDto>) {
  const task = this.findById(id);
  Object.assign(task, dto);
  return task;
}`,
    question: 'Почему здесь не нужен явный return task после Object.assign?',
    options: [
      'Потому что Object.assign сам возвращает результат',
      'Потому что task — ссылка на объект в массиве, Object.assign мутирует его in-place, и return task уже возвращает обновлённый объект',
      'Потому что NestJS делает это автоматически',
      'Это ошибка — return нужен после Object.assign отдельно',
    ],
    correct: 1,
    explanation: 'task — это ссылка на объект внутри this.tasks[]. Object.assign(task, dto) меняет поля этого объекта напрямую. Поэтому return task после — уже возвращает обновлённую версию. Никакой копии не создаётся.',
  },
  {
    id: 'c7',
    difficulty: 'medium',
    code: `@Put(':id')
updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
  return this.taskService.updateTask(+id, dto);
}`,
    question: 'Что означает оператор + перед id?',
    options: [
      'Конкатенацию строк',
      'Унарный плюс — краткий способ преобразовать строку в число, аналог Number(id)',
      'Побитовую операцию',
      'Это синтаксическая ошибка',
    ],
    correct: 1,
    explanation: 'Унарный + (унарный плюс) приводит строку к числу. +id === Number(id). Короче и часто встречается в NestJS-коде. Работает так же: +"42" === 42.',
  },
  {
    id: 'c8',
    difficulty: 'medium',
    question: 'Почему для PATCH используется Partial<UpdateTaskDto>, а не сам UpdateTaskDto?',
    options: [
      'Это только стилистическое предпочтение',
      'Partial делает поля опциональными — клиент может отправить только изменяемые поля, не передавая остальные',
      'UpdateTaskDto не работает с @Patch',
      'Partial нужен чтобы избежать ошибки компилятора TypeScript',
    ],
    correct: 1,
    explanation: 'PATCH по природе — частичное обновление. Если использовать UpdateTaskDto без Partial, TypeScript потребует все поля обязательными. Partial<UpdateTaskDto> делает title? и isCompleted? опциональными — отправляй только то что меняешь.',
  },
  {
    id: 'c9',
    difficulty: 'medium',
    question: 'Почему в updateTask (PUT) мы переиспользуем this.findById(id), а не ищем таск напрямую?',
    options: [
      'Это обязательное требование NestJS',
      'findById уже содержит обработку NotFoundException — не нужно дублировать логику',
      'Чтобы избежать проблем с памятью',
      'По соглашению именования',
    ],
    correct: 1,
    explanation: 'findById уже бросает NotFoundException если таск не найден. Переиспользуя его, мы получаем обработку ошибок бесплатно и не дублируем код — принцип DRY.',
  },
  {
    id: 'c10',
    difficulty: 'medium',
    question: 'Какой HTTP-статус корректно вернуть после успешного DELETE?',
    options: [
      'Только 200 OK',
      'Только 204 No Content',
      '200 OK (с телом) или 204 No Content (без тела) — оба корректны',
      '202 Accepted',
    ],
    correct: 2,
    explanation: '200 — возвращаешь удалённый объект в теле. 204 — удалено, тела нет. Оба правильны и широко используются. NestJS по умолчанию вернёт 200 если функция что-то возвращает.',
  },
  {
    id: 'c11',
    difficulty: 'medium',
    code: `delete(id: number) {
  const deletedTask = this.findById(id);
  this.tasks = this.tasks.filter(task => task.id !== deletedTask.id);
  return deletedTask;
}`,
    question: 'Зачем сначала находим таск через findById, а потом фильтруем по deletedTask.id?',
    options: [
      'Для оптимизации производительности',
      'findById бросает NotFoundException если таск не существует, до того как мы начнём что-то менять',
      'Потому что filter не умеет работать с id напрямую',
      'Чтобы вернуть удалённый объект клиенту',
    ],
    correct: 1,
    explanation: 'Два преимущества: 1) findById проверяет существование и бросает 404 если нужно; 2) в deletedTask сохраняется объект который мы потом вернём клиенту. Если сразу фильтровать — не будет удобного способа вернуть удалённую запись.',
  },
  {
    id: 'c12',
    difficulty: 'hard',
    question: 'Чем принципиально отличается Object.assign от spread-оператора {...task, ...dto}?',
    options: [
      'Они идентичны по поведению',
      'Object.assign мутирует исходный объект, spread создаёт новый объект не меняя оригинал',
      'spread работает быстрее',
      'Object.assign не работает с классами',
    ],
    correct: 1,
    explanation: 'Object.assign(task, dto) — мутирует task. {...task, ...dto} — возвращает новый объект, task не изменяется. Для обновления в массиве по ссылке Object.assign проще. Для иммутабельного подхода — spread. В реальных ORM-проектах обычно используют spread.',
  },
  {
    id: 'c13',
    difficulty: 'hard',
    question: 'Что произойдёт с Partial<UpdateTaskDto> если клиент передаст пустое тело {} в PATCH-запросе?',
    options: [
      'NestJS вернёт 400 Bad Request автоматически',
      'dto будет пустым объектом {}, Object.assign ничего не изменит — таск вернётся без изменений',
      'TypeScript выдаст ошибку компиляции',
      'Сервер упадёт с исключением',
    ],
    correct: 1,
    explanation: 'Без ValidationPipe NestJS принимает любое тело без проверки. Пустой {} через Partial — технически валиден. Object.assign с пустым объектом ничего не меняет. Чтобы запретить пустой PATCH — нужны валидаторы class-validator (@IsOptional + @ValidateIf).',
  },
  {
    id: 'c14',
    difficulty: 'hard',
    question: 'Почему в методе delete мы делаем this.tasks = this.tasks.filter(...) вместо splice?',
    options: [
      'filter работает быстрее splice',
      'splice нельзя использовать в TypeScript',
      'filter возвращает новый массив — это безопаснее, чем мутировать массив во время итерации',
      'Это личное предпочтение, разницы нет',
    ],
    correct: 2,
    explanation: 'filter создаёт новый массив не меняя оригинал. splice мутирует массив in-place и требует знания индекса. С filter код чище и нет риска сместить индексы во время операции. В реальном проекте с ORM это всё не важно — там используется DELETE-запрос к БД.',
  },
  {
    id: 'c15',
    difficulty: 'hard',
    question: 'Идемпотентен ли PUT-запрос?',
    options: [
      'Нет, каждый вызов создаёт новый ресурс',
      'Да — повторный PUT с теми же данными даёт тот же результат, состояние не меняется',
      'Только если передать специальный заголовок',
      'Идемпотентность — свойство только GET',
    ],
    correct: 1,
    explanation: 'По спецификации HTTP, PUT идемпотентен: PUT /task/1 с одними и теми же данными сколько угодно раз — результат один и тот же. POST не идемпотентен (каждый вызов создаёт новую запись). PATCH формально не гарантирует идемпотентность, хотя в большинстве реализаций ведёт себя как PUT.',
  },
];
