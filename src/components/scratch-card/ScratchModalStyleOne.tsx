import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

interface ScratchModalStyleOneProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: (type: 'money' | 'item', data: any) => void;
}

const ScratchModalStyleOne: React.FC<ScratchModalStyleOneProps> = ({ 
  isOpen, 
  onClose, 
  onWin 
}) => {
  const [scratchedBlocks, setScratchedBlocks] = useState<boolean[]>(new Array(9).fill(false));
  const [symbols] = useState(['💰', '🎁', '⭐', '💎', '🎯', '💰', '💰', '🎁', '⭐']);
  const [gameComplete, setGameComplete] = useState(false);
  const [winningPositions, setWinningPositions] = useState<number[]>([]);

  const handleBlockScratch = (index: number) => {
    if (scratchedBlocks[index] || gameComplete) return;
    
    const newScratched = [...scratchedBlocks];
    newScratched[index] = true;
    setScratchedBlocks(newScratched);

    // Check for win after scratching
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
      
      // Simulate win based on symbol
      setTimeout(() => {
        if (symbol === '💰') {
          onWin('money', { amount: Math.floor(Math.random() * 1000) + 100 });
        } else {
          onWin('item', { 
            name: 'iPhone 15 Pro', 
            rarity: 'legendary',
            image: '/placeholder.svg',
            value: 5000 
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
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <div className="relative p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Raspadinha Minimalista</h2>
            <p className="text-slate-400">Encontre 3 símbolos iguais para ganhar!</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 mx-auto max-w-xs">
            {symbols.map((symbol, index) => (
              <div
                key={index}
                onClick={() => handleBlockScratch(index)}
                className={`
                  aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300
                  flex items-center justify-center text-2xl font-bold
                  ${scratchedBlocks[index] 
                    ? winningPositions.includes(index)
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50'
                      : 'bg-slate-700 border-slate-600'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 hover:from-orange-400 hover:to-orange-500'
                  }
                `}
              >
                {scratchedBlocks[index] ? (
                  <span className={winningPositions.includes(index) ? 'text-slate-900' : 'text-white'}>
                    {symbol}
                  </span>
                ) : (
                  <Sparkles className="h-6 w-6 text-white" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={revealAll}
              disabled={gameComplete}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold"
            >
              Revelar Tudo
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="px-6 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Novo Jogo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchModalStyleOne;