'use client';

import { useState } from 'react';
import s from './ConflictResolver.module.scss';

// ── Data ─────────────────────────────────────────────────────────────────────

type Resolution = 'ours' | 'theirs' | null;

interface ConflictBlock {
  id: string;
  ours:   string[];
  theirs: string[];
}

interface FilePart {
  kind: 'code' | 'conflict';
  lines?: string[];
  conflict?: ConflictBlock;
}

const FILE_PARTS: FilePart[] = [
  {
    kind: 'code',
    lines: [
      'import { logger } from "./logger";',
      'import { db     } from "./db";',
      '',
    ],
  },
  {
    kind: 'conflict',
    conflict: {
      id: 'c1',
      ours:   ['function authenticate(user) {', '  if (!user.token) return false;'],
      theirs: ['async function authenticate(user) {', '  if (!user || !user.token) return false;'],
    },
  },
  {
    kind: 'code',
    lines: [
      '  const valid = checkToken(user.token);',
    ],
  },
  {
    kind: 'conflict',
    conflict: {
      id: 'c2',
      ours:   ['  return valid;', '}'],
      theirs: ['  logger.info(`auth: ${user.id}`);', '  return valid;', '}'],
    },
  },
];

const ALL_CONFLICTS = FILE_PARTS
  .filter(p => p.kind === 'conflict')
  .map(p => p.conflict!);

// ── Component ─────────────────────────────────────────────────────────────────

export function ConflictResolver() {
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({});

  const resolve = (id: string, choice: Resolution) =>
    setResolutions(prev => ({ ...prev, [id]: choice }));

  const totalConflicts = ALL_CONFLICTS.length;
  const resolvedCount  = Object.values(resolutions).filter(Boolean).length;
  const allResolved    = resolvedCount === totalConflicts;

  // Build final file lines
  const finalLines: string[] = [];
  for (const part of FILE_PARTS) {
    if (part.kind === 'code') {
      finalLines.push(...(part.lines ?? []));
    } else {
      const { id, ours, theirs } = part.conflict!;
      const r = resolutions[id];
      if (!r) {
        finalLines.push('// ← конфликт не разрешён');
      } else if (r === 'ours') {
        finalLines.push(...ours);
      } else {
        finalLines.push(...theirs);
      }
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.topBar}>
        <span className={s.filename}>auth.js</span>
        <span className={s.status}>
          {allResolved
            ? <span className={s.ok}>✓ все конфликты разрешены</span>
            : <span className={s.remaining}>{totalConflicts - resolvedCount} конфликт{totalConflicts - resolvedCount === 1 ? '' : 'а'} не разрешено</span>
          }
        </span>
      </div>

      <div className={s.body}>
        {/* ── Left: file with conflicts ── */}
        <div className={s.filePane}>
          <div className={s.paneTitle}>// файл с конфликтами</div>
          <div className={s.fileContent}>
            {FILE_PARTS.map((part, pi) => {
              if (part.kind === 'code') {
                return (
                  <div key={pi} className={s.codeBlock}>
                    {part.lines!.map((line, li) => (
                      <div key={li} className={s.codeLine}>
                        <span className={s.lineNo}>{getLineNo(pi, li)}</span>
                        <span className={s.lineText}>{line || ' '}</span>
                      </div>
                    ))}
                  </div>
                );
              }

              const { id, ours, theirs } = part.conflict!;
              const r = resolutions[id];
              const resolved = r !== undefined && r !== null;

              return (
                <div key={pi} className={`${s.conflictBlock} ${resolved ? s.conflictResolved : ''}`}>
                  {!resolved ? (
                    <>
                      <div className={s.conflictMarker} data-side="ours">
                        {'<<<<<<< HEAD (main)'}
                      </div>
                      {ours.map((l, i) => (
                        <div key={i} className={`${s.codeLine} ${s.oursLine}`}>
                          <span className={s.lineNo} />
                          <span className={s.lineText}>{l}</span>
                        </div>
                      ))}
                      <div className={s.conflictSep}>{'======='}</div>
                      {theirs.map((l, i) => (
                        <div key={i} className={`${s.codeLine} ${s.theirsLine}`}>
                          <span className={s.lineNo} />
                          <span className={s.lineText}>{l}</span>
                        </div>
                      ))}
                      <div className={s.conflictMarker} data-side="theirs">
                        {'>>>>>>> feature/auth-update'}
                      </div>
                      <div className={s.actions}>
                        <button
                          className={`${s.actionBtn} ${s.oursBtn}`}
                          onClick={() => resolve(id, 'ours')}
                        >
                          ← оставить наш (main)
                        </button>
                        <button
                          className={`${s.actionBtn} ${s.theirsBtn}`}
                          onClick={() => resolve(id, 'theirs')}
                        >
                          оставить их (feature) →
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={s.resolvedLabel}>
                        ✓ разрешено: {r === 'ours' ? 'наш вариант (main)' : 'их вариант (feature)'}
                        <button
                          className={s.undoBtn}
                          onClick={() => resolve(id, null)}
                        >
                          отменить
                        </button>
                      </div>
                      {(r === 'ours' ? ours : theirs).map((l, i) => (
                        <div key={i} className={`${s.codeLine} ${s.resolvedLine}`}>
                          <span className={s.lineNo} />
                          <span className={s.lineText}>{l}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: result ── */}
        <div className={s.resultPane}>
          <div className={s.paneTitle}>// результат</div>
          <div className={s.resultContent}>
            {finalLines.map((line, i) => (
              <div key={i} className={`${s.codeLine} ${line.startsWith('//') ? s.placeholder : ''}`}>
                <span className={s.lineNo}>{i + 1}</span>
                <span className={s.lineText}>{line || ' '}</span>
              </div>
            ))}
          </div>

          {allResolved && (
            <div className={s.done}>
              <div className={s.doneTitle}>Конфликт разрешён. Дальше:</div>
              <div className={s.doneCode}>
                {'$ git add auth.js'}
                <br />
                {'$ git commit'}
                <br />
                {'# Git откроет редактор с сообщением'}
                <br />
                {'# "Merge branch feature/auth-update"'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLineNo(partIndex: number, lineIndex: number): number {
  let n = 0;
  for (let i = 0; i < partIndex; i++) {
    const p = FILE_PARTS[i];
    if (p.kind === 'code') n += p.lines!.length;
    else n += (p.conflict!.ours.length + p.conflict!.theirs.length + 4);
  }
  return n + lineIndex + 1;
}
