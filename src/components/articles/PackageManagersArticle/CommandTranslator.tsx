'use client';

import { useState } from 'react';
import { siNpm, siYarn, siPnpm } from 'simple-icons';
import { BrandIcon } from '@/components/ui/BrandIcon/BrandIcon';
import s from './CommandTranslator.module.scss';

interface Action {
  id: string;
  label: string;
  icon: string;
  npm: string;
  yarn: string;
  pnpm: string;
  note?: string;
}

const ACTIONS: Action[] = [
  {
    id: 'install-all',
    label: 'Установить всё',
    icon: '📦',
    npm:  'npm install',
    yarn: 'yarn',
    pnpm: 'pnpm install',
    note: 'Читает package.json и устанавливает все зависимости',
  },
  {
    id: 'add',
    label: 'Добавить пакет',
    icon: '➕',
    npm:  'npm install express',
    yarn: 'yarn add express',
    pnpm: 'pnpm add express',
    note: 'Устанавливает и добавляет в dependencies',
  },
  {
    id: 'add-dev',
    label: 'Добавить dev-пакет',
    icon: '🛠',
    npm:  'npm install -D jest',
    yarn: 'yarn add --dev jest',
    pnpm: 'pnpm add -D jest',
    note: 'Добавляет в devDependencies — только для разработки',
  },
  {
    id: 'remove',
    label: 'Удалить пакет',
    icon: '🗑',
    npm:  'npm uninstall lodash',
    yarn: 'yarn remove lodash',
    pnpm: 'pnpm remove lodash',
  },
  {
    id: 'run',
    label: 'Запустить скрипт',
    icon: '▶',
    npm:  'npm run dev',
    yarn: 'yarn dev',
    pnpm: 'pnpm dev',
    note: 'yarn и pnpm позволяют не писать run для скриптов',
  },
  {
    id: 'exec',
    label: 'Запустить пакет',
    icon: '⚡',
    npm:  'npx create-next-app',
    yarn: 'yarn dlx create-next-app',
    pnpm: 'pnpm dlx create-next-app',
    note: 'Запускает пакет без установки в проект',
  },
  {
    id: 'update',
    label: 'Обновить пакеты',
    icon: '🔄',
    npm:  'npm update',
    yarn: 'yarn upgrade',
    pnpm: 'pnpm update',
  },
  {
    id: 'list',
    label: 'Список пакетов',
    icon: '📋',
    npm:  'npm list --depth=0',
    yarn: 'yarn list --depth=0',
    pnpm: 'pnpm list',
  },
  {
    id: 'ci',
    label: 'Чистая установка (CI)',
    icon: '🤖',
    npm:  'npm ci',
    yarn: 'yarn install --frozen-lockfile',
    pnpm: 'pnpm install --frozen-lockfile',
    note: 'Строго по lock-файлу, не обновляет зависимости',
  },
];

const MANAGERS = [
  { key: 'npm',  icon: siNpm,  color: '#CB3837', label: 'npm'  },
  { key: 'yarn', icon: siYarn, color: '#2C8EBB', label: 'yarn' },
  { key: 'pnpm', icon: siPnpm, color: '#F69220', label: 'pnpm' },
] as const;

export function CommandTranslator() {
  const [active, setActive] = useState<string>('add');
  const action = ACTIONS.find(a => a.id === active)!;

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// command-translator</span>
      </div>

      <div className={s.body}>
        <div className={s.actionList}>
          {ACTIONS.map(a => (
            <button
              key={a.id}
              className={`${s.actionBtn} ${active === a.id ? s.active : ''}`}
              onClick={() => setActive(a.id)}
            >
              <span className={s.actionIcon}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        <div>
          <div className={s.commands}>
            {MANAGERS.map(m => (
              <div key={m.key} className={s.managerRow}>
                <div className={s.managerLabel}>
                  <BrandIcon icon={m.icon} size={16} color={m.color} />
                  <span className={s.managerName} style={{ color: m.color }}>{m.label}</span>
                </div>
                <div className={s.commandCode}>
                  {action[m.key as 'npm' | 'yarn' | 'pnpm']}
                </div>
              </div>
            ))}
          </div>

          {action.note && (
            <div className={s.note}>// {action.note}</div>
          )}
        </div>
      </div>
    </div>
  );
}
