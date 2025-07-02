
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import HeroSlider from '@/components/HeroSlider';
import ChestCard from '@/components/ChestCard';
import LiveWinsCarousel from '@/components/LiveWinsCarousel';
import AuthModal from '@/components/AuthModal';
import WalletPanel from '@/components/WalletPanel';
import ChestItemsModal from '@/components/ChestItemsModal';
import ChestConfirmModal from '@/components/ChestConfirmModal';
import SpinCarousel from '@/components/carousel/SpinCarousel';
import WinModal from '@/components/WinModal';
import { chestData, ChestType, Chest, Prize } from '@/data/chestData';

const Index = () => {
  const { user } = useAuth();
  const { walletData, purchaseChest } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSpinCarousel, setShowSpinCarousel] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedChest, setSelectedChest] = useState<{ chest: Chest; type: ChestType } | null>(null);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

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
    
    const result = await purchaseChest(selectedChest.type, selectedChest.chest.price);
    if (!result.error) {
      setShowConfirmModal(false);
      // Open spin carousel
      setShowSpinCarousel(true);
    }
  };

  const handlePrizeWon = (prize: Prize) => {
    setWonPrize(prize);
    setShowSpinCarousel(false);
    setShowWinModal(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Slider as main focus */}
        <div className="mb-8">
          <HeroSlider />
        </div>

        {/* Live Wins with improved spacing and animations */}
        <LiveWinsCarousel />

        {/* Featured Chests - 3 columns, 2 rows */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cada baú tem diferentes chances de prêmios. Quanto maior o investimento, maiores as recompensas!
            </p>
          </div>

          <div className="grid grid-cols-3 grid-rows-2 gap-6 max-w-6xl mx-auto">
            {Object.entries(chestData).map(([chestType, chest]) => (
              <div key={chestType}>
                <ChestCard
                  chest={chest}
                  chestType={chestType as ChestType}
                  onOpen={() => handleChestOpen(chestType as ChestType)}
                  onViewItems={() => handleChestViewItems(chestType as ChestType)}
                  balance={walletData?.balance || 0}
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
        prizes={[]}
        onAddBalance={(amount) => {}}
      />

      <ChestItemsModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        chest={selectedChest?.chest || null}
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

      <SpinCarousel
        isOpen={showSpinCarousel}
        onClose={() => setShowSpinCarousel(false)}
        prizes={selectedChest?.chest.prizes || []}
        onPrizeWon={handlePrizeWon}
        chestName={selectedChest?.chest.name || ''}
      />

      <WinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        prize={wonPrize}
        onCollect={() => {
          setShowWinModal(false);
          setWonPrize(null);
          setSelectedChest(null);
        }}
      />
    </div>
  );
};

export default Index;
