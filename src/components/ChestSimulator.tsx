
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Play, RotateCcw } from 'lucide-react';
import { chestData } from '@/data/chestData';

interface SimulatedPrize {
  name: string;
  value: string;
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ChestSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPrize, setSimulatedPrize] = useState<SimulatedPrize | null>(null);
  const [selectedChest, setSelectedChest] = useState<'silver' | 'gold' | 'diamond'>('silver');

  // Algoritmo de simulação com alta chance de prêmios raros
  const simulateChestOpening = () => {
    setIsSimulating(true);
    setSimulatedPrize(null);

    const chest = chestData[selectedChest];
    const prizes = chest.prizes;

    // Algoritmo especial para demonstração
    // 60% chance de prêmio raro ou melhor
    const randomValue = Math.random();
    let selectedPrize;

    if (randomValue < 0.3) {
      // 30% chance de legendary
      const legendaryPrizes = prizes.filter(p => p.rarity === 'legendary');
      selectedPrize = legendaryPrizes[Math.floor(Math.random() * legendaryPrizes.length)] || prizes[0];
    } else if (randomValue < 0.6) {
      // 30% chance de epic
      const epicPrizes = prizes.filter(p => p.rarity === 'epic');
      selectedPrize = epicPrizes[Math.floor(Math.random() * epicPrizes.length)] || prizes[0];
    } else if (randomValue < 0.85) {
      // 25% chance de rare
      const rarePrizes = prizes.filter(p => p.rarity === 'rare');
      selectedPrize = rarePrizes[Math.floor(Math.random() * rarePrizes.length)] || prizes[0];
    } else {
      // 15% chance de common
      const commonPrizes = prizes.filter(p => p.rarity === 'common');
      selectedPrize = commonPrizes[Math.floor(Math.random() * commonPrizes.length)] || prizes[0];
    }

    // Simular animação de abertura
    setTimeout(() => {
      setSimulatedPrize({
        name: selectedPrize.name,
        value: selectedPrize.value,
        image: selectedPrize.image,
        rarity: selectedPrize.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      });
      setIsSimulating(false);
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-400 text-white',
      rare: 'bg-blue-500 text-white',
      epic: 'bg-purple-500 text-white',
      legendary: 'bg-yellow-500 text-black'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityGlow = (rarity: string) => {
    const glows = {
      common: 'shadow-lg',
      rare: 'shadow-lg shadow-blue-500/50',
      epic: 'shadow-lg shadow-purple-500/50',
      legendary: 'shadow-lg shadow-yellow-500/50 animate-pulse'
    };
    return glows[rarity as keyof typeof glows] || glows.common;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Gift className="w-8 h-8 text-primary" />
          Simulador de Abertura de Baú
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </CardTitle>
        <p className="text-muted-foreground">
          Experimente a emoção de abrir baús! Esta é uma simulação gratuita com alta chance de prêmios raros.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção de Baú */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Escolha seu Baú:</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['silver', 'gold', 'diamond'] as const).map((chestType) => (
              <Button
                key={chestType}
                variant={selectedChest === chestType ? "default" : "outline"}
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => setSelectedChest(chestType)}
              >
                <div className="text-lg font-bold">
                  {chestData[chestType].name}
                </div>
                <div className="text-sm opacity-75">
                  {chestData[chestType].price}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Área de Simulação */}
        <div className="text-center space-y-4">
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
            {isSimulating ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium">Abrindo baú...</p>
                <p className="text-sm text-muted-foreground">Preparando sua surpresa!</p>
              </div>
            ) : simulatedPrize ? (
              <div className="text-center space-y-3">
                <div className={`inline-block p-4 rounded-lg ${getRarityGlow(simulatedPrize.rarity)}`}>
                  {simulatedPrize.image ? (
                    <img 
                      src={simulatedPrize.image} 
                      alt={simulatedPrize.name}
                      className="w-20 h-20 object-contain mx-auto rounded"
                    />
                  ) : (
                    <Gift className="w-20 h-20 mx-auto text-primary" />
                  )}
                </div>
                <div>
                  <Badge className={`${getRarityColor(simulatedPrize.rarity)} mb-2`}>
                    {simulatedPrize.rarity.toUpperCase()}
                  </Badge>
                  <h3 className="text-xl font-bold">{simulatedPrize.name}</h3>
                  <p className="text-lg font-semibold text-green-600">{simulatedPrize.value}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Clique em "Simular Abertura" para começar!</p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-3">
            <Button
              onClick={simulateChestOpening}
              disabled={isSimulating}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Simular Abertura
                </>
              )}
            </Button>

            {simulatedPrize && (
              <Button
                onClick={() => setSimulatedPrize(null)}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nova Simulação
              </Button>
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre esta Simulação</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta é uma demonstração gratuita com chances aumentadas de prêmios raros</li>
            <li>• Os resultados não são salvos no banco de dados</li>
            <li>• Para jogar de verdade, cadastre-se e adicione saldo</li>
            <li>• Chance de prêmio lendário: 30% (muito maior que o normal!)</li>
          </ul>
        </div>

        {/* Estatísticas da Simulação */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="text-sm text-gray-600">Comum</div>
            <div className="text-lg font-bold text-gray-700">15%</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3">
            <div className="text-sm text-blue-600">Raro</div>
            <div className="text-lg font-bold text-blue-700">25%</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-3">
            <div className="text-sm text-purple-600">Épico</div>
            <div className="text-lg font-bold text-purple-700">30%</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-3">
            <div className="text-sm text-yellow-600">Lendário</div>
            <div className="text-lg font-bold text-yellow-700">30%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChestSimulator;
