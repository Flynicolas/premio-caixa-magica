import { useState, useEffect } from 'react';

export const useActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState(500);

  useEffect(() => {
    const updateActiveUsers = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let min, max;
      
      // Manhã (6h-12h): 500-1000 usuários
      if (hour >= 6 && hour < 12) {
        min = 500;
        max = 1000;
      }
      // Tarde/Noite (12h-24h): 1000-3000 usuários
      else if (hour >= 12 || hour < 6) {
        min = 1000;
        max = 3000;
      }
      // Madrugada (0h-6h): 300-800 usuários
      else {
        min = 300;
        max = 800;
      }
      
      // Gerar número aleatório no intervalo
      const randomUsers = Math.floor(Math.random() * (max - min + 1)) + min;
      setActiveUsers(randomUsers);
    };

    // Atualizar imediatamente
    updateActiveUsers();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(updateActiveUsers, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return activeUsers;
};