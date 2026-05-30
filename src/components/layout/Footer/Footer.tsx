import Link from 'next/link';
import s from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.left}>
        <span className={s.brand}>dxlearn</span>
        <span className={s.tagline}>интерактивные курсы по веб-разработке</span>
      </div>

      <div className={s.right}>
        <Link href="/courses" className={s.link}>курсы</Link>
        <span className={s.copy}>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
