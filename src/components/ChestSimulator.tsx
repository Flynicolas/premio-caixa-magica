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
      {/* Gadget compacto e chamativo */}
      <div className="w-full max-w-md mx-auto mb-6 md:max-w-6xl">
        <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 animate-pulse">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
                  <h3 className="text-lg md:text-2xl font-bold text-white">
                    🎁 Teste Grátis!
                  </h3>
                </div>
                <p className="text-white/90 text-sm md:text-base">
                  Abra baús premium sem custo
                </p>
              </div>
              
              <Button 
                onClick={handleSimulate}
                disabled={attempts >= 2}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {attempts === 0 ? 'Testar Agora!' : 
                 attempts === 1 ? 'Última Chance!' : 'Completo!'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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