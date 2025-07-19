
export interface UserLevel {
  level: number;
  title: string;
  name: string;
  icon: string;
  color: string;
  benefits: string[];
  xp: number;
  nextLevelXp: number;
  progress: number;
  minSpent: number;
  minPrizes: number;
}

export const calculateUserLevel = (totalSpent: number, prizesWon: number): UserLevel => {
  // Calculate XP based on spending and prizes
  const xp = Math.floor(totalSpent / 10) + (prizesWon * 5);
  
  // Calculate level (every 100 XP is a new level)
  const level = Math.floor(xp / 100) + 1;
  
  // Calculate progress to next level
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  // Determine title, name, icon, color and benefits based on level
  let title = 'Iniciante';
  let name = 'Iniciante';
  let icon = '🌱';
  let color = 'text-green-500';
  let benefits = ['Acesso básico aos baús', 'Suporte da comunidade'];
  let minSpent = 0;
  let minPrizes = 0;
  
  if (level >= 50) {
    title = 'Lendário';
    name = 'Lendário';
    icon = '👑';
    color = 'text-yellow-500';
    benefits = ['Acesso VIP', 'Suporte prioritário', 'Baús exclusivos', 'Cashback premium'];
    minSpent = 5000;
    minPrizes = 250;
  } else if (level >= 30) {
    title = 'Mestre';
    name = 'Mestre';
    icon = '🏆';
    color = 'text-purple-500';
    benefits = ['Suporte prioritário', 'Baús especiais', 'Cashback melhorado'];
    minSpent = 3000;
    minPrizes = 150;
  } else if (level >= 20) {
    title = 'Experiente';
    name = 'Experiente';
    icon = '⭐';
    color = 'text-blue-500';
    benefits = ['Baús aprimorados', 'Recompensas extras'];
    minSpent = 2000;
    minPrizes = 100;
  } else if (level >= 10) {
    title = 'Veterano';
    name = 'Veterano';
    icon = '🎯';
    color = 'text-orange-500';
    benefits = ['Desconto em baús', 'Recompensas semanais'];
    minSpent = 1000;
    minPrizes = 50;
  } else if (level >= 5) {
    title = 'Aventureiro';
    name = 'Aventureiro';
    icon = '🚀';
    color = 'text-cyan-500';
    benefits = ['Acesso a mais baús', 'Recompensas mensais'];
    minSpent = 500;
    minPrizes = 25;
  }
  
  return {
    level,
    title,
    name,
    icon,
    color,
    benefits,
    xp,
    nextLevelXp,
    progress: Math.round(progress),
    minSpent,
    minPrizes
  };
};

export const getProgressToNextLevel = (totalSpent: number, totalPrizes: number, currentLevel: UserLevel) => {
  const nextLevel = getNextLevelRequirements(currentLevel.level + 1);
  
  if (!nextLevel) {
    return {
      spentProgress: 100,
      prizesProgress: 100,
      nextLevel: null
    };
  }
  
  const spentProgress = Math.min((totalSpent / nextLevel.minSpent) * 100, 100);
  const prizesProgress = Math.min((totalPrizes / nextLevel.minPrizes) * 100, 100);
  
  return {
    spentProgress,
    prizesProgress,
    nextLevel
  };
};

const getNextLevelRequirements = (level: number) => {
  if (level >= 50) return null; // Max level reached
  
  let name = 'Aventureiro';
  let minSpent = 500;
  let minPrizes = 25;
  
  if (level >= 50) {
    return null; // Already at max level
  } else if (level >= 30) {
    name = 'Lendário';
    minSpent = 5000;
    minPrizes = 250;
  } else if (level >= 20) {
    name = 'Mestre';
    minSpent = 3000;
    minPrizes = 150;
  } else if (level >= 10) {
    name = 'Experiente';
    minSpent = 2000;
    minPrizes = 100;
  } else if (level >= 5) {
    name = 'Veterano';
    minSpent = 1000;
    minPrizes = 50;
  }
  
  return { name, minSpent, minPrizes };
};
