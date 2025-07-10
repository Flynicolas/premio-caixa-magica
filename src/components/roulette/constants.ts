import { ChestTheme } from './types';

export const ITEM_WIDTH = 140;

export const chestThemes: Record<string, ChestTheme> = {
  silver: { border: 'border-gray-400/20', bg: 'bg-gray-900/40', accent: 'text-gray-300' },
  gold: { border: 'border-yellow-400/20', bg: 'bg-yellow-900/40', accent: 'text-yellow-300' },
  delas: { border: 'border-pink-400/20', bg: 'bg-pink-900/40', accent: 'text-pink-300' },
  diamond: { border: 'border-blue-400/20', bg: 'bg-blue-900/40', accent: 'text-blue-300' },
  ruby: { border: 'border-red-400/20', bg: 'bg-red-900/40', accent: 'text-red-300' },
  premium: { border: 'border-purple-500/20', bg: 'bg-purple-900/40', accent: 'text-purple-300' }
};

export const rarityTranslations = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  special: 'Especial'
};