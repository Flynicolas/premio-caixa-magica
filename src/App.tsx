
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Baus from "./pages/Baus";
import Sobre from "./pages/Sobre";
import Ranking from "./pages/Ranking";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import MinhasEntregas from "./pages/MinhasEntregas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import { WalletProvider } from "@/hooks/useWalletProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
       <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/baus" element={<Baus />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/entregas" element={<MinhasEntregas />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
      </WalletProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
