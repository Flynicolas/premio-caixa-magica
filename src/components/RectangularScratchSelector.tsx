import { useState } from 'react';
import { ChevronRight, Smartphone, Home, Car, DollarSign } from 'lucide-react';

interface ScratchCardType {
  id: string;
  title: string;
  maxPrize: string;
  description: string;
  price: number;
  theme: 'tech' | 'home' | 'money' | 'premium';
  imageUrl: string;
}

interface RectangularScratchSelectorProps {
  onCardSelect: (cardId: string) => void;
  userBalance: number;
  isLoading?: boolean;
}

const scratchCards: ScratchCardType[] = [
  {
    id: 'dinheirinho',
    title: 'Dinheirinho',
    maxPrize: 'R$ 5.000',
    description: 'Prêmios em dinheiro, PIX instantâneo e cartões presente',
    price: 25,
    theme: 'money',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400'
  },
  {
    id: 'eletronicos',
    title: 'Eletrônicos',
    maxPrize: 'R$ 12.000',
    description: 'Smartphones, tablets, notebooks e gadgets tech',
    price: 50,
    theme: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=400'
  },
  {
    id: 'para-casa',
    title: 'Para Casa',
    maxPrize: 'R$ 8.000',
    description: 'Eletrodomésticos, móveis e itens de decoração',
    price: 35,
    theme: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400'
  },
  {
    id: 'premios-top',
    title: 'Prêmios TOP',
    maxPrize: 'R$ 25.000',
    description: 'Carros, motos, viagens e experiências exclusivas',
    price: 100,
    theme: 'premium',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400'
  }
];

const getThemeIcon = (theme: string) => {
  switch (theme) {
    case 'tech': return <Smartphone className="w-5 h-5" />;
    case 'home': return <Home className="w-5 h-5" />;
    case 'money': return <DollarSign className="w-5 h-5" />;
    case 'premium': return <Car className="w-5 h-5" />;
    default: return <DollarSign className="w-5 h-5" />;
  }
};

const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'tech':
      return {
        gradient: 'from-blue-600 to-cyan-600',
        accent: 'text-blue-400',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20'
      };
    case 'home':
      return {
        gradient: 'from-green-600 to-emerald-600',
        accent: 'text-green-400',
        border: 'border-green-500/30',
        glow: 'shadow-green-500/20'
      };
    case 'money':
      return {
        gradient: 'from-amber-600 to-yellow-600',
        accent: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/20'
      };
    case 'premium':
      return {
        gradient: 'from-purple-600 to-pink-600',
        accent: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20'
      };
    default:
      return {
        gradient: 'from-gray-600 to-slate-600',
        accent: 'text-gray-400',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/20'
      };
  }
};

const RectangularScratchSelector = ({ onCardSelect, userBalance, isLoading }: RectangularScratchSelectorProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    onCardSelect(cardId);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          🎯 Catálogo de Raspadinhas
        </h2>
        <p className="text-gray-300">
          Escolha sua raspadinha e concorra a prêmios incríveis
        </p>
        <div className="mt-4 text-sm text-gray-400">
          💰 Seu saldo: <span className="text-amber-400 font-bold">R$ {userBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {scratchCards.map((card) => {
          const colors = getThemeColors(card.theme);
          const canAfford = userBalance >= card.price;
          const isSelected = selectedCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => canAfford && handleCardClick(card.id)}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${canAfford ? 'hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'}
                ${isSelected ? 'ring-2 ring-amber-500 scale-[1.02]' : ''}
              `}
            >
              {/* Main Card */}
              <div className={`
                bg-gradient-to-r ${colors.gradient} rounded-2xl overflow-hidden
                shadow-2xl ${colors.glow} border ${colors.border}
                ${canAfford ? 'hover:shadow-3xl' : ''}
              `}>
                <div className="flex h-40 md:h-48">
                  {/* Image Section - 40% */}
                  <div className="w-2/5 relative overflow-hidden">
                    <img 
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    {/* Theme Icon */}
                    <div className="absolute top-3 left-3">
                      <div className={`
                        p-2 rounded-full bg-white/20 backdrop-blur-sm
                        ${colors.accent}
                      `}>
                        {getThemeIcon(card.theme)}
                      </div>
                    </div>
                  </div>

                  {/* Content Section - 60% */}
                  <div className="w-3/5 p-6 flex flex-col justify-between text-white">
                    {/* Top Section */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">
                        {card.title}
                      </h3>
                      <div className="mb-3">
                        <span className="text-2xl md:text-3xl font-black text-amber-300">
                          ATÉ {card.maxPrize}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-xs text-gray-300 mb-1">PREÇO</div>
                        <div className="text-lg font-bold">
                          R$ {card.price.toFixed(0)}
                        </div>
                      </div>
                      
                      <button
                        disabled={!canAfford || isLoading}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
                          transition-all duration-200 text-sm
                          ${canAfford 
                            ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm' 
                            : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Jogar
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insufficient Balance Overlay */}
              {!canAfford && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-lg font-bold mb-1">Saldo Insuficiente</div>
                    <div className="text-sm text-gray-300">
                      Necessário: R$ {card.price.toFixed(0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          📏 <strong>Dimensões recomendadas para imagens:</strong> 600x400px (3:2) - Formato retangular horizontal
        </p>
        <p className="text-gray-300 text-xs mt-2">
          💡 As imagens devem ser otimizadas para carregamento rápido e alta qualidade visual
        </p>
      </div>
    </div>
  );
};

export default RectangularScratchSelector;