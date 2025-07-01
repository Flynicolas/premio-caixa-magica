
export interface UserLevel {
  level: number;
  name: string;
  title: string;
  minSpent: number;
  minPrizes: number;
  color: string;
  icon: string;
  benefits: string[];
}

export const levels: UserLevel[] = [
  {
    level: 1,
    name: 'Novato',
    title: 'Iniciante',
    minSpent: 0,
    minPrizes: 0,
    color: 'text-gray-400',
    icon: '🥉',
    benefits: ['Acesso aos baús básicos']
  },
  {
    level: 2,
    name: 'Explorador',
    title: 'Aventureiro',
    minSpent: 100,
    minPrizes: 5,
    color: 'text-green-400',
    icon: '🌟',
    benefits: ['Bônus de 5% nos depósitos', 'Notificações de promoções']
  },
  {
    level: 3,
    name: 'Aventureiro',
    title: 'Destemido',
    minSpent: 300,
    minPrizes: 15,
    color: 'text-blue-400',
    icon: '⚡',
    benefits: ['Bônus de 10% nos depósitos', 'Acesso a baús especiais']
  },
  {
    level: 4,
    name: 'Veterano',
    title: 'Experiente',
    minSpent: 750,
    minPrizes: 35,
    color: 'text-purple-400',
    icon: '👑',
    benefits: ['Bônus de 15% nos depósitos', 'Prioridade no suporte', 'Baús exclusivos']
  },
  {
    level: 5,
    name: 'Lenda',
    title: 'Lendário',
    minSpent: 1500,
    minPrizes: 75,
    color: 'text-yellow-400',
    icon: '🏆',
    benefits: ['Bônus de 20% nos depósitos', 'Gerente VIP', 'Eventos exclusivos']
  },
  {
    level: 6,
    name: 'Mestre',
    title: 'Supremo',
    minSpent: 3000,
    minPrizes: 150,
    color: 'text-red-400',
    icon: '💎',
    benefits: ['Bônus de 25% nos depósitos', 'Cashback semanal', 'Presentes especiais']
  }
];

export const calculateUserLevel = (totalSpent: number, totalPrizes: number): UserLevel => {
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (totalSpent >= level.minSpent && totalPrizes >= level.minPrizes) {
      return level;
    }
  }
  return levels[0];
};

export const getNextLevel = (currentLevel: UserLevel): UserLevel | null => {
  const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

export const getProgressToNextLevel = (totalSpent: number, totalPrizes: number, currentLevel: UserLevel): {
  spentProgress: number;
  prizesProgress: number;
  nextLevel: UserLevel | null;
} => {
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return { spentProgress: 100, prizesProgress: 100, nextLevel: null };
  }

  const spentProgress = Math.min(100, (totalSpent / nextLevel.minSpent) * 100);
  const prizesProgress = Math.min(100, (totalPrizes / nextLevel.minPrizes) * 100);

  return { spentProgress, prizesProgress, nextLevel };
};
