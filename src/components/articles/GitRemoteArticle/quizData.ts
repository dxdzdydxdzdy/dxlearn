import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'gr1',
    difficulty: 'easy',
    code: `git remote -v
# origin  https://github.com/user/repo.git (fetch)
# origin  https://github.com/user/repo.git (push)`,
    question: 'Что такое origin в этом выводе?',
    options: [
      'Имя главной ветки репозитория',
      'Имя remote по умолчанию — короткий псевдоним для URL репозитория на GitHub',
      'Имя пользователя который создал репозиторий',
      'Протокол передачи данных (HTTPS)',
    ],
    correct: 1,
    explanation:
      'origin — это просто имя (алиас) для URL удалённого репозитория. Git использует его по умолчанию при клонировании. Вместо "origin" можно написать "upstream", "github" или любое другое слово — это просто удобный способ не вводить полный URL каждый раз. Fetch и Push могут иметь разные URL (редко, но возможно).',
  },
  {
    id: 'gr2',
    difficulty: 'easy',
    code: `git clone https://github.com/user/repo.git`,
    question: 'Что происходит при git clone?',
    options: [
      'Только скачиваются файлы последнего коммита, без истории',
      'Скачиваются все коммиты и ветки, создаётся папка, настраивается remote origin и tracking branch',
      'Создаётся пустой репозиторий и нужно сделать git pull вручную',
      'Файлы копируются через FTP без использования Git',
    ],
    correct: 1,
    explanation:
      'git clone делает три вещи: (1) скачивает всю историю — все коммиты и ветки, (2) создаёт папку с рабочей директорией где лежат файлы последнего коммита, (3) настраивает remote "origin" с указанным URL и автоматически создаёт tracking branch — локальная main привязана к origin/main. После клонирования git push и git pull работают без дополнительных аргументов.',
  },
  {
    id: 'gr3',
    difficulty: 'easy',
    code: `git fetch`,
    question: 'Что делает git fetch?',
    options: [
      'Скачивает новые коммиты с remote и применяет их к текущей ветке',
      'Скачивает новые коммиты с remote в origin/main, но локальную ветку не трогает',
      'Отправляет локальные коммиты на remote',
      'Удаляет старые коммиты которых нет на remote',
    ],
    correct: 1,
    explanation:
      'git fetch скачивает новые коммиты и обновляет tracking branches (origin/main, origin/feature и т.д.), но не меняет локальные ветки и рабочую директорию. После fetch можно сделать git log HEAD..origin/main чтобы посмотреть что появилось, и осознанно решить когда делать merge. Это "безопасный" способ узнать о новых изменениях.',
  },
  {
    id: 'gr4',
    difficulty: 'easy',
    code: `git pull`,
    question: 'git pull — это сокращение для чего?',
    options: [
      'git clone + git merge',
      'git fetch + git merge origin/main',
      'git push + git fetch',
      'git status + git merge',
    ],
    correct: 1,
    explanation:
      'git pull = git fetch (скачать новые коммиты) + git merge origin/main (влить их в текущую ветку). Это удобно, но менее прозрачно — изменения применяются сразу без возможности осмотреть их заранее. С флагом --rebase вместо merge делается rebase: git pull --rebase = git fetch + git rebase origin/main.',
  },
  {
    id: 'gr5',
    difficulty: 'medium',
    code: `git branch -vv
# * main  b2c3d4 [origin/main: ahead 2] add feature`,
    question: 'Что означает "ahead 2"?',
    options: [
      'На remote есть 2 коммита которых нет локально — нужен git pull',
      'Локально есть 2 коммита которых нет на remote — нужен git push',
      'Ветка main на 2 версии новее чем когда была создана',
      'В последнем коммите изменено 2 файла',
    ],
    correct: 1,
    explanation:
      'ahead N значит: у тебя есть N коммитов которых ещё нет на remote. Нужно сделать git push. behind N — противоположное: на remote N коммитов которых нет у тебя, нужен git pull/fetch. "ahead 2, behind 1" — ветки разошлись: у тебя 2 новых коммита, на remote 1 новый. Нужен merge или rebase, возможны конфликты.',
  },
  {
    id: 'gr6',
    difficulty: 'medium',
    code: `git push -u origin feature/login`,
    question: 'Что делает флаг -u в этой команде?',
    options: [
      'Форс-пушит ветку, игнорируя конфликты',
      'Устанавливает upstream: привязывает локальную feature/login к origin/feature/login, чтобы git push и git pull работали без аргументов',
      'Создаёт ветку feature/login на remote если её там нет',
      'Шифрует данные при передаче',
    ],
    correct: 1,
    explanation:
      '-u (--set-upstream) делает две вещи: пушит ветку и устанавливает tracking. После git push -u origin feature/login можно писать просто git push и git pull — Git знает куда и откуда. Нужно делать только один раз для каждой новой ветки. Без -u при первом push Git попросит явно указать remote и ветку.',
  },
  {
    id: 'gr7',
    difficulty: 'medium',
    code: `# Локально: C0 → C1 → C2 (HEAD → main)
# Remote:   C0 → C1 → C3 (коллега запушил C3)

git push`,
    question: 'Что произойдёт при попытке git push?',
    options: [
      'Push выполнится успешно — Git объединит C2 и C3 автоматически',
      'Push завершится ошибкой "rejected" — remote ушёл вперёд, нужно сначала подтянуть изменения',
      'Git автоматически создаст merge-коммит на remote',
      'Push выполнится и C3 будет удалён с remote',
    ],
    correct: 1,
    explanation:
      'Git отклонит push с ошибкой "rejected, non-fast-forward". Это защита: remote имеет коммит C3 которого у тебя нет. Если Git позволит перезаписать — C3 потеряется. Решение: сначала git fetch, потом git merge origin/main (или git pull), разрешить конфликты если есть, и только потом git push.',
  },
  {
    id: 'gr8',
    difficulty: 'medium',
    code: `git push --force-with-lease`,
    question: 'Чем --force-with-lease лучше --force?',
    options: [
      'Он работает быстрее чем обычный force push',
      'Он проверяет что никто не запушил новые коммиты после тебя — если запушил, отклоняет операцию',
      'Он создаёт резервную копию перед перезаписью',
      'Он работает только на приватных репозиториях',
    ],
    correct: 1,
    explanation:
      '--force-with-lease проверяет твою локальную копию origin/main: если она совпадает с реальным состоянием remote — push разрешается. Если коллега успел запушить между твоим fetch и force push — remote ушёл вперёд, и --force-with-lease откажет. Обычный --force перезаписывает безусловно и может уничтожить чужую работу.',
  },
  {
    id: 'gr9',
    difficulty: 'medium',
    code: `# Что хранится в .git/refs/remotes/origin/main?`,
    question: 'Что такое origin/main на самом деле?',
    options: [
      'Прямое соединение с GitHub в реальном времени',
      'Локальный файл с хэшем — копия того где находился main на remote при последнем fetch/push/pull',
      'Синоним для main который указывает на тот же коммит',
      'Ветка которая существует только на GitHub и недоступна локально',
    ],
    correct: 1,
    explanation:
      'origin/main — это обычный файл .git/refs/remotes/origin/main с хэшем коммита. Git обновляет его при fetch, push и pull — записывает куда в этот момент указывал main на remote. Это локальная "фотография" состояния remote в момент последней синхронизации. Он устаревает как только коллеги пушат новые коммиты.',
  },
  {
    id: 'gr10',
    difficulty: 'hard',
    code: `git fetch origin
git log HEAD..origin/main --oneline
# c3d4e5 fix: security patch
# b2c3d4 feat: new dashboard`,
    question: 'Что показывает git log HEAD..origin/main?',
    options: [
      'Коммиты которые есть локально но которых нет на remote',
      'Коммиты которые есть на remote (origin/main) но которых нет в текущей локальной ветке',
      'Разницу в содержимом файлов между локальной веткой и remote',
      'Коммиты которые конфликтуют с local изменениями',
    ],
    correct: 1,
    explanation:
      'A..B читается как "коммиты достижимые из B, но не из A". HEAD..origin/main — коммиты которые есть в origin/main (remote), но которых нет в HEAD (локальная ветка). Это "что появилось на remote пока ты работал". Обратное — origin/main..HEAD — покажет коммиты которые у тебя есть, но которые ещё не запушены.',
  },
  {
    id: 'gr11',
    difficulty: 'hard',
    code: `git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/main`,
    question: 'Зачем добавлять второй remote с именем upstream?',
    options: [
      'Для создания резервной копии репозитория',
      'При работе с fork: upstream — оригинальный репозиторий, origin — твой fork. Так можно подтягивать обновления из оригинала',
      'Для деплоя на production-сервер',
      'upstream — обязательное имя для второго remote в GitHub',
    ],
    correct: 1,
    explanation:
      'Классический сценарий: ты сделал fork чужого репозитория. origin — твой fork на GitHub. upstream — оригинальный репозиторий. Чтобы подтянуть изменения из оригинала: git fetch upstream → git merge upstream/main. Имя "upstream" — не обязательное, это просто конвенция. Можно назвать как угодно.',
  },
  {
    id: 'gr12',
    difficulty: 'hard',
    code: `git push origin --delete feature/old-branch`,
    question: 'Что происходит с локальной веткой feature/old-branch после этой команды?',
    options: [
      'Удаляется и с remote, и локально',
      'Удаляется только с remote — локальная ветка остаётся нетронутой',
      'Git запросит подтверждение перед удалением',
      'Ветка переносится в архив на GitHub',
    ],
    correct: 1,
    explanation:
      'git push origin --delete удаляет ветку только на remote (GitHub). Локальная ветка feature/old-branch остаётся. Чтобы удалить её локально — отдельная команда: git branch -d feature/old-branch. После удаления ветки на remote у коллег останется устаревшая запись в их tracking branches — они очистятся после git fetch --prune.',
  },
  {
    id: 'gr13',
    difficulty: 'hard',
    code: `git pull --rebase`,
    question: 'Чем git pull --rebase отличается от обычного git pull?',
    options: [
      'Он отменяет последний коммит перед pull',
      'Вместо merge-коммита Git переставляет твои локальные коммиты поверх пришедших с remote — история остаётся линейной',
      'Он пропускает конфликты автоматически',
      'Он работает только если нет локальных изменений',
    ],
    correct: 1,
    explanation:
      'Обычный git pull делает merge: создаётся merge-коммит с двумя родителями. git pull --rebase делает rebase: твои локальные коммиты "снимаются" и переприкладываются поверх новых коммитов с remote. История получается линейной — как будто ты начал работать уже после того как коллега запушил своё. Популярно в командах которые хотят чистую историю без merge-коммитов.',
  },
];
