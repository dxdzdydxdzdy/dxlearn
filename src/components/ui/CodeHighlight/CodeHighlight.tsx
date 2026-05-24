import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import s from './CodeHighlight.module.scss';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('sql', sql);

interface Props {
  code: string;
  lang?: string;
  filename?: string;
}

export function CodeHighlight({ code, lang = 'js', filename }: Props) {
  let highlighted: string;
  try {
    highlighted = hljs.highlight(code.trim(), { language: lang }).value;
  } catch {
    highlighted = hljs.highlightAuto(code.trim()).value;
  }

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
        <code
          className={`hljs language-${lang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
