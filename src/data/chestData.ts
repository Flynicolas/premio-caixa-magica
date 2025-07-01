export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Prize {
  name: string;
  description: string;
  value: string;
  rarity: Rarity;
  image: string;
}

export interface Chest {
  name: string;
  price: number;
  description: string;
  prizes: Prize[];
}

export type ChestType = 'silver' | 'gold' | 'diamond' | 'ruby' | 'premium';

export const chestData: Record<ChestType, Chest> = {
  silver: {
    name: 'Baú Prata',
    price: 29.90,
    description: 'Prêmios incríveis esperando por você!',
    prizes: [
      { name: 'Smartwatch', description: 'Relógio inteligente moderno', value: 'R$ 150', rarity: 'common', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Caixa de Som', description: 'Som de alta qualidade', value: 'R$ 120', rarity: 'common', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Fone Redondo', description: 'Conforto e qualidade sonora', value: 'R$ 80', rarity: 'common', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Copo Stanley', description: 'Mantenha sua bebida na temperatura ideal', value: 'R$ 90', rarity: 'common', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Kit Garrafas', description: '3 tamanhos diferentes', value: 'R$ 70', rarity: 'common', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Fone AirPods', description: 'Sem fio, máxima liberdade', value: 'R$ 200', rarity: 'rare', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Máquina Cortar Cabelo', description: 'Design dragão exclusivo', value: 'R$ 160', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Caixa de Som Grande', description: 'Potência e graves profundos', value: 'R$ 300', rarity: 'rare', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Massageador', description: 'Relaxamento total', value: 'R$ 180', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Projetor', description: 'Cinema em casa', value: 'R$ 400', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'TV 32"', description: 'Entretenimento em alta definição', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Celular Premium', description: 'Smartphone até R$ 800', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'PlayStation 5', description: 'Console de nova geração', value: 'R$ 3500', rarity: 'legendary', image: '/lovable-uploads/7977ec18-f5c2-486c-b076-db30a05c8580.png' },
      { name: 'Gift Cards', description: 'Netflix, Spotify e mais', value: 'R$ 100', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Carregador Portátil', description: 'Nunca fique sem bateria', value: 'R$ 80', rarity: 'common', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Máquina de Café', description: 'Compacta e eficiente', value: 'R$ 250', rarity: 'rare', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Tablet Simples', description: 'Portabilidade e praticidade', value: 'R$ 400', rarity: 'rare', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Bicicleta Elétrica', description: 'Mobilidade sustentável', value: 'R$ 1200', rarity: 'epic', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'Vale-Compras', description: 'Loja popular', value: 'R$ 200', rarity: 'common', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Kit Maquiagem', description: 'Beleza completa', value: 'R$ 300', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' }
    ]
  },
  
  gold: {
    name: 'Baú Ouro',
    price: 47.90,
    description: 'Prêmios de maior valor te aguardam!',
    prizes: [
      { name: 'Smartwatch Premium', description: 'Tecnologia avançada no pulso', value: 'R$ 300', rarity: 'rare', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Caixa de Som Pro', description: 'Qualidade profissional', value: 'R$ 400', rarity: 'rare', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Fone Premium', description: 'Cancelamento de ruído', value: 'R$ 250', rarity: 'rare', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Stanley 500ml', description: 'Térmica premium', value: 'R$ 150', rarity: 'common', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Massageador Pro', description: 'Terapia profissional', value: 'R$ 350', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'PIX R$ 100', description: 'Dinheiro direto na conta', value: 'R$ 100', rarity: 'common', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Drone Básico', description: 'Voe e explore', value: 'R$ 500', rarity: 'epic', image: '/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png' },
      { name: 'Projetor HD', description: 'Cinema em alta definição', value: 'R$ 600', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'TV 42"', description: 'Entretenimento ampliado', value: 'R$ 1200', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Celular R$ 1500', description: 'Smartphone avançado', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Notebook', description: 'Até R$ 1000', value: 'R$ 1000', rarity: 'epic', image: '/lovable-uploads/9b899380-8ff3-426f-9b67-9557ab90bf86.png' },
      { name: 'PlayStation 5', description: 'Console de nova geração', value: 'R$ 3500', rarity: 'legendary', image: '/lovable-uploads/7977ec18-f5c2-486c-b076-db30a05c8580.png' },
      { name: 'Cafeteira Média', description: 'Qualidade barista', value: 'R$ 400', rarity: 'rare', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Robô Aspirador', description: 'Limpeza automática', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Scooter', description: 'Mobilidade urbana', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'Perfume Importado', description: 'Fragrância + nécessaire', value: 'R$ 300', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Vale-Compras Médio', description: 'Loja de departamentos', value: 'R$ 400', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Kit Gaming', description: 'Acessórios gamer', value: 'R$ 600', rarity: 'epic', image: '/lovable-uploads/e153d1cf-dc90-4520-8b27-33a6cb4a3e2f.png' },
      { name: 'Óculos VR', description: 'Realidade virtual', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Xbox Series S', description: 'Console compacto', value: 'R$ 2000', rarity: 'legendary', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' }
    ]
  },

  diamond: {
    name: 'Baú Diamante',
    price: 97.90,
    description: 'Prêmios valiosos como diamantes!',
    prizes: [
      { name: 'AirPods Pro', description: 'Qualidade Apple genuína', value: 'R$ 600', rarity: 'epic', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Smartwatch Pro', description: 'Tecnologia de ponta', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Som Premium', description: 'Áudio profissional', value: 'R$ 1000', rarity: 'epic', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Stanley Premium', description: 'Edição limitada 500ml', value: 'R$ 200', rarity: 'rare', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Relógio Inteligente', description: 'Funcionalidades avançadas', value: 'R$ 1200', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Drone Pro', description: 'Câmera 4K', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png' },
      { name: 'TV 65"', description: 'Ultra HD 4K', value: 'R$ 2500', rarity: 'legendary', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'PC Gamer', description: 'Setup completo montado', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/e153d1cf-dc90-4520-8b27-33a6cb4a3e2f.png' },
      { name: 'PlayStation 5', description: 'Console premium', value: 'R$ 3500', rarity: 'legendary', image: '/lovable-uploads/7977ec18-f5c2-486c-b076-db30a05c8580.png' },
      { name: 'iPhone 14', description: 'Smartphone Apple', value: 'R$ 4500', rarity: 'legendary', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Caixa de Som Média', description: 'JBL ou similar', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Moto 125cc', description: 'Transporte ágil', value: 'R$ 8000', rarity: 'legendary', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'Robô Aspirador Pro', description: 'Inteligência artificial', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Óculos VR Pro', description: 'Realidade virtual avançada', value: 'R$ 1800', rarity: 'epic', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Projetor 4K', description: 'Cinema profissional', value: 'R$ 1200', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Patinete Elétrico', description: 'Mobilidade elétrica', value: 'R$ 2000', rarity: 'epic', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'PIX R$ 100', description: 'Transferência instantânea', value: 'R$ 100', rarity: 'common', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Perfume Luxo', description: 'Fragrância importada premium', value: 'R$ 500', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Vale-Compras Top', description: 'Shopping premium', value: 'R$ 800', rarity: 'epic', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Notebook Gamer', description: 'Performance alta', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/9b899380-8ff3-426f-9b67-9557ab90bf86.png' }
    ]
  },

  ruby: {
    name: 'Baú Rubi',
    price: 197.90,
    description: 'Prêmios raros como rubis preciosos!',
    prizes: [
      { name: 'Fones Premium Pro', description: 'Áudio de alta fidelidade', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Caixa Som Premium', description: 'Qualidade audiófila', value: 'R$ 2000', rarity: 'epic', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'Smartwatch Ultra', description: 'Tecnologia máxima', value: 'R$ 2500', rarity: 'epic', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Drone Professional', description: 'Câmera cinematográfica', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png' },
      { name: 'Projetor Cinema', description: 'Qualidade comercial', value: 'R$ 2500', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'TV 75"', description: 'Tela gigante Ultra HD', value: 'R$ 4500', rarity: 'legendary', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Notebook R$ 3000', description: 'Performance profissional', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/9b899380-8ff3-426f-9b67-9557ab90bf86.png' },
      { name: 'PC Gamer Pro', description: 'Setup completo premium', value: 'R$ 8000', rarity: 'legendary', image: '/lovable-uploads/e153d1cf-dc90-4520-8b27-33a6cb4a3e2f.png' },
      { name: 'PlayStation 5 Pro', description: 'Edição especial', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/7977ec18-f5c2-486c-b076-db30a05c8580.png' },
      { name: 'Xbox Series X', description: 'Console mais potente', value: 'R$ 3500', rarity: 'legendary', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'iPhone 14 Pro', description: 'Linha profissional Apple', value: 'R$ 6000', rarity: 'legendary', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Motocicleta', description: 'Transporte premium', value: 'R$ 12000', rarity: 'legendary', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'PIX R$ 200', description: 'Dinheiro instantâneo', value: 'R$ 200', rarity: 'rare', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Óculos VR Ultra', description: 'Realidade virtual premium', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Viagem Nacional', description: 'Pacote completo com hotel', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Resort 5 Estrelas', description: 'Estadia de luxo', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Tablet Avançado', description: 'Tecnologia de ponta', value: 'R$ 2000', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Kit Maquiagem Luxo', description: 'Marcas internacionais', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Experiência VR', description: 'Pacote completo', value: 'R$ 2500', rarity: 'epic', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Setup Gamer Completo', description: 'Tudo para jogos', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/e153d1cf-dc90-4520-8b27-33a6cb4a3e2f.png' }
    ]
  },

  premium: {
    name: 'Baú Premium',
    price: 499.00,
    description: 'Os prêmios mais exclusivos e valiosos!',
    prizes: [
      { name: 'PlayStation 5 Pro', description: 'Console de última geração', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/7977ec18-f5c2-486c-b076-db30a05c8580.png' },
      { name: 'Xbox Series X', description: 'Poder máximo de processamento', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/300675c3-5e02-433b-9f0e-df0a52414210.png' },
      { name: 'TV 85"', description: 'Cinema em casa gigante', value: 'R$ 8000', rarity: 'legendary', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Notebook R$ 5000', description: 'Performance empresarial', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/9b899380-8ff3-426f-9b67-9557ab90bf86.png' },
      { name: 'PC Gamer R$ 10k', description: 'Setup dos sonhos', value: 'R$ 10000', rarity: 'legendary', image: '/lovable-uploads/e153d1cf-dc90-4520-8b27-33a6cb4a3e2f.png' },
      { name: 'Moto R$ 15k', description: 'Motocicleta premium', value: 'R$ 15000', rarity: 'legendary', image: '/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png' },
      { name: 'iPhone 16', description: 'Último lançamento Apple', value: 'R$ 8000', rarity: 'legendary', image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png' },
      { name: 'iPhone 14 Pro Max', description: 'Tela maxima Apple', value: 'R$ 6500', rarity: 'legendary', image: '/lovable-uploads/771650de-7318-4924-acad-9c079ea5d562.png' },
      { name: 'Bicicleta Aro 29', description: 'Mountain bike profissional', value: 'R$ 3000', rarity: 'epic', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
      { name: 'Projetor Cinema', description: 'R$ 150 a R$ 300', value: 'R$ 300', rarity: 'epic', image: '/lovable-uploads/772ebc3d-d9c4-4d27-86f4-62df1722f382.png' },
      { name: 'Drone Premium', description: 'R$ 100 a R$ 300', value: 'R$ 300', rarity: 'epic', image: '/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png' },
      { name: 'Viagem Internacional', description: 'América do Sul completa', value: 'R$ 8000', rarity: 'legendary', image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png' },
      { name: 'Resort 5 Estrelas', description: '5 diárias tudo incluído', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/b7b47eb2-d95e-46cf-a21c-f76ac2a74d20.png' },
      { name: 'Viagem Nacional', description: 'Pacote completo premium', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/ced3cdc6-a614-4fa0-9afe-f0f73ff917b5.png' },
      { name: 'Maleta Maquiagem', description: 'Kit profissional completo', value: 'R$ 2000', rarity: 'epic', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Óculos VR Premium', description: 'Realidade virtual 8K', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/d680b250-790e-4beb-aa2d-38c7932794db.png' },
      { name: 'Smartwatch Ultra', description: 'Tecnologia espacial', value: 'R$ 3000', rarity: 'legendary', image: '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png' },
      { name: 'Tablet Pro', description: 'Profissional avançado', value: 'R$ 3500', rarity: 'legendary', image: '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png' },
      { name: 'PIX R$ 1000', description: 'Mil reais instantâneo', value: 'R$ 1000', rarity: 'epic', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Experiência Premium', description: 'Pacote exclusivo VIP', value: 'R$ 10000', rarity: 'legendary', image: '/lovable-uploads/082b5047-df41-4d24-93f2-4ab5aea94b4f.png' },
      { name: 'Xiaomi Premium', description: 'Smartphone com câmera profissional', value: 'R$ 2500', rarity: 'epic', image: '/lovable-uploads/0d9f41b3-5ac9-4467-9987-5f9f55b48b43.png' },
      { name: 'Câmera Segurança 4K', description: 'Monitoramento profissional', value: 'R$ 1500', rarity: 'epic', image: '/lovable-uploads/24dbf933-dd9b-4ea9-b253-022bd366da2f.png' },
      { name: 'Bicicleta Dobrável', description: 'Mobilidade urbana compacta', value: 'R$ 2000', rarity: 'epic', image: '/lovable-uploads/3c51402c-67ee-4d20-8b11-9a334ca0e2db.png' },
      { name: 'Tablet Samsung Pro', description: 'Performance empresarial', value: 'R$ 4000', rarity: 'legendary', image: '/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png' },
      { name: 'Smartwatch Apple Ultra', description: 'Tecnologia de ponta no pulso', value: 'R$ 4500', rarity: 'legendary', image: '/lovable-uploads/e7b617c4-f45a-4596-994a-75c0e3553f78.png' },
      { name: 'iPhone 16 Pro Max', description: 'O melhor da Apple', value: 'R$ 10000', rarity: 'legendary', image: '/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png' },
      { name: 'Viagem Dubai Premium', description: 'Pacote luxo completo', value: 'R$ 15000', rarity: 'legendary', image: '/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png' },
      { name: 'Resort Maldivas', description: 'Paraíso tropical exclusivo', value: 'R$ 20000', rarity: 'legendary', image: '/lovable-uploads/b7b47eb2-d95e-46cf-a21c-f76ac2a74d20.png' },
      { name: 'Excursão Europa', description: 'Tour completo pelo continente', value: 'R$ 12000', rarity: 'legendary', image: '/lovable-uploads/ced3cdc6-a614-4fa0-9afe-f0f73ff917b5.png' },
      { name: 'Vale Premium Global', description: 'Compras internacionais', value: 'R$ 5000', rarity: 'legendary', image: '/lovable-uploads/68d2bf66-08db-4fad-8f22-0bbfbbd2f16d.png' }
    ]
  }
};
