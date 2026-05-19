import s from './Callout.module.scss';

type Variant = 'info' | 'warn' | 'accent';

const ICONS: Record<Variant, string> = {
  info: 'ℹ',
  warn: '⚠',
  accent: '◆',
};

interface Props {
  children: React.ReactNode;
  variant?: Variant;
}

export function Callout({ children, variant = 'info' }: Props) {
  return (
    <div className={`${s.callout} ${s[variant]}`}>
      <em className={s.icon}>{ICONS[variant]}</em>
      <div className={s.body}>{children}</div>
    </div>
  );
}
