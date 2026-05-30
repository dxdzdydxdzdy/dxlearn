import Link from 'next/link';
import { getCourse, getArticle } from '@/content/courses';
import s from './ArticleLink.module.scss';

interface Props {
  course: string;
  article: string;
  children?: React.ReactNode;
}

export function ArticleLink({ course: courseSlug, article: articleSlug, children }: Props) {
  const course = getCourse(courseSlug);
  const article = getArticle(courseSlug, articleSlug);

  if (!course || !article) return null;

  const label = children ?? article.title;
  const href = `/courses/${courseSlug}/${articleSlug}`;

  return (
    <span className={s.root}>
      <Link href={href} className={s.link}>
        {label}
      </Link>

      <span className={s.tooltip}>
        <span className={s.tooltipInner}>
          <span className={s.tooltipCourse}>// {course.title}</span>
          <span className={s.tooltipTitle}>{article.title}</span>
          <span className={s.tooltipDivider} />
          <span className={s.tooltipDesc}>{article.description}</span>

          {(article.tags?.length || article.interactive) && (
            <span className={s.tooltipFooter}>
              {article.tags?.map(tag => (
                <span key={tag} className={s.tooltipTag}>{tag}</span>
              ))}
              {article.interactive && (
                <span className={s.tooltipInteractive}>interactive</span>
              )}
            </span>
          )}
        </span>
      </span>
    </span>
  );
}
