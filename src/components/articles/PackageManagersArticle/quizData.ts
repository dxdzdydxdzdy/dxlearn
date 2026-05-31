import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pm1',
    difficulty: 'easy',
    question: 'Зачем нужен package-lock.json?',
    options: [
      'Чтобы заблокировать обновление пакетов навсегда',
      'Фиксирует точные версии всего дерева зависимостей — чтобы npm install давал одинаковый результат на любой машине',
      'Это резервная копия package.json',
      'Содержит список пакетов которые нельзя устанавливать',
    ],
    correct: 1,
    explanation:
      'package.json хранит диапазоны версий вроде "^4.18.0" — это значит "4.18.0 и выше до 5.0.0". Конкретная установленная версия может отличаться. package-lock.json фиксирует точную версию (4.18.2) каждого пакета и все транзитивные зависимости. Это гарантирует что у всей команды и в CI будет одинаковая версия.',
  },
  {
    id: 'pm2',
    difficulty: 'easy',
    code: `{
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}`,
    question: 'Что будет установлено при npm install --production?',
    options: [
      'Только devDependencies — они нужны для разработки',
      'И dependencies, и devDependencies — они все нужны',
      'Только dependencies (express) — devDependencies пропускаются',
      'Ничего — --production запрещает установку пакетов',
    ],
    correct: 2,
    explanation:
      '--production (или NODE_ENV=production) устанавливает только dependencies — то что нужно для работы приложения. devDependencies (тесты, TypeScript, линтеры) в production не нужны и не устанавливаются. Это уменьшает размер и время деплоя.',
  },
  {
    id: 'pm3',
    difficulty: 'medium',
    code: `// В package.json:
"express": "^4.18.0"
"lodash":  "~4.17.0"
"react":   "4.18.0"`,
    question: 'Что означают префиксы ^ и ~?',
    options: [
      '^ = только patch-обновления, ~ = minor и patch',
      '^ = minor и patch-обновления (не трогает major), ~ = только patch-обновления',
      '^ и ~ — одно и то же, просто разный синтаксис',
      '^ = любая версия, ~ = точная версия',
    ],
    correct: 1,
    explanation:
      '^4.18.0 — "совместимые обновления": можно обновить до 4.19.0, 4.20.0, но не до 5.0.0 (major). ~4.17.0 — только patch: можно 4.17.1, 4.17.5, но не 4.18.0 (minor). "4.18.0" без префикса — строго эта версия. Semver (semantic versioning): major.minor.patch — breaking.features.bugfixes.',
  },
  {
    id: 'pm4',
    difficulty: 'medium',
    question: 'В чём главное техническое преимущество pnpm перед npm?',
    options: [
      'pnpm написан на Rust, поэтому быстрее',
      'pnpm хранит каждый пакет один раз в глобальном хранилище и делает symlinks — экономит гигабайты на диске',
      'pnpm не создаёт node_modules вообще',
      'pnpm автоматически обновляет пакеты до последних версий',
    ],
    correct: 1,
    explanation:
      'npm и yarn копируют каждый пакет в node_modules каждого проекта. Если 10 проектов используют react@18 — react копируется 10 раз. pnpm хранит пакеты в ~/.pnpm-store (content-addressable) — один раз для всей системы. В проекте создаются symlinks. Это экономит гигабайты и ускоряет установку повторно используемых пакетов до миллисекунд.',
  },
  {
    id: 'pm5',
    difficulty: 'hard',
    code: `// npm позволяет такое:
// package.json нашего проекта зависит от A
// A зависит от B
// B оказывается в node_modules/B

// Наш код:
import something from 'B'; // работает! Но не должно.`,
    question: 'Как называется эта проблема и почему это опасно?',
    options: [
      'Circular dependency — циклические зависимости ломают сборку',
      'Phantom dependency — пакет доступен без явного указания в своём package.json, и может пропасть при обновлении A',
      'Dependency hell — конфликт версий между пакетами',
      'Hoisting — npm специально поднимает зависимости для оптимизации',
    ],
    correct: 1,
    explanation:
      'Phantom (призрачная) зависимость: npm/yarn поднимают (hoist) вложенные зависимости в корневой node_modules для дедупликации. B оказывается доступен коду напрямую, хотя не указан в package.json. Опасность: если A обновится и перестанет зависеть от B — B исчезнет из node_modules и код сломается без видимой причины. pnpm решает это структурой symlinks — доступны только явно объявленные зависимости.',
  },
];
