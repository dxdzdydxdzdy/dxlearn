import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { StreamingDemo } from './StreamingDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './ProgressiveSsrArticle.module.scss';

export function ProgressiveSsrArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Проблема традиционного SSR</SectionTitle>
        <p className={s.prose}>
          В классическом SSR сервер собирает весь HTML — загружает все данные, рендерит все
          компоненты — и только потом отправляет клиенту. Страница с медленным блоком
          (комментарии, рекомендации) <strong>задерживает весь рендер</strong>, включая быстрые части.
        </p>
        <p className={s.prose}>
          <strong>Streaming SSR</strong> решает это: сервер отправляет HTML потоком, по мере готовности
          блоков. Пользователь видит заголовок и навигацию немедленно, медленные части
          появляются позже — с заглушками (skeletons) вместо них.
        </p>
        <StreamingDemo />
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>React Suspense как граница потока</SectionTitle>
        <CodeHighlight lang="js" code={`// app/page.tsx (Next.js App Router)
import { Suspense } from 'react';

export default function Page() {
  return (
    <main>
      {/* Отправляется немедленно */}
      <Header />
      <HeroSection />

      {/* Skeleton пока данные загружаются (~200ms) */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar /> {/* async Server Component */}
      </Suspense>

      {/* Skeleton пока данные загружаются (~800ms) */}
      <Suspense fallback={<ArticleListSkeleton />}>
        <ArticleList /> {/* медленный запрос к БД */}
      </Suspense>
    </main>
  );
}

// Async Server Component — данные прямо в компоненте
async function ArticleList() {
  const articles = await db.articles.findMany(); // не блокирует другие компоненты
  return articles.map(a => <ArticleCard key={a.id} article={a} />);
}`} />
        <Callout variant="accent">
          Каждый <code>{'<Suspense>'}</code> — это независимая граница потока. Next.js App Router
          автоматически стримит компоненты с данными через Suspense. Не нужно настраивать
          ничего вручную — используй <code>async</code> в Server Component и <code>Suspense</code> в родителе.
        </Callout>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>React Server Components</SectionTitle>
        <CodeHighlight lang="js" code={`// Server Component — запускается ТОЛЬКО на сервере
// Нет 'use client' = Server Component по умолчанию
async function ProductPage({ id }: { id: string }) {
  // Прямой доступ к БД — не нужен API endpoint
  const product = await db.products.findById(id);
  // Секреты (ключи API, строка БД) не попадают в JS бандл
  const reviews = await externalAPI.getReviews(id, process.env.API_KEY);

  return (
    <div>
      <h1>{product.name}</h1>
      {/* Интерактивный компонент — клиентский */}
      <Suspense fallback={<Spinner />}>
        <AddToCart productId={id} />  {/* 'use client' */}
      </Suspense>
      <ReviewList reviews={reviews} /> {/* Server Component */}
    </div>
  );
}
// Весь ProductPage и ReviewList = 0 байт JS в бандле клиента`} />
        <p className={s.prose}>
          RSC — не просто SSR. Сервер-компоненты никогда не гидратируются: браузер получает
          готовый HTML, <strong>без JS кода компонента</strong>. Только интерактивные
          компоненты (<code>'use client'</code>) добавляют JS в бандл.
        </p>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
