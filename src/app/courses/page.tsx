import type { Metadata } from 'next';
import { CourseCard } from './CourseCard';
import {
  siMdnwebdocs, siJavascript, siCss, siHtml5,
  siReact, siRedux, siTypescript, siGooglechrome,
  siWebpack, siPostgresql, siNodedotjs, siDocker,
  siAnthropic, siLeetcode,
} from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import { BrandIcon } from '@/components/ui/BrandIcon/BrandIcon';
import { courses } from '@/content/courses';
import s from './page.module.scss';

export const metadata: Metadata = { title: 'Courses' };

// ── Per-course visual identity ────────────────────────────────────────────────

interface CourseMeta { color: string; glow: string; icon: SimpleIcon | null; fallback?: string }

const COURSE_META: Record<string, CourseMeta> = {
  general:            { color: '#d2a679', glow: 'rgba(210,166,121,0.14)', icon: siMdnwebdocs },
  javascript:         { color: '#f0db4f', glow: 'rgba(240,219,79,0.14)',  icon: siJavascript },
  css:                { color: '#c96daa', glow: 'rgba(201,109,170,0.14)', icon: siCss        },
  html:               { color: '#e34c26', glow: 'rgba(227,76,38,0.14)',   icon: siHtml5      },
  react:              { color: '#61dafb', glow: 'rgba(97,218,251,0.14)',  icon: siReact      },
  'state-management': { color: '#9b59e0', glow: 'rgba(155,89,224,0.14)', icon: siRedux      },
  typescript:         { color: '#3178c6', glow: 'rgba(49,120,198,0.14)',  icon: siTypescript },
  browser:            { color: '#4db8ff', glow: 'rgba(77,184,255,0.14)',  icon: siGooglechrome },
  webpack:            { color: '#8dd6f9', glow: 'rgba(141,214,249,0.14)', icon: siWebpack    },
  databases:          { color: '#336791', glow: 'rgba(51,103,145,0.14)',  icon: siPostgresql },
  backend:            { color: '#57ab5a', glow: 'rgba(87,171,90,0.14)',   icon: siNodedotjs  },
  devops:             { color: '#2496ed', glow: 'rgba(36,150,237,0.14)',  icon: siDocker     },
  'ml-ai':            { color: '#cc785c', glow: 'rgba(204,120,92,0.14)',  icon: siAnthropic  },
  algorithms:         { color: '#ffa116', glow: 'rgba(255,161,22,0.14)',  icon: siLeetcode   },
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
          const meta    = COURSE_META[course.slug] ?? { color: '#00e5a0', glow: 'rgba(0,229,160,0.12)', icon: null, fallback: '•' };
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
                <span className={s.cardIcon}>
                  {meta.icon
                    ? <BrandIcon icon={meta.icon} size={22} color={meta.color} />
                    : meta.fallback}
                </span>
                {isEmpty
                  ? <span className={s.comingSoon}>скоро</span>
                  : <span className={s.cardArrow}>→</span>
                }
              </div>

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

          return (
            <CourseCard
              key={course.slug}
              href={isEmpty ? undefined : `/courses/${course.slug}`}
              className={cls}
              style={{ '--cc': meta.color, '--cg': meta.glow } as React.CSSProperties}
            >
              {inner}
            </CourseCard>
          );
        })}
      </div>
    </div>
  );
}
