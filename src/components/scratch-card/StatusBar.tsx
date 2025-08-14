import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type StatusType = 'idle' | 'ready' | 'scratching' | 'revealing' | 'success' | 'fail' | 'loading';

interface StatusBarProps {
  status: StatusType;
  message?: string;
  className?: string;
}

const StatusBar = ({ status, message, className }: StatusBarProps) => {
  
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      idle: {
        message: "Clique em 'Raspar' para começar",
        color: "text-muted-foreground",
        bg: "bg-muted/30",
        icon: "💰"
      },
      ready: {
        message: "Pronto para raspar! Clique no botão abaixo",
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: "🎯"
      },
      scratching: {
        message: "Raspe os quadrados para revelar os prêmios",
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-950/30",
        icon: "✨"
      },
      revealing: {
        message: "Revelando todos os prêmios...",
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950/30",
        icon: "🎲"
      },
      success: {
        message: "Parabéns! Você ganhou!",
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-950/30",
        icon: "🎉"
      },
      fail: {
        message: "Não foi desta vez, mas continue tentando!",
        color: "text-yellow-600",
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        icon: "😔"
      },
      loading: {
        message: "Carregando nova raspadinha...",
        color: "text-primary",
        bg: "bg-primary/10",
        icon: "⏳"
      }
    };
    
    return configs[status] || configs.idle;
  };

  const config = getStatusConfig(status);
  const displayMessage = message || config.message;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40",
          "px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border",
          "max-w-[90vw] text-center",
          config.bg,
          config.color,
          className
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">{config.icon}</span>
          <span className="text-xs sm:text-sm font-medium">
            {displayMessage}
          </span>
          {status === 'loading' && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBar;