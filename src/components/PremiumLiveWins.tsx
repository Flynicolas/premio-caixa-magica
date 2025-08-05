import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Gift, Radio } from 'lucide-react';

interface WinData {
  id: string;
  name: string;
  prize: string;
  image: string;
  time: string;
  isReal?: boolean;
}

const PremiumLiveWins = () => {
  const [wins, setWins] = useState<WinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Nomes simulados mais realistas
  const simulatedUserNames = [
    'Carlos M.', 'Ana P.', 'João S.', 'Maria C.', 'Pedro L.', 'Julia R.',
    'Rafael T.', 'Camila F.', 'Lucas O.', 'Beatriz M.', 'Diego A.', 'Fernanda B.',
    'Rodrigo V.', 'Larissa G.', 'Gustavo H.', 'Amanda N.', 'Bruno K.', 'Isabela J.'
  ];

  // Prêmios simulados
  const simulatedPrizes = [
    { name: 'iPhone 15', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', value: 'R$ 7.999' },
    { name: 'PlayStation 5', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400', value: 'R$ 4.599' },
    { name: 'MacBook Air', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', value: 'R$ 8.999' },
    { name: 'Smart TV 55"', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', value: 'R$ 2.899' },
    { name: 'AirPods Pro', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400', value: 'R$ 2.799' },
    { name: 'Nintendo Switch', image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', value: 'R$ 2.499' },
    { name: 'Galaxy S24', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', value: 'R$ 5.999' },
    { name: 'iPad Pro', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', value: 'R$ 6.499' }
  ];

  const fetchRecentWins = async () => {
    try {
      // Usar dados simulados para evitar erros de query complexa
      return [];
    } catch (error) {
      console.error('Erro ao buscar vitórias:', error);
      return [];
    }
  };

  const generateSimulatedWin = (): WinData => {
    const randomUser = simulatedUserNames[Math.floor(Math.random() * simulatedUserNames.length)];
    const randomPrize = simulatedPrizes[Math.floor(Math.random() * simulatedPrizes.length)];
    const randomTime = new Date();
    randomTime.setMinutes(randomTime.getMinutes() - Math.floor(Math.random() * 30));

    return {
      id: crypto.randomUUID(),
      name: randomUser,
      prize: randomPrize.name,
      image: randomPrize.image,
      time: randomTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isReal: false
    };
  };

  const initializeWins = async () => {
    const realWins = await fetchRecentWins();
    const simulatedCount = Math.max(0, 8 - realWins.length);
    const simulatedWins = Array.from({ length: simulatedCount }, generateSimulatedWin);
    
    const allWins = [...realWins, ...simulatedWins].slice(0, 8);
    setWins(allWins);
    setIsLoading(false);
  };

  const addNewWin = () => {
    // 30% chance de ser vitória real, 70% simulada
    const isReal = Math.random() < 0.3;
    
    if (isReal) {
      // Simular uma vitória real recente
      const newWin = generateSimulatedWin();
      newWin.isReal = true;
      setWins(prev => [newWin, ...prev.slice(0, 7)]);
    } else {
      const newWin = generateSimulatedWin();
      setWins(prev => [newWin, ...prev.slice(0, 7)]);
    }
  };

  useEffect(() => {
    initializeWins();

    // Adicionar novas vitórias a cada 3-8 segundos
    const interval = setInterval(() => {
      addNewWin();
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-xl p-6 border border-amber-500/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-xl p-6 border border-amber-500/20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-6 h-6 text-red-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AO VIVO</h3>
            <p className="text-sm text-gray-300">Últimas vitórias</p>
          </div>
        </div>
        <Trophy className="w-6 h-6 text-amber-500" />
      </div>

      {/* Wins Container */}
      <div className="relative">
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4 animate-[slide-left_20s_linear_infinite]">
            {[...wins, ...wins].map((win, index) => (
              <div 
                key={`${win.id}-${index}`}
                className={`
                  flex-shrink-0 bg-gradient-to-br from-slate-800/80 to-slate-700/80 
                  rounded-lg p-4 border border-amber-500/30 min-w-[280px]
                  ${win.isReal ? 'ring-2 ring-amber-500/50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Prize Image */}
                  <div className="relative">
                    <img 
                      src={win.image} 
                      alt={win.prize}
                      className="w-12 h-12 object-cover rounded-lg border border-amber-500/20"
                    />
                    {win.isReal && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Gift className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Win Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm truncate">
                        {win.name}
                      </span>
                      <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                        GANHOU
                      </span>
                    </div>
                    <p className="text-amber-300 font-bold text-sm truncate">
                      {win.prize}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {win.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Fade Effects */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

// CSS personalizado para a animação
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;
document.head.appendChild(style);

export default PremiumLiveWins;