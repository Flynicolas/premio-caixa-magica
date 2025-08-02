import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import ChestCard from '@/components/ChestCard';
import ChestNavigationBar from '@/components/ChestNavigationBar';
import { chestData, ChestType, Chest } from '@/data/chestData';
import { DatabaseItem } from '@/types/database';
import { useInventory } from '@/hooks/useInventory';
import ChestItemsModal from '@/components/ChestItemsModal';
import ChestConfirmModal from '@/components/ChestConfirmModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';
import WinModal from '@/components/WinModal';
import WalletPanel from '@/components/WalletPanel';

const Rascunho = () => {
  const { user } = useAuth();
  const { walletData, refreshData } = useWallet();
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
    refreshData();
  };

  const handleDirectChestOpening = (prize: DatabaseItem) => {
    setWonPrize(prize);
    setShowWinModal(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header da Página de Rascunho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            🚧 Página de Rascunho - Teste de Baús 🚧
          </h1>
          <p className="text-muted-foreground">
            Área de testes para design, responsividade e animações
          </p>
        </div>
        
        {/* Chest Navigation Bar - Mobile Only */}
        <ChestNavigationBar 
          onChestSelect={setSelectedChestType}
          selectedChest={selectedChestType}
        />

        {/* Featured Chests Section - Copiada da página inicial */}
        <section className="mb-16">
          <div className="text-center mb-12 hidden md:block">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary leading-snug">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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

        {/* Área de Testes */}
        <section className="mt-16 p-8 bg-card/50 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-4 text-primary">
            💡 Área de Experimentação
          </h3>
          <p className="text-muted-foreground mb-4">
            Use esta área para testar novos componentes, estilos e animações.
          </p>
          
          {/* Placeholder para testes */}
          <div className="min-h-[200px] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Área para testes e experimentos</p>
          </div>
        </section>
      </div>

      {/* Modals - Copiados da página inicial */}
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

export default Rascunho;