'use client';

import { useState } from 'react';
import s from './ApiPlayground.module.scss';

interface Task { id: number; title: string; isCompleted: boolean; }

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Learn NestJS', isCompleted: false },
  { id: 2, title: 'Build REST API', isCompleted: true },
];

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  desc: string;
  needsId?: boolean;
  needsBody?: boolean;
}

const ENDPOINTS: Endpoint[] = [
  { method: 'GET',  path: '/task/all',       desc: 'Получить все задачи' },
  { method: 'GET',  path: '/task/by-id/:id', desc: 'Найти задачу по ID', needsId: true },
  { method: 'POST', path: '/task',           desc: 'Создать новую задачу', needsBody: true },
];

function highlight(json: string): string {
  return json
    .replace(/("[\w]+")\s*:/g, '<span class="key">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="str">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="bool">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="num">$1</span>');
}

export function ApiPlayground() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeEp, setActiveEp]   = useState<number>(0);
  const [idInput, setIdInput]     = useState('1');
  const [titleInput, setTitleInput] = useState('');
  const [response, setResponse]   = useState<string | null>(null);
  const [status, setStatus]       = useState<number | null>(null);
  const [loading, setLoading]     = useState(false);

  const ep = ENDPOINTS[activeEp];

  function send() {
    setLoading(true);
    setTimeout(() => {
      if (ep.method === 'GET' && !ep.needsId) {
        setStatus(200);
        setResponse(JSON.stringify(tasks, null, 2));
      } else if (ep.method === 'GET' && ep.needsId) {
        const id = Number(idInput);
        const task = tasks.find(t => t.id === id);
        if (!task) {
          setStatus(404);
          setResponse(JSON.stringify({ message: 'Task not found', error: 'Not Found', statusCode: 404 }, null, 2));
        } else {
          setStatus(200);
          setResponse(JSON.stringify(task, null, 2));
        }
      } else if (ep.method === 'POST') {
        const title = titleInput.trim();
        if (!title) {
          setStatus(400);
          setResponse(JSON.stringify({ message: 'title is required', error: 'Bad Request', statusCode: 400 }, null, 2));
        } else {
          const newTask: Task = { id: tasks.length + 1, title, isCompleted: false };
          const updated = [...tasks, newTask];
          setTasks(updated);
          setStatus(201);
          setResponse(JSON.stringify(updated, null, 2));
        }
      }
      setLoading(false);
    }, 300);
  }

  function reset() {
    setTasks(INITIAL_TASKS);
    setResponse(null);
    setStatus(null);
    setTitleInput('');
    setIdInput('1');
  }

  const statusOk = status !== null && status < 400;
  const resolvedPath = ep.needsId
    ? ep.path.replace(':id', idInput || '…')
    : ep.path;

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.label}>// api playground</span>
        <button className={s.resetBtn} onClick={reset}>↺ reset</button>
      </div>

      {/* Endpoint selector */}
      <div className={s.epList}>
        {ENDPOINTS.map((e, i) => (
          <button
            key={i}
            className={[s.epBtn, activeEp === i ? s.epActive : ''].join(' ')}
            onClick={() => { setActiveEp(i); setResponse(null); setStatus(null); }}
          >
            <span className={`${s.method} ${s[e.method.toLowerCase()]}`}>{e.method}</span>
            <span className={s.epPath}>{e.path}</span>
          </button>
        ))}
      </div>

      {/* Request panel */}
      <div className={s.reqPanel}>
        <div className={s.urlBar}>
          <span className={`${s.badge} ${s[ep.method.toLowerCase()]}`}>{ep.method}</span>
          <span className={s.urlText}>localhost:3000{resolvedPath}</span>
        </div>

        {ep.needsId && (
          <div className={s.inputRow}>
            <span className={s.inputLabel}>:id</span>
            <input
              className={s.input}
              type="number"
              min={1}
              value={idInput}
              onChange={e => { setIdInput(e.target.value); setResponse(null); }}
              placeholder="1"
            />
          </div>
        )}

        {ep.needsBody && (
          <div className={s.bodyArea}>
            <div className={s.bodyLabel}>// request body</div>
            <div className={s.bodyRow}>
              <span className={s.inputLabel}>title</span>
              <input
                className={s.input}
                type="text"
                value={titleInput}
                onChange={e => { setTitleInput(e.target.value); setResponse(null); }}
                placeholder='New task title'
              />
            </div>
          </div>
        )}

        <button className={s.sendBtn} onClick={send} disabled={loading}>
          {loading ? '…' : '▶ Send'}
        </button>
      </div>

      {/* Response */}
      {response !== null && (
        <div className={s.resPanel}>
          <div className={s.resHeader}>
            <span className={s.resLabel}>// response</span>
            <span className={[s.resStatus, statusOk ? s.ok : s.err].join(' ')}>
              {status} {statusOk ? 'OK' : 'Error'}
            </span>
          </div>
          <pre
            className={s.resPre}
            dangerouslySetInnerHTML={{ __html: highlight(response) }}
          />
        </div>
      )}
    </div>
  );
}
