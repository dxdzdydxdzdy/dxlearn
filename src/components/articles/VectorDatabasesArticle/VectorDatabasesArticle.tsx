import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { VectorExplorer } from './VectorExplorer';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import s from './VectorDatabasesArticle.module.scss';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function VectorDatabasesArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Проблема ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Зачем вообще специальная база для векторов?</SectionTitle>
        <p className={s.lead}>
          Вектор эмбеддинга — это массив из 1 536 чисел.
          Кажется, сохрани в PostgreSQL и ищи. Но «ближайший» вектор — это не «меньший»:
          нельзя построить B-tree по расстоянию в 1 536-мерном пространстве.
          При наивном поиске нужно сравнить запрос со всеми N записями.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#ff5f6a' }}>Без специального индекса</div>
            <CodeHighlight lang="ts" code={`-- Наивный поиск в PostgreSQL (без pgvector)
SELECT id FROM docs
ORDER BY embedding <-> $1  -- L2 distance
LIMIT 10;

-- Seq scan: 1M строк × 1536 dims
-- ≈ 3 секунды. Неприемлемо.

-- B-tree на числовом массиве не работает:
-- нет понятия "порядка" — только расстояние
-- от конкретной точки запроса`} />
          </div>
          <div className={s.colCard}>
            <div className={s.colTitle} style={{ color: '#00e5a0' }}>С HNSW индексом</div>
            <CodeHighlight lang="ts" code={`-- pgvector с HNSW:
CREATE INDEX ON docs
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

SELECT id FROM docs
ORDER BY embedding <=> $1  -- cosine
LIMIT 10;

-- HNSW: O(log N), 5–20 мс для 1M векторов
-- Recall ~97–99% от точного поиска`} />
          </div>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>КЛЮЧЕВАЯ ИДЕЯ</div>
          <p className={s.calloutText}>
            Векторная база — это прежде всего <strong>ANN-индекс</strong> (Approximate Nearest Neighbor).
            Он жертвует 1–3% точности ради 100–1000× ускорения поиска.
            Для RAG это прекрасная сделка: мы всё равно потом реранкируем топ-K.
          </p>
        </div>
      </section>

      {/* ── 2. HNSW изнутри ─────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>HNSW: как работает граф под капотом</SectionTitle>
        <p className={s.lead}>
          HNSW (Hierarchical Navigable Small World) — это многоуровневый граф.
          Верхний уровень разреженный: длинные «прыжки» для быстрого сближения.
          Нижний плотный: точный поиск в малой окрестности.
        </p>
        <CodeHighlight lang="ts" code={`// Алгоритм HNSW — поиск:

// Уровень 3 (разреженный): 4 узла
//  [A] ────────────────── [E]    ← входим здесь, прыгаем к E
//                                   (E ближе к query)
// Уровень 2: 16 узлов
//  [A]-[B]-[C] ... [E]-[F]-[G]  ← продолжаем от E
//
// Уровень 1: 64 узла
//  много связей, ищем в районе G ← точный поиск
//
// Уровень 0 (полный граф): все N узлов
//  проверяем соседей G → находим топ-K    ← результат

// Параметры:
// M = 16          → количество связей каждого узла
// ef_construction → качество построения (один раз)
// ef_search       → ширина beam search (каждый запрос)

// Вставка нового вектора:
// 1. Случайный уровень max_level ~ log(M)
// 2. Найти M ближайших на каждом уровне
// 3. Создать двунаправленные связи

// Память = N × M × 2 × sizeof(uint32) + сами векторы
// 1M векторов, M=16 → ~128 MB граф + 6 GB векторы (1536 dims × 4 байта)`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>QUANTIZATION — ЭКОНОМИМ ПАМЯТЬ В 4–32×</div>
          <p className={s.infoText}>
            <strong>Scalar Quantization (SQ8):</strong> <code>float32 → int8</code>.
            1536 dims × 4 байта → 1536 байт. Recall потеря: ~1%.{' '}
            <strong>Binary Quantization:</strong> каждое значение → 1 бит.
            1536 dims → 192 байта. Recall потеря: ~5–10% (нужен rerank).{' '}
            Qdrant, Pinecone, pgvector (с расширениями) поддерживают SQ.
            При 100M+ векторов quantization — необходимость.
          </p>
        </div>
      </section>

      {/* ── 3. VectorExplorer ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Интерактив: Brute Force vs HNSW</SectionTitle>
        <p className={s.body}>
          Выбери слово, нажми{' '}
          <strong>▶ Запустить поиск</strong> — и посмотри разницу двух подходов.
          В режиме <strong>Brute Force</strong> алгоритм проверяет все 19 точек.
          В режиме <strong>HNSW</strong> — только 5–7, следуя по рёбрам графа.
          Топ-3 ближайших соседя при этом одни и те же.
        </p>
        <VectorExplorer />
      </section>

      {/* ── 4. Сравнение баз ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Обзор: pgvector, Qdrant, Pinecone, FAISS</SectionTitle>
        <div className={s.compareTable}>
          <div className={s.compareTableHead}>
            <div className={s.compareTableHCell}>БАЗА</div>
            <div className={s.compareTableHCell}>ОПИСАНИЕ</div>
            <div className={s.compareTableHCell}>ИНДЕКС</div>
            <div className={s.compareTableHCell}>ДЕПЛОЙ</div>
            <div className={s.compareTableHCell}>ФИЛЬТРАЦИЯ</div>
            <div className={s.compareTableHCell}>ЦЕНА</div>
          </div>
          {[
            {
              name: 'pgvector',
              color: '#4db8ff',
              tagline: 'Расширение для PostgreSQL. SQL + векторы в одном стеке.',
              index: 'HNSW, IVFFlat',
              deploy: 'Self-hosted / Supabase',
              filter: 'WHERE clause',
              price: 'Бесплатно',
              badge: 'Postgres',
            },
            {
              name: 'Qdrant',
              color: '#ff9070',
              tagline: 'Rust. Production-ready. Payload filtering, sparse+dense hybrid.',
              index: 'HNSW',
              deploy: 'Docker / Cloud',
              filter: 'Pre-filtering',
              price: 'OSS + Cloud',
              badge: 'Rust',
            },
            {
              name: 'Pinecone',
              color: '#f0c040',
              tagline: 'Managed SaaS. Zero ops. Namespace, metadata, serverless.',
              index: 'Проприетарный',
              deploy: 'SaaS only',
              filter: 'Metadata',
              price: '$0.08 / 1M req',
              badge: 'SaaS',
            },
            {
              name: 'Weaviate',
              color: '#c084fc',
              tagline: 'GraphQL API. Модули для авто-эмбеддинга. Multi-modal.',
              index: 'HNSW',
              deploy: 'Docker / Cloud',
              filter: 'WHERE + BM25',
              price: 'OSS + Cloud',
              badge: 'GraphQL',
            },
            {
              name: 'FAISS',
              color: '#00e5a0',
              tagline: 'Библиотека (не сервер). GPU поддержка. Исследования/offline.',
              index: 'HNSW, IVF, PQ',
              deploy: 'Библиотека',
              filter: 'Нет native',
              price: 'MIT License',
              badge: 'Library',
            },
            {
              name: 'Chroma',
              color: '#7a9aaa',
              tagline: 'Простая встроенная БД для прототипов. LangChain / LlamaIndex.',
              index: 'HNSW (hnswlib)',
              deploy: 'Embedded/Server',
              filter: 'Metadata',
              price: 'Бесплатно',
              badge: 'Python',
            },
          ].map(db => (
            <div key={db.name} className={s.compareRow}>
              <div>
                <div className={s.dbName} style={{ color: db.color }}>{db.name}</div>
                <span
                  className={s.dbBadge}
                  style={{ color: db.color, borderColor: db.color + '44', background: db.color + '11' }}
                >
                  {db.badge}
                </span>
              </div>
              <div className={s.dbTagline}>{db.tagline}</div>
              <div className={s.dbCell}>{db.index}</div>
              <div className={s.dbCell}>{db.deploy}</div>
              <div className={s.dbCell}>{db.filter}</div>
              <div className={s.dbCell}>{db.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. pgvector — практика ──────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>pgvector: SQL + векторы в одном стеке</SectionTitle>
        <p className={s.body}>
          pgvector — расширение PostgreSQL. Если у тебя уже есть Postgres —
          это нулевой overhead: никаких дополнительных сервисов, SQL-джоины
          с обычными таблицами, ACID транзакции, знакомый pg_dump.
        </p>
        <CodeHighlight lang="ts" code={`-- Установка и базовая настройка
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица с векторами
CREATE TABLE documents (
  id        BIGSERIAL PRIMARY KEY,
  source    TEXT NOT NULL,
  chunk     TEXT NOT NULL,
  embedding VECTOR(1536),  -- размер = dims embedding-модели
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW индекс (рекомендуется)
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Поиск top-5 похожих (cosine similarity)
SELECT id, source, chunk,
       1 - (embedding <=> $1) AS similarity
FROM documents
ORDER BY embedding <=> $1
LIMIT 5;

-- Поиск с фильтрацией по метаданным
SELECT id, chunk, 1 - (embedding <=> $1) AS sim
FROM documents
WHERE source LIKE 'docs/%'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY embedding <=> $1
LIMIT 5;

-- Операторы:
-- <=>  cosine distance   (для нормализованных векторов)
-- <->  L2 distance       (Euclidean)
-- <#>  inner product     (-dot product, меньше = лучше)

-- TypeScript (Drizzle ORM):
import { sql } from 'drizzle-orm';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

const results = await db
  .select({
    id: documents.id,
    chunk: documents.chunk,
    similarity: sql<number>\`1 - (embedding <=> \${vectorParam})\`,
  })
  .from(documents)
  .orderBy(sql\`embedding <=> \${vectorParam}\`)
  .limit(5);`} />
      </section>

      {/* ── 6. Qdrant — практика ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Qdrant: production-grade с богатой фильтрацией</SectionTitle>
        <p className={s.body}>
          Qdrant написан на Rust, имеет gRPC и REST API, поддерживает
          payload-фильтрацию, sparse+dense hybrid search, scalar quantization
          и шардирование. Лучший выбор когда нужны сложные фильтры или 10M+ векторов.
        </p>
        <CodeHighlight lang="ts" code={`import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({ url: 'http://localhost:6333' });

// Создать коллекцию
await client.createCollection('documents', {
  vectors: { size: 1536, distance: 'Cosine' },
  hnsw_config: { m: 16, ef_construct: 100 },
});

// Индексировать payload-поле для быстрой фильтрации
await client.createPayloadIndex('documents', {
  field_name: 'department',
  field_schema: 'keyword',
});

// Вставить точки
await client.upsert('documents', {
  points: [
    {
      id: '550e8400-e29b-41d4-a716',
      vector: [...embedding],          // float32[1536]
      payload: {
        source: 'docs/api/auth.md',
        department: 'engineering',
        date: '2024-03',
        chunk_index: 0,
      },
    },
  ],
});

// Поиск с pre-filtering
const results = await client.search('documents', {
  vector: [...queryEmbedding],
  limit: 5,
  with_payload: true,
  filter: {
    must: [
      { key: 'department', match: { value: 'engineering' } },
    ],
    should: [
      { key: 'date', range: { gte: '2024-01' } },
    ],
  },
  params: { hnsw_ef: 128 },  // ef_search — точность vs скорость
});

// Hybrid search: dense + sparse (BM25)
const hybridResults = await client.queryPoints('documents', {
  prefetch: [
    { query: queryVector,  using: 'dense',  limit: 20 },
    { query: sparseVector, using: 'sparse', limit: 20 },
  ],
  query: { fusion: 'rrf' },   // Reciprocal Rank Fusion
  limit: 5,
});`} />
      </section>

      {/* ── 7. HNSW параметры ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Параметры HNSW: настройка под задачу</SectionTitle>
        <p className={s.body}>
          Три параметра HNSW определяют компромисс между точностью, скоростью и памятью.
          Менять без перестройки индекса можно только <code>ef_search</code>.
        </p>
        <div className={s.paramGrid}>
          {[
            {
              name: 'M',
              default: '16',
              color: '#4db8ff',
              effect: 'Число двунаправленных связей каждого узла в графе. Определяет "связность".',
              trade: '↑ M → выше recall, больше памяти и времени индексации\n↓ M → меньше память, хуже recall при сложном пространстве\n\nТипичные значения: 8, 16, 32, 64',
            },
            {
              name: 'ef_construction',
              default: '100',
              color: '#f0c040',
              effect: 'Ширина beam search при добавлении нового вектора в граф. Только при индексации.',
              trade: '↑ → качественнее граф, медленнее индексация\nЗначение: ef_construction ≥ M (обычно ef_c = 2×M...4×M)\n\nОднократная операция — можно не экономить',
            },
            {
              name: 'ef_search',
              default: '64',
              color: '#00e5a0',
              effect: 'Ширина поиска при каждом запросе. Можно менять без перестройки индекса.',
              trade: '↑ → точнее recall, медленнее запрос\nef_search ≥ top_k (обязательно!)\nef_search=64 → recall~97%\nef_search=200 → recall~99.5%',
            },
          ].map(p => (
            <div key={p.name} className={s.paramCard} style={{ borderTop: `3px solid ${p.color}` }}>
              <div className={s.paramName} style={{ color: p.color }}>{p.name}</div>
              <div className={s.paramDefault}>default: {p.default}</div>
              <div className={s.paramEffect}>{p.effect}</div>
              <div className={s.paramTrade} style={{ whiteSpace: 'pre-line' }}>{p.trade}</div>
            </div>
          ))}
        </div>
        <CodeHighlight lang="ts" code={`// Рекомендуемые конфигурации по сценарию:

// ① Прототип / небольшой объём (<100K векторов)
{ m: 16, ef_construction: 64,  ef_search: 64  }
// Быстрая индексация, recall ~97%

// ② Продакшн RAG (100K – 5M векторов)
{ m: 16, ef_construction: 100, ef_search: 128 }
// Хороший баланс скорость/точность, recall ~98.5%

// ③ Высокоточный поиск (медицина, юриспруденция)
{ m: 32, ef_construction: 200, ef_search: 256 }
// Recall ~99.5%, в 2–3× медленнее чем ①

// ④ Экономия памяти (IoT, edge)
{ m: 8,  ef_construction: 64,  ef_search: 32  }
// + SQ8 quantization → 4× меньше памяти
// Recall ~94–95%`} />
      </section>

      {/* ── 8. Hybrid Search ────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Hybrid Search: векторы + ключевые слова</SectionTitle>
        <p className={s.lead}>
          Чисто векторный поиск плох для точных совпадений: артикулы, имена,
          коды ошибок. Чисто keyword-поиск (BM25) плох для семантики.
          Hybrid = лучшее от обоих через <strong>Reciprocal Rank Fusion</strong>.
        </p>
        <CodeHighlight lang="ts" code={`// Reciprocal Rank Fusion (RRF):
// score(d) = Σ 1 / (k + rank_i(d))
// k=60 (константа-сглаживатель)

// Пример в PostgreSQL (pgvector + ts_vector):
WITH vector_search AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY embedding <=> $1
  ) AS rank_v
  FROM documents
  LIMIT 60
),
keyword_search AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY ts_rank(to_tsvector('russian', chunk),
                     plainto_tsquery('russian', $2)) DESC
  ) AS rank_k
  FROM documents
  WHERE to_tsvector('russian', chunk)
        @@ plainto_tsquery('russian', $2)
  LIMIT 60
)
SELECT
  COALESCE(v.id, k.id) AS id,
  COALESCE(1.0/(60+v.rank_v), 0) +
  COALESCE(1.0/(60+k.rank_k), 0) AS rrf_score
FROM vector_search v
FULL OUTER JOIN keyword_search k ON v.id = k.id
ORDER BY rrf_score DESC
LIMIT 10;

// Qdrant native hybrid (sparse + dense):
// POST /collections/docs/points/query
{
  "prefetch": [
    {"query": denseVector,  "using": "dense",  "limit": 20},
    {"query": sparseVector, "using": "sparse", "limit": 20}
  ],
  "query": {"fusion": "rrf"},
  "limit": 5
}`} />
        <div className={s.warningCard}>
          <div className={s.warningLabel}>SPARSE VECTORS</div>
          <p className={s.warningText}>
            Для keyword-части hybrid search нужны sparse-векторы: большинство значений = 0,
            ненулевые — веса BM25 для встречающихся слов.
            SPLADE, BM25 encoder (FastEmbed от Qdrant) конвертируют текст в sparse-вектор.
            Qdrant хранит dense и sparse одновременно, автоматически выбирая IVF для sparse.
          </p>
        </div>
      </section>

      {/* ── 9. Когда что выбирать ────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Когда что выбирать</SectionTitle>
        <div className={s.whenGrid}>
          {[
            {
              condition: 'Уже есть PostgreSQL',
              db: 'pgvector',
              color: '#4db8ff',
              reason: 'Нулевой overhead, SQL-джоины, знакомый стек. До 5M векторов отлично.',
            },
            {
              condition: 'Нужны сложные фильтры + большой объём',
              db: 'Qdrant',
              color: '#ff9070',
              reason: 'Pre-filtering, payload-индексы, Rust-производительность. Бесплатно self-hosted.',
            },
            {
              condition: 'Нет времени на девопс',
              db: 'Pinecone',
              color: '#f0c040',
              reason: 'SaaS, zero ops, serverless. Дороже, но не нужно управлять инфраструктурой.',
            },
            {
              condition: 'Прототип / локальная разработка',
              db: 'Chroma',
              color: '#7a9aaa',
              reason: 'pip install chromadb, встраивается прямо в Python-приложение. Нет сервера.',
            },
            {
              condition: 'Офлайн батч-обработка / ML pipeline',
              db: 'FAISS',
              color: '#00e5a0',
              reason: 'GPU поддержка, максимальная raw performance. Не нужен REST API.',
            },
            {
              condition: 'Multi-modal + GraphQL',
              db: 'Weaviate',
              color: '#c084fc',
              reason: 'Встроенные модули для авто-эмбеддинга текста, картинок, аудио.',
            },
            {
              condition: 'Uber-scale (1B+ векторов)',
              db: 'Milvus',
              color: '#fb7185',
              reason: 'Kubernetes-native, горизонтальное шардирование. Сложнее в эксплуатации.',
            },
          ].map(w => (
            <div key={w.db} className={s.whenRow}>
              <div className={s.whenCondition}>{w.condition}</div>
              <div className={s.whenChoice}>
                <span
                  className={s.whenDb}
                  style={{ color: w.color, borderColor: w.color + '44', background: w.color + '11' }}
                >
                  {w.db}
                </span>
                <span className={s.whenReason}>{w.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. Production tips ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Production: что важно знать</SectionTitle>
        <CodeHighlight lang="ts" code={`// 1. Размер памяти для 1M векторов (1536 dims):
// float32: 1M × 1536 × 4 байта = 6 GB
// + HNSW граф (M=16): ~128 MB
// + SQ8 quantization: 1.5 GB вместо 6 GB
//
// Правило: предоставь RAM = размер векторов × 1.5

// 2. Batching при индексации (Qdrant):
const BATCH = 256;
for (let i = 0; i < chunks.length; i += BATCH) {
  await client.upsert('docs', {
    points: chunks.slice(i, i + BATCH).map((c, j) => ({
      id: i + j,
      vector: embeddings[i + j],
      payload: { source: c.source, text: c.text },
    })),
  });
}
// 256 точек за раз = оптимальный batching для большинства случаев

// 3. Бэкапы (Qdrant snapshot API):
// POST /collections/docs/snapshots
// Возвращает .snapshot файл для восстановления

// 4. Мониторинг recall через sampling:
// Раз в день: 100 random queries → brute force vs HNSW
// Если recall < 95% → перестрой индекс или увеличь ef_search

// 5. Удаление устаревших документов:
// Qdrant: client.delete('docs', { filter: { must: [...] } })
// pgvector: DELETE FROM docs WHERE source = $1 — индекс обновится
// FAISS: нет поддержки удаления → нужно перестраивать периодически`} />
        <div className={s.infoCard}>
          <div className={s.infoLabel}>SUPABASE = pgvector БЕСПЛАТНО</div>
          <p className={s.infoText}>
            Supabase включает pgvector из коробки на бесплатном плане.
            Идеально для старта: SQL-консоль, авто-бэкапы, встроенная авторизация.
            При росте — легко мигрировать на Qdrant Cloud или self-hosted.
            <strong> Не платишь за отдельный векторный сервис пока не нужно.</strong>
          </p>
        </div>
      </section>

      {/* ── 11. Quiz ──────────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
