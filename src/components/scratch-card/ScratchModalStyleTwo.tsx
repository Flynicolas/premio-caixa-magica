import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Gem } from 'lucide-react';

interface ScratchModalStyleTwoProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: (type: 'money' | 'item', data: any) => void;
}

const ScratchModalStyleTwo: React.FC<ScratchModalStyleTwoProps> = ({ 
  isOpen, 
  onClose, 
  onWin 
}) => {
  const [scratchedBlocks, setScratchedBlocks] = useState<boolean[]>(new Array(9).fill(false));
  const [symbols] = useState(['💎', '🌟', '🎭', '🎪', '🎨', '💎', '💎', '🌟', '🎭']);
  const [gameComplete, setGameComplete] = useState(false);
  const [winningPositions, setWinningPositions] = useState<number[]>([]);

  const handleBlockScratch = (index: number) => {
    if (scratchedBlocks[index] || gameComplete) return;
    
    const newScratched = [...scratchedBlocks];
    newScratched[index] = true;
    setScratchedBlocks(newScratched);

    const scratchedCount = newScratched.filter(Boolean).length;
    if (scratchedCount >= 6) {
      checkForWin(newScratched);
    }
  };

  const checkForWin = (scratched: boolean[]) => {
    const revealedSymbols = symbols.filter((_, index) => scratched[index]);
    const symbolCounts = revealedSymbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const winningSymbol = Object.entries(symbolCounts).find(([_, count]) => count >= 3);
    
    if (winningSymbol) {
      const [symbol] = winningSymbol;
      const positions = symbols.map((s, i) => s === symbol && scratched[i] ? i : -1).filter(i => i !== -1);
      setWinningPositions(positions);
      setGameComplete(true);
      
      setTimeout(() => {
        if (symbol === '💎') {
          onWin('money', { amount: Math.floor(Math.random() * 2000) + 200 });
        } else {
          onWin('item', { 
            name: 'MacBook Pro', 
            rarity: 'epic',
            image: '/placeholder.svg',
            value: 8000 
          });
        }
      }, 1500);
    }
  };

  const revealAll = () => {
    setScratchedBlocks(new Array(9).fill(true));
    checkForWin(new Array(9).fill(true));
  };

  const resetGame = () => {
    setScratchedBlocks(new Array(9).fill(false));
    setGameComplete(false);
    setWinningPositions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20">
        <div className="relative p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gem className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Glassmorphism Elite
              </h2>
              <Gem className="h-6 w-6 text-pink-300" />
            </div>
            <p className="text-white/70">Raspe com elegância e sofisticação</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 mx-auto max-w-xs">
            {symbols.map((symbol, index) => (
              <div
                key={index}
                onClick={() => handleBlockScratch(index)}
                className={`
                  aspect-square rounded-xl cursor-pointer transition-all duration-500
                  flex items-center justify-center text-2xl font-bold
                  backdrop-blur-sm border
                  ${scratchedBlocks[index] 
                    ? winningPositions.includes(index)
                      ? 'bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border-yellow-400/50 animate-pulse shadow-xl shadow-yellow-400/30'
                      : 'bg-white/10 border-white/20'
                    : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:from-purple-400/30 hover:to-pink-400/30 hover:scale-105'
                  }
                `}
              >
                {scratchedBlocks[index] ? (
                  <span className="text-white drop-shadow-lg">
                    {symbol}
                  </span>
                ) : (
                  <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg p-2">
                    <Gem className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={revealAll}
              disabled={gameComplete}
              className="flex-1 bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-400 hover:to-pink-400 text-white font-semibold backdrop-blur-sm border border-purple-400/30"
            >
              Revelar Elegância
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="px-6 border-white/20 text-white/80 hover:bg-white/10 backdrop-blur-sm"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchModalStyleTwo;