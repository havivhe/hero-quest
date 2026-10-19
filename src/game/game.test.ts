import { describe, expect, it } from 'vitest';
import { POWERS } from '../config/powers';
import { QUESTION_BANK } from '../data/questions';
import { validateQuestionBank } from './engine';
import { getLevelForXp, getLevelProgress } from './levels';
import {
  answerQuestion,
  applySpiderSense,
  applyTimeBoost,
  armSecondChance,
  createMission,
  nextQuestion,
  tick,
  type MissionState,
} from './mission';
import { applyAnswer, applyMissionEnd, createProfile, spendCoins } from './progress';
import { calculateCorrectReward, getSpeedBonus, getStarRating, getStreakMultiplier } from './scoring';
import type { MissionConfig } from './types';

// Deterministic RNG for repeatable tests.
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MC: MissionConfig = { mode: 'multiple-choice', category: 'heroes', difficulty: 'easy' };

function newMission(config: MissionConfig = MC): MissionState {
  const m = createMission(config, QUESTION_BANK, {}, 0, seeded());
  if (!m) throw new Error('no mission');
  return m;
}

describe('question bank', () => {
  it('is valid', () => {
    expect(validateQuestionBank(QUESTION_BANK)).toEqual([]);
  });

  it('has every category and question type', () => {
    for (const cat of ['heroes', 'villains', 'movies', 'stories', 'mystery'])
      for (const type of ['multiple-choice', 'true-false', 'who-am-i', 'mystery'])
        expect(QUESTION_BANK.some((q) => q.category === cat && q.type === type)).toBe(true);
  });
});

describe('scoring', () => {
  it('applies streak multipliers', () => {
    expect(getStreakMultiplier(1)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1.25);
    expect(getStreakMultiplier(5)).toBe(1.5);
    expect(getStreakMultiplier(9)).toBe(1.5);
    expect(getStreakMultiplier(10)).toBe(2);
  });

  it('gives up to 50 speed bonus points', () => {
    expect(getSpeedBonus(0)).toBe(50);
    expect(getSpeedBonus(5)).toBe(25);
    expect(getSpeedBonus(30)).toBe(0);
  });

  it('calculates rewards', () => {
    expect(calculateCorrectReward({ basePoints: 100, streak: 1, answerTimeSec: null, hintsRevealed: null }).points).toBe(100);
    expect(calculateCorrectReward({ basePoints: 100, streak: 10, answerTimeSec: 0, hintsRevealed: null }).points).toBe(300);
    expect(calculateCorrectReward({ basePoints: 100, streak: 1, answerTimeSec: null, hintsRevealed: 3 }).points).toBe(60);
  });

  it('rates stars', () => {
    expect(getStarRating(10, 10, false)).toBe(3);
    expect(getStarRating(6, 10, false)).toBe(2);
    expect(getStarRating(2, 10, false)).toBe(1);
    expect(getStarRating(15, 20, true)).toBe(3);
  });
});

describe('levels', () => {
  it('matches required thresholds', () => {
    expect(getLevelForXp(0).level).toBe(1);
    expect(getLevelForXp(499).level).toBe(1);
    expect(getLevelForXp(500).level).toBe(2);
    expect(getLevelForXp(1200).level).toBe(3);
    expect(getLevelForXp(2200).level).toBe(4);
    expect(getLevelForXp(3500).level).toBe(5);
    expect(getLevelProgress(250).ratio).toBeCloseTo(0.5);
  });
});

describe('mission flow', () => {
  it('10 correct answers in a row -> x2 streak, perfect mission, achievements', () => {
    let m = newMission();
    let profile = createProfile('Tester', 0);
    expect(m.totalQuestions).toBe(10);
    let lastMultiplier = 1;
    for (let i = 0; i < 10; i++) {
      const res = answerQuestion(m, m.current.question.correctAnswer, m.questionShownAt + 1000);
      expect(res.outcome.kind).toBe('correct');
      if (res.outcome.kind === 'correct') {
        lastMultiplier = res.outcome.reward.multiplier;
        profile = applyAnswer(profile, m.current.question, true, res.outcome.reward, res.state.streak, 1).profile;
      }
      m = nextQuestion(res.state, 0, seeded(i + 2));
    }
    expect(m.phase).toBe('finished');
    expect(m.correctCount).toBe(10);
    expect(m.bestStreak).toBe(10);
    expect(lastMultiplier).toBe(2);
    expect(profile.achievements.streak_5).toBeDefined();
    expect(profile.achievements.streak_10).toBeDefined();

    const levelBefore = getLevelForXp(profile.xp).level;
    const end = applyMissionEnd(
      profile,
      {
        config: MC,
        score: m.score,
        correct: 10,
        total: 10,
        bestStreak: 10,
        xpEarned: m.xpEarned,
        coinsEarned: m.coinsEarned,
        timed: false,
        unlockedDuringMission: [],
        levelBefore,
      },
      2,
    );
    expect(end.profile.achievements.perfect_10).toBeDefined();
    expect(end.profile.achievements.first_mission).toBeDefined();
    expect(end.result.stars).toBe(3);
    expect(end.profile.gamesPlayed).toBe(1);
  });

  it('wrong answers never remove XP or coins', () => {
    const m = newMission();
    const profile = { ...createProfile('T', 0), xp: 300, coins: 40 };
    const wrong = m.current.answers.find((a) => a !== m.current.question.correctAnswer)!;
    const res = answerQuestion(m, wrong, 0);
    expect(res.outcome.kind).toBe('wrong');
    const after = applyAnswer(profile, m.current.question, false, null, 0, 1).profile;
    expect(after.xp).toBe(300);
    expect(after.coins).toBe(40);
    expect(after.wrongAnswers).toBe(1);
  });

  it('Spider Sense hides exactly two wrong answers', () => {
    const m = applySpiderSense(newMission(), seeded(3));
    expect(m.hiddenAnswers).toHaveLength(2);
    expect(m.hiddenAnswers).not.toContain(m.current.question.correctAnswer);
  });

  it('cannot buy a power without enough coins', () => {
    const poor = { ...createProfile('T', 0), coins: 20 };
    expect(spendCoins(poor, POWERS.spiderSense.cost)).toBeNull();
    const rich = { ...createProfile('T', 0), coins: 120 };
    expect(spendCoins(rich, POWERS.secondChance.cost)?.coins).toBe(20);
  });

  it('Second Chance gives another attempt and keeps the streak', () => {
    let m = newMission();
    m = { ...m, streak: 4 };
    m = armSecondChance(m);
    const wrong = m.current.answers.find((a) => a !== m.current.question.correctAnswer)!;
    const r1 = answerQuestion(m, wrong, 0);
    expect(r1.outcome.kind).toBe('retry');
    expect(r1.state.phase).toBe('answering');
    const r2 = answerQuestion(r1.state, m.current.question.correctAnswer, 0);
    expect(r2.outcome.kind).toBe('correct');
    expect(r2.state.streak).toBe(5);
  });

  it('Speed Challenge runs on a 60s clock and Time Boost adds time', () => {
    let m = newMission({ mode: 'speed', category: 'all', difficulty: 'normal' });
    expect(m.timeLeftMs).toBe(60000);
    m = applyTimeBoost(m);
    expect(m.timeLeftMs).toBe(75000);
    m = tick(m, 75000);
    expect(m.phase).toBe('finished');
  });

  it('a new player can reach level 2', () => {
    let p = createProfile('T', 0);
    const q = QUESTION_BANK[0];
    for (let i = 0; i < 30; i++) {
      p = applyAnswer(p, q, true, { points: 100, speedBonus: 0, multiplier: 1, xp: 20, coins: 10 }, 1, 1).profile;
    }
    expect(p.xp).toBe(600);
    expect(p.level).toBe(2);
  });
});
