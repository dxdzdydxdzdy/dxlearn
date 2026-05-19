import s from './Badge.module.scss';

type Variant = 'default' | 'accent' | 'warn' | 'error' | 'info';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
}

export function Badge({ children, variant = 'default' }: Props) {
  return <span className={`${s.badge} ${s[variant]}`}>{children}</span>;
}
