'use client';

import { useState } from 'react';
import s from './ThreeZonesDemo.module.scss';

type FileStatus = 'new' | 'modified';

interface GitFile {
  id: string;
  name: string;
  status: FileStatus;
}

interface Committed {
  message: string;
  files: string[];
}

const INITIAL_WORKING: GitFile[] = [
  { id: 'index', name: 'index.html', status: 'new' },
  { id: 'style', name: 'style.css',  status: 'new' },
  { id: 'app',   name: 'app.js',     status: 'modified' },
];

const STATUS_COLOR: Record<FileStatus, string> = {
  new:      '#00e5a0',
  modified: '#f0c040',
};

export function ThreeZonesDemo() {
  const [working,  setWorking]  = useState<GitFile[]>(INITIAL_WORKING);
  const [staging,  setStaging]  = useState<GitFile[]>([]);
  const [commits,  setCommits]  = useState<Committed[]>([]);
  const [message,  setMessage]  = useState('');

  function reset() {
    setWorking(INITIAL_WORKING);
    setStaging([]);
    setCommits([]);
    setMessage('');
  }

  function addToStaging(file: GitFile) {
    setWorking(prev => prev.filter(f => f.id !== file.id));
    setStaging(prev => [...prev, file]);
  }

  function unstage(file: GitFile) {
    setStaging(prev => prev.filter(f => f.id !== file.id));
    setWorking(prev => [...prev, file]);
  }

  function commit() {
    if (!message.trim() || staging.length === 0) return;
    setCommits(prev => [...prev, {
      message: message.trim(),
      files: staging.map(f => f.name),
    }]);
    setStaging([]);
    setMessage('');
  }

  return (
    <div className={s.demo}>
      <div className={s.demoHeader}>
        <span className={s.demoTitle}>// three-zones-demo</span>
        <button className={s.resetBtn} onClick={reset}>reset</button>
      </div>

      <div className={s.zones}>
        {/* Working Directory */}
        <div className={s.zone}>
          <div className={s.zoneHead}>
            <div className={s.zoneName} style={{ color: '#7a9aaa' }}>Рабочая директория</div>
            <div className={s.zoneCmd}>изменённые файлы</div>
          </div>
          <div className={s.zoneBody}>
            {working.length === 0 && <div className={s.empty}>нет изменений</div>}
            {working.map(file => (
              <div key={file.id} className={s.file}>
                <div className={s.fileTop}>
                  <div className={s.fileDot} style={{ background: STATUS_COLOR[file.status] }} />
                  <div className={s.fileName}>{file.name}</div>
                  <div className={`${s.fileTag} ${s[file.status]}`}>{file.status}</div>
                </div>
                <div className={s.fileActions}>
                  <button className={`${s.actionBtn} ${s.add}`} onClick={() => addToStaging(file)}>
                    git add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staging Area */}
        <div className={s.zone}>
          <div className={s.zoneHead}>
            <div className={s.zoneName} style={{ color: '#f0c040' }}>Staging Area</div>
            <div className={s.zoneCmd}>git add → подготовлено к коммиту</div>
          </div>
          <div className={s.zoneBody}>
            {staging.length === 0 && <div className={s.empty}>пусто — добавь файлы</div>}
            {staging.map(file => (
              <div key={file.id} className={s.file}>
                <div className={s.fileTop}>
                  <div className={s.fileDot} style={{ background: STATUS_COLOR[file.status] }} />
                  <div className={s.fileName}>{file.name}</div>
                  <div className={`${s.fileTag} ${s[file.status]}`}>{file.status}</div>
                </div>
                <div className={s.fileActions}>
                  <button className={`${s.actionBtn} ${s.unstage}`} onClick={() => unstage(file)}>
                    убрать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repository */}
        <div className={s.zone}>
          <div className={s.zoneHead}>
            <div className={s.zoneName} style={{ color: '#00e5a0' }}>Репозиторий (.git)</div>
            <div className={s.zoneCmd}>git commit → история</div>
          </div>
          <div className={s.zoneBody}>
            {commits.length === 0 && <div className={s.empty}>нет коммитов</div>}
            {[...commits].reverse().map((c, i) => (
              <div key={i} className={s.committed}>
                <div className={s.committedMsg}>"{c.message}"</div>
                <div className={s.committedFiles}>{c.files.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.commitPanel}>
        <input
          className={s.commitInput}
          placeholder='сообщение коммита...'
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
        <button
          className={s.commitBtn}
          onClick={commit}
          disabled={staging.length === 0 || !message.trim()}
        >
          git commit
        </button>
      </div>
    </div>
  );
}
