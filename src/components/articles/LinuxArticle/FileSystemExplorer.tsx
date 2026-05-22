'use client';

import { useState } from 'react';
import s from './FileSystemExplorer.module.scss';

interface DirEntry {
  path: string;
  label: string;
  indent: number;
  purpose: string;
  contains: string[];
  practical: string;
  example: string;
}

const DIRS: DirEntry[] = [
  {
    path: '/',
    label: '/',
    indent: 0,
    purpose: 'Корень файловой системы. Всё начинается отсюда.',
    contains: ['bin', 'etc', 'home', 'var', 'usr', 'proc', 'dev', 'sys', 'tmp', 'opt'],
    practical: 'В Linux всё является файлом — даже устройства, процессы и сетевые сокеты. Нет "дисков C: D:". Одно дерево, разные точки монтирования.',
    example: 'ls -la /',
  },
  {
    path: '/etc',
    label: '/etc',
    indent: 1,
    purpose: 'Конфигурационные файлы системы и приложений.',
    contains: ['nginx/', 'ssh/sshd_config', 'hosts', 'passwd', 'fstab', 'systemd/'],
    practical: 'Ломаешь приложение — сначала смотри /etc. Сменить порт nginx, правила SSH, DNS-серверы — всё здесь. Файлы текстовые, редактируются вручную.',
    example: 'cat /etc/hosts\nnano /etc/nginx/nginx.conf',
  },
  {
    path: '/var',
    label: '/var',
    indent: 1,
    purpose: 'Переменные данные — то, что меняется во время работы системы.',
    contains: ['log/', 'lib/', 'cache/', 'run/', 'spool/'],
    practical: 'Первое место при отладке: /var/log. Диск заканчивается — проверь /var/log/*.log и /var/lib. БД часто хранят данные в /var/lib/postgresql или /var/lib/mysql.',
    example: 'tail -f /var/log/nginx/access.log\ndu -sh /var/log/*',
  },
  {
    path: '/var/log',
    label: '/var/log',
    indent: 2,
    purpose: 'Логи системы и приложений.',
    contains: ['syslog', 'auth.log', 'nginx/', 'kern.log', 'journald/'],
    practical: 'grep "error" /var/log/nginx/error.log — первый шаг при инциденте. Логи ротируются через logrotate чтобы не съесть диск.',
    example: 'grep -i "error\\|crit" /var/log/syslog | tail -50',
  },
  {
    path: '/home',
    label: '/home',
    indent: 1,
    purpose: 'Домашние директории пользователей.',
    contains: ['/home/alice/', '/home/bob/'],
    practical: 'У каждого юзера своя директория. ~/.bashrc, ~/.ssh/authorized_keys, ~/.config — настройки конкретного пользователя. На серверах часто важнее /etc и /var.',
    example: 'ls -la ~/.ssh/\ncat ~/.bashrc',
  },
  {
    path: '/usr',
    label: '/usr',
    indent: 1,
    purpose: 'User System Resources — установленные программы и библиотеки.',
    contains: ['bin/', 'sbin/', 'lib/', 'local/', 'share/'],
    practical: 'Большинство команд живут в /usr/bin: python3, git, curl, vim. Когда устанавливаешь пакет через apt/yum — файлы чаще всего идут сюда.',
    example: 'which python3\n# → /usr/bin/python3\nls /usr/bin | grep git',
  },
  {
    path: '/tmp',
    label: '/tmp',
    indent: 1,
    purpose: 'Временные файлы. Очищается при перезагрузке.',
    contains: ['*.tmp', 'unix-сокеты', 'временные артефакты сборки'],
    practical: 'Безопасное место для скачивания скриптов перед запуском. Права sticky bit (o+t): каждый может писать, но удалить чужой файл нельзя.',
    example: 'ls -la / | grep tmp\n# drwxrwxrwt — t в конце = sticky bit',
  },
  {
    path: '/proc',
    label: '/proc',
    indent: 1,
    purpose: 'Псевдо-файловая система. Данные ядра и процессов в виде файлов.',
    contains: ['/proc/1/ (PID)', 'cpuinfo', 'meminfo', 'net/'],
    practical: 'Не реальные файлы — генерируются ядром на лету. /proc/meminfo — текущая память. /proc/1234/cmdline — командная строка процесса 1234. Основа для top, ps, htop.',
    example: 'cat /proc/meminfo | grep -i mem\nls /proc/$$/  # $$ = PID текущего bash',
  },
  {
    path: '/dev',
    label: '/dev',
    indent: 1,
    purpose: 'Файлы устройств. Всё — файл, включая диски и терминалы.',
    contains: ['sda, sdb (диски)', 'tty (терминалы)', 'null, zero, random', 'loop'],
    practical: '/dev/null — "черная дыра", /dev/zero — генератор нулей. Диск /dev/sda — можно читать как файл. dd if=/dev/sda of=backup.img — дамп диска.',
    example: 'echo "тест" > /dev/null  # отбросить вывод\nls -la /dev/sd*',
  },
  {
    path: '/opt',
    label: '/opt',
    indent: 1,
    purpose: 'Optional software — программы, не входящие в пакетный менеджер.',
    contains: ['google/', 'atlassian/', 'custom-app/'],
    practical: 'Компании устанавливают сюда проприетарный или самокомпилированный софт. Vault, Jenkins, нестандартные версии Python — часто живут здесь.',
    example: 'ls /opt/\n# hashicorp/ jenkins/ company-app/',
  },
];

export function FileSystemExplorer() {
  const [selected, setSelected] = useState('/etc');
  const dir = DIRS.find(d => d.path === selected)!;

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.topLabel}>// linux-filesystem-explorer</span>
        <span className={s.topHint}>кликни на директорию</span>
      </div>
      <div className={s.body}>
        <div className={s.tree}>
          {DIRS.map(d => (
            <button
              key={d.path}
              className={`${s.treeItem} ${selected === d.path ? s.treeItemActive : ''}`}
              style={{ paddingLeft: `${$space(d.indent)}` }}
              onClick={() => setSelected(d.path)}
            >
              <span className={s.treeIcon}>{d.indent === 0 ? '/' : d.indent === 1 ? '├─' : '│  ├─'}</span>
              <span className={s.treePath}>{d.label}</span>
            </button>
          ))}
        </div>

        <div className={s.detail}>
          <div className={s.detailPath}>{dir.path}</div>
          <div className={s.detailPurpose}>{dir.purpose}</div>

          <div className={s.block}>
            <div className={s.blockLabel}>содержит:</div>
            <div className={s.tagList}>
              {dir.contains.map(c => (
                <span key={c} className={s.tag}>{c}</span>
              ))}
            </div>
          </div>

          <div className={s.block}>
            <div className={s.blockLabel}>зачем тебе это знать:</div>
            <div className={s.practical}>{dir.practical}</div>
          </div>

          <div className={s.block}>
            <div className={s.blockLabel}>пример:</div>
            <pre className={s.code}>{dir.example}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function $space(indent: number): string {
  return `${12 + indent * 16}px`;
}
