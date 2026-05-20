'use client';

import { useState, useRef } from 'react';
import s from './BrowserJourneyDemo.module.scss';

interface Step {
  id: string;
  label: string;
  sublabel: string;
  timing: string;
  color: string;
  detail: string;
  devNote: string;
}

const STEPS: Step[] = [
  {
    id: 'type', label: 'Ввод URL', sublabel: 'пользователь нажал Enter',
    timing: '0ms', color: '#3d5562',
    detail: 'Браузер разбирает URL: схема (https), хост (example.com), путь (/page), query (?q=hello).',
    devNote: 'Для разработчика: URL — это адрес ресурса. Правильная структура URL влияет на SEO и кэширование.',
  },
  {
    id: 'cache', label: 'Проверка кэша', sublabel: 'есть ли в disk cache?',
    timing: '~1ms', color: '#4e9eff',
    detail: 'Браузер проверяет, есть ли ответ в кэше и не истёк ли Cache-Control max-age. Если есть — сеть не нужна.',
    devNote: 'Devtools → Network → Disable cache отключает это. "from disk cache" в Network Tab = кэш сработал.',
  },
  {
    id: 'dns', label: 'DNS lookup', sublabel: 'IP для example.com?',
    timing: '~20-120ms', color: '#f0c040',
    detail: 'DNS-резолвер переводит доменное имя в IP-адрес. Сначала проверяет локальный кэш → /etc/hosts → роутер → DNS-сервер провайдера → корневые серверы.',
    devNote: 'dns-prefetch и preconnect ускоряют это для сторонних доменов. Высокий DNS время → смени DNS-сервер (8.8.8.8, 1.1.1.1).',
  },
  {
    id: 'tcp', label: 'TCP Handshake', sublabel: 'SYN → SYN-ACK → ACK',
    timing: '~20-100ms', color: '#f0c040',
    detail: '3-way handshake: клиент → SYN → сервер → SYN-ACK → клиент → ACK. Устанавливает надёжное соединение. Один round-trip до сервера.',
    devNote: 'Keep-Alive и HTTP/2 переиспользуют соединение — handshake делается один раз для многих запросов.',
  },
  {
    id: 'tls', label: 'TLS Handshake', sublabel: 'согласование шифрования',
    timing: '~50-100ms', color: '#b48eff',
    detail: 'TLS 1.3: клиент и сервер обмениваются ключами, договариваются о шифре. Все последующие данные зашифрованы.',
    devNote: 'TLS 1.3 быстрее предыдущих версий — 1 round-trip вместо 2. В Devtools → Security видна версия TLS.',
  },
  {
    id: 'request', label: 'HTTP Request', sublabel: 'GET /page HTTP/1.1',
    timing: '~1ms', color: '#00e5a0',
    detail: 'Браузер отправляет HTTP-запрос: метод, путь, заголовки (Host, Accept, Cookie, User-Agent и др.).',
    devNote: 'Devtools → Network → выбрать запрос → Headers показывает всё что отправилось.',
  },
  {
    id: 'response', label: 'HTTP Response', sublabel: '200 OK + HTML',
    timing: '~TTFB', color: '#00e5a0',
    detail: 'Сервер возвращает ответ. TTFB (Time to First Byte) — время ожидания первого байта данных. Первый важный performance-показатель.',
    devNote: 'TTFB > 600ms — проблема. Причины: медленный сервер, БД, нет CDN. Lighthouse измеряет TTFB.',
  },
  {
    id: 'parse', label: 'Парсинг HTML', sublabel: 'строим DOM',
    timing: 'поток', color: '#ff7b72',
    detail: 'Браузер парсит HTML инкрементально. Встречает <link rel="stylesheet"> — блокирует рендер. Встречает <script> без async/defer — блокирует парсер.',
    devNote: 'script defer/async и critical CSS — способы ускорить этот этап. Подробнее в статье Critical Rendering Path.',
  },
  {
    id: 'render', label: 'Render', sublabel: 'DOM + CSSOM → пиксели',
    timing: 'FCP', color: '#ff7b72',
    detail: 'Render Tree → Layout → Paint → Composite. Первая отрисовка — FCP (First Contentful Paint). Самый важный UX-момент.',
    devNote: 'Lighthouse измеряет FCP, LCP, CLS. Целевые значения: FCP < 1.8s, LCP < 2.5s.',
  },
  {
    id: 'js', label: 'JS выполнение', sublabel: 'гидратация / интерактивность',
    timing: 'TTI', color: '#ff7b72',
    detail: 'JS скачивается, парсируется, выполняется. React гидратирует SSR-HTML. Страница становится интерактивной (TTI — Time to Interactive).',
    devNote: 'Большой bundle JS → долгий TTI. Code splitting, lazy imports, tree shaking уменьшают бандл.',
  },
];

export function BrowserJourneyDemo() {
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function play() {
    setPlaying(true);
    setCurrent(0);
    let step = 0;
    const tick = () => {
      step++;
      if (step < STEPS.length) {
        setCurrent(step);
        timerRef.current = setTimeout(tick, 700);
      } else {
        setPlaying(false);
      }
    };
    timerRef.current = setTimeout(tick, 700);
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(-1);
    setPlaying(false);
  }

  const active = current >= 0 ? STEPS[current] : null;

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// browser-journey-demo</span>
        <div className={s.controls}>
          <button className={s.btn} onClick={play} disabled={playing || current === STEPS.length - 1}>
            {current === -1 ? 'simulate' : 'restart'}
          </button>
          {current >= 0 && <button className={s.btnSecondary} onClick={reset}>reset</button>}
        </div>
      </div>

      <div className={s.pipeline}>
        {STEPS.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'pending';
          return (
            <div key={step.id}
              className={`${s.step} ${s[state]}`}
              style={{ '--step-color': step.color } as React.CSSProperties}
              onClick={() => setCurrent(i)}
            >
              <div className={s.stepTiming}>{step.timing}</div>
              <div className={s.stepDot} />
              <div className={s.stepLabel}>{step.label}</div>
              <div className={s.stepSub}>{step.sublabel}</div>
            </div>
          );
        })}
        <div className={s.line} style={{ width: `${Math.max(0, current / (STEPS.length - 1)) * 100}%` }} />
      </div>

      {active && (
        <div className={s.detail} style={{ '--step-color': active.color } as React.CSSProperties}>
          <div className={s.detailLeft}>
            <div className={s.detailLabel}>{active.label}</div>
            <div className={s.detailText}>{active.detail}</div>
          </div>
          <div className={s.detailRight}>
            <div className={s.devNoteLabel}>// dev note</div>
            <div className={s.devNoteText}>{active.devNote}</div>
          </div>
        </div>
      )}

      {current === -1 && (
        <div className={s.hint}>нажми simulate — увидишь каждый шаг с деталями</div>
      )}
    </div>
  );
}
