'use client';

import { useState, useRef, useEffect } from 'react';
import s from './ApiPlayground.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'completion' | 'streaming' | 'tools';
type ToolStep = 1 | 2 | 3 | 4;

// ── Streaming simulation ──────────────────────────────────────────────────────

const STREAM_TEXT =
  'Конечно! `async/await` — это синтаксический сахар поверх Promise. ' +
  'Вместо цепочки `.then()` ты пишешь код который выглядит синхронным, ' +
  'но не блокирует поток выполнения.\n\n' +
  '```js\n' +
  'async function fetchUser(id) {\n' +
  '  const res = await fetch(`/api/users/${id}`);\n' +
  '  const user = await res.json();\n' +
  '  return user;\n' +
  '}\n' +
  '```\n\n' +
  '`await` приостанавливает выполнение функции до разрешения Promise. ' +
  'При ошибке — бросает exception, лови через `try/catch`. ' +
  'Параллельные запросы — `await Promise.all([...])`.';

// ── Tool calling steps ────────────────────────────────────────────────────────

const TOOL_STEPS = [
  {
    step: 1,
    title: 'Отправляем запрос с tools',
    actor: 'Мы → API',
    color: '#4db8ff',
    json: `{
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "Какая погода в Москве?" }
  ],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Получить текущую погоду в городе",
      "parameters": {
        "type": "object",
        "properties": {
          "city": { "type": "string" }
        },
        "required": ["city"]
      }
    }
  }]
}`,
  },
  {
    step: 2,
    title: 'Модель просит вызвать функцию',
    actor: 'API → Мы',
    color: '#f0c040',
    json: `{
  "finish_reason": "tool_calls",
  "message": {
    "role": "assistant",
    "content": null,
    "tool_calls": [{
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\\"city\\": \\"Москва\\"}"
      }
    }]
  }
}`,
  },
  {
    step: 3,
    title: 'Вызываем функцию сами, возвращаем результат',
    actor: 'Мы → API',
    color: '#ff9070',
    json: `// Вызываем реальный weather API:
// const data = await weatherApi.get("Москва");

// Добавляем результат в messages:
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": "{\\"temp\\": -3, \\"condition\\": \\"снег\\", \\"wind\\": \\"15 км/ч\\"}"
}`,
  },
  {
    step: 4,
    title: 'Модель формирует финальный ответ',
    actor: 'API → Мы',
    color: '#00e5a0',
    json: `{
  "finish_reason": "stop",
  "message": {
    "role": "assistant",
    "content": "Сейчас в Москве −3°C, идёт снег,
ветер 15 км/ч. Оденьтесь потеплее!"
  },
  "usage": {
    "prompt_tokens": 287,
    "completion_tokens": 28,
    "total_tokens": 315
  }
}`,
  },
];

// ── Completion Tab ────────────────────────────────────────────────────────────

function CompletionTab() {
  const [model, setModel] = useState('gpt-4o');
  const [temp, setTemp] = useState(0.7);
  const [message, setMessage] = useState('Объясни разницу между == и === в JavaScript');
  const [sent, setSent] = useState(false);

  const responses: Record<string, string> = {
    default:
      '`==` (нестрогое равенство) приводит типы перед сравнением:\n`"5" == 5` → `true` (строка привелась к числу)\n`null == undefined` → `true`\n\n`===` (строгое равенство) не приводит типы:\n`"5" === 5` → `false`\n`null === undefined` → `false`\n\n**Правило:** всегда используй `===`. Исключение — проверка `null || undefined` через `== null`.',
  };

  const usage = {
    prompt_tokens: Math.floor(message.length / 4) + 42,
    completion_tokens: 87,
    total_tokens: Math.floor(message.length / 4) + 129,
  };

  return (
    <div className={s.tabBody}>
      <div className={s.splitPane}>
        {/* Request */}
        <div className={s.pane}>
          <div className={s.paneHeader}>
            <span className={s.paneTitle}>REQUEST</span>
            <span className={s.paneHint}>POST /v1/chat/completions</span>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>model</label>
            <select className={s.select} value={model} onChange={e => setModel(e.target.value)}>
              <option>gpt-4o</option>
              <option>gpt-4o-mini</option>
              <option>claude-3-5-sonnet-20241022</option>
            </select>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>temperature = {temp.toFixed(1)}</label>
            <input
              type="range" min={0} max={2} step={0.1} value={temp}
              onChange={e => setTemp(parseFloat(e.target.value))}
              className={s.tempSlider}
            />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>messages[0].content</label>
            <textarea
              className={s.textarea}
              value={message}
              onChange={e => { setMessage(e.target.value); setSent(false); }}
              rows={3}
            />
          </div>
          <button className={s.sendBtn} onClick={() => setSent(true)}>
            Отправить →
          </button>
        </div>

        {/* Response */}
        <div className={s.pane}>
          <div className={s.paneHeader}>
            <span className={s.paneTitle}>RESPONSE</span>
            {sent && <span className={s.statusOk}>200 OK</span>}
          </div>
          {sent ? (
            <div className={s.responseJson}>
              <pre>{`{
  "id": "chatcmpl-xyz",
  "model": "${model}",
  "choices": [{
    "finish_reason": "stop",
    "message": {
      "role": "assistant",
      "content": `}<span className={s.jsonStr}>{`"${responses.default.replace(/\n/g, '\\n').slice(0, 60)}..."`}</span>{`
    }
  }],
  "usage": {
    "prompt_tokens": `}<span className={s.jsonNum}>{usage.prompt_tokens}</span>{`,
    "completion_tokens": `}<span className={s.jsonNum}>{usage.completion_tokens}</span>{`,
    "total_tokens": `}<span className={s.jsonNum}>{usage.total_tokens}</span>{`
  }
}`}</pre>
              <div className={s.responseContent}>
                <div className={s.responseLabel}>message.content</div>
                <div className={s.responseText}>{responses.default}</div>
              </div>
            </div>
          ) : (
            <div className={s.emptyPane}>← нажми «Отправить»</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Streaming Tab ─────────────────────────────────────────────────────────────

function StreamingTab() {
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done'>('idle');
  const [displayed, setDisplayed] = useState('');
  const [chunks, setChunks] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charRef = useRef(0);

  function startStream() {
    if (status === 'streaming') return;
    setStatus('streaming');
    setDisplayed('');
    setChunks([]);
    charRef.current = 0;

    intervalRef.current = setInterval(() => {
      const speed = 3;
      const end = Math.min(charRef.current + speed, STREAM_TEXT.length);
      const slice = STREAM_TEXT.slice(charRef.current, end);
      charRef.current = end;

      setDisplayed(prev => prev + slice);
      if (slice) {
        setChunks(prev => [...prev.slice(-6), JSON.stringify({ delta: { content: slice } })]);
      }

      if (charRef.current >= STREAM_TEXT.length) {
        clearInterval(intervalRef.current!);
        setStatus('done');
        setChunks(prev => [...prev.slice(-6), '{"finish_reason":"stop"}']);
      }
    }, 40);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('idle');
    setDisplayed('');
    setChunks([]);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className={s.tabBody}>
      <div className={s.streamLayout}>
        {/* Code */}
        <div className={s.streamCode}>
          <div className={s.paneHeader}>
            <span className={s.paneTitle}>КОД</span>
          </div>
          <pre className={s.codePre}>{
`// OpenAI
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  stream: true,          // ← включаем стриминг
  messages: [{ role: 'user', content: 'Объясни async/await' }],
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? '';
  process.stdout.write(delta);   // или res.write(delta) в API
}

// Anthropic
const stream = await anthropic.messages.stream({
  model: 'claude-3-5-sonnet-20241022',
  messages: [{ role: 'user', content: 'Объясни async/await' }],
  max_tokens: 1024,
});

for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    process.stdout.write(event.delta.text);
  }
}`}</pre>
        </div>

        {/* Live output */}
        <div className={s.streamRight}>
          <div className={s.streamOutput}>
            <div className={s.paneHeader}>
              <span className={s.paneTitle}>ВЫВОД</span>
              {status === 'streaming' && <span className={s.streamingBadge}>● streaming</span>}
              {status === 'done' && <span className={s.doneBadge}>✓ done</span>}
            </div>
            <div className={s.streamText}>
              {displayed || <span className={s.emptyPane}>← нажми «Start Stream»</span>}
              {status === 'streaming' && <span className={s.cursor}>▌</span>}
            </div>
          </div>

          <div className={s.sseLog}>
            <div className={s.paneHeader}>
              <span className={s.paneTitle}>SSE CHUNKS</span>
              <span className={s.paneHint}>последние события</span>
            </div>
            <div className={s.sseLines}>
              {chunks.length === 0
                ? <span className={s.emptyPane}>события появятся здесь</span>
                : chunks.map((c, i) => (
                  <div key={i} className={s.sseLine}>
                    <span className={s.ssePrefix}>data: </span>
                    <span className={s.sseData}>{c}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className={s.streamBtns}>
            <button className={s.sendBtn} onClick={startStream} disabled={status === 'streaming'}>
              {status === 'idle' ? 'Start Stream' : status === 'streaming' ? 'Streaming...' : 'Start Stream'}
            </button>
            {status !== 'idle' && (
              <button className={s.resetBtn} onClick={reset}>Сбросить</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tools Tab ─────────────────────────────────────────────────────────────────

function ToolsTab() {
  const [step, setStep] = useState<ToolStep>(1);

  const current = TOOL_STEPS[step - 1];

  return (
    <div className={s.tabBody}>
      {/* Step indicators */}
      <div className={s.toolSteps}>
        {TOOL_STEPS.map(ts => (
          <button
            key={ts.step}
            className={`${s.toolStep} ${step === ts.step ? s.toolStepActive : ''}`}
            style={step === ts.step ? { borderColor: ts.color, color: ts.color } : {}}
            onClick={() => setStep(ts.step as ToolStep)}
          >
            <span className={s.toolStepNum}>{ts.step}</span>
            <span className={s.toolStepTitle}>{ts.title}</span>
          </button>
        ))}
      </div>

      {/* Current step */}
      <div className={s.toolContent}>
        <div className={s.toolHeader}>
          <span className={s.toolActor} style={{ color: current.color }}>{current.actor}</span>
          <span className={s.toolTitle}>{current.title}</span>
        </div>
        <pre className={s.toolJson}>{current.json}</pre>

        <div className={s.toolNav}>
          {step > 1 && (
            <button className={s.navBtn} onClick={() => setStep(s => (s - 1) as ToolStep)}>← Назад</button>
          )}
          {step < 4 && (
            <button className={s.sendBtn} onClick={() => setStep(s => (s + 1) as ToolStep)}>
              Далее →
            </button>
          )}
          {step === 4 && (
            <button className={s.sendBtn} onClick={() => setStep(1)}>Начать снова</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ApiPlayground() {
  const [tab, setTab] = useState<Tab>('completion');

  return (
    <div className={s.playground}>
      <div className={s.tabs}>
        {([
          ['completion', 'Запрос / Ответ'],
          ['streaming',  'Streaming'],
          ['tools',      'Tool Calling'],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            className={`${s.tab} ${tab === id ? s.tabActive : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'completion' && <CompletionTab />}
      {tab === 'streaming'  && <StreamingTab />}
      {tab === 'tools'      && <ToolsTab />}
    </div>
  );
}
