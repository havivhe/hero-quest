import { useState, type FormEvent } from 'react';
import { unlockAudio } from '../audio/sound';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Logo } from '../components/Logo';
import { NICKNAME_MAX_LENGTH } from '../config/settings';

interface WelcomeScreenProps {
  onStart: (nickname: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    unlockAudio();
    const name = nickname.trim();
    if (name.length < 2) {
      setError('הכינוי צריך להיות לפחות 2 אותיות 🙂');
      return;
    }
    onStart(name);
  };

  return (
    <main className="screen screen--welcome">
      <Logo />
      <p className="welcome__tagline">משחק טריוויה והרפתקאות של גיבורי-על!</p>

      <form className="card welcome__card" onSubmit={submit} noValidate>
        <label htmlFor="nickname" className="welcome__label">
          איך נקרא לכם, גיבורים? 🦸
        </label>
        <input
          id="nickname"
          className="text-input"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value.slice(0, NICKNAME_MAX_LENGTH));
            setError('');
          }}
          placeholder="הכינוי שלכם"
          maxLength={NICKNAME_MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="go"
          aria-describedby="nickname-help nickname-error"
          aria-invalid={!!error}
        />
        <p id="nickname-help" className="welcome__help">
          רק כינוי של גיבור – לא צריך שם אמיתי 🔒
        </p>
        {error && (
          <p id="nickname-error" className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="xl" block>
          מתחילים במסע! 🚀
        </Button>
      </form>

      <Footer />
    </main>
  );
}
