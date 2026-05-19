import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, courses } from '@/content/courses';
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

export default async function CoursePage({ params }: Props) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <div className={s.page}>
      <Link href="/courses" className={s.back}>← все курсы</Link>

      <div className={s.header}>
        <p className={s.eyebrow}>// {course.slug}</p>
        <h1 className={s.title}>{course.title}</h1>
        <p className={s.desc}>{course.description}</p>
      </div>

      <div className={s.list}>
        {course.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/courses/${course.slug}/${article.slug}`}
            className={s.articleRow}
          >
            <div className={s.rowLeft}>
              <div className={s.rowTitle}>{article.title}</div>
              <div className={s.rowDesc}>{article.description}</div>
            </div>
            <div className={s.rowRight}>
              {article.interactive && (
                <span className={s.interactiveBadge}>◆ live</span>
              )}
              <span className={s.rowArrow}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
