
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Baus from "./pages/Baus";
import Sobre from "./pages/Sobre";
import Ranking from "./pages/Ranking";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import MinhasEntregas from "./pages/MinhasEntregas";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";
import WalletPanel from "./components/WalletPanel";

const queryClient = new QueryClient();

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPanel, setShowWalletPanel] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Header 
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenWallet={() => setShowWalletPanel(true)}
              />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/baus" element={<Baus />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/entregas" element={<MinhasEntregas />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            
            <AuthModal 
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />

            <WalletPanel
              isOpen={showWalletPanel}
              onClose={() => setShowWalletPanel(false)}
            />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
