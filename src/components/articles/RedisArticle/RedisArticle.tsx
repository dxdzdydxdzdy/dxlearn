import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import s from './RedisArticle.module.scss';
import { RedisPlayground } from './RedisPlayground';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';
import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';

export function RedisArticle() {
  return (
    <div className={s.article}>

      {/* ── 1. Зачем Redis ──────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Зачем Redis, если есть PostgreSQL</SectionTitle>
        <p className={s.lead}>
          PostgreSQL читает с диска. Redis хранит всё в оперативной памяти.
          Разница: диск — ~10 мс, RAM — ~100 нс. Это 100 000 раз быстрее.
          Redis выполняет 100 000+ операций в секунду на одном ядре.
        </p>
        <p className={s.body}>
          Redis — не замена базы данных. Это дополнение: кеш горячих данных,
          счётчики, сессии, очереди задач, leaderboards. Всё что требует
          скорости и не нуждается в сложных JOIN-запросах.
        </p>
        <div className={s.twoCols}>
          <div className={s.colCard}>
            <p className={s.colTitle}>Типичные use cases</p>
            <ul className={s.colList}>
              <li className={s.colItemGood}>Кеш API-ответов и страниц</li>
              <li className={s.colItemGood}>Сессии пользователей</li>
              <li className={s.colItemGood}>Rate limiting (счётчики запросов)</li>
              <li className={s.colItemGood}>Очереди задач (BullMQ, Bee-Queue)</li>
              <li className={s.colItemGood}>Leaderboards и ранкинги</li>
              <li className={s.colItemGood}>Pub/Sub для real-time событий</li>
            </ul>
          </div>
          <div className={s.colCard}>
            <p className={s.colTitle}>Ограничения</p>
            <ul className={s.colList}>
              <li className={s.colItemBad}>Данные в RAM — стоимость масштабирования</li>
              <li className={s.colItemBad}>Без persistence — данные теряются при сбое</li>
              <li className={s.colItemBad}>Нет сложных запросов (JOIN, GROUP BY)</li>
              <li className={s.colItemBad}>Нет ACID транзакций как в PostgreSQL</li>
            </ul>
          </div>
        </div>
        <div className={s.callout}>
          <div className={s.calloutLabel}>// Persistence</div>
          <p className={s.calloutText}>
            Redis поддерживает два режима сохранения: RDB (снимок на диск раз в N секунд) и
            AOF (лог каждой операции). Для кеша persistence не нужен — потеря данных
            означает просто cache miss. Для сессий — нужен AOF или внешняя репликация.
          </p>
        </div>
      </section>

      {/* ── 2. String ───────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>String — базовая структура</SectionTitle>
        <p className={s.body}>
          Строки в Redis — это не только текст. Любые бинарные данные до 512 МБ:
          JSON, числа, сериализованные объекты. Атомарные числовые операции
          INCR/DECR/INCRBY без race condition.
        </p>
        <CodeHighlight lang="ts" code={`// Кеш с TTL
await redis.set('cache:user:42', JSON.stringify(user), { EX: 3600 });
const cached = await redis.get('cache:user:42');   // null при истечении

// Атомарный счётчик — нет race condition, Redis однопоточный
await redis.incr('views:article:42');              // 1
await redis.incr('views:article:42');              // 2
await redis.incrBy('views:article:42', 98);        // 100

// Rate limiting: 100 запросов в минуту
const key    = \`rate:\${ip}:\${Math.floor(Date.now() / 60000)}\`;
const count  = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);      // TTL на первый инкремент
if (count > 100) throw new TooManyRequestsError();

// SET с NX (только если не существует) — distributed lock
const lock = await redis.set('lock:checkout', '1', { NX: true, EX: 30 });
if (!lock) throw new Error('Another process is running');`} />
      </section>

      {/* ── 3. Hash ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Hash — объекты и сессии</SectionTitle>
        <p className={s.body}>
          Hash хранит пары field→value под одним ключом. Идеально для объектов,
          когда нужно обновлять отдельные поля без перезаписи всего объекта.
          Redis оптимизирует хранение hash до 128 полей.
        </p>
        <CodeHighlight lang="ts" code={`// Сессия пользователя
await redis.hSet('session:a1b2c3', {
  userId:   '42',
  name:     'Alice',
  role:     'admin',
  lastSeen: Date.now().toString(),
});
await redis.expire('session:a1b2c3', 86400);   // 24 часа

// Читать одно поле (эффективнее чем HGETALL)
const name = await redis.hGet('session:a1b2c3', 'name');   // 'Alice'

// Читать всё
const session = await redis.hGetAll('session:a1b2c3');
// { userId: '42', name: 'Alice', role: 'admin', lastSeen: '...' }

// Обновить одно поле — остальные не тронуты
await redis.hSet('session:a1b2c3', 'lastSeen', Date.now().toString());

// Vs String + JSON:
// GET → JSON.parse → изменить → JSON.stringify → SET
// Три операции, не атомарно, перезаписываешь всё`} />
      </section>

      {/* ── 4. List ─────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>List — очереди и история</SectionTitle>
        <p className={s.body}>
          Двусвязный список: O(1) для добавления/удаления с обеих сторон.
          RPUSH + LPOP = FIFO очередь. RPUSH + RPOP = LIFO стек.
          LRANGE для чтения последних N элементов истории.
        </p>
        <CodeHighlight lang="ts" code={`// Job queue: producer добавляет, consumer забирает
// Producer:
await redis.rPush('jobs:email', JSON.stringify({ type: 'welcome', userId: 42 }));
await redis.rPush('jobs:email', JSON.stringify({ type: 'promo',   userId: 99 }));

// Consumer (worker):
const job = await redis.lPop('jobs:email');        // FIFO
if (job) await processJob(JSON.parse(job));

// Блокирующий pop — worker спит пока нет задач:
const job = await redis.blPop('jobs:email', 0);    // 0 = ждать бесконечно

// История последних N действий (capped list):
await redis.lPush('history:user:42', JSON.stringify(action));
await redis.lTrim('history:user:42', 0, 49);       // только последние 50
const history = await redis.lRange('history:user:42', 0, -1);

// На практике для job queues используй BullMQ —
// он даёт retry, priority, concurrency поверх Redis`} />
      </section>

      {/* ── 5. Set ──────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Set — уникальные элементы</SectionTitle>
        <p className={s.body}>
          Неупорядоченное множество уникальных строк. O(1) для SADD, SREM,
          SISMEMBER. Поддерживает операции пересечения, объединения, разности
          между множествами.
        </p>
        <CodeHighlight lang="ts" code={`// Уникальные посетители за день (HyperLogLog для масштаба)
const today = new Date().toISOString().slice(0, 10);
await redis.sAdd(\`visitors:\${today}\`, \`user:\${userId}\`);
await redis.sAdd(\`visitors:\${today}\`, \`user:\${userId}\`); // дубликат игнорируется
const count = await redis.sCard(\`visitors:\${today}\`);  // уникальных посетителей

// Проверить что пользователь ещё не видел уведомление
const seen = await redis.sIsMember('notified:sale:2024', userId.toString());
if (!seen) {
  await sendNotification(userId);
  await redis.sAdd('notified:sale:2024', userId.toString());
}

// Общая аудитория двух дней
const both = await redis.sInter(['visitors:2024-05-26', 'visitors:2024-05-27']);

// Роли пользователя
await redis.sAdd(\`user:\${id}:permissions\`, 'read:articles', 'write:comments');
const can = await redis.sIsMember(\`user:\${id}:permissions\`, 'write:comments');`} />
      </section>

      {/* ── 6. Sorted Set ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Sorted Set — ранкинги и временные ряды</SectionTitle>
        <p className={s.body}>
          Каждый элемент имеет числовой score. Redis хранит элементы
          отсортированными по score. O(log N) для всех операций.
          ZINCRBY атомарно меняет score без race condition.
        </p>
        <CodeHighlight lang="ts" code={`// Leaderboard
await redis.zAdd('leaderboard:weekly', [
  { score: 1500, value: 'alice' },
  { score: 2300, value: 'bob' },
  { score: 1800, value: 'carol' },
]);

// Топ-10 (по убыванию score)
const top10 = await redis.zRangeWithScores('leaderboard:weekly', 0, 9, {
  REV: true,  // по убыванию
});
// [{ value: 'bob', score: 2300 }, { value: 'carol', score: 1800 }, ...]

// Место пользователя (0-indexed)
const rank = await redis.zRevRank('leaderboard:weekly', 'alice');  // 2

// Атомарное добавление очков
await redis.zIncrBy('leaderboard:weekly', 500, 'alice');  // 1500 → 2000

// Rate limiting через sorted set (sliding window):
const now = Date.now();
const key = \`ratelimit:\${ip}\`;
await redis.zRemRangeByScore(key, 0, now - 60000);    // удалить старые
const count = await redis.zCard(key);
if (count >= 100) throw new TooManyRequestsError();
await redis.zAdd(key, [{ score: now, value: \`\${now}-\${Math.random()}\` }]);
await redis.expire(key, 60);`} />
      </section>

      {/* ── 7. Playground ───────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Redis в браузере</SectionTitle>
        <p className={s.body}>
          Нажми на структуру данных чтобы загрузить пример, или введи команду
          вручную. Симулятор полностью работает в браузере — без подключения
          к реальному Redis.
        </p>
        <RedisPlayground />
      </section>

      {/* ── 8. TTL и naming ─────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>TTL, naming и eviction</SectionTitle>
        <p className={s.body}><strong>Naming convention:</strong></p>
        <CodeHighlight lang="ts" code={`// Используй : как разделитель, включай тип сущности и id
cache:user:42            // кеш объекта пользователя
session:a1b2c3d4         // сессия по токену
rate:192.168.1.1:1716    // rate limit по IP:минута
leaderboard:weekly       // sorted set с именем
jobs:email               // очередь email задач
lock:checkout:user:42    // distributed lock

// Не используй пробелы или спецсимволы
// Ключи чувствительны к регистру: User:42 ≠ user:42`} />

        <p className={s.body}><strong>Eviction при нехватке памяти:</strong></p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th>Политика</th><th>Что удаляется</th><th>Когда использовать</th></tr>
            </thead>
            <tbody>
              <tr><td>noeviction</td><td>Ошибка при записи</td><td>Данные критичны (очереди)</td></tr>
              <tr><td>allkeys-lru</td><td>Любые ключи, давно не использованные</td><td>Чистый кеш</td></tr>
              <tr><td>volatile-lru</td><td>Ключи с TTL, LRU</td><td>Кеш + постоянные данные</td></tr>
              <tr><td>allkeys-lfu</td><td>Редко используемые ключи</td><td>Неравномерный доступ</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 9. Pub/Sub ──────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Pub/Sub — real-time события</SectionTitle>
        <p className={s.body}>
          Redis Pub/Sub: publisher публикует сообщение в канал, все subscribers
          получают его немедленно. Fire-and-forget — нет персистентности.
        </p>
        <CodeHighlight lang="ts" code={`// Publisher (один инстанс):
const pub = redis.duplicate();  // отдельное соединение для publish
await pub.publish('notifications', JSON.stringify({
  type: 'order_shipped', orderId: 42, userId: 99,
}));

// Subscriber (другой инстанс):
const sub = redis.duplicate();  // subscribe блокирует соединение
await sub.subscribe('notifications', (message) => {
  const event = JSON.parse(message);
  console.log('Received:', event);  // { type: 'order_shipped', ... }
});

// ⚠ Ограничение: если subscriber offline — сообщение потеряно
// Для надёжной доставки используй Redis Streams:
// XADD stream * event order_shipped orderId 42
// XREAD BLOCK 0 STREAMS stream $`} />
        <div className={s.info}>
          <div className={s.infoLabel}>// Pub/Sub vs Streams</div>
          <p className={s.infoText}>
            Pub/Sub: live доставка, нет истории, нет ACK. Хорошо для уведомлений
            где потеря допустима. Redis Streams (XADD/XREAD): персистентный лог
            с consumer groups и ACK — аналог Kafka для небольших нагрузок.
            BullMQ строится поверх Streams и даёт retry, priority, concurrency.
          </p>
        </div>
      </section>

      {/* ── 10. Практика Node.js ────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Практика: Node.js + ioredis / node-redis</SectionTitle>
        <CodeHighlight lang="ts" code={`// npm install ioredis
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,  // обязательно в продакшне
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => console.error('Redis error:', err));

// ── Cache-Aside паттерн ───────────────────────────────────────
async function getUser(id) {
  const cacheKey = \`cache:user:\${id}\`;

  // 1. Проверить кеш
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — читаем из БД
  const user = await db.findById(id);
  if (!user) return null;

  // 3. Положить в кеш на 5 минут
  await redis.setex(cacheKey, 300, JSON.stringify(user));
  return user;
}

// Инвалидация при обновлении:
async function updateUser(id, data) {
  await db.update(id, data);
  await redis.del(\`cache:user:\${id}\`);  // сбросить кеш
}

// ── Pipeline — батчинг команд ─────────────────────────────────
// Вместо N round-trips — один
const pipeline = redis.pipeline();
pipeline.set('k1', 'v1');
pipeline.set('k2', 'v2');
pipeline.incr('counter');
const results = await pipeline.exec();
// [[null, 'OK'], [null, 'OK'], [null, 1]]`} />
      </section>

      {/* ── 11. Quiz ────────────────────────────────────────────────────────── */}
      <section className={s.section}>
        <SectionTitle>Проверь себя</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
