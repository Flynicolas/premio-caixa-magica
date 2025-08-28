
import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { useReferralTracking } from '@/hooks/useReferralTracking';
import { Button } from '@/components/ui/button';
import HeroSlider from '@/components/HeroSlider';
import ChestCard from '@/components/ChestCard';
import RealtimeWinsCarousel from '@/components/RealtimeWinsCarousel';
import AdvancedAuthModal from '@/components/AdvancedAuthModal';
import WalletPanel from '@/components/WalletPanel';
import ChestItemsModal from '@/components/ChestItemsModal';
import ChestConfirmModal from '@/components/ChestConfirmModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import WinModal from '@/components/WinModal';
import ChestNavigationBar from '@/components/ChestNavigationBar';
import { chestData, ChestType, Chest } from '@/data/chestData';
import { DatabaseItem } from '@/types/database';
import { useInventory } from '@/hooks/useInventory';
import ChestSimulator from '@/components/ChestSimulator';
import ResponsiveBanner from '@/components/ResponsiveBanner';

const Index = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const { walletData, refreshData } = useWallet();
  const { trackReferralClick } = useReferralTracking();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Verificar se deve mostrar modal de auth baseado no state da navegação
    if (location.state?.showAuth) {
      setShowAuthModal(true);
    }
  }, [location]);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChestOpening, setShowChestOpening] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedChest, setSelectedChest] = useState<{ chest: Chest; type: ChestType } | null>(null);
  const [wonPrize, setWonPrize] = useState<DatabaseItem | null>(null);
  const [selectedChestType, setSelectedChestType] = useState<ChestType | undefined>(undefined);
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
    chestType: entry.chest_type as ChestType,
    timestamp: new Date(entry.won_at),
  }));

  // Processar link de convite se houver
  useEffect(() => {
    if (code) {
      // Determinar fonte baseada no user agent ou referrer
      const referrer = document.referrer;
      let source = 'direct';
      
      if (referrer.includes('whatsapp')) source = 'whatsapp';
      else if (referrer.includes('telegram')) source = 'telegram';
      else if (referrer.includes('facebook')) source = 'facebook';
      else if (referrer.includes('instagram')) source = 'instagram';
      
      trackReferralClick(code, source);
    }
  }, [code, trackReferralClick]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Slider as main focus */}
        <div className="mb-8">
          <HeroSlider />
        </div>

        {/* Real-time Wins Carousel */}
        <RealtimeWinsCarousel className="mb-6 md:mb-12" />
        
        {/* Chest Navigation Bar - Mobile Only */}
        <ChestNavigationBar 
          onChestSelect={setSelectedChestType}
          selectedChest={selectedChestType}
        />

        {/* Chest Simulator for non-authenticated users */}
        {!user && (
          <div className="mb-8">
            <ChestSimulator />
          </div>
        )}

        {/* Featured Chests - 3 columns, 2 rows */}
        <section className="mb-16">
          <div className="text-center mb-12 hidden md:block">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gold-gradient-text leading-snug">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg gold-text max-w-3xl mx-auto font-medium">
              Cada baú tem diferentes chances de prêmios. Quanto maior o investimento, maiores as recompensas!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={chestType} id={`chest-${chestType}`} className="scroll-mt-32">
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
          <section className="text-center py-16 gold-gradient-subtle rounded-3xl border gold-border">
            <h2 className="text-4xl font-bold mb-6 gold-gradient-text">
              Pronto para Ganhar?
            </h2>
            <p className="text-xl gold-text mb-8 max-w-2xl mx-auto font-medium">
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

        {/* Banners para Mobile - Divididos horizontalmente */}
        <div className="space-y-4 md:space-y-6">
          <ResponsiveBanner 
            imageUrlPC="https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png"
            imageUrlMobile="https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png"
            altText="Banner promocional 1"
            className="h-20 md:h-auto"
          />
          <ResponsiveBanner 
            imageUrlPC="/banners/home-banner-2-pc.jpg"
            imageUrlMobile="/banners/home-banner-2-mobile.jpg"
            altText="Banner promocional 2"
            className="h-20 md:h-auto"
          />
        </div>
      </div>

      <AdvancedAuthModal 
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

      <WinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        prize={wonPrize}
        onCollect={() => setShowWinModal(false)}
      />
     
    </div>
  );
};

export default Index;
