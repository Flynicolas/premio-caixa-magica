
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
import LoginModal from '@/components/LoginModal';
import { chestData, type ChestType, type Prize } from '@/data/chestData';
import { calculateUserLevel } from '@/utils/levelSystem';
import SpinCarousel from '@/components/SpinCarousel';

const Index = () => {
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [prizes, setPrizes] = useState<(Prize & { chestType: ChestType, timestamp: Date })[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isSpinCarouselOpen, setIsSpinCarouselOpen] = useState(false);
  const [currentChestType, setCurrentChestType] = useState<ChestType | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const userLevel = calculateUserLevel(totalSpent, prizes.length);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setBalance(150);
    setTotalSpent(200);
  };

  const openChest = (chestType: ChestType) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const chest = chestData[chestType];
    
    if (balance < chest.price) {
      alert('Saldo insuficiente! Adicione créditos à sua carteira.');
      return;
    }

    setBalance(prev => prev - chest.price);
    setTotalSpent(prev => prev + chest.price);
    setCurrentChestType(chestType);
    setIsSpinCarouselOpen(true);
  };

  const handlePrizeWon = (prize: Prize) => {
    if (currentChestType) {
      setPrizes(prev => [...prev, {
        ...prize,
        chestType: currentChestType,
        timestamp: new Date()
      }]);
    }
    setIsSpinCarouselOpen(false);
    setCurrentChestType(null);
  };

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
    setTotalSpent(prev => prev + amount);
  };

  const handleWalletOpen = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsWalletOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header 
        balance={balance}
        user={user}
        onAddBalance={handleWalletOpen}
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
            <span className="gold-gradient bg-clip-text text-transparent">
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
          <h3 className="text-4xl font-bold text-center mb-12 gold-gradient bg-clip-text text-transparent">
            Escolha seu Baú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(chestData).map(([key, chest]) => (
              <ChestCard
                key={key}
                chest={chest}
                chestType={key as ChestType}
                onOpen={() => openChest(key as ChestType)}
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
