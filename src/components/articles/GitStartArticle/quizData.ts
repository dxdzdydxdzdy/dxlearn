import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'gs1',
    difficulty: 'easy',
    question: 'Ты создал новый файл app.js. Что нужно сделать чтобы Git начал его отслеживать?',
    options: [
      'Ничего — Git автоматически замечает новые файлы',
      'git commit app.js',
      'git add app.js — добавить в staging area, потом git commit',
      'git track app.js',
    ],
    correct: 2,
    explanation:
      'Новый файл находится в рабочей директории, но Git его не отслеживает — он "untracked". git add переводит файл в staging area (индекс). После git commit — файл фиксируется в репозитории и становится частью истории. Без git add файл в коммит не попадёт.',
  },
  {
    id: 'gs2',
    difficulty: 'easy',
    code: `git add .`,
    question: 'Что делает точка в команде git add .?',
    options: [
      'Добавляет только файлы с расширением .js',
      'Добавляет все изменённые и новые файлы из текущей папки и вложенных',
      'Добавляет только файлы в корневой папке проекта',
      'Создаёт скрытый файл конфигурации',
    ],
    correct: 1,
    explanation:
      'Точка означает "текущая директория" — git add . добавляет в staging все изменённые, новые и удалённые файлы из текущей папки и всех вложенных. Это удобно, но иногда опасно — можно случайно добавить лишнее. Для контроля используй git add <конкретный файл> или git add -p для просмотра изменений по кускам.',
  },
  {
    id: 'gs3',
    difficulty: 'medium',
    code: `git add index.js
git commit -m "fix: исправил баг"
# Потом заметил что забыл добавить style.css`,
    question: 'Как добавить забытый файл к уже сделанному коммиту?',
    options: [
      'Никак — коммит нельзя изменить',
      'git add style.css && git commit --amend --no-edit',
      'git add style.css && git commit -m "fix: добавил style.css"',
      'git uncommit && git add style.css && git commit',
    ],
    correct: 1,
    explanation:
      'git commit --amend изменяет последний коммит — добавляет к нему то что сейчас в staging. --no-edit сохраняет старое сообщение коммита. Важно: --amend переписывает историю — если коммит уже был запушен на GitHub, это создаст проблемы для команды. Используй только для локальных (ещё не запушенных) коммитов.',
  },
  {
    id: 'gs4',
    difficulty: 'medium',
    code: `# .gitignore:
node_modules/
*.log
.env
dist/`,
    question: 'Файл .env уже попал в репозиторий до того как ты добавил его в .gitignore. Что произойдёт?',
    options: [
      '.gitignore автоматически удалит его из репозитория',
      'Git продолжит отслеживать .env — .gitignore не действует на уже отслеживаемые файлы',
      'Git выдаст ошибку при следующем git add',
      'Файл станет невидимым в репозитории автоматически',
    ],
    correct: 1,
    explanation:
      '.gitignore игнорирует только файлы которые Git ещё не отслеживает. Если файл уже в репозитории — .gitignore его не трогает. Решение: git rm --cached .env (убирает из отслеживания, но оставляет файл на диске), потом коммит. После этого .gitignore будет работать.',
  },
  {
    id: 'gs5',
    difficulty: 'hard',
    code: `git add style.css
# Потом передумал — не хочу включать style.css в коммит`,
    question: 'Как убрать файл из staging area не удаляя изменения в нём?',
    options: [
      'git delete style.css',
      'git reset style.css — убирает из staging, изменения в файле сохраняются',
      'git restore style.css — убирает изменения и из staging и из файла',
      'git remove --staged style.css',
    ],
    correct: 1,
    explanation:
      'git reset <file> (или git restore --staged <file> в новых версиях) убирает файл из staging area, но не трогает сам файл — изменения в нём сохраняются. А вот git restore <file> без --staged — опасная команда: она отменяет изменения в файле, возвращая его к последнему коммиту. Это необратимо.',
  },
];
