import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { ProtoChainDemo } from './ProtoChainDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './PrototypesArticle.module.scss';

export function PrototypesArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Прототипное наследование</h2>
        <p className={s.prose}>
          В Java или C++ классы — это шаблоны, из которых создаются объекты. В JavaScript
          классов в классическом смысле не существует: каждый объект напрямую наследует от другого объекта.
          Это называется <strong>прототипным наследованием</strong>.
        </p>
        <p className={s.prose}>
          У каждого объекта есть внутренняя ссылка <code>[[Prototype]]</code> — она указывает
          на другой объект (или <code>null</code>). Когда вы обращаетесь к свойству, которого нет
          у объекта, движок идёт по этой ссылке вверх до тех пор, пока не найдёт свойство
          или не дойдёт до <code>null</code>.
        </p>
        <CodeHighlight lang="js" code={`const animal = { isAlive: true, eat() { return 'nom'; } };
const dog = Object.create(animal); // [[Prototype]] dog → animal
dog.name = 'Rex';

console.log(dog.name);    // 'Rex'    — собственное свойство
console.log(dog.isAlive); // true     — найдено в прототипе
console.log(dog.eat());   // 'nom'    — метод из прототипа
console.log(Object.getPrototypeOf(dog) === animal); // true`} />
      </section>

      {/* 2 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Цепочка прототипов</h2>
        <p className={s.prose}>
          Поиск свойства идёт по цепочке: объект → его прототип → прототип прототипа → … → <code>null</code>.
          Введи имя свойства и посмотри, как движок обходит узлы.
        </p>
        <ProtoChainDemo />
        <p className={s.prose}>
          Все обычные объекты в конце цепочки имеют <code>Object.prototype</code> — именно оттуда
          берутся <code>toString()</code>, <code>hasOwnProperty()</code> и другие универсальные методы.
          Получить или задать прототип можно через <code>Object.getPrototypeOf()</code> /
          <code>Object.setPrototypeOf()</code>.
        </p>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Функции-конструкторы и new</h2>
        <p className={s.prose}>
          До появления классов объекты создавали через <strong>функции-конструкторы</strong>.
          Ключевое слово <code>new</code> делает четыре вещи:
        </p>
        <div className={s.stepList}>
          {[
            ['01', 'Создаёт пустой объект: {}'],
            ['02', <>Устанавливает <code>[[Prototype]]</code> этого объекта равным <code>Конструктор.prototype</code></>],
            ['03', <>Вызывает конструктор, передавая новый объект как <code>this</code></>],
            ['04', <>Возвращает <code>this</code> (если конструктор сам не возвращает объект)</>],
          ].map(([num, text]) => (
            <div key={String(num)} className={s.step}>
              <span className={s.stepNum}>{num}</span>
              <span className={s.stepText}>{text}</span>
            </div>
          ))}
        </div>
        <CodeHighlight lang="js" code={`function Dog(name, breed) {
  this.name = name;
  this.breed = breed;
}

Dog.prototype.speak = function() {
  return \`\${this.name} says: woof!\`;
};

const rex = new Dog('Rex', 'Husky');
const bob = new Dog('Bob', 'Poodle');

console.log(rex.speak()); // 'Rex says: woof!'
console.log(bob.speak()); // 'Bob says: woof!'

// Метод один в памяти — оба объекта наследуют из Dog.prototype
console.log(rex.speak === bob.speak); // true`} />
        <Callout variant="info">
          Свойство <code>prototype</code> есть только у функций. Это обычный объект,
          который становится прототипом всех экземпляров, созданных через <code>new ЭтаФункция()</code>.
          Не путай его с <code>[[Prototype]]</code> — внутренней ссылкой любого объекта.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Object.create()</h2>
        <p className={s.prose}>
          <code>Object.create(proto)</code> создаёт новый объект и явно задаёт его прототип.
          Это самый прямолинейный способ настроить цепочку без функций-конструкторов.
        </p>
        <CodeHighlight lang="js" code={`const vehicleProto = {
  move() { return \`\${this.type} едет\`; },
  stop() { return \`\${this.type} стоит\`; },
};

const car = Object.create(vehicleProto);
car.type = 'Машина';
car.doors = 4;

console.log(car.move()); // 'Машина едет'
console.log(Object.getPrototypeOf(car) === vehicleProto); // true

// Создание объекта без прототипа вообще:
const bare = Object.create(null);
console.log(bare.toString); // undefined — нет Object.prototype в цепочке`} />
      </section>

      {/* 5 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Классы ES6 — синтаксический сахар</h2>
        <p className={s.prose}>
          Синтаксис <code>class</code>, появившийся в ES6, не вводит новую модель наследования.
          Под капотом это те же функции-конструкторы и прототипы — просто записанные иначе.
        </p>
        <CodeHighlight lang="js" code={`class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return \`\${this.name} издаёт звук\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name}: гав!\`;
  }
  fetch(item) {
    return \`\${this.name} принёс \${item}\`;
  }
}

const d = new Dog('Rex');
console.log(d.speak());        // 'Rex: гав!'
console.log(d.fetch('мяч'));   // 'Rex принёс мяч'
console.log(d instanceof Dog);    // true
console.log(d instanceof Animal); // true

// Это та же цепочка прототипов:
// d → Dog.prototype → Animal.prototype → Object.prototype → null`} />
        <Callout variant="accent">
          <code>typeof Dog === 'function'</code> — класс это функция. <code>extends</code> настраивает
          прототипную цепочку автоматически. <code>super()</code> в конструкторе вызывает родительский
          конструктор и обязателен, если вы используете <code>extends</code>.
        </Callout>
        <CodeHighlight lang="js" code={`// class Dog extends Animal эквивалентен:
function Dog(name) {
  Animal.call(this, name); // super()
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() { return this.name + ': гав!'; };`} />
      </section>

      {/* 6 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Проверка цепочки</h2>
        <CodeHighlight lang="js" code={`const d = new Dog('Rex');

// instanceof — есть ли Foo.prototype в цепочке?
console.log(d instanceof Dog);            // true
console.log(d instanceof Animal);         // true
console.log(d instanceof Object);         // true

// getPrototypeOf — вернуть прямой прототип
console.log(Object.getPrototypeOf(d) === Dog.prototype); // true

// hasOwnProperty — собственное ли свойство?
d.name = 'Rex'; // собственное
console.log(d.hasOwnProperty('name'));  // true
console.log(d.hasOwnProperty('speak')); // false (в прототипе)

// in — есть ли свойство где угодно в цепочке?
console.log('speak' in d);  // true
console.log('eat' in d);    // true (из Animal.prototype)`} />
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Инструмент</th><th>Что проверяет</th><th>Учитывает прототипы</th></tr>
          </thead>
          <tbody>
            {[
              ['instanceof Foo', 'Foo.prototype в цепочке?', 'Да'],
              ['hasOwnProperty(key)', 'Собственное свойство?', 'Нет'],
              ['"key" in obj', 'Есть ли свойство?', 'Да'],
              ['Object.getPrototypeOf(obj)', 'Прямой прототип', '—'],
            ].map(([tool, desc, proto]) => (
              <tr key={tool} className={s.tableRow}>
                <td><code>{tool}</code></td>
                <td>{desc}</td>
                <td>{proto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 7 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Самопроверка</h2>
        <p className={s.prose}>6 задач — от базового поиска по цепочке до тонкостей наследования.</p>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
