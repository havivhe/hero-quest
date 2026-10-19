import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { unlockAudio } from './audio/sound';
import { PlayerProvider } from './state/PlayerContext';
import './styles/theme.css';
import './styles/components.css';
import './styles/screens.css';

// Browsers only allow sound after the first user interaction.
window.addEventListener('pointerdown', unlockAudio, { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </StrictMode>,
);
