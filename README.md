# Hero Quest – מסע הגיבורים

A mobile-first, single-player superhero trivia & adventure game (PWA) in Hebrew (RTL), built with React + TypeScript + Vite.

> Unofficial fan game. Not affiliated with Marvel or Disney. No official logos, artwork or music are included – all graphics are CSS/emoji placeholders and all sounds are synthesized in code.

## Requirements

- **Node.js 20 or newer** (Node 22 recommended)
- npm

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

Open the URL printed in the terminal (e.g. `http://localhost:5173/hero-quest/`).
To test on a phone on the same Wi‑Fi: `npm run dev -- --host` and open the "Network" URL.

## Build & preview

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ at http://localhost:4173/hero-quest/
npm test          # unit tests (scoring, levels, missions, question bank validation)
```

## Project structure

```
src/
  main.tsx, App.tsx       App entry + screen navigation
  config/                 ← all tunable game settings
    scoring.ts              points, speed bonus, streak multipliers, XP, coins, stars
    levels.ts               level thresholds & titles
    achievements.ts         achievements (name, icon, unlock condition)
    powers.ts               powers & their costs
    modes.ts                game modes (question types, length, timer, powers)
    categories.ts, difficulties.ts, settings.ts
  data/questions/         ← the question bank (one file per category)
  game/                   game logic – pure TypeScript, no UI
    types.ts                data model (Question, PlayerProfile, …)
    engine.ts               question selection, shuffling, bank validation
    mission.ts              mission state machine (answer, hints, powers, timer)
    scoring.ts, levels.ts, achievements.ts, progress.ts
    game.test.ts            unit tests
  storage/storage.ts      localStorage save/load (versioned, with migration)
  state/PlayerContext.tsx profile + settings React context (auto-saves)
  audio/                  synthesized sound effects/music, vibration
  components/             reusable UI (Button, XpBar, Modal, PowerBar, …)
  screens/                Welcome, Home, MissionSelect, Game, MissionEnd, Achievements, Settings
  styles/                 theme tokens, components & screen CSS
public/                   icons, favicon
scripts/make-icons.mjs    regenerates the PNG app icons (`npm run icons`)
```

## Where to edit things

| What | Where |
|---|---|
| **Questions** | `src/data/questions/<category>.ts` |
| **Scoring rules** (points, speed bonus, streaks, XP, coins, stars) | `src/config/scoring.ts` |
| **Level thresholds / titles** | `src/config/levels.ts` |
| Achievements | `src/config/achievements.ts` |
| Power costs | `src/config/powers.ts` |
| Mission length / timer per mode | `src/config/modes.ts` |

### Adding a question

Copy an existing block in the right category file and change it:

```ts
{
  id: 'h-mc-13',               // must be unique
  category: 'heroes',          // heroes | villains | movies | stories | mystery
  difficulty: 'easy',          // easy | normal | hard
  type: 'multiple-choice',     // multiple-choice | true-false | who-am-i | mystery
  question: '...',
  answers: ['A', 'B', 'C', 'D'],   // true-false: use TRUE_FALSE_ANSWERS
  correctAnswer: 'A',          // must exactly match one of the answers
  explanation: '...',
  basePoints: 100,
  tags: ['...'],
  hints: ['...'],              // required for who-am-i (hints) and mystery (clues)
},
```

Run `npm test` – it validates the whole bank (unique ids, correct answer present, answer counts, hints).

## Game rules (summary)

- Correct answer: 100 points, plus up to +50 speed bonus in Multiple Choice, True/False and Speed Challenge.
- Streak multiplier: 3 in a row ×1.25, 5 ×1.5, 10 ×2. Wrong answers never remove XP or coins.
- Who Am I?: each extra hint lowers the value (100% → 80% → 60% → 40%).
- XP = 20% of points earned, plus a bonus for finishing a mission (and for a perfect mission).
- Powers: Spider Sense (50 coins), Time Boost (75, Speed Challenge only), Second Chance (100). An unused Second Chance is refunded at the end of the mission.
- New players start with 100 Hero Coins.

## Saved data

Everything is saved automatically in the browser's `localStorage` under the key `hero-quest:save`: the profile, settings and question history. Only a nickname is stored. No personal info, accounts or servers are involved. Use **Settings → Reset progress** to erase it.

## Future features

The architecture leaves room for these later: new modes such as Boss Battles (add to `config/modes.ts` and a view), collectible cards, an AI Game Master, or a backend (swap `storage/storage.ts`, which is already versioned).

## Deployment

The game is published to **GitHub Pages** by `.github/workflows/deploy.yml`, which runs on every push to `main`. It installs dependencies, runs the tests, builds, and deploys `dist/`.

To publish an update:

```bash
git add -A
git commit -m "Describe your change"
git push origin main
```

Then wait about 1–2 minutes and check the **Actions** tab on GitHub. The live site is at `https://<your-github-username>.github.io/hero-quest/`.

Notes:
- The Vite `base` is `/hero-quest/` (in `vite.config.ts`). If you rename the repository, change `BASE` there too.
- The site has `<meta name="robots" content="noindex">`, so people can reach it by link but search engines won't list it.
- The game is a PWA. After an update, players may need to reload once (or close and reopen the app) to get the new version.
