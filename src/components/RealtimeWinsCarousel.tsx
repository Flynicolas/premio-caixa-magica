
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, Crown, Flame, Diamond, Star } from 'lucide-react';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';

interface RealtimeWinsCarouselProps {
  className?: string;
  showIcons?: boolean;
}

const RealtimeWinsCarousel = ({ className = '', showIcons = true }: RealtimeWinsCarouselProps) => {
  const { items } = useRealtimeItems();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentWins, setRecentWins] = useState<any[]>([]);

  // Simular ganhos recentes baseados nos itens do banco
  useEffect(() => {
    const generateRecentWins = () => {
      const wins = [];
      const userNames = ['João Silva', 'Maria Santos', 'Pedro Lima', 'Ana Costa', 'Carlos Souza', 'Lucia Oliveira', 'Rafael Alves', 'Fernanda Rocha'];
      
      // Pegar itens mais valiosos e raros
      const valuableItems = items
        .filter(item => item.base_value > 50 || ['epic', 'legendary'].includes(item.rarity))
        .slice(0, 10);

      for (let i = 0; i < Math.min(8, valuableItems.length); i++) {
        const item = valuableItems[i];
        wins.push({
          id: i,
          userName: userNames[i % userNames.length],
          item: item.name,
          value: item.base_value,
          rarity: item.rarity,
          image: item.image_url,
          timestamp: new Date(Date.now() - (i * 30000)) // 30 segundos entre cada "ganho"
        });
      }
      
      setRecentWins(wins);
    };

    if (items.length > 0) {
      generateRecentWins();
    }
  }, [items]);

  // Auto-scroll carousel
  useEffect(() => {
    if (recentWins.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % recentWins.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [recentWins.length]);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'epic': return <Diamond className="w-4 h-4 text-purple-400" />;
      case 'rare': return <Flame className="w-4 h-4 text-blue-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  if (recentWins.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <Trophy className="w-5 h-5" />
          <span>Carregando vitórias recentes...</span>
        </div>
      </div>
    );
  }

  const currentWin = recentWins[currentIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showIcons && (
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 font-bold text-sm animate-pulse">VITÓRIAS AO VIVO</span>
          <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />
        </div>
      )}
      
      <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentWin.image && (
              <img 
                src={currentWin.image} 
                alt={currentWin.item}
                className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{currentWin.userName}</span>
                <span className="text-green-400">ganhou</span>
              </div>
              <div className="flex items-center space-x-2">
                {showIcons && getRarityIcon(currentWin.rarity)}
                <span className={`font-semibold ${getRarityColor(currentWin.rarity).split(' ')[0]}`}>
                  {currentWin.item}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              R$ {Number(currentWin.value).toFixed(2)}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(currentWin.timestamp).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-3 bg-white/5 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / recentWins.length) * 100}%` }}
          />
        </div>
      </Card>
      
      {recentWins.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {recentWins.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RealtimeWinsCarousel;
