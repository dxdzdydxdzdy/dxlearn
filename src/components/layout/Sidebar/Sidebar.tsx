'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { courses, type Article } from '@/content/courses';
import s from './Sidebar.module.scss';

interface SectionGroup {
  section: string | null;
  articles: Article[];
}

function groupBySection(articles: Article[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  for (const article of articles) {
    const section = article.section ?? null;
    const last = groups[groups.length - 1];
    if (last && last.section === section) {
      last.articles.push(article);
    } else {
      groups.push({ section, articles: [article] });
    }
  }
  return groups;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={s.sidebar}>
      <div className={s.section}>
        <div className={s.sectionLabel}>courses</div>

        {courses.map((course) => {
          const isCourseActive = pathname.includes(`/courses/${course.slug}`);
          const groups = groupBySection(course.articles);

          return (
            <div key={course.slug} className={s.courseGroup}>
              <div className={`${s.courseTitle} ${isCourseActive ? s.open : ''}`}>
                {course.title}
              </div>

              <ul className={s.articleList}>
                {groups.map((group) => (
                  <li key={group.section ?? '__root__'}>
                    {group.section && (
                      <div className={s.subSection}>{group.section}</div>
                    )}
                    <ul className={`${s.articleList} ${group.section ? s.nested : ''}`}>
                      {group.articles.map((article) => {
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
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
