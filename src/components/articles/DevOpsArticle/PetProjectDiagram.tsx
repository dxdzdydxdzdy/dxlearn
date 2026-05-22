'use client';

import { useState } from 'react';
import s from './PetProjectDiagram.module.scss';

type DomainId = 'linux' | 'cicd' | 'k8s' | 'cloud' | 'obs' | 'sec';

interface Component {
  id: string;
  icon: string;
  name: string;
  desc: string;
  domains: DomainId[];
}

const COMPONENTS: Component[] = [
  { id: 'docker', icon: '🐳', name: 'Docker', desc: 'Контейнеризация приложения', domains: ['k8s', 'cicd'] },
  { id: 'github-actions', icon: '⚙️', name: 'GitHub Actions', desc: 'CI/CD пайплайн', domains: ['cicd'] },
  { id: 'k8s', icon: '☸️', name: 'Kubernetes', desc: 'Оркестрация контейнеров', domains: ['k8s', 'linux'] },
  { id: 'terraform', icon: '🏗️', name: 'Terraform', desc: 'Инфраструктура как код', domains: ['cloud'] },
  { id: 'prometheus', icon: '📊', name: 'Prometheus + Grafana', desc: 'Сбор метрик и дашборды', domains: ['obs'] },
  { id: 'loki', icon: '📋', name: 'Loki', desc: 'Централизованные логи', domains: ['obs'] },
  { id: 'argocd', icon: '🔄', name: 'ArgoCD', desc: 'GitOps delivery', domains: ['cicd', 'k8s'] },
  { id: 'vault', icon: '🔐', name: 'HashiCorp Vault', desc: 'Управление секретами', domains: ['sec'] },
  { id: 'trivy', icon: '🛡️', name: 'Trivy', desc: 'Сканирование уязвимостей', domains: ['sec', 'cicd'] },
  { id: 'nginx', icon: '🌐', name: 'Nginx / Ingress', desc: 'Балансировка и роутинг', domains: ['linux', 'k8s'] },
  { id: 'certmanager', icon: '🔒', name: 'cert-manager', desc: 'TLS сертификаты в K8s', domains: ['sec', 'k8s'] },
  { id: 'ansible', icon: '📜', name: 'Ansible', desc: 'Конфигурация серверов', domains: ['linux', 'cloud'] },
];

const DOMAINS: { id: DomainId; icon: string; name: string; color: string }[] = [
  { id: 'linux', icon: '🐧', name: 'Linux & Сети', color: '#00e5a0' },
  { id: 'cicd', icon: '🔄', name: 'CI/CD', color: '#4e9eff' },
  { id: 'k8s', icon: '☸️', name: 'Containers & K8s', color: '#f0c040' },
  { id: 'cloud', icon: '☁️', name: 'Cloud & IaC', color: '#b48eff' },
  { id: 'obs', icon: '📊', name: 'Observability', color: '#ff7b72' },
  { id: 'sec', icon: '🔐', name: 'DevSecOps', color: '#ff5f6a' },
];

export function PetProjectDiagram() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(['docker', 'github-actions', 'prometheus']));

  function toggle(id: string) {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const coveredDomains = new Set<DomainId>(
    COMPONENTS.filter(c => enabled.has(c.id)).flatMap(c => c.domains)
  );

  const coverage = Math.round((coveredDomains.size / DOMAINS.length) * 100);

  const domainCoveredBy = (domainId: DomainId) =>
    COMPONENTS.filter(c => enabled.has(c.id) && c.domains.includes(domainId)).map(c => c.name);

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// pet-project-stack-builder</span>
        <div className={s.coverageChip} style={{ '--pct': `${coverage}%` } as React.CSSProperties}>
          <span className={s.coverageNum}>{coverage}%</span>
          <span className={s.coverageText}>доменов покрыто</span>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.left}>
          <div className={s.sectionLabel}>выбери компоненты стека:</div>
          <div className={s.grid}>
            {COMPONENTS.map(c => (
              <button
                key={c.id}
                className={`${s.chip} ${enabled.has(c.id) ? s.chipOn : ''}`}
                onClick={() => toggle(c.id)}
                title={c.desc}
              >
                <span className={s.chipIcon}>{c.icon}</span>
                <div className={s.chipBody}>
                  <span className={s.chipName}>{c.name}</span>
                  <span className={s.chipDesc}>{c.desc}</span>
                </div>
                <span className={s.chipCheck}>{enabled.has(c.id) ? '✓' : '+'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={s.right}>
          <div className={s.sectionLabel}>покрытие доменов:</div>
          <div className={s.domainGrid}>
            {DOMAINS.map(d => {
              const covered = coveredDomains.has(d.id);
              const coverers = domainCoveredBy(d.id);
              return (
                <div
                  key={d.id}
                  className={`${s.domainCard} ${covered ? s.domainCardOn : ''}`}
                  style={{ '--dc': d.color } as React.CSSProperties}
                >
                  <div className={s.domainCardTop}>
                    <span className={s.domainCardIcon}>{d.icon}</span>
                    <span className={s.domainCardName}>{d.name}</span>
                    <span className={s.domainStatus}>{covered ? '●' : '○'}</span>
                  </div>
                  {covered && coverers.length > 0 && (
                    <div className={s.coverers}>
                      {coverers.map(n => <span key={n} className={s.coverer}>{n}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={s.bar}>
            <div className={s.barFill} style={{ width: `${coverage}%` }} />
          </div>
          <div className={s.barLabel}>
            {coveredDomains.size} из {DOMAINS.length} доменов
            {coveredDomains.size === DOMAINS.length && ' — полное покрытие 🎯'}
            {coveredDomains.size === 0 && ' — добавь компонент слева'}
          </div>
        </div>
      </div>
    </div>
  );
}
