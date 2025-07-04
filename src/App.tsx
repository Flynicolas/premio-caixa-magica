
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Baus from "./pages/Baus";
import Sobre from "./pages/Sobre";
import Ranking from "./pages/Ranking";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import ItemManagement from "./pages/ItemManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
                <Route path="/admin" element={<Admin />} />
                <Route path="/gestao-itens" element={<ItemManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
