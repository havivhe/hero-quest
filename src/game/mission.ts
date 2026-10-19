/**
 * Mission state machine. Pure functions only – the Game screen holds the
 * state in React and applies side effects (saving, sounds) from the outcomes.
 */
import { getMode } from '../config/modes';
import { TIME_BOOST_SECONDS } from '../config/powers';
import { pickAnswersToRemove, prepareQuestion, selectQuestions, type PreparedQuestion, type Rng } from './engine';
import { calculateCorrectReward, type Reward } from './scoring';
import type { MissionConfig, Question, QuestionHistoryEntry } from './types';

export type MissionPhase = 'answering' | 'feedback' | 'finished';

export interface AnswerFeedback {
  correct: boolean;
  selected: string;
  reward: Reward | null;
}

export interface MissionState {
  config: MissionConfig;
  /** Questions for the mission. Timed modes may cycle through them. */
  pool: Question[];
  current: PreparedQuestion;
  /** How many questions have been shown (1-based index of current). */
  questionNumber: number;
  /** Fixed mission length, or null for timed modes. */
  totalQuestions: number | null;
  phase: MissionPhase;
  score: number;
  correctCount: number;
  answeredCount: number;
  streak: number;
  bestStreak: number;
  xpEarned: number;
  coinsEarned: number;
  /** Answers hidden by Spider Sense. */
  hiddenAnswers: string[];
  /** Wrong answers already tried (thanks to Second Chance). */
  triedAnswers: string[];
  hintsRevealed: number;
  secondChanceArmed: boolean;
  /** Timestamp (ms) when the current question appeared – for speed bonus. */
  questionShownAt: number;
  /** Remaining mission time in ms (timed modes only). */
  timeLeftMs: number | null;
  feedback: AnswerFeedback | null;
}

export function createMission(
  config: MissionConfig,
  bank: Question[],
  history: Record<string, QuestionHistoryEntry>,
  now: number,
  rng: Rng = Math.random,
): MissionState | null {
  const mode = getMode(config.mode);
  const timed = mode.timeLimitSec != null;
  const pool = selectQuestions(config, bank, history, timed ? bank.length : mode.missionLength, rng);
  if (pool.length === 0) return null;
  return {
    config,
    pool,
    current: prepareQuestion(pool[0], rng),
    questionNumber: 1,
    totalQuestions: timed ? null : pool.length,
    phase: 'answering',
    score: 0,
    correctCount: 0,
    answeredCount: 0,
    streak: 0,
    bestStreak: 0,
    xpEarned: 0,
    coinsEarned: 0,
    hiddenAnswers: [],
    triedAnswers: [],
    hintsRevealed: 1,
    secondChanceArmed: false,
    questionShownAt: now,
    timeLeftMs: timed ? mode.timeLimitSec! * 1000 : null,
    feedback: null,
  };
}

export type AnswerOutcome =
  | { kind: 'correct'; reward: Reward }
  | { kind: 'retry' }
  | { kind: 'wrong' }
  | { kind: 'ignored' };

export function answerQuestion(
  state: MissionState,
  selected: string,
  now: number,
): { state: MissionState; outcome: AnswerOutcome } {
  if (state.phase !== 'answering' || state.triedAnswers.includes(selected) || state.hiddenAnswers.includes(selected)) {
    return { state, outcome: { kind: 'ignored' } };
  }
  const q = state.current.question;
  const mode = getMode(state.config.mode);

  if (selected === q.correctAnswer) {
    const streak = state.streak + 1;
    const reward = calculateCorrectReward({
      basePoints: q.basePoints,
      streak,
      answerTimeSec: mode.speedBonus ? (now - state.questionShownAt) / 1000 : null,
      hintsRevealed: q.type === 'who-am-i' ? state.hintsRevealed : null,
    });
    return {
      outcome: { kind: 'correct', reward },
      state: {
        ...state,
        phase: 'feedback',
        score: state.score + reward.points,
        correctCount: state.correctCount + 1,
        answeredCount: state.answeredCount + 1,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        xpEarned: state.xpEarned + reward.xp,
        coinsEarned: state.coinsEarned + reward.coins,
        feedback: { correct: true, selected, reward },
      },
    };
  }

  // Wrong answer, but a Second Chance is armed: let them try again.
  if (state.secondChanceArmed) {
    return {
      outcome: { kind: 'retry' },
      state: { ...state, secondChanceArmed: false, triedAnswers: [...state.triedAnswers, selected] },
    };
  }

  return {
    outcome: { kind: 'wrong' },
    state: {
      ...state,
      phase: 'feedback',
      answeredCount: state.answeredCount + 1,
      streak: 0,
      feedback: { correct: false, selected, reward: null },
    },
  };
}

/** Move to the next question, or finish the mission. */
export function nextQuestion(state: MissionState, now: number, rng: Rng = Math.random): MissionState {
  if (state.phase === 'finished') return state;
  const isLast = state.totalQuestions != null && state.questionNumber >= state.totalQuestions;
  if (isLast || (state.timeLeftMs != null && state.timeLeftMs <= 0)) {
    return { ...state, phase: 'finished' };
  }
  const nextIndex = state.questionNumber % state.pool.length; // timed modes cycle the pool
  return {
    ...state,
    current: prepareQuestion(state.pool[nextIndex], rng),
    questionNumber: state.questionNumber + 1,
    phase: 'answering',
    hiddenAnswers: [],
    triedAnswers: [],
    hintsRevealed: 1,
    questionShownAt: now,
    feedback: null,
  };
}

export function revealHint(state: MissionState): MissionState {
  const total = state.current.question.hints?.length ?? 0;
  if (state.phase !== 'answering' || state.hintsRevealed >= total) return state;
  return { ...state, hintsRevealed: state.hintsRevealed + 1 };
}

/** Time passes (timed modes). The clock is paused while showing feedback. */
export function tick(state: MissionState, elapsedMs: number): MissionState {
  if (state.timeLeftMs == null || state.phase !== 'answering') return state;
  const timeLeftMs = Math.max(0, state.timeLeftMs - elapsedMs);
  return { ...state, timeLeftMs, phase: timeLeftMs <= 0 ? 'finished' : state.phase };
}

// ---------- Powers (coin checks happen in the UI before calling these) ----------

export function canUseSpiderSense(state: MissionState): boolean {
  const visibleWrong = state.current.answers.filter(
    (a) =>
      a !== state.current.question.correctAnswer && !state.hiddenAnswers.includes(a) && !state.triedAnswers.includes(a),
  );
  return state.phase === 'answering' && state.hiddenAnswers.length === 0 && visibleWrong.length >= 2;
}

export function applySpiderSense(state: MissionState, rng: Rng = Math.random): MissionState {
  if (!canUseSpiderSense(state)) return state;
  const toHide = pickAnswersToRemove(state.current, state.triedAnswers, rng);
  return { ...state, hiddenAnswers: toHide };
}

export function canUseTimeBoost(state: MissionState): boolean {
  return state.phase === 'answering' && state.timeLeftMs != null;
}

export function applyTimeBoost(state: MissionState): MissionState {
  if (!canUseTimeBoost(state)) return state;
  return { ...state, timeLeftMs: state.timeLeftMs! + TIME_BOOST_SECONDS * 1000 };
}

export function canUseSecondChance(state: MissionState): boolean {
  return state.phase === 'answering' && !state.secondChanceArmed;
}

export function armSecondChance(state: MissionState): MissionState {
  if (!canUseSecondChance(state)) return state;
  return { ...state, secondChanceArmed: true };
}
