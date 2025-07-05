
import { useState, useRef, useEffect } from 'react';
import { DatabaseItem } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SpinCarouselHeader from './SpinCarouselHeader';
import CarouselContainer from './CarouselContainer';
import SpinControls from './SpinControls';

interface DynamicSpinCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  onPrizeWon: (prize: DatabaseItem) => void;
  chestName: string;
}

type SpinPhase = 'ready' | 'spinning' | 'slowing' | 'stopped' | 'showing-result';

const DynamicSpinCarousel = ({ 
  isOpen, 
  onClose, 
  chestType, 
  onPrizeWon, 
  chestName 
}: DynamicSpinCarouselProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<DatabaseItem | null>(null);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('ready');
  const [chestItems, setChestItems] = useState<DatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Buscar itens do baú específico
  useEffect(() => {
    const fetchChestItems = async () => {
      if (!chestType) return;
      
      try {
        setLoading(true);
        
        // Buscar itens com suas probabilidades do baú específico
        const { data: probabilities, error } = await supabase
          .from('chest_item_probabilities')
          .select(`
            *,
            item:items(*)
          `)
          .eq('chest_type', chestType)
          .eq('is_active', true);

        if (error) throw error;

        // Expandir itens baseado no peso de probabilidade
        const expandedItems: DatabaseItem[] = [];
        
        probabilities?.forEach(prob => {
          if (prob.item) {
            const item = {
              ...prob.item,
              rarity: prob.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
              delivery_type: prob.item.delivery_type as 'digital' | 'physical'
            } as DatabaseItem;
            
            // Adicionar o item baseado no peso de probabilidade
            for (let i = 0; i < prob.probability_weight; i++) {
              expandedItems.push(item);
            }
          }
        });

        // Se não há itens, usar itens padrão
        if (expandedItems.length === 0) {
          const { data: defaultItems } = await supabase
            .from('items')
            .select('*')
            .eq('is_active', true)
            .limit(10);
            
          if (defaultItems) {
            expandedItems.push(...defaultItems.map(item => ({
              ...item,
              rarity: item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
              delivery_type: item.delivery_type as 'digital' | 'physical'
            })));
          }
        }
        
        setChestItems(expandedItems);
      } catch (error: any) {
        console.error('Erro ao buscar itens do baú:', error);
        toast({
          title: "Erro ao carregar itens",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchChestItems();
    }
  }, [chestType, isOpen]);

  const spinCarousel = async () => {
    if (!carouselRef.current || chestItems.length === 0) return;

    setIsSpinning(true);
    setSelectedPrize(null);
    setSpinPhase('spinning');

    try {
      // Usar Edge Function para sorteio
      const { data, error } = await supabase.functions.invoke('draw-item-from-chest', {
        body: { chestType }
      });

      if (error) throw error;

      // Buscar dados completos do item sorteado
      const { data: wonPrize, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', data.itemId)
        .single();

      if (itemError) throw itemError;

      const typedPrize = {
        ...wonPrize,
        rarity: wonPrize.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        delivery_type: wonPrize.delivery_type as 'digital' | 'physical'
      } as DatabaseItem;

      // Encontrar o índice do item na lista de itens da roleta
      const prizeIndex = chestItems.findIndex(item => item.id === typedPrize.id);
      const targetIndex = prizeIndex >= 0 ? prizeIndex : Math.floor(Math.random() * chestItems.length);

      const carousel = carouselRef.current;
      const itemWidth = 154;
      const containerWidth = 1120;
      const centerPosition = containerWidth / 2 - 75;
      
      // Calcular posição para o item vencedor ficar no centro
      const extendedLength = chestItems.length * 10;
      const middleSection = Math.floor(extendedLength / 2);
      const finalTargetIndex = middleSection + targetIndex;
      const targetPosition = -(finalTargetIndex * itemWidth) + centerPosition;
      
      // Adicionar distância extra para efeito dramático
      const extraSpins = itemWidth * chestItems.length * 2;
      const finalPosition = targetPosition - extraSpins;

      // Reset da posição
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(0px)';
      carousel.offsetHeight; // Force reflow
      
      // Iniciar animação
      setTimeout(() => {
        carousel.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        carousel.style.transform = `translateX(${finalPosition}px)`;
      }, 100);

      // Fases da animação
      setTimeout(() => setSpinPhase('slowing'), 2500);
      
      setTimeout(() => {
        setSpinPhase('stopped');
        setSelectedPrize(typedPrize);
        setIsSpinning(false);
      }, 5000);

      setTimeout(() => setSpinPhase('showing-result'), 6000);

      setTimeout(() => {
        onPrizeWon(typedPrize);
        resetCarousel();
        onClose();
      }, 8000);

    } catch (error: any) {
      console.error('Erro no sorteio:', error);
      toast({
        title: "Erro no sorteio",
        description: error.message,
        variant: "destructive"
      });
      resetCarousel();
    }
  };

  const resetCarousel = () => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'none';
      carouselRef.current.style.transform = 'translateX(0px)';
    }
    setSpinPhase('ready');
    setSelectedPrize(null);
    setIsSpinning(false);
  };

  const handleClose = () => {
    resetCarousel();
    onClose();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando itens do {chestName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <SpinCarouselHeader 
          chestName={chestName}
          spinPhase={spinPhase}
          selectedPrize={selectedPrize}
        />

        <CarouselContainer
          prizes={chestItems}
          isSpinning={isSpinning}
          spinPhase={spinPhase}
          selectedPrize={selectedPrize}
          carouselRef={carouselRef}
        />

        <SpinControls
          isSpinning={isSpinning}
          selectedPrize={selectedPrize}
          spinPhase={spinPhase}
          onSpin={spinCarousel}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default DynamicSpinCarousel;
