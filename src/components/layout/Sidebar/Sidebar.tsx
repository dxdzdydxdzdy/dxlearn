'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

function getActiveCourseSlug(pathname: string): string | null {
  const match = pathname.match(/^\/courses\/([^/]+)/);
  return match ? match[1] : null;
}

export function Sidebar() {
  const pathname = usePathname();
  const activeCourseSlug = getActiveCourseSlug(pathname);

  const [openCourses, setOpenCourses] = useState<Set<string>>(() => {
    return new Set(activeCourseSlug ? [activeCourseSlug] : []);
  });

  // Открываем активный курс при смене маршрута
  useEffect(() => {
    if (activeCourseSlug) {
      setOpenCourses(prev => {
        if (prev.has(activeCourseSlug)) return prev;
        const next = new Set(prev);
        next.add(activeCourseSlug);
        return next;
      });
    }
  }, [activeCourseSlug]);

  function toggleCourse(slug: string) {
    setOpenCourses(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  return (
    <aside className={s.sidebar}>
      <div className={s.sectionLabel}>courses</div>

      {courses.map(course => {
        const isOpen = openCourses.has(course.slug);
        const isActive = course.slug === activeCourseSlug;
        const groups = groupBySection(course.articles);

        return (
          <div key={course.slug} className={s.courseGroup}>
            <button
              className={`${s.courseHeader} ${isOpen ? s.open : ''} ${isActive ? s.active : ''}`}
              onClick={() => toggleCourse(course.slug)}
            >
              <span className={s.courseChevron}>›</span>
              <span className={s.courseTitle}>{course.title}</span>
              {course.articles.length > 0 && (
                <span className={s.courseCount}>{course.articles.length}</span>
              )}
            </button>

            <div className={`${s.articlesWrap} ${isOpen ? s.open : ''}`}>
              <div className={s.articlesInner}>
                {course.articles.length === 0 ? (
                  <div className={s.emptyLabel}>скоро</div>
                ) : (
                  <ul className={s.articleList}>
                    {groups.map(group => (
                      <li key={group.section ?? '__root__'}>
                        {group.section && (
                          <div className={s.subSection}>{group.section}</div>
                        )}
                        <ul className={s.articleList}>
                          {group.articles.map(article => {
                            const href = `/courses/${course.slug}/${article.slug}`;
                            const isActiveArticle = pathname === href;
                            return (
                              <li key={article.slug}>
                                <Link
                                  href={href}
                                  className={`${s.articleLink} ${isActiveArticle ? s.active : ''}`}
                                >
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
                )}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
