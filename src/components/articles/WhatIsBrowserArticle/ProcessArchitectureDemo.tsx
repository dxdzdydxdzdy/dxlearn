'use client';

import { useState } from 'react';
import s from './ProcessArchitectureDemo.module.scss';

interface ProcessInfo {
  id: string;
  name: string;
  sub: string;
  color: string;
  desc: string;
  can: string[];
  cannot: string[];
}

const BROWSER_PROCESS: ProcessInfo = {
  id: 'browser',
  name: 'Browser Process',
  sub: 'PID 1 · privileged',
  color: '#00e5a0',
  desc: 'Главный процесс браузера. Управляет chrome (адресная строка, табы, кнопки). Единственный, кто имеет полный доступ к ОС. Координирует все остальные процессы через IPC.',
  can: ['Файловая система', 'Сеть (через Network Process)', 'Буфер обмена', 'Permissions API', 'Запуск/остановка других процессов'],
  cannot: ['Исполнять JS сайтов', 'Напрямую рендерить DOM'],
};

const SUB_PROCESSES: ProcessInfo[] = [
  {
    id: 'renderer',
    name: 'Renderer Process',
    sub: '×N · sandbox',
    color: '#4db8ff',
    desc: 'Один на каждый сайт (после Site Isolation — на каждый cross-site origin). Запускает Blink (HTML/CSS) и V8 (JS). Работает в жёстком sandbox.',
    can: ['Парсинг HTML, CSS', 'Выполнение JS', 'Построение DOM и CSSOM', 'IPC-запросы к Browser Process'],
    cannot: ['Прямой доступ к файловой системе', 'Прямые сетевые запросы', 'Буфер обмена без разрешения'],
  },
  {
    id: 'gpu',
    name: 'GPU Process',
    sub: '×1 · shared',
    color: '#b48eff',
    desc: 'Исполняет GPU-команды от всех renderer процессов. Compositing, WebGL, Canvas 2D — всё проходит сюда. Отдельный процесс нужен из-за нестабильности GPU-драйверов.',
    can: ['Команды GPU (WebGL, Canvas)', 'Compositing слоёв', 'Hardware acceleration'],
    cannot: ['Доступ к JS heap renderer', 'Сетевые запросы'],
  },
  {
    id: 'network',
    name: 'Network Process',
    sub: '×1 · semi-sandbox',
    color: '#f0c040',
    desc: 'Весь сетевой стек: DNS, TCP, TLS, HTTP/1.1, HTTP/2, HTTP/3 (QUIC), WebSocket. Управляет HTTP-кэшем на диске. Вынесен отдельно для безопасности — renderer не может делать произвольные запросы.',
    can: ['DNS lookup', 'TCP/TLS соединения', 'HTTP-кэш', 'Загрузка ресурсов'],
    cannot: ['Исполнять JS', 'Читать DOM', 'Напрямую получать данные renderer'],
  },
  {
    id: 'utility',
    name: 'Utility / Plugin',
    sub: 'по потребности',
    color: '#ff9070',
    desc: 'Вспомогательные процессы: PDF viewer, Audio service, Storage service (IndexedDB, localStorage), Print compositor. Каждый вынесен отдельно — crash в PDF viewer не трогает вкладки.',
    can: ['Специфичные задачи (PDF, audio, storage)', 'IPC с Browser Process'],
    cannot: ['Общий доступ к памяти других процессов'],
  },
];

type Tab = 'arch' | 'isolation';

export function ProcessArchitectureDemo() {
  const [tab, setTab] = useState<Tab>('arch');
  const [selected, setSelected] = useState<ProcessInfo | null>(null);

  function select(proc: ProcessInfo) {
    setSelected(prev => prev?.id === proc.id ? null : proc);
  }

  return (
    <div className={s.demo}>
      <div className={s.demoHeader}>
        <span className={s.demoTitle}>// browser-processes</span>
        <div className={s.tabBar}>
          <button className={`${s.tab} ${tab === 'arch' ? s.active : ''}`} onClick={() => setTab('arch')}>architecture</button>
          <button className={`${s.tab} ${tab === 'isolation' ? s.active : ''}`} onClick={() => setTab('isolation')}>site isolation</button>
        </div>
      </div>

      <div className={s.body}>
        {tab === 'arch' && (
          <>
            <div className={s.diagram}>
              {/* Browser Process */}
              <div
                className={`${s.browserProcess} ${selected?.id === 'browser' ? s.selected : ''}`}
                onClick={() => select(BROWSER_PROCESS)}
              >
                <div className={s.browserProcessHeader}>
                  <div className={s.processDot} style={{ background: BROWSER_PROCESS.color }} />
                  <div className={s.processName}>{BROWSER_PROCESS.name}</div>
                  <div className={s.processPid}>{BROWSER_PROCESS.sub}</div>
                </div>

                <div className={s.subProcesses} onClick={e => e.stopPropagation()}>
                  {SUB_PROCESSES.map(proc => (
                    <div
                      key={proc.id}
                      className={`${s.subProcess} ${selected?.id === proc.id ? s.selected : ''}`}
                      style={{ '--proc-color': proc.color } as React.CSSProperties}
                      onClick={() => select(proc)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={s.processDot} style={{ background: proc.color, width: 7, height: 7 }} />
                        <div className={s.subProcessName}>{proc.name}</div>
                      </div>
                      <div className={s.subProcessSub}>{proc.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selected ? (
              <div className={s.detail}>
                <div className={s.detailHeader}>
                  <div className={s.detailDot} style={{ background: selected.color }} />
                  <div className={s.detailName}>{selected.name}</div>
                </div>
                <div className={s.detailGrid}>
                  <div className={s.detailCol}>
                    <div className={s.detailLabel}>ОПИСАНИЕ</div>
                    <div className={s.detailDesc}>{selected.desc}</div>
                  </div>
                  <div className={s.detailCol}>
                    <div className={s.detailLabel}>ДОСТУП</div>
                    <div className={s.accessList}>
                      {selected.can.map(item => (
                        <div key={item} className={s.accessItem}>
                          <span className={`${s.accessIcon} ${s.ok}`}>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                      {selected.cannot.map(item => (
                        <div key={item} className={s.accessItem}>
                          <span className={`${s.accessIcon} ${s.no}`}>✗</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={s.hint}>кликни на любой процесс — увидишь что он умеет и чего нет</div>
            )}
          </>
        )}

        {tab === 'isolation' && <SiteIsolationView />}
      </div>
    </div>
  );
}

// ── Site Isolation view ───────────────────────────────────────────────────────

const ISOLATION_SCENARIOS = [
  {
    id: 'before',
    label: 'до 2018',
    desc: 'Одна вкладка с несколькими сайтами — один renderer',
    tabs: [
      { origin: 'site-a.com', proc: 'renderer-1', color: '#4db8ff' },
      { origin: 'site-b.com', proc: 'renderer-1', color: '#4db8ff' },
      { origin: 'evil-iframe.com', proc: 'renderer-1', color: '#ff5f6a' },
    ],
    warning: 'Spectre: evil-iframe.com в том же процессе может через timing-атаку читать память site-a.com',
  },
  {
    id: 'after',
    label: 'после Spectre',
    desc: 'Site Isolation: каждый cross-site origin — отдельный процесс',
    tabs: [
      { origin: 'site-a.com', proc: 'renderer-1', color: '#4db8ff' },
      { origin: 'site-b.com', proc: 'renderer-2', color: '#b48eff' },
      { origin: 'evil-iframe.com', proc: 'renderer-3', color: '#f0c040' },
    ],
    warning: null,
  },
];

function SiteIsolationView() {
  const [scenario, setScenario] = useState<'before' | 'after'>('before');
  const current = ISOLATION_SCENARIOS.find(s => s.id === scenario)!;

  const procGroups = current.tabs.reduce<Record<string, typeof current.tabs>>((acc, tab) => {
    if (!acc[tab.proc]) acc[tab.proc] = [];
    acc[tab.proc].push(tab);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className={s.tabBar}>
        <button className={`${s.tab} ${scenario === 'before' ? s.active : ''}`} onClick={() => setScenario('before')}>до Spectre</button>
        <button className={`${s.tab} ${scenario === 'after' ? s.active : ''}`} onClick={() => setScenario('after')}>Site Isolation</button>
      </div>

      <div style={{ fontSize: '13px', color: '#7a9aaa', lineHeight: '1.6' }}>{current.desc}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(procGroups).map(([proc, tabs]) => (
          <div key={proc} style={{ border: `1px solid ${tabs[0].color}44`, borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ padding: '6px 12px', background: `${tabs[0].color}10`, borderBottom: `1px solid ${tabs[0].color}33`, fontFamily: 'monospace', fontSize: '11px', color: tabs[0].color }}>
              {proc}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 12px' }}>
              {tabs.map(tab => (
                <div key={tab.origin} style={{ fontFamily: 'monospace', fontSize: '12px', padding: '4px 10px', borderRadius: '4px', background: `${tab.color}15`, border: `1px solid ${tab.color}40`, color: tab.color === '#ff5f6a' ? '#ff5f6a' : '#e8edf0' }}>
                  {tab.origin}
                  {tab.color === '#ff5f6a' && ' ⚠'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {current.warning ? (
        <div style={{ background: 'rgba(255,95,106,0.08)', border: '1px solid rgba(255,95,106,0.3)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#7a9aaa', lineHeight: '1.6' }}>
          <span style={{ color: '#ff5f6a', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>УЯЗВИМОСТЬ</span>
          {current.warning}
        </div>
      ) : (
        <div style={{ background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: '6px', padding: '12px 16px', fontSize: '13px', color: '#7a9aaa', lineHeight: '1.6' }}>
          <span style={{ color: '#00e5a0', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>ЗАЩИТА</span>
          Каждый cross-site origin в своём процессе. Spectre не может читать память другого процесса — физически разные адресные пространства. Цена: ~10% больше памяти.
        </div>
      )}
    </div>
  );
}
