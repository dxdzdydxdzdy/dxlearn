import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pssr1',
    difficulty: 'easy',
    code: `// Традиционный SSR
// 1. Запрос к серверу
// 2. Сервер загружает ВСЕ данные (пользователь, посты, комментарии)
// 3. Рендерит HTML целиком
// 4. Отправляет HTML клиенту → FCP`,
    question: 'Какая главная проблема традиционного SSR?',
    options: [
      'HTML слишком большой для передачи',
      'FCP откладывается до загрузки самых медленных данных',
      'Браузер не умеет рендерить серверный HTML',
      'SSR не поддерживает React компоненты',
    ],
    correct: 1,
    explanation:
      'Если комментарии загружаются 2 секунды — пользователь видит белый экран все 2 секунды, даже если основной контент готов за 200ms. Streaming SSR решает это: отправляет готовые части немедленно, не дожидаясь медленных данных.',
  },
  {
    id: 'pssr2',
    difficulty: 'easy',
    code: `// Next.js App Router
async function Page() {
  return (
    <>
      <Header />        {/* мгновенно */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent /> {/* загружается асинхронно */}
      </Suspense>
    </>
  );
}`,
    question: 'Что увидит пользователь, пока SlowComponent загружает данные?',
    options: [
      'Белый экран до полной загрузки SlowComponent',
      'Header сразу, а вместо SlowComponent — Skeleton',
      'Только Skeleton, Header появится потом',
      'Ошибку — нельзя использовать async в Server Component',
    ],
    correct: 1,
    explanation:
      'Suspense с fallback = граница потока. Сервер немедленно отправляет HTML с Header и Skeleton. Когда SlowComponent завершит загрузку данных, сервер "вставит" его HTML в поток, заменив Skeleton. Пользователь видит контент постепенно, FCP происходит быстро.',
  },
  {
    id: 'pssr3',
    difficulty: 'medium',
    code: `// Что происходит после получения HTML от сервера?
// 1. Браузер показывает HTML контент (FCP)
// 2. Загружается JS bundle
// 3. React "подключается" к существующему DOM
// Шаг 3 называется...`,
    question: 'Что такое гидратация (hydration) и зачем она нужна?',
    options: [
      'Загрузка данных с сервера через fetch',
      'React берёт серверный HTML и добавляет к нему обработчики событий и интерактивность',
      'Сжатие HTML перед отправкой клиенту',
      'Синхронизация состояния между сервером и клиентом через WebSocket',
    ],
    correct: 1,
    explanation:
      'Серверный HTML — статичный, без обработчиков. Гидратация: React в браузере обходит тот же DOM и "вешает" onClick, useState, useEffect на существующие элементы. До гидратации страница выглядит готовой, но кнопки не работают. Время от FCP до интерактивности — это время гидратации (TTI - FCP).',
  },
  {
    id: 'pssr4',
    difficulty: 'hard',
    code: `// Server Component (НЕТ 'use client')
async function UserProfile({ id }: { id: string }) {
  const user = await db.users.findById(id); // прямо в компоненте!
  return <div>{user.name}</div>;
}

// Client Component
'use client';
function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(true)}>Like</button>;
}`,
    question: 'Почему React Server Components — это новая парадигма, а не просто SSR?',
    options: [
      'Server Components работают быстрее Client Components',
      'Server Components могут обращаться к БД без API, не добавляют JS в бандл, и их данные не гидратируются',
      'Server Components заменяют Redux для управления состоянием',
      'Разницы нет — это просто другое название для SSR компонентов',
    ],
    correct: 1,
    explanation:
      'RSC = ноль клиентского JS для серверных компонентов. UserProfile: нет JS в бандле, нет гидратации, данные БД прямо в компоненте без REST API. Ты платишь JS-стоимостью только за интерактивные компоненты (use client). Это фундаментально меняет размер бандла и время гидратации для data-heavy приложений.',
  },
];
