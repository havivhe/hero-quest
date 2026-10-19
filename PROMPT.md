Build a complete mobile-first single-player quiz/adventure PWA called:



"Hero Quest – מסע הגיבורים"



The primary user is an 11-year-old child playing on a smartphone.



IMPORTANT: This is Version 1. Do not over-engineer it and do not add AI APIs, authentication, payments, ads, multiplayer, backend databases or external accounts yet.



PRIMARY GOAL: Create a polished, fun, highly interactive mobile superhero trivia/adventure game based around Marvel characters, movies and stories.



The game must feel like a real game rather than a school quiz.



TECHNOLOGY: Use React + TypeScript + Vite. Make the project mobile-first and PWA-ready. Use clean modular architecture. Use localStorage for persistent progress. The app should work well in a portrait smartphone layout around 9:16. The interface must also remain usable on tablets and desktop browsers.



LANGUAGE: Primary interface language: Hebrew. Use RTL layout for Hebrew. Keep Marvel character/movie names in English where useful. All text must be easy for an 11-year-old to understand.



PLAYER: Single player only.



FIRST-LAUNCH FLOW: Show a welcome screen. Allow the player to enter a nickname. Create and save the local player profile. Do not request email, phone number, real name, birthday or any unnecessary personal information.



MAIN HOME SCREEN: Display:



nickname

current level

level title

XP progress bar

Hero Coins

best streak

main PLAY button

Achievements button

Settings button



MISSION CATEGORIES: Create these five categories:



Heroes

Villains

Movies

Stories

Mystery



GAME MODES: Implement these five modes:



Multiple Choice: Show a question and four answers.

Who Am I?: Reveal hints progressively. Fewer hints used = higher score.

True / False: Large touch-friendly True and False buttons.

Speed Challenge: 60-second timed mode. Ask as many short questions as possible.

Mystery Mission: Use short story-like clues and ask the player to solve the mystery.



DIFFICULTIES: Easy, Normal, Hard



QUESTION DATA MODEL: Each question should contain: id, category, difficulty, type, question, answers, correctAnswer, explanation, basePoints, tags.



Store questions separately from UI and game logic so the question bank can later grow to hundreds or thousands of entries.



Create an initial seed question bank for development/testing. Keep the data file easy to edit manually.



SCORING:



Correct answer: 100 base points.

Speed bonus: up to 50 additional points where applicable.

Streak: 3 consecutive correct answers = x1.25, 5 consecutive correct answers = x1.5, 10 consecutive correct answers = x2.

Do not subtract previously earned XP after wrong answers.



XP: Award XP for correct answers and completed missions.



HERO COINS: Award Hero Coins during gameplay.



POWERS: Implement three powers:



Spider Sense: Remove two incorrect choices. Cost: 50 Hero Coins.

Time Boost: Add extra time in timed modes. Cost: 75 Hero Coins.

Second Chance: Give the player another attempt after an incorrect answer. Cost: 100 Hero Coins.



Do not activate a power if the player lacks enough Hero Coins. Show a clear child-friendly message instead.



LEVEL SYSTEM: Implement at least:



Level 1 – Recruit – 0 XP

Level 2 – Hero Trainee – 500 XP

Level 3 – Young Hero – 1200 XP

Level 4 – Defender – 2200 XP

Level 5 – Avenger – 3500 XP



Continue with reasonable additional levels in a configuration file so levels can easily be changed later.



When the player levels up: show a celebratory Level Up screen or modal with animation.



ACHIEVEMENTS: Implement at least: First Mission, 5 Streak, 10 Streak, Perfect 10/10, Hero Expert, Movie Expert, Speed Master.



Each achievement must have: id, name, description, icon placeholder, unlock condition, locked/unlocked state.



GAMEPLAY SCREEN: Show:



current score

current streak

progress

question

answers

available powers

timer where relevant



Use large touch targets suitable for a phone.



CORRECT ANSWER FEEDBACK: Show positive visual feedback. Show: points earned, XP earned, coins earned, a short educational explanation.



WRONG ANSWER FEEDBACK: Do not punish or shame the player. Show the correct answer. Show a short explanation. Allow gameplay to continue.



MISSION END SCREEN: Show: score, correct answers, total questions, accuracy, best combo/streak, XP earned, Hero Coins earned, star rating, new achievements, level progress.



If the player levels up, clearly celebrate it.



LOCAL PERSISTENCE: Persist automatically using localStorage:



nickname, level, XP, Hero Coins, total score, best score, best streak, games played, correct answers, wrong answers, achievements, settings, question history.



Closing and reopening the browser must not erase progression.



SETTINGS: Implement: sound on/off, music on/off, vibration on/off where supported, reset progress.



Reset progress must require a confirmation step.



AUDIO: Use simple original or royalty-free placeholder sound effects only. Do not include copyrighted Marvel movie music.



VISUAL DESIGN: Use a polished comic-book/superhero-inspired interface.



Requirements: mobile-first, dark cinematic background, energy/glow effects, clear cards, large buttons, smooth animations, high contrast, very readable Hebrew typography, fun but not visually overwhelming.



Do not copy the official Marvel website/app design. Do not package official Marvel logos, copyrighted movie stills, character artwork or Disney/Marvel music into the project.



Use original graphic placeholders, CSS effects, icons and generic superhero/comic-style design instead.



BRANDING: The game's name is "Hero Quest – מסע הגיבורים". It is an unofficial superhero trivia fan game.



Do NOT use the word "Marvel" (or "Disney") anywhere in the app name, page title, PWA manifest (name, short\_name), icons, splash screens, logos, folder name, repository name, package.json name or URL.

Character, movie and story names may appear inside questions, answers and explanations only, as factual trivia content.

Add a small footer line on the welcome screen and in Settings: "משחק מעריצים לא רשמי. אינו קשור ל-Marvel או ל-Disney."

Use repository name: hero-quest



ACCESSIBILITY: Use readable font sizes. High contrast. Do not rely only on color to communicate correct/incorrect answers. Provide visible text/icon feedback. Buttons must be touch-friendly.



CODE ARCHITECTURE: Separate: UI, question data, game logic, scoring, levels, achievements, storage, settings.



Create reusable components.



Avoid putting the entire application into one large file.



Create a clear README.md explaining: how to install dependencies, how to run the project, how to build it, project structure, where to edit questions, where scoring rules are stored, where level thresholds are stored.



QUALITY: No placeholder buttons that do nothing. No broken navigation. No console errors. No TypeScript errors. No dead screens.



Before considering Version 1 complete, test these cases:



A completely new player starts the game.

The player gets 10 answers correct in a row.

Spider Sense is used successfully.

The player tries to use a power without enough coins.

The browser/app is closed and reopened and progress remains.

The player reaches a new level.

The player completes a perfect 10/10 mission.

The interface works on a narrow mobile viewport.



After implementing the app: run it, check for errors, fix the errors you find.



DEPLOYMENT (PUBLIC LINK): After all tests pass, publish the game as a public website that anyone can open from a link, with no login or account required for players.



Use GitHub Pages, deployed automatically via GitHub Actions.

Initialize a git repository and create a GitHub repository named hero-quest using the gh CLI. If gh is not authenticated, stop and ask me to run gh auth login myself. Never ask for or handle my password or tokens.

Configure the Vite base path to match the repository name so all assets load correctly under the GitHub Pages subpath.

Make sure the PWA works under that subpath: manifest start\_url and scope, icon paths, and service worker registration must all be correct.

Add .github/workflows/deploy.yml that builds and deploys on every push to main.

Add <meta name="robots" content="noindex"> so the game is reachable by link but not listed in search engines.

Make sure no secrets, tokens or personal data are committed (.gitignore must be correct).

After deploying, verify the live URL: the game loads, no 404 errors on assets, refreshing the page works, and it works on a narrow mobile viewport.

Add a "Deployment" section to README.md explaining how to publish updates (commit + push to main).



FINAL SUMMARY: When done, give me the public URL and a short summary of what was implemented and any remaining limitations.



Do not add the future AI Game Master, Boss Battles, collectible cards, multiplayer or backend services in Version 1. Design the architecture so those features can be added later without rewriting the entire application.

