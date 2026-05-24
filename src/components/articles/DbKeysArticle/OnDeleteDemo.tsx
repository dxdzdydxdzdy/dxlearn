'use client';

import { useState } from 'react';
import s from './OnDeleteDemo.module.scss';

type Action   = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
type RowState = 'normal' | 'deleted' | 'nulled';

const DEPTS = [
  { id: 1, name: 'Инженеры' },
  { id: 2, name: 'Маркетинг' },
];

const USERS = [
  { id: 1, name: 'Алексей', dept_id: 1 },
  { id: 2, name: 'Мария',   dept_id: 1 },
  { id: 3, name: 'Иван',    dept_id: 2 },
];

const ACTIONS: Action[] = ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'];

interface State {
  deptDeleted: boolean;
  userStates: Record<number, RowState>;
  userDeptIds: Record<number, number | null>;
  error: string;
  done: boolean;
}

const INIT: State = {
  deptDeleted: false,
  userStates:  { 1: 'normal', 2: 'normal', 3: 'normal' },
  userDeptIds: { 1: 1, 2: 1, 3: 2 },
  error: '',
  done: false,
};

export function OnDeleteDemo() {
  const [action, setAction] = useState<Action>('CASCADE');
  const [st, setSt] = useState<State>({ ...INIT, userStates: { ...INIT.userStates }, userDeptIds: { ...INIT.userDeptIds } });

  function reset() {
    setSt({ deptDeleted: false, userStates: { 1: 'normal', 2: 'normal', 3: 'normal' }, userDeptIds: { 1: 1, 2: 1, 3: 2 }, error: '', done: false });
  }

  function switchAction(a: Action) {
    setAction(a);
    setSt({ deptDeleted: false, userStates: { 1: 'normal', 2: 'normal', 3: 'normal' }, userDeptIds: { 1: 1, 2: 1, 3: 2 }, error: '', done: false });
  }

  function deleteDept() {
    if (st.done) return;

    if (action === 'CASCADE') {
      setSt({ deptDeleted: true, userStates: { 1: 'deleted', 2: 'deleted', 3: 'normal' }, userDeptIds: { 1: 1, 2: 1, 3: 2 }, error: '', done: true });
    } else if (action === 'SET NULL') {
      setSt({ deptDeleted: true, userStates: { 1: 'nulled', 2: 'nulled', 3: 'normal' }, userDeptIds: { 1: null, 2: null, 3: 2 }, error: '', done: true });
    } else {
      setSt(prev => ({
        ...prev,
        error:
          `ERROR:  update or delete on table "departments" violates foreign key\n` +
          `        constraint "users_dept_id_fkey" on table "users"\n` +
          `DETAIL: Key (id)=(1) is still referenced from table "users".`,
      }));
    }
  }

  return (
    <div className={s.root}>

      {/* Action selector */}
      <div>
        <div className={s.label}>ON DELETE</div>
        <div className={s.actions}>
          {ACTIONS.map(a => (
            <button
              key={a}
              className={`${s.actionBtn} ${action === a ? s.actionBtnActive : ''}`}
              onClick={() => switchAction(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Tables */}
      <div className={s.tables}>

        {/* departments */}
        <div className={s.tableCard}>
          <div className={s.tableTitle}>departments (родитель)</div>
          <div className={`${s.tableHead} ${s.depsHead}`}>
            <span className={s.th}>id</span>
            <span className={s.th}>name</span>
          </div>
          <div className={s.tableBody}>
            {DEPTS.map(d => (
              <div
                key={d.id}
                className={`${s.row} ${s.depsRow} ${st.deptDeleted && d.id === 1 ? s.rowDeleted : ''}`}
              >
                <span className={`${s.cell} ${s.cellKey}`}>{d.id}</span>
                <span className={s.cell}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* arrow */}
        <div className={s.arrow}>→</div>

        {/* users */}
        <div className={s.tableCard}>
          <div className={s.tableTitle}>users (дочерняя)</div>
          <div className={`${s.tableHead} ${s.usersHead}`}>
            <span className={s.th}>id</span>
            <span className={s.th}>name</span>
            <span className={s.th}>dept_id</span>
          </div>
          <div className={s.tableBody}>
            {USERS.map(u => {
              const rs      = st.userStates[u.id];
              const deptVal = st.userDeptIds[u.id];
              return (
                <div
                  key={u.id}
                  className={`${s.row} ${s.usersRow} ${rs === 'deleted' ? s.rowDeleted : rs === 'nulled' ? s.rowAffected : ''}`}
                >
                  <span className={`${s.cell} ${s.cellKey}`}>{u.id}</span>
                  <span className={s.cell}>{u.name}</span>
                  <span className={`${s.cell} ${deptVal === null ? s.cellNull : ''}`}>
                    {deptVal === null ? 'NULL' : deptVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={s.controls}>
        <button className={s.deleteBtn} onClick={deleteDept} disabled={st.done}>
          DELETE FROM departments WHERE id = 1
        </button>
        <button className={s.resetBtn} onClick={reset}>
          reset
        </button>
      </div>

      {/* Result */}
      {st.error && (
        <div className={s.error}>{st.error}</div>
      )}
      {st.done && action === 'CASCADE' && (
        <div className={s.success}>
          {'-- строки Алексей и Мария зачёркнуты → удалены вместе с отделом\n-- в таблице users остался только Иван (dept_id = 2)'}
        </div>
      )}
      {st.done && action === 'SET NULL' && (
        <div className={s.success}>
          {'-- отдел удалён, dept_id у Алексея и Марии → NULL\n-- данные сотрудников сохранены, связь разорвана'}
        </div>
      )}
    </div>
  );
}
