import { SectionTitle } from '@/components/ui/ArticleSection/ArticleSection';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { DevOpsDomainExplorer } from './DevOpsDomainExplorer';
import { PetProjectDiagram } from './PetProjectDiagram';
import { QUIZ_QUESTIONS } from './quizData';
import s from './DevOpsArticle.module.scss';

export function DevOpsArticle() {
  return (
    <div className={s.root}>

      {/* 1 — Что такое DevOps */}
      <section className={s.section}>
        <SectionTitle>DevOps — это культура, не должность</SectionTitle>
        <p className={s.prose}>
          DevOps возник как ответ на войну между разработчиками («хочу деплоить быстро»)
          и operations («хочу стабильности»). Ключевая идея:{' '}
          <strong>сломать стену между Dev и Ops через автоматизацию и общую ответственность.</strong>
        </p>
        <p className={s.prose}>
          На практике DevOps-инженер — это человек, который строит платформу, на которой
          работают разработчики: пайплайны CI/CD, кластеры K8s, системы мониторинга,
          инфраструктуру как код. Его работа невидима, когда всё хорошо, и очень заметна,
          когда что-то ломается в прод.
        </p>

        <div className={s.roleGrid}>
          {[
            {
              icon: '🏗️',
              title: 'Platform Engineer',
              desc: 'Строит внутреннюю платформу: K8s, CI/CD, developer portal. Разработчики — клиенты.',
              tags: ['K8s', 'Terraform', 'Backstage'],
            },
            {
              icon: '🔒',
              title: 'DevSecOps',
              desc: 'Безопасность встроена в пайплайн, а не добавлена снаружи. SBOM, Vault, Falco.',
              tags: ['Vault', 'Trivy', 'OPA'],
            },
            {
              icon: '📊',
              title: 'SRE',
              desc: 'Site Reliability Engineering: SLO, error budget, постмортемы, on-call.',
              tags: ['SLO', 'Prometheus', 'Incident'],
            },
          ].map(r => (
            <div key={r.title} className={s.roleCard}>
              <span className={s.roleIcon}>{r.icon}</span>
              <div className={s.roleTitle}>{r.title}</div>
              <div className={s.roleDesc}>{r.desc}</div>
              <div className={s.roleTags}>
                {r.tags.map(t => <span key={t} className={s.roleTag}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — История */}
      <section className={s.section}>
        <SectionTitle>Как дошло до K8s и GitOps</SectionTitle>
        <div className={s.timeline}>
          {[
            { year: '2009', title: '10+ Deploys Per Day', desc: 'Доклад Flickr на Velocity — первое публичное описание DevOps практик. Dev и Ops вместе деплоили 10+ раз в день.' },
            { year: '2013', title: 'Docker появляется', desc: 'Контейнеры перестали быть нишевой технологией. "Works on my machine" начал уходить в прошлое.' },
            { year: '2014', title: 'Kubernetes от Google', desc: 'Google открыл Kubernetes — внутренний инструмент, выросший из Borg. Контейнерная оркестрация стала стандартом.' },
            { year: '2017', title: 'GitOps coined', desc: 'Weaveworks ввёл термин GitOps: Git как единый источник истины, оператор синхронизирует кластер с репозиторием.' },
            { year: '2021', title: 'Platform Engineering', desc: 'Gartner назвал Platform Engineering топ-трендом. Внутренние developer platform стали отдельной специализацией.' },
            { year: '2026', title: 'ФСТЭК №117 вступает в силу', desc: 'В России обязательная DevSecOps сертификация для ГосИС. Spрос на DevSecOps инженеров вырос в 3× за год.' },
          ].map(item => (
            <div key={item.year} className={s.timelineItem}>
              <div className={s.timelineYear}>{item.year}</div>
              <div className={s.timelineTitle}>{item.title}</div>
              <div className={s.timelineDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — 6 доменов */}
      <section className={s.section}>
        <SectionTitle>6 доменов DevOps-инженера</SectionTitle>
        <p className={s.prose}>
          Реальная работа DevOps-инженера разбита на 6 областей.
          Выбери домен слева, переключай уровень (Junior / Middle / Senior),
          смотри навыки и типичные вопросы с интервью.
        </p>
        <DevOpsDomainExplorer />
      </section>

      {/* 4 — Pet project builder */}
      <section className={s.section}>
        <SectionTitle>Собери стек пет-проекта</SectionTitle>
        <p className={s.prose}>
          Хочешь прокачаться? Возьми пет-проект и добавляй инструменты по одному.
          Каждый инструмент прокачивает определённые домены.
          Цель — покрыть все 6 доменов, пока проект работает в проде.
        </p>
        <PetProjectDiagram />
        <Callout variant="info">
          Типичный путь: Docker → GitHub Actions → K8s (kind/k3s) → Terraform (YC/AWS) →
          Prometheus + Grafana → ArgoCD → Vault → Trivy. Каждый шаг — реальная строчка в резюме.
        </Callout>
      </section>

      {/* 5 — Рынок труда */}
      <section className={s.section}>
        <SectionTitle>Рынок труда 2026</SectionTitle>
        <p className={s.prose}>
          DevOps — одна из самых высокооплачиваемых специализаций в IT.
          Вот картина рынка по данным hh.ru + Habr Career на май 2026:
        </p>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Уровень</th><th>Зарплата (RU)</th><th>Ключевые ожидания</th></tr>
          </thead>
          <tbody>
            {[
              ['Junior', '120–180k ₽', 'Docker, CI/CD basics, Linux, K8s basics'],
              ['Middle', '200–350k ₽', 'K8s production, IaC, Observability stack, GitOps'],
              ['Senior', '350–600k ₽', 'Platform design, multi-cluster, FinOps, DevSecOps'],
              ['Staff / Principal', '600k+ ₽', 'Architecture decisions, org-wide impact, vendor relations'],
            ].map(([lvl, sal, exp]) => (
              <tr key={lvl} className={s.tableRow}>
                <td>{lvl}</td>
                <td className={s.accent}>{sal}</td>
                <td>{exp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Callout variant="warn">
          DevSecOps в 2026 — отдельный и горячий трек из-за ФСТЭК №117.
          Если разбираешься в Vault, OPA, Falco и SBOM — твоя ставка выше средней по рынку.
        </Callout>
      </section>

      {/* 6 — С чего начать */}
      <section className={s.section}>
        <SectionTitle>Roadmap: с чего начинать</SectionTitle>
        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Этап</th><th>Что изучить</th><th>Практика</th></tr>
          </thead>
          <tbody>
            {[
              ['1. Фундамент', 'Linux (права, сети, systemd), Git, bash-scripting', 'Настрой VPS с нуля: nginx, SSL, firewall'],
              ['2. Контейнеры', 'Docker: build, compose, multistage, registry', 'Упакуй своё приложение, запусти docker-compose'],
              ['3. CI/CD', 'GitHub Actions или GitLab CI, пайплайн build→test→push', 'Автодеплой при push в main'],
              ['4. K8s', 'Pod, Deployment, Service, Ingress, RBAC', 'kind или k3s локально, потом YKE/EKS'],
              ['5. IaC', 'Terraform: state, modules, providers', 'Поднять K8s кластер в облаке через Terraform'],
              ['6. Observability', 'Prometheus, Grafana, Loki, AlertManager', 'kube-prometheus-stack в кластере, написать алерт'],
              ['7. GitOps', 'ArgoCD: app, sync, health status', 'Деплоить в K8s только через ArgoCD'],
              ['8. Security', 'Vault, Trivy, NetworkPolicy, cert-manager', 'Убрать все секреты из кода, добавить Trivy в CI'],
            ].map(([stage, learn, practice]) => (
              <tr key={stage} className={s.tableRow}>
                <td>{stage}</td>
                <td>{learn}</td>
                <td className={s.warn}>{practice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 7 — Квиз */}
      <section className={s.section}>
        <SectionTitle>Самопроверка</SectionTitle>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
