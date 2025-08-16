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
import ScratchSelectorStyleTwo from '@/components/ScratchSelectorStyleTwo';
import ScratchSelectorStyleThree from '@/components/ScratchSelectorStyleThree';
import PremiumScratchCatalog from '@/components/PremiumScratchCatalog';
import ScratchModalStyleOne from '@/components/scratch-card/ScratchModalStyleOne';
import ScratchModalStyleTwo from '@/components/scratch-card/ScratchModalStyleTwo';
import ScratchModalStyleThree from '@/components/scratch-card/ScratchModalStyleThree';
import MoneyWinModal from '@/components/scratch-card/MoneyWinModal';
import ItemWinModal from '@/components/scratch-card/ItemWinModal';
import PrizeShowcaseStyleOne from '@/components/scratch-card/PrizeShowcaseStyleOne';
import PrizeShowcaseStyleTwo from '@/components/scratch-card/PrizeShowcaseStyleTwo';
import PrizeShowcaseStyleThree from '@/components/scratch-card/PrizeShowcaseStyleThree';

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

  // Estados para os novos modais de teste
  const [scratchModalOne, setScratchModalOne] = useState(false);
  const [scratchModalTwo, setScratchModalTwo] = useState(false);
  const [scratchModalThree, setScratchModalThree] = useState(false);
  const [moneyWinModal, setMoneyWinModal] = useState(false);
  const [itemWinModal, setItemWinModal] = useState(false);
  const [testWinData, setTestWinData] = useState<any>(null);

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

        {/* Versão 1: Compacto Temático (Estilo Página Inicial) */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-primary">
              ✨ Versão 1: Compacto Temático
            </h2>
            <p className="text-sm text-muted-foreground">
              Estilo da página inicial em formato compacto e responsivo
            </p>
          </div>

          {/* Atalho para Raspadinha - Seção Temática */}
          <div className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary mb-2">
                🎫 Teste a Raspadinha Grátis
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experimente nosso novo jogo de raspadinha com chances reais de ganhar!
              </p>
              <button 
                onClick={() => window.location.href = '/raspadinha'}
                className="gold-gradient text-black font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
              >
                Jogar Raspadinha 🎯
              </button>
            </div>
          </div>

          {/* Grid de Baús com estilo da página inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {chestOrder.map((chestType) => (
              <div key={`v1-${chestType}`} className="group">
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

        {/* Catálogo de Raspadinhas - Estilo 2: Glass Morphism */}
        <section className="mt-16 mb-12 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-8 border border-white/10">
          <ScratchSelectorStyleTwo 
            onCardSelect={(cardId) => console.log('Card selecionado estilo 2:', cardId)}
            userBalance={walletData?.balance || 0}
            isLoading={false}
          />
        </section>

        {/* Catálogo de Raspadinhas - Estilo 3: Futurista Gaming */}
        <section className="mt-16 mb-12 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 rounded-3xl p-8 border border-purple-500/20">
          <ScratchSelectorStyleThree 
            onCardSelect={(cardId) => console.log('Card selecionado estilo 3:', cardId)}
            userBalance={walletData?.balance || 0}
            isLoading={false}
          />
        </section>

        {/* Catálogo Premium - Estilo da Imagem de Referência */}
        <section className="mt-16 mb-12 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8">
          <PremiumScratchCatalog 
            onCardSelect={(cardId) => console.log('Card Premium selecionado:', cardId)}
            userBalance={walletData?.balance || 1000}
          />
        </section>

        {/* 3 TIPOS DE MOSTRUÁRIO DE PRÊMIOS - USANDO RASPADINHA "SORTE" */}
        <section className="mt-16 mb-12 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
              🎯 3 Estilos de Mostruário de Prêmios
            </h2>
            <p className="text-muted-foreground">
              Testando diferentes layouts para exibir os prêmios da raspadinha "SORTE"
            </p>
          </div>

          {/* Estilo 1: Compacto Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PrizeShowcaseStyleOne 
              scratchType="sorte"
              className="w-full"
            />
            
            {/* Estilo 2: Cards Horizontais */}
            <PrizeShowcaseStyleTwo 
              scratchType="sorte"
              className="w-full"
            />
            
            {/* Estilo 3: Grid Elegante */}
            <PrizeShowcaseStyleThree 
              scratchType="sorte"
              className="w-full"
            />
          </div>

          <div className="text-center p-6 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Instrução:</strong> Escolha o estilo que mais se adequa ao mobile e desktop, 
              depois implementaremos na página principal de raspadinhas!
            </p>
          </div>
        </section>

        {/* TESTE DOS MODAIS DE RASPAGEM */}
        <section className="mt-16 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            🎮 Teste dos 3 Modais de Raspagem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setScratchModalOne(true)}
              className="h-20 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105"
            >
              🌑 Minimalista Escuro
            </button>
            <button
              onClick={() => setScratchModalTwo(true)}
              className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105"
            >
              ✨ Glassmorphism
            </button>
            <button
              onClick={() => setScratchModalThree(true)}
              className="h-20 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105"
            >
              ⚡ Neon Gaming
            </button>
          </div>
        </section>

        {/* TESTE DOS MODAIS DE VITÓRIA */}
        <section className="mt-8 p-8 bg-gradient-to-br from-emerald-900 to-blue-900 rounded-xl border border-emerald-700">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
            🏆 Teste dos Modais de Vitória
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => {
                setTestWinData({ amount: 1250 });
                setMoneyWinModal(true);
              }}
              className="h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105"
            >
              💰 Vitória - Dinheiro
            </button>
            <button
              onClick={() => {
                setTestWinData({
                  name: 'iPhone 15 Pro Max',
                  rarity: 'legendary',
                  image: '/placeholder.svg',
                  value: 7500
                });
                setItemWinModal(true);
              }}
              className="h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105"
            >
              🎁 Vitória - Item
            </button>
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

      {/* NOVOS MODAIS DE TESTE */}
      <ScratchModalStyleOne
        isOpen={scratchModalOne}
        onClose={() => setScratchModalOne(false)}
        onWin={(type, data) => {
          setScratchModalOne(false);
          if (type === 'money') {
            setTestWinData(data);
            setMoneyWinModal(true);
          } else {
            setTestWinData(data);
            setItemWinModal(true);
          }
        }}
      />

      <ScratchModalStyleTwo
        isOpen={scratchModalTwo}
        onClose={() => setScratchModalTwo(false)}
        onWin={(type, data) => {
          setScratchModalTwo(false);
          if (type === 'money') {
            setTestWinData(data);
            setMoneyWinModal(true);
          } else {
            setTestWinData(data);
            setItemWinModal(true);
          }
        }}
      />

      <ScratchModalStyleThree
        isOpen={scratchModalThree}
        onClose={() => setScratchModalThree(false)}
        onWin={(type, data) => {
          setScratchModalThree(false);
          if (type === 'money') {
            setTestWinData(data);
            setMoneyWinModal(true);
          } else {
            setTestWinData(data);
            setItemWinModal(true);
          }
        }}
      />

      <MoneyWinModal
        isOpen={moneyWinModal}
        onClose={() => setMoneyWinModal(false)}
        onPlayAgain={() => {
          setMoneyWinModal(false);
        }}
        amount={testWinData?.amount || 100}
      />

      <ItemWinModal
        isOpen={itemWinModal}
        onClose={() => setItemWinModal(false)}
        onPlayAgain={() => {
          setItemWinModal(false);
        }}
        onViewInventory={() => {
          setItemWinModal(false);
          console.log('Abrir inventário');
        }}
        item={testWinData || {
          name: 'iPhone 15 Pro',
          rarity: 'legendary',
          image: '/placeholder.svg',
          value: 5000
        }}
      />
    </div>
  );
};

export default Rascunho;