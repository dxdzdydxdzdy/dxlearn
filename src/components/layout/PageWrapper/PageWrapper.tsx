import { Sidebar } from '../Sidebar/Sidebar';
import s from './PageWrapper.module.scss';

interface Props {
  children: React.ReactNode;
  wide?: boolean;
  hideSidebar?: boolean;
}

export function PageWrapper({ children, wide, hideSidebar }: Props) {
  return (
    <div className={s.root}>
      {!hideSidebar && <Sidebar />}
      <main className={s.main}>
        <div className={wide ? s.wide : s.content}>{children}</div>
      </main>
    </div>
  );
}
