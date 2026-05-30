import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { BackendDomainExplorer } from './BackendDomainExplorer';
import { CpuIoDemo } from './CpuIoDemo';
import { QUIZ_QUESTIONS } from './quizData';
import s from './BackendArticle.module.scss';

export function BackendArticle() {
  return (
    <div className={s.root}>

      {/* 1 — Кто такой бэкенд-разработчик */}
      <section className={s.section}>
        <SectionTitle>Кто такой бэкенд-разработчик</SectionTitle>
        <p className={s.prose}>
          Бэкенд — это всё, что происходит <strong>после того, как пользователь нажал кнопку</strong>.
          Получить данные из базы, проверить права, вызвать стороннее API, поставить задачу в очередь,
          вернуть ответ за 50ms. Пользователь этого не видит — но именно здесь определяется,
          будет ли приложение работать под нагрузкой.
        </p>
        <div className={s.roleGrid}>
          {[
            {
              icon: '🔧',
              title: 'API-разработчик',
              desc: 'Пишет REST/gRPC сервисы, которые отдают данные фронту и другим сервисам. Большинство вакансий.',
              tags: ['FastAPI', 'Django', 'Spring', 'Express'],
            },
            {
              icon: '🗄️',
              title: 'Data Engineer',
              desc: 'Пайплайны данных, ETL, аналитические БД. Граница с бэкендом размыта.',
              tags: ['Kafka', 'Airflow', 'ClickHouse', 'Spark'],
            },
            {
              icon: '🏛️',
              title: 'Архитектор',
              desc: 'Проектирует систему целиком: сервисы, БД, интеграции. Опыт 5+ лет.',
              tags: ['System Design', 'DDD', 'Microservices'],
            },
          ].map(r => (
            <div key={r.title} className={s.roleCard}>
              <span className={s.roleIcon}>{r.icon}</span>
              <div className={s.roleTitle}>{r.title}</div>
              <div className={s.roleDesc}>{r.desc}</div>
              <div className={s.roleTags}>
                {r.tags.map(t => <span key={t} className={s.roleTag}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
        <Callout variant="info">
          Язык — не главное. Python, Go, Java, Kotlin — через год-два ты читаешь любой из них.
          Главное: понимание систем. Базы данных, очереди, кэш, авторизация — эти концепции
          одинаковы на любом языке.
        </Callout>
      </section>

      {/* 2 — CPU vs IO */}
      <section className={s.section}>
        <SectionTitle>CPU-bound vs IO-bound: главное различие</SectionTitle>
        <p className={s.prose}>
          Это та вещь, которую многие упускают даже на middle-уровне — и это видно сразу.
          Тип задачи определяет, какой инструмент параллелизма использовать.
        </p>
        <div className={s.twoCol}>
          <div className={s.compareCard}>
            <div className={s.compareTitle}>🔥 CPU-bound</div>
            <div className={s.compareList}>
              {['Нагружает процессор: сжатие, видео, ML, шифрование', 'Пока задача работает — поток занят', 'Параллелизм через multiprocessing (несколько ядер)', 'async/await не поможет — CPU всё равно занят'].map(t => (
                <div key={t} className={s.compareItem}>{t}</div>
              ))}
            </div>
          </div>
          <div className={s.compareCard}>
            <div className={s.compareTitle}>⏳ IO-bound</div>
            <div className={s.compareList}>
              {['Ждёт внешний ресурс: БД, API, диск, сеть', 'Процессор простаивает во время ожидания', 'Параллелизм через async/await (один поток, много задач)', '99% задач бэкенда — именно IO-bound'].map(t => (
                <div key={t} className={s.compareItem}>{t}</div>
              ))}
            </div>
          </div>
        </div>
        <p className={s.prose}>
          Нажми simulate — видно как CPU-bound задачи выполняются последовательно (одна блокирует следующую),
          а IO-bound идут конкурентно (воркер свободен пока ждёт ответа).
        </p>
        <CpuIoDemo />
        <CodeHighlight lang="javascript" code={`# Python: когда что выбирать
import asyncio
from concurrent.futures import ProcessPoolExecutor

# IO-bound → asyncio (один поток, конкурентные корутины)
async def fetch_user(user_id: int):
    async with aiohttp.ClientSession() as session:
        resp = await session.get(f"/api/users/{user_id}")
        return await resp.json()

async def main():
    # 100 запросов параллельно, один поток
    users = await asyncio.gather(*[fetch_user(i) for i in range(100)])

# CPU-bound → multiprocessing (несколько процессов = несколько ядер)
def compress_image(path: str) -> bytes:
    # тяжёлая операция, нагружает CPU
    return compress(open(path, "rb").read())

with ProcessPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(compress_image, image_paths))`} />
      </section>

      {/* 3 — 8 доменов */}
      <section className={s.section}>
        <SectionTitle>8 доменов бэкенд-разработчика</SectionTitle>
        <p className={s.prose}>
          Выбери домен слева, переключай уровень и смотри что нужно знать — и что спрашивают
          на собеседованиях. Вопросы кликабельны — подсказка появится при клике.
        </p>
        <BackendDomainExplorer />
      </section>

      {/* 4 — Базы данных подробнее */}
      <section className={s.section}>
        <SectionTitle>Базы данных: SQL vs NoSQL vs Columnar</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Тип</th><th>Представитель</th><th>Когда использовать</th><th>Когда не нужен</th></tr>
          </thead>
          <tbody>
            {[
              ['Реляционная (SQL)', 'PostgreSQL', 'Большинство проектов: связанные данные, транзакции, JOIN', 'Когда схема принципиально гибкая'],
              ['Документная (NoSQL)', 'MongoDB', 'Гибкая схема, сущности с разными полями, горизонтальная шард', 'Когда нужны сложные JOIN и транзакции'],
              ['Колоночная', 'ClickHouse', 'Аналитика, большие объёмы данных, агрегации', 'OLTP нагрузка (много мелких вставок/обновлений)'],
              ['In-memory', 'Redis', 'Кэш, сессии, rate limiting, pub/sub, leaderboards', 'Основное хранилище данных (нет persistence гарантий)'],
            ].map(([type, db, when, notWhen]) => (
              <tr key={type} className={s.tableRow}>
                <td>{type}</td>
                <td className={s.accent}>{db}</td>
                <td>{when}</td>
                <td>{notWhen}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeHighlight lang="javascript" code={`-- SQL: что нужно знать на middle
-- EXPLAIN ANALYZE — смотреть план запроса
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) as orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name
ORDER BY orders DESC;
-- ищи: Seq Scan (плохо на больших таблицах) vs Index Scan

-- Индекс на колонку по которой фильтруешь
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);

-- Транзакция: атомарное списание денег
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- или ROLLBACK при ошибке`} />
        <Callout variant="warn">
          Знание SQL на уровне сырых запросов открывает возможности, которые ORM не даёт.
          Window functions, CTE, JSONB в PostgreSQL — это то, что позволяет решать задачи
          без дополнительной инфраструктуры.
        </Callout>
      </section>

      {/* 5 — Авторизация */}
      <section className={s.section}>
        <SectionTitle>Авторизация и аутентификация</SectionTitle>
        <p className={s.prose}>
          Встречается в каждом приложении. Ошибки здесь — утечки данных и взломы.
          Нужно понимать разницу между <strong>аутентификацией</strong> (кто ты?) и
          <strong> авторизацией</strong> (что тебе можно?).
        </p>
        <CodeHighlight lang="javascript" code={`# Хэширование паролей — bcrypt, не MD5/SHA-256
import bcrypt

# При регистрации
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# При логине
is_valid = bcrypt.checkpw(password.encode(), password_hash)
# bcrypt специально медленный: brute force занимает годы

# JWT структура: header.payload.signature
# Payload открытый (base64), НЕ хранить секреты!
{
  "sub": "user_123",
  "roles": ["admin"],
  "exp": 1704067200   # timestamp истечения
}

# Access + Refresh токены
# Access: короткий TTL (15 мин), в памяти фронта
# Refresh: длинный TTL (30 дней), httpOnly cookie
# При истечении access → обменять refresh на новый access`} />
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Подход</th><th>Как работает</th><th>Плюсы</th><th>Минусы</th></tr>
          </thead>
          <tbody>
            {[
              ['Session-based', 'Сервер хранит сессию, клиент — session_id в cookie', 'Легко инвалидировать', 'Stateful, сложно масштабировать'],
              ['JWT', 'Токен с данными, подписан секретом', 'Stateless, масштабируется', 'Сложно отозвать до истечения'],
              ['OAuth 2.0', 'Делегация: "войти через Google"', 'Не хранить пароли пользователей', 'Зависимость от провайдера'],
            ].map(([approach, how, plus, minus]) => (
              <tr key={approach} className={s.tableRow}>
                <td>{approach}</td>
                <td>{how}</td>
                <td className={s.accent}>{plus}</td>
                <td className={s.error}>{minus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 6 — Рынок труда */}
      <section className={s.section}>
        <SectionTitle>Рынок труда 2026</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Уровень</th><th>Зарплата</th><th>Что ожидается</th></tr>
          </thead>
          <tbody>
            {[
              ['Junior', '100–160k ₽', 'Язык, SQL basics, REST API, Docker, Git'],
              ['Middle', '180–320k ₽', 'Транзакции, кэш, очереди, CI/CD, тесты, async'],
              ['Middle+', '280–400k ₽', 'System design, микросервисы, observability, security'],
              ['Senior', '380–600k ₽', 'Архитектура, DDD, менторинг, CAP теорема, оптимизация БД'],
            ].map(([lvl, sal, exp]) => (
              <tr key={lvl} className={s.tableRow}>
                <td>{lvl}</td>
                <td className={s.accent}>{sal}</td>
                <td>{exp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Callout variant="info">
          Python и Go — самые горячие языки на рынке РФ в 2026. Java/Kotlin сильны в банках
          и enterprise. Node.js популярен в стартапах и там где фронтенд-разработчик
          расширяется на бэкенд.
        </Callout>
      </section>

      {/* 7 — Quiz */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
