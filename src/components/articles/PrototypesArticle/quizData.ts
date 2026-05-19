import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'proto1',
    difficulty: 'easy',
    code: `function Dog(name) { this.name = name; }
Dog.prototype.bark = function() { return 'woof'; };

const d = new Dog('Rex');
console.log(d.bark());`,
    question: 'Что выведет console.log?',
    options: ['"woof"', 'undefined', 'ошибка: bark is not a function', 'null'],
    correct: 0,
    explanation:
      'd.bark() не найден как собственное свойство объекта d, поэтому движок идёт по прототипной цепочке к Dog.prototype — и находит там bark. Метод вызывается в контексте d, this.name === "Rex".',
  },
  {
    id: 'proto2',
    difficulty: 'easy',
    code: `const obj = { x: 1 };
const child = Object.create(obj);
child.y = 2;

console.log(child.hasOwnProperty('x'));
console.log(child.hasOwnProperty('y'));`,
    question: 'Что выведет консоль?',
    options: ['true, true', 'false, true', 'true, false', 'false, false'],
    correct: 1,
    explanation:
      'x принадлежит прототипу (obj), а не самому child — hasOwnProperty возвращает false. y добавлен напрямую в child — собственное свойство — true.',
  },
  {
    id: 'proto3',
    difficulty: 'medium',
    code: `function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);

const d = new Dog();
console.log(d instanceof Animal);
console.log(d instanceof Dog);`,
    question: 'Что выведет консоль?',
    options: ['false, true', 'true, false', 'true, true', 'false, false'],
    correct: 2,
    explanation:
      'После Dog.prototype = Object.create(Animal.prototype) цепочка: d → Dog.prototype → Animal.prototype → Object.prototype → null. instanceof проверяет, есть ли prototype конструктора где-либо в цепочке — оба условия выполняются.',
  },
  {
    id: 'proto4',
    difficulty: 'medium',
    code: `function Foo() {}
console.log(Foo.prototype.constructor === Foo);`,
    question: 'Что выведет console.log?',
    options: ['true', 'false', 'undefined', 'ошибка'],
    correct: 0,
    explanation:
      'По умолчанию каждая функция получает свойство prototype — объект с единственным свойством constructor, которое ссылается обратно на саму функцию. Foo.prototype.constructor === Foo — всегда true (пока вы не перезапишете prototype целиком).',
  },
  {
    id: 'proto5',
    difficulty: 'hard',
    code: `class Animal {
  speak() { return 'generic'; }
}
class Dog extends Animal {
  speak() { return 'woof'; }
}
const d = new Dog();
console.log(Object.getPrototypeOf(d) === Dog.prototype);
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);`,
    question: 'Что выведет консоль?',
    options: ['false, false', 'true, false', 'false, true', 'true, true'],
    correct: 3,
    explanation:
      'class — синтаксический сахар над прототипным наследованием. extends выстраивает точно такую же цепочку: экземпляр → Dog.prototype → Animal.prototype → Object.prototype → null. Оба утверждения верны.',
  },
  {
    id: 'proto6',
    difficulty: 'hard',
    code: `const a = { val: 1 };
const b = Object.create(a);
const c = Object.create(b);

b.val = 99;
console.log(c.val);
console.log(a.val);`,
    question: 'Что выведет консоль?',
    options: ['1, 1', '99, 99', '99, 1', '1, 99'],
    correct: 2,
    explanation:
      'c.val ищется в цепочке c → b → a. b.val = 99 — собственное свойство b, оно найдено первым: 99. a.val не изменялся — остаётся 1. Запись в b не затрагивает a, даже если b наследует от a.',
  },
];
