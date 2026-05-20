import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { PolymorphismDemo } from './PolymorphismDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './OopArticle.module.scss';

const PILLARS = [
  { icon: '🔒', title: 'Инкапсуляция', text: <>Скрываем детали реализации, открываем только нужный API. <code>private</code> поля и методы. Завтра изменишь внутреннюю логику — внешний код не сломается.</> },
  { icon: '🧬', title: 'Наследование', text: <>Дочерний класс получает методы родителя через <code>extends</code>. Переиспользование кода без дублирования. Но злоупотребление ведёт к хрупкой иерархии.</> },
  { icon: '🎭', title: 'Полиморфизм', text: <>Один интерфейс — разные реализации. Функция принимает <code>Animal</code>, работает с <code>Dog</code>, <code>Cat</code>, <code>Fish</code> без изменений.</> },
  { icon: '🎨', title: 'Абстракция', text: <>Работаем с концепциями, скрывая детали. <code>db.save(user)</code> — не знаешь (и не должен) что внутри: SQL, MongoDB или файл.</> },
];

export function OopArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Зачем ООП в современной разработке</h2>
        <p className={s.prose}>
          ООП — не религия, а инструмент. Когда проект растёт, <strong>организация кода становится
          критичной</strong>. ООП даёт словарь: классы, интерфейсы, наследование — это способ описать
          структуру большой системы так, чтобы разные части не мешали друг другу.
        </p>
        <p className={s.prose}>
          В React ты используешь ООП концепции каждый день — компоненты похожи на классы,
          props — это интерфейс. NestJS, TypeORM, Angular строятся на классах и декораторах.
          Понимание ООП помогает читать чужой код и проектировать свой.
        </p>
        <div className={s.pillars}>
          {PILLARS.map(p => (
            <div key={p.title} className={s.pillar}>
              <div className={s.pillarIcon}>{p.icon}</div>
              <div className={s.pillarTitle}>{p.title}</div>
              <div className={s.pillarText}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Полиморфизм: один код, разное поведение</h2>
        <p className={s.prose}>
          Самый мощный инструмент ООП. Функция написана один раз — работает с любым объектом,
          реализующим нужный интерфейс. Меняй параметры фигур ниже и наблюдай как один вызов
          <code>area()</code> даёт разные результаты.
        </p>
        <PolymorphismDemo />
      </section>

      {/* 3 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Инкапсуляция: приватные поля и методы</h2>
        <CodeHighlight lang="js" code={`class UserService {
  #users = new Map(); // приватно — снаружи не видно

  add(user) {
    this.#validate(user); // приватный метод
    this.#users.set(user.id, user);
  }

  get(id) { return this.#users.get(id); }

  #validate(user) {
    if (!user.email.includes('@')) throw new Error('Invalid email');
  }
}

const svc = new UserService();
svc.add({ id: 1, email: 'alex@test.com' });
// svc.#users → SyntaxError: приватное поле
// svc.#validate() → SyntaxError`} />
        <Callout variant="info">
          В TypeScript <code>private</code> — это compile-time проверка. В JavaScript <code>#field</code> —
          настоящая runtime-приватность. Для production-кода лучше <code>#</code>.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Композиция vs Наследование</h2>
        <CodeHighlight lang="js" code={`// ❌ Глубокая иерархия — хрупко
class Animal extends LivingThing {}
class Pet extends Animal {}
class Dog extends Pet {}
// Dog несёт всё из 3 классов, изменение любого ломает цепочку

// ✓ Композиция — гибко
class Dog {
  constructor(
    private mover = new Walker(),
    private speaker = new Barker(),
    private tracker = new GPSTracker(),
  ) {}
  move() { return this.mover.move(); }
  speak() { return this.speaker.speak(); }
}
// Каждая часть независима, тестируется отдельно
// Хочешь летающую собаку? Замени Walker на Flyer`} />
        <p className={s.prose}>
          Правило: наследуй <strong>что-то есть</strong> (Dog — это Animal).
          Используй композицию для <strong>что-то умеет</strong> (Dog умеет бегать, лаять, следить через GPS).
        </p>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Самопроверка</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
