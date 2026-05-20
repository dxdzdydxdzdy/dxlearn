'use client';

import { useState, useEffect, useCallback } from 'react';
import s from './StorageDemo.module.scss';

type StorageType = 'local' | 'session';

interface Entry { key: string; value: string; }

function readAll(type: StorageType): Entry[] {
  const store = type === 'local' ? localStorage : sessionStorage;
  return Array.from({ length: store.length }, (_, i) => {
    const key = store.key(i)!;
    return { key, value: store.getItem(key)! };
  }).filter(e => e.key.startsWith('dxlearn_demo_'));
}

export function StorageDemo() {
  const [tab, setTab] = useState<StorageType>('local');
  const [key, setKey] = useState('user_theme');
  const [value, setValue] = useState('dark');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try { setEntries(readAll(tab)); } catch { setEntries([]); }
  }, [tab]);

  useEffect(() => { refresh(); }, [refresh]);

  function showMsg(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(null), 2000);
  }

  function handleWrite() {
    if (!key.trim()) return;
    const store = tab === 'local' ? localStorage : sessionStorage;
    store.setItem(`dxlearn_demo_${key}`, value);
    refresh();
    showMsg(`✓ ${key} сохранён`);
  }

  function handleDelete(k: string) {
    const store = tab === 'local' ? localStorage : sessionStorage;
    store.removeItem(k);
    refresh();
  }

  function handleClear() {
    const store = tab === 'local' ? localStorage : sessionStorage;
    entries.forEach(e => store.removeItem(e.key));
    refresh();
    showMsg('Очищено');
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// storage-demo</span>
        <div className={s.tabs}>
          {(['local', 'session'] as StorageType[]).map(t => (
            <button key={t} className={`${s.tab} ${tab === t ? s.tabActive : ''}`}
              onClick={() => setTab(t)}>
              {t === 'local' ? 'localStorage' : 'sessionStorage'}
            </button>
          ))}
        </div>
      </div>

      <div className={s.body}>
        <div className={s.writePanel}>
          <div className={s.panelLabel}>// записать</div>
          <div className={s.inputRow}>
            <input className={s.input} placeholder="ключ" value={key}
              onChange={e => setKey(e.target.value)} />
            <span className={s.sep}>=</span>
            <input className={s.input} placeholder="значение" value={value}
              onChange={e => setValue(e.target.value)} />
            <button className={s.btn} onClick={handleWrite}>set</button>
          </div>
          {msg && <div className={s.msg}>{msg}</div>}
        </div>

        <div className={s.readPanel}>
          <div className={s.panelHeader}>
            <span className={s.panelLabel}>// текущее содержимое</span>
            {entries.length > 0 && (
              <button className={s.clearBtn} onClick={handleClear}>clear all</button>
            )}
          </div>
          {entries.length === 0 ? (
            <div className={s.empty}>пусто — запиши что-нибудь выше</div>
          ) : (
            <div className={s.entries}>
              {entries.map(e => (
                <div key={e.key} className={s.entry}>
                  <span className={s.entryKey}>{e.key.replace('dxlearn_demo_', '')}</span>
                  <span className={s.entryEq}>=</span>
                  <span className={s.entryVal}>{e.value}</span>
                  <button className={s.deleteBtn} onClick={() => handleDelete(e.key)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.footer}>
        {tab === 'session'
          ? '⚠ sessionStorage очистится при закрытии вкладки — проверь, открыв новую вкладку'
          : '✓ localStorage сохраняется между сессиями — обнови страницу, данные останутся'}
      </div>
    </div>
  );
}
