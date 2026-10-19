import { getMode } from '../config/modes';
import type { MissionConfig, Question, QuestionHistoryEntry } from './types';

export interface PreparedQuestion {
  question: Question;
  /** Answers in display order (shuffled, except true/false). */
  answers: string[];
}

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Sort so unseen / rarely seen questions come first, random among equals. */
function freshnessOrder(questions: Question[], history: Record<string, QuestionHistoryEntry>, rng: Rng) {
  return shuffle(questions, rng).sort((a, b) => (history[a.id]?.seen ?? 0) - (history[b.id]?.seen ?? 0));
}

/**
 * Picks questions for a mission. Prefers the exact category + difficulty,
 * then widens (other difficulties, then other categories) so a mission is
 * always playable even with a small question bank.
 */
export function selectQuestions(
  config: MissionConfig,
  bank: Question[],
  history: Record<string, QuestionHistoryEntry>,
  count: number,
  rng: Rng = Math.random,
): Question[] {
  const mode = getMode(config.mode);
  const ofType = bank.filter((q) => mode.questionTypes.includes(q.type));
  const inCategory = (q: Question) => config.category === 'all' || q.category === config.category;

  const tiers: Question[][] = [
    ofType.filter((q) => inCategory(q) && q.difficulty === config.difficulty),
    ofType.filter((q) => inCategory(q) && q.difficulty !== config.difficulty),
    ofType.filter((q) => !inCategory(q) && q.difficulty === config.difficulty),
    ofType.filter((q) => !inCategory(q) && q.difficulty !== config.difficulty),
  ];

  const result: Question[] = [];
  for (const tier of tiers) {
    for (const q of freshnessOrder(tier, history, rng)) {
      if (result.length >= count) return result;
      result.push(q);
    }
  }
  return result;
}

export function prepareQuestion(question: Question, rng: Rng = Math.random): PreparedQuestion {
  const answers = question.type === 'true-false' ? [...question.answers] : shuffle(question.answers, rng);
  return { question, answers };
}

/** Spider Sense: pick two wrong answers to hide (never the correct one). */
export function pickAnswersToRemove(
  prepared: PreparedQuestion,
  alreadyHidden: string[],
  rng: Rng = Math.random,
): string[] {
  const wrong = prepared.answers.filter(
    (a) => a !== prepared.question.correctAnswer && !alreadyHidden.includes(a),
  );
  return shuffle(wrong, rng).slice(0, 2);
}

/** Validates the question bank; returns a list of problems (empty = OK). */
export function validateQuestionBank(bank: Question[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) problems.push(`Duplicate id: ${q.id}`);
    ids.add(q.id);
    if (!q.answers.includes(q.correctAnswer)) problems.push(`${q.id}: correctAnswer is not one of the answers`);
    if (new Set(q.answers).size !== q.answers.length) problems.push(`${q.id}: duplicate answers`);
    if (q.type === 'true-false' && q.answers.length !== 2) problems.push(`${q.id}: true-false needs 2 answers`);
    if (q.type !== 'true-false' && q.answers.length !== 4) problems.push(`${q.id}: needs 4 answers`);
    if ((q.type === 'who-am-i' || q.type === 'mystery') && !(q.hints && q.hints.length >= 2))
      problems.push(`${q.id}: needs at least 2 hints`);
    if (!q.explanation.trim()) problems.push(`${q.id}: missing explanation`);
  }
  return problems;
}
