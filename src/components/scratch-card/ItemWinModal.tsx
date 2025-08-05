import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { Package, Eye, Sparkles, Star } from 'lucide-react';

interface ItemWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onViewInventory: () => void;
  item: {
    name: string;
    rarity: string;
    image: string;
    value: number;
  };
}

const ItemWinModal: React.FC<ItemWinModalProps> = ({ 
  isOpen, 
  onClose, 
  onPlayAgain, 
  onViewInventory,
  item 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 to-amber-500';
      case 'epic': return 'from-purple-500 to-indigo-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRarityParticleColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Initial box animation
      setTimeout(() => setIsRevealed(true), 500);

      // Rarity-based confetti
      const colors = {
        legendary: ['#FFD700', '#FFA500', '#FF8C00'],
        epic: ['#8B5CF6', '#A855F7', '#C084FC'],
        rare: ['#3B82F6', '#06B6D4', '#0EA5E9']
      };

      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: colors[item.rarity?.toLowerCase() as keyof typeof colors] || ['#6B7280']
        });
      }, 1000);

      // Generate floating particles
      const newParticles = Array.from({length: 12}, (_, i) => ({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5
      }));
      setParticles(newParticles);
    } else {
      setIsRevealed(false);
      setParticles([]);
    }
  }, [isOpen, item.rarity]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200">
        <div className="relative p-8 text-center overflow-hidden">
          {/* Floating particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className={`absolute animate-pulse ${getRarityParticleColor(item.rarity)}`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.id * 0.2}s`
              }}
            >
              <Star className="h-3 w-3" />
            </div>
          ))}

          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🎁 ITEM DESBLOQUEADO! 🎁
              </h2>
              <p className="text-gray-600">Você ganhou um prêmio incrível!</p>
            </div>

            {/* Unboxing animation */}
            <div className="mb-6 relative">
              <div className={`mx-auto transition-all duration-1000 ${
                isRevealed ? 'scale-110' : 'scale-100'
              }`}>
                {!isRevealed ? (
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-32 h-32 rounded-xl flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <Package className="h-16 w-16 text-white" />
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br ${getRarityColor(item.rarity)} w-32 h-32 rounded-xl flex items-center justify-center mx-auto shadow-2xl animate-pulse`}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-lg bg-white/20 p-2"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>

              {isRevealed && (
                <div className="absolute -top-2 -right-2">
                  <Badge className={`bg-gradient-to-r ${getRarityColor(item.rarity)} text-white border-0 animate-pulse`}>
                    {item.rarity.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            {isRevealed && (
              <div className="mb-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-3">
                  Valor estimado: R$ {item.value.toLocaleString('pt-BR')}
                </p>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      Item adicionado ao seu inventário!
                    </p>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            {isRevealed && (
              <div className="flex gap-3 animate-fade-in">
                <Button
                  onClick={onViewInventory}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Inventário
                </Button>
                <Button
                  onClick={onPlayAgain}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold"
                >
                  🎯 Jogar Mais
                </Button>
              </div>
            )}

            {isRevealed && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="mt-3 text-gray-500 hover:text-gray-700"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemWinModal;