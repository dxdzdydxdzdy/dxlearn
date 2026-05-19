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
    if (cSlug === 'css' && aSlug === 'cascade') return <CascadeArticle />;
    if (cSlug === 'css' && aSlug === 'flexbox') return <FlexboxArticle />;
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
