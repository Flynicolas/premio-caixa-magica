import { useState } from 'react';

interface ScratchCardOption {
  id: string;
  title: string;
  maxPrize: string;
  description: string;
  price: number;
  imageUrl: string;
  badge: string;
}

interface PremiumScratchCatalogProps {
  onCardSelect: (cardId: string) => void;
  userBalance?: number;
}

const scratchCardOptions: ScratchCardOption[] = [
  {
    id: 'pix-conta',
    title: 'PIX na conta',
    maxPrize: 'R$ 2000,00',
    description: 'Raspe e receba prêmios em DINHEIRO $$$ até R$2.000 diretamente no seu PIX',
    price: 0.50,
    imageUrl: '/lovable-uploads/87369589-5222-440c-84c6-a36731c8a384.png',
    badge: 'RASPADINHA PREMIADA'
  },
  {
    id: 'mega-premios',
    title: 'MEGA Prêmios',
    maxPrize: 'R$ 10000,00',
    description: 'Prêmios MILIONÁRIOS! Carros, motos, dinheiro e muito mais. Sua chance de ficar rico!',
    price: 2.00,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=300&fit=crop',
    badge: 'SUPER PREMIADA'
  },
  {
    id: 'eletronicos-premium',
    title: 'Tech Premium',
    maxPrize: 'R$ 15000,00',
    description: 'iPhones, MacBooks, PS5, e os eletrônicos mais cobiçados do mercado te esperam!',
    price: 1.50,
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=300&fit=crop',
    badge: 'TECH PREMIADA'
  },
  {
    id: 'casa-dos-sonhos',
    title: 'Casa dos Sonhos',
    maxPrize: 'R$ 25000,00',
    description: 'Móveis luxuosos, eletrodomésticos top e tudo para transformar sua casa!',
    price: 3.00,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=300&fit=crop',
    badge: 'CASA PREMIADA'
  }
];

const PremiumScratchCatalog = ({ onCardSelect, userBalance = 1000 }: PremiumScratchCatalogProps) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    onCardSelect(cardId);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎰 Catálogo Premium de Raspadinhas
        </h2>
        <p className="text-gray-300 text-sm">
          Prêmios incríveis te esperam!
        </p>
      </div>

      {/* Cards Stack */}
      <div className="space-y-4">
        {scratchCardOptions.map((card) => {
          const canAfford = userBalance >= card.price;
          const isSelected = selectedCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => canAfford && handleCardClick(card.id)}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${canAfford ? 'active:scale-95' : 'opacity-60 cursor-not-allowed'}
                ${isSelected ? 'ring-2 ring-yellow-400/50' : ''}
              `}
            >
              {/* Main Card Container - Mobile Optimized */}
              <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Golden rays background effect */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-orange-300/20"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/10 via-transparent to-transparent rotate-12"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/10 via-transparent to-transparent -rotate-12"></div>
                </div>

                {/* Top badges container */}
                <div className="relative z-20 flex justify-between items-start p-4">
                  {/* Premium Badge - Top Left */}
                  <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg border border-amber-600">
                    {card.badge}
                  </div>
                  
                  {/* Price Badge - Top Right */}
                  <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-lg shadow-lg border-2 border-yellow-300">
                    R$ {card.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                {/* Central Money Image */}
                <div className="relative z-10 flex justify-center py-4">
                  <div className="relative">
                    <img 
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-24 h-16 object-cover rounded-lg shadow-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"
                    />
                    {/* Glow effect around money */}
                    <div className="absolute -inset-2 bg-white/20 rounded-lg blur-md"></div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 p-4 pt-0">
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">
                    {card.title}
                  </h3>

                  {/* Prize Amount */}
                  <div className="text-center mb-3">
                    <div className="text-yellow-900 font-bold text-lg">
                      PRÊMIOS ATÉ {card.maxPrize}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-800 text-sm mb-4 text-center leading-relaxed">
                    {card.description}
                  </p>

                  {/* Action Button */}
                  <button
                    disabled={!canAfford}
                    className={`
                      w-full py-3 px-6 rounded-xl font-bold text-base
                      transition-all duration-300 flex items-center justify-center gap-2
                      ${canAfford 
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg active:scale-95' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {canAfford ? (
                      <>
                        Jogar Raspadinha 
                        <span className="text-lg">→</span>
                      </>
                    ) : (
                      'Saldo Insuficiente'
                    )}
                  </button>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
              </div>

              {/* Glow Effect for Selected Card */}
              {isSelected && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-50 blur-lg animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Balance Display */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700">
          <span className="text-gray-300 text-sm">💰 Seu saldo:</span>
          <span className="text-yellow-400 font-bold">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          ✨ Raspe e ganhe prêmios incríveis! ✨
        </p>
      </div>
    </div>
  );
};

export default PremiumScratchCatalog;