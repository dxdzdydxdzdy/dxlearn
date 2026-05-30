import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { DbTimeline } from './DbTimeline';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './DatabasesIntroArticle.module.scss';

const NOSQL_TYPES = [
  {
    icon: '📄',
    name: 'Документные',
    color: '#4e9eff',
    desc: 'Данные хранятся в виде JSON/BSON-документов. У каждого документа может быть своя структура — схема гибкая.',
    examples: ['MongoDB', 'CouchDB', 'Firestore'],
    when: 'Когда структура данных часто меняется: каталоги товаров, профили пользователей, CMS.',
  },
  {
    icon: '🔑',
    name: 'Ключ-значение',
    color: '#ff7b72',
    desc: 'Простейшая модель: ключ → значение. Значение — что угодно (строка, список, хэш). Максимальная скорость.',
    examples: ['Redis', 'DynamoDB', 'Memcached'],
    when: 'Кэш, сессии, счётчики, очереди — всё, где нужна скорость в миллисекунды.',
  },
  {
    icon: '🏛️',
    name: 'Колоночные',
    color: '#b48eff',
    desc: 'Данные хранятся по столбцам, а не по строкам. Запрос "средняя цена за год" читает один столбец вместо всех строк.',
    examples: ['Cassandra', 'ClickHouse', 'HBase'],
    when: 'Аналитика и OLAP: обработка миллиардов строк, временные ряды, логи.',
  },
  {
    icon: '🕸️',
    name: 'Графовые',
    color: '#f0c040',
    desc: 'Узлы (сущности) и рёбра (связи) как структура данных. Обход связей — быстрее, чем серия JOIN.',
    examples: ['Neo4j', 'Amazon Neptune', 'ArangoDB'],
    when: 'Социальные сети, рекомендации, fraud detection — когда связи важнее сущностей.',
  },
];

export function DatabasesIntroArticle() {
  return (
    <div className={s.article}>

      {/* 1. Зачем нужны базы данных */}
      <section className={s.section}>
        <SectionTitle>Зачем нужны базы данных</SectionTitle>
        <p className={s.lead}>
          До баз данных данные хранились в файлах. Каждое приложение придумывало свой формат.
          Найти связанные записи или избежать дублирования — ручная работа программиста.
        </p>

        <div className={s.problemBox}>
          <div className={s.problemTitle}>// проблемы плоских файлов</div>
          <ul className={s.problemList}>
            <li className={s.problemItem}>Дублирование: одни и те же данные в разных файлах расходились</li>
            <li className={s.problemItem}>Нет транзакций: сбой в середине записи — повреждённые данные</li>
            <li className={s.problemItem}>Нет поиска: найти запись — читать файл целиком</li>
            <li className={s.problemItem}>Нет прав доступа: файл открыт для всех или закрыт для всех</li>
            <li className={s.problemItem}>Нет параллельного доступа: два процесса не могут писать одновременно</li>
          </ul>
        </div>

        <p className={s.body}>
          База данных — это не просто хранилище. Это система управления, которая решает все эти
          проблемы: гарантирует целостность, позволяет искать по любому критерию, управляет
          доступом и обеспечивает параллельную работу тысяч пользователей.
        </p>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// ключевое определение</div>
          <div className={s.calloutText}>
            СУБД (Система управления базами данных) — программа, которая организует хранение данных,
            обеспечивает к ним доступ и поддерживает их целостность. PostgreSQL, MySQL, MongoDB —
            всё это СУБД, а не сами базы данных.
          </div>
        </div>
      </section>

      {/* 2. История и эволюция */}
      <section className={s.section}>
        <SectionTitle>История и эволюция</SectionTitle>
        <p className={s.lead}>
          За 70 лет базы данных прошли путь от плоских файлов на жёстких дисках размером с холодильник
          до глобально-распределённых систем с транзакциями через континенты.
        </p>
        <DbTimeline />
      </section>

      {/* 3. Реляционная модель */}
      <section className={s.section}>
        <SectionTitle>Реляционная модель</SectionTitle>
        <p className={s.lead}>
          В 1970 году Эдгар Кодд опубликовал статью, которая изменила всё. Идея проста:
          данные — это таблицы (relations), операции над ними — реляционная алгебра.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// ключевые концепции</div>
            <ul className={s.colList}>
              <li className={s.colItem}>
                <strong>Таблица (relation)</strong> — набор строк с одинаковой структурой
              </li>
              <li className={s.colItem}>
                <strong>Первичный ключ (PK)</strong> — уникальный идентификатор строки
              </li>
              <li className={s.colItem}>
                <strong>Внешний ключ (FK)</strong> — ссылка на строку в другой таблице
              </li>
              <li className={s.colItem}>
                <strong>Индекс</strong> — ускоряет поиск за счёт B-tree структуры
              </li>
              <li className={s.colItem}>
                <strong>JOIN</strong> — объединение данных из нескольких таблиц
              </li>
              <li className={s.colItem}>
                <strong>Нормализация</strong> — устранение дублирования через декомпозицию
              </li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// ACID гарантии</div>
            <ul className={s.colList}>
              <li className={s.colItem}>
                <strong>Atomicity</strong> — транзакция выполняется полностью или не выполняется вообще
              </li>
              <li className={s.colItem}>
                <strong>Consistency</strong> — данные всегда соответствуют правилам схемы
              </li>
              <li className={s.colItem}>
                <strong>Isolation</strong> — параллельные транзакции не видят промежуточных результатов
              </li>
              <li className={s.colItem}>
                <strong>Durability</strong> — зафиксированные данные не потеряются при сбое сервера
              </li>
            </ul>
          </div>
        </div>

        <p className={s.body}>
          ACID — не просто аббревиатура. Это гарантии, на которые опираются банки, магазины,
          медицинские системы. Перевод денег со счёта на счёт без ACID невозможен без дополнительного
          слоя логики.
        </p>
      </section>

      {/* 4. SQL язык */}
      <section className={s.section}>
        <SectionTitle>SQL — язык запросов</SectionTitle>
        <p className={s.lead}>
          SQL (Structured Query Language) был разработан в IBM в 1974 году как «почти человеческий» язык
          для работы с реляционными данными. В 1986 году стал стандартом ANSI.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// что умеет SQL</div>
            <ul className={s.colList}>
              <li className={s.colItem}><strong>SELECT</strong> — выборка данных с фильтрацией, сортировкой, агрегацией</li>
              <li className={s.colItem}><strong>JOIN</strong> — объединение таблиц (INNER, LEFT, RIGHT, FULL)</li>
              <li className={s.colItem}><strong>GROUP BY + агрегаты</strong> — COUNT, SUM, AVG, MIN, MAX</li>
              <li className={s.colItem}><strong>Подзапросы</strong> — запрос внутри запроса</li>
              <li className={s.colItem}><strong>Window functions</strong> — ROW_NUMBER, RANK, LAG/LEAD</li>
              <li className={s.colItem}><strong>CTE</strong> — WITH clause, временные именованные запросы</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// диалекты SQL</div>
            <ul className={s.colList}>
              <li className={s.colItem}><strong>PostgreSQL</strong> — PL/pgSQL, самый богатый open-source диалект</li>
              <li className={s.colItem}><strong>MySQL/MariaDB</strong> — популярен в вебе, упрощённый диалект</li>
              <li className={s.colItem}><strong>SQLite</strong> — встраиваемая БД, нет сервера, файл на диске</li>
              <li className={s.colItem}><strong>MS SQL</strong> — T-SQL, корпоративный продукт Microsoft</li>
              <li className={s.colItem}><strong>Oracle</strong> — PL/SQL, enterprise-стандарт в банках</li>
            </ul>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// совет</div>
          <div className={s.calloutText}>
            Стандарт SQL-92 — базовый уровень, совместимый со всеми диалектами. Специфика каждой СУБД
            (window functions, JSON-операторы, процедурные расширения) расходится. При смене БД придётся
            переписать специфичные запросы.
          </div>
        </div>
      </section>

      {/* 5. Почему появился NoSQL */}
      <section className={s.section}>
        <SectionTitle>Почему появился NoSQL</SectionTitle>
        <p className={s.lead}>
          В 2000-х интернет взорвался. Google, Amazon, Facebook работают с петабайтами данных
          и миллиардами пользователей. Классический SQL не был рассчитан на это.
        </p>

        <div className={s.problemBox}>
          <div className={s.problemTitle}>// проблемы SQL при веб-масштабе</div>
          <ul className={s.problemList}>
            <li className={s.problemItem}>
              Вертикальное масштабирование (купи сервер помощнее) достигает физического предела
            </li>
            <li className={s.problemItem}>
              Горизонтальное масштабирование (шардинг) сложно и ломает JOIN между серверами
            </li>
            <li className={s.problemItem}>
              Жёсткая схема: изменить структуру таблицы на миллиардах строк — катастрофа
            </li>
            <li className={s.problemItem}>
              Репликация master-slave не решает проблему записи — мастер один
            </li>
          </ul>
        </div>

        <p className={s.body}>
          Google опубликовал статью о Bigtable (2004), Amazon — о Dynamo (2007). Обе компании
          создали свои хранилища для конкретных задач. В 2009 на конференции в Сан-Франциско
          появился хэштег #nosql — и термин стал мейнстримом.
        </p>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// важно понять</div>
          <div className={s.calloutText}>
            NoSQL — не «лучше SQL». Это «другое для другого». Каждая NoSQL система решала конкретную
            задачу: MongoDB — гибкая схема, Redis — скорость в памяти, Cassandra — запись на тысячи
            нод. Правильный выбор зависит от задачи.
          </div>
        </div>
      </section>

      {/* 6. Типы NoSQL */}
      <section className={s.section}>
        <SectionTitle>Типы NoSQL баз данных</SectionTitle>
        <p className={s.lead}>
          NoSQL — зонтичный термин для десятков разных решений. Основные четыре типа:
        </p>

        <div className={s.typeGrid}>
          {NOSQL_TYPES.map((t) => (
            <div
              key={t.name}
              className={s.typeCard}
              style={{ '--tc': t.color } as React.CSSProperties}
            >
              <div className={s.typeHeader}>
                <span className={s.typeIcon}>{t.icon}</span>
                <span className={s.typeName}>{t.name}</span>
              </div>
              <p className={s.typeDesc}>{t.desc}</p>
              <div className={s.typeExamples}>
                {t.examples.map((ex) => (
                  <span key={ex} className={s.typeExample}>{ex}</span>
                ))}
              </div>
              <p className={s.typeWhen}>{t.when}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SQL vs NoSQL сравнение */}
      <section className={s.section}>
        <SectionTitle>SQL vs NoSQL — сравнение</SectionTitle>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Критерий</th>
                <th>SQL (PostgreSQL)</th>
                <th>Document (MongoDB)</th>
                <th>Key-Value (Redis)</th>
                <th>Columnar (ClickHouse)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Схема данных</td>
                <td>Жёсткая, фиксированная</td>
                <td>Гибкая, per-document</td>
                <td>Нет схемы</td>
                <td>Жёсткая, по столбцам</td>
              </tr>
              <tr>
                <td>ACID транзакции</td>
                <td><span className={s.yes}>✓ полные</span></td>
                <td><span className={s.partial}>~ частичные</span></td>
                <td><span className={s.no}>✗ нет</span></td>
                <td><span className={s.no}>✗ нет</span></td>
              </tr>
              <tr>
                <td>Масштабирование</td>
                <td>Вертикальное (ограниченно)</td>
                <td>Горизонтальное (шардинг)</td>
                <td>Горизонтальное (кластер)</td>
                <td>Горизонтальное (шардинг)</td>
              </tr>
              <tr>
                <td>JOIN / связи</td>
                <td><span className={s.yes}>✓ мощные</span></td>
                <td><span className={s.partial}>~ lookup</span></td>
                <td><span className={s.no}>✗ нет</span></td>
                <td><span className={s.partial}>~ ограниченные</span></td>
              </tr>
              <tr>
                <td>Скорость записи</td>
                <td>Средняя</td>
                <td>Высокая</td>
                <td>Очень высокая</td>
                <td>Очень высокая (batch)</td>
              </tr>
              <tr>
                <td>Аналитика (OLAP)</td>
                <td><span className={s.partial}>~ возможна</span></td>
                <td><span className={s.no}>✗ плохо</span></td>
                <td><span className={s.no}>✗ нет</span></td>
                <td><span className={s.yes}>✓ создана для этого</span></td>
              </tr>
              <tr>
                <td>Гибкость схемы</td>
                <td><span className={s.no}>✗ миграции обязательны</span></td>
                <td><span className={s.yes}>✓ любая структура</span></td>
                <td><span className={s.yes}>✓ без схемы</span></td>
                <td><span className={s.no}>✗ фиксированная</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. CAP теорема */}
      <section className={s.section}>
        <SectionTitle>CAP теорема</SectionTitle>
        <p className={s.lead}>
          В 2000 году Эрик Брюер сформулировал теорему: распределённая система не может одновременно
          гарантировать все три свойства.
        </p>

        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle}>// три свойства CAP</div>
            <ul className={s.colList}>
              <li className={s.colItem}>
                <strong>C — Consistency:</strong> все узлы видят одни и те же данные в один момент времени
              </li>
              <li className={s.colItem}>
                <strong>A — Availability:</strong> система всегда отвечает на запросы (пусть и устаревшими данными)
              </li>
              <li className={s.colItem}>
                <strong>P — Partition Tolerance:</strong> система продолжает работать при сбое сети между узлами
              </li>
            </ul>
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle}>// реальный выбор</div>
            <ul className={s.colList}>
              <li className={s.colItem}>
                <strong>CP системы:</strong> PostgreSQL, HBase, Zookeeper — выбирают согласованность, могут стать недоступными при разделении
              </li>
              <li className={s.colItem}>
                <strong>AP системы:</strong> Cassandra, DynamoDB, CouchDB — всегда доступны, данные могут временно расходиться
              </li>
              <li className={s.colItem}>
                <strong>CA:</strong> теоретически возможно только без сетевого разделения — то есть только на одном сервере
              </li>
            </ul>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// практический смысл</div>
          <div className={s.calloutText}>
            P (Partition Tolerance) всегда нужен в распределённых системах — сети ненадёжны.
            Реальный выбор: C или A при сбое. Банковский перевод требует C.
            Корзина покупок Amazon выбрала A — лучше показать устаревшую корзину, чем упасть.
          </div>
        </div>
      </section>

      {/* 9. Как выбрать БД */}
      <section className={s.section}>
        <SectionTitle>Как выбрать базу данных</SectionTitle>
        <p className={s.lead}>
          Универсального ответа нет. Но есть системный подход: опиши задачу, выбери по критериям.
        </p>

        <div className={s.choiceList}>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Сложные связи между сущностями, транзакции, отчёты</span>
            <span className={s.choiceAnswer}>→ PostgreSQL / MySQL</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Гибкая схема, разные структуры для разных объектов</span>
            <span className={s.choiceAnswer}>→ MongoDB</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Кэш, сессии, счётчики, очереди с мгновенным доступом</span>
            <span className={s.choiceAnswer}>→ Redis</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Аналитика, OLAP, логи, метрики за периоды</span>
            <span className={s.choiceAnswer}>→ ClickHouse / Redshift</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Высокая запись с репликацией на тысячи нод</span>
            <span className={s.choiceAnswer}>→ Cassandra</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Социальный граф, рекомендации, fraud detection</span>
            <span className={s.choiceAnswer}>→ Neo4j / Amazon Neptune</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Векторный поиск, AI-приложения с RAG</span>
            <span className={s.choiceAnswer}>→ pgvector / Pinecone / Weaviate</span>
          </div>
          <div className={s.choiceItem}>
            <span className={s.choiceCondition}>Стартап без определённых требований</span>
            <span className={s.choiceAnswer}>→ PostgreSQL как default — универсален и надёжен</span>
          </div>
        </div>

        <div className={s.callout}>
          <div className={s.calloutLabel}>// практика</div>
          <div className={s.calloutText}>
            Большинство проектов используют несколько баз одновременно: PostgreSQL для основных данных,
            Redis для кэша, ClickHouse для аналитики. Это называется polyglot persistence — выбирай
            нужный инструмент для каждой задачи.
          </div>
        </div>
      </section>

      {/* Quiz */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
