import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'oop1',
    difficulty: 'easy',
    code: `class BankAccount {
  #balance = 0; // приватное поле

  deposit(amount: number) { this.#balance += amount; }
  getBalance() { return this.#balance; }
}
const acc = new BankAccount();
acc.deposit(100);
console.log(acc.#balance); // ?`,
    question: 'Что произойдёт при обращении к acc.#balance снаружи класса?',
    options: ['Вернёт 100', 'Вернёт undefined', 'SyntaxError — приватное поле недоступно', 'TypeError'],
    correct: 2,
    explanation:
      'Приватные поля (#field) — это инкапсуляция. Доступ снаружи класса — SyntaxError на этапе компиляции/парсинга. Смысл инкапсуляции: скрыть детали реализации, предоставив только публичный API (deposit, getBalance). Если завтра изменить логику хранения баланса — внешний код не сломается.',
  },
  {
    id: 'oop2',
    difficulty: 'easy',
    code: `class Animal {
  constructor(public name: string) {}
  speak() { return 'generic sound'; }
}
class Dog extends Animal {
  speak() { return 'woof!'; }
}
class Cat extends Animal {
  speak() { return 'meow!'; }
}

const animals: Animal[] = [new Dog('Rex'), new Cat('Luna')];
animals.forEach(a => console.log(a.speak()));`,
    question: 'Что выведет console.log и какой принцип ООП это демонстрирует?',
    options: [
      '"generic sound", "generic sound" — всегда вызывается базовый метод',
      '"woof!", "meow!" — полиморфизм',
      'Ошибка — нельзя хранить Dog и Cat в массиве Animal',
      '"woof!", "generic sound" — только первый класс переопределяет метод',
    ],
    correct: 1,
    explanation:
      'Полиморфизм: один и тот же вызов a.speak() дает разный результат в зависимости от реального типа объекта. Массив типа Animal[] может хранить любых потомков — это позволяет писать обобщённый код (forEach) который работает со всеми видами Animal без if/switch.',
  },
  {
    id: 'oop3',
    difficulty: 'medium',
    code: `// Вариант A: наследование
class Logger extends EventEmitter {
  log(msg: string) { /* ... */ }
}

// Вариант B: композиция
class Logger {
  constructor(private emitter: EventEmitter) {}
  log(msg: string) { this.emitter.emit('log', msg); }
}`,
    question: 'Почему опытные разработчики предпочитают композицию (Б) над наследованием (А)?',
    options: [
      'Композиция работает быстрее в runtime',
      'Наследование не работает в TypeScript',
      'Композиция гибче: можно подменить emitter, проще тестировать, нет проблемы хрупкого базового класса',
      'Разницы нет — это просто синтаксические различия',
    ],
    correct: 2,
    explanation:
      'Наследование создаёт жёсткую связь: Logger обязан быть EventEmitter, берёт все его методы (нужные и нет). Хрупкий базовый класс: изменение EventEmitter ломает Logger. Композиция: Logger использует EventEmitter, но не является им. Можно передать mock в тестах, заменить реализацию без изменения Logger. "Prefer composition over inheritance" — классика GoF.',
  },
  {
    id: 'oop4',
    difficulty: 'medium',
    code: `interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

class User implements Serializable {
  constructor(public name: string) {}
  serialize() { return JSON.stringify({ name: this.name }); }
  deserialize(data: string) { this.name = JSON.parse(data).name; }
}`,
    question: 'Зачем использовать interface вместо прямого описания методов в классе?',
    options: [
      'Interface работает быстрее, чем прямые методы',
      'Interface позволяет писать код против контракта, не зависеть от конкретного класса',
      'В TypeScript нельзя добавить методы в класс без interface',
      'Interface обязателен для методов с параметрами',
    ],
    correct: 1,
    explanation:
      'Функция save(item: Serializable) работает с любым классом, реализующим Serializable — User, Post, Settings. Добавишь новый класс — save() не нужно менять. Это принцип открытости/закрытости (Open/Closed): открыт для расширения (новые классы), закрыт для модификации (save не меняется).',
  },
  {
    id: 'oop5',
    difficulty: 'hard',
    code: `class Service {
  private db: Database;
  constructor() {
    this.db = new PostgresDatabase(); // жёсткая зависимость
  }
}

// vs Dependency Injection:
class Service {
  constructor(private db: Database) {} // зависимость снаружи
}
const service = new Service(new PostgresDatabase());
const testService = new Service(new MockDatabase()); // для тестов`,
    question: 'Что такое Dependency Injection и зачем он нужен?',
    options: [
      'Способ ускорить создание объектов через кэширование',
      'Паттерн, при котором объект получает зависимости снаружи, а не создаёт их сам',
      'Синтаксический сахар над import',
      'Способ автоматически вызывать конструктор при импорте',
    ],
    correct: 1,
    explanation:
      'DI — практическое применение инверсии зависимостей (принцип D в SOLID). Service с жёсткой зависимостью нельзя тестировать без реальной БД. С DI: передаём MockDatabase в тестах, PostgresDatabase в проде. Это же позволяет легко менять реализации (SQLite → Postgres) не трогая Service. NestJS, Angular строятся на DI-контейнерах.',
  },
];
