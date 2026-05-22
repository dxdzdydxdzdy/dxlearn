'use client';

import { useState } from 'react';
import s from './CommandBreakdown.module.scss';

interface Token {
  text: string;
  role: 'cmd' | 'flag' | 'arg' | 'pipe' | 'redirect' | 'path' | 'pattern';
  title: string;
  desc: string;
}

interface Example {
  id: string;
  label: string;
  usecase: string;
  tokens: Token[];
}

const EXAMPLES: Example[] = [
  {
    id: 'grep',
    label: 'grep — поиск по тексту',
    usecase: 'Найти все строки с "error" рекурсивно в логах с номерами строк',
    tokens: [
      { text: 'grep', role: 'cmd', title: 'grep', desc: 'Global Regular Expression Print — ищет строки, совпадающие с паттерном.' },
      { text: '-r', role: 'flag', title: '-r (recursive)', desc: 'Рекурсивный обход поддиректорий. Без него grep смотрит только в указанный файл.' },
      { text: '-n', role: 'flag', title: '-n (line numbers)', desc: 'Выводить номера строк. Незаменимо при отладке: сразу знаешь, куда открыть файл.' },
      { text: '-i', role: 'flag', title: '-i (ignore case)', desc: 'Игнорировать регистр: "Error", "ERROR", "error" — всё найдёт.' },
      { text: '"error"', role: 'pattern', title: 'паттерн', desc: 'Строка или регулярное выражение для поиска. Кавычки защищают спецсимволы от shell.' },
      { text: '/var/log/', role: 'path', title: 'путь поиска', desc: 'Директория для поиска. Можно указать конкретный файл или . для текущей директории.' },
    ],
  },
  {
    id: 'find',
    label: 'find — поиск файлов',
    usecase: 'Найти конфиг-файлы в /etc, изменённые за последние 7 дней',
    tokens: [
      { text: 'find', role: 'cmd', title: 'find', desc: 'Поиск файлов по метаданным: имя, тип, размер, права, время изменения.' },
      { text: '/etc', role: 'path', title: 'начальная точка', desc: 'Директория для обхода. find обходит всё дерево рекурсивно по умолчанию.' },
      { text: '-name', role: 'flag', title: '-name "паттерн"', desc: 'Фильтр по имени файла. Поддерживает glob: *.conf, app-*.log. Чувствителен к регистру; -iname — нет.' },
      { text: '"*.conf"', role: 'pattern', title: 'glob-паттерн', desc: 'Любое имя заканчивающееся на .conf. Кавычки обязательны — иначе shell раскроет glob сам.' },
      { text: '-mtime', role: 'flag', title: '-mtime N', desc: 'Фильтр по времени изменения. -7 = за последние 7 дней. +7 = старше 7 дней. 7 = ровно 7 дней назад.' },
      { text: '-7', role: 'arg', title: '-7 (за последние 7 дней)', desc: 'Минус означает "меньше N дней назад" = более свежие файлы. Плюс — старше N дней.' },
      { text: '-type', role: 'flag', title: '-type f', desc: 'Тип: f = обычный файл, d = директория, l = симлинк. Без этого find вернёт и файлы, и директории.' },
      { text: 'f', role: 'arg', title: 'f (regular file)', desc: 'Искать только обычные файлы, не директории и не симлинки.' },
    ],
  },
  {
    id: 'ps',
    label: 'ps aux — список процессов',
    usecase: 'Показать все процессы всех пользователей с деталями',
    tokens: [
      { text: 'ps', role: 'cmd', title: 'ps', desc: 'Process Status — снимок процессов в момент вызова. В отличие от top, не обновляется.' },
      { text: 'a', role: 'flag', title: 'a — все пользователи', desc: 'Показывать процессы всех пользователей, не только текущего. BSD-синтаксис (без тире).' },
      { text: 'u', role: 'flag', title: 'u — user-oriented', desc: 'Формат с USER, %CPU, %MEM, VSZ, RSS, STAT — самый читаемый.' },
      { text: 'x', role: 'flag', title: 'x — без терминала', desc: 'Включить процессы без управляющего терминала: демоны, фоновые сервисы.' },
      { text: '|', role: 'pipe', title: 'pipe |', desc: 'Перенаправляет stdout одной команды в stdin следующей. Основа Unix-философии: маленькие программы, объединённые pipe.' },
      { text: 'grep', role: 'cmd', title: 'grep', desc: 'Фильтрует вывод ps, оставляя только строки с нужным именем.' },
      { text: 'nginx', role: 'arg', title: 'паттерн поиска', desc: 'Найти процессы nginx. Совет: ps aux | grep [n]ginx — квадратные скобки исключают сам grep из результатов.' },
    ],
  },
  {
    id: 'ss',
    label: 'ss — сетевые сокеты',
    usecase: 'Показать все TCP-порты в режиме LISTEN с именами процессов',
    tokens: [
      { text: 'ss', role: 'cmd', title: 'ss (socket statistics)', desc: 'Современная замена netstat. Показывает открытые сокеты быстрее и подробнее.' },
      { text: '-t', role: 'flag', title: '-t (TCP)', desc: 'Только TCP-сокеты. -u для UDP, -x для Unix-сокетов.' },
      { text: '-l', role: 'flag', title: '-l (listening)', desc: 'Только сокеты в состоянии LISTEN — те, кто принимает входящие соединения.' },
      { text: '-n', role: 'flag', title: '-n (numeric)', desc: 'Не резолвить имена: показывать IP и порты числами, а не hostname и "http". Быстрее и точнее.' },
      { text: '-p', role: 'flag', title: '-p (process)', desc: 'Показывать PID и имя процесса, владеющего сокетом. Нужны root-права для чужих процессов.' },
    ],
  },
  {
    id: 'journalctl',
    label: 'journalctl — логи systemd',
    usecase: 'Показать последние логи nginx в реальном времени',
    tokens: [
      { text: 'journalctl', role: 'cmd', title: 'journalctl', desc: 'Просмотр журнала systemd-journald. Собирает логи от всех сервисов в один бинарный журнал с метаданными.' },
      { text: '-u', role: 'flag', title: '-u (unit)', desc: 'Фильтр по systemd-юниту. Можно указать несколько: -u nginx -u php-fpm.' },
      { text: 'nginx', role: 'arg', title: 'имя юнита', desc: 'Полное имя nginx.service или просто nginx — journalctl добавит .service сам.' },
      { text: '-f', role: 'flag', title: '-f (follow)', desc: 'Режим tail -f: показывать новые строки в реальном времени. Ctrl+C для выхода.' },
      { text: '--since', role: 'flag', title: '--since "время"', desc: 'Показывать логи с определённого момента. "1 hour ago", "2024-01-01", "yesterday".' },
      { text: '"1 hour ago"', role: 'arg', title: 'временной диапазон', desc: 'Человекочитаемый формат времени. Также: --until "now", -n 100 (последние 100 строк).' },
    ],
  },
];

const ROLE_COLORS: Record<Token['role'], string> = {
  cmd: '#00e5a0',
  flag: '#4e9eff',
  arg: '#f0c040',
  pipe: '#ff7b72',
  redirect: '#ff5f6a',
  path: '#b48eff',
  pattern: '#ff9f43',
};

const ROLE_LABELS: Record<Token['role'], string> = {
  cmd: 'команда',
  flag: 'флаг',
  arg: 'аргумент',
  pipe: 'pipe',
  redirect: 'редирект',
  path: 'путь',
  pattern: 'паттерн',
};

export function CommandBreakdown() {
  const [exampleId, setExampleId] = useState('grep');
  const [activeToken, setActiveToken] = useState<number | null>(null);

  const example = EXAMPLES.find(e => e.id === exampleId)!;
  const token = activeToken !== null ? example.tokens[activeToken] : null;

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.topLabel}>// command-breakdown</span>
        <span className={s.topHint}>кликни на часть команды</span>
      </div>

      <div className={s.tabs}>
        {EXAMPLES.map(e => (
          <button
            key={e.id}
            className={`${s.tab} ${exampleId === e.id ? s.tabActive : ''}`}
            onClick={() => { setExampleId(e.id); setActiveToken(null); }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className={s.body}>
        <div className={s.usecase}>{example.usecase}</div>

        <div className={s.cmdLine}>
          <span className={s.prompt}>$</span>
          {example.tokens.map((t, i) => (
            <button
              key={i}
              className={`${s.token} ${s[`role_${t.role}`]} ${activeToken === i ? s.tokenActive : ''}`}
              style={{ '--tc': ROLE_COLORS[t.role] } as React.CSSProperties}
              onClick={() => setActiveToken(activeToken === i ? null : i)}
            >
              {t.text}
            </button>
          ))}
        </div>

        <div className={s.legend}>
          {(Object.keys(ROLE_LABELS) as Token['role'][]).map(role => (
            <span key={role} className={s.legendItem}>
              <span className={s.legendDot} style={{ background: ROLE_COLORS[role] }} />
              <span className={s.legendText}>{ROLE_LABELS[role]}</span>
            </span>
          ))}
        </div>

        {token ? (
          <div className={s.explain} style={{ '--tc': ROLE_COLORS[token.role] } as React.CSSProperties}>
            <div className={s.explainHeader}>
              <span className={s.explainToken}>{token.text}</span>
              <span className={s.explainRole}>{ROLE_LABELS[token.role]}</span>
            </div>
            <div className={s.explainTitle}>{token.title}</div>
            <div className={s.explainDesc}>{token.desc}</div>
          </div>
        ) : (
          <div className={s.placeholder}>← кликни на любой токен выше, чтобы узнать что он делает</div>
        )}
      </div>
    </div>
  );
}
