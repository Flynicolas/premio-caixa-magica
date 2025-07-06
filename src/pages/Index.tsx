import { useState } from 'react';
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
import SpinCarousel from '@/components/carousel/SpinCarousel';
import WinModal from '@/components/WinModal';
import { chestData, ChestType, Chest } from '@/data/chestData';
import { DatabaseItem } from '@/types/database';
import ChestSimulator from '@/components/ChestSimulator';
import { useDemoAccount } from '@/hooks/useDemoAccount';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const Index = () => {
  const { user } = useAuth();
  const { walletData, purchaseChest, PaymentModalComponent } = useWallet();
  const { isDemoAccount, demoAccount } = useDemoAccount();
  const { hasAdminBypass } = useAdminAccess();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSpinCarousel, setShowSpinCarousel] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedChest, setSelectedChest] = useState<{ chest: Chest; type: ChestType } | null>(null);
  const [wonPrize, setWonPrize] = useState<DatabaseItem | null>(null);

  const handleOpenWallet = () => {
    setShowWalletPanel(true);
  };

  const handleChestOpen = (chestType: ChestType) => {
    const chest = chestData[chestType];
    setSelectedChest({ chest, type: chestType });
    
    // Admin bypass ou conta demo
    if (hasAdminBypass() || isDemoAccount) {
      setShowSpinCarousel(true);
      return;
    }
    
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
      setShowSpinCarousel(true);
    }
  };

  const handlePrizeWon = (prize: DatabaseItem) => {
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

  const convertPrizesToDatabaseItems = (prizes: any[]): DatabaseItem[] => {
    return prizes.map((prize, index) => ({
      id: `prize-${index}`,
      name: prize.name,
      description: prize.description || null,
      image_url: prize.image || null,
      category: 'product',
      rarity: prize.rarity || 'common',
      base_value: prize.value || 0,
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
    } as DatabaseItem));
  };

  // Obter saldo apropriado (demo ou real)
  const getCurrentBalance = () => {
    if (isDemoAccount && demoAccount) {
      return demoAccount.balance;
    }
    return walletData?.balance || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Slider as main focus */}
        <div className="mb-8">
          <HeroSlider />
        </div>

        {/* Demo Account Banner */}
        {isDemoAccount && demoAccount && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">🎮 Modo Demonstração</h2>
            <p className="mb-3">
              Você está usando uma conta demo com <strong>R$ {demoAccount.balance.toFixed(2)}</strong> que se renova diariamente!
            </p>
            <p className="text-sm opacity-90">
              Cadastre-se para jogar de verdade e resgatar prêmios reais.
            </p>
          </div>
        )}

        {/* Simulador de Baú Grátis - Para usuários não cadastrados */}
        {!user && (
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-primary">
                🎁 Simulador de Abertura de Baú 🎁
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experimente como funciona nosso sistema! Simulação gratuita com alta chance de prêmios raros.
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <Button
                onClick={() => setShowSimulator(!showSimulator)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
              >
                {showSimulator ? 'Esconder Simulador' : '🎲 Testar Simulador Grátis'}
              </Button>
            </div>
            
            {showSimulator && (
              <div className="mb-8">
                <ChestSimulator />
              </div>
            )}
          </section>
        )}

        {/* Real-time Wins Carousel */}
        <RealtimeWinsCarousel className="mb-12" />

        {/* Featured Chests - 3 columns, 2 rows */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cada baú tem diferentes chances de prêmios. Quanto maior o investimento, maiores as recompensas!
            </p>
            
            {/* Admin ou Demo Badge */}
            {(hasAdminBypass() || isDemoAccount) && (
              <div className="mt-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {hasAdminBypass() && "🔧 Modo Admin - Teste sem Custos"}
                  {isDemoAccount && "🎮 Modo Demo - Saldo Renovável"}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 grid-rows-2 gap-6 max-w-6xl mx-auto">
            {Object.entries(chestData).map(([chestType, chest]) => (
              <div key={chestType}>
                <ChestCard
                  chest={chest}
                  chestType={chestType as ChestType}
                  onOpen={() => handleChestOpen(chestType as ChestType)}
                  onViewItems={() => handleChestViewItems(chestType as ChestType)}
                  balance={getCurrentBalance()}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action - only show for non-authenticated users */}
        {!user && (
          <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl border border-primary/20">
            <h2 className="text-4xl font-bold mb-6 text-primary">
              Pronto para Ganhar de Verdade?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cadastre-se agora e receba R$ 50 de bônus para começar a jogar com prêmios reais!
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

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <WalletPanel
        isOpen={showWalletPanel}
        onClose={() => setShowWalletPanel(false)}
        balance={getCurrentBalance()}
        prizes={[]}
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
        balance={getCurrentBalance()}
        nextChestType={getUpgradeChest(selectedChest?.type!)?.type}
        nextChestName={getUpgradeChest(selectedChest?.type!)?.chest.name}
        nextChestPrice={getUpgradeChest(selectedChest?.type!)?.chest.price}
      />

      <SpinCarousel
        isOpen={showSpinCarousel}
        onClose={() => setShowSpinCarousel(false)}
        prizes={selectedChest?.chest.prizes ? convertPrizesToDatabaseItems(selectedChest.chest.prizes) : []}
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

      <PaymentModalComponent />
    </div>
  );
};

export default Index;
