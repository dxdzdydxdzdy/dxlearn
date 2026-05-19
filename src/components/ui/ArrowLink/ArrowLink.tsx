import Link from 'next/link';
import s from './ArrowLink.module.scss';

interface Props {
  href?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function ArrowLink({ href, children, size = 'md', onClick }: Props) {
  const className = `${s.link} ${s[size]}`;
  const inner = (
    <>
      {children}
      <span className={s.arrow}>→</span>
    </>
  );

  if (href) {
    return <Link href={href} className={className}>{inner}</Link>;
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {inner}
    </button>
  );
}
