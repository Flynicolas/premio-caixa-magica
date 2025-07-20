
import { useState, useEffect } from 'react';
import { Trophy, Gift, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WinData {
  id: string;
  name: string;
  prize: string;
  image: string;
  time: string;
}

const LiveWinsCarousel = () => {
  const [wins, setWins] = useState<WinData[]>([]);
  const [allWins, setAllWins] = useState<WinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar vitórias reais do banco de dados
  const fetchRecentWins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          id,
          won_at,
          item:items(
            name,
            image_url
          ),
          user:profiles(
            full_name
          )
        `)
        .not('item', 'is', null)
        .not('user', 'is', null)
        .order('won_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Erro ao buscar vitórias:', error);
        return;
      }

      const formattedWins: WinData[] = (data || [])
        .filter(win => win.item && win.user && Array.isArray(win.user) && win.user.length > 0)
        .map(win => ({
          id: win.id,
          name: Array.isArray(win.user) ? win.user[0]?.full_name || 'Usuário' : 'Usuário',
          prize: Array.isArray(win.item) ? win.item[0]?.name || 'Item' : win.item?.name || 'Item',
          image: Array.isArray(win.item) ? win.item[0]?.image_url || '' : win.item?.image_url || '',
          time: 'Agora mesmo'
        }));

      setAllWins(formattedWins);
      setWins(formattedWins.slice(0, 4));
      setIsLoading(false);
    } catch (error) {
      console.error('Erro na busca:', error);
      setIsLoading(false);
    }
  };

  // Função para rotacionar vitórias de forma natural
  const startNaturalRotation = () => {
    if (allWins.length === 0) return;

    let currentIndex = 4;
    
    const rotateWins = () => {
      if (currentIndex >= allWins.length) {
        currentIndex = 0;
      }

      const newWin = allWins[currentIndex];
      setWins(prev => [newWin, ...prev.slice(0, 3)]);
      currentIndex++;

      // Delay natural entre 4-9 segundos
      const nextDelay = Math.random() * 5000 + 4000;
      setTimeout(rotateWins, nextDelay);
    };

    // Pausa inicial
    const initialDelay = Math.random() * 3000 + 2000;
    setTimeout(rotateWins, initialDelay);
  };

  useEffect(() => {
    fetchRecentWins();
  }, []);

  useEffect(() => {
    if (allWins.length > 0 && !isLoading) {
      startNaturalRotation();
    }
  }, [allWins, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/20 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary">Carregando vitórias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/20 rounded-lg p-6 mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-center text-primary">
            Vitórias em Tempo Real
          </h2>
          <Gift className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="flex flex-col space-y-4">
          {wins.map((win, index) => (
            <div
              key={win.id}
              className={`flex items-center p-4 bg-card/50 rounded-lg border border-primary/20 transition-all duration-700 ease-out ${
                index === 0 ? 'animate-fade-in scale-105 border-green-500/40 shadow-lg shadow-green-500/20' : ''
              }`}
              style={{
                transform: index === 0 ? 'translateY(0)' : `translateY(${index * 4}px)`,
                opacity: Math.max(0.4, 1 - index * 0.2)
              }}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center bg-transparent border border-primary/20">
                <img 
                  src={win.image} 
                  alt={win.prize}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  <span className="text-primary">{win.name}</span> ganhou
                </p>
                <p className="text-sm text-yellow-400 truncate font-medium">
                  {win.prize}
                </p>
                <p className="text-xs text-muted-foreground">{win.time}</p>
              </div>
              {index === 0 && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Radio className="w-3 h-3 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveWinsCarousel;
