
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorTrackingProvider } from "@/hooks/useErrorTracking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNavBar from "./components/BottomNavBar";
import { WalletMiniPanel } from "./components/WalletMiniPanel";
import Index from "./pages/Index";
import Premios from "./pages/Premios";
import MeusPremios from "./pages/MeusPremios";
import Sobre from "./pages/Sobre";
import Convidar from "./pages/Convidar";
import ConviteRedirect from "./pages/ConviteRedirect";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import MinhasEntregas from "./pages/MinhasEntregas";
import Configuracoes from "./pages/Configuracoes";
import Carteira from "./pages/Carteira";
import NotFound from "./pages/NotFound";
import CentralAjuda from "./pages/CentralAjuda";
import TermosUso from "./pages/TermosUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import FAQ from "./pages/FAQ";
import Raspadinha from "./pages/Raspadinha";
import TestePagamento from "./pages/TestePagamento";
import TesteSucesso from "./pages/TesteSucesso";
import TesteErro from "./pages/TesteErro";
import TesteDePagamento from "./pages/TesteDePagamento";
import Rascunho from "./pages/Rascunho";
import { WalletProvider } from "@/hooks/useWalletProvider";
import RaspadinhaPlay from "./pages/RaspadinhaPlay";
import Afiliados from "./pages/Afiliados";
import { ReferralTracker } from "./components/tracking/ReferralTracker";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showWalletPanel, setShowWalletPanel] = useState(false);

  const handleOpenWallet = () => {
    setShowWalletPanel(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/baus" element={<Premios />} />
          <Route path="/premios" element={<Premios />} />
          <Route path="/meus-premios" element={<MeusPremios />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/convidar" element={<Convidar />} />
          <Route path="/convite/:codigo" element={<ConviteRedirect />} />
          <Route path="/convite/:code" element={<Index />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/entregas" element={<MinhasEntregas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/raspadinha" element={<Raspadinha />} />
          <Route path="/raspadinhas/:tipo" element={<RaspadinhaPlay />} />
          <Route path="/central-ajuda" element={<CentralAjuda />} />
          <Route path="/termos-uso" element={<TermosUso />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testedepagamento" element={<TesteDePagamento />} />
          <Route path="/teste-pagamento" element={<TestePagamento />} />
          <Route path="/teste-sucesso" element={<TesteSucesso />} />
          <Route path="/teste-erro" element={<TesteErro />} />
          <Route path="/rascunho" element={<Rascunho />} />
          <Route path="/afiliados" element={<Afiliados />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomNavBar onAddBalance={handleOpenWallet} />
      <WalletMiniPanel 
        isOpen={showWalletPanel} 
        onClose={() => setShowWalletPanel(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorTrackingProvider>
          <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ReferralTracker />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
          </WalletProvider>
        </ErrorTrackingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
