'use client';

import { useState } from 'react';
import s from './ArchitectureFlow.module.scss';

interface Step {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  code: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    id: 'client',
    label: 'Client',
    sublabel: 'HTTP Request',
    color: '#4db8ff',
    code: 'GET /tasks',
    desc: 'Клиент (браузер, Postman) отправляет HTTP-запрос на сервер. NestJS принимает его и начинает обработку.',
  },
  {
    id: 'controller',
    label: 'Controller',
    sublabel: 'task.controller.ts',
    color: '#e0234e',
    code: `@Get('all')
findAll() {
  return this.taskService.findAll();
}`,
    desc: 'Контроллер принимает запрос и вызывает нужный метод сервиса. Никакой бизнес-логики — только маршрутизация.',
  },
  {
    id: 'service',
    label: 'Service',
    sublabel: 'task.service.ts',
    color: '#00e5a0',
    code: `findAll() {
  return this.tasks;
}`,
    desc: 'Сервис — мозг приложения. Здесь вся бизнес-логика: работа с данными, валидация, запросы в базу.',
  },
  {
    id: 'response',
    label: 'Response',
    sublabel: 'JSON',
    color: '#f0c040',
    code: `[
  { id: 1, title: "Learn NestJS" },
  { id: 2, title: "Build API" }
]`,
    desc: 'Сервис возвращает данные → контроллер отдаёт их клиенту в JSON. Полный цикл завершён.',
  },
];

export function ArchitectureFlow() {
  const [active, setActive] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  function runFlow() {
    if (animating) return;
    setActive(null);
    setAnimating(true);
    let i = 0;
    const tick = () => {
      setActive(i);
      i++;
      if (i < STEPS.length) {
        setTimeout(tick, 700);
      } else {
        setAnimating(false);
      }
    };
    setTimeout(tick, 100);
  }

  const current = active !== null ? STEPS[active] : null;

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.label}>// request flow</span>
        <button className={s.runBtn} onClick={runFlow} disabled={animating}>
          {animating ? '▶ running…' : '▶ simulate request'}
        </button>
      </div>

      <div className={s.flow}>
        {STEPS.map((step, i) => {
          const isActive  = active === i;
          const isPassed  = active !== null && i < active;
          const isWaiting = active !== null && i > active;

          return (
            <div key={step.id} className={s.stepWrap}>
              <button
                className={[
                  s.step,
                  isActive  ? s.stepActive  : '',
                  isPassed  ? s.stepPassed  : '',
                  isWaiting ? s.stepWaiting : '',
                ].join(' ')}
                style={{ '--sc': step.color } as React.CSSProperties}
                onClick={() => !animating && setActive(i)}
              >
                <span className={s.stepLabel}>{step.label}</span>
                <span className={s.stepSub}>{step.sublabel}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={[s.arrow, isPassed || isActive ? s.arrowActive : ''].join(' ')}>→</div>
              )}
            </div>
          );
        })}
      </div>

      <div className={s.detail}>
        {current ? (
          <>
            <div className={s.detailTop}>
              <span className={s.detailName} style={{ color: current.color }}>{current.label}</span>
              <span className={s.detailSub}>{current.sublabel}</span>
            </div>
            <p className={s.detailDesc}>{current.desc}</p>
            <pre className={s.detailCode}><code>{current.code}</code></pre>
          </>
        ) : (
          <p className={s.hint}>Нажми ▶ simulate request — посмотри как NestJS обрабатывает запрос шаг за шагом.<br />Или кликни на любой блок чтобы изучить его.</p>
        )}
      </div>
    </div>
  );
}
