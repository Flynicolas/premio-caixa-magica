
import { useState, useEffect } from 'react';
import { Trophy, Gift } from 'lucide-react';

const prizes = [
  'iPhone 16 Pro Max', 'Motocicleta Honda', 'Viagem para Dubai', 'R$ 5.000 PIX',
  'PlayStation 5', 'Smartwatch Apple', 'Notebook Gamer', 'Fone AirPods Pro',
  'Whisky Premium', 'Perfume Importado', 'R$ 1.000 PIX', 'Smart TV 65"',
  'Drone Profissional', 'Caixa de Som JBL', 'Tênis Nike Limited', 'Relógio Rolex'
];

const names = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Bruno', 'Paula',
  'Rafael', 'Camila', 'Diego', 'Fernanda', 'Lucas', 'Juliana', 'Marcos',
  'Beatriz', 'Gabriel', 'Sofia', 'Rodrigo', 'Amanda', 'Felipe', 'Carla',
  'Thiago', 'Leticia', 'Vinicius', 'Gabriela', 'André', 'Mariana', 'Daniel', 'Isabela'
];

const LiveWinsCarousel = () => {
  const [currentWin, setCurrentWin] = useState(0);
  const [wins, setWins] = useState<Array<{name: string, prize: string, time: string}>>([]);

  useEffect(() => {
    // Generate initial wins
    const initialWins = Array.from({ length: 5 }, () => ({
      name: names[Math.floor(Math.random() * names.length)],
      prize: prizes[Math.floor(Math.random() * prizes.length)],
      time: 'Agora mesmo'
    }));
    setWins(initialWins);

    // Update wins every 2-10 seconds
    const interval = setInterval(() => {
      const newWin = {
        name: names[Math.floor(Math.random() * names.length)],
        prize: prizes[Math.floor(Math.random() * prizes.length)],
        time: 'Agora mesmo'
      };
      
      setWins(prev => [newWin, ...prev.slice(0, 4)]);
      setCurrentWin(0);
    }, Math.random() * 8000 + 2000); // Random between 2-10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/30 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-center mb-4">
        <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
        <h2 className="text-xl font-bold text-center gold-gradient bg-clip-text text-transparent">
          🎉 Vitórias em Tempo Real 🎉
        </h2>
        <Gift className="w-6 h-6 text-yellow-400 ml-2" />
      </div>
      
      <div className="overflow-hidden h-20">
        <div 
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentWin * 80}px)` }}
        >
          {wins.map((win, index) => (
            <div
              key={index}
              className="h-20 flex items-center justify-center animate-pulse"
            >
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  <span className="text-primary">{win.name}</span> ganhou{' '}
                  <span className="text-yellow-400">{win.prize}</span>
                </p>
                <p className="text-sm text-muted-foreground">{win.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveWinsCarousel;
