
import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const prizes = [
  { name: 'iPhone 16', image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png' },
  { name: 'Apple Watch', image: '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png' },
  { name: 'Xiaomi Phone', image: '/lovable-uploads/0d9f41b3-5ac9-4467-9987-5f9f55b48b43.png' },
  { name: 'Samsung Tablet', image: '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png' },
  { name: 'Bicicleta', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
  { name: 'Câmera', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'Dubai', image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png' },
  { name: 'Resort', image: '/lovable-uploads/b7b47eb2-d95e-46cf-a21c-f76ac2a74d20.png' },
  { name: 'Viagem', image: '/lovable-uploads/ced3cdc6-a614-4fa0-9afe-f0f73ff917b5.png' },
  { name: 'Vale Compras', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' },
  { name: 'MacBook Pro', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'AirPods Pro', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
  { name: 'Smart TV', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' },
  { name: 'PlayStation', image: '/lovable-uploads/70a08625-c438-4292-8356-821b05c265bc.png' }
];

interface RealtimeWinsCarouselProps {
  showIcons?: boolean;
  className?: string;
}

const RealtimeWinsCarousel = ({ showIcons = true, className = "" }: RealtimeWinsCarouselProps) => {
  const [currentItems, setCurrentItems] = useState<typeof prizes>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Initialize with 8 random items
    const initialItems = Array.from({ length: 8 }, () => 
      prizes[Math.floor(Math.random() * prizes.length)]
    );
    setCurrentItems(initialItems);
    setNextId(8);

    // Auto-slide every 3 seconds
    const interval = setInterval(() => {
      setCurrentItems(prev => {
        const newItem = prizes[Math.floor(Math.random() * prizes.length)];
        return [newItem, ...prev.slice(0, 7)];
      });
      setNextId(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gradient-to-r from-gray-900/30 to-gray-800/30 border border-green-500/20 rounded-lg p-4 ${className}`}>
      {showIcons && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-sm animate-pulse">AO VIVO</span>
          </div>
          <h2 className="text-lg font-bold text-center text-primary ml-4">
            Vitórias em Tempo Real
          </h2>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <div className="flex space-x-3 transition-transform duration-500 ease-out">
          {currentItems.map((item, index) => (
            <div
              key={`${item.name}-${nextId}-${index}`}
              className={`flex-shrink-0 w-20 h-20 bg-card/30 rounded-lg border border-primary/10 flex flex-col items-center justify-center p-2 transition-all duration-500 ${
                index === 0 ? 'animate-slide-in-left border-green-500/40 shadow-sm shadow-green-500/20' : ''
              } ${
                index === 7 ? 'animate-fade-out opacity-60' : ''
              }`}
            >
              <div className="w-10 h-10 rounded overflow-hidden mb-1 flex items-center justify-center bg-white/10">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="text-xs text-center text-white/90 font-medium truncate w-full">
                {item.name}
              </p>
            </div>
          ))}
        </div>
        
        {/* Gradient fade effect on edges */}
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-gray-900/50 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-gray-900/50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default RealtimeWinsCarousel;
