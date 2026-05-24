import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, courses, type Article } from '@/content/courses';
import s from './page.module.scss';

interface Props {
  params: Promise<{ course: string }>;
}

export async function generateStaticParams() {
  return courses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  return { title: course?.title ?? 'Not found' };
}

// ── Per-course color ──────────────────────────────────────────────────────────

const COURSE_META: Record<string, { color: string; glow: string }> = {
  general:            { color: '#d2a679', glow: 'rgba(210,166,121,0.12)' },
  javascript:         { color: '#f0db4f', glow: 'rgba(240,219,79,0.12)'  },
  css:                { color: '#c96daa', glow: 'rgba(201,109,170,0.12)' },
  html:               { color: '#e34c26', glow: 'rgba(227,76,38,0.12)'   },
  react:              { color: '#61dafb', glow: 'rgba(97,218,251,0.12)'  },
  'state-management': { color: '#9b59e0', glow: 'rgba(155,89,224,0.12)' },
  typescript:         { color: '#4a9eff', glow: 'rgba(74,158,255,0.12)'  },
  browser:            { color: '#4db8ff', glow: 'rgba(77,184,255,0.12)'  },
  webpack:            { color: '#8dd6f9', glow: 'rgba(141,214,249,0.12)' },
  databases:          { color: '#00e5a0', glow: 'rgba(0,229,160,0.12)'   },
  backend:            { color: '#57ab5a', glow: 'rgba(87,171,90,0.12)'   },
  devops:             { color: '#ff7b72', glow: 'rgba(255,123,114,0.12)' },
};

// ── Group articles by section ─────────────────────────────────────────────────

function groupArticles(articles: Article[]) {
  const groups: { section: string | null; articles: Article[] }[] = [];
  for (const article of articles) {
    const last = groups[groups.length - 1];
    const key  = article.section ?? null;
    if (last && last.section === key) {
      last.articles.push(article);
    } else {
      groups.push({ section: key, articles: [article] });
    }
  }
  return groups;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CoursePage({ params }: Props) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const meta   = COURSE_META[slug] ?? { color: '#00e5a0', glow: 'rgba(0,229,160,0.12)' };
  const groups = groupArticles(course.articles);
  const interactiveN = course.articles.filter(a => a.interactive).length;

  return (
    <div
      className={s.page}
      style={{ '--cc': meta.color, '--cg': meta.glow } as React.CSSProperties}
    >
      <Link href="/courses" className={s.back}>← все курсы</Link>

      <div className={s.header}>
        <p className={s.eyebrow}>// {course.slug}</p>
        <h1 className={s.title}>{course.title}</h1>
        <p className={s.desc}>{course.description}</p>
        <span className={s.meta}>
          {course.articles.length} статей
          {interactiveN > 0 && ` · ${interactiveN} интерактивных`}
        </span>
      </div>

      {groups.map((group, gi) => (
        <div key={gi} className={s.sectionGroup}>
          {group.section && (
            <div className={s.sectionLabel}>{group.section}</div>
          )}

          <div className={s.articleGrid}>
            {group.articles.map((article) => (
              <Link
                key={article.slug}
                href={`/courses/${course.slug}/${article.slug}`}
                className={s.articleCard}
              >
                <div className={s.articleTop}>
                  <h2 className={s.articleTitle}>{article.title}</h2>
                  <span className={s.articleArrow}>→</span>
                </div>

                <p className={s.articleDesc}>{article.description}</p>

                <div className={s.articleMeta}>
                  {article.interactive && (
                    <span className={s.interactiveBadge}>◆ live</span>
                  )}
                  {article.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className={s.tagChip}>{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
