import Link from 'next/link';
import { courses } from '@/content/courses';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import s from './page.module.scss';

export default function HomePage() {
  return (
    <div className={s.page}>
      <p className={s.eyebrow}>interactive learning</p>

      <h1 className={s.title}>
        <span className={s.titleMuted}>learn</span> web dev<br />
        <span className={s.titleMuted}>by doing it</span>
      </h1>

      <p className={s.subtitle}>
        Не читай про Event Loop — запусти его. Не гугли про flexbox — потрогай оси.
        Каждая статья — это интерактивный инструмент.
      </p>

      <div className={s.actions}>
        <ArrowLink href="/courses" size="lg">открыть курсы</ArrowLink>
        <div className={s.divider} />
        <span className={s.meta}>{courses.reduce((n, c) => n + c.articles.length, 0)} статей</span>
      </div>

      <div className={s.grid}>
        {courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`} className={s.card}>
            <div className={s.cardLabel}>{course.articles.length} articles</div>
            <div className={s.cardTitle}>{course.title}</div>
            <div className={s.cardDesc}>{course.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
