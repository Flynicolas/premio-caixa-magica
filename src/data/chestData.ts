
export type Prize = {
  name: string;
  description: string;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
};

export type ChestType = 'silver' | 'gold' | 'diamond' | 'ruby' | 'premium';

export type Chest = {
  name: string;
  price: number;
  color: string;
  icon: string;
  description: string;
  prizes: Prize[];
};

export const chestData: Record<ChestType, Chest> = {
  silver: {
    name: 'Baú Prata',
    price: 29.90,
    color: 'from-gray-400 to-gray-600',
    icon: '🥈',
    description: 'Baú inicial com ótimos prêmios',
    prizes: [
      { name: 'Smartwatch Básico', description: 'Relógio inteligente com funções essenciais', value: 'R$ 20-40', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Caixa de Som Simples', description: 'Som de qualidade para o dia a dia', value: 'R$ 50', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Fone Redondo', description: 'Fone de ouvido confortável', value: 'R$ 30', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Copo Stanley Comum', description: 'Copo térmico resistente', value: 'R$ 60', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Copo Stanley 500ml', description: 'Copo térmico de 500ml', value: 'R$ 80', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Kit Garrafas 3 Tamanhos', description: 'Set completo de garrafas', value: 'R$ 90', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Fone tipo AirPods', description: 'Fones sem fio de qualidade', value: 'R$ 120', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Máquina Cortar Cabelo', description: 'Máquina profissional dragão', value: 'R$ 150', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Caixa de Som Grande', description: 'Som potente para festas', value: 'R$ 200', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Massageador', description: 'Relaxamento e bem-estar', value: 'R$ 180', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Projetor', description: 'Cinema em casa', value: 'R$ 300', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'TV 32"', description: 'Televisão Smart de 32 polegadas', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Celular até R$800', description: 'Smartphone de qualidade', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'PlayStation 5', description: 'Console de nova geração', value: 'R$ 4000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Gift Cards Streaming', description: 'Netflix, Spotify e mais', value: 'R$ 100', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Carregador Portátil', description: 'Power bank de alta capacidade', value: 'R$ 80', rarity: 'common', image: '/placeholder.svg' },
      { name: 'Máquina de Café', description: 'Café perfeito toda manhã', value: 'R$ 250', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Tablet Simples', description: 'Tablet para entretenimento', value: 'R$ 400', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Bicicleta Elétrica', description: 'Mobilidade sustentável', value: 'R$ 1500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Vale-Compras', description: 'Vale para loja popular', value: 'R$ 100', rarity: 'rare', image: '/placeholder.svg' }
    ]
  },
  gold: {
    name: 'Baú Ouro',
    price: 47.90,
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    description: 'Prêmios dourados te esperam',
    prizes: [
      { name: 'Smartwatch Premium', description: 'Relógio inteligente avançado', value: 'R$ 300', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Caixa de Som Premium', description: 'Som cristalino e potente', value: 'R$ 250', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Fone de Ouvido Bom', description: 'Qualidade de áudio superior', value: 'R$ 200', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Copo Stanley 500ml Gold', description: 'Edição especial dourada', value: 'R$ 120', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Massageador Pro', description: 'Massagem profissional em casa', value: 'R$ 300', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'PIX R$ 100', description: 'Dinheiro direto na conta', value: 'R$ 100', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Drone Básico', description: 'Voe e explore o mundo', value: 'R$ 400', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Projetor HD', description: 'Cinema em alta definição', value: 'R$ 500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'TV 42"', description: 'Smart TV de 42 polegadas', value: 'R$ 1200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Celular até R$1500', description: 'Smartphone top de linha', value: 'R$ 1500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Notebook', description: 'Laptop para trabalho e estudo', value: 'R$ 1000', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'PlayStation 5', description: 'Console next-gen', value: 'R$ 4000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Máquina Café Média', description: 'Café gourmet em casa', value: 'R$ 400', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Robô Aspirador', description: 'Limpeza automática', value: 'R$ 600', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Scooter', description: 'Mobilidade urbana', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Perfume + Nécessaire', description: 'Kit de beleza importado', value: 'R$ 300', rarity: 'rare', image: '/placeholder.svg' },
      { name: 'Vale-Compras Médio', description: 'Vale para loja de departamento', value: 'R$ 200', rarity: 'rare', image: '/placeholder.svg' }
    ]
  },
  diamond: {
    name: 'Baú Diamante',
    price: 97.90,
    color: 'from-blue-400 to-cyan-500',
    icon: '💎',
    description: 'Brilhe com prêmios exclusivos',
    prizes: [
      { name: 'AirPods Premium', description: 'Fones sem fio de alta qualidade', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Smartwatch Premium', description: 'Tecnologia de ponta no pulso', value: 'R$ 600', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Caixa Som Premium', description: 'Som profissional portátil', value: 'R$ 500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Copo Stanley Diamond', description: 'Edição limitada diamante', value: 'R$ 150', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Relógio Inteligente', description: 'Smartwatch com GPS', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Drone 4K', description: 'Filmagem profissional aérea', value: 'R$ 1200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'TV 65"', description: 'Smart TV 4K de 65 polegadas', value: 'R$ 2500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PC Gamer Montado', description: 'Setup completo para games', value: 'R$ 3000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PlayStation 5 Pro', description: 'Console premium', value: 'R$ 5000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'iPhone 14', description: 'Smartphone Apple mais recente', value: 'R$ 4000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Moto 125cc', description: 'Motocicleta para cidade', value: 'R$ 8000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Robô Aspirador Pro', description: 'Limpeza inteligente avançada', value: 'R$ 1200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Óculos VR', description: 'Realidade virtual imersiva', value: 'R$ 1500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Projetor 4K', description: 'Cinema 4K em casa', value: 'R$ 1000', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Patinete Elétrico', description: 'Mobilidade elétrica', value: 'R$ 1200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'PIX R$ 100', description: 'Dinheiro na conta', value: 'R$ 100', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Perfume Luxo', description: 'Fragrância importada premium', value: 'R$ 500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Vale-Compras Top', description: 'Vale para loja premium', value: 'R$ 500', rarity: 'epic', image: '/placeholder.svg' }
    ]
  },
  ruby: {
    name: 'Baú Rubi',
    price: 197.90,
    color: 'from-red-500 to-pink-600',
    icon: '🔴',
    description: 'Luxo e elegância em prêmios',
    prizes: [
      { name: 'Fones Premium Pro', description: 'Áudio profissional sem fio', value: 'R$ 1200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Caixa Som Qualidade', description: 'Som de estúdio portátil', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Smartwatch Ruby', description: 'Smartwatch edição rubi', value: 'R$ 1000', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Drone Profissional', description: 'Drone com câmera 4K pro', value: 'R$ 2000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Projetor Cinema', description: 'Projetor de cinema em casa', value: 'R$ 1500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'TV 75"', description: 'Smart TV 4K de 75 polegadas', value: 'R$ 4000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Notebook R$ 3000', description: 'Laptop premium para trabalho', value: 'R$ 3000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PC Gamer High-End', description: 'Setup gamer profissional', value: 'R$ 5000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PlayStation 5 Pro', description: 'Console next-gen premium', value: 'R$ 5000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Xbox Series X', description: 'Console Microsoft premium', value: 'R$ 4500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'iPhone 14 Pro', description: 'iPhone top de linha', value: 'R$ 6000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Moto Premium', description: 'Motocicleta de alta cilindrada', value: 'R$ 15000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PIX R$ 200', description: 'Dinheiro direto na conta', value: 'R$ 200', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Óculos VR Pro', description: 'Realidade virtual premium', value: 'R$ 2500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Viagem Nacional', description: 'Pacote completo com hotel', value: 'R$ 3000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Resort 5 Estrelas', description: '3 diárias em resort premium', value: 'R$ 2000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Tablet Avançado', description: 'Tablet top de linha', value: 'R$ 1500', rarity: 'epic', image: '/placeholder.svg' }
    ]
  },
  premium: {
    name: 'Baú Premium',
    price: 499.00,
    color: 'from-purple-500 via-pink-500 to-yellow-500',
    icon: '👑',
    description: 'O máximo em prêmios exclusivos',
    prizes: [
      { name: 'PlayStation 5 Pro Max', description: 'Console mais avançado do mercado', value: 'R$ 6000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Xbox Series X Premium', description: 'Console Microsoft top', value: 'R$ 5500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'TV 85" 8K', description: 'Smart TV 8K de 85 polegadas', value: 'R$ 8000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Notebook R$ 5000', description: 'Laptop profissional premium', value: 'R$ 5000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PC Gamer R$ 10 mil', description: 'Setup gamer extremo', value: 'R$ 10000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Moto R$ 15 mil', description: 'Motocicleta premium', value: 'R$ 15000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'iPhone 16 Pro Max', description: 'iPhone mais recente', value: 'R$ 8000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'iPhone 14 Pro', description: 'iPhone premium', value: 'R$ 6000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Bicicleta Aro 29', description: 'Bike premium para aventuras', value: 'R$ 2000', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Projetor Premium', description: 'Cinema profissional em casa', value: 'R$ 300', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Drone Premium', description: 'Drone profissional 4K', value: 'R$ 300', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Viagem Internacional', description: 'América do Sul - 7 dias', value: 'R$ 5000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Resort 5 Estrelas', description: '5 diárias em resort premium', value: 'R$ 3500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Viagem Nacional VIP', description: 'Pacote completo premium', value: 'R$ 4000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Maleta Maquiagem', description: 'Kit profissional completo', value: 'R$ 800', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Óculos VR Ultimate', description: 'Realidade virtual top', value: 'R$ 3000', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'Smartwatch Ultimate', description: 'Smartwatch mais avançado', value: 'R$ 1500', rarity: 'epic', image: '/placeholder.svg' },
      { name: 'Tablet Pro', description: 'Tablet profissional', value: 'R$ 2500', rarity: 'legendary', image: '/placeholder.svg' },
      { name: 'PIX R$ 1000', description: 'Dinheiro direto na conta', value: 'R$ 1000', rarity: 'legendary', image: '/placeholder.svg' }
    ]
  }
};
