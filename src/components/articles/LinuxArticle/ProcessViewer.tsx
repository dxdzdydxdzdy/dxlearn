'use client';

import { useState, useCallback } from 'react';
import s from './ProcessViewer.module.scss';

type ProcState = 'R' | 'S' | 'Z' | 'T' | 'D';

interface Proc {
  pid: number;
  ppid: number;
  name: string;
  cmd: string;
  cpu: number;
  mem: number;
  state: ProcState;
  user: string;
  time: string;
}

const STATE_LABELS: Record<ProcState, { short: string; full: string; color: string }> = {
  R: { short: 'R', full: 'Running — активно выполняется', color: '#00e5a0' },
  S: { short: 'S', full: 'Sleeping — ждёт событие (I/O, таймер)', color: '#4e9eff' },
  D: { short: 'D', full: 'Disk sleep — ждёт I/O, нельзя прервать', color: '#f0c040' },
  T: { short: 'T', full: 'Stopped — остановлен сигналом SIGSTOP', color: '#b48eff' },
  Z: { short: 'Z', full: 'Zombie — завершился, ждёт родителя', color: '#ff5f6a' },
};

interface Signal {
  num: number;
  name: string;
  desc: string;
  effect: (p: Proc) => Partial<Proc> | null;
}

const SIGNALS: Signal[] = [
  {
    num: 15, name: 'SIGTERM',
    desc: 'Вежливый запрос завершиться. Процесс может перехватить, сохранить данные и выйти корректно. Используй всегда первым.',
    effect: (p) => p.name === 'init' ? null : { state: 'Z' as ProcState, cpu: 0 },
  },
  {
    num: 9, name: 'SIGKILL',
    desc: 'Принудительное уничтожение ядром. Процесс не может перехватить или игнорировать. Данные могут потеряться. Только если SIGTERM не помог.',
    effect: (p) => p.name === 'init' ? null : null,
  },
  {
    num: 1, name: 'SIGHUP',
    desc: 'Hang-up — исходно: терминал закрылся. Многие демоны (nginx, sshd) перечитывают конфиг при SIGHUP без перезапуска.',
    effect: () => ({ cpu: 0.1 }),
  },
  {
    num: 19, name: 'SIGSTOP',
    desc: 'Пауза. Процесс замораживается, но не завершается. Нельзя игнорировать. Продолжить — SIGCONT.',
    effect: () => ({ state: 'T' as ProcState }),
  },
  {
    num: 18, name: 'SIGCONT',
    desc: 'Продолжить замороженный процесс (после SIGSTOP). Используется планировщиком и job control в shell.',
    effect: (p) => p.state === 'T' ? { state: 'S' as ProcState } : null,
  },
];

const INITIAL_PROCS: Proc[] = [
  { pid: 1, ppid: 0, name: 'systemd', cmd: '/sbin/init', cpu: 0.0, mem: 0.1, state: 'S', user: 'root', time: '5d 2h' },
  { pid: 423, ppid: 1, name: 'sshd', cmd: '/usr/sbin/sshd -D', cpu: 0.0, mem: 0.2, state: 'S', user: 'root', time: '5d 2h' },
  { pid: 891, ppid: 1, name: 'nginx', cmd: 'nginx: master process', cpu: 0.1, mem: 0.5, state: 'S', user: 'www-data', time: '2d 8h' },
  { pid: 892, ppid: 891, name: 'nginx', cmd: 'nginx: worker process', cpu: 1.3, mem: 0.3, state: 'S', user: 'www-data', time: '2d 8h' },
  { pid: 1204, ppid: 1, name: 'postgres', cmd: 'postgres: checkpointer', cpu: 0.0, mem: 2.1, state: 'S', user: 'postgres', time: '1d 4h' },
  { pid: 3847, ppid: 1, name: 'node', cmd: 'node /app/server.js', cpu: 4.2, mem: 3.8, state: 'R', user: 'appuser', time: '0h 47m' },
  { pid: 4102, ppid: 423, name: 'bash', cmd: 'bash', cpu: 0.0, mem: 0.1, state: 'S', user: 'deploy', time: '0h 3m' },
];

export function ProcessViewer() {
  const [procs, setProcs] = useState<Proc[]>(INITIAL_PROCS);
  const [killed, setKilled] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number>(3847);
  const [signal, setSignal] = useState<number>(15);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const selectedProc = procs.find(p => p.pid === selected);
  const selectedSignal = SIGNALS.find(s => s.num === signal)!;

  const sendSignal = useCallback(() => {
    if (!selectedProc) return;
    const sig = SIGNALS.find(s => s.num === signal)!;
    const effect = sig.effect(selectedProc);

    setLastAction(`kill -${signal} ${selectedProc.pid}  # ${sig.name} → ${selectedProc.name}`);

    if (signal === 9) {
      setKilled(prev => new Set([...prev, selectedProc.pid]));
      setTimeout(() => {
        setProcs(prev => prev.filter(p => p.pid !== selectedProc.pid));
        setKilled(prev => { const n = new Set(prev); n.delete(selectedProc.pid); return n; });
        setSelected(p => p === selectedProc.pid ? 3847 : p);
      }, 600);
    } else if (effect) {
      setProcs(prev => prev.map(p => p.pid === selectedProc.pid ? { ...p, ...effect } : p));
    }
  }, [selectedProc, signal]);

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.topLabel}>// process-viewer</span>
        <span className={s.topHint}>выбери процесс → выбери сигнал → отправить</span>
      </div>

      <div className={s.body}>
        <div className={s.procList}>
          <div className={s.procHeader}>
            <span className={s.colPid}>PID</span>
            <span className={s.colName}>COMMAND</span>
            <span className={s.colCpu}>CPU%</span>
            <span className={s.colMem}>MEM%</span>
            <span className={s.colStat}>STAT</span>
          </div>
          {procs.map(p => (
            <button
              key={p.pid}
              className={`${s.proc} ${selected === p.pid ? s.procActive : ''} ${killed.has(p.pid) ? s.procDying : ''}`}
              onClick={() => setSelected(p.pid)}
            >
              <span className={s.colPid}>{p.pid}</span>
              <span className={s.colName}>
                <span className={s.procName}>{p.name}</span>
                <span className={s.procUser}>{p.user}</span>
              </span>
              <span className={s.colCpu} style={{ color: p.cpu > 2 ? '#f0c040' : undefined }}>{p.cpu.toFixed(1)}</span>
              <span className={s.colMem} style={{ color: p.mem > 3 ? '#ff7b72' : undefined }}>{p.mem.toFixed(1)}</span>
              <span className={s.colStat} style={{ color: STATE_LABELS[p.state].color }}>{p.state}</span>
            </button>
          ))}
        </div>

        <div className={s.panel}>
          {selectedProc && (
            <>
              <div className={s.procDetail}>
                <div className={s.detailLine}>
                  <span className={s.detailKey}>pid</span>
                  <span className={s.detailVal}>{selectedProc.pid}</span>
                  <span className={s.detailKey}>ppid</span>
                  <span className={s.detailVal}>{selectedProc.ppid}</span>
                </div>
                <div className={s.detailLine}>
                  <span className={s.detailKey}>cmd</span>
                  <span className={s.detailVal}>{selectedProc.cmd}</span>
                </div>
                <div className={s.detailLine}>
                  <span className={s.detailKey}>state</span>
                  <span className={s.detailVal} style={{ color: STATE_LABELS[selectedProc.state].color }}>
                    {selectedProc.state} — {STATE_LABELS[selectedProc.state].full}
                  </span>
                </div>
                <div className={s.detailLine}>
                  <span className={s.detailKey}>time</span>
                  <span className={s.detailVal}>{selectedProc.time}</span>
                </div>
              </div>

              <div className={s.signals}>
                <div className={s.signalLabel}>сигнал:</div>
                <div className={s.signalBtns}>
                  {SIGNALS.map(sig => (
                    <button
                      key={sig.num}
                      className={`${s.sigBtn} ${signal === sig.num ? s.sigBtnActive : ''}`}
                      onClick={() => setSignal(sig.num)}
                    >
                      <span className={s.sigNum}>{sig.num}</span>
                      <span className={s.sigName}>{sig.name}</span>
                    </button>
                  ))}
                </div>
                <div className={s.sigDesc}>{selectedSignal.desc}</div>
                <button className={s.sendBtn} onClick={sendSignal}>
                  kill -{signal} {selectedProc.pid}
                </button>
              </div>
            </>
          )}

          {lastAction && (
            <div className={s.actionLog}>
              <span className={s.logPrompt}>$</span>
              <span className={s.logCmd}>{lastAction}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
