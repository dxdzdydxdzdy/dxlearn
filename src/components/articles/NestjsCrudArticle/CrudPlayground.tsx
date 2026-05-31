'use client';

import { useState } from 'react';
import s from './CrudPlayground.module.scss';

interface Task { id: number; title: string; isCompleted: boolean; }

const INITIAL: Task[] = [
  { id: 1, title: 'do something',  isCompleted: false },
  { id: 2, title: 'get something', isCompleted: true  },
  { id: 3, title: 'go somewhere',  isCompleted: false },
];

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Op {
  method: Method;
  path: string;
  desc: string;
  needsId?: boolean;
  needsTitle?: boolean;
  needsCompleted?: boolean;
}

const OPS: Op[] = [
  { method: 'GET',    path: '/task/all',      desc: 'Получить все задачи' },
  { method: 'POST',   path: '/task',          desc: 'Создать задачу',         needsTitle: true },
  { method: 'PUT',    path: '/task/:id',      desc: 'Заменить задачу целиком', needsId: true, needsTitle: true, needsCompleted: true },
  { method: 'PATCH',  path: '/task/:id',      desc: 'Обновить поля частично',  needsId: true, needsTitle: true, needsCompleted: true },
  { method: 'DELETE', path: '/task/:id',      desc: 'Удалить задачу',          needsId: true },
];

const METHOD_COLOR: Record<Method, string> = {
  GET: '#00e5a0', POST: '#4db8ff', PUT: '#f0c040', PATCH: '#b48eff', DELETE: '#ff5f6a',
};

function fmtJson(v: unknown) {
  return JSON.stringify(v, null, 2)
    .replace(/("[\w]+")\s*:/g, '<span class="k">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="s">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="b">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="n">$1</span>');
}

export function CrudPlayground() {
  const [tasks, setTasks]         = useState<Task[]>(INITIAL.map(t => ({ ...t })));
  const [opIdx, setOpIdx]         = useState(0);
  const [idInput, setIdInput]     = useState('1');
  const [titleInput, setTitleInput] = useState('');
  const [completedInput, setCompletedInput] = useState(false);
  const [response, setResponse]   = useState<unknown>(null);
  const [status, setStatus]       = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);

  const op = OPS[opIdx];

  function clearRes() { setResponse(null); setStatus(null); }

  function send() {
    setLoading(true);
    setTimeout(() => {
      const id = Number(idInput);

      if (op.method === 'GET') {
        setStatus(200); setResponse(tasks);

      } else if (op.method === 'POST') {
        if (!titleInput.trim()) { setStatus(400); setResponse({ message: 'title is required', statusCode: 400 }); }
        else {
          const t: Task = { id: tasks.length + 1, title: titleInput.trim(), isCompleted: false };
          const updated = [...tasks, t];
          setTasks(updated); setStatus(201); setResponse(updated);
        }

      } else if (op.method === 'PUT') {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) { setStatus(404); setResponse({ message: 'Task not found', statusCode: 404 }); }
        else {
          const updated = tasks.map(t => t.id === id ? { ...t, title: titleInput || t.title, isCompleted: completedInput } : t);
          setTasks(updated);
          setStatus(200); setResponse(updated.find(t => t.id === id));
        }

      } else if (op.method === 'PATCH') {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) { setStatus(404); setResponse({ message: 'Task not found', statusCode: 404 }); }
        else {
          const patch: Partial<Task> = {};
          if (titleInput.trim()) patch.title = titleInput.trim();
          patch.isCompleted = completedInput;
          const updated = tasks.map(t => t.id === id ? { ...t, ...patch } : t);
          setTasks(updated);
          setStatus(200); setResponse(updated.find(t => t.id === id));
        }

      } else if (op.method === 'DELETE') {
        const found = tasks.find(t => t.id === id);
        if (!found) { setStatus(404); setResponse({ message: 'Task not found', statusCode: 404 }); }
        else {
          setTasks(tasks.filter(t => t.id !== id));
          setStatus(200); setResponse(found);
        }
      }

      setLoading(false);
    }, 250);
  }

  const ok = status !== null && status < 400;
  const resolvedPath = op.needsId ? op.path.replace(':id', idInput || '…') : op.path;
  const mc = METHOD_COLOR[op.method];

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// crud playground</span>
        <button className={s.resetBtn} onClick={() => { setTasks(INITIAL.map(t => ({ ...t }))); clearRes(); }}>↺ reset</button>
      </div>

      {/* State panel */}
      <div className={s.stateBar}>
        <span className={s.stateLabel}>state</span>
        <div className={s.taskList}>
          {tasks.map(t => (
            <span key={t.id} className={[s.taskChip, t.isCompleted ? s.done : ''].join(' ')}>
              #{t.id} {t.title}
            </span>
          ))}
          {tasks.length === 0 && <span className={s.empty}>пусто</span>}
        </div>
      </div>

      {/* Op selector */}
      <div className={s.opList}>
        {OPS.map((o, i) => (
          <button
            key={i}
            className={[s.opBtn, opIdx === i ? s.opActive : ''].join(' ')}
            style={{ '--mc': METHOD_COLOR[o.method] } as React.CSSProperties}
            onClick={() => { setOpIdx(i); clearRes(); setTitleInput(''); setIdInput('1'); }}
          >
            <span className={s.badge} style={{ color: METHOD_COLOR[o.method] }}>{o.method}</span>
            <span className={s.opPath}>{o.path}</span>
            <span className={s.opDesc}>{o.desc}</span>
          </button>
        ))}
      </div>

      {/* Request form */}
      <div className={s.form}>
        <div className={s.urlBar} style={{ borderColor: `${mc}33` }}>
          <span className={s.urlMethod} style={{ color: mc }}>{op.method}</span>
          <span className={s.urlPath}>localhost:3000{resolvedPath}</span>
        </div>

        <div className={s.fields}>
          {op.needsId && (
            <label className={s.field}>
              <span className={s.fieldLabel}>:id</span>
              <input className={s.input} type="number" min={1} value={idInput}
                onChange={e => { setIdInput(e.target.value); clearRes(); }} />
            </label>
          )}
          {op.needsTitle && (
            <label className={s.field}>
              <span className={s.fieldLabel}>title</span>
              <input className={s.input} type="text" value={titleInput} placeholder={op.method === 'PATCH' ? '(не обязательно)' : 'Task title'}
                onChange={e => { setTitleInput(e.target.value); clearRes(); }} />
            </label>
          )}
          {op.needsCompleted && (
            <label className={`${s.field} ${s.checkField}`}>
              <span className={s.fieldLabel}>isCompleted</span>
              <input type="checkbox" checked={completedInput}
                onChange={e => { setCompletedInput(e.target.checked); clearRes(); }} />
              <span className={s.checkVal}>{completedInput ? 'true' : 'false'}</span>
            </label>
          )}
        </div>

        <button className={s.sendBtn} style={{ background: mc }} onClick={send} disabled={loading}>
          {loading ? '…' : '▶ Send'}
        </button>
      </div>

      {/* Response */}
      {response !== null && (
        <div className={s.res}>
          <div className={s.resHeader}>
            <span className={s.resLabel}>// response</span>
            <span className={[s.resStatus, ok ? s.ok : s.err].join(' ')}>{status} {ok ? 'OK' : 'Error'}</span>
          </div>
          <pre className={s.resPre} dangerouslySetInnerHTML={{ __html: fmtJson(response) }} />
        </div>
      )}
    </div>
  );
}
