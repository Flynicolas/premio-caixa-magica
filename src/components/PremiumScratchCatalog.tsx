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
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          🎰 Catálogo Premium de Raspadinhas
        </h2>
        <p className="text-gray-300 text-lg">
          Prêmios incríveis te esperam! Escolha sua raspadinha favorita
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {scratchCardOptions.map((card) => {
          const canAfford = userBalance >= card.price;
          const isSelected = selectedCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => canAfford && handleCardClick(card.id)}
              className={`
                relative group cursor-pointer transition-all duration-300 transform
                ${canAfford ? 'hover:scale-[1.03] hover:shadow-2xl' : 'opacity-60 cursor-not-allowed'}
                ${isSelected ? 'scale-[1.03] ring-4 ring-yellow-400/50' : ''}
              `}
            >
              {/* Main Card Container */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
                
                {/* Background Image with Overlay */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <img 
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  
                  {/* Price Seal - Top Right (Mobile focused) */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-yellow-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-lg shadow-lg border-2 border-yellow-300">
                      R$ {card.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-white drop-shadow-lg">
                      {card.title}
                    </h3>

                    {/* Prize Amount - Mobile optimized */}
                    <div className="mb-3">
                      <span className="text-yellow-400 font-bold text-sm md:text-lg">PRÊMIOS ATÉ </span>
                      <span className="text-yellow-400 font-black text-xl md:text-2xl">
                        {card.maxPrize}
                      </span>
                    </div>

                    {/* Description - Mobile optimized */}
                    <p className="text-gray-200 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>

                    {/* Action Button - Mobile optimized */}
                    <button
                      disabled={!canAfford}
                      className={`
                        w-full py-2.5 md:py-4 px-4 md:px-6 rounded-lg font-bold text-sm md:text-lg
                        transition-all duration-300 flex items-center justify-center
                        ${canAfford 
                          ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg hover:shadow-xl' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {canAfford ? 'Jogar' : 'Saldo Insuficiente'}
                    </button>
                  </div>
                </div>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
              </div>

              {/* Glow Effect for Selected Card */}
              {isSelected && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-30 blur-lg animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Balance Display */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-xl px-6 py-3 border border-gray-700">
          <span className="text-gray-300">💰 Seu saldo:</span>
          <span className="text-yellow-400 font-bold text-lg">R$ {userBalance.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          ✨ Raspe e ganhe prêmios incríveis instantaneamente! ✨
        </p>
      </div>
    </div>
  );
};

export default PremiumScratchCatalog;