
import { useState, useEffect } from 'react';
import { Trophy, Gift } from 'lucide-react';

const prizes = [
  { name: 'iPhone 16 Pro Max', image: '/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png' },
  { name: 'Motocicleta Honda', image: '/lovable-uploads/6f83dc9e-58d4-427c-be2a-fb38b0ee66f3.png' },
  { name: 'Viagem para Dubai', image: '/lovable-uploads/a9a1a1e2-6d02-4df8-a1f7-95f111b30ee1.png' },
  { name: 'R$ 5.000 PIX', image: '/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png' },
  { name: 'PlayStation 5', image: '/lovable-uploads/6f83dc9e-58d4-427c-be2a-fb38b0ee66f3.png' },
  { name: 'Smartwatch Apple', image: '/lovable-uploads/a9a1a1e2-6d02-4df8-a1f7-95f111b30ee1.png' },
  { name: 'Notebook Gamer', image: '/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png' },
  { name: 'Fone AirPods Pro', image: '/lovable-uploads/6f83dc9e-58d4-427c-be2a-fb38b0ee66f3.png' }
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
      
      <div className="relative overflow-hidden h-24">
        <div className="flex transition-transform duration-500 ease-in-out">
          {wins.map((win, index) => (
            <div
              key={win.id}
              className={`min-w-80 h-24 flex items-center p-4 mx-2 bg-card/50 rounded-lg border border-primary/20 ${
                index === 0 ? 'animate-scale-in' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-primary/20 flex-shrink-0">
                <img 
                  src={win.image} 
                  alt={win.prize}
                  className="w-full h-full object-cover"
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
