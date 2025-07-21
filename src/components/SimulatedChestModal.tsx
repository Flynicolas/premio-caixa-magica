import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSimulatedRoulette } from "@/hooks/useSimulatedRoulette";
import RouletteDisplay from "@/components/roulette/RouletteDisplay";
import { DatabaseItem } from "@/types/database";
import { SpinItem } from "./roulette/types";
import "react-roulette-pro/dist/index.css";
import confetti from "canvas-confetti";

interface SimulatedChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: string;
  chestName: string;
  onPrizeWon: (prize: DatabaseItem) => void;
}

const SimulatedChestModal = ({
  isOpen,
  onClose,
  chestType,
  chestName,
  onPrizeWon,
}: SimulatedChestModalProps) => {
  const [phase, setPhase] = useState<"preview" | "spinning" | "result">("preview");
  const [wonItem, setWonItem] = useState<SpinItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const { toast } = useToast();
  const { generateSimulatedRoulette, rouletteData, isLoading } = useSimulatedRoulette();

  const configMap = {
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
  };

  const config = configMap[chestType] || configMap.diamond;

  useEffect(() => {
    if (isOpen) {
      setPhase("preview");
      setWonItem(null);
      setIsSpinning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase === "result") {
      // Áudio de vitória
      const winAudio = new Audio("/sounds/win.mp3");
      winAudio.volume = 0.6;
      winAudio.play().catch(() => {});

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
    console.log("[SIMULAÇÃO] Girar clicado");
    
    setPhase("spinning");
    const rouletteResult = await generateSimulatedRoulette(chestType, 25);
    if (!rouletteResult) {
      setPhase("preview");
      return;
    }
    setTimeout(() => setIsSpinning(true), 200);
  };

  const handleSpinComplete = async (item: SpinItem) => {
    setWonItem(item);
    setPhase("result");
    setIsSpinning(false);

    const databaseItem: DatabaseItem = {
      id: item.id,
      name: item.name,
      description: null,
      image_url: item.image_url,
      category: "product",
      rarity: item.rarity as any,
      base_value: 0,
      delivery_type: "digital",
      delivery_instructions: null,
      requires_address: false,
      requires_document: false,
      is_active: true,
      chest_types: null,
      probability_weight: null,
      import_source: null,
      tags: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onPrizeWon(databaseItem);
    toast({ 
      title: "🎉 Simulação Concluída!", 
      description: `Resultado: ${item.name} (Demonstração)`,
      duration: 5000,
    });
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
        
        {/* Badge de Simulação */}
        <div className="absolute top-4 right-4 z-20 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
          DEMONSTRAÇÃO
        </div>
        
        <DialogHeader className="relative z-10 p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle
              className={`text-2xl font-bold text-white drop-shadow-lg ${config.accent}`}
            >
              {phase === "preview" && (
                <>
                  <Sparkles className="inline w-6 h-6 mr-2 animate-pulse" />{" "}
                  Demonstrar {chestName}
                </>
              )}
              {phase === "spinning" && "🎰 Girando a Roleta (Demo)"}
              {phase === "result" && "🎉 Resultado da Demonstração"}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
            </DialogClose>
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
                  Demonstração Gratuita!
                </h3>

                <p className="text-white/90 text-lg text-center mb-6">
                  Tipo de baú:{" "}
                  <span className="font-bold text-white capitalize">
                    {chestName}
                  </span>
                </p>

                <p className="text-sm text-white/70 text-center max-w-md mx-auto">
                  Esta é uma demonstração do sistema de baús. 
                  Registre-se para ganhar prêmios reais!
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
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-black font-bold hover:brightness-110 border border-yellow-300 px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:scale-105 ${config.glow}`}
                >
                  {isLoading ? "Processando..." : "🎲 Demonstrar Roleta"}
                </Button>
              </div>
            </>
          )}

          {phase === "spinning" && rouletteData && (
            <RouletteDisplay
              prizes={rouletteData.prizes}
              prizeIndex={rouletteData.prizeIndex}
              start={isSpinning}
              onPrizeDefined={() => handleSpinComplete(rouletteData.winnerItem)}
            />
          )}

          {phase === "result" && wonItem && (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
              <div
                className={`bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl max-w-xl w-full ${config.glow}`}
              >
                <h2 className="text-5xl font-extrabold text-white text-center mb-2 animate-pulse">
                  🎉 Demonstração!
                </h2>
                <p className="text-lg text-white/80 text-center mb-6">
                  Resultado simulado - {wonItem.rarity?.toUpperCase()}:
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
                  
                  <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mt-2">
                    <p className="text-orange-200 text-sm">
                      💡 Esta é apenas uma demonstração. Registre-se para ganhar prêmios reais!
                    </p>
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-md hover:scale-105 transition-transform"
                  onClick={() => (window.location.href = "/auth")}
                >
                  Registrar-se Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimulatedChestModal;