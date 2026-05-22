import { CodeHighlight } from '@/components/ui/CodeHighlight/CodeHighlight';
import { Callout } from '@/components/ui/Callout/Callout';
import { QuizBlock } from '@/components/ui/QuizBlock/QuizBlock';
import { FileSystemExplorer } from './FileSystemExplorer';
import { PermissionsLab } from './PermissionsLab';
import { ProcessViewer } from './ProcessViewer';
import { CommandBreakdown } from './CommandBreakdown';
import { QUIZ_QUESTIONS } from './quizData';
import s from './LinuxArticle.module.scss';

export function LinuxArticle() {
  return (
    <div className={s.root}>

      {/* 1 — Зачем Linux */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Зачем это всё</h2>
        <p className={s.prose}>
          99% серверов в мире работают на Linux. Твой Docker-контейнер — это Linux.
          Kubernetes-нода — Linux. AWS EC2, Yandex Cloud VM — Linux.
          Можно не знать Linux и делать фронтенд, но как только дело доходит до деплоя,
          отладки или DevOps — без базы никуда.
        </p>
        <div className={s.conceptGrid}>
          {[
            { icon: '📁', title: 'Всё есть файл', desc: 'Диски, терминалы, сетевые сокеты, процессы — в Linux всё представлено как файл в едином дереве директорий.' },
            { icon: '🔒', title: 'Права доступа', desc: 'Каждый файл принадлежит пользователю и группе. Три уровня прав: владелец, группа, остальные.' },
            { icon: '⚙️', title: 'Процессы', desc: 'Каждая программа — это процесс с PID. Процессы общаются через сигналы, pipe и файлы.' },
          ].map(c => (
            <div key={c.title} className={s.conceptCard}>
              <span className={s.conceptIcon}>{c.icon}</span>
              <div className={s.conceptTitle}>{c.title}</div>
              <div className={s.conceptDesc}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Файловая система */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Файловая система: куда что лежит</h2>
        <p className={s.prose}>
          В Linux нет "диска C:". Есть одно дерево с корнем <code>/</code>.
          Физические диски, сетевые папки, виртуальные ФС — всё монтируется в это дерево.
          Знать, где что лежит — значит быстро ориентироваться на любом сервере.
        </p>
        <FileSystemExplorer />
        <Callout variant="info">
          Когда диск заполняется на сервере — первым делом <code>df -h</code> (какой раздел),
          потом <code>du -sh /var/log/* | sort -h</code> — кто виноват.
        </Callout>
      </section>

      {/* 3 — Права доступа */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Права доступа: кто что может</h2>
        <p className={s.prose}>
          Каждый файл имеет три группы прав: <strong>владелец (u)</strong>,{' '}
          <strong>группа (g)</strong>, <strong>остальные (o)</strong>.
          Для каждой — три бита: <code>r</code> (read), <code>w</code> (write), <code>x</code> (execute).
          Тумблерь биты ниже и смотри как меняется команда <code>chmod</code>.
        </p>
        <PermissionsLab />
        <Callout variant="warn">
          SSH приватный ключ обязан иметь права <code>600</code> — иначе ssh выдаст
          "Permissions are too open" и откажется работать. Это защита от случайного чтения другими.
        </Callout>
      </section>

      {/* 4 — Процессы и сигналы */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Процессы: жизнь и смерть</h2>
        <p className={s.prose}>
          Каждая запущенная программа — процесс с уникальным <strong>PID</strong>.
          У каждого процесса есть родитель (<strong>PPID</strong>). Корень дерева — PID 1 (systemd).
          Процессы общаются через <strong>сигналы</strong> — числовые команды от ядра или других процессов.
        </p>
        <p className={s.prose}>
          Выбери процесс в списке, выбери сигнал и отправь его. Смотри как меняется статус.
        </p>
        <ProcessViewer />

        <table className={`${s.table} ${s.signalTable}`}>
          <thead className={s.tableHead}>
            <tr><th>Сигнал</th><th>Имя</th><th>Что происходит</th><th>Когда использовать</th></tr>
          </thead>
          <tbody>
            {[
              ['15', 'SIGTERM', 'Вежливый запрос завершиться', 'Всегда первым. kill <pid>'],
              ['9', 'SIGKILL', 'Ядро убивает принудительно', 'Только если SIGTERM не помог'],
              ['1', 'SIGHUP', 'Перезагрузить конфиг (для демонов)', 'nginx -s reload или kill -1'],
              ['19', 'SIGSTOP', 'Заморозить процесс', 'Пауза без завершения'],
              ['18', 'SIGCONT', 'Продолжить после STOP', 'Разморозить процесс'],
              ['2', 'SIGINT', 'Прерывание (Ctrl+C)', 'Остановить интерактивный процесс'],
            ].map(([num, name, what, when]) => (
              <tr key={num} className={s.tableRow}>
                <td>{num}</td>
                <td>{name}</td>
                <td>{what}</td>
                <td>{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 5 — Команды */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Базовые команды: разбор по частям</h2>
        <p className={s.prose}>
          В Linux команды строятся по принципу: маленькие утилиты, соединённые через <code>|</code> (pipe).
          Каждая делает одно дело хорошо. Выбери команду ниже и кликни на любой токен — узнаешь
          что именно он означает.
        </p>
        <CommandBreakdown />
      </section>

      {/* 6 — systemd */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>systemd: управление сервисами</h2>
        <p className={s.prose}>
          На большинстве современных дистрибутивов PID 1 — это <strong>systemd</strong>.
          Он управляет запуском сервисов, зависимостями, логами (journald) и таймерами.
        </p>
        <CodeHighlight lang="bash" code={`# Основные команды systemctl
systemctl status nginx          # состояние сервиса
systemctl start / stop / restart nginx
systemctl enable nginx          # автозапуск при старте
systemctl disable nginx         # убрать из автозапуска
systemctl reload nginx          # перечитать конфиг (SIGHUP)
systemctl list-units --type=service --state=running  # все запущенные

# Логи через journalctl
journalctl -u nginx             # все логи nginx
journalctl -u nginx -f          # в реальном времени
journalctl -u nginx --since "1 hour ago"
journalctl -p err               # только ошибки (0-7: emerg..debug)
journalctl --disk-usage         # сколько места занимают логи`} />

        <CodeHighlight lang="bash" code={`# Структура unit-файла (упрощённо)
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server
Restart=on-failure
RestartSec=5s
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target`} />

        <Callout variant="info">
          После изменения unit-файла: <code>systemctl daemon-reload</code> — перечитать файлы.
          Только потом <code>systemctl restart myapp</code>.
        </Callout>
      </section>

      {/* 7 — Сеть */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Базовая сетевая диагностика</h2>
        <p className={s.prose}>
          Сервис не отвечает — вот стандартная последовательность проверки:
        </p>
        <CodeHighlight lang="bash" code={`# 1. Слушает ли процесс вообще?
ss -tlnp | grep 8080
# Ничего нет → сервис упал или не запустился

# 2. Доступен ли порт локально?
curl -v http://localhost:8080/health
# connection refused → сервис не слушает
# timeout → фаервол или сеть

# 3. Какой процесс занял порт?
ss -tlnp | grep :8080
# LISTEN 0 128 0.0.0.0:8080 ... users:(("node",pid=3847,...))

# 4. Фаервол (iptables / nftables)
iptables -L -n | grep 8080
# или
nft list ruleset | grep 8080

# 5. Куда уходят пакеты?
ip route get 10.0.1.5     # маршрут до адреса
traceroute 10.0.1.5        # прыжки
ping -c 3 10.0.1.5         # базовая доступность`} />

        <table className={s.table}>
          <thead className={s.tableHead}>
            <tr><th>Команда</th><th>Что делает</th><th>Когда использовать</th></tr>
          </thead>
          <tbody>
            {[
              ['ip addr', 'IP-адреса интерфейсов', 'Что за адреса у сервера'],
              ['ip route', 'Таблица маршрутизации', 'Куда идут пакеты'],
              ['ss -tlnp', 'TCP-сокеты в LISTEN', 'Кто и на каком порту'],
              ['ping', 'ICMP эхо-запрос', 'Жив ли хост (грубо)'],
              ['curl -v', 'HTTP-запрос с деталями', 'Проверить API, заголовки'],
              ['tcpdump', 'Захват пакетов', 'Глубокая отладка сети'],
            ].map(([cmd, what, when]) => (
              <tr key={cmd} className={s.tableRow}>
                <td>{cmd}</td>
                <td>{what}</td>
                <td>{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 8 — Quiz */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Самопроверка</h2>
        <QuizBlock questions={QUIZ_QUESTIONS} />
      </section>

    </div>
  );
}
