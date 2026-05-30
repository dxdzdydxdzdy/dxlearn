import Link from 'next/link';
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

const COURSE_META: Record<string, { color: string; icon: SimpleIcon }> = {
  general:            { color: '#d2a679', icon: siMdnwebdocs  },
  javascript:         { color: '#f0db4f', icon: siJavascript  },
  css:                { color: '#c96daa', icon: siCss          },
  html:               { color: '#e34c26', icon: siHtml5        },
  react:              { color: '#61dafb', icon: siReact        },
  'state-management': { color: '#9b59e0', icon: siRedux        },
  typescript:         { color: '#3178c6', icon: siTypescript   },
  browser:            { color: '#4db8ff', icon: siGooglechrome },
  webpack:            { color: '#8dd6f9', icon: siWebpack      },
  databases:          { color: '#336791', icon: siPostgresql   },
  backend:            { color: '#57ab5a', icon: siNodedotjs    },
  devops:             { color: '#2496ed', icon: siDocker       },
  'ml-ai':            { color: '#cc785c', icon: siAnthropic    },
  algorithms:         { color: '#ffa116', icon: siLeetcode     },
};

const FEATURES = [
  {
    icon: '◆',
    title: 'Интерактивно',
    desc: 'Event Loop, Flexbox, SQL — запускаешь прямо в браузере. Не читаешь про механизм — видишь его в работе.',
  },
  {
    icon: '§',
    title: 'С проверкой',
    desc: 'После каждой темы — квиз из 15 вопросов с подробными объяснениями. Знаешь или думаешь что знаешь?',
  },
  {
    icon: '⊕',
    title: 'Под капотом',
    desc: 'Не "как использовать", а "почему работает именно так". Прототипная цепочка, Transformer attention, B-tree.',
  },
  {
    icon: '///',
    title: 'На русском',
    desc: 'Технические термины не переводятся, но объяснения — живые, без воды. Как ментор, а не как учебник.',
  },
];

export default function HomePage() {
  const totalArticles  = courses.reduce((n, c) => n + c.articles.length, 0);
  const totalLive      = courses.reduce((n, c) => n + c.articles.filter(a => a.interactive).length, 0);
  const totalCourses   = courses.filter(c => c.articles.length > 0).length;

  return (
    <div className={s.page}>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroNoise} aria-hidden />

        <p className={s.eyebrow}>
          <span className={s.eyebrowDot} />
          devlearn — интерактивные курсы
        </p>

        <h1 className={s.headline}>
          <span className={s.headlineDim}>Учи</span>
          {' веб-разработку'}
          <br />
          <span className={s.headlineAccent}>на практике</span>
          <span className={s.cursor} aria-hidden>_</span>
        </h1>

        <p className={s.sub}>
          Теория без практики — мёртвый груз. Здесь каждая статья — инструмент:
          SQL playground, визуализатор Event Loop, Flexbox-конструктор.
          Читаешь → понимаешь → проверяешь знания.
        </p>

        <div className={s.heroActions}>
          <Link href="/courses" className={s.ctaBtn}>
            Начать учиться
            <span className={s.ctaArrow}>→</span>
          </Link>
          <span className={s.heroMeta}>{totalArticles} статей · {totalLive} live демо</span>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <div className={s.stats}>
        <div className={s.stat}>
          <span className={s.statNum}>{totalArticles}</span>
          <span className={s.statLabel}>статей</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.stat}>
          <span className={s.statNum}>{totalLive}</span>
          <span className={s.statLabel}>live демо</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.stat}>
          <span className={s.statNum}>{totalCourses}</span>
          <span className={s.statLabel}>курсов</span>
        </div>
        <div className={s.statDivider} />
        <div className={s.stat}>
          <span className={s.statNum}>15+</span>
          <span className={s.statLabel}>вопросов в квизе</span>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className={s.features}>
        <p className={s.sectionLabel}>// почему devlearn</p>
        <div className={s.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={s.featureCard}>
              <span className={s.featureIcon}>{f.icon}</span>
              <h3 className={s.featureTitle}>{f.title}</h3>
              <p className={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Courses ───────────────────────────────────────────────────────────── */}
      <section className={s.coursesSection}>
        <div className={s.coursesSectionHead}>
          <p className={s.sectionLabel}>// курсы</p>
          <Link href="/courses" className={s.seeAll}>все курсы →</Link>
        </div>

        <div className={s.courseGrid}>
          {courses.map(course => {
            const meta    = COURSE_META[course.slug];
            const isEmpty = course.articles.length === 0;
            const liveN   = course.articles.filter(a => a.interactive).length;

            return (
              <Link
                key={course.slug}
                href={isEmpty ? '/courses' : `/courses/${course.slug}`}
                className={`${s.courseCard}${isEmpty ? ` ${s.courseCardEmpty}` : ''}`}
                style={{ '--cc': meta?.color ?? '#00e5a0' } as React.CSSProperties}
              >
                <div className={s.courseCardHead}>
                  <span className={s.courseIcon}>
                    {meta
                      ? <BrandIcon icon={meta.icon} size={18} color={meta.color} />
                      : '•'}
                  </span>
                  {isEmpty
                    ? <span className={s.comingSoon}>скоро</span>
                    : <span className={s.courseArrow}>→</span>
                  }
                </div>
                <div className={s.courseTitle}>{course.title}</div>
                {!isEmpty && (
                  <div className={s.courseMeta}>
                    <span>{course.articles.length} статей</span>
                    {liveN > 0 && <span className={s.courseLive}>◆ {liveN} live</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────────── */}
      <section className={s.bottomCta}>
        <div className={s.bottomCtaInner}>
          <p className={s.bottomCtaLabel}>// готов начать?</p>
          <h2 className={s.bottomCtaTitle}>
            Первая статья займёт<br />
            <span className={s.bottomCtaAccent}>меньше 10 минут</span>
          </h2>
          <Link href="/courses" className={s.ctaBtn}>
            Открыть курсы
            <span className={s.ctaArrow}>→</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
