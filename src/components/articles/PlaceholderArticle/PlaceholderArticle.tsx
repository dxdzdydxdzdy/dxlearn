import { Callout } from '@/components/ui/Callout/Callout';
import { ArticleP, ArticleH2 } from '@/components/ui/ArticleSection/ArticleSection';

interface Props {
  title: string;
}

export function PlaceholderArticle({ title }: Props) {
  return (
    <div>
      <ArticleH2>В разработке</ArticleH2>
      <ArticleP>Статья «{title}» ещё не написана.</ArticleP>
      <Callout variant="info">
        Эта страница — заглушка. Как только статья будет готова, здесь появится интерактивный контент.
      </Callout>
    </div>
  );
}
