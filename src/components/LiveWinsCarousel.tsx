
import { useState, useEffect } from 'react';
import { Trophy, Gift } from 'lucide-react';

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
    const initialWins = Array.from({ length: 6 }, (_, index) => {
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
    setNextId(6);

    // Add new wins every 3-6 seconds
    const interval = setInterval(() => {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      const newWin = {
        id: nextId,
        name: names[Math.floor(Math.random() * names.length)],
        prize: prize.name,
        image: prize.image,
        time: 'Agora mesmo'
      };
      
      setWins(prev => [newWin, ...prev.slice(0, 5)]);
      setNextId(prev => prev + 1);
    }, Math.random() * 3000 + 3000); // Random between 3-6 seconds

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/20 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-center mb-4">
        <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
        <h2 className="text-xl font-bold text-center text-primary">
          🎉 Vitórias em Tempo Real 🎉
        </h2>
        <Gift className="w-6 h-6 text-yellow-400 ml-2" />
      </div>
      
      <div className="relative overflow-hidden h-20">
        <div className="flex transition-transform duration-500 ease-in-out">
          {wins.map((win, index) => (
            <div
              key={win.id}
              className={`min-w-80 h-20 flex items-center p-3 mx-2 bg-card/50 rounded-lg border border-primary/20 ${
                index === 0 ? 'animate-scale-in' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 flex-shrink-0 flex items-center justify-center bg-transparent">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveWinsCarousel;
