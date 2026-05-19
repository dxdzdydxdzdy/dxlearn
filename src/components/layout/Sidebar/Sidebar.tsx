'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { courses } from '@/content/courses';
import s from './Sidebar.module.scss';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={s.sidebar}>
      <div className={s.section}>
        <div className={s.sectionLabel}>courses</div>

        {courses.map((course) => {
          const isCourseActive = pathname.includes(`/courses/${course.slug}`);

          return (
            <div key={course.slug} className={s.courseGroup}>
              <div className={`${s.courseTitle} ${isCourseActive ? s.open : ''}`}>
                {course.title}
              </div>

              <ul className={s.articleList}>
                {course.articles.map((article) => {
                  const href = `/courses/${course.slug}/${article.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={article.slug}>
                      <Link href={href} className={`${s.articleLink} ${isActive ? s.active : ''}`}>
                        <span className={s.articleDot} />
                        {article.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
