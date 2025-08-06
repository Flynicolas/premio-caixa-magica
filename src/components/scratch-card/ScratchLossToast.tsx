
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";

interface ScratchLossToastProps {
  isVisible: boolean;
  message?: string;
  className?: string;
  onClose: () => void;
  onPlayAgain: () => Promise<void>;
}

const ScratchLossToast = ({ 
  isVisible, 
  message = "Não foi desta vez!", 
  className,
  onClose,
  onPlayAgain
}: ScratchLossToastProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30",
        "bg-muted/95 backdrop-blur-sm border rounded-lg p-4",
        "text-center shadow-lg max-w-sm mx-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-orange-500">⚠️</span>
          <span className="font-medium">{message}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onPlayAgain}
          size="sm"
          className="flex-1 h-8 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Tentar Novamente
        </Button>
      </div>
    </motion.div>
  );
};

export default ScratchLossToast;
