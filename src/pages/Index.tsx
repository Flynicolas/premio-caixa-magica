
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import HeroSlider from '@/components/HeroSlider';
import ChestCard from '@/components/ChestCard';
import RealtimeWinsCarousel from '@/components/RealtimeWinsCarousel';
import AuthModal from '@/components/AuthModal';
import WalletPanel from '@/components/WalletPanel';
import ChestItemsModal from '@/components/ChestItemsModal';
import ChestConfirmModal from '@/components/ChestConfirmModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import WinModal from '@/components/WinModal';
import { chestData, ChestType, Chest } from '@/data/chestData';
import { DatabaseItem } from '@/types/database';
import { useInventory } from '@/hooks/useInventory';

const Index = () => {
  const { user } = useAuth();
  const { walletData, refreshData } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChestOpening, setShowChestOpening] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedChest, setSelectedChest] = useState<{ chest: Chest; type: ChestType } | null>(null);
  const [wonPrize, setWonPrize] = useState<DatabaseItem | null>(null);
  const { userItems } = useInventory();

  // Definir ordem específica dos baús
  const chestOrder: ChestType[] = ['silver', 'gold', 'diamond', 'ruby', 'premium', 'delas'];

  const handleOpenWallet = () => {
    setShowWalletPanel(true);
  };

  const handleChestOpen = (chestType: ChestType) => {
    const chest = chestData[chestType];
    setSelectedChest({ chest, type: chestType });
    setShowConfirmModal(true);
  };

  const handleChestViewItems = (chestType: ChestType) => {
    const chest = chestData[chestType];
    setSelectedChest({ chest, type: chestType });
    setShowItemsModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedChest) return;
    
    setShowConfirmModal(false);
    setShowChestOpening(true);
  };

  const handleChestOpeningComplete = (prize: DatabaseItem) => {
    setWonPrize(prize);
    setShowChestOpening(false);
    setShowWinModal(true);
    // Atualizar dados da carteira após a abertura
    refreshData();
  };

  const handleDirectChestOpening = (prize: DatabaseItem) => {
    setWonPrize(prize);
    setShowWinModal(true);
    // Atualizar dados da carteira após a abertura
    refreshData();
  };

  const getUpgradeChest = (currentType: ChestType): { type: ChestType; chest: Chest } | null => {
    const chestOrder: ChestType[] = ['silver', 'gold', 'delas', 'diamond', 'ruby', 'premium'];
    const currentIndex = chestOrder.indexOf(currentType);
    if (currentIndex < chestOrder.length - 1) {
      const nextType = chestOrder[currentIndex + 1];
      return { type: nextType, chest: chestData[nextType] };
    }
    return null;
  };

  const mappedPrizes = userItems.map((entry) => ({
    name: entry.item?.name || 'Prêmio desconhecido',
    description: entry.item?.description || '',
    image: entry.item?.image_url || '',
    rarity: entry.item?.rarity || 'common',
    value: entry.item?.base_value !== undefined
  ? entry.item.base_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  : 'R$ 0,00',
    chestType: entry.chest_type as ChestType, // <=== aqui
    timestamp: new Date(entry.won_at),
  }));


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Slider as main focus */}
        <div className="mb-8">
          <HeroSlider />
        </div>

        {/* Real-time Wins Carousel */}
        <RealtimeWinsCarousel className="mb-12" />

        {/* Featured Chests - 3 columns, 2 rows */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary leading-snug">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cada baú tem diferentes chances de prêmios. Quanto maior o investimento, maiores as recompensas!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={chestType}>
                <ChestCard
                  chest={chestData[chestType]}
                  chestType={chestType}
                  onOpen={() => handleChestOpen(chestType)}
                  onViewItems={() => handleChestViewItems(chestType)}
                  balance={walletData?.balance || 0}
                  isAuthenticated={!!user}
                  onPrizeWon={handleDirectChestOpening}
                  onAddBalance={handleOpenWallet}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action - only show for non-authenticated users */}
        {!user && (
          <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl border border-primary/20">
            <h2 className="text-4xl font-bold mb-6 text-primary">
              Pronto para Ganhar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cadastre-se agora e receba R$ 50 de bônus para começar a jogar!
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="gold-gradient text-black text-xl font-bold py-4 px-12 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              Começar Agora - Ganhe R$ 50! 🎯
            </button>
          </section>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <WalletPanel
        isOpen={showWalletPanel}
        onClose={() => setShowWalletPanel(false)}
        balance={walletData?.balance || 0}
        prizes={mappedPrizes}
      />


      <ChestItemsModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        chestType={selectedChest?.type || 'silver'}
      />

      <ChestConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPurchase}
        onUpgrade={() => {
          const upgrade = getUpgradeChest(selectedChest?.type!);
          if (upgrade) {
            setSelectedChest(upgrade);
          }
        }}
        chestType={selectedChest?.type!}
        chestName={selectedChest?.chest.name || ''}
        chestPrice={selectedChest?.chest.price || 0}
        balance={walletData?.balance || 0}
        nextChestType={getUpgradeChest(selectedChest?.type!)?.type}
        nextChestName={getUpgradeChest(selectedChest?.type!)?.chest.name}
        nextChestPrice={getUpgradeChest(selectedChest?.type!)?.chest.price}
      />

      <ChestOpeningModal
        isOpen={showChestOpening}
        onClose={() => setShowChestOpening(false)}
        chestType={selectedChest?.type || 'silver'}
        chestName={selectedChest?.chest.name || ''}
        chestPrice={selectedChest?.chest.price || 0}
        onPrizeWon={handleChestOpeningComplete}
      />

     
    </div>
  );
};

export default Index;
