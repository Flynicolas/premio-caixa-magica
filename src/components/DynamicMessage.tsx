import { useState, useEffect } from 'react';

const messages = [
  "🎯 Hora de Abrir o Baú!",
  "🚀 Sua Sorte te Espera!",
  "💎 Grandes Prêmios Aguardam!",
  "🎪 Diversão e Prêmios Garantidos!",
  "⭐ Teste sua Sorte Agora!",
  "🎁 Surpresas Incríveis te Esperam!",
  "🔥 Queime Etapas, Ganhe Mais!",
  "💰 Fortuna Está ao seu Alcance!",
  "🎉 Momentos de Pura Adrenalina!",
  "⚡ Energia Positiva, Grandes Ganhos!",
  "🌟 Brilhe com Nossos Prêmios!",
  "✨ A Magia dos Sorteios Começa Aqui!"
];

const DynamicMessage = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-6">
      <h1 className="text-4xl font-bold text-primary mb-4 transition-all duration-500 animate-fade-in">
        {messages[currentMessage]}
      </h1>
    </div>
  );
};

export default DynamicMessage;