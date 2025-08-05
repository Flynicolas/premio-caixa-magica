import { useState } from 'react';
import { Play, Star, Crown, Gift } from 'lucide-react';

interface ScratchCardType {
  id: string;
  title: string;
  maxPrize: string;
  description: string;
  price: number;
  theme: 'tech' | 'home' | 'money' | 'premium';
  imageUrl: string;
  popularity?: 'hot' | 'new' | 'exclusive' | null;
}

interface ScratchSelectorStyleThreeProps {
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
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=300',
    popularity: 'hot'
  },
  {
    id: 'eletronicos',
    title: 'Eletrônicos',
    maxPrize: 'R$ 12.000',
    description: 'Smartphones, tablets, notebooks e gadgets tech',
    price: 50,
    theme: 'tech',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=300',
    popularity: 'new'
  },
  {
    id: 'para-casa',
    title: 'Para Casa',
    maxPrize: 'R$ 8.000',
    description: 'Eletrodomésticos, móveis e itens de decoração',
    price: 35,
    theme: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=300',
    popularity: null
  },
  {
    id: 'premios-top',
    title: 'Prêmios TOP',
    maxPrize: 'R$ 25.000',
    description: 'Carros, motos, viagens e experiências exclusivas',
    price: 100,
    theme: 'premium',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=300',
    popularity: 'exclusive'
  }
];

const getPopularityBadge = (popularity: string | null) => {
  switch (popularity) {
    case 'hot':
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
          🔥 POPULAR
        </div>
      );
    case 'new':
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ✨ NOVO
        </div>
      );
    case 'exclusive':
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          👑 VIP
        </div>
      );
    default:
      return null;
  }
};

const getThemeBorder = (theme: string) => {
  switch (theme) {
    case 'tech': return 'border-cyan-500/30 shadow-cyan-500/20';
    case 'home': return 'border-emerald-500/30 shadow-emerald-500/20';
    case 'money': return 'border-amber-500/30 shadow-amber-500/20';
    case 'premium': return 'border-purple-500/30 shadow-purple-500/20';
    default: return 'border-gray-500/30 shadow-gray-500/20';
  }
};

const getThemeAccentColor = (theme: string) => {
  switch (theme) {
    case 'tech': return 'text-cyan-400';
    case 'home': return 'text-emerald-400';
    case 'money': return 'text-amber-400';
    case 'premium': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

const ScratchSelectorStyleThree = ({ onCardSelect, userBalance, isLoading }: ScratchSelectorStyleThreeProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    onCardSelect(cardId);
  };

  return (
    <div className="w-full">
      {/* Header Futurista */}
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
            MEGA CATÁLOGO
          </h2>
          <div className="absolute -top-2 -right-2">
            <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Experiência de jogo de outro nível com prêmios extraordinários
        </p>
        <div className="mt-6 flex justify-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2">
            <span className="text-sm font-semibold text-purple-300">💰 Saldo disponível: </span>
            <span className="text-amber-400 font-bold text-lg">R$ {userBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Cards Grid - Layout Dinâmico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {scratchCards.map((card) => {
          const canAfford = userBalance >= card.price;
          const isSelected = selectedCard === card.id;
          const isHovered = hoveredCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => canAfford && handleCardClick(card.id)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                relative group transition-all duration-500 transform
                ${canAfford ? 'cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'}
                ${isSelected ? 'scale-105 z-10' : ''}
              `}
            >
              {/* Background com gradiente animado */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-500
                ${isHovered ? 'bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-red-600/20 shadow-2xl' : 'bg-gray-900/80'}
                border-2 ${getThemeBorder(card.theme)}
              `}></div>

              {/* Popularity Badge */}
              {getPopularityBadge(card.popularity)}

              <div className="relative flex h-44 md:h-52 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Imagem Section - 50% */}
                <div className="w-1/2 relative overflow-hidden">
                  <img 
                    src={card.imageUrl}
                    alt={card.title}
                    className={`
                      w-full h-full object-cover transition-all duration-700
                      ${isHovered ? 'scale-125 rotate-2' : 'scale-110'}
                    `}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40"></div>
                  
                  {/* Efeito de brilho */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent animate-pulse"></div>
                  )}
                </div>

                {/* Content Section - 50% */}
                <div className="w-1/2 p-6 flex flex-col justify-between relative">
                  {/* Elemento decorativo animado */}
                  <div className={`
                    absolute top-4 right-4 transition-all duration-300
                    ${isHovered ? 'scale-125 rotate-12' : 'scale-100'}
                  `}>
                    <Star className={`w-6 h-6 ${getThemeAccentColor(card.theme)}`} />
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                      {card.title}
                    </h3>
                    
                    <div className="relative mb-4">
                      <div className={`
                        text-2xl md:text-3xl font-black ${getThemeAccentColor(card.theme)}
                        ${isHovered ? 'animate-pulse' : ''}
                      `}>
                        ATÉ {card.maxPrize}
                      </div>
                      {isHovered && (
                        <div className="absolute -right-2 top-0">
                          <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-4">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                        Valor
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white">
                        R$ {card.price}
                      </div>
                    </div>
                    
                    <button
                      disabled={!canAfford || isLoading}
                      className={`
                        group/btn relative overflow-hidden flex items-center gap-2 px-4 py-3 
                        rounded-xl font-bold transition-all duration-300 text-sm
                        ${canAfford 
                          ? `bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                             text-white shadow-lg hover:shadow-xl transform hover:scale-110` 
                          : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <Play className="w-4 h-4" />
                      <span>JOGAR</span>
                      
                      {/* Efeito shimmer */}
                      {canAfford && (
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Insufficient Balance Overlay */}
              {!canAfford && (
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white">
                    <div className="text-lg font-bold mb-2">💳 Saldo Insuficiente</div>
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

      {/* Footer com informações */}
      <div className="mt-10 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
          <p className="text-gray-300 text-sm mb-2">
            🎯 <strong>Dimensões ideais:</strong> 600x300px (formato 2:1) - Otimizado para visualização horizontal
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span>📱 Responsivo</span>
            <span>⚡ Carregamento rápido</span>
            <span>🎨 Alta qualidade</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchSelectorStyleThree;