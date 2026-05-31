import s from './HomeworkBlock.module.scss';

interface Props {
  items: React.ReactNode[];
}

export function HomeworkBlock({ items }: Props) {
  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.icon}>◆</span>
        <span className={s.title}>// homework</span>
      </div>
      <ol className={s.list}>
        {items.map((item, i) => (
          <li key={i} className={s.item}>
            <span className={s.num}>{i + 1}.</span>
            <span className={s.text}>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
