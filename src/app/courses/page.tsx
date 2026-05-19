import type { Metadata } from 'next';
import Link from 'next/link';
import { courses } from '@/content/courses';
import s from './page.module.scss';

export const metadata: Metadata = { title: 'Courses' };

export default function CoursesPage() {
  return (
    <div className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>// курсы</p>
        <h1 className={s.title}>Все курсы</h1>
        <p className={s.subtitle}>
          {courses.reduce((n, c) => n + c.articles.length, 0)} статей в {courses.length} курсах
        </p>
      </div>

      <div className={s.courseList}>
        {courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`} className={s.courseCard}>
            <div className={s.courseTop}>
              <h2 className={s.courseTitle}>{course.title}</h2>
              <span className={s.courseArrow}>→</span>
            </div>
            <p className={s.courseDesc}>{course.description}</p>
            <div className={s.articleChips}>
              {course.articles.map((article) => (
                <span key={article.slug} className={`${s.chip} ${article.interactive ? s.interactive : ''}`}>
                  {article.title}
                  {article.interactive && ' ◆'}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
