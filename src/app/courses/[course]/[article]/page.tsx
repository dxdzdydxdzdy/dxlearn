import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, getArticle, courses } from '@/content/courses';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { EventLoopArticle } from '@/components/articles/EventLoopArticle/EventLoopArticle';
import { PromisesArticle } from '@/components/articles/PromisesArticle/PromisesArticle';
import { PrototypesArticle } from '@/components/articles/PrototypesArticle/PrototypesArticle';
import { CriticalRenderingPathArticle } from '@/components/articles/CriticalRenderingPathArticle/CriticalRenderingPathArticle';
import { CascadeArticle } from '@/components/articles/CascadeArticle/CascadeArticle';
import { FlexboxArticle } from '@/components/articles/FlexboxArticle/FlexboxArticle';
import { HttpRequestArticle } from '@/components/articles/HttpRequestArticle/HttpRequestArticle';
import { HowBrowserWorksArticle } from '@/components/articles/HowBrowserWorksArticle/HowBrowserWorksArticle';
import { OopArticle } from '@/components/articles/OopArticle/OopArticle';
import { ProgressiveSsrArticle } from '@/components/articles/ProgressiveSsrArticle/ProgressiveSsrArticle';
import { StorageArticle } from '@/components/articles/StorageArticle/StorageArticle';
import { CsrVsSsrArticle } from '@/components/articles/CsrVsSsrArticle/CsrVsSsrArticle';
import { BackendArticle } from '@/components/articles/BackendArticle/BackendArticle';
import { DevOpsArticle } from '@/components/articles/DevOpsArticle/DevOpsArticle';
import { LinuxArticle } from '@/components/articles/LinuxArticle/LinuxArticle';
import { DatabasesIntroArticle } from '@/components/articles/DatabasesIntroArticle/DatabasesIntroArticle';
import { DbKeysArticle } from '@/components/articles/DbKeysArticle/DbKeysArticle';
import { SqlQueriesArticle } from '@/components/articles/SqlQueriesArticle/SqlQueriesArticle';
import { SqlJoinsArticle } from '@/components/articles/SqlJoinsArticle/SqlJoinsArticle';
import { SqlDmlArticle } from '@/components/articles/SqlDmlArticle/SqlDmlArticle';
import { PostgresIndexesArticle } from '@/components/articles/PostgresIndexesArticle/PostgresIndexesArticle';
import { RestApiArticle } from '@/components/articles/RestApiArticle/RestApiArticle';
import { AuthJwtArticle } from '@/components/articles/AuthJwtArticle/AuthJwtArticle';
import { OAuthArticle } from '@/components/articles/OAuthArticle/OAuthArticle';
import { OwaspArticle } from '@/components/articles/OwaspArticle/OwaspArticle';
import { RedisArticle } from '@/components/articles/RedisArticle/RedisArticle';
import { MlHowItWorksArticle } from '@/components/articles/MlHowItWorksArticle/MlHowItWorksArticle';
import { LlmArchitectureArticle } from '@/components/articles/LlmArchitectureArticle/LlmArchitectureArticle';
import { EmbeddingsArticle } from '@/components/articles/EmbeddingsArticle/EmbeddingsArticle';
import { PlaceholderArticle } from '@/components/articles/PlaceholderArticle/PlaceholderArticle';
import s from './page.module.scss';

interface Props {
  params: Promise<{ course: string; article: string }>;
}

export async function generateStaticParams() {
  return courses.flatMap((c) =>
    c.articles.map((a) => ({ course: c.slug, article: a.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: cSlug, article: aSlug } = await params;
  const article = getArticle(cSlug, aSlug);
  return { title: article?.title ?? 'Not found' };
}

export default async function ArticlePage({ params }: Props) {
  const { course: cSlug, article: aSlug } = await params;
  const course = getCourse(cSlug);
  const article = getArticle(cSlug, aSlug);
  if (!course || !article) notFound();

  const articleIndex = course.articles.indexOf(article);
  const prevArticle = course.articles[articleIndex - 1];
  const nextArticle = course.articles[articleIndex + 1];

  function renderArticle() {
    if (cSlug === 'javascript' && aSlug === 'event-loop') return <EventLoopArticle />;
    if (cSlug === 'javascript' && aSlug === 'promises') return <PromisesArticle />;
    if (cSlug === 'javascript' && aSlug === 'prototypes') return <PrototypesArticle />;
    if (cSlug === 'browser' && aSlug === 'critical-rendering-path') return <CriticalRenderingPathArticle />;
    if (cSlug === 'general' && aSlug === 'http-request') return <HttpRequestArticle />;
    if (cSlug === 'general' && aSlug === 'how-browser-works') return <HowBrowserWorksArticle />;
    if (cSlug === 'general' && aSlug === 'oop') return <OopArticle />;
    if (cSlug === 'general' && aSlug === 'progressive-ssr') return <ProgressiveSsrArticle />;
    if (cSlug === 'general' && aSlug === 'storage') return <StorageArticle />;
    if (cSlug === 'general' && aSlug === 'csr-vs-ssr') return <CsrVsSsrArticle />;
    if (cSlug === 'css' && aSlug === 'cascade') return <CascadeArticle />;
    if (cSlug === 'css' && aSlug === 'flexbox') return <FlexboxArticle />;
    if (cSlug === 'backend' && aSlug === 'backend-roadmap') return <BackendArticle />;
    if (cSlug === 'backend' && aSlug === 'rest-api-design') return <RestApiArticle />;
    if (cSlug === 'backend' && aSlug === 'auth-jwt')        return <AuthJwtArticle />;
    if (cSlug === 'backend' && aSlug === 'oauth-openid')   return <OAuthArticle />;
    if (cSlug === 'backend' && aSlug === 'owasp-top10')    return <OwaspArticle />;
    if (cSlug === 'backend' && aSlug === 'redis-basics')   return <RedisArticle />;
    if (cSlug === 'databases' && aSlug === 'databases-intro') return <DatabasesIntroArticle />;
    if (cSlug === 'databases' && aSlug === 'db-keys') return <DbKeysArticle />;
    if (cSlug === 'databases' && aSlug === 'sql-queries') return <SqlQueriesArticle />;
    if (cSlug === 'databases' && aSlug === 'sql-joins')   return <SqlJoinsArticle />;
    if (cSlug === 'databases' && aSlug === 'sql-dml')          return <SqlDmlArticle />;
    if (cSlug === 'databases' && aSlug === 'postgresql-indexes') return <PostgresIndexesArticle />;
    if (cSlug === 'devops' && aSlug === 'what-devops-knows') return <DevOpsArticle />;
    if (cSlug === 'devops' && aSlug === 'linux-basics') return <LinuxArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ml-how-it-works') return <MlHowItWorksArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'llm-architecture') return <LlmArchitectureArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'embeddings') return <EmbeddingsArticle />;
    return <PlaceholderArticle title={article!.title} />;
  }

  return (
    <div className={s.wrapper}>
      <div className={s.sidebar}>
        <Sidebar />
      </div>

      <main className={s.main}>
        <article className={s.article}>
          <nav className={s.breadcrumb}>
            <Link href="/courses">courses</Link>
            <span>/</span>
            <Link href={`/courses/${cSlug}`}>{course.title}</Link>
            <span>/</span>
            <span>{article.title}</span>
          </nav>

          <div className={s.titleBlock}>
            <h1 className={s.articleTitle}>{article.title}</h1>
            <p className={s.articleDesc}>{article.description}</p>
            {article.tags && (
              <div className={s.tags}>
                {article.tags.map((tag) => (
                  <span key={tag} className={s.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {renderArticle()}

          <nav className={s.nav}>
            {prevArticle ? (
              <Link href={`/courses/${cSlug}/${prevArticle.slug}`} className={s.navLink}>
                <span className={s.navLabel}>← prev</span>
                <span className={s.navTitle}>{prevArticle.title}</span>
              </Link>
            ) : <div />}

            {nextArticle && (
              <Link href={`/courses/${cSlug}/${nextArticle.slug}`} className={`${s.navLink} ${s.right}`}>
                <span className={s.navLabel}>next →</span>
                <span className={s.navTitle}>{nextArticle.title}</span>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </div>
  );
}
