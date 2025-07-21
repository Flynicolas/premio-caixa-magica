
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Gift, Users, TrendingUp, Star } from 'lucide-react';
import SimulationModal from '@/components/SimulationModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';

// Dados simulados para demonstração com alta probabilidade de itens caros
const simulatedItems = [
  { name: 'iPhone 15 Pro Max', image_url: '/lovable-uploads/a4e45f22-07f1-459a-a5c2-de5eabb4144a.png', rarity: 'legendary' as const },
  { name: 'MacBook Pro M3', image_url: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png', rarity: 'legendary' as const },
  { name: 'PlayStation 5', image_url: '/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png', rarity: 'epic' as const },
  { name: 'iPad Pro 12.9"', image_url: '/lovable-uploads/c63b549b-1ab3-4334-8f46-74c5594d732a.png', rarity: 'epic' as const },
  { name: 'Apple Watch Ultra', image_url: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png', rarity: 'epic' as const },
  { name: 'AirPods Pro 2', image_url: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png', rarity: 'rare' as const },
  { name: 'Samsung Galaxy S24', image_url: '/lovable-uploads/a4e45f22-07f1-459a-a5c2-de5eabb4144a.png', rarity: 'epic' as const },
  { name: 'Nintendo Switch OLED', image_url: '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png', rarity: 'rare' as const }
];

// Estatísticas falsas para criar ambiente
const fakeStats = {
  onlineUsers: Math.floor(Math.random() * 500) + 200,
  lastWinner: simulatedItems[Math.floor(Math.random() * simulatedItems.length)],
  totalPrizes: '12.847',
  successRate: '94%'
};

const ChestSimulator = () => {
  const [attempts, setAttempts] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [simulatedPrize, setSimulatedPrize] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleSimulate = () => {
    if (attempts >= 2) return;
    
    setShowSimulation(true);
  };

  const handleSimulationComplete = () => {
    // Selecionar item com alta probabilidade de ser caro
    const highValueItems = simulatedItems.filter(item => 
      item.rarity === 'legendary' || item.rarity === 'epic'
    );
    
    // 80% chance de item caro, 20% de item comum
    const randomItem = Math.random() < 0.8 
      ? highValueItems[Math.floor(Math.random() * highValueItems.length)]
      : simulatedItems[Math.floor(Math.random() * simulatedItems.length)];
    
    setSimulatedPrize(randomItem);
    setShowSimulation(false);
    setShowResult(true);
    setAttempts(prev => prev + 1);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    if (attempts >= 2) {
      setIsVisible(false);
    }
  };

  const getChestType = () => {
    return attempts === 0 ? 'diamond' : 'ruby';
  };

  const getChestName = () => {
    return attempts === 0 ? 'Baú Diamante' : 'Baú Ruby';
  };

  if (!isVisible) return null;

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 border-purple-500/40 backdrop-blur-sm mx-auto mb-8 max-w-sm md:max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Layout Mobile (Vertical) */}
          <div className="block md:hidden text-center">
            <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-purple-300 mb-2">
              🎁 Experimente Grátis!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Teste a abertura de baús sem compromisso! {2 - attempts} tentativa{2 - attempts !== 1 ? 's' : ''} restante{2 - attempts !== 1 ? 's' : ''}
            </p>
            <Button 
              onClick={handleSimulate}
              disabled={attempts >= 2}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {attempts === 0 ? 'Experimentar Agora!' : attempts === 1 ? 'Última Chance!' : 'Teste Concluído'}
            </Button>
          </div>

          {/* Layout Desktop (Horizontal) */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Coluna 1: Ícone e Título */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-black" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-purple-300 mb-2">
                  🎁 Simulador Gratuito
                </h3>
                <p className="text-sm text-purple-200">
                  Experimente sem compromisso!
                </p>
              </div>

              {/* Coluna 2: Estatísticas e Informações */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                    <p className="text-lg font-bold text-white">{fakeStats.onlineUsers}</p>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Taxa</span>
                    </div>
                    <p className="text-lg font-bold text-white">{fakeStats.successRate}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-3 border border-amber-500/30">
                  <p className="text-xs text-amber-200 mb-1">🏆 Último Ganhador:</p>
                  <p className="text-sm font-semibold text-amber-100 truncate">
                    {fakeStats.lastWinner.name}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {fakeStats.totalPrizes} prêmios já entregues
                  </p>
                </div>
              </div>

              {/* Coluna 3: Ação */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-400/30 mb-4">
                  <p className="text-sm text-purple-200 mb-2">
                    Próximo baú: <span className="font-bold text-purple-100">{getChestName()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {2 - attempts} tentativa{2 - attempts !== 1 ? 's' : ''} restante{2 - attempts !== 1 ? 's' : ''}
                  </p>
                  <Button 
                    onClick={handleSimulate}
                    disabled={attempts >= 2}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {attempts === 0 ? 'Testar Agora!' : attempts === 1 ? 'Última Chance!' : 'Teste Concluído'}
                  </Button>
                </div>
                
                {attempts < 2 && (
                  <p className="text-xs text-muted-foreground">
                    ⚡ Grandes prêmios aguardam você!
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChestOpeningModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        chestType={getChestType()}
        chestName={getChestName()}
        chestPrice={0}
        onPrizeWon={handleSimulationComplete}
        isSimulation={true}
      />

      <SimulationModal
        isOpen={showResult}
        onClose={handleCloseResult}
        prize={simulatedPrize}
        attemptsLeft={2 - attempts}
        onTryAgain={attempts < 2 ? handleSimulate : undefined}
      />
    </>
  );
};

export default ChestSimulator;
