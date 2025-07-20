
import { useState, useEffect } from 'react';
import { Radio, Trophy, Gift } from 'lucide-react';
import ItemCard from './ItemCard';
import { supabase } from '@/integrations/supabase/client';

interface WinData {
  id: string;
  user_name: string;
  item_name: string;
  item_image: string;
  item_rarity: 'common' | 'rare' | 'epic' | 'legendary';
  won_at: string;
  isReal?: boolean; // Flag para identificar vitórias reais
}

interface RealtimeWinsCarouselProps {
  showIcons?: boolean;
  className?: string;
}

const RealtimeWinsCarousel = ({ showIcons = true, className = "" }: RealtimeWinsCarouselProps) => {
  const [currentItems, setCurrentItems] = useState<WinData[]>([]);
  const [realWins, setRealWins] = useState<WinData[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Nomes simulados para as vitórias
  const simulatedUserNames = [
    'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Lima',
    'Fernanda Rocha', 'Roberto Alves', 'Juliana Souza', 'Diego Ferreira', 'Camila Ribeiro',
    'Bruno Martins', 'Larissa Pereira', 'Rafael Gonçalves', 'Gabriela Cardoso', 'Lucas Barbosa',
    'Amanda Nascimento', 'Thiago Melo', 'Patrícia Dias', 'Felipe Castro', 'Bianca Moreira'
  ];

  // Buscar vitórias reais do banco de dados
  const fetchRecentWins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          id,
          won_at,
          rarity,
          item:items(
            name,
            image_url,
            rarity
          ),
          user:profiles(
            full_name
          )
        `)
        .not('item', 'is', null)
        .not('user', 'is', null)
        .order('won_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar vitórias:', error);
        return;
      }

      const formattedWins: WinData[] = (data || [])
        .filter(win => win.item && win.user && Array.isArray(win.user) && win.user.length > 0)
        .map(win => ({
          id: win.id,
          user_name: Array.isArray(win.user) ? win.user[0]?.full_name || 'Usuário' : 'Usuário',
          item_name: Array.isArray(win.item) ? win.item[0]?.name || 'Item' : win.item?.name || 'Item',
          item_image: Array.isArray(win.item) ? win.item[0]?.image_url || '' : win.item?.image_url || '',
          item_rarity: (Array.isArray(win.item) ? win.item[0]?.rarity : win.item?.rarity) as 'common' | 'rare' | 'epic' | 'legendary' || 'common',
          won_at: win.won_at,
          isReal: true
        }));

      setRealWins(formattedWins);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  // Buscar itens disponíveis para simulação
  const fetchAvailableItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .limit(50);

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
      user_name: randomUser,
      item_name: randomItem?.name || 'Item Especial',
      item_image: randomItem?.image_url || '',
      item_rarity: randomItem?.rarity || 'common',
      won_at: new Date().toISOString(),
      isReal: false
    };
  };

  // Inicializar carrossel com dados simulados
  const initializeCarousel = () => {
    if (availableItems.length === 0) return;

    const initialItems: WinData[] = [];
    
    // Adicionar algumas vitórias reais se existirem
    if (realWins.length > 0) {
      initialItems.push(...realWins.slice(0, 4));
    }
    
    // Completar com dados simulados até ter 12 itens
    while (initialItems.length < 12) {
      initialItems.push(generateSimulatedWin());
    }
    
    setCurrentItems(initialItems);
  };

  // Função para manter o fluxo natural com dados simulados
  const startNaturalFlow = () => {
    if (availableItems.length === 0) return;

    const addNewItem = () => {
      // Verificar se há vitórias reais pendentes na fila
      const pendingRealWins = realWins.filter(realWin => 
        !currentItems.some(current => current.id === realWin.id)
      );

      let newItem: WinData;
      
      if (pendingRealWins.length > 0 && Math.random() < 0.3) {
        // 30% de chance de usar vitória real se disponível
        newItem = pendingRealWins[0];
      } else {
        // Usar dados simulados
        newItem = generateSimulatedWin();
      }
      
      setCurrentItems(prev => [newItem, ...prev.slice(0, 11)]);

      // Delay variável entre 3 a 8 segundos para comportamento natural
      const nextDelay = Math.random() * 5000 + 3000;
      setTimeout(addNewItem, nextDelay);
    };

    // Pausa inicial antes de começar o fluxo
    const initialDelay = Math.random() * 3000 + 2000;
    setTimeout(addNewItem, initialDelay);
  };

  // Configurar realtime para novas vitórias verdadeiras
  useEffect(() => {
    const channel = supabase
      .channel('new-wins')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_inventory' 
        },
        async (payload) => {
          try {
            // Buscar dados completos da nova vitória
            const { data: newWinData } = await supabase
              .from('user_inventory')
              .select(`
                id,
                won_at,
                rarity,
                item:items(
                  name,
                  image_url,
                  rarity
                ),
                user:profiles(
                  full_name
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newWinData && newWinData.item && newWinData.user && Array.isArray(newWinData.user) && newWinData.user.length > 0) {
              const newWin: WinData = {
                id: newWinData.id,
                user_name: Array.isArray(newWinData.user) ? newWinData.user[0]?.full_name || 'Usuário' : 'Usuário',
                item_name: Array.isArray(newWinData.item) ? newWinData.item[0]?.name || 'Item' : newWinData.item?.name || 'Item',
                item_image: Array.isArray(newWinData.item) ? newWinData.item[0]?.image_url || '' : newWinData.item?.image_url || '',  
                item_rarity: (Array.isArray(newWinData.item) ? newWinData.item[0]?.rarity : newWinData.item?.rarity) as 'common' | 'rare' | 'epic' | 'legendary' || 'common',
                won_at: newWinData.won_at,
                isReal: true
              };

              // Adicionar à lista de vitórias reais
              setRealWins(prev => [newWin, ...prev]);
              
              // Delay natural antes de mostrar a nova vitória real
              setTimeout(() => {
                setCurrentItems(prev => [newWin, ...prev.slice(0, 11)]);
              }, Math.random() * 2000 + 1000);
            }
          } catch (error) {
            console.error('Erro ao processar nova vitória:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchRecentWins(), fetchAvailableItems()]);
    };
    loadData();
  }, []);

  // Inicializar carrossel quando os dados estiverem prontos
  useEffect(() => {
    if (!isLoading && availableItems.length > 0) {
      initializeCarousel();
      startNaturalFlow();
    }
  }, [isLoading, availableItems, realWins]);

  if (isLoading) {
    return (
      <div className={`relative bg-gradient-to-r from-gray-900/40 via-gray-800/30 to-gray-900/40 border-2 border-primary/30 rounded-xl p-6 shadow-2xl overflow-hidden ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-primary">Carregando vitórias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-r from-gray-900/40 via-gray-800/30 to-gray-900/40 border-2 border-primary/30 rounded-xl p-6 shadow-2xl overflow-hidden ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/50 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/50 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/50 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/50 rounded-br" />

      {showIcons && (
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="w-px h-6 bg-primary/30" />
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Vitórias em Tempo Real
            </h2>
          </div>
          <Gift className="w-6 h-6 text-primary/60 animate-pulse" />
        </div>
      )}
      
      <div className="relative overflow-hidden z-10">
        <div className="flex space-x-4 transition-transform duration-500 ease-out">
          {currentItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`flex-shrink-0 transition-all duration-500 ${
                index === 0 ? 'animate-slide-in-left' : ''
              } ${
                index === 11 ? 'animate-fade-out opacity-60' : ''
              }`}
            >
              <div className="flex flex-col items-center">
                <ItemCard
                  item={{
                    name: item.item_name,
                    image_url: item.item_image,
                    rarity: item.item_rarity,
                  }}
                  size="sm"
                  showRarity={false}
                  className={`${
                    index === 0 ? 'border-primary/50 shadow-md shadow-primary/30 bg-gradient-to-b from-primary/10 to-card/60' : ''
                  } ${
                    item.isReal ? 'ring-2 ring-green-500/30' : ''
                  }`}
                />
                <p className="text-xs text-center text-primary/80 font-medium truncate w-full mt-1">
                  {item.user_name} ganhou
                </p>
              </div>
              
              {/* Glow effect for new items */}
              {index === 0 && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>
        
        {/* Enhanced gradient fade effects */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900/80 via-gray-900/40 to-transparent pointer-events-none z-20" />
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};

export default RealtimeWinsCarousel;
