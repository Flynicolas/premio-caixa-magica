import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Sobre from '@/pages/Sobre';
import Ranking from '@/pages/Ranking';
import Perfil from '@/pages/Perfil';
import AuthModal from '@/components/AuthModal';
import WalletPanel from '@/components/WalletPanel';
import { useWallet } from '@/hooks/useWallet';
import Baus from '@/pages/Baus';
import './App.css';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const { walletData, transactions, addBalance } = useWallet();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);

  useEffect(() => {
    // Auto-open auth modal for non-authenticated users
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  const handleOpenWallet = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowWalletPanel(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        <Header 
          balance={walletData?.balance || 0} 
          onAddBalance={handleOpenWallet}
          user={user}
          onShowAuth={() => setShowAuthModal(true)}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/baus" element={<Baus />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route 
              path="/perfil" 
              element={user ? <Perfil /> : <Navigate to="/" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
        
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
        
        <Toaster />
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
