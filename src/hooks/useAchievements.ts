import { useProfile } from './useProfile';

export const useAchievements = () => {
  const { userAchievements, achievements } = useProfile();

  const unlockedAchievements = achievements.filter(achievement =>
    userAchievements.some(ua => ua.achievement_id === achievement.id)
  );

  const recentAchievements = userAchievements
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 5)
    .map(ua => {
      const full = achievements.find(a => a.id === ua.achievement_id);
      return {
        ...full,
        unlocked_at: ua.unlocked_at
      };
    });

  return {
    unlockedAchievements,
    recentAchievements
  };
};
