'use client';

import { useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import s from './QuizBlock.module.scss';

hljs.registerLanguage('javascript', javascript);

export interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code?: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Props {
  questions: QuizQuestion[];
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function getFeedback(score: number, total: number): string {
  const pct = score / total;
  if (pct === 1) return 'Отлично! Без единой ошибки.';
  if (pct >= 0.8) return 'Почти идеально. Перечитай объяснения к ошибкам.';
  if (pct >= 0.5) return 'Неплохо, но ещё есть над чем поработать.';
  return 'Стоит перечитать статью ещё раз.';
}

export function QuizBlock({ questions }: Props) {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [done, setDone] = useState(false);

  const question = questions[questionIdx];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.correct;

  const highlighted = question.code
    ? hljs.highlight(question.code.trim(), { language: 'javascript' }).value
    : null;

  function handleSelect(idx: number) {
    if (isAnswered) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[questionIdx] = idx;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (questionIdx < questions.length - 1) {
      setQuestionIdx((i) => i + 1);
      setSelected(answers[questionIdx + 1]);
    } else {
      setDone(true);
    }
  }

  function handleRetry() {
    setQuestionIdx(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setDone(false);
  }

  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const progress = ((questionIdx + (isAnswered ? 1 : 0)) / questions.length) * 100;

  if (done) {
    return (
      <div className={s.quiz}>
        <div className={s.header}>
          <span className={s.headerTitle}>// self-check</span>
          <span className={s.counter}>результат</span>
        </div>
        <div className={s.progress}><div className={s.progressFill} style={{ width: '100%' }} /></div>
        <div className={s.scoreScreen}>
          <div className={s.scoreTitle}>Самопроверка завершена</div>
          <div>
            <div className={s.scoreNum}>{score}</div>
            <div className={s.scoreTotal}>из {questions.length}</div>
          </div>
          <p className={s.scoreFeedback}>{getFeedback(score, questions.length)}</p>
          <button className={s.retryBtn} onClick={handleRetry}>← пройти снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.quiz}>
      <div className={s.header}>
        <span className={s.headerTitle}>// self-check</span>
        <div className={s.headerMeta}>
          <span className={`${s.diffBadge} ${s[question.difficulty]}`}>{question.difficulty}</span>
          <span className={s.counter}>{questionIdx + 1} / {questions.length}</span>
        </div>
      </div>

      <div className={s.progress}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={s.body}>
        <p className={s.question}>{question.question}</p>

        {highlighted && (
          <div className={s.codeWrapper}>
            <pre className={s.codePre}>
              <code
                className="hljs language-javascript"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          </div>
        )}

        <div className={s.options}>
          {question.options.map((opt, i) => {
            let cls = s.option;
            if (isAnswered) {
              cls += ` ${s.answered}`;
              if (i === question.correct) cls += ` ${s.correct}`;
              else if (i === selected) cls += ` ${s.wrong}`;
            } else if (i === selected) {
              cls += ` ${s.selected}`;
            }

            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)}>
                <span className={s.optionKey}>{OPTION_KEYS[i]}</span>
                <span className={s.optionLabel}>{opt}</span>
                {isAnswered && i === question.correct && <em className={s.optionIcon}>✓</em>}
                {isAnswered && i === selected && i !== question.correct && (
                  <em className={s.optionIcon}>✗</em>
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`${s.explanation} ${isCorrect ? s.correct : s.wrong}`}>
            <span className={s.expLabel}>{isCorrect ? '◆ верно' : '◆ неверно'}</span>
            {question.explanation}
          </div>
        )}
      </div>

      <div className={s.footer}>
        <span className={s.footerHint}>
          {isAnswered
            ? questionIdx < questions.length - 1
              ? 'жми дальше'
              : 'последний вопрос'
            : 'выбери ответ'}
        </span>
        <button className={s.nextBtn} onClick={handleNext} disabled={!isAnswered}>
          {questionIdx < questions.length - 1 ? 'дальше →' : 'результат →'}
        </button>
      </div>
    </div>
  );
}
