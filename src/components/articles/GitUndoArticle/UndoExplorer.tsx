'use client';

import { useState } from 'react';
import s from './UndoExplorer.module.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

type Safety = 'safe' | 'caution' | 'danger';

interface Scenario {
  id: string;
  situation: string;
  command: string;
  safety: Safety;
  explanation: string;
  tip?: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    situation: 'Изменил файл в рабочей директории, хочу вернуть как было',
    command: 'git restore file.js',
    safety: 'caution',
    explanation:
      'Отменяет все несохранённые изменения в file.js. Файл возвращается к состоянию последнего коммита.',
    tip: 'git restore . вернёт ВСЕ файлы. Убедись что нет ничего важного.',
  },
  {
    id: 's2',
    situation: 'Добавил файл в staging случайно (git add лишнего)',
    command: 'git restore --staged file.js',
    safety: 'safe',
    explanation:
      'Убирает file.js из staging area обратно в рабочую директорию. Изменения в файле не теряются.',
    tip: 'До Git 2.23 для этого использовали git reset HEAD file.js — то же самое.',
  },
  {
    id: 's3',
    situation: 'Последний коммит плохой, хочу доработать и закоммитить заново',
    command: 'git reset --soft HEAD~1',
    safety: 'safe',
    explanation:
      'HEAD возвращается на предыдущий коммит. Все изменения из отменённого коммита остаются в staging — можно сразу редактировать и делать новый коммит.',
    tip: 'Если коммит уже запушен — это опасно. Используй git revert вместо reset.',
  },
  {
    id: 's4',
    situation: 'Последний коммит неверный, хочу начать с чистого листа',
    command: 'git reset HEAD~1',
    safety: 'caution',
    explanation:
      'HEAD возвращается на предыдущий коммит (--mixed по умолчанию). Staging очищается, изменения из коммита попадают в рабочую директорию как unstaged. Можно посмотреть что было и решить что делать дальше.',
    tip: 'Незакоммиченные изменения в рабочей директории остаются нетронутыми.',
  },
  {
    id: 's5',
    situation: 'Нужно полностью откатиться — выбросить все изменения с последнего коммита',
    command: 'git reset --hard HEAD~1',
    safety: 'danger',
    explanation:
      'HEAD возвращается на предыдущий коммит. Staging очищается. Рабочая директория откатывается к состоянию коммита. Все несохранённые изменения и изменения из отменённого коммита безвозвратно пропадают.',
    tip: 'Потерянные данные можно попробовать восстановить через git reflog в течение 90 дней.',
  },
  {
    id: 's6',
    situation: 'Коммит уже запушен на GitHub — нужно его отменить публично',
    command: 'git revert HEAD',
    safety: 'safe',
    explanation:
      'Создаёт новый коммит который отменяет изменения выбранного коммита. История не переписывается — безопасно для публичных веток. После revert можно сделать git push.',
    tip: 'git revert abc123 — для отмены конкретного коммита по хэшу.',
  },
  {
    id: 's7',
    situation: 'В коммите опечатка в сообщении или забыл добавить файл',
    command: 'git commit --amend',
    safety: 'caution',
    explanation:
      'Переписывает последний коммит: меняет сообщение и/или добавляет файлы из staging. Меняет хэш коммита.',
    tip: 'Если коммит уже запушен — нужен force push. На shared-ветках это проблема.',
  },
  {
    id: 's8',
    situation: 'Случайно сделал reset --hard и потерял коммиты',
    command: 'git reflog\ngit reset --hard <hash>',
    safety: 'safe',
    explanation:
      'reflog хранит историю всех перемещений HEAD за последние 90 дней. Найди нужный хэш в reflog и восстанови его через reset --hard или checkout.',
    tip: 'Работает только если не прошло 90 дней и не запустился git gc.',
  },
];

const SAFETY_LABEL: Record<Safety, string> = {
  safe:    '✓ безопасно',
  caution: '⚠ осторожно',
  danger:  '✕ опасно',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function UndoExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = SCENARIOS.find(s => s.id === selected) ?? null;

  return (
    <div className={s.wrap}>
      <div className={s.layout}>

        {/* ── Left: scenario list ── */}
        <div className={s.list}>
          <div className={s.listHeader}>// выбери ситуацию</div>
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              className={`${s.scenarioBtn} ${selected === sc.id ? s.scenarioBtnActive : ''}`}
              onClick={() => setSelected(prev => prev === sc.id ? null : sc.id)}
            >
              <span className={`${s.safetyDot} ${s['dot_' + sc.safety]}`} />
              <span className={s.situationText}>{sc.situation}</span>
            </button>
          ))}
        </div>

        {/* ── Right: solution panel ── */}
        <div className={s.detail}>
          <div className={s.detailHeader}>// решение</div>
          {scenario ? (
            <div className={s.solution} key={scenario.id}>
              <div className={`${s.safetyBadge} ${s['badge_' + scenario.safety]}`}>
                {SAFETY_LABEL[scenario.safety]}
              </div>

              <div className={s.commandBlock}>
                <div className={s.commandLabel}>КОМАНДА</div>
                <pre className={s.commandCode}>{scenario.command}</pre>
              </div>

              <div className={s.explanationBlock}>
                <div className={s.explanationText}>{scenario.explanation}</div>
              </div>

              {scenario.tip && (
                <div className={s.tipBlock}>
                  <span className={s.tipIcon}>💡</span>
                  <span className={s.tipText}>{scenario.tip}</span>
                </div>
              )}
            </div>
          ) : (
            <div className={s.placeholder}>← выбери ситуацию слева</div>
          )}
        </div>

      </div>

      {/* ── Safety legend ── */}
      <div className={s.legend}>
        <span className={s.legendItem}><span className={`${s.safetyDot} ${s.dot_safe}`} />безопасно — не теряет данные</span>
        <span className={s.legendItem}><span className={`${s.safetyDot} ${s.dot_caution}`} />осторожно — проверь перед запуском</span>
        <span className={s.legendItem}><span className={`${s.safetyDot} ${s.dot_danger}`} />опасно — данные могут быть потеряны</span>
      </div>
    </div>
  );
}
