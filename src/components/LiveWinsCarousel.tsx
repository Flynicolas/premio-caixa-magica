
import { useState, useEffect } from 'react';
import { Trophy, Gift, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WinData {
  id: string;
  name: string;
  prize: string;
  image: string;
  time: string;
  isReal?: boolean;
}

const LiveWinsCarousel = () => {
  const [wins, setWins] = useState<WinData[]>([]);
  const [realWins, setRealWins] = useState<WinData[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Nomes simulados variados (completos, abreviados e nicknames)
  const simulatedUserNames = [
    // Nomes completos tradicionais
    'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Lima',
    'Fernanda Rocha', 'Roberto Alves', 'Juliana Souza', 'Diego Ferreira', 'Camila Ribeiro',
    
    // Nomes com sobrenomes abreviados
    'Bruno M.', 'Larissa P.', 'Rafael G.', 'Gabriela C.', 'Lucas B.',
    'Amanda N.', 'Thiago M.', 'Patrícia D.', 'Felipe C.', 'Bianca M.',
    
    // Nicknames e apelidos gamers/digitais
    'GamerPro', 'TechLover', 'QueenStyle', 'FastRunner', 'CyberNinja',
    'PixelMaster', 'StarHunter', 'NightWolf', 'GoldenEagle', 'IronFist',
    'NetRider', 'CodeMaster', 'DigitalDream', 'WebCrawler', 'ByteHero',
    
    // Nomes curtos com números e palavras
    'Alex99', 'Nina2K', 'Zé_Tech', 'Lu123', 'Max_Pro',
    'Sam404', 'Rio_Gamer', 'Ace_2024', 'Neo_X', 'Vix_99',
    'Kat_Stars', 'Rex_Code', 'Blu_Sky', 'Jet_Fast', 'Fox_Digital'
  ];

  // Buscar vitórias reais
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
        .limit(10);

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
          time: 'Agora mesmo',
          isReal: true
        }));

      setRealWins(formattedWins);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  // Buscar itens disponíveis
  const fetchAvailableItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .limit(30);

      if (error) {
        console.error('Erro ao buscar itens:', error);
        return;
      }

      setAvailableItems(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setIsLoading(false);
    }
  };

  // Gerar vitória simulada
  const generateSimulatedWin = (): WinData => {
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const randomUser = simulatedUserNames[Math.floor(Math.random() * simulatedUserNames.length)];
    
    return {
      id: `sim_${Date.now()}_${Math.random()}`,
      name: randomUser,
      prize: randomItem?.name || 'Item Especial',
      image: randomItem?.image_url || '',
      time: 'Agora mesmo',
      isReal: false
    };
  };

  // Inicializar com dados simulados + reais
  const initializeWins = () => {
    const initialWins: WinData[] = [];
    
    // Adicionar vitórias reais se existirem
    if (realWins.length > 0) {
      initialWins.push(...realWins.slice(0, 2));
    }
    
    // Completar com dados simulados
    while (initialWins.length < 4) {
      initialWins.push(generateSimulatedWin());
    }
    
    setWins(initialWins);
  };

  // Rotação natural com dados híbridos
  const startNaturalRotation = () => {
    if (availableItems.length === 0) return;

    const rotateWins = () => {
      // Verificar se há vitórias reais pendentes
      const pendingRealWins = realWins.filter(realWin => 
        !wins.some(win => win.id === realWin.id)
      );

      let newWin: WinData;
      
      if (pendingRealWins.length > 0 && Math.random() < 0.4) {
        // 40% de chance de usar vitória real
        newWin = pendingRealWins[0];
      } else {
        // Usar dados simulados
        newWin = generateSimulatedWin();
      }
      
      setWins(prev => [newWin, ...prev.slice(0, 3)]);

      // Delay - mais rápido para vitórias reais (8s), mais lento para simuladas (6-12s)
      const nextDelay = newWin.isReal 
        ? 8000 // Vitórias reais aparecem em 8 segundos
        : Math.random() * 6000 + 6000; // Simuladas entre 6-12 segundos
      setTimeout(rotateWins, nextDelay);
    };

    // Pausa inicial
    const initialDelay = Math.random() * 3000 + 2000;
    setTimeout(rotateWins, initialDelay);
  };

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRecentWins(), fetchAvailableItems()]);
    };
    loadData();
  }, []);

  // Inicializar quando dados estiverem prontos
  useEffect(() => {
    if (!isLoading && availableItems.length > 0) {
      initializeWins();
      startNaturalRotation();
    }
  }, [isLoading, availableItems, realWins]);

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
              } ${
                win.isReal ? 'ring-2 ring-green-500/30' : ''
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
