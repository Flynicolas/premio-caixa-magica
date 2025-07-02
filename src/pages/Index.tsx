
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import HeroSlider from '@/components/HeroSlider';
import ChestCard from '@/components/ChestCard';
import LiveWinsCarousel from '@/components/LiveWinsCarousel';
import AuthModal from '@/components/AuthModal';
import WalletPanel from '@/components/WalletPanel';
import { chestData, ChestType } from '@/data/chestData';

const Index = () => {
  const { user } = useAuth();
  const { walletData, addBalance } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);

  const handleOpenWallet = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowWalletPanel(true);
  };

  const handleChestOpen = (chestType: ChestType) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Handle chest purchase logic here
      console.log('Opening chest:', chestType);
    }
  };

  const handleChestViewItems = (chestType: ChestType) => {
    console.log('Viewing items for chest:', chestType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold mb-6 text-primary">
            🎁 Baú Premiado 🎁
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Abra baús e ganhe prêmios incríveis! De valores em dinheiro até produtos de alta tecnologia.
          </p>
        </motion.div>

        {/* Hero Slider */}
        <HeroSlider />

        {/* Live Wins */}
        <LiveWinsCarousel />

        {/* Featured Chests */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              🏆 Escolha Seu Baú 🏆
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cada baú tem diferentes chances de prêmios. Quanto maior o investimento, maiores as recompensas!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(chestData).map(([chestType, chest], index) => (
              <motion.div
                key={chestType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ChestCard
                  chest={chest}
                  chestType={chestType as ChestType}
                  onOpen={() => handleChestOpen(chestType as ChestType)}
                  onViewItems={() => handleChestViewItems(chestType as ChestType)}
                  balance={walletData?.balance || 0}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl border border-primary/20"
        >
          <h2 className="text-4xl font-bold mb-6 text-primary">
            Pronto para Ganhar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e receba R$ 50 de bônus para começar a jogar!
          </p>
          {!user && (
            <motion.button
              onClick={() => setShowAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="gold-gradient text-black text-xl font-bold py-4 px-12 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300"
            >
              Começar Agora - Ganhe R$ 50! 🎯
            </motion.button>
          )}
        </motion.section>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <WalletPanel
        isOpen={showWalletPanel}
        onClose={() => setShowWalletPanel(false)}
        balance={walletData?.balance || 0}
        prizes={[]}
        onAddBalance={addBalance}
      />
    </div>
  );
};

export default Index;
