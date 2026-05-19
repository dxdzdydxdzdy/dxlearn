import s from './CodeBlock.module.scss';

interface Props {
  code: string;
  lang?: string;
  filename?: string;
}

export function CodeBlock({ code, lang = 'js', filename }: Props) {
  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        {filename ? (
          <span className={s.filename}>{filename}</span>
        ) : (
          <span className={s.lang}>{lang}</span>
        )}
      </div>
      <pre className={s.pre}>
        <code className={s.code}>{code.trim()}</code>
      </pre>
    </div>
  );
}
