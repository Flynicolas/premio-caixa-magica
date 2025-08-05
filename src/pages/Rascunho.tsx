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
import PremiumLiveWins from '@/components/PremiumLiveWins';
import RectangularScratchSelector from '@/components/RectangularScratchSelector';

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

        {/* Versão 1: Layout Compacto Minimalista */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
              ✨ Versão 1: Compacto Minimalista
            </h2>
            <p className="text-sm text-muted-foreground">
              Design limpo e espaçamento reduzido
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={`v1-${chestType}`} className="group">
                <div className="bg-card/30 border border-border/50 rounded-lg p-3 hover:bg-card/60 transition-all duration-300 min-h-[200px] flex flex-col">
                  {/* Header compacto */}
                  <div className="text-center mb-3">
                    <h3 className="text-xs font-semibold text-primary mb-1 truncate">
                      {chestData[chestType].name}
                    </h3>
                    <div className="text-sm font-bold text-foreground">
                      R$ {chestData[chestType].price.toFixed(0)}
                    </div>
                  </div>

                  {/* Imagem reduzida */}
                  <div className="flex-1 flex items-center justify-center mb-3">
                    <img 
                      src={`/lovable-uploads/${chestType === 'silver' ? '8f503764-12ee-4e00-8148-76b279be343f' : 
                           chestType === 'gold' ? '8c5dedca-ad61-4b14-a649-8b854950a875' :
                           chestType === 'delas' ? '85b1ecea-b443-4391-9986-fb77979cf6ea' :
                           chestType === 'diamond' ? '0ec6f6c5-203f-4fca-855d-59171f78adf3' :
                           chestType === 'ruby' ? 'a7b012cc-0fae-4b69-b2f4-690740a0ba92' :
                           'd43f06a5-1532-42ba-8362-5aefb160b408'}.png`}
                      alt={chestData[chestType].name}
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Botão simplificado */}
                  <button 
                    onClick={() => handleChestOpen(chestType)}
                    className="w-full py-1.5 text-xs font-medium bg-primary/80 hover:bg-primary text-primary-foreground rounded transition-colors"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Versão 2: Cards Horizontais Compactos */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
              📱 Versão 2: Cards Horizontais
            </h2>
            <p className="text-sm text-muted-foreground">
              Layout horizontal otimizado para mobile
            </p>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            {chestOrder.map((chestType) => (
              <div key={`v2-${chestType}`} className="bg-card/40 border border-border/50 rounded-lg p-3 hover:bg-card/70 transition-all duration-300">
                <div className="flex items-center gap-3">
                  {/* Imagem mini */}
                  <div className="w-12 h-12 flex-shrink-0">
                    <img 
                      src={`/lovable-uploads/${chestType === 'silver' ? '8f503764-12ee-4e00-8148-76b279be343f' : 
                           chestType === 'gold' ? '8c5dedca-ad61-4b14-a649-8b854950a875' :
                           chestType === 'delas' ? '85b1ecea-b443-4391-9986-fb77979cf6ea' :
                           chestType === 'diamond' ? '0ec6f6c5-203f-4fca-855d-59171f78adf3' :
                           chestType === 'ruby' ? 'a7b012cc-0fae-4b69-b2f4-690740a0ba92' :
                           'd43f06a5-1532-42ba-8362-5aefb160b408'}.png`}
                      alt={chestData[chestType].name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info central */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-primary truncate">
                      {chestData[chestType].name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {chestType === 'silver' ? 'Iniciante' :
                       chestType === 'gold' ? 'Intermediário' :
                       chestType === 'delas' ? 'Feminino' :
                       chestType === 'diamond' ? 'Avançado' :
                       chestType === 'ruby' ? 'Premium' : 'Exclusivo'}
                    </p>
                  </div>

                  {/* Preço e botão */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-foreground mb-1">
                      R$ {chestData[chestType].price.toFixed(0)}
                    </div>
                    <button 
                      onClick={() => handleChestOpen(chestType)}
                      className="px-3 py-1 text-xs font-medium bg-primary/80 hover:bg-primary text-primary-foreground rounded transition-colors"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Versão 3: Grid Responsivo Elegante */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
              🎨 Versão 3: Grid Elegante
            </h2>
            <p className="text-sm text-muted-foreground">
              Equilibrio entre minimalismo e informação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={`v3-${chestType}`} className="group">
                <div className="bg-gradient-to-br from-card/20 to-card/60 border border-border/30 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col">
                  {/* Header com badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chestType === 'silver' ? 'bg-gray-100 text-gray-800' :
                      chestType === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      chestType === 'delas' ? 'bg-pink-100 text-pink-800' :
                      chestType === 'diamond' ? 'bg-cyan-100 text-cyan-800' :
                      chestType === 'ruby' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {chestType.toUpperCase()}
                    </div>
                    <button 
                      onClick={() => handleChestViewItems(chestType)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Conteúdo central */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <img 
                      src={`/lovable-uploads/${chestType === 'silver' ? '8f503764-12ee-4e00-8148-76b279be343f' : 
                           chestType === 'gold' ? '8c5dedca-ad61-4b14-a649-8b854950a875' :
                           chestType === 'delas' ? '85b1ecea-b443-4391-9986-fb77979cf6ea' :
                           chestType === 'diamond' ? '0ec6f6c5-203f-4fca-855d-59171f78adf3' :
                           chestType === 'ruby' ? 'a7b012cc-0fae-4b69-b2f4-690740a0ba92' :
                           'd43f06a5-1532-42ba-8362-5aefb160b408'}.png`}
                      alt={chestData[chestType].name}
                      className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300 mb-2"
                    />
                    <h3 className="text-sm font-semibold text-primary mb-1">
                      {chestData[chestType].name}
                    </h3>
                  </div>

                  {/* Footer com preço e ação */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <span className="text-lg font-bold text-foreground">
                      R$ {chestData[chestType].price.toFixed(0)}
                    </span>
                    <button 
                      onClick={() => handleChestOpen(chestType)}
                      className="px-4 py-1.5 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sistema de Vitórias em Tempo Real */}
        <section className="mt-16 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
              🔴 Sistema de Vitórias AO VIVO
            </h2>
            <p className="text-sm text-muted-foreground">
              Carrossel de vitórias em tempo real estilizado
            </p>
          </div>
          <PremiumLiveWins />
        </section>

        {/* Catálogo de Raspadinhas Retangulares */}
        <section className="mt-16 mb-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8">
          <RectangularScratchSelector 
            onCardSelect={(cardId) => console.log('Card selecionado:', cardId)}
            userBalance={walletData?.balance || 0}
            isLoading={false}
          />
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