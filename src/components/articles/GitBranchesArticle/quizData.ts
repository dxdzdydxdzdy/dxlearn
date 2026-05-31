import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'gb1',
    difficulty: 'easy',
    code: `cat .git/refs/heads/main
# a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0`,
    question: 'Что хранится в файле ветки внутри .git?',
    options: [
      'Все файлы проекта в этой ветке — это копия рабочей директории',
      'Список коммитов которые были сделаны в этой ветке',
      'Хэш одного коммита — на который ветка указывает прямо сейчас',
      'Разница между этой веткой и main',
    ],
    correct: 2,
    explanation:
      'Ветка в Git — это просто файл с одним SHA-1 хэшем (40 символов). Этот хэш указывает на последний коммит ветки. Никаких копий файлов, никаких списков — только один хэш. Именно поэтому создание ветки мгновенно вне зависимости от размера проекта.',
  },
  {
    id: 'gb2',
    difficulty: 'easy',
    code: `git switch -c feature/payment`,
    question: 'Что делает флаг -c в этой команде?',
    options: [
      'Создаёт ветку и сразу переключается на неё',
      'Копирует текущие файлы в новую ветку',
      'Делает ветку защищённой от удаления',
      'Создаёт ветку без переключения',
    ],
    correct: 0,
    explanation:
      'git switch -c (или --create) создаёт ветку и немедленно переключается на неё. Это сокращение для двух команд: git branch feature/payment && git switch feature/payment. Эквивалентный старый способ: git checkout -b feature/payment.',
  },
  {
    id: 'gb3',
    difficulty: 'easy',
    code: `git log --oneline --graph --all
# * c3d4e5 (HEAD -> feature) add validation
# * b2c3d4 add login form
# * a1b2c3 (main) initial commit`,
    question: 'Что показывает этот граф?',
    options: [
      'Ветка feature конфликтует с main и требует разрешения',
      'feature ушла вперёд на 2 коммита от main, HEAD на feature',
      'main и feature указывают на один коммит — они синхронны',
      'feature была удалена после слияния с main',
    ],
    correct: 1,
    explanation:
      'Граф читается снизу вверх: общий предок — initial commit (main). От него feature добавила два коммита — add login form и add validation. HEAD сейчас на feature. main осталась на initial commit. Звёздочки * — коммиты, стрелки — родители.',
  },
  {
    id: 'gb4',
    difficulty: 'medium',
    code: `# main: C0 - C1
# feature (от C0): C0 - C2

git switch main
git merge feature`,
    question: 'Какой тип merge произойдёт и почему?',
    options: [
      'Fast-forward, потому что feature линейно продолжает main',
      '3-way merge с merge-коммитом, потому что обе ветки добавили коммиты от C0',
      'Merge невозможен — нужно сначала сделать rebase',
      'Fast-forward, потому что feature создана позже main',
    ],
    correct: 1,
    explanation:
      'Это 3-way merge: main имеет C0→C1, feature имеет C0→C2. Обе ветки добавили коммиты от общего предка C0. Git не может просто "сдвинуть" указатель — нужен merge-коммит M с двумя родителями (C1 и C2). Fast-forward возможен только если main не уходила вперёд после расхождения.',
  },
  {
    id: 'gb5',
    difficulty: 'medium',
    code: `# main: C0 - C1 - C2
# feature (от C0): C0 - C3 - C4

git switch main
git merge feature`,
    question: 'Fast-forward возможен здесь?',
    options: [
      'Да — Git всегда выбирает fast-forward если ветки не конфликтуют',
      'Нет — fast-forward невозможен когда main добавила свои коммиты (C1, C2) после расхождения',
      'Да — если в файлах нет конфликтов, Git делает fast-forward',
      'Зависит от количества коммитов: если их поровну — fast-forward, иначе 3-way',
    ],
    correct: 1,
    explanation:
      'Fast-forward возможен только если HEAD (main) является предком сливаемой ветки — то есть если main не добавляла своих коммитов после расхождения. Здесь main добавила C1 и C2, значит ветки расходились, и Git создаст merge-коммит M с родителями C2 (из main) и C4 (из feature).',
  },
  {
    id: 'gb6',
    difficulty: 'medium',
    code: `<<<<<<< HEAD
  return users.find(u => u.id === id) || null;
=======
  const user = await db.getUser(id);
  return user ?? null;
>>>>>>> feature/db-refactor`,
    question: 'Что означают эти маркеры в файле?',
    options: [
      'Файл повреждён — нужно восстановить из резервной копии',
      'Git показывает два варианта строки: до маркера === — наш (HEAD), после — их (feature)',
      'Git автоматически выбрал лучший вариант и показывает оба для подтверждения',
      'Это синтаксис условного кода — оба варианта будут выполняться',
    ],
    correct: 1,
    explanation:
      'Маркеры конфликта — это Git говорит "я не знаю какой вариант правильный, выбери сам". Между <<<<<<< HEAD и ======= — наш код (текущая ветка). Между ======= и >>>>>>> feature/db-refactor — их код (сливаемая ветка). Нужно выбрать один вариант (или написать третий), удалить все маркеры, потом git add + git commit.',
  },
  {
    id: 'gb7',
    difficulty: 'medium',
    code: `git merge --abort`,
    question: 'Когда и зачем использовать эту команду?',
    options: [
      'Когда merge завершился успешно и нужно его откатить',
      'Когда merge не начался — для очистки staging area',
      'Во время незавершённого merge (есть неразрешённые конфликты) — чтобы отменить и вернуть всё как было',
      'Чтобы удалить merge-коммит после того как он уже попал в историю',
    ],
    correct: 2,
    explanation:
      'git merge --abort работает только когда merge ещё не завершён — то есть есть файлы с конфликтными маркерами. Команда отменяет всю операцию merge и возвращает рабочую директорию и staging area в состояние до попытки слияния. Если merge уже закоммичен, нужен git revert.',
  },
  {
    id: 'gb8',
    difficulty: 'medium',
    code: `git branch -d feature/done
# error: The branch 'feature/done' is not fully merged.`,
    question: 'Почему Git выдаёт эту ошибку и как её решить?',
    options: [
      'Ветка защищена — нужно снять защиту в настройках репозитория',
      'Git не даёт удалить ветку у которой есть коммиты которых нет в текущей ветке — используй -D для принудительного удаления',
      'Ветка недавно создана — нужно подождать 24 часа',
      'Нужно сначала git push origin --delete feature/done',
    ],
    correct: 1,
    explanation:
      'git branch -d безопасно удаляет ветку только если все её коммиты уже есть в текущей ветке (слиты). Git защищает от случайной потери работы. Если ты уверен что хочешь удалить ветку с несмёрженными коммитами — используй git branch -D (force delete). Но будь осторожен: потеряешь эти коммиты.',
  },
  {
    id: 'gb9',
    difficulty: 'medium',
    code: `git merge --no-ff feature`,
    question: 'Зачем использовать --no-ff при merge?',
    options: [
      'Чтобы принудительно создать merge-коммит даже когда возможен fast-forward',
      'Чтобы ускорить merge за счёт пропуска проверки конфликтов',
      'Чтобы merge выполнился без создания коммита',
      'Чтобы сохранить файлы обеих веток без слияния',
    ],
    correct: 0,
    explanation:
      '--no-ff (no fast-forward) заставляет Git всегда создавать merge-коммит. Это популярно в командах: история явно показывает в какой момент какая фича была слита. Без --no-ff fast-forward merge выглядит как будто коммиты сделаны прямо в main — теряется информация о том что это была отдельная задача.',
  },
  {
    id: 'gb10',
    difficulty: 'hard',
    code: `git switch feature
git rebase main`,
    question: 'Что происходит с коммитами ветки feature при rebase?',
    options: [
      'Коммиты feature перемещаются поверх main, получают новые хэши',
      'Коммиты feature сливаются с коммитами main в один merge-коммит',
      'Ничего не происходит с коммитами — просто обновляется указатель',
      'Коммиты main добавляются в историю feature с сохранением исходных хэшей',
    ],
    correct: 0,
    explanation:
      'git rebase main берёт коммиты ветки feature, "снимает" их с текущего места и "переприкладывает" поверх последнего коммита main. Git создаёт новые коммиты с теми же изменениями но другими хэшами (потому что у них другой родитель). История становится линейной. Важно: никогда не делай rebase веток которые уже опубликованы (push) — это изменит хэши и сломает историю у коллег.',
  },
  {
    id: 'gb11',
    difficulty: 'hard',
    code: `# Что выведет git log?
git switch -c feature
git commit -m "C1"
git commit -m "C2"
git switch main
git merge --no-ff feature
git log --oneline`,
    question: 'Сколько коммитов покажет git log --oneline и что это будет?',
    options: [
      '2 коммита: C1 и C2',
      '3 коммита: C1, C2 и merge-коммит "Merge branch feature"',
      '4 коммита: initial commit, C1, C2, merge-коммит',
      '2 коммита: merge-коммит поглощает C1 и C2',
    ],
    correct: 2,
    explanation:
      'git log --oneline от HEAD покажет (от новых к старым): merge-коммит "Merge branch feature", C2, C1, и initial commit (который был до создания feature). Итого 4. Флаг --no-ff гарантирует что merge-коммит создался. Без --no-ff был бы fast-forward и merge-коммита не было бы — показало бы 3 коммита.',
  },
  {
    id: 'gb12',
    difficulty: 'hard',
    code: `# В каком случае конфликт ГАРАНТИРОВАННО возникнет при merge?`,
    question: 'Когда Git не может разрешить конфликт автоматически?',
    options: [
      'Когда обе ветки изменили одни и те же строки в одном файле по-разному',
      'Когда в файле больше 100 строк',
      'Когда ветки созданы из разных базовых коммитов',
      'Когда merge выполняется без --no-ff',
    ],
    correct: 0,
    explanation:
      'Конфликт возникает когда обе ветки изменили одни и те же строки в одном файле по-разному — Git не знает какой вариант правильный. Если каждая ветка изменяла разные строки или разные файлы — Git соединяет изменения автоматически без конфликтов. Конфликтов НЕТ если только одна ветка изменила строку (вторая не трогала её совсем).',
  },
  {
    id: 'gb13',
    difficulty: 'hard',
    code: `git switch feature
git merge main`,
    question: 'Зачем мержить main в feature (а не наоборот)?',
    options: [
      'Это ошибка — мержить нужно только в одном направлении',
      'Чтобы обновить feature свежими коммитами из main и разрешить конфликты до финального merge в main',
      'Это делает merge-коммит в main автоматически',
      'Чтобы удалить старые коммиты из main',
    ],
    correct: 1,
    explanation:
      'Стандартная практика: пока работаешь на feature, periodically мержи main в feature. Это держит ветку актуальной и позволяет разрешать конфликты маленькими порциями прямо на feature — до того как делать финальный PR в main. Иначе все накопившиеся конфликты придётся разрешать одновременно и это тяжелее.',
  },
  {
    id: 'gb14',
    difficulty: 'hard',
    code: `git log --oneline --graph --all
# *   abc123 (HEAD -> main) Merge branch 'feature'
# |\\
# | * def456 (feature) add payment
# | * ghi789 add cart
# |/
# * jkl012 initial commit`,
    question: 'Как выглядит история после git branch -d feature?',
    options: [
      'Коммиты def456 и ghi789 удаляются из истории вместе с веткой',
      'История не меняется — удаляется только ярлык ветки feature, коммиты остаются',
      'Git выдаст ошибку — нельзя удалить влитую ветку',
      'Граф выпрямляется: коммиты feature встраиваются в main',
    ],
    correct: 1,
    explanation:
      'git branch -d удаляет только указатель (ярлык) feature — файл .git/refs/heads/feature. Сами коммиты def456 и ghi789 остаются в базе объектов Git и видны в git log через merge-коммит abc123. История сохраняется полностью. Именно поэтому смело удаляй ветки после слияния — данные не теряются.',
  },
];
