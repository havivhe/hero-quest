import { useCallback, useEffect, useRef, useState } from 'react';
import { HAPTICS, vibrate } from '../audio/haptics';
import { playSfx } from '../audio/sound';
import { Button } from '../components/Button';
import { AnswerButton, type AnswerState } from '../components/game/AnswerButton';
import { FeedbackPanel } from '../components/game/FeedbackPanel';
import { MysteryClues, WhoAmIHints } from '../components/game/HintList';
import { PowerBar } from '../components/game/PowerBar';
import { Modal } from '../components/Modal';
import { Toast, type ToastMessage } from '../components/Toast';
import { getAchievement } from '../config/achievements';
import { getCategoryInfo } from '../config/categories';
import { getDifficultyName } from '../config/difficulties';
import { getMode } from '../config/modes';
import { POWERS, TIME_BOOST_SECONDS } from '../config/powers';
import { QUESTION_BANK } from '../data/questions';
import { getLevelForXp } from '../game/levels';
import {
  answerQuestion,
  applySpiderSense,
  applyTimeBoost,
  armSecondChance,
  canUseSecondChance,
  canUseSpiderSense,
  canUseTimeBoost,
  createMission,
  nextQuestion,
  revealHint,
  tick,
  type MissionState,
} from '../game/mission';
import { applyAnswer, applyMissionEnd, refundCoins, spendCoins } from '../game/progress';
import { getStreakMultiplier } from '../game/scoring';
import type { MissionConfig, MissionResult, PowerId } from '../game/types';
import { usePlayer } from '../state/PlayerContext';

interface GameScreenProps {
  config: MissionConfig;
  onFinish: (result: MissionResult) => void;
  onQuit: () => void;
}

const MARKERS = ['א', 'ב', 'ג', 'ד'];

export function GameScreen({ config, onFinish, onQuit }: GameScreenProps) {
  const { profile, getProfile, saveProfile } = usePlayer();
  const mode = getMode(config.mode);

  const [state, setState] = useState<MissionState | null>(() =>
    createMission(config, QUESTION_BANK, getProfile()?.questionHistory ?? {}, Date.now()),
  );
  const stateRef = useRef(state);
  const commit = useCallback((next: MissionState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const levelBeforeRef = useRef(getLevelForXp(getProfile()?.xp ?? 0).level);
  const unlockedRef = useRef<string[]>([]);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [flash, setFlash] = useState<{ id: number; kind: 'correct' | 'wrong' } | null>(null);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    setToast({ id: Date.now(), text, tone });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  pausedRef.current = confirmQuit;

  // ---------- Clock (timed modes) ----------
  // The clock only runs while a question is waiting for an answer: it is paused
  // during feedback and while the quit dialog is open.
  const clockRef = useRef(performance.now());
  const consumeClock = (s: MissionState): MissionState => {
    const now = performance.now();
    const elapsed = now - clockRef.current;
    clockRef.current = now;
    if (s.timeLeftMs == null || s.phase !== 'answering' || pausedRef.current) return s;
    return tick(s, elapsed);
  };

  // ---------- Answering ----------
  const handleAnswer = (answer: string) => {
    let s = stateRef.current;
    const p = getProfile();
    if (!s || !p) return;
    // Count the exact time spent on this question before judging the answer.
    s = consumeClock(s);
    if (s.phase === 'finished') {
      commit(s);
      return;
    }
    const { state: next, outcome } = answerQuestion(s, answer, Date.now());
    if (outcome.kind === 'ignored') return;
    commit(next);

    if (outcome.kind === 'retry') {
      playSfx('wrong');
      vibrate(HAPTICS.wrong);
      showToast('🛡️ הזדמנות שנייה הופעלה! נסו שוב', 'info');
      return;
    }

    const correct = outcome.kind === 'correct';
    const { profile: updated, unlocked } = applyAnswer(
      p,
      s.current.question,
      correct,
      correct ? outcome.reward : null,
      next.streak,
      Date.now(),
    );
    saveProfile(updated);
    setFlash({ id: Date.now(), kind: correct ? 'correct' : 'wrong' });
    playSfx(correct ? 'correct' : 'wrong');
    vibrate(correct ? HAPTICS.correct : HAPTICS.wrong);

    if (unlocked.length > 0) {
      unlockedRef.current.push(...unlocked);
      window.setTimeout(() => playSfx('achievement'), 450);
      showToast(`🏅 הישג חדש: ${unlocked.map((id) => getAchievement(id)?.name).join(', ')}`, 'success');
    }
  };

  const handleNext = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.phase !== 'feedback') return;
    clockRef.current = performance.now();
    commit(nextQuestion(s, Date.now()));
  }, [commit]);

  const handleRevealHint = () => {
    const s = stateRef.current;
    if (s) commit(revealHint(s));
  };

  // ---------- Powers ----------
  const handlePower = (id: PowerId) => {
    const s = stateRef.current;
    const p = getProfile();
    if (!s || !p || s.phase !== 'answering') return;
    const power = POWERS[id];

    if (id === 'secondChance' && s.secondChanceArmed) {
      showToast('🛡️ ההזדמנות השנייה כבר פעילה ומחכה לכם!', 'info');
      return;
    }
    const usable = { spiderSense: canUseSpiderSense(s), timeBoost: canUseTimeBoost(s), secondChance: canUseSecondChance(s) }[id];
    if (!usable) {
      playSfx('denied');
      if (id === 'spiderSense') {
        showToast(
          s.hiddenAnswers.length > 0
            ? '🕷️ חוש העכביש כבר עבד בשאלה הזו'
            : '🕷️ בשאלה הזו אין מספיק תשובות להעלים – נסו בשאלה אחרת',
          'info',
        );
      } else {
        showToast('⏱️ בוסט זמן עובד רק במשחקים עם שעון', 'info');
      }
      return;
    }

    const paid = spendCoins(p, power.cost);
    if (!paid) {
      playSfx('denied');
      showToast(
        `🪙 אופס! צריך ${power.cost} מטבעות גיבור ל${power.name}, ויש לכם ${p.coins}. ענו נכון כדי לאסוף עוד מטבעות!`,
        'warn',
      );
      return;
    }
    saveProfile(paid);
    playSfx('power');

    if (id === 'spiderSense') {
      commit(applySpiderSense(s));
      showToast('🕷️ חוש העכביש העלים שתי תשובות לא נכונות!', 'success');
    } else if (id === 'timeBoost') {
      commit(applyTimeBoost(s));
      showToast(`⏱️ +${TIME_BOOST_SECONDS} שניות!`, 'success');
    } else {
      commit(armSecondChance(s));
      showToast('🛡️ הזדמנות שנייה פעילה! אם תטעו – תוכלו לנסות שוב', 'success');
    }
  };

  // ---------- Timer (timed modes) ----------
  const timed = state?.timeLeftMs != null;
  const running = timed && state?.phase !== 'finished';
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (!s) return;
      const next = consumeClock(s);
      if (next === s) return;
      const secBefore = Math.ceil((s.timeLeftMs ?? 0) / 1000);
      const secAfter = Math.ceil((next.timeLeftMs ?? 0) / 1000);
      if (secAfter < secBefore && secAfter <= 5 && secAfter > 0) playSfx('tick');
      commit(next);
    }, 200);
    return () => window.clearInterval(id);
    // consumeClock only touches refs, so it is safe to leave out of the deps.
  }, [running, commit]);

  // ---------- Mission end ----------
  useEffect(() => {
    if (!state || state.phase !== 'finished' || finishedRef.current) return;
    finishedRef.current = true;
    let p = getProfile();
    if (!p) return;
    if (state.secondChanceArmed) p = refundCoins(p, POWERS.secondChance.cost); // unused – give it back
    const isTimed = state.timeLeftMs != null;
    const { profile: updated, result } = applyMissionEnd(
      p,
      {
        config,
        score: state.score,
        correct: state.correctCount,
        total: isTimed ? state.answeredCount : state.totalQuestions ?? state.answeredCount,
        bestStreak: state.bestStreak,
        xpEarned: state.xpEarned,
        coinsEarned: state.coinsEarned,
        timed: isTimed,
        unlockedDuringMission: unlockedRef.current,
        levelBefore: levelBeforeRef.current,
      },
      Date.now(),
    );
    saveProfile(updated);
    playSfx('finish');
    onFinish(result);
  }, [state, config, getProfile, saveProfile, onFinish]);

  const quit = () => {
    const s = stateRef.current;
    const p = getProfile();
    if (s && p && s.secondChanceArmed && s.phase !== 'finished') saveProfile(refundCoins(p, POWERS.secondChance.cost));
    finishedRef.current = true;
    onQuit();
  };

  // ---------- Render ----------
  if (!state || !profile) {
    return (
      <main className="screen screen--game">
        <div className="card empty-state">
          <p>😅 לא מצאנו שאלות למשימה הזו. נסו קטגוריה או רמה אחרת.</p>
          <Button onClick={onQuit}>חזרה</Button>
        </div>
      </main>
    );
  }

  const q = state.current.question;
  const category = getCategoryInfo(q.category);
  const isTrueFalse = q.type === 'true-false';
  const multiplier = getStreakMultiplier(state.streak);
  const isLast =
    state.totalQuestions != null ? state.questionNumber >= state.totalQuestions : (state.timeLeftMs ?? 0) <= 0;

  const answerState = (a: string): AnswerState => {
    if (state.phase !== 'answering') {
      if (a === q.correctAnswer) return 'correct';
      if (a === state.feedback?.selected) return 'wrong';
      return 'dimmed';
    }
    if (state.hiddenAnswers.includes(a)) return 'hidden';
    if (state.triedAnswers.includes(a)) return 'tried';
    return 'idle';
  };

  const timeLeftSec = state.timeLeftMs != null ? Math.ceil(state.timeLeftMs / 1000) : null;
  const progressPct =
    state.totalQuestions != null
      ? ((state.questionNumber - (state.phase === 'answering' ? 1 : 0)) / state.totalQuestions) * 100
      : Math.min(100, ((state.timeLeftMs ?? 0) / ((mode.timeLimitSec ?? 60) * 1000)) * 100);

  return (
    <main className="screen screen--game">
      {flash && <div key={`flash-${flash.id}`} className={`screen-flash screen-flash--${flash.kind}`} aria-hidden="true" />}

      <div className="game-hud">
        <button type="button" className="icon-btn" onClick={() => setConfirmQuit(true)} aria-label="יציאה מהמשימה">
          <span aria-hidden="true">✕</span>
        </button>
        <div className="game-hud__stat" aria-label={`ניקוד ${state.score}`}>
          <span className="game-hud__label">ניקוד</span>
          <span className="game-hud__value">{state.score}</span>
        </div>
        <div className={`game-hud__stat ${state.streak >= 3 ? 'is-hot' : ''}`} aria-label={`רצף ${state.streak}`}>
          <span className="game-hud__label">רצף</span>
          <span className="game-hud__value">
            🔥 {state.streak}
            {multiplier > 1 && <small className="game-hud__mult"> x{multiplier}</small>}
          </span>
        </div>
        {timeLeftSec != null ? (
          <div className={`game-hud__stat game-hud__timer ${timeLeftSec <= 10 ? 'is-urgent' : ''}`} aria-label={`נשארו ${timeLeftSec} שניות`}>
            <span className="game-hud__label">זמן</span>
            <span className="game-hud__value">⏱️ {timeLeftSec}</span>
          </div>
        ) : (
          <div className="game-hud__stat" aria-label={`שאלה ${state.questionNumber} מתוך ${state.totalQuestions}`}>
            <span className="game-hud__label">שאלה</span>
            <span className="game-hud__value">
              {state.questionNumber}/{state.totalQuestions}
            </span>
          </div>
        )}
      </div>

      <div className={`progress ${timeLeftSec != null ? 'progress--timer' : ''} ${timeLeftSec != null && timeLeftSec <= 10 ? 'is-urgent' : ''}`}>
        <div className="progress__fill" style={{ width: `${progressPct}%` }} />
      </div>
      {timeLeftSec != null && (
        <p className="speed-count">
          ענית נכון על <strong>{state.correctCount}</strong> שאלות
        </p>
      )}

      <section key={`q-${state.questionNumber}`} className="question-card card" aria-live="polite">
        <div className="question-card__tags">
          <span className="tag">
            {category.icon} {category.name}
          </span>
          <span className="tag">{getDifficultyName(q.difficulty)}</span>
          <span className="tag">
            {mode.icon} {mode.name}
          </span>
        </div>
        {q.type === 'mystery' && q.hints && <MysteryClues clues={q.hints} />}
        <h2 className="question-card__text">{q.question}</h2>
        {q.type === 'who-am-i' && q.hints && (
          <WhoAmIHints
            hints={q.hints}
            revealed={state.hintsRevealed}
            onReveal={handleRevealHint}
            canReveal={state.phase === 'answering'}
          />
        )}
      </section>

      {state.secondChanceArmed && state.phase === 'answering' && (
        <p className="armed-banner">🛡️ הזדמנות שנייה פעילה</p>
      )}

      <div className={`answers ${isTrueFalse ? 'answers--tf' : ''}`}>
        {state.current.answers.map((a, i) => (
          <AnswerButton
            key={a}
            label={a}
            marker={isTrueFalse ? (i === 0 ? '👍' : '👎') : MARKERS[i]}
            state={answerState(a)}
            onSelect={() => handleAnswer(a)}
            big={isTrueFalse}
          />
        ))}
      </div>

      {state.phase === 'answering' && (
        <PowerBar
          powers={mode.powers}
          coins={profile.coins}
          usable={{
            spiderSense: canUseSpiderSense(state),
            timeBoost: canUseTimeBoost(state),
            secondChance: canUseSecondChance(state),
          }}
          active={{ secondChance: state.secondChanceArmed }}
          onUse={handlePower}
        />
      )}

      {state.phase === 'feedback' && state.feedback && (
        <FeedbackPanel
          key={`fb-${state.questionNumber}`}
          feedback={state.feedback}
          correctAnswer={q.correctAnswer}
          explanation={q.explanation}
          streak={state.streak}
          isLast={isLast}
          onNext={handleNext}
          autoAdvanceMs={timed ? (state.feedback.correct ? 1300 : 2800) : undefined}
        />
      )}

      <Toast message={toast} onDone={clearToast} />

      <Modal open={confirmQuit} onClose={() => setConfirmQuit(false)} labelledBy="quit-title">
        <h2 id="quit-title" className="modal__title">
          לצאת מהמשימה?
        </h2>
        <p className="modal__text">
          אל דאגה – ה-XP, המטבעות והנקודות שכבר הרווחתם נשמרים. אבל בונוס סיום המשימה לא יתקבל.
        </p>
        <div className="modal__actions">
          <Button size="lg" block onClick={() => setConfirmQuit(false)}>
            ממשיכים לשחק 💪
          </Button>
          <Button variant="ghost" size="lg" block onClick={quit}>
            יציאה למסך הבית
          </Button>
        </div>
      </Modal>
    </main>
  );
}
