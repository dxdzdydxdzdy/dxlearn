import type { QuizQuestion } from '@/components/ui/QuizBlock/QuizBlock';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'devops-1',
    difficulty: 'easy',
    code: '',
    question: 'Из-за чего вообще возник DevOps как движение?',
    options: [
      'Docker и Kubernetes потребовали новой специализации',
      'Разработчики хотели деплоить быстро, ops — стабильности; нужно было сломать эту стену',
      'Agile-команды устали писать документацию для ops',
      'Облачные провайдеры начали предлагать managed-сервисы',
    ],
    correct: 1,
    explanation: 'DevOps вырос из конфликта: Dev хочет деплоить как можно чаще, Ops хочет не трогать то, что работает. Решение — общая ответственность и автоматизация, а не передача задач через забор.',
  },
  {
    id: 'devops-2',
    difficulty: 'easy',
    code: '',
    question: 'Чем Platform Engineer отличается от SRE?',
    options: [
      'SRE работает с K8s, Platform Engineer — с Terraform',
      'Platform Engineer строит инструменты для разработчиков; SRE отвечает за надёжность через SLO и on-call',
      'SRE — это старое название Platform Engineer',
      'Platform Engineer пишет код, SRE только мониторит',
    ],
    correct: 1,
    explanation: 'Platform Engineer строит внутреннюю платформу — CI/CD, кластеры, developer portal. Разработчики его клиенты. SRE (Site Reliability Engineering) — это практика Google: инженеры пишут код для решения ops-задач, держат SLO и дежурят по on-call.',
  },
  {
    id: 'devops-3',
    difficulty: 'medium',
    code: '',
    question: 'Когда компания Weaveworks ввела термин GitOps?',
    options: [
      '2013 — одновременно с первым релизом Docker',
      '2014 — когда Google открыл Kubernetes',
      '2017 — GitOps описывал подход к деплою через Git как источник истины',
      '2021 — как часть тренда Platform Engineering от Gartner',
    ],
    correct: 2,
    explanation: 'GitOps появился в 2017 году от Weaveworks. Суть: Git — единственный источник истины для инфраструктуры. Оператор (ArgoCD, Flux) непрерывно сверяет кластер с репозиторием и исправляет расхождения.',
  },
  {
    id: 'devops-4',
    difficulty: 'medium',
    code: '',
    question: 'Почему в 2026 году в России вырос спрос на DevSecOps?',
    options: [
      'Вступил в силу ФСТЭК №117 — обязательная сертификация для ГосИС',
      'Log4Shell показал уязвимость всех K8s-кластеров в РФ',
      'Крупные банки перешли на open-source стек и ужесточили требования',
      'Минцифры обязало все компании внедрить Vault и Trivy',
    ],
    correct: 0,
    explanation: 'ФСТЭК №117 вступил в силу в марте 2026 и ввёл обязательную DevSecOps-сертификацию для государственных информационных систем. Спрос на специалистов с навыками Vault, OPA, Falco и SBOM вырос в 3× за год.',
  },
  {
    id: 'devops-5',
    difficulty: 'hard',
    code: '',
    question: 'Зачем нужен error budget и что происходит, когда он заканчивается?',
    options: [
      'Это финансовый лимит на облачные расходы; при исчерпании — урезается бюджет команды',
      'Счётчик ошибок в логах; при превышении — алерт уходит в PagerDuty',
      'Допустимая доля недоступности по SLO; при исчерпании — стоп новым фичам, только reliability-работа',
      'Лимит инцидентов P1 в квартал; при превышении — команда уходит в post-mortem режим',
    ],
    correct: 2,
    explanation: 'SLO 99.9% = error budget 0.1% ≈ 43 минуты недоступности в месяц. Пока бюджет есть — деплой идёт. Кончился — freeze новых фич, команда фокусируется только на надёжности. Это честный баланс между скоростью и стабильностью.',
  },
];
