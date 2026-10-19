import type { Question } from '../../game/types';
import { heroesQuestions } from './heroes';
import { villainsQuestions } from './villains';
import { moviesQuestions } from './movies';
import { storiesQuestions } from './stories';
import { mysteryQuestions } from './mystery';

/**
 * The full question bank. To add a category file, import it and add it here.
 * Later this could be loaded from JSON or a server without changing game logic.
 */
export const QUESTION_BANK: Question[] = [
  ...heroesQuestions,
  ...villainsQuestions,
  ...moviesQuestions,
  ...storiesQuestions,
  ...mysteryQuestions,
];
