import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { RenderingTimeline } from './RenderingTimeline';
import { QUIZ_QUESTIONS } from './quizData';
import s from './CsrVsSsrArticle.module.scss';

export function CsrVsSsrArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Зачем это знать</h2>
        <p className={s.prose}>
          Выбор стратегии рендеринга влияет на SEO, скорость загрузки, серверные расходы и DX.
          Нет универсального ответа — <strong>каждый подход решает свои задачи</strong>.
          Ниже — анимированное сравнение: нажми simulate и посмотри когда появляется контент.
        </p>
        <RenderingTimeline />
      </section>

      {/* 2 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>CSR — Client-Side Rendering</h2>
        <CodeHighlight lang="html" code={`<!-- Что получает браузер от сервера: -->
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>  <!-- пусто! -->
    <script src="/bundle.js"></script>  <!-- всё в JS -->
  </body>
</html>

<!-- После загрузки и выполнения JS: React рендерит всё в div#root -->`} />
        <table className={s.table}>
          <thead className={s.tableHead}><tr><th>Плюсы CSR</th><th>Минусы CSR</th></tr></thead>
          <tbody>
            {[
              ['Богатый интерактив без перезагрузок', 'Белый экран до загрузки JS'],
              ['Сервер отдаёт только статику', 'Плохой SEO (поисковики видят пустой div)'],
              ['Идеален для авторизованных SPA', 'Долгий TTI при большом бандле'],
            ].map(([plus, minus], i) => (
              <tr key={i} className={s.tableRow}>
                <td className={s.good}>{plus}</td>
                <td className={s.bad}>{minus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={s.prose}><strong>Когда CSR:</strong> дашборды, SaaS-приложения, авторизованные зоны — где SEO не нужен, а интерактивность важна.</p>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>SSR — Server-Side Rendering</h2>
        <CodeHighlight lang="js" code={`// Next.js App Router (SSR по умолчанию)
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  // Выполняется на СЕРВЕРЕ при каждом запросе
  const product = await fetch(\`/api/products/\${params.id}\`, {
    cache: 'no-store', // всегда свежие данные
  }).then(r => r.json());

  // Сервер возвращает готовый HTML с данными
  return <ProductView product={product} />;
}`} />
        <p className={s.prose}><strong>Когда SSR:</strong> страницы с пользовательскими данными (профиль, корзина), реалтайм контент, A/B тесты — когда нужен свежий контент с SEO.</p>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>SSG и ISR — статика с умом</h2>
        <CodeHighlight lang="js" code={`// SSG: генерация при сборке
// next.config → output: 'export'
// или в App Router: без cache: 'no-store' → кэшируется по умолчанию

// ISR: пересборка по таймеру
export default async function BlogPost({ params }) {
  const post = await fetch(\`/api/posts/\${params.slug}\`, {
    next: { revalidate: 3600 }, // пересобрать раз в час
  }).then(r => r.json());
  return <Article post={post} />;
}

// generateStaticParams: предгенерировать популярные страницы
export async function generateStaticParams() {
  const slugs = await fetch('/api/posts/slugs').then(r => r.json());
  return slugs.map(slug => ({ slug }));
}`} />
        <Callout variant="info">
          ISR = лучшее из обоих миров: скорость CDN + свежесть данных. "Stale-while-revalidate"
          на уровне страниц — пользователь получает быстрый ответ, сборка идёт в фоне.
        </Callout>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Шпаргалка выбора</h2>
        <table className={s.table}>
          <thead className={s.tableHead}><tr><th>Если нужно...</th><th>Используй</th></tr></thead>
          <tbody>
            {[
              ['SEO + реалтайм данные', 'SSR'],
              ['SEO + редко меняющийся контент', 'SSG или ISR'],
              ['Максимальная скорость, нет SEO', 'SSG с CDN'],
              ['Авторизованный пользователь, SPA', 'CSR'],
              ['Смешанный контент (shell + данные)', 'SSR + Streaming + RSC'],
              ['Документация, блог, маркетинг', 'SSG'],
            ].map(([need, solution]) => (
              <tr key={need} className={s.tableRow}>
                <td>{need}</td>
                <td className={s.good}>{solution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Самопроверка</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
