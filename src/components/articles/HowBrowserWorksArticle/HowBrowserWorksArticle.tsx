import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BrowserJourneyDemo } from './BrowserJourneyDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './HowBrowserWorksArticle.module.scss';

export function HowBrowserWorksArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Зачем разработчику знать, как работает браузер</h2>
        <p className={s.prose}>
          Когда пользователь жалуется «сайт долго грузится», ты должен знать где именно —
          DNS? Сервер? Рендер? Без понимания pipeline браузера ты слепой.
          Когда Lighthouse говорит "reduce TTFB" или "eliminate render-blocking resources" —
          это про конкретные этапы этого pipeline.
        </p>
        <p className={s.prose}>
          Ниже — анимированный путь от ввода URL до интерактивной страницы.
          Каждый шаг кликабелен: нажми на любой для деталей и dev-примечания.
        </p>
        <BrowserJourneyDemo />
      </section>

      {/* 2 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Задержки и как с ними работать</h2>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Этап</th><th>Типичная задержка</th><th>Как ускорить</th></tr>
          </thead>
          <tbody>
            {[
              ['DNS', '20–120ms', 'dns-prefetch, TTL кэширование, быстрый DNS-провайдер'],
              ['TCP + TLS', '50–200ms', 'HTTP/2 (переиспользует соединение), TLS 1.3, preconnect'],
              ['TTFB', '100ms–2s+', 'Серверный кэш (Redis), CDN, оптимизация БД-запросов'],
              ['Загрузка ресурсов', 'зависит от размера', 'Compression (gzip/brotli), CDN, HTTP/2 push, preload'],
              ['Рендер', '100ms–1s+', 'Critical CSS inline, defer/async JS, избегать layout thrashing'],
            ].map(([stage, delay, fix]) => (
              <tr key={stage} className={s.tableRow}>
                <td>{stage}</td>
                <td className={s.metricWarn}>{delay}</td>
                <td>{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 3 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Инструменты разработчика</h2>
        <CodeHighlight lang="bash" code={`# DevTools → Network Tab:
# - Waterfall: визуализация всех этапов загрузки
# - Timing: DNS / Initial connection / TTFB / Content Download
# - Headers: все заголовки запроса и ответа
# - "Disable cache": отключить кэш для чистого замера

# DevTools → Performance Tab:
# - Record: запись всего, что делает браузер (parsing, scripting, rendering)
# - FCP, LCP, CLS маркеры на таймлайне

# Lighthouse (DevTools → Lighthouse):
# - Автоматический аудит: Performance, SEO, Accessibility, PWA
# - Конкретные рекомендации с объяснением что и сколько это стоит`} />
        <Callout variant="info">
          Откроj DevTools (F12) → Network на любом сайте и наведи на первый HTML-запрос.
          Увидишь все этапы в Timing: DNS Lookup, Initial connection, SSL, TTFB, Content Download.
          Это самый быстрый способ диагностировать где тормоза.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Кэширование на каждом уровне</h2>
        <CodeHighlight lang="bash" code={`# Уровни кэша (от быстрого к медленному):
# 1. Memory cache      — уже загруженные ресурсы текущей вкладки
# 2. Service Worker    — программируемый кэш (PWA, офлайн)
# 3. HTTP cache        — disk cache браузера (Cache-Control, ETag)
# 4. DNS cache         — IP-адреса доменов
# 5. CDN cache         — ближайший edge-сервер
# 6. Server cache      — Redis, Memcached на бэкенде
# 7. DB query cache    — результаты запросов к БД`} />
        <p className={s.prose}>
          Если <code>Cache-Control: max-age=31536000, immutable</code> — браузер не пойдёт в сеть
          вообще целый год. Именно так работают JS/CSS бандлы с хэшем в имени
          (<code>main.a3f2b1c.js</code>) — при деплое имя меняется, кэш инвалидируется автоматически.
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
