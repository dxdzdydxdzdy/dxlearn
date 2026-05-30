import s from './ArticleSection.module.scss';

export function ArticleH1({ children, prefix }: { children: React.ReactNode; prefix?: string }) {
  return (
    <h1 className={s.h1}>
      {prefix && <span className={s.prefix}>{prefix}</span>}
      {children}
    </h1>
  );
}

export function ArticleH2({ children }: { children: React.ReactNode }) {
  return <h2 className={s.h2}>{children}</h2>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={s.sectionTitle}>{children}</h2>;
}

export function ArticleH3({ children }: { children: React.ReactNode }) {
  return <h3 className={s.h3}>{children}</h3>;
}

export function ArticleP({ children }: { children: React.ReactNode }) {
  return <p className={s.p}>{children}</p>;
}

export function ArticleDivider() {
  return <hr className={s.divider} />;
}

export function ArticleSection({ children }: { children: React.ReactNode }) {
  return <section className={s.section}>{children}</section>;
}
