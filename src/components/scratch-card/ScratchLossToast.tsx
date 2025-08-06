
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScratchLossToastProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

const ScratchLossToast = ({ 
  isVisible, 
  message = "Não foi desta vez! Tente novamente.", 
  className 
}: ScratchLossToastProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "absolute top-4 left-1/2 transform -translate-x-1/2 z-30",
        "bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg",
        "text-sm font-medium border border-gray-600 shadow-lg",
        "max-w-xs text-center",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-orange-400">⚠️</span>
        {message}
      </div>
    </motion.div>
  );
};

export default ScratchLossToast;
