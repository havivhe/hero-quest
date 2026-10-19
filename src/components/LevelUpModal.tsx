import { useEffect } from 'react';
import { HAPTICS, vibrate } from '../audio/haptics';
import { playSfx } from '../audio/sound';
import type { LevelConfig } from '../config/levels';
import { Button } from './Button';
import { Confetti } from './Confetti';
import { Modal } from './Modal';

interface LevelUpModalProps {
  level: LevelConfig | null;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  useEffect(() => {
    if (!level) return;
    playSfx('levelUp');
    vibrate(HAPTICS.levelUp);
  }, [level]);

  return (
    <Modal open={!!level} onClose={onClose} labelledBy="levelup-title" className="modal--levelup">
      {level && (
        <>
          <Confetti count={60} />
          <div className="levelup__burst" aria-hidden="true" />
          <div className="levelup__badge" aria-hidden="true">
            {level.icon}
          </div>
          <p className="levelup__kicker">עליתם רמה!</p>
          <h2 id="levelup-title" className="levelup__title">
            רמה {level.level}
          </h2>
          <p className="levelup__rank">{level.title}</p>
          <p className="levelup__text">כל הכבוד, גיבורים! הכוח שלכם הולך וגדל 💪</p>
          <Button variant="primary" size="lg" block onClick={onClose} autoFocus>
            יאללה, ממשיכים! 🚀
          </Button>
        </>
      )}
    </Modal>
  );
}
