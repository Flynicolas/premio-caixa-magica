import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';

interface ScratchModalStyleThreeProps {
  isOpen: boolean;
  onClose: () => void;
  onWin: (type: 'money' | 'item', data: any) => void;
}

const ScratchModalStyleThree: React.FC<ScratchModalStyleThreeProps> = ({ 
  isOpen, 
  onClose, 
  onWin 
}) => {
  const [scratchedBlocks, setScratchedBlocks] = useState<boolean[]>(new Array(9).fill(false));
  const [symbols] = useState(['⚡', '🔥', '💫', '🌈', '⭐', '⚡', '⚡', '🔥', '💫']);
  const [gameComplete, setGameComplete] = useState(false);
  const [winningPositions, setWinningPositions] = useState<number[]>([]);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate random particles for background effect
      const newParticles = Array.from({length: 20}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

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
        if (symbol === '⚡') {
          onWin('money', { amount: Math.floor(Math.random() * 5000) + 500 });
        } else {
          onWin('item', { 
            name: 'PlayStation 5', 
            rarity: 'legendary',
            image: '/placeholder.svg',
            value: 3000 
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
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 border border-cyan-500/50">
        <div className="relative p-6 overflow-hidden">
          {/* Animated particles background */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.id * 0.1}s`
              }}
            />
          ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-6 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEON GAMING
              </h2>
              <Zap className="h-6 w-6 text-pink-400 animate-pulse" />
            </div>
            <p className="text-cyan-200/80">Energia máxima para vitórias épicas!</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 mx-auto max-w-xs relative z-10">
            {symbols.map((symbol, index) => (
              <div
                key={index}
                onClick={() => handleBlockScratch(index)}
                className={`
                  aspect-square rounded-lg cursor-pointer transition-all duration-300
                  flex items-center justify-center text-2xl font-bold
                  border-2 relative overflow-hidden
                  ${scratchedBlocks[index] 
                    ? winningPositions.includes(index)
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-400 animate-pulse shadow-2xl shadow-yellow-400/70'
                      : 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600'
                    : 'bg-gradient-to-br from-cyan-500 to-purple-500 border-cyan-400 hover:from-cyan-400 hover:to-purple-400 hover:scale-110 hover:shadow-lg hover:shadow-cyan-400/50'
                  }
                `}
              >
                {!scratchedBlocks[index] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse" />
                )}
                {scratchedBlocks[index] ? (
                  <span className={`${winningPositions.includes(index) ? 'text-slate-900' : 'text-white'} drop-shadow-lg`}>
                    {symbol}
                  </span>
                ) : (
                  <Zap className="h-6 w-6 text-white animate-pulse" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 relative z-10">
            <Button
              onClick={revealAll}
              disabled={gameComplete}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold text-sm border border-cyan-400/50 shadow-lg shadow-cyan-500/30"
            >
              ⚡ REVELAR PODER ⚡
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="px-6 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20"
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchModalStyleThree;