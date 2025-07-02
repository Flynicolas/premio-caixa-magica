
export interface UserLevel {
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number;
  progress: number;
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
  
  // Determine title based on level
  let title = 'Iniciante';
  if (level >= 50) title = 'Lendário';
  else if (level >= 30) title = 'Mestre';
  else if (level >= 20) title = 'Experiente';
  else if (level >= 10) title = 'Veterano';
  else if (level >= 5) title = 'Aventureiro';
  
  return {
    level,
    title,
    xp,
    nextLevelXp,
    progress: Math.round(progress)
  };
};
