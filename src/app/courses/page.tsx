import type { Metadata } from 'next';
import Link from 'next/link';
import { courses } from '@/content/courses';
import s from './page.module.scss';

export const metadata: Metadata = { title: 'Courses' };

// ── Per-course visual identity ────────────────────────────────────────────────

const COURSE_META: Record<string, { color: string; glow: string; icon: string }> = {
  general:            { color: '#d2a679', glow: 'rgba(210,166,121,0.14)', icon: '◎'  },
  javascript:         { color: '#f0db4f', glow: 'rgba(240,219,79,0.14)',  icon: 'JS' },
  css:                { color: '#c96daa', glow: 'rgba(201,109,170,0.14)', icon: 'CSS'},
  html:               { color: '#e34c26', glow: 'rgba(227,76,38,0.14)',   icon: '<>' },
  react:              { color: '#61dafb', glow: 'rgba(97,218,251,0.14)',  icon: '⚛'  },
  'state-management': { color: '#9b59e0', glow: 'rgba(155,89,224,0.14)', icon: 'ST' },
  typescript:         { color: '#4a9eff', glow: 'rgba(74,158,255,0.14)',  icon: 'TS' },
  browser:            { color: '#4db8ff', glow: 'rgba(77,184,255,0.14)',  icon: '◫'  },
  webpack:            { color: '#8dd6f9', glow: 'rgba(141,214,249,0.14)', icon: 'WP' },
  databases:          { color: '#00e5a0', glow: 'rgba(0,229,160,0.14)',   icon: 'DB' },
  backend:            { color: '#57ab5a', glow: 'rgba(87,171,90,0.14)',   icon: 'BE' },
  devops:             { color: '#ff7b72', glow: 'rgba(255,123,114,0.14)', icon: 'DO' },
};

// ── Grid size by article count ────────────────────────────────────────────────

function cardSize(n: number): 'big' | 'med' | 'sm' {
  if (n > 12) return 'big';
  if (n >= 4)  return 'med';
  return 'sm';
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const totalArticles = courses.reduce((n, c) => n + c.articles.length, 0);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>// курсы</p>
        <h1 className={s.title}>Все курсы</h1>
        <p className={s.subtitle}>{totalArticles} статей · {courses.length} курсов</p>
      </div>

      <div className={s.grid}>
        {courses.map((course) => {
          const meta    = COURSE_META[course.slug] ?? { color: '#00e5a0', glow: 'rgba(0,229,160,0.12)', icon: '•' };
          const size    = cardSize(course.articles.length);
          const isEmpty = course.articles.length === 0;

          const sections       = [...new Set(course.articles.map(a => a.section).filter(Boolean))] as string[];
          const interactiveN   = course.articles.filter(a => a.interactive).length;

          const cls = [
            s.card,
            size === 'big' ? s.cardBig : size === 'med' ? s.cardMed : '',
            isEmpty ? s.cardEmpty : '',
          ].filter(Boolean).join(' ');

          const inner = (
            <>
              {/* Top row: icon + arrow */}
              <div className={s.cardTop}>
                <span className={s.cardIcon}>{meta.icon}</span>
                {isEmpty
                  ? <span className={s.comingSoon}>скоро</span>
                  : <span className={s.cardArrow}>→</span>
                }
              </div>

              {/* Eyebrow */}
              <div className={s.cardEyebrow}>// {course.slug}</div>

              {/* Title */}
              <h2 className={s.cardTitle}>{course.title}</h2>

              {/* Description — only on medium+ */}
              {size !== 'sm' && (
                <p className={s.cardDesc}>{course.description}</p>
              )}

              {/* Big card body: sections or article list */}
              {size === 'big' && !isEmpty && (
                <div className={s.cardBody}>
                  {sections.length > 0 ? (
                    <div className={s.cardSections}>
                      {sections.map(sec => (
                        <span key={sec} className={s.sectionChip}>{sec}</span>
                      ))}
                    </div>
                  ) : (
                    <ul className={s.cardArticles}>
                      {course.articles.slice(0, 7).map(a => (
                        <li key={a.slug} className={s.cardArticleItem}>
                          {a.interactive && <span className={s.dot}>◆</span>}
                          {a.title}
                        </li>
                      ))}
                      {course.articles.length > 7 && (
                        <li className={s.cardArticleMore}>+{course.articles.length - 7} ещё</li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              {/* Footer */}
              {!isEmpty && (
                <div className={s.cardFooter}>
                  <span className={s.cardCount}>{course.articles.length} статей</span>
                  {interactiveN > 0 && (
                    <span className={s.cardInteractive}>◆ {interactiveN} live</span>
                  )}
                </div>
              )}
            </>
          );

          return isEmpty ? (
            <div
              key={course.slug}
              className={cls}
              style={{ '--cc': meta.color, '--cg': meta.glow } as React.CSSProperties}
            >
              {inner}
            </div>
          ) : (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className={cls}
              style={{ '--cc': meta.color, '--cg': meta.glow } as React.CSSProperties}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
