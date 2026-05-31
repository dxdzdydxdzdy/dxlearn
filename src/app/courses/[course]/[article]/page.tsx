import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, getArticle, courses } from '@/content/courses';
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar/CollapsibleSidebar';
import { EventLoopArticle } from '@/components/articles/EventLoopArticle/EventLoopArticle';
import { PromisesArticle } from '@/components/articles/PromisesArticle/PromisesArticle';
import { PrototypesArticle } from '@/components/articles/PrototypesArticle/PrototypesArticle';
import { CriticalRenderingPathArticle } from '@/components/articles/CriticalRenderingPathArticle/CriticalRenderingPathArticle';
import { CascadeArticle } from '@/components/articles/CascadeArticle/CascadeArticle';
import { FlexboxArticle } from '@/components/articles/FlexboxArticle/FlexboxArticle';
import { HttpRequestArticle } from '@/components/articles/HttpRequestArticle/HttpRequestArticle';
import { HowBrowserWorksArticle } from '@/components/articles/HowBrowserWorksArticle/HowBrowserWorksArticle';
import { WhatIsBrowserArticle } from '@/components/articles/WhatIsBrowserArticle/WhatIsBrowserArticle';
import { OopArticle } from '@/components/articles/OopArticle/OopArticle';
import { ProgressiveSsrArticle } from '@/components/articles/ProgressiveSsrArticle/ProgressiveSsrArticle';
import { StorageArticle } from '@/components/articles/StorageArticle/StorageArticle';
import { CsrVsSsrArticle } from '@/components/articles/CsrVsSsrArticle/CsrVsSsrArticle';
import { BackendArticle } from '@/components/articles/BackendArticle/BackendArticle';
import { NodejsBasicsArticle } from '@/components/articles/NodejsBasicsArticle/NodejsBasicsArticle';
import { HttpServerBasicsArticle } from '@/components/articles/HttpServerBasicsArticle/HttpServerBasicsArticle';
import { ExpressBasicsArticle } from '@/components/articles/ExpressBasicsArticle/ExpressBasicsArticle';
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
import { AiApiArticle } from '@/components/articles/AiApiArticle/AiApiArticle';
import { PromptEngineeringArticle } from '@/components/articles/PromptEngineeringArticle/PromptEngineeringArticle';
import { RagArchitectureArticle } from '@/components/articles/RagArchitectureArticle/RagArchitectureArticle';
import { VectorDatabasesArticle } from '@/components/articles/VectorDatabasesArticle/VectorDatabasesArticle';
import { AiAgentsArticle } from '@/components/articles/AiAgentsArticle/AiAgentsArticle';
import { AiFrameworksArticle } from '@/components/articles/AiFrameworksArticle/AiFrameworksArticle';
import { FineTuningArticle } from '@/components/articles/FineTuningArticle/FineTuningArticle';
import { MlTrainingLoopArticle } from '@/components/articles/MlTrainingLoopArticle/MlTrainingLoopArticle';
import { AiInProductionArticle } from '@/components/articles/AiInProductionArticle/AiInProductionArticle';
import { AiSafetyArticle } from '@/components/articles/AiSafetyArticle/AiSafetyArticle';
import { BigOArticle } from '@/components/articles/BigOArticle/BigOArticle';
import { BinarySearchArticle } from '@/components/articles/BinarySearchArticle/BinarySearchArticle';
import { TwoPointersArticle } from '@/components/articles/TwoPointersArticle/TwoPointersArticle';
import { SlidingWindowArticle } from '@/components/articles/SlidingWindowArticle/SlidingWindowArticle';
import { SortingArticle } from '@/components/articles/SortingArticle/SortingArticle';
import { PackageManagersArticle } from '@/components/articles/PackageManagersArticle/PackageManagersArticle';
import { GitBasicsArticle } from '@/components/articles/GitBasicsArticle/GitBasicsArticle';
import { GitStartArticle } from '@/components/articles/GitStartArticle/GitStartArticle';
import { GitHistoryArticle } from '@/components/articles/GitHistoryArticle/GitHistoryArticle';
import { GitBranchesArticle } from '@/components/articles/GitBranchesArticle/GitBranchesArticle';
import { GitRemoteArticle } from '@/components/articles/GitRemoteArticle/GitRemoteArticle';
import { GitUndoArticle } from '@/components/articles/GitUndoArticle/GitUndoArticle';
import { ReactIntroArticle } from '@/components/articles/ReactIntroArticle/ReactIntroArticle';
import { JSXArticle } from '@/components/articles/JSXArticle/JSXArticle';
import { ComponentsPropsArticle } from '@/components/articles/ComponentsPropsArticle/ComponentsPropsArticle';
import { NestjsIntroArticle } from '@/components/articles/NestjsIntroArticle/NestjsIntroArticle';
import { NestjsRestArticle } from '@/components/articles/NestjsRestArticle/NestjsRestArticle';
import { NestjsCrudArticle } from '@/components/articles/NestjsCrudArticle/NestjsCrudArticle';
import { PlaceholderArticle } from '@/components/articles/PlaceholderArticle/PlaceholderArticle';
import { RelatedArticles } from '@/components/ui/RelatedArticles/RelatedArticles';
import { TableOfContents } from '@/components/ui/TableOfContents/TableOfContents';
import { ReadingProgress } from '@/components/ui/ReadingProgress/ReadingProgress';
import { calcReadingTime } from '@/lib/readingTime';
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
  const readingTime = calcReadingTime(aSlug);

  function renderArticle() {
    if (cSlug === 'javascript' && aSlug === 'event-loop') return <EventLoopArticle />;
    if (cSlug === 'javascript' && aSlug === 'promises') return <PromisesArticle />;
    if (cSlug === 'javascript' && aSlug === 'prototypes') return <PrototypesArticle />;
    if (cSlug === 'browser' && aSlug === 'critical-rendering-path') return <CriticalRenderingPathArticle />;
    if (cSlug === 'general' && aSlug === 'http-request') return <HttpRequestArticle />;
    if (cSlug === 'general' && aSlug === 'what-is-browser') return <WhatIsBrowserArticle />;
    if (cSlug === 'general' && aSlug === 'how-browser-works') return <HowBrowserWorksArticle />;
    if (cSlug === 'general' && aSlug === 'oop') return <OopArticle />;
    if (cSlug === 'general' && aSlug === 'progressive-ssr') return <ProgressiveSsrArticle />;
    if (cSlug === 'general' && aSlug === 'storage') return <StorageArticle />;
    if (cSlug === 'general' && aSlug === 'csr-vs-ssr') return <CsrVsSsrArticle />;
    if (cSlug === 'css' && aSlug === 'cascade') return <CascadeArticle />;
    if (cSlug === 'css' && aSlug === 'flexbox') return <FlexboxArticle />;
    if (cSlug === 'backend' && aSlug === 'backend-roadmap') return <BackendArticle />;
    if (cSlug === 'backend' && aSlug === 'nodejs-basics')        return <NodejsBasicsArticle />;
    if (cSlug === 'backend' && aSlug === 'http-server-basics')   return <HttpServerBasicsArticle />;
    if (cSlug === 'backend' && aSlug === 'express-basics')       return <ExpressBasicsArticle />;
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
    if (cSlug === 'ml-ai' && aSlug === 'ai-api-integration') return <AiApiArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'prompt-engineering') return <PromptEngineeringArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'rag-architecture') return <RagArchitectureArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'vector-databases') return <VectorDatabasesArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ai-agents') return <AiAgentsArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ai-frameworks') return <AiFrameworksArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'fine-tuning') return <FineTuningArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ml-training-loop') return <MlTrainingLoopArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ai-in-production') return <AiInProductionArticle />;
    if (cSlug === 'ml-ai' && aSlug === 'ai-safety') return <AiSafetyArticle />;
    if (cSlug === 'algorithms' && aSlug === 'big-o')             return <BigOArticle />;
    if (cSlug === 'algorithms' && aSlug === 'binary-search')     return <BinarySearchArticle />;
    if (cSlug === 'algorithms' && aSlug === 'two-pointers')      return <TwoPointersArticle />;
    if (cSlug === 'algorithms' && aSlug === 'sliding-window')    return <SlidingWindowArticle />;
    if (cSlug === 'algorithms' && aSlug === 'sorting-algorithms') return <SortingArticle />;
    if (cSlug === 'javascript' && aSlug === 'package-managers') return <PackageManagersArticle />;
    if (cSlug === 'git' && aSlug === 'git-basics')    return <GitBasicsArticle />;
    if (cSlug === 'git' && aSlug === 'git-start')     return <GitStartArticle />;
    if (cSlug === 'git' && aSlug === 'git-history')   return <GitHistoryArticle />;
    if (cSlug === 'git' && aSlug === 'git-branches')  return <GitBranchesArticle />;
    if (cSlug === 'git' && aSlug === 'git-remote')    return <GitRemoteArticle />;
    if (cSlug === 'git' && aSlug === 'git-undo')      return <GitUndoArticle />;
    if (cSlug === 'react' && aSlug === 'why-react')   return <ReactIntroArticle />;
    if (cSlug === 'react' && aSlug === 'jsx')              return <JSXArticle />;
    if (cSlug === 'react' && aSlug === 'components-props') return <ComponentsPropsArticle />;
    if (cSlug === 'nestjs' && aSlug === 'nestjs-intro') return <NestjsIntroArticle />;
    if (cSlug === 'nestjs' && aSlug === 'nestjs-rest')  return <NestjsRestArticle />;
    if (cSlug === 'nestjs' && aSlug === 'nestjs-crud')  return <NestjsCrudArticle />;
    return <PlaceholderArticle title={article!.title} />;
  }

  return (
    <div className={s.wrapper}>
      <CollapsibleSidebar />

      <main className={s.main}>
        <ReadingProgress />
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
            <div className={s.titleMeta}>
              {readingTime !== null && (
                <span className={s.readingTime}>{readingTime} мин на чтение</span>
              )}
              {article.tags?.map((tag) => (
                <span key={tag} className={s.tag}>{tag}</span>
              ))}
            </div>
          </div>

          {renderArticle()}

          <RelatedArticles courseSlug={cSlug} articleSlug={aSlug} />

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
        <TableOfContents />
      </main>
    </div>
  );
}
