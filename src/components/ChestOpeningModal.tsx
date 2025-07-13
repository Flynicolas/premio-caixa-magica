
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Sparkles } from 'lucide-react';
import SpinRouletteWheel from './SpinRouletteWheel';
import ItemCard from './ItemCard';
import { SpinItem } from './roulette/types';
import { useRouletteLogic } from '@/hooks/useRouletteLogic';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  chestName: string;
  chestPrice: number;
  onPrizeWon: (prize: DatabaseItem) => void;
}

const ChestOpeningModal = ({ 
  isOpen, 
  onClose, 
  chestType, 
  chestName, 
  chestPrice,
  onPrizeWon
}: ChestOpeningModalProps) => {
  const [phase, setPhase] = useState<'preview' | 'spinning' | 'result'>('preview');
  const [wonItem, setWonItem] = useState<SpinItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { generateRoulette, rouletteData, isLoading } = useRouletteLogic();
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset modal state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setPhase('preview');
      setWonItem(null);
      setIsSpinning(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const chestConfigs = {
    silver: {
      gradient: 'from-gray-400 to-gray-600',
      glow: 'shadow-gray-400/30',
      accent: 'text-gray-300'
    },
    gold: {
      gradient: 'from-yellow-400 to-yellow-600',
      glow: 'shadow-yellow-400/30',
      accent: 'text-yellow-300'
    },
    delas: {
      gradient: 'from-pink-400 to-rose-500',
      glow: 'shadow-pink-400/30',
      accent: 'text-pink-300'
    },
    diamond: {
      gradient: 'from-blue-400 to-cyan-400',
      glow: 'shadow-blue-400/30',
      accent: 'text-blue-300'
    },
    ruby: {
      gradient: 'from-red-400 to-pink-500',
      glow: 'shadow-red-400/30',
      accent: 'text-red-300'
    },
    premium: {
      gradient: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/30',
      accent: 'text-purple-300'
    }
  };

  const config = chestConfigs[chestType as keyof typeof chestConfigs] || chestConfigs.silver;

  const handleOpenChest = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para abrir baús.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('=== INICIANDO PROCESSO DE ABERTURA DO BAÚ ===');
      console.log('Usuário:', user.id);
      console.log('Tipo do baú:', chestType);
      console.log('Preço do baú:', chestPrice);

      // Chamar a função edge que faz tudo: compra, sorteia e registra
      const { data: result, error } = await supabase.functions.invoke('draw-item-from-chest', {
        body: { 
          chestType, 
          userId: user.id, 
          chestPrice: chestPrice,
          chestId: null // Será criado pela função
        }
      });

      if (error) {
        console.error('Erro na função draw-item-from-chest:', error);
        throw error;
      }

      console.log('Item sorteado:', result);

      if (!result?.item) {
        throw new Error('Nenhum item foi retornado');
      }

      // Gerar dados da roleta para animação
      setPhase('spinning');
      const rouletteResult = await generateRoulette(chestType, 25);
      
      if (rouletteResult) {
        // Substituir o item vencedor na roleta pelo item real sorteado
        rouletteResult.winnerItem = {
          id: result.item.id,
          name: result.item.name,
          image_url: result.item.image_url,
          rarity: result.item.rarity
        };

        // Atualizar o slot central com o item correto
        if (rouletteResult.rouletteSlots && rouletteResult.centerIndex !== undefined) {
          rouletteResult.rouletteSlots[rouletteResult.centerIndex] = rouletteResult.winnerItem;
        }

        // Iniciar animação
        setTimeout(() => {
          setIsSpinning(true);
        }, 1000);
      }

    } catch (error: any) {
      console.error('Erro ao abrir baú:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao abrir o baú. Tente novamente.",
        variant: "destructive",
      });
      setPhase('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpinComplete = (item: SpinItem) => {
    console.log('Animação da roleta completa, item:', item);
    setWonItem(item);
    setIsSpinning(false);
    setPhase('result');
    
    // Convert SpinItem to DatabaseItem and map special to legendary
    const mappedRarity = item.rarity === 'special' ? 'legendary' : item.rarity as 'common' | 'rare' | 'epic' | 'legendary';
    
    const databaseItem: DatabaseItem = {
      id: item.id,
      name: item.name,
      description: null,
      image_url: item.image_url,
      category: 'product',
      rarity: mappedRarity,
      base_value: 0,
      delivery_type: 'digital',
      delivery_instructions: null,
      requires_address: false,
      requires_document: false,
      is_active: true,
      chest_types: null,
      probability_weight: null,
      import_source: null,
      tags: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Chamar callback para notificar o componente pai
    onPrizeWon(databaseItem);
    
    toast({
      title: "🎉 Parabéns!",
      description: `Você ganhou: ${item.name}`,
    });
  };

  const handleClose = () => {
    setPhase('preview');
    setWonItem(null);
    setIsSpinning(false);
    onClose();
  };

  const handleOpenAnother = () => {
    setPhase('preview');
    setWonItem(null);
    setIsSpinning(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-6xl max-h-[90vh] p-0 bg-gradient-to-br ${config.gradient} border-0`}>
        <div className="absolute inset-0 bg-black/20 rounded-lg" />
        
        <DialogHeader className="relative z-10 p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-2xl font-bold text-white drop-shadow-lg ${config.accent}`}>
              {phase === 'preview' && (
                <>
                  <Sparkles className="inline w-6 h-6 mr-2" />
                  Abrir {chestName}
                </>
              )}
              {phase === 'spinning' && '🎰 Girando a Roleta'}
              {phase === 'result' && '🎉 Resultado do Sorteio'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20">
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative z-10 p-6">
          {/* Preview Phase */}
          {phase === 'preview' && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className={`inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${config.glow}`}>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Prepare-se para o sorteio!
                  </h3>
                  <p className="text-white/80 text-lg">
                    Custo: <span className="font-bold text-white">R$ {chestPrice.toFixed(2)}</span>
                  </p>
                </div>
                <p className="text-white/70 text-sm max-w-md mx-auto">
                  A roleta irá girar e revelar seu prêmio. Boa sorte!
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose} className="border-white/30 text-white hover:bg-white/10">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleOpenChest} 
                  disabled={isLoading || isProcessing}
                  className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold border border-white/30 ${config.glow}`}
                >
                  {isLoading || isProcessing ? 'Processando...' : `🎲 Girar Roleta`}
                </Button>
              </div>
            </div>
          )}

          {/* Spinning Phase */}
          {phase === 'spinning' && rouletteData && (
            <div className="space-y-8">
              <div className="text-center">
                <div className={`inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${config.glow}`}>
                  <p className="text-lg font-semibold mb-2 text-white">🎰 Girando a roleta...</p>
                  <p className="text-sm text-white/80">
                    Aguarde o resultado!
                  </p>
                </div>
              </div>
              
              <SpinRouletteWheel
                rouletteData={rouletteData}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                chestType={chestType}
                className="mb-8"
              />
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && wonItem && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className={`inline-block p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${config.glow}`}>
                  <h3 className="text-3xl font-bold text-white mb-4">🎉 Parabéns!</h3>
                  <p className="text-xl text-white/90 mb-4">Você ganhou:</p>
                  
                  <div className="flex justify-center mb-4">
                    <ItemCard 
                      item={wonItem} 
                      size="lg" 
                      showRarity={true}
                      className="animate-scale-in"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-white">{wonItem.name}</h4>
                    <p className="text-lg capitalize font-semibold" style={{
                      color: wonItem.rarity === 'common' ? '#9CA3AF' :
                             wonItem.rarity === 'rare' ? '#3B82F6' :
                             wonItem.rarity === 'epic' ? '#8B5CF6' :
                             wonItem.rarity === 'legendary' ? '#F59E0B' :
                             wonItem.rarity === 'special' ? '#EC4899' :
                             '#9CA3AF'
                    }}>
                      {wonItem.rarity === 'common' && 'Comum'}
                      {wonItem.rarity === 'rare' && 'Raro'}
                      {wonItem.rarity === 'epic' && 'Épico'}
                      {wonItem.rarity === 'legendary' && 'Lendário'}
                      {wonItem.rarity === 'special' && 'Especial'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleClose} className="border-white/30 text-white hover:bg-white/10">
                  Fechar
                </Button>
                <Button 
                  onClick={handleOpenAnother}
                  className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold border border-white/30 ${config.glow}`}
                >
                  Abrir Outro Baú
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestOpeningModal;
