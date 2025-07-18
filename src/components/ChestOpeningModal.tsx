import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useInventory } from "@/hooks/useInventory";
import { useWallet } from "@/hooks/useWalletProvider";
import { useRouletteLogic } from "@/hooks/useRouletteLogic";
import ItemCard from "./ItemCard";
import SpinRouletteWheel from "@/components/roulette/SpinRouletteWheel";
import { DatabaseItem } from "@/types/database";
import { SpinItem } from "./roulette/types";
import "react-roulette-pro/dist/index.css";
import confetti from "canvas-confetti";
import { useGamification } from "@/hooks/useGamification";

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  chestName: string;
  chestPrice: number;
  onPrizeWon: (prize: DatabaseItem) => void;
}

const ChestOpeningModal = ({
  isOpen,
  onClose,
  chestType,
  chestName,
  chestPrice,
  onPrizeWon,
}: ChestOpeningModalProps) => {
  const [phase, setPhase] = useState<"preview" | "spinning" | "result">(
    "preview",
  );
  const [wonItem, setWonItem] = useState<SpinItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshData } = useWallet();
  const { simulateRoulette, drawRealItem, rouletteData, isLoading } = useRouletteLogic();
  const { processGamification } = useGamification();

  const configMap = {
    silver: {
      gradient: "from-gray-400 to-gray-600",
      glow: "shadow-gray-400/30",
      accent: "text-gray-300",
    },
    gold: {
      gradient: "from-yellow-400 to-yellow-600",
      glow: "shadow-yellow-400/30",
      accent: "text-yellow-300",
    },
    delas: {
      gradient: "from-[#f72585] via-[#b5179e] to-[#7209b7]",
      glow: "shadow-pink-500/30",
      accent: "text-pink-100",
    },
    diamond: {
      gradient: "from-blue-400 to-cyan-400",
      glow: "shadow-blue-400/30",
      accent: "text-blue-300",
    },
    ruby: {
      gradient: "from-red-400 to-pink-500",
      glow: "shadow-red-400/30",
      accent: "text-red-300",
    },
    premium: {
      gradient: "from-purple-500 to-pink-600",
      glow: "shadow-purple-500/30",
      accent: "text-purple-300",
    },
  };

  const config = configMap[chestType] || configMap.silver;

  useEffect(() => {
    if (isOpen) {
      setPhase("preview");
      setWonItem(null);
      setIsSpinning(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase === "result") {
      // Áudio de vitória
      const winAudio = new Audio("/sounds/win.mp3");
      winAudio.volume = 0.6;
      winAudio.play();

      // Confetes animados
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.2,
        zIndex: 9999,
        colors: ["#FFD700", "#FF69B4", "#8A2BE2"],
      });
    }
  }, [phase]);

  const handleOpenChest = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para abrir baús.",
        variant: "destructive",
      });
      return;
    }
    console.log("[NOVO FLUXO] Iniciando simulação da roleta");

    setIsProcessing(true);
    try {
      // NOVA ETAPA 1: Simular roleta visual apenas
      const simulationResult = await simulateRoulette(chestType, 25);
      if (!simulationResult) throw new Error("Erro ao simular roleta");
      
      // NOVA ETAPA 2: Iniciar animação
      setPhase("spinning");
      setTimeout(() => setIsSpinning(true), 200);
    } catch (err: any) {
      console.error("Erro ao simular roleta:", err);
      toast({
        title: "Erro",
        description: err.message || "Falha ao simular a roleta.",
        variant: "destructive",
      });
      setPhase("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  // NOVA FUNÇÃO: Chamada após a animação terminar para sortear item real
  const handleSpinComplete = async () => {
    if (!user) return;
    
    console.log("[NOVO FLUXO] Animação terminou, sorteando item real...");
    setIsSpinning(false);
    
    try {
      // NOVA ETAPA 3: Sortear item REAL após animação
      const realItem = await drawRealItem(chestType, chestPrice, user.id);
      
      // Converter para formato SpinItem
      const wonSpinItem: SpinItem = {
        id: realItem.id,
        name: realItem.name,
        image_url: realItem.image_url,
        rarity: realItem.rarity,
      };

      setWonItem(wonSpinItem);
      setPhase("result");

      // Converter para DatabaseItem para compatibilidade
      const databaseItem: DatabaseItem = {
        id: realItem.id,
        name: realItem.name,
        description: realItem.description,
        image_url: realItem.image_url,
        category: realItem.category,
        rarity: realItem.rarity as any,
        base_value: realItem.base_value,
        delivery_type: realItem.delivery_type,
        delivery_instructions: realItem.delivery_instructions,
        requires_address: realItem.requires_address,
        requires_document: realItem.requires_document,
        is_active: realItem.is_active,
        chest_types: realItem.chest_types,
        probability_weight: null,
        import_source: realItem.import_source,
        tags: realItem.tags,
        notes: realItem.notes,
        created_at: realItem.created_at,
        updated_at: realItem.updated_at,
      };

      onPrizeWon(databaseItem);
      await refreshData();
      toast({ title: "🎉 Parabéns!", description: `Você ganhou: ${realItem.name}` });

      if (user) {
        try {
          await processGamification(user.id, wonSpinItem, chestPrice);
        } catch (err) {
          console.error("Erro ao processar gamificação:", err);
        }
      }
    } catch (err: any) {
      console.error("Erro ao sortear item real:", err);
      toast({
        title: "Erro",
        description: err.message || "Falha ao sortear o item.",
        variant: "destructive",
      });
      setPhase("preview");
    }
  };

  const handleClose = () => {
    setPhase("preview");
    setWonItem(null);
    setIsSpinning(false);
    onClose();
  };

  const getRarityClass = (rarity: string | null | undefined) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-600";
      case "epic":
        return "bg-purple-600";
      case "legendary":
        return "bg-yellow-500 text-black";
      case "special":
        return "bg-pink-600";
      default:
        return "bg-white/20";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-6xl max-h-[90vh] p-0 bg-gradient-to-br ${config.gradient} border-0 shadow-2xl shadow-black/40`}
      >
        <div className="absolute inset-0 bg-black/20 rounded-lg" />
        <DialogHeader className="relative z-10 p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle
              className={`text-2xl font-bold text-white drop-shadow-lg ${config.accent}`}
            >
              {phase === "preview" && (
                <>
                  <Sparkles className="inline w-6 h-6 mr-2 animate-pulse" />{" "}
                  Abrir {chestName}
                </>
              )}
              {phase === "spinning" && "🎰 Girando a Roleta"}
              {phase === "result" && "🎉 Resultado do Sorteio"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative z-10 p-6 pb-10 text-center">
          {phase === "preview" && (
            <>
              <div className="relative inline-block px-8 py-10 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2">
                  <Sparkles className="w-12 h-12 text-yellow-300 animate-ping-slow drop-shadow-xl" />
                </div>
                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 mb-4 drop-shadow-lg text-center">
                  Prepare-se para o sorteio!
                </h3>

                <p className="text-white/90 text-lg text-center mb-6">
                  Custo do baú:{" "}
                  <span className="font-bold text-white">
                    R$ {chestPrice.toFixed(2)}
                  </span>
                </p>

                <p className="text-sm text-white/70 text-center max-w-md mx-auto">
                  A roleta mágica está pronta para girar e revelar o seu prêmio.
                  Você está com sorte hoje?
                </p>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleOpenChest}
                  disabled={isLoading || isProcessing}
                  className={`bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-black font-bold hover:brightness-110 border border-yellow-300 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:scale-105 ${config.glow}`}
                >
                  {isLoading || isProcessing
                    ? "Processando..."
                    : "🎲 Girar Roleta"}
                </Button>
              </div>
            </>
          )}

          {phase === "spinning" && rouletteData && (
            <SpinRouletteWheel
              rouletteData={rouletteData}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              chestType={chestType}
            />
          )}

          {phase === "result" && wonItem && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
              <div
                className={`bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl max-w-xl w-full ${config.glow}`}
              >
                <h2 className="text-5xl font-extrabold text-white text-center mb-2 animate-pulse">
                  🎉 Parabéns!
                </h2>
                <p className="text-lg text-white/80 text-center mb-6">
                  Você ganhou um item {wonItem.rarity?.toUpperCase()}:
                </p>

                <div className="flex flex-col items-center gap-4">
                  <img
                    src={wonItem.image_url}
                    alt={wonItem.name}
                    className="w-40 h-40 object-contain rounded-xl shadow-lg border-4 border-white/10"
                  />

                  <h3 className="text-2xl font-bold text-white text-center">
                    {wonItem.name}
                  </h3>

                  <div
                    className={`px-4 py-1 rounded-full text-sm font-medium text-white ${getRarityClass(wonItem.rarity)}`}
                  >
                    {wonItem.rarity?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Fechar
                </Button>
                <Button
                  className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold border border-white/30 ${config.glow}`}
                  onClick={() => (window.location.href = "/baus")}
                >
                  Ver Inventário
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-400 to-pink-400 text-white font-bold shadow-md hover:scale-105 transition-transform"
                  onClick={() => {
                    setPhase("preview");
                    setWonItem(null);
                  }}
                >
                  Abrir Outro Baú
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChestOpeningModal;
