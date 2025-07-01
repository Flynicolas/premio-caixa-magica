import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles } from 'lucide-react';
import ChestCard from '@/components/ChestCard';
import WinModal from '@/components/WinModal';
import WalletPanel from '@/components/WalletPanel';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import LiveWinsCarousel from '@/components/LiveWinsCarousel';
import Footer from '@/components/Footer';
import ChestItemsModal from '@/components/ChestItemsModal';
import ChestConfirmModal from '@/components/ChestConfirmModal';
import UpgradeChestModal from '@/components/UpgradeChestModal';
import { chestData, type ChestType, type Prize, type Chest } from '@/data/chestData';
import { calculateUserLevel } from '@/utils/levelSystem';
import SpinCarousel from '@/components/carousel/SpinCarousel';

const Index = () => {
  const [balance, setBalance] = useState(150);
  const [totalSpent, setTotalSpent] = useState(0);
  const [prizes, setPrizes] = useState<(Prize & { chestType: ChestType, timestamp: Date })[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSpinCarouselOpen, setIsSpinCarouselOpen] = useState(false);
  const [currentChestType, setCurrentChestType] = useState<ChestType | null>(null);
  const [isChestItemsModalOpen, setIsChestItemsModalOpen] = useState(false);
  const [selectedChest, setSelectedChest] = useState<Chest | null>(null);
  const [isChestConfirmOpen, setIsChestConfirmOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingChestType, setPendingChestType] = useState<ChestType | null>(null);

  const userLevel = calculateUserLevel(totalSpent, prizes.length);

  // Helper function to get next chest in hierarchy
  const getNextChest = (currentType: ChestType): { type: ChestType; chest: Chest } | null => {
    const hierarchy: ChestType[] = ['silver', 'gold', 'diamond', 'ruby', 'premium'];
    const currentIndex = hierarchy.indexOf(currentType);
    if (currentIndex < hierarchy.length - 1) {
      const nextType = hierarchy[currentIndex + 1];
      return { type: nextType, chest: chestData[nextType] };
    }
    return null;
  };

  const openChest = (chestType: ChestType) => {
    setPendingChestType(chestType);
    setIsChestConfirmOpen(true);
  };

  const handleConfirmOpen = () => {
    if (!pendingChestType) return;
    
    const chest = chestData[pendingChestType];
    
    if (balance < chest.price) {
      alert('Saldo insuficiente! Adicione créditos à sua carteira.');
      return;
    }

    setBalance(prev => prev - chest.price);
    setTotalSpent(prev => prev + chest.price);
    setCurrentChestType(pendingChestType);
    setIsChestConfirmOpen(false);
    setPendingChestType(null);
    setIsSpinCarouselOpen(true);
  };

  const handleUpgrade = () => {
    if (!pendingChestType) return;
    
    const nextChest = getNextChest(pendingChestType);
    if (nextChest) {
      setIsChestConfirmOpen(false);
      setIsUpgradeModalOpen(true);
    }
  };

  const handleConfirmUpgrade = () => {
    if (!pendingChestType) return;
    
    const nextChest = getNextChest(pendingChestType);
    if (!nextChest) return;
    
    if (balance < nextChest.chest.price) {
      alert('Saldo insuficiente para o upgrade!');
      return;
    }

    setBalance(prev => prev - nextChest.chest.price);
    setTotalSpent(prev => prev + nextChest.chest.price);
    setCurrentChestType(nextChest.type);
    setIsUpgradeModalOpen(false);
    setPendingChestType(null);
    setIsSpinCarouselOpen(true);
  };

  const handleBackToOriginal = () => {
    setIsUpgradeModalOpen(false);
    setIsChestConfirmOpen(true);
  };

  const handleCloseModals = () => {
    setIsChestConfirmOpen(false);
    setIsUpgradeModalOpen(false);
    setPendingChestType(null);
  };

  const handlePrizeWon = (prize: Prize) => {
    setCurrentPrize(prize);
    if (currentChestType) {
      setPrizes(prev => [...prev, {
        ...prize,
        chestType: currentChestType,
        timestamp: new Date()
      }]);
    }
    setIsSpinCarouselOpen(false);
    setCurrentChestType(null);
    // Show win modal after carousel closes
    setTimeout(() => {
      setIsWinModalOpen(true);
    }, 500);
  };

  const handleViewItems = (chestType: ChestType) => {
    setSelectedChest(chestData[chestType]);
    setIsChestItemsModalOpen(true);
  };

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
    setTotalSpent(prev => prev + amount);
  };

  return (
    <div className="min-h-screen">
      <Header 
        balance={balance}
        onAddBalance={() => setIsWalletOpen(true)}
      />

      {/* Hero Section with Slider */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <HeroSlider />
        </div>
      </section>

      {/* Live Wins */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <LiveWinsCarousel />
        </div>
      </section>

      {/* Hero Content */}
      <section className="py-12 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-primary bg-clip-text">
              Tesouros Aguardam
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Abra baús mágicos e descubra prêmios incríveis! De smartwatches a iPhones, 
            motocicletas e viagens dos sonhos.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <Gift className="w-4 h-4 mr-2" />
              +1000 Prêmios
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Sorteios Diários
            </Badge>
          </div>
        </div>
      </section>

      {/* Chests Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 text-primary">
            Escolha seu Baú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(chestData).map(([key, chest]) => (
              <ChestCard
                key={key}
                chest={chest}
                chestType={key as ChestType}
                onOpen={() => openChest(key as ChestType)}
                onViewItems={() => handleViewItems(key as ChestType)}
                balance={balance}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <WinModal
        isOpen={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        prize={currentPrize}
      />

      <WalletPanel
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={balance}
        prizes={prizes}
        onAddBalance={addBalance}
      />

      <SpinCarousel
        isOpen={isSpinCarouselOpen}
        onClose={() => setIsSpinCarouselOpen(false)}
        prizes={currentChestType ? chestData[currentChestType].prizes : []}
        onPrizeWon={handlePrizeWon}
        chestName={currentChestType ? chestData[currentChestType].name : ''}
      />

      <ChestItemsModal
        isOpen={isChestItemsModalOpen}
        onClose={() => setIsChestItemsModalOpen(false)}
        chest={selectedChest}
      />

      {/* New Confirmation Modal */}
      {pendingChestType && (
        <ChestConfirmModal
          isOpen={isChestConfirmOpen}
          onClose={handleCloseModals}
          onConfirm={handleConfirmOpen}
          onUpgrade={handleUpgrade}
          chestType={pendingChestType}
          chestName={chestData[pendingChestType].name}
          chestPrice={chestData[pendingChestType].price}
          balance={balance}
          nextChestType={getNextChest(pendingChestType)?.type}
          nextChestName={getNextChest(pendingChestType)?.chest.name}
          nextChestPrice={getNextChest(pendingChestType)?.chest.price}
        />
      )}

      {/* Upgrade Modal */}
      {pendingChestType && (
        <UpgradeChestModal
          isOpen={isUpgradeModalOpen}
          onClose={handleCloseModals}
          onConfirm={handleConfirmUpgrade}
          onBack={handleBackToOriginal}
          chestType={getNextChest(pendingChestType)?.type || 'gold'}
          chestName={getNextChest(pendingChestType)?.chest.name || ''}
          chestPrice={getNextChest(pendingChestType)?.chest.price || 0}
          balance={balance}
          originalChestName={chestData[pendingChestType].name}
        />
      )}
    </div>
  );
};

export default Index;
