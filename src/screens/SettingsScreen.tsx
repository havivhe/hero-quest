import { useState } from 'react';
import { vibrate, vibrationSupported } from '../audio/haptics';
import { unlockAudio } from '../audio/sound';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Modal } from '../components/Modal';
import { ScreenHeader } from '../components/ScreenHeader';
import { Toggle } from '../components/Toggle';
import type { PlayerProfile, Settings } from '../game/types';

interface SettingsScreenProps {
  profile: PlayerProfile;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onBack: () => void;
}

export function SettingsScreen({ profile, settings, onChange, onReset, onBack }: SettingsScreenProps) {
  const [confirmStep, setConfirmStep] = useState<0 | 1>(0);

  return (
    <main className="screen screen--settings">
      <ScreenHeader title="הגדרות" onBack={onBack} />

      <section className="settings-list" aria-label="שמע ורטט">
        <Toggle
          icon="🔊"
          label="צלילים"
          checked={settings.sound}
          onChange={(v) => {
            unlockAudio();
            onChange({ sound: v });
          }}
        />
        <Toggle
          icon="🎵"
          label="מוזיקה"
          checked={settings.music}
          onChange={(v) => {
            unlockAudio();
            onChange({ music: v });
          }}
        />
        <Toggle
          icon="📳"
          label="רטט"
          checked={settings.vibration}
          note={vibrationSupported ? undefined : 'המכשיר הזה לא תומך ברטט'}
          onChange={(v) => {
            onChange({ vibration: v });
            if (v) vibrate(40);
          }}
        />
      </section>

      <section className="card stats-card" aria-labelledby="stats-title">
        <h2 id="stats-title" className="section-title">
          📊 הסטטיסטיקה של {profile.nickname}
        </h2>
        <dl className="end-grid">
          <div>
            <dt>משימות</dt>
            <dd>{profile.gamesPlayed}</dd>
          </div>
          <div>
            <dt>תשובות נכונות</dt>
            <dd>{profile.correctAnswers}</dd>
          </div>
          <div>
            <dt>ניקוד כולל</dt>
            <dd>{profile.totalScore}</dd>
          </div>
          <div>
            <dt>XP</dt>
            <dd>{profile.xp}</dd>
          </div>
        </dl>
      </section>

      <section className="danger-zone">
        <Button variant="danger" size="lg" block onClick={() => setConfirmStep(1)}>
          🗑️ איפוס התקדמות
        </Button>
      </section>

      <Footer />

      <Modal open={confirmStep === 1} onClose={() => setConfirmStep(0)} labelledBy="reset-title">
        <h2 id="reset-title" className="modal__title">
          בטוחים שרוצים לאפס? 😮
        </h2>
        <p className="modal__text">
          כל ההתקדמות תימחק: הרמה, ה-XP, מטבעות הגיבור וההישגים. אי אפשר לבטל את זה!
        </p>
        <div className="modal__actions">
          <Button size="lg" block onClick={() => setConfirmStep(0)} autoFocus>
            לא, תשאירו הכול ✋
          </Button>
          <Button
            variant="danger"
            size="lg"
            block
            onClick={() => {
              setConfirmStep(0);
              onReset();
            }}
          >
            כן, למחוק הכול
          </Button>
        </div>
      </Modal>
    </main>
  );
}
