
import { useState, useEffect } from 'react';
import { Radio, Trophy, Gift } from 'lucide-react';

const prizes = [
  { name: 'iPhone 16', winner: 'João M.', image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png' },
  { name: 'Apple Watch', winner: 'Maria S.', image: '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png' },
  { name: 'Xiaomi Phone', winner: 'Pedro L.', image: '/lovable-uploads/0d9f41b3-5ac9-4467-9987-5f9f55b48b43.png' },
  { name: 'Samsung Tablet', winner: 'Ana R.', image: '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png' },
  { name: 'Bicicleta', winner: 'Carlos M.', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
  { name: 'Câmera', winner: 'Lucia F.', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'Dubai', winner: 'Roberto K.', image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png' },
  { name: 'Resort', winner: 'Fernanda G.', image: '/lovable-uploads/b7b47eb2-d95e-46cf-a21c-f76ac2a74d20.png' },
  { name: 'Viagem', winner: 'Miguel A.', image: '/lovable-uploads/ced3cdc6-a614-4fa0-9afe-f0f73ff917b5.png' },
  { name: 'Vale Compras', winner: 'Juliana B.', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' },
  { name: 'MacBook Pro', winner: 'Diego C.', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'AirPods Pro', winner: 'Camila D.', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
  { name: 'Smart TV', winner: 'Bruno H.', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' },
  { name: 'PlayStation', winner: 'Larissa P.', image: '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png' },
  { name: 'PIX R$ 1000', winner: 'Rafael T.', image: '/lovable-uploads/1e75dbed-c6dc-458b-bf5f-867f613d6c3f.png' },
  { name: 'Notebook', winner: 'Beatriz V.', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'Smartphone', winner: 'Gustavo N.', image: '/lovable-uploads/0d9f41b3-5ac9-4467-9987-5f9f55b48b43.png' },
  { name: 'Headphone', winner: 'Isabela Q.', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' }
];

interface RealtimeWinsCarouselProps {
  showIcons?: boolean;
  className?: string;
}

const RealtimeWinsCarousel = ({ showIcons = true, className = "" }: RealtimeWinsCarouselProps) => {
  const [currentItems, setCurrentItems] = useState<typeof prizes>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Initialize with 12 random items
    const initialItems = Array.from({ length: 12 }, () => 
      prizes[Math.floor(Math.random() * prizes.length)]
    );
    setCurrentItems(initialItems);
    setNextId(12);

    // Auto-slide every 3 seconds
    const interval = setInterval(() => {
      setCurrentItems(prev => {
        const newItem = prizes[Math.floor(Math.random() * prizes.length)];
        return [newItem, ...prev.slice(0, 11)];
      });
      setNextId(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative bg-gradient-to-r from-gray-900/40 via-gray-800/30 to-gray-900/40 border-2 border-primary/30 rounded-xl p-6 shadow-2xl overflow-hidden ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/50 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/50 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/50 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/50 rounded-br" />

      {showIcons && (
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-red-500 font-bold text-sm animate-pulse">AO VIVO</span>
            </div>
            <div className="w-px h-6 bg-primary/30" />
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Vitórias em Tempo Real
            </h2>
          </div>
          <Gift className="w-6 h-6 text-primary/60 animate-pulse" />
        </div>
      )}
      
      <div className="relative overflow-hidden z-10">
        <div className="flex space-x-4 transition-transform duration-500 ease-out">
          {currentItems.map((item, index) => (
            <div
              key={`${item.name}-${item.winner}-${nextId}-${index}`}
              className={`flex-shrink-0 w-24 h-28 bg-gradient-to-b from-card/40 to-card/60 rounded-lg border-2 border-primary/20 flex flex-col items-center justify-center p-3 transition-all duration-500 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 ${
                index === 0 ? 'animate-slide-in-left border-primary/50 shadow-md shadow-primary/30 bg-gradient-to-b from-primary/10 to-card/60' : ''
              } ${
                index === 11 ? 'animate-fade-out opacity-60' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden mb-2 flex items-center justify-center bg-white/20 border border-primary/20">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-xs text-center text-white/90 font-bold truncate w-full mb-1">
                {item.name}
              </p>
              <p className="text-xs text-center text-primary/80 font-medium truncate w-full">
                {item.winner} ganhou
              </p>
              
              {/* Glow effect for new items */}
              {index === 0 && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>
        
        {/* Enhanced gradient fade effects */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900/80 via-gray-900/40 to-transparent pointer-events-none z-20" />
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};

export default RealtimeWinsCarousel;
