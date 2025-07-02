
import { useState, useEffect } from 'react';
import { Trophy, Gift, Radio } from 'lucide-react';

const prizes = [
  { name: 'iPhone 16 Pro Max', image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png' },
  { name: 'Smartwatch Apple', image: '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png' },
  { name: 'Xiaomi Phone', image: '/lovable-uploads/0d9f41b3-5ac9-4467-9987-5f9f55b48b43.png' },
  { name: 'Tablet Samsung', image: '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png' },
  { name: 'Bicicleta Dobrável', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
  { name: 'Câmera Segurança', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
  { name: 'Viagem Dubai', image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png' },
  { name: 'Resort 5 Estrelas', image: '/lovable-uploads/b7b47eb2-d95e-46cf-a21c-f76ac2a74d20.png' },
  { name: 'Viagem Nacional', image: '/lovable-uploads/ced3cdc6-a614-4fa0-9afe-f0f73ff917b5.png' },
  { name: 'Vale Compras', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' }
];

const names = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Bruno', 'Paula',
  'Rafael', 'Camila', 'Diego', 'Fernanda', 'Lucas', 'Juliana', 'Marcos',
  'Beatriz', 'Gabriel', 'Sofia', 'Rodrigo', 'Amanda', 'Felipe', 'Carla',
  'Thiago', 'Leticia', 'Vinicius', 'Gabriela', 'André', 'Mariana', 'Daniel', 'Isabela'
];

const LiveWinsCarousel = () => {
  const [wins, setWins] = useState<Array<{name: string, prize: string, image: string, time: string, id: number}>>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Generate initial wins
    const initialWins = Array.from({ length: 4 }, (_, index) => {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      return {
        id: index,
        name: names[Math.floor(Math.random() * names.length)],
        prize: prize.name,
        image: prize.image,
        time: 'Agora mesmo'
      };
    });
    setWins(initialWins);
    setNextId(4);

    // Add new wins every 4-7 seconds with smoother animations
    const interval = setInterval(() => {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      const newWin = {
        id: nextId,
        name: names[Math.floor(Math.random() * names.length)],
        prize: prize.name,
        image: prize.image,
        time: 'Agora mesmo'
      };
      
      setWins(prev => [newWin, ...prev.slice(0, 3)]);
      setNextId(prev => prev + 1);
    }, Math.random() * 3000 + 4000); // Random between 4-7 seconds

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/20 rounded-lg p-6 mb-12">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-red-500 font-bold text-sm animate-pulse">AO VIVO</span>
          </div>
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-center text-primary">
            Vitórias em Tempo Real
          </h2>
          <Gift className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="flex flex-col space-y-4">
          {wins.map((win, index) => (
            <div
              key={win.id}
              className={`flex items-center p-4 bg-card/50 rounded-lg border border-primary/20 transition-all duration-700 ease-out ${
                index === 0 ? 'animate-fade-in scale-105 border-green-500/40 shadow-lg shadow-green-500/20' : ''
              }`}
              style={{
                transform: index === 0 ? 'translateY(0)' : `translateY(${index * 4}px)`,
                opacity: Math.max(0.4, 1 - index * 0.2)
              }}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center bg-transparent border border-primary/20">
                <img 
                  src={win.image} 
                  alt={win.prize}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  <span className="text-primary">{win.name}</span> ganhou
                </p>
                <p className="text-sm text-yellow-400 truncate font-medium">
                  {win.prize}
                </p>
                <p className="text-xs text-muted-foreground">{win.time}</p>
              </div>
              {index === 0 && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span className="text-xs font-medium">NOVO</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveWinsCarousel;
