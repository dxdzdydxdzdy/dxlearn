'use client';

import { QuizBlock as Base } from '@/components/ui/QuizBlock/QuizBlock';
import { QUIZ_QUESTIONS } from './quizData';

export function QuizBlock() {
  return <Base questions={QUIZ_QUESTIONS} />;
}
