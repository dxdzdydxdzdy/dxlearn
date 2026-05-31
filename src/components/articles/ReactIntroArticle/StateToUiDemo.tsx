'use client';

import { useState } from 'react';
import s from './StateToUiDemo.module.scss';

interface AppState {
  name: string;
  messages: number;
  online: boolean;
}

const INITIAL: AppState = { name: 'Алиса', messages: 5, online: true };

export function StateToUiDemo() {
  const [st, setSt] = useState<AppState>(INITIAL);

  return (
    <div className={s.wrap}>

      <div className={s.panels}>

        {/* ── LEFT: State ── */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelLabel}>// state</span>
            <span className={s.panelHint}>редактируй</span>
          </div>

          <div className={s.fields}>
            <label className={s.field}>
              <span className={s.fieldKey}>name</span>
              <span className={s.fieldType}>string</span>
              <input
                className={s.fieldInput}
                value={st.name}
                maxLength={20}
                onChange={e => setSt(p => ({ ...p, name: e.target.value }))}
              />
            </label>

            <label className={s.field}>
              <span className={s.fieldKey}>messages</span>
              <span className={s.fieldType}>number</span>
              <div className={s.numControls}>
                <button
                  className={s.numBtn}
                  onClick={() => setSt(p => ({ ...p, messages: Math.max(0, p.messages - 1) }))}
                >−</button>
                <span className={s.numVal}>{st.messages}</span>
                <button
                  className={s.numBtn}
                  onClick={() => setSt(p => ({ ...p, messages: p.messages + 1 }))}
                >+</button>
              </div>
            </label>

            <label className={s.field}>
              <span className={s.fieldKey}>online</span>
              <span className={s.fieldType}>boolean</span>
              <button
                className={`${s.toggle} ${st.online ? s.toggleOn : s.toggleOff}`}
                onClick={() => setSt(p => ({ ...p, online: !p.online }))}
              >
                {st.online ? 'true' : 'false'}
              </button>
            </label>
          </div>

          <div className={s.stateCode}>
            <span className={s.codeComment}>{'// текущее состояние'}</span>
            <span className={s.codeLine}><span className={s.codeKey}>{'{'}</span></span>
            <span className={s.codeLine}>{'  '}
              <span className={s.codeKey}>name</span>
              <span className={s.codePunct}>: </span>
              <span className={s.codeStr}>"{st.name || '…'}"</span>
              <span className={s.codePunct}>,</span>
            </span>
            <span className={s.codeLine}>{'  '}
              <span className={s.codeKey}>messages</span>
              <span className={s.codePunct}>: </span>
              <span className={s.codeNum}>{st.messages}</span>
              <span className={s.codePunct}>,</span>
            </span>
            <span className={s.codeLine}>{'  '}
              <span className={s.codeKey}>online</span>
              <span className={s.codePunct}>: </span>
              <span className={st.online ? s.codeTrue : s.codeFalse}>{st.online ? 'true' : 'false'}</span>
            </span>
            <span className={s.codeLine}><span className={s.codeKey}>{'}'}</span></span>
          </div>
        </div>

        {/* ── Arrow ── */}
        <div className={s.arrow}>
          <div className={s.arrowLine} />
          <div className={s.arrowLabel}>React</div>
          <div className={s.arrowLine} />
        </div>

        {/* ── RIGHT: UI ── */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <span className={s.panelLabel}>// ui</span>
            <span className={s.panelHint}>обновляется автоматически</span>
          </div>

          <div className={s.uiCard} key={`${st.name}${st.messages}${st.online}`}>
            <div className={s.uiAvatar}>
              {(st.name || '?')[0].toUpperCase()}
            </div>
            <div className={s.uiBody}>
              <div className={s.uiName}>
                {st.name || <span className={s.uiEmpty}>введи имя…</span>}
              </div>
              <div className={s.uiStatus}>
                <span className={`${s.uiDot} ${st.online ? s.uiDotOn : s.uiDotOff}`} />
                {st.online ? 'онлайн' : 'офлайн'}
              </div>
              {st.messages > 0 && (
                <div className={s.uiMsgs}>
                  <span className={s.uiBadge}>{st.messages}</span>
                  {' '}
                  {st.messages === 1 ? 'сообщение' :
                   st.messages < 5 ? 'сообщения' : 'сообщений'}
                </div>
              )}
            </div>
          </div>

          <div className={s.noCodeNote}>
            <span className={s.noCodeIcon}>↑</span>
            <span>
              Никакого <code>document.getElementById</code>.
              Ты описываешь <em>что</em> должно быть — React сам обновляет DOM.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
