import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { StorageDemo } from './StorageDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './StorageArticle.module.scss';

export function StorageArticle() {
  return (
    <div className={s.root}>

      {/* 1 */}
      <section className={s.section}>
        <SectionTitle>Зачем знать разницу</SectionTitle>
        <p className={s.prose}>
          Неправильный выбор хранилища = баги или уязвимости. Токен в localStorage → XSS украдёт его.
          Данные в sessionStorage → пользователь потеряет корзину, открыв новую вкладку.
          Cookie без HttpOnly → тот же XSS. <strong>Каждое хранилище решает свою задачу</strong>.
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Хранилище</th><th>Живёт</th><th>Вкладки</th><th>Размер</th><th>Отправляется с запросом</th></tr>
          </thead>
          <tbody>
            {[
              ['localStorage', 'Постоянно', 'Все вкладки домена', '~5-10MB', 'Нет'],
              ['sessionStorage', 'До закрытия вкладки', 'Только текущая', '~5-10MB', 'Нет'],
              ['Cookie', 'max-age/expires', 'Все вкладки домена', '~4KB', 'Да (автоматически)'],
              ['IndexedDB', 'Постоянно', 'Все вкладки домена', 'Гигабайты', 'Нет'],
            ].map(([name, ...rest]) => (
              <tr key={name} className={s.tableRow}>
                <td><code>{name}</code></td>
                {rest.map((v, i) => <td key={i}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 2 */}
      <section className={s.section}>
        <SectionTitle>Живая демонстрация</SectionTitle>
        <p className={s.prose}>
          Запиши данные в localStorage и sessionStorage. Затем обнови страницу — localStorage
          сохранится, а sessionStorage очистится при закрытии вкладки.
        </p>
        <StorageDemo />
      </section>

      {/* 3 */}
      <section className={s.section}>
        <SectionTitle>Cookie: больше, чем хранилище</SectionTitle>
        <CodeHighlight lang="js" code={`// Клиентская установка cookie
document.cookie = 'theme=dark; max-age=2592000; SameSite=Lax';

// Серверная установка (через HTTP заголовок Set-Cookie):
// Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600

// Флаги безопасности:
// HttpOnly   → JS не может прочитать (document.cookie вернёт "")
// Secure     → только по HTTPS
// SameSite=Strict → не отправляется при кросс-сайт запросах (защита от CSRF)
// SameSite=Lax    → отправляется при навигации (клики по ссылкам), не при fetch

// Cookie отправляется браузером автоматически с каждым запросом на домен:
fetch('/api/user'); // браузер добавит Cookie: session=abc123`} />
        <Callout variant="warn">
          Никогда не храни JWT в localStorage для продакшн-приложений.
          Правило: <strong>auth токены → httpOnly cookie</strong>.
          Пользовательские настройки, несекретные данные → localStorage.
        </Callout>
      </section>

      {/* 4 */}
      <section className={s.section}>
        <SectionTitle>Когда что использовать</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Задача</th><th>Хранилище</th><th>Почему</th></tr>
          </thead>
          <tbody>
            {[
              ['Auth токен (JWT)', 'httpOnly cookie', 'Недоступна JS, отправляется автоматически'],
              ['Тема, язык (UI настройки)', 'localStorage', 'Нужна серверу для SSR? → cookie'],
              ['Данные формы (черновик)', 'localStorage', 'Пережить перезагрузку'],
              ['Wizard-шаги (временные)', 'sessionStorage', 'Только текущий сеанс'],
              ['Офлайн-кэш большого объёма', 'IndexedDB', 'Мегабайты, асинхронный доступ'],
              ['CSRF токен', 'cookie без HttpOnly', 'JS должен читать для заголовка'],
            ].map(([task, storage, why]) => (
              <tr key={task} className={s.tableRow}>
                <td>{task}</td>
                <td><code>{storage}</code></td>
                <td>{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 5 */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
