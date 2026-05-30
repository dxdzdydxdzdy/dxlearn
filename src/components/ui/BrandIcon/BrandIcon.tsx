import type { SimpleIcon } from 'simple-icons';

interface Props {
  icon: SimpleIcon;
  size?: number;
  color?: string;
}

export function BrandIcon({ icon, size = 20, color }: Props) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label={icon.title}
      fill={color ?? `#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
