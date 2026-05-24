'use client';

import { useState } from 'react';
import s from './DbTimeline.module.scss';

type Era = 'pre' | 'relational' | 'web' | 'nosql' | 'modern';

interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
  detail: string;
  era: Era;
  tag?: string;
}

const EVENTS: TimelineEvent[] = [
  {
    year: '1956',
    title: 'Первый жёсткий диск',
    desc: 'IBM 350 RAMAC — 5 МБ, размером с холодильник, $3 200/МБ.',
    detail: 'Данные хранились в плоских файлах. Каждое приложение придумывало свой формат. Найти что-то или связать записи между файлами — ручная работа. Дублирование было нормой.',
    era: 'pre',
    tag: 'hardware',
  },
  {
    year: '1960',
    title: 'Иерархические БД',
    desc: 'IBM IMS — первая промышленная СУБД. Данные как дерево.',
    detail: 'IMS использовалась в NASA для программы Apollo и в банках. Структура строгая: родитель → дети. Найти данные можно только по заранее заданным путям. Изменить структуру позже — катастрофа.',
    era: 'pre',
    tag: 'IBM',
  },
  {
    year: '1969',
    title: 'Сетевая модель CODASYL',
    desc: 'Записи связаны произвольно — не только родитель-ребёнок.',
    detail: 'Шаг вперёд от иерархии: записи могут иметь несколько "родителей". Но программист обязан вручную следовать по указателям между записями. Абстракции нет — нужно знать физическую структуру хранения.',
    era: 'pre',
    tag: 'CODASYL',
  },
  {
    year: '1970',
    title: 'Реляционная модель Кодда',
    desc: 'Эдгар Кодд публикует статью в ACM. Данные — таблицы, не деревья.',
    detail: '"A Relational Model of Data for Large Shared Data Banks" — одна из самых важных статей в истории CS. Кодд предложил: данные в таблицах (relations), операции над ними — реляционная алгебра. Программист работает с данными, не с физическим хранением.',
    era: 'relational',
    tag: 'Edgar Codd',
  },
  {
    year: '1974',
    title: 'SEQUEL → SQL',
    desc: 'IBM System R — первая реализация реляционной модели.',
    detail: 'SEQUEL (Structured English Query Language) разработан Чемберлином и Бойсом в IBM. Позже переименован в SQL из-за торговой марки. Идея: запросы на почти-человеческом языке вместо процедурного кода.',
    era: 'relational',
    tag: 'IBM',
  },
  {
    year: '1979',
    title: 'Oracle — первая коммерческая СУБД',
    desc: 'Ларри Эллисон читает статью Кодда и выпускает Oracle.',
    detail: 'Oracle опередил IBM с коммерческим продуктом. Интересный факт: Эллисон прочитал статью Кодда и понял, что IBM не спешит делать продукт — решил сделать сам. Oracle стал стандартом для enterprise на десятилетия.',
    era: 'relational',
    tag: 'Oracle',
  },
  {
    year: '1986',
    title: 'SQL — стандарт ANSI',
    desc: 'SQL официально стандартизирован. Началась война диалектов.',
    detail: 'Стандарт SQL-86 унифицировал основу, но каждый вендор добавил своё. До сих пор: PL/pgSQL (PostgreSQL), T-SQL (MSSQL), PL/SQL (Oracle) — совместимы лишь частично.',
    era: 'relational',
    tag: 'ANSI',
  },
  {
    year: '1989',
    title: 'PostgreSQL',
    desc: 'Проект Ingres → Postgres в Беркли. Открытый код, расширяемость.',
    detail: 'Майкл Стоунбрейкер в Беркли создал Postgres как преемник Ingres. Ключевые идеи: пользовательские типы данных, расширяемость. В 1996 добавили SQL — стал PostgreSQL. Сегодня — самая популярная open-source СУБД в мире.',
    era: 'relational',
    tag: 'Berkeley',
  },
  {
    year: '1995',
    title: 'MySQL и взрыв веба',
    desc: 'MySQL выходит. Amazon, eBay, Google масштабируются на миллионы пользователей.',
    detail: 'Веб изменил всё. Один сервер, одна БД — уже не вариант. Первые решения: репликация (master-slave), вертикальное масштабирование (купи сервер помощнее). Но горизонтальное масштабирование SQL — не предусмотрено моделью.',
    era: 'web',
    tag: 'MySQL',
  },
  {
    year: '2004',
    title: 'Google Bigtable',
    desc: 'Google публикует статью о распределённой колоночной БД.',
    detail: 'Google индексирует весь интернет. Нужна БД на тысячи серверов. Bigtable: данные в "семействах столбцов", горизонтальное масштабирование. Статья вдохновила HBase, Cassandra и всё движение NoSQL.',
    era: 'nosql',
    tag: 'Google',
  },
  {
    year: '2007',
    title: 'Amazon Dynamo',
    desc: 'Amazon публикует статью о ключ-значение хранилище с eventual consistency.',
    detail: 'Dynamo — внутренняя БД Amazon для корзины покупок. Принцип: всегда доступна (AP в CAP теореме), eventual consistency. Вдохновила Cassandra, Riak. Стала DynamoDB — самый популярный cloud-native БД сервис.',
    era: 'nosql',
    tag: 'Amazon',
  },
  {
    year: '2009',
    title: 'NoSQL-взрыв',
    desc: 'MongoDB, Redis, Cassandra — за один год. Термин NoSQL становится мейнстримом.',
    detail: 'На конференции в Сан-Франциско кто-то предложил хэштег #nosql. Новые БД решали конкретные проблемы: MongoDB — гибкая схема, Redis — скорость в памяти, Cassandra — запись на тысячи нод. Не "лучше SQL", а "другое для другого".',
    era: 'nosql',
    tag: 'Community',
  },
  {
    year: '2012',
    title: 'Google Spanner',
    desc: 'Первая глобально-распределённая SQL БД. Транзакции через континенты.',
    detail: 'Spanner нарушил CAP теорему на практике: ACID транзакции + горизонтальное масштабирование + глобальное распределение. Использует атомарные часы (TrueTime API). Вдохновила CockroachDB, YugabyteDB — NewSQL.',
    era: 'modern',
    tag: 'Google',
  },
  {
    year: '2017',
    title: 'Serverless databases',
    desc: 'Amazon Aurora Serverless — платишь только за запросы, не за сервер.',
    detail: 'Новая парадигма: нет постоянного сервера, БД масштабируется до нуля. Neon (serverless PostgreSQL), PlanetScale (serverless MySQL) — сегодня стандарт для небольших проектов и стартапов.',
    era: 'modern',
    tag: 'Amazon',
  },
  {
    year: '2023–2026',
    title: 'Vector databases и AI эпоха',
    desc: 'pgvector, Pinecone, Weaviate — хранение эмбеддингов для LLM.',
    detail: 'LLM-революция создала спрос на новый тип хранения: векторные представления текста/изображений. PostgreSQL добавил pgvector — похожие документы по косинусному сходству. RAG (Retrieval Augmented Generation) — стандартная архитектура для AI-приложений.',
    era: 'modern',
    tag: 'AI',
  },
];

const ERA_LABELS: Record<Era, string> = {
  pre: 'До реляционных',
  relational: 'Реляционная эра',
  web: 'Веб-взрыв',
  nosql: 'NoSQL движение',
  modern: 'Современность',
};

const ERA_COLORS: Record<Era, string> = {
  pre: '#3d5562',
  relational: '#4e9eff',
  web: '#f0c040',
  nosql: '#ff7b72',
  modern: '#b48eff',
};

export function DbTimeline() {
  const [selected, setSelected] = useState<number | null>(2);

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// database-history-timeline</span>
        <span className={s.hint}>кликни на событие</span>
      </div>

      <div className={s.body}>
        <div className={s.timeline}>
          {EVENTS.map((ev, i) => (
            <button
              key={i}
              className={`${s.event} ${selected === i ? s.eventActive : ''}`}
              style={{ '--ec': ERA_COLORS[ev.era] } as React.CSSProperties}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              <div className={s.eventDot} />
              <div className={s.eventContent}>
                <span className={s.eventYear}>{ev.year}</span>
                <span className={s.eventTitle}>{ev.title}</span>
                <span className={s.eventDesc}>{ev.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <div className={s.detail}>
          {selected !== null ? (
            <div className={s.detailCard} style={{ '--ec': ERA_COLORS[EVENTS[selected].era] } as React.CSSProperties}>
              <div className={s.detailTop}>
                <span className={s.detailYear}>{EVENTS[selected].year}</span>
                {EVENTS[selected].tag && <span className={s.detailTag}>{EVENTS[selected].tag}</span>}
                <span className={s.detailEra} style={{ color: ERA_COLORS[EVENTS[selected].era] }}>
                  {ERA_LABELS[EVENTS[selected].era]}
                </span>
              </div>
              <div className={s.detailTitle}>{EVENTS[selected].title}</div>
              <div className={s.detailText}>{EVENTS[selected].detail}</div>
            </div>
          ) : (
            <div className={s.placeholder}>← выбери событие</div>
          )}

          <div className={s.legend}>
            {(Object.keys(ERA_LABELS) as Era[]).map(era => (
              <div key={era} className={s.legendItem}>
                <span className={s.legendDot} style={{ background: ERA_COLORS[era] }} />
                <span className={s.legendLabel}>{ERA_LABELS[era]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
