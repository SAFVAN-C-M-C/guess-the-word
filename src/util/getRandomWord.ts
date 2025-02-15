// Define word list
import words from './words.json'
export const getRandomWord = (): string =>
  words[Math.floor(Math.random() * words.length)].word;
