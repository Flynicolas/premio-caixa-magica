import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Gift, Users, Trophy, Star } from 'lucide-react';
import SimulatedChestModal from '@/components/SimulatedChestModal';
import SimulationModal from '@/components/SimulationModal';
import { useAuth } from '@/hooks/useAuth';

const ChestSimulator = () => {
  const [attempts, setAttempts] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [simulatedPrize, setSimulatedPrize] = useState<any>(null);
  const [currentChestType, setCurrentChestType] = useState('diamond');
  const [isVisible, setIsVisible] = useState(true);

  const { user } = useAuth();

  // Apenas para usuários não logados
  if (user || !isVisible) return null;

  const chestNames = {
    diamond: 'Baú Diamante',
    ruby: 'Baú Ruby'
  };

  const handleSimulate = () => {
    if (attempts >= 2) return;
    
    // Primeira tentativa: Diamond, Segunda: Ruby
    const chestType = attempts === 0 ? 'diamond' : 'ruby';
    setCurrentChestType(chestType);
    setShowSimulation(true);
  };

  const handlePrizeWon = (prize: any) => {
    setSimulatedPrize(prize);
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

  return (
    <>
      {/* Card redesenhado - horizontal no desktop */}
      <Card className="w-full max-w-6xl mx-auto mb-8 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Seção esquerda - Conteúdo principal */}
            <div className="flex-1 p-6 lg:p-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Gift className="w-8 h-8 text-yellow-400 animate-pulse" />
                <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Teste Grátis Agora!
                </h3>
              </div>
              
              <p className="text-white/90 text-lg mb-2">
                Experimente a abertura de baús premium sem compromisso
              </p>
              
              <p className="text-white/70 text-sm mb-6">
                {attempts === 0 ? 
                  "🎲 Primeira tentativa: Baú Diamante com alta probabilidade de itens raros!" :
                  attempts === 1 ? 
                  "💎 Última chance: Baú Ruby com itens lendários!" :
                  "✅ Demonstração concluída"
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                <Button 
                  onClick={handleSimulate}
                  disabled={attempts >= 2}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {attempts === 0 ? 'Experimentar Baú Diamante!' : 
                   attempts === 1 ? 'Tentar Baú Ruby!' : 'Demonstração Completa'}
                </Button>
                
                {attempts < 2 && (
                  <div className="text-center">
                    <span className="text-sm text-white/60">
                      {2 - attempts} tentativa{2 - attempts !== 1 ? 's' : ''} restante{2 - attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Seção direita - Estatísticas temáticas */}
            <div className="lg:w-80 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">1,247</div>
                  <div className="text-white/60 text-xs">Testando agora</div>
                </div>
                
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-bold text-lg">89%</div>
                  <div className="text-white/60 text-xs">Itens raros hoje</div>
                </div>
                
                <div className="col-span-2 text-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                  <Star className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-green-300 text-sm font-medium">
                    💎 Último prêmio: iPhone 15 Pro
                  </div>
                  <div className="text-green-400/70 text-xs">há 2 minutos</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SimulatedChestModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        chestType={currentChestType}
        chestName={chestNames[currentChestType]}
        onPrizeWon={handlePrizeWon}
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