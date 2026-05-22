'use client';

import { useState } from 'react';
import s from './DevOpsDomainExplorer.module.scss';

type Level = 'junior' | 'middle' | 'senior';

interface Skill { text: string; note?: string; }
interface InterviewQ { q: string; hint: string; level: Level; }

interface Domain {
  id: string;
  icon: string;
  name: string;
  color: string;
  tagline: string;
  tools: string[];
  skills: Record<Level, Skill[]>;
  questions: InterviewQ[];
}

const DOMAINS: Domain[] = [
  {
    id: 'linux', icon: '🐧', name: 'Linux & Сети', color: '#00e5a0',
    tagline: 'Фундамент всего. Без этого — никуда.',
    tools: ['bash', 'systemd', 'iptables/nftables', 'ss/netstat', 'tcpdump', 'strace', 'lsof', 'nginx'],
    skills: {
      junior: [
        { text: 'Права доступа: chmod, chown, ACL', note: 'Знать rwxr-xr-x наизусть' },
        { text: 'Процессы: ps, top, htop, kill, signals' },
        { text: 'Файловая система: inode, жёсткие и символические ссылки' },
        { text: 'Сети: TCP/IP модель, DNS, HTTP, порты' },
        { text: 'ssh, scp, rsync — базовое использование' },
      ],
      middle: [
        { text: 'systemd: юниты, journald, зависимости сервисов' },
        { text: 'Диагностика сети: tcpdump, ss, трассировка маршрутов' },
        { text: 'iptables/nftables: написать базовые правила' },
        { text: 'Производительность: vmstat, iostat, sar, perf' },
        { text: 'Расшифровать tcpdump дамп и найти проблему', note: 'Частый вопрос на собеседовании' },
      ],
      senior: [
        { text: 'eBPF: принцип работы, Cilium, bpftrace' },
        { text: 'Kernel tuning: sysctl, cgroups v2, namespaces' },
        { text: 'TLS: handshake, сертификаты, OCSP, mTLS' },
        { text: 'BGP/OSPF базовый уровень для облачных сетей' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Сервис не отвечает. Что делаешь первым делом?', hint: 'Гипотеза → logs → процесс → сеть → ресурсы. Не перезапускать сразу.' },
      { level: 'middle', q: 'Как найти, какой процесс держит порт 8080?', hint: 'ss -tlnp или lsof -i :8080' },
      { level: 'middle', q: 'Объясни разницу между CLOSE_WAIT и TIME_WAIT в TCP.', hint: 'CLOSE_WAIT = сервер не закрыл соединение (баг в коде). TIME_WAIT = нормальное состояние после закрытия.' },
      { level: 'senior', q: 'Как работает conntrack и почему он может вызвать проблемы в K8s?', hint: 'Таблица NAT, conntrack overflow, --net=host.' },
    ],
  },
  {
    id: 'cicd', icon: '🔄', name: 'CI/CD & GitOps', color: '#4e9eff',
    tagline: 'Код попадает в прод быстро и безопасно.',
    tools: ['GitLab CI', 'GitHub Actions', 'ArgoCD', 'Flux', 'Jenkins', 'Tekton', 'Helm'],
    skills: {
      junior: [
        { text: 'Git flow: ветки, merge/rebase, конфликты' },
        { text: 'Написать простой пайплайн: build → test → push image' },
        { text: 'Артефакты, кэш в CI, переменные среды' },
        { text: 'Docker registry: push/pull образов' },
      ],
      middle: [
        { text: 'GitOps: ArgoCD или Flux, понятие drift и reconciliation' },
        { text: 'Стратегии деплоя: blue-green, canary, rolling update' },
        { text: 'Секреты в CI: sealed secrets, vault agent' },
        { text: 'Матричные пайплайны, параллельные jobs' },
        { text: 'Реализовать rollback стратегию', note: 'Часто спрашивают' },
      ],
      senior: [
        { text: 'Platform engineering: внутренний developer portal' },
        { text: 'Policy as code: OPA/Gatekeeper в пайплайне' },
        { text: 'Release engineering: changelog automation, semantic versioning' },
        { text: 'Multi-cluster GitOps: sync стратегии' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Чем отличается CI от CD?', hint: 'CI = автоматическое слияние и тест. CD = автоматическая доставка (Delivery или Deployment).' },
      { level: 'middle', q: 'Что такое GitOps drift и как ArgoCD с ним справляется?', hint: 'Drift = расхождение между Git и кластером. ArgoCD постоянно сравнивает, при расхождении — alert или auto-sync.' },
      { level: 'middle', q: 'Как организовать безопасное хранение секретов в GitLab CI?', hint: 'CI Variables (masked/protected) + Vault integration. Никогда не в репозитории.' },
      { level: 'senior', q: 'Как реализовать canary deployment на 5% трафика в K8s?', hint: 'Argo Rollouts, Flagger + service mesh, или ручной split через Ingress аннотации.' },
    ],
  },
  {
    id: 'k8s', icon: '☸️', name: 'Containers & K8s', color: '#f0c040',
    tagline: 'Оркестрация стала базовым ожиданием.',
    tools: ['Docker', 'containerd', 'Kubernetes', 'Helm', 'Kustomize', 'Cilium', 'Istio', 'cert-manager'],
    skills: {
      junior: [
        { text: 'Docker: build, run, layers, multistage builds' },
        { text: 'Pod, Deployment, Service, ConfigMap, Secret' },
        { text: 'kubectl: get, describe, logs, exec, port-forward' },
        { text: 'Ingress: настроить роутинг к сервисам' },
        { text: 'Liveness / readiness / startup probes' },
      ],
      middle: [
        { text: 'RBAC: Role, ClusterRole, ServiceAccount' },
        { text: 'Troubleshooting: читать Events, понимать Pending/CrashLoopBackOff' },
        { text: 'ResourceQuota, LimitRange, HPA, VPA' },
        { text: 'Helm: написать и опубликовать chart' },
        { text: 'PersistentVolume, StorageClass, dynamic provisioning' },
      ],
      senior: [
        { text: 'CNI internals: как работают сетевые плагины' },
        { text: 'Service mesh: Istio/Linkerd, mTLS между сервисами' },
        { text: 'Custom controllers, operators (controller-runtime)' },
        { text: 'Kubernetes scheduler: affinity, taints, topology spread' },
        { text: 'etcd: backup, restore, performance tuning' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Pod завис в статусе Pending. Что проверяешь?', hint: 'kubectl describe pod → Events: нет ресурсов, нет nodes с нужными labels, PVC не bound.' },
      { level: 'middle', q: 'Объясни разницу между Deployment и StatefulSet.', hint: 'StatefulSet: стабильные имена podов, порядок создания/удаления, стабильный storage. Для БД, Kafka, ZooKeeper.' },
      { level: 'middle', q: 'Как K8s решает, на какую ноду поставить pod?', hint: 'kube-scheduler: filtering (predicates) + scoring (priorities). nodeSelector, affinity, taints/tolerations.' },
      { level: 'senior', q: 'Как работает кNAT в kube-proxy (iptables mode)?', hint: 'DNAT через iptables chain KUBE-SERVICES → KUBE-SVC-xxx → KUBE-SEP-xxx. ClusterIP = виртуальный IP.' },
    ],
  },
  {
    id: 'cloud', icon: '☁️', name: 'Cloud & IaC', color: '#b48eff',
    tagline: 'Инфраструктура как код — не опция, а норма.',
    tools: ['Terraform', 'OpenTofu', 'Ansible', 'Yandex Cloud', 'AWS/GCP', 'Packer', 'Crossplane'],
    skills: {
      junior: [
        { text: 'Terraform: resource, variable, output, state' },
        { text: 'Основные облачные сущности: VM, VPC, subnet, SG' },
        { text: 'S3-совместимое хранилище: bucket, lifecycle, ACL' },
        { text: 'Ansible: inventory, playbook, роли' },
      ],
      middle: [
        { text: 'Terraform modules: написать переиспользуемый модуль' },
        { text: 'Remote state, state locking, workspaces' },
        { text: 'Managed K8s: YKE/EKS/GKE — создание и управление' },
        { text: 'Load balancer, CDN, DNS в облаке' },
        { text: 'Terraform vs OpenTofu: осознанный выбор', note: 'Вопрос стал рабочим' },
      ],
      senior: [
        { text: 'Landing zone / multi-account стратегия' },
        { text: 'FinOps: cost allocation, reserved instances, spot' },
        { text: 'Crossplane: K8s-native IaC' },
        { text: 'Policy as code: Sentinel, OPA Terraform policies' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Что такое terraform state и почему его нельзя хранить в git?', hint: 'State содержит секреты (пароли БД), sensitive данные. Remote state с locking (S3 + DynamoDB).' },
      { level: 'middle', q: 'Как организовать несколько окружений (dev/stage/prod) в Terraform?', hint: 'Workspaces (просто) или отдельные state per env (надёжнее). Переменные через .tfvars.' },
      { level: 'middle', q: 'Terraform или OpenTofu — что выбираешь и почему?', hint: 'OpenTofu: open-source форк, BSL vs MPL лицензия. Практически совместимы. Осознанный ответ важнее правильного.' },
      { level: 'senior', q: 'Как управлять drift между Terraform state и реальной инфраструктурой?', hint: 'terraform plan в CI, drift detection через scheduled run, import для существующих ресурсов.' },
    ],
  },
  {
    id: 'obs', icon: '📊', name: 'Observability', color: '#ff7b72',
    tagline: 'Видеть систему изнутри — без этого нет надёжности.',
    tools: ['Prometheus', 'Grafana', 'Loki', 'Tempo', 'OpenTelemetry', 'AlertManager', 'VictoriaMetrics'],
    skills: {
      junior: [
        { text: 'Prometheus: метрики, labels, PromQL базовый' },
        { text: 'Grafana: дашборды из готовых источников' },
        { text: 'Loki: сбор логов, LogQL' },
        { text: 'Алерты в AlertManager: routes, receivers' },
      ],
      middle: [
        { text: 'PromQL: rate(), irate(), histogram_quantile(), записывающие правила' },
        { text: 'SLO/SLI/SLA: написать SLO для сервиса' },
        { text: 'Error budget: что делать при его исчерпании' },
        { text: 'OpenTelemetry: инструментация приложений, traces' },
        { text: 'Постмортем: написать по реальному инциденту', note: 'Middle без постмортема — тревожный сигнал' },
      ],
      senior: [
        { text: 'Cardinality: управление высокой кардинальностью меток' },
        { text: 'VictoriaMetrics / Thanos: long-term storage' },
        { text: 'DORA metrics: deployment frequency, MTTR, change failure rate' },
        { text: 'Chaos engineering: Chaos Monkey, litmus chaos' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Чем отличаются метрики, логи и трейсы?', hint: 'Метрики = числа во времени (что). Логи = события (что произошло). Трейсы = путь запроса через сервисы (где тормоз).' },
      { level: 'middle', q: 'Напиши PromQL запрос: 95-й перцентиль latency за 5 минут.', hint: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))' },
      { level: 'middle', q: 'Что такое error budget и что делать, когда он заканчивается?', hint: 'Error budget = 1 - SLO. Кончился → freeze новых фич, только reliability work.' },
      { level: 'senior', q: 'Расскажи про реальный инцидент: как обнаружили, как диагностировали, что изменили.', hint: 'Структура: обнаружение → влияние → корневая причина → resolution → retrospective.' },
    ],
  },
  {
    id: 'sec', icon: '🔐', name: 'DevSecOps', color: '#ff5f6a',
    tagline: 'ФСТЭК №117 создал устойчивый спрос с марта 2026.',
    tools: ['Vault', 'Trivy', 'Grype', 'Falco', 'OPA', 'cert-manager', 'Cosign', 'Syft'],
    skills: {
      junior: [
        { text: 'Не хранить секреты в Dockerfile и ENV', note: 'Обязательный минимум' },
        { text: 'Сканирование образов: Trivy, понять вывод CVE' },
        { text: 'RBAC в K8s: принцип минимальных привилегий' },
        { text: 'Сетевые политики NetworkPolicy в K8s' },
      ],
      middle: [
        { text: 'HashiCorp Vault: динамические секреты, auth methods' },
        { text: 'SAST/DAST в пайплайне: интеграция инструментов' },
        { text: 'Falco: runtime security, написать rules' },
        { text: 'mTLS между сервисами: cert-manager, service mesh' },
        { text: 'Подписание образов: Cosign, Sigstore', note: 'Supply chain security' },
      ],
      senior: [
        { text: 'SBOM: генерация (Syft), хранение, использование' },
        { text: 'OPA/Gatekeeper: policy as code для K8s admission' },
        { text: 'Compliance: CIS Benchmarks, ФСТЭК требования' },
        { text: 'Zero trust network: принципы и реализация' },
      ],
    },
    questions: [
      { level: 'junior', q: 'Почему нельзя хранить секреты в ENV переменных Docker образа?', hint: 'docker inspect показывает ENV. image layers кэшируются и могут утечь. Используй: runtime ENV + Vault/Secrets manager.' },
      { level: 'middle', q: 'Что такое SBOM и зачем он нужен?', hint: 'Software Bill of Materials = список всех зависимостей. Нужен для: аудита CVE, compliance, реакции на инциденты типа Log4Shell.' },
      { level: 'middle', q: 'Как проверить, что образ не был модифицирован после публикации?', hint: 'Cosign sign/verify. Sigstore transparency log. Digest (@sha256:...) вместо тегов.' },
      { level: 'senior', q: 'Объясни supply chain attack на примере. Как защититься?', hint: 'SolarWinds, XZ utils backdoor. Защита: signed commits, SBOM, hermetic builds, dependency pinning.' },
    ],
  },
];

const LEVELS: Level[] = ['junior', 'middle', 'senior'];
const LEVEL_LABELS: Record<Level, string> = { junior: 'Junior', middle: 'Middle', senior: 'Senior' };
const LEVEL_COLORS: Record<Level, string> = { junior: '#00e5a0', middle: '#4e9eff', senior: '#b48eff' };

export function DevOpsDomainExplorer() {
  const [selected, setSelected] = useState<string>('linux');
  const [level, setLevel] = useState<Level>('middle');
  const [tab, setTab] = useState<'skills' | 'questions'>('skills');

  const domain = DOMAINS.find(d => d.id === selected)!;
  const filteredQ = domain.questions.filter(q => q.level === level);

  return (
    <div className={s.explorer}>
      <div className={s.header}>
        <span className={s.title}>// devops-domain-explorer</span>
        <div className={s.levelTabs}>
          {LEVELS.map(l => (
            <button key={l}
              className={`${s.levelTab} ${level === l ? s.levelTabActive : ''}`}
              style={{ '--lc': LEVEL_COLORS[l] } as React.CSSProperties}
              onClick={() => setLevel(l)}>
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.domainList}>
          {DOMAINS.map(d => (
            <button key={d.id}
              className={`${s.domainBtn} ${selected === d.id ? s.domainBtnActive : ''}`}
              style={{ '--dc': d.color } as React.CSSProperties}
              onClick={() => setSelected(d.id)}>
              <span className={s.domainIcon}>{d.icon}</span>
              <span className={s.domainName}>{d.name}</span>
            </button>
          ))}
        </div>

        <div className={s.detail} style={{ '--dc': domain.color } as React.CSSProperties}>
          <div className={s.detailHeader}>
            <div className={s.detailTitle}>
              <span className={s.detailIcon}>{domain.icon}</span>
              {domain.name}
            </div>
            <div className={s.detailTagline}>{domain.tagline}</div>
            <div className={s.toolList}>
              {domain.tools.map(t => (
                <span key={t} className={s.tool}>{t}</span>
              ))}
            </div>
          </div>

          <div className={s.detailTabs}>
            <button className={`${s.detailTab} ${tab === 'skills' ? s.detailTabActive : ''}`}
              onClick={() => setTab('skills')}>
              навыки {LEVEL_LABELS[level]}
            </button>
            <button className={`${s.detailTab} ${tab === 'questions' ? s.detailTabActive : ''}`}
              onClick={() => setTab('questions')}>
              вопросы с интервью {filteredQ.length > 0 ? `(${filteredQ.length})` : ''}
            </button>
          </div>

          {tab === 'skills' && (
            <div className={s.skillList}>
              {domain.skills[level].map((skill, i) => (
                <div key={i} className={s.skillItem}>
                  <span className={s.skillCheck} style={{ color: LEVEL_COLORS[level] }}>▸</span>
                  <div>
                    <span className={s.skillText}>{skill.text}</span>
                    {skill.note && <span className={s.skillNote}> — {skill.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'questions' && (
            <div className={s.questionList}>
              {filteredQ.length === 0 ? (
                <div className={s.noQ}>Нет вопросов для этого уровня</div>
              ) : filteredQ.map((q, i) => (
                <QuestionCard key={i} q={q} levelColor={LEVEL_COLORS[level]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ q, levelColor }: { q: InterviewQ; levelColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.qCard} onClick={() => setOpen(o => !o)}>
      <div className={s.qRow}>
        <span className={s.qMark} style={{ color: levelColor }}>?</span>
        <span className={s.qText}>{q.q}</span>
        <span className={s.qToggle}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className={s.qHint}>
          <span className={s.qHintLabel}>подсказка: </span>
          {q.hint}
        </div>
      )}
    </div>
  );
}
