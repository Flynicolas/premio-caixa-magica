
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WheelPrize {
  id: string;
  name: string;
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  probability: number;
}

const FreeSpinWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Prêmios simulados da roda grátis
  const prizes: WheelPrize[] = [
    { id: '1', name: 'Moedas Bonus', rarity: 'common', probability: 40 },
    { id: '2', name: 'Desconto 10%', rarity: 'common', probability: 25 },
    { id: '3', name: 'Spin Extra', rarity: 'rare', probability: 15 },
    { id: '4', name: 'Desconto 25%', rarity: 'rare', probability: 10 },
    { id: '5', name: 'Baú Grátis', rarity: 'epic', probability: 7 },
    { id: '6', name: 'Jackpot', rarity: 'legendary', probability: 3 }
  ];

  const rarityColors = {
    common: { bg: 'bg-gray-400', text: 'text-gray-800', border: 'border-gray-500' },
    rare: { bg: 'bg-blue-400', text: 'text-blue-800', border: 'border-blue-500' },
    epic: { bg: 'bg-purple-400', text: 'text-purple-800', border: 'border-purple-500' },
    legendary: { bg: 'bg-yellow-400', text: 'text-yellow-800', border: 'border-yellow-500' }
  };

  const spinWheel = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Sortear prêmio baseado na probabilidade
    const randomNum = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (randomNum <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // Calcular rotação
    const segmentAngle = 360 / prizes.length;
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const finalAngle = 1440 + (360 - (prizeIndex * segmentAngle + segmentAngle/2)); // 4 voltas + posição do prêmio

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${finalAngle}deg)`;
    }

    // Simular tempo de rotação
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      setCanSpin(false); // Limitar a 1 spin grátis por sessão
      
      toast({
        title: "🎉 Parabéns!",
        description: `Você ganhou: ${selectedPrize.name}`,
      });
    }, 3000);
  };

  const resetWheel = () => {
    setCanSpin(true);
    setWonPrize(null);
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Gift className="w-6 h-6 text-yellow-500" />
          Roda da Sorte Grátis
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </CardTitle>
        <p className="text-muted-foreground">
          Gire a roda e ganhe prêmios especiais! Uma chance grátis por sessão.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Roda */}
        <div className="relative flex justify-center">
          <div className="relative">
            {/* Ponteiro */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
            </div>
            
            {/* Roda */}
            <div 
              ref={wheelRef}
              className="w-80 h-80 rounded-full border-8 border-gray-300 relative overflow-hidden transition-transform duration-3000 ease-out"
              style={{
                background: `conic-gradient(${prizes.map((prize, index) => {
                  const color = rarityColors[prize.rarity].bg.replace('bg-', '');
                  const startAngle = (index * 360) / prizes.length;
                  const endAngle = ((index + 1) * 360) / prizes.length;
                  return `var(--${color}) ${startAngle}deg ${endAngle}deg`;
                }).join(', ')})`
              }}
            >
              {/* Segmentos com texto */}
              {prizes.map((prize, index) => {
                const angle = (index * 360) / prizes.length;
                const textAngle = angle + (360 / prizes.length) / 2;
                
                return (
                  <div
                    key={prize.id}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `rotate(${textAngle}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <div 
                      className="text-xs font-bold text-white text-center px-2"
                      style={{ transform: `translateY(-120px) rotate(${-textAngle}deg)` }}
                    >
                      {prize.name}
                    </div>
                  </div>
                );
              })}
              
              {/* Centro da roda */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="text-center space-y-4">
          <Button
            onClick={spinWheel}
            disabled={!canSpin || isSpinning}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                Girando...
              </>
            ) : canSpin ? (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Girar Roda Grátis!
              </>
            ) : (
              'Chance Já Utilizada'
            )}
          </Button>

          {!canSpin && (
            <Button
              onClick={resetWheel}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar (Demo)
            </Button>
          )}
        </div>

        {/* Resultado */}
        {wonPrize && (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold mb-2">🎉 Você Ganhou!</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge className={`${rarityColors[wonPrize.rarity].bg} ${rarityColors[wonPrize.rarity].text} ${rarityColors[wonPrize.rarity].border} border-2`}>
                  {wonPrize.rarity.toUpperCase()}
                </Badge>
                <span className="font-semibold text-lg">{wonPrize.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Seu prêmio foi adicionado à sua conta!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Prêmios */}
        <div className="space-y-2">
          <h4 className="font-medium text-center">Prêmios Disponíveis:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {prizes.map((prize) => (
              <div key={prize.id} className="flex items-center justify-between p-2 rounded border">
                <span>{prize.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={rarityColors[prize.rarity].border}>
                    {prize.probability}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeSpinWheel;
