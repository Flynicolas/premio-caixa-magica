import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { DollarSign, Sparkles } from 'lucide-react';

interface MoneyWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  amount: number;
}

const MoneyWinModal: React.FC<MoneyWinModalProps> = ({ 
  isOpen, 
  onClose, 
  onPlayAgain, 
  amount 
}) => {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [coins, setCoins] = useState<Array<{id: number, x: number, delay: number}>>([]);

  useEffect(() => {
    if (isOpen) {
      // Trigger golden confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });

      // Animate counter
      const duration = 2000;
      const increment = amount / (duration / 50);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= amount) {
          setDisplayAmount(amount);
          clearInterval(timer);
        } else {
          setDisplayAmount(Math.floor(current));
        }
      }, 50);

      // Generate falling coins
      const newCoins = Array.from({length: 15}, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        delay: i * 0.1
      }));
      setCoins(newCoins);

      return () => clearInterval(timer);
    } else {
      setDisplayAmount(0);
      setCoins([]);
    }
  }, [isOpen, amount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300">
        <div className="relative p-8 text-center overflow-hidden">
          {/* Falling coins animation */}
          {coins.map(coin => (
            <div
              key={coin.id}
              className="absolute text-yellow-500 text-2xl animate-bounce"
              style={{
                left: `${coin.x}%`,
                top: '-10%',
                animationDelay: `${coin.delay}s`,
                animationDuration: '2s'
              }}
            >
              🪙
            </div>
          ))}

          {/* Background sparkles */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({length: 8}).map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-400 animate-ping"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-yellow-400/50">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-800 mb-2">
                🎉 PARABÉNS! 🎉
              </h2>
              <p className="text-yellow-700">Você ganhou dinheiro!</p>
            </div>

            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 shadow-xl">
                <p className="text-lg font-medium mb-2">Valor ganho:</p>
                <p className="text-4xl font-bold">
                  R$ {displayAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="flex space-x-1">
                    🪙💰🪙
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 rounded-lg p-4 mb-6 border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                💵 Dinheiro será creditado no seu PIX em até 24 horas!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-bold"
              >
                🎯 Jogar Novamente
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoneyWinModal;