'use client';

import { useState, useEffect, useRef } from 'react';
import s from './CpuIoDemo.module.scss';

interface Task {
  id: number;
  label: string;
  duration: number;
  ioWait?: number;
}

const CPU_TASKS: Task[] = [
  { id: 1, label: 'Сжать PDF', duration: 80 },
  { id: 2, label: 'Обработать видео', duration: 120 },
  { id: 3, label: 'Обучить модель', duration: 100 },
];

const IO_TASKS: Task[] = [
  { id: 1, label: 'SELECT из БД', duration: 60, ioWait: 45 },
  { id: 2, label: 'HTTP API запрос', duration: 80, ioWait: 65 },
  { id: 3, label: 'Прочитать файл', duration: 50, ioWait: 38 },
];

const TICK = 30;

interface TaskState {
  id: number;
  label: string;
  progress: number;
  status: 'waiting' | 'running' | 'io-wait' | 'done';
  startedAt: number;
  duration: number;
  ioWait: number;
}

export function CpuIoDemo() {
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tick, setTick] = useState(0);
  const [cpuTasks, setCpuTasks] = useState<TaskState[]>([]);
  const [ioTasks, setIoTasks] = useState<TaskState[]>([]);
  const tickRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    tickRef.current = 0;
    setTick(0);
    setRunning(false);
    setFinished(false);
    setCpuTasks([]);
    setIoTasks([]);
  }

  function start() {
    reset();
    setRunning(true);
    setCpuTasks(CPU_TASKS.map((t, i) => ({
      id: t.id, label: t.label, progress: 0, duration: t.duration,
      ioWait: 0, startedAt: -1, status: 'waiting' as const,
    })));
    setIoTasks(IO_TASKS.map(t => ({
      id: t.id, label: t.label, progress: 0, duration: t.duration,
      ioWait: t.ioWait ?? 0, startedAt: -1, status: 'waiting' as const,
    })));

    let t = 0;
    timerRef.current = setInterval(() => {
      t++;
      tickRef.current = t;
      setTick(t);

      // CPU: sequential — next task starts only after previous done
      setCpuTasks(prev => {
        const next = [...prev];
        let offset = 0;
        for (let i = 0; i < next.length; i++) {
          const task = { ...next[i] };
          const startTick = offset;
          if (t < startTick) break;
          if (task.status === 'done') { offset += task.duration; continue; }
          if (task.status === 'waiting') { task.status = 'running'; task.startedAt = t; }
          const elapsed = t - startTick;
          task.progress = Math.min(100, Math.round((elapsed / task.duration) * 100));
          if (elapsed >= task.duration) { task.status = 'done'; task.progress = 100; offset += task.duration; }
          next[i] = task;
          if (task.status !== 'done') break;
        }
        return next;
      });

      // IO: concurrent — all start at once, io-wait periods visible
      setIoTasks(prev => prev.map(task => {
        if (task.status === 'done') return task;
        const updated = { ...task };
        if (updated.status === 'waiting') { updated.status = 'io-wait'; updated.startedAt = 1; }
        const elapsed = t;
        const waitEnd = updated.ioWait;
        if (elapsed < waitEnd) {
          updated.status = 'io-wait';
          updated.progress = Math.round((elapsed / waitEnd) * 40);
        } else {
          updated.status = 'running';
          const workElapsed = elapsed - waitEnd;
          const workDuration = updated.duration - updated.ioWait;
          updated.progress = 40 + Math.round((workElapsed / workDuration) * 60);
        }
        if (elapsed >= updated.duration) { updated.status = 'done'; updated.progress = 100; }
        return updated;
      }));

      const totalTicks = Math.max(...CPU_TASKS.map(t => t.duration).reduce((acc, d, i) => {
        acc.push((acc[i] ?? 0) + d); return acc;
      }, [] as number[]), ...IO_TASKS.map(t => t.duration));

      if (t >= totalTicks + 5) {
        clearInterval(timerRef.current!);
        setRunning(false);
        setFinished(true);
      }
    }, TICK);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const cpuTotal = CPU_TASKS.reduce((s, t) => s + t.duration, 0);
  const ioTotal = Math.max(...IO_TASKS.map(t => t.duration));

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// cpu-vs-io-demo</span>
        <div className={s.controls}>
          <button className={s.btn} onClick={start} disabled={running}>
            {running ? 'выполняется...' : finished ? 'повторить' : 'simulate →'}
          </button>
        </div>
      </div>

      <div className={s.panels}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>CPU-bound</span>
            <span className={s.panelBadge} style={{ background: 'rgba(255,95,106,0.15)', color: '#ff5f6a' }}>
              последовательно
            </span>
          </div>
          <div className={s.panelDesc}>
            Задачи нагружают процессор. Пока выполняется одна — воркер заблокирован,
            остальные ждут. Параллелизм требует отдельных процессов.
          </div>
          <div className={s.taskList}>
            {(cpuTasks.length ? cpuTasks : CPU_TASKS.map(t => ({ ...t, progress: 0, status: 'waiting' as const, startedAt: -1, ioWait: 0 }))).map(task => (
              <TaskBar key={task.id} task={task} type="cpu" />
            ))}
          </div>
          {finished && (
            <div className={s.time}>
              итог: ~{Math.round(cpuTotal * TICK / 1000 * 10) / 10}с (последовательно)
            </div>
          )}
        </div>

        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelTitle}>IO-bound</span>
            <span className={s.panelBadge} style={{ background: 'rgba(0,229,160,0.12)', color: '#00e5a0' }}>
              конкурентно
            </span>
          </div>
          <div className={s.panelDesc}>
            Задачи ждут внешний ресурс (БД, API, диск). Воркер свободен во время ожидания
            — может обрабатывать другие запросы через async/await.
          </div>
          <div className={s.taskList}>
            {(ioTasks.length ? ioTasks : IO_TASKS.map(t => ({ ...t, progress: 0, status: 'waiting' as const, startedAt: -1, ioWait: t.ioWait ?? 0 }))).map(task => (
              <TaskBar key={task.id} task={task} type="io" />
            ))}
          </div>
          {finished && (
            <div className={s.time}>
              итог: ~{Math.round(ioTotal * TICK / 1000 * 10) / 10}с (конкурентно)
            </div>
          )}
        </div>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}><span className={s.dot} style={{ background: '#ff5f6a' }} />CPU работает</span>
        <span className={s.legendItem}><span className={s.dot} style={{ background: '#f0c040' }} />IO ожидание</span>
        <span className={s.legendItem}><span className={s.dot} style={{ background: '#00e5a0' }} />завершено</span>
        <span className={s.legendItem}><span className={s.dot} style={{ background: '#1a2530' }} />ожидание очереди</span>
      </div>
    </div>
  );
}

function TaskBar({ task, type }: { task: TaskState; type: 'cpu' | 'io' }) {
  const color = task.status === 'done' ? '#00e5a0'
    : task.status === 'io-wait' ? '#f0c040'
    : task.status === 'running' ? '#ff5f6a'
    : '#1a2530';

  return (
    <div className={s.taskBar}>
      <div className={s.taskLabel}>{task.label}</div>
      <div className={s.taskTrack}>
        <div className={s.taskFill} style={{ width: `${task.progress}%`, background: color }} />
        {type === 'io' && task.status === 'io-wait' && task.progress < 40 && (
          <div className={s.waitLabel}>ждём ответа...</div>
        )}
      </div>
      <div className={s.taskStatus} style={{ color }}>
        {task.status === 'done' ? '✓' : task.status === 'waiting' ? '–' : task.status === 'io-wait' ? 'IO' : '▶'}
      </div>
    </div>
  );
}
