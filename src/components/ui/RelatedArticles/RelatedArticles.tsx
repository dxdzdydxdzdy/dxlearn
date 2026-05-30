import Link from 'next/link';
import { getRelatedArticles } from '@/lib/related';
import { calcReadingTime } from '@/lib/readingTime';
import s from './RelatedArticles.module.scss';

// Per-course accent colors (subset — fallback to accent for unknowns)
const COURSE_COLOR: Record<string, string> = {
  general:            '#d2a679',
  javascript:         '#f0db4f',
  css:                '#c96daa',
  html:               '#e34c26',
  react:              '#61dafb',
  'state-management': '#9b59e0',
  typescript:         '#4a9eff',
  browser:            '#4db8ff',
  webpack:            '#8dd6f9',
  databases:          '#00e5a0',
  backend:            '#57ab5a',
  devops:             '#ff7b72',
  'ml-ai':            '#a78bfa',
};

interface Props {
  courseSlug: string;
  articleSlug: string;
}

export function RelatedArticles({ courseSlug, articleSlug }: Props) {
  const related = getRelatedArticles(courseSlug, articleSlug);
  if (related.length === 0) return null;

  return (
    <section className={s.section}>
      <div className={s.heading}>
        <span className={s.headingLabel}>// читай дальше</span>
      </div>

      <div className={s.grid}>
        {related.map(({ course, article }) => {
          const color = COURSE_COLOR[course.slug] ?? '#00e5a0';
          const mins  = calcReadingTime(article.slug);

          return (
            <Link
              key={`${course.slug}/${article.slug}`}
              href={`/courses/${course.slug}/${article.slug}`}
              className={s.card}
              style={{ '--rc': color } as React.CSSProperties}
            >
              <div className={s.cardCourse}>{course.title}</div>

              <h3 className={s.cardTitle}>{article.title}</h3>

              <p className={s.cardDesc}>{article.description}</p>

              <div className={s.cardMeta}>
                {mins !== null && (
                  <span className={s.readTime}>{mins} мин</span>
                )}
                {article.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className={s.tag}>{tag}</span>
                ))}
                {article.interactive && (
                  <span className={s.live}>◆ live</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
