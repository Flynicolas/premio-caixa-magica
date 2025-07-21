import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Gift } from 'lucide-react';
import SimulationModal from '@/components/SimulationModal';
import ChestOpeningModal from '@/components/ChestOpeningModal';

// Dados simulados para demonstração
const simulatedItems = [
  { name: 'Fone Gamer RGB', image_url: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png', rarity: 'rare' as const },
  { name: 'Mouse Gaming Pro', image_url: '/lovable-uploads/1e75dbed-c6dc-458b-bf5f-867f613d6c3f.png', rarity: 'epic' as const },
  { name: 'Teclado Mecânico', image_url: '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png', rarity: 'common' as const },
  { name: 'Smartphone', image_url: '/lovable-uploads/a4e45f22-07f1-459a-a5c2-de5eabb4144a.png', rarity: 'legendary' as const },
  { name: 'Perfume Premium', image_url: '/lovable-uploads/b32691e3-5eb0-4d76-85c1-f349a2615f80.png', rarity: 'rare' as const }
];

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
    // Selecionar item aleatório
    const randomItem = simulatedItems[Math.floor(Math.random() * simulatedItems.length)];
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

  if (!isVisible) return null;

  return (
    <>
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 max-w-sm mx-auto mb-8">
        <CardContent className="p-6 text-center">
          <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-purple-300 mb-2">🎁 Experimente Grátis!</h3>
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
        </CardContent>
      </Card>

      <ChestOpeningModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        chestType="silver"
        chestName="Baú Demonstração"
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