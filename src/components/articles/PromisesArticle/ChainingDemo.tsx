'use client';

import { useState, useRef } from 'react';
import s from './ChainingDemo.module.scss';

type StepStatus = 'idle' | 'active' | 'done' | 'skipped' | 'caught';

interface StepState {
  status: StepStatus;
  value: unknown;
  isError: boolean;
}

interface ChainStep {
  type: 'then' | 'catch';
  code: string;
}

const CHAIN_STEPS: ChainStep[] = [
  { type: 'then', code: 'x => x * 2' },
  { type: 'then', code: 'x => x - 3' },
  { type: 'then', code: 'x => { if (shouldThrow) throw new Error("chain error"); return x; }' },
  { type: 'catch', code: 'err => -1' },
  { type: 'then', code: 'x => "result: " + x' },
];

function getIconForStatus(status: StepStatus): string {
  switch (status) {
    case 'idle': return '●';
    case 'active': return '▶';
    case 'done': return '✓';
    case 'skipped': return '✗';
    case 'caught': return '◆';
  }
}

export function ChainingDemo() {
  const [startValue, setStartValue] = useState(5);
  const [shouldThrow, setShouldThrow] = useState(false);
  const [steps, setSteps] = useState<StepState[]>(
    CHAIN_STEPS.map(() => ({ status: 'idle', value: undefined, isError: false }))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<{ value: unknown; isError: boolean } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function computeStep(stepIndex: number, inputValue: unknown, inputIsError: boolean): { value: unknown; isError: boolean } {
    const step = CHAIN_STEPS[stepIndex];
    if (step.type === 'then') {
      if (inputIsError) {
        return { value: inputValue, isError: true };
      }
      try {
        const x = inputValue as number;
        let result: unknown;
        if (stepIndex === 0) result = x * 2;
        else if (stepIndex === 1) result = x - 3;
        else if (stepIndex === 2) {
          if (shouldThrow) throw new Error('chain error');
          result = x;
        } else {
          result = 'result: ' + x;
        }
        return { value: result, isError: false };
      } catch (err) {
        return { value: err instanceof Error ? err.message : String(err), isError: true };
      }
    } else {
      // catch
      if (inputIsError) {
        return { value: -1, isError: false };
      }
      return { value: inputValue, isError: false };
    }
  }

  function resolveStep(nextStep: number, currentSteps: StepState[]): { status: StepStatus; value: unknown; isError: boolean } {
    const step = CHAIN_STEPS[nextStep];
    let inputValue: unknown = startValue;
    let inputIsError = false;
    if (nextStep > 0) {
      for (let i = nextStep - 1; i >= 0; i--) {
        if (currentSteps[i].status !== 'idle') {
          inputValue = currentSteps[i].value;
          inputIsError = currentSteps[i].isError;
          break;
        }
      }
    }
    const { value, isError } = computeStep(nextStep, inputValue, inputIsError);
    if (step.type === 'then' && inputIsError) {
      return { status: 'skipped', value: inputValue, isError: true };
    } else if (step.type === 'catch' && inputIsError) {
      return { status: 'caught', value, isError: false };
    } else if (step.type === 'catch' && !inputIsError) {
      return { status: 'skipped', value: inputValue, isError: false };
    }
    return { status: 'done', value, isError };
  }

  function handleStep() {
    if (currentStep >= CHAIN_STEPS.length - 1) return;
    const nextStep = currentStep + 1;
    const resolved = resolveStep(nextStep, steps);
    const newSteps = steps.map((st, idx) =>
      idx === nextStep ? resolved : st
    );
    setSteps(newSteps);
    setCurrentStep(nextStep);
    if (nextStep === CHAIN_STEPS.length - 1) {
      setFinalResult({ value: resolved.value, isError: resolved.isError });
    }
  }

  function handleRun() {
    if (running) return;
    setRunning(true);

    let localStep = currentStep;
    let localSteps: StepState[] = steps.map((st) => ({ ...st }));

    const tick = () => {
      const nextStep = localStep + 1;
      if (nextStep >= CHAIN_STEPS.length) {
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const resolved = resolveStep(nextStep, localSteps);
      localSteps = localSteps.map((st, idx) => idx === nextStep ? resolved : st);
      localStep = nextStep;
      setSteps([...localSteps]);
      setCurrentStep(localStep);
      if (nextStep === CHAIN_STEPS.length - 1) {
        setFinalResult({ value: resolved.value, isError: resolved.isError });
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    intervalRef.current = setInterval(tick, 500);
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setCurrentStep(-1);
    setFinalResult(null);
    setSteps(CHAIN_STEPS.map(() => ({ status: 'idle', value: undefined, isError: false })));
  }

  const allDone = currentStep === CHAIN_STEPS.length - 1;

  function formatValue(val: unknown): string {
    if (val === undefined) return '';
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  return (
    <div className={s.demo}>
      <div className={s.header}>
        <span className={s.title}>// chain-demo</span>
        <div className={s.controls}>
          <button className={`${s.btn} ${s.primary}`} onClick={handleRun} disabled={running || allDone}>
            Run
          </button>
          <button className={`${s.btn} ${s.secondary}`} onClick={handleStep} disabled={running || allDone}>
            Step
          </button>
          <button className={s.btn} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className={s.configRow}>
        <label className={s.configLabel}>
          startValue:
          <input
            className={s.numberInput}
            type="number"
            value={startValue}
            onChange={(e) => setStartValue(Number(e.target.value))}
          />
        </label>
        <label className={s.checkboxLabel}>
          <input
            type="checkbox"
            checked={shouldThrow}
            onChange={(e) => setShouldThrow(e.target.checked)}
          />
          бросить ошибку на шаге 3
        </label>
      </div>

      <div className={s.stepsList}>
        {CHAIN_STEPS.map((step, idx) => {
          const st = steps[idx];
          const icon = getIconForStatus(st.status);
          const stepClass = s[st.status] || s.idle;
          const showValue = st.status !== 'idle';

          return (
            <div key={idx} className={`${s.step} ${stepClass}`}>
              <span className={s.stepIcon}>{icon}</span>
              <span className={`${s.stepBadge} ${s[step.type]}`}>.{step.type}</span>
              <span className={s.stepCode}>{step.code}</span>
              {showValue && (
                <span className={st.isError ? s.stepValueErr : s.stepValueOk}>
                  → {st.isError ? `Error: ${formatValue(st.value)}` : formatValue(st.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={s.footer}>
        {finalResult !== null ? (
          <div className={s.result}>
            <span className={s.resultLabel}>result:</span>
            <span style={{ color: finalResult.isError ? 'var(--error, #ff5f6a)' : undefined }}>
              {finalResult.isError ? `Error: ${formatValue(finalResult.value)}` : formatValue(finalResult.value)}
            </span>
          </div>
        ) : (
          <span className={s.resultLabel}>запусти цепочку →</span>
        )}
      </div>
    </div>
  );
}
