import { useState } from 'react';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';

interface ScratchCardType {
  id: string;
  title: string;
  maxPrize: string;
  description: string;
  price: number;
  theme: 'tech' | 'home' | 'money' | 'premium';
  imageUrl: string;
}

interface ScratchSelectorStyleTwoProps {
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
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=300'
  },
  {
    id: 'eletronicos',
    title: 'Eletrônicos',
    maxPrize: 'R$ 12.000',
    description: 'Smartphones, tablets, notebooks e gadgets tech',
    price: 50,
    theme: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=300'
  },
  {
    id: 'para-casa',
    title: 'Para Casa',
    maxPrize: 'R$ 8.000',
    description: 'Eletrodomésticos, móveis e itens de decoração',
    price: 35,
    theme: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=300'
  },
  {
    id: 'premios-top',
    title: 'Prêmios TOP',
    maxPrize: 'R$ 25.000',
    description: 'Carros, motos, viagens e experiências exclusivas',
    price: 100,
    theme: 'premium',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=300'
  }
];

const getThemeGradient = (theme: string) => {
  switch (theme) {
    case 'tech': return 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20';
    case 'home': return 'from-emerald-500/20 via-green-500/20 to-teal-500/20';
    case 'money': return 'from-amber-500/20 via-yellow-500/20 to-orange-500/20';
    case 'premium': return 'from-purple-500/20 via-pink-500/20 to-rose-500/20';
    default: return 'from-gray-500/20 via-slate-500/20 to-zinc-500/20';
  }
};

const getThemeAccent = (theme: string) => {
  switch (theme) {
    case 'tech': return 'text-cyan-400';
    case 'home': return 'text-emerald-400';
    case 'money': return 'text-amber-400';
    case 'premium': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

const ScratchSelectorStyleTwo = ({ onCardSelect, userBalance, isLoading }: ScratchSelectorStyleTwoProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    onCardSelect(cardId);
  };

  return (
    <div className="w-full">
      {/* Header Minimalista */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          Catálogo <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Premium</span>
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
        <p className="text-gray-300 text-lg">
          Experiência de jogo refinada
        </p>
      </div>

      {/* Cards Grid - Layout Clean */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {scratchCards.map((card, index) => {
          const canAfford = userBalance >= card.price;
          const isSelected = selectedCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => canAfford && handleCardClick(card.id)}
              className={`
                group relative overflow-hidden rounded-3xl transition-all duration-500
                ${canAfford ? 'cursor-pointer hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'}
                ${isSelected ? 'ring-2 ring-amber-400/50 scale-[1.01]' : ''}
              `}
            >
              {/* Background com gradiente sutil */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${getThemeGradient(card.theme)}
                backdrop-blur-sm border border-white/10
              `}></div>
              
              {/* Glass effect */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-md"></div>

              <div className="relative flex h-32 md:h-40">
                {/* Imagem Section - 45% */}
                <div className="w-[45%] relative overflow-hidden rounded-l-3xl">
                  <img 
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30"></div>
                </div>

                {/* Content Section - 55% */}
                <div className="w-[55%] p-6 md:p-8 flex flex-col justify-between relative">
                  {/* Decorative element */}
                  <div className="absolute top-4 right-4 opacity-30">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {card.title}
                    </h3>
                    <div className={`text-2xl md:text-3xl font-black mb-3 ${getThemeAccent(card.theme)}`}>
                      ATÉ {card.maxPrize}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between pt-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Investimento
                      </div>
                      <div className="text-xl font-bold text-white">
                        R$ {card.price}
                      </div>
                    </div>
                    
                    <button
                      disabled={!canAfford || isLoading}
                      className={`
                        group/btn flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold
                        transition-all duration-300 text-sm
                        ${canAfford 
                          ? 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20 hover:border-white/40' 
                          : 'bg-gray-500/30 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      <span>Jogar Agora</span>
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover glow effect */}
              {canAfford && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(card.theme)} blur-xl`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScratchSelectorStyleTwo;