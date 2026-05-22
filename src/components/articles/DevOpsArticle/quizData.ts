import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'devops-1',
    difficulty: 'easy',
    code: '',
    question: 'Команда на сервере выполняется слишком долго. Что проверишь первым?',
    options: [
      'Перезапущу сервер — поможет',
      'top/htop → CPU, Memory; iostat → диск; ss → сетевые соединения',
      'Сразу залезу в логи приложения',
      'Спрошу разработчика, что изменили',
    ],
    correct: 1,
    explanation: 'Сначала смотрим ресурсы системы: нагрузка CPU, память, I/O, сеть. top/htop → iostat → ss — стандартная последовательность диагностики. Логи — второй шаг, после понимания, какой ресурс исчерпан.',
  },
  {
    id: 'devops-2',
    difficulty: 'medium',
    code: '',
    question: 'Что такое GitOps?',
    options: [
      'CI/CD без сервера сборки',
      'Git-репозиторий как единый источник истины; оператор синхронизирует кластер с Git',
      'Стратегия ветвления для DevOps-команд',
      'Хранение Docker-образов в Git LFS',
    ],
    correct: 1,
    explanation: 'GitOps: желаемое состояние инфраструктуры описано в Git. Инструмент (ArgoCD, Flux) непрерывно сравнивает реальное состояние кластера с Git и исправляет расхождение (drift). Откат = revert коммита.',
  },
  {
    id: 'devops-3',
    difficulty: 'easy',
    code: '',
    question: 'Pod в K8s завис в статусе CrashLoopBackOff. Первый шаг?',
    options: [
      'Удалить и пересоздать pod',
      'kubectl logs <pod> --previous',
      'Проверить метрики CPU в Grafana',
      'Сделать kubectl delete namespace',
    ],
    correct: 1,
    explanation: 'CrashLoopBackOff = контейнер запускается и сразу падает. Флаг --previous даёт логи предыдущего (упавшего) запуска. Обычно там видно: OOM, ошибка конфига, missing env variable.',
  },
  {
    id: 'devops-4',
    difficulty: 'medium',
    code: '',
    question: 'Зачем хранить Terraform state в remote backend (S3, GCS), а не локально?',
    options: [
      'Локальный state работает только на Linux',
      'Remote state позволяет совместной работе, поддерживает locking и не потеряется при потере ноутбука',
      'Terraform без remote backend работает медленнее',
      'S3 автоматически шифрует Terraform-модули',
    ],
    correct: 1,
    explanation: 'Три причины: (1) совместная работа — один state на команду; (2) locking — нельзя одновременно запустить двух apply; (3) надёжность — state содержит sensitive данные, нельзя терять. S3 + DynamoDB lock — классика.',
  },
  {
    id: 'devops-5',
    difficulty: 'hard',
    code: '',
    question: 'Что такое SLO error budget?',
    options: [
      'Бюджет на оплату облачных ресурсов',
      'Максимально допустимая сумма ошибок в мониторинге',
      'Допустимый процент недоступности до конца периода; при исчерпании — стоп новым фичам',
      'Количество инцидентов, разрешённых командой за месяц',
    ],
    correct: 2,
    explanation: 'SLO 99.9% = error budget 0.1% ≈ 43 минуты недоступности в месяц. Пока бюджет есть — можно катить изменения. Бюджет кончился — freeze фич, только reliability работа. Это создаёт здоровый баланс между скоростью и надёжностью.',
  },
];
