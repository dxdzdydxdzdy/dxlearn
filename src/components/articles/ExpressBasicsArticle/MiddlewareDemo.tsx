'use client';

import { useState, useRef } from 'react';
import s from './MiddlewareDemo.module.scss';

type MwState = 'pending' | 'running' | 'passed' | 'blocked';
type Mode = 'auth' | 'noauth';

interface LogLine { id: number; text: string; type: 'ok' | 'warn' | 'err' | 'muted'; time: string }

const MIDDLEWARES = [
  { id: 'logger',  name: 'Logger',          action: (auth: boolean) => ({ passed: true,  msg: `GET /tasks` }) },
  { id: 'json',    name: 'express.json()',   action: (auth: boolean) => ({ passed: true,  msg: 'body разобран' }) },
  { id: 'auth',    name: 'Auth Check',       action: (auth: boolean) => ({ passed: auth,  msg: auth ? 'токен ✓' : '401 Нет токена' }) },
  { id: 'handler', name: 'Route Handler',    action: (auth: boolean) => ({ passed: true,  msg: '200 OK → [{...}]' }) },
];

let idCounter = 0;

export function MiddlewareDemo() {
  const [mode, setMode] = useState<Mode>('auth');
  const [states, setStates] = useState<MwState[]>(['pending', 'pending', 'pending', 'pending']);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [response, setResponse] = useState<{ text: string; ok: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function reset() {
    clearTimers();
    setStates(['pending', 'pending', 'pending', 'pending']);
    setLogs([]);
    setResponse(null);
    setRunning(false);
  }

  function addLog(text: string, type: LogLine['type']) {
    const now = new Date();
    const time = `${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;
    setLogs(prev => [...prev, { id: idCounter++, text, type, time }]);
  }

  function schedule(fn: () => void, delay: number) {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
  }

  function simulate() {
    reset();
    setRunning(true);
    const isAuth = mode === 'auth';

    let delay = 0;
    let blocked = false;

    MIDDLEWARES.forEach((mw, i) => {
      if (blocked) return;
      const result = mw.action(isAuth);

      // Start running
      schedule(() => {
        setStates(prev => prev.map((st, idx) => idx === i ? 'running' : st));
        addLog(`→ ${mw.name}`, 'muted');
      }, delay);
      delay += 500;

      // Result
      schedule(() => {
        const nextState: MwState = result.passed ? 'passed' : 'blocked';
        setStates(prev => prev.map((st, idx) => idx === i ? nextState : st));
        addLog(result.msg, result.passed ? 'ok' : 'err');
      }, delay);
      delay += 400;

      if (!result.passed) {
        blocked = true;
        schedule(() => {
          setResponse({ text: '401 Unauthorized', ok: false });
          setRunning(false);
        }, delay);
      }
    });

    if (!blocked) {
      schedule(() => {
        setResponse({ text: '200 OK  [{ id: 1, task: "..." }]', ok: true });
        setRunning(false);
      }, delay);
    }
  }

  const isAuth = mode === 'auth';

  return (
    <div className={s.demo}>
      <div className={s.demoHeader}>
        <span className={s.demoTitle}>// middleware-chain</span>
        <div className={s.controls}>
          <div className={s.toggle}>
            <button className={`${s.toggleBtn} ${mode === 'auth' ? s.active : ''}`} onClick={() => { reset(); setMode('auth'); }}>
              с токеном
            </button>
            <button className={`${s.toggleBtn} ${mode === 'noauth' ? s.active : ''}`} onClick={() => { reset(); setMode('noauth'); }}>
              без токена
            </button>
          </div>
          <button className={`${s.btn} ${s.primary}`} onClick={simulate} disabled={running}>simulate</button>
          <button className={s.btn} onClick={reset} disabled={running}>reset</button>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.pipeline}>
          <div className={s.requestBadge}>
            GET /tasks {isAuth ? '🔑' : '🚫'}
          </div>

          {MIDDLEWARES.map((mw, i) => (
            <div key={mw.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div className={`${s.arrow} ${states[i] === 'running' || states[i] === 'passed' ? s.active : ''}`}>↓</div>
              <div className={`${s.mwBox} ${s[states[i]]}`} style={{ alignSelf: 'center' }}>
                <div className={s.mwHead}>
                  <div className={s.mwDot} />
                  {mw.name}
                </div>
                <div className={s.mwAction}>
                  {states[i] === 'pending' && 'ожидает...'}
                  {states[i] === 'running' && 'обрабатывает...'}
                  {states[i] === 'passed'  && (i < 3 ? 'next() →' : 'res.json()')}
                  {states[i] === 'blocked' && 'res.status(401)'}
                </div>
              </div>
            </div>
          ))}

          <div className={`${s.arrow} ${response ? s.active : ''}`}>↓</div>
          <div className={`${s.responseBadge} ${response ? s.visible : ''} ${response?.ok ? s.ok : s.err}`}>
            {response?.text ?? '—'}
          </div>
        </div>

        <div className={s.logPanel}>
          <div className={s.logTitle}>// server log</div>
          {logs.length === 0 && <div className={s.logEmpty}>нажми simulate</div>}
          {logs.map(line => (
            <div key={line.id} className={s.logLine}>
              <span className={s.logTime}>{line.time}</span>
              <span className={s[`log${line.type.charAt(0).toUpperCase()}${line.type.slice(1)}` as 'logOk'|'logWarn'|'logErr'|'logMuted']}>
                {line.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
