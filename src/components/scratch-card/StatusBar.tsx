import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type StatusType = 'idle' | 'ready' | 'scratching' | 'fastReveal' | 'resolving' | 'success' | 'fail' | 'loading' | 'locked';

interface StatusBarProps {
  status: StatusType;
  message?: string;
  className?: string;
}

// Mensagens dinâmicas de loading
const loadingMessages = [
  "🎲 Embaralhando raspadinha...",
  "✨ Preparando sua sorte...",
  "🍀 Clique em 'Raspar' para começar...",
  "🎰 Carregando prêmios...",
  "🏆 Sua sorte está sendo preparada...",
  "🎯 Organizando símbolos...",
  "💎 Misturando premiações...",
  "🌟 Configurando jogo...",
  "🎪 Preparando diversão...",
  "⚡ Energia de sorte carregando...",
  "🎁 Envolvendo surpresas...",
  "🔥 Aquecendo a sorte..."
];

let messageIndex = 0;

const getRandomLoadingMessage = () => {
  const message = loadingMessages[messageIndex];
  messageIndex = (messageIndex + 1) % loadingMessages.length;
  return message;
};

const StatusBar = ({ status, message, className }: StatusBarProps) => {
  
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      idle: {
        message: "Pronto para começar",
        color: "text-foreground/70",
        bg: "backdrop-blur-sm bg-background/60 border-border/50",
        icon: ""
      },
      ready: {
        message: "Toque para iniciar",
        color: "text-foreground",
        bg: "backdrop-blur-sm bg-background/80 border-border",
        icon: "🎯"
      },
      scratching: {
        message: "Raspando… toque novamente para revelar",
        color: "text-foreground",
        bg: "backdrop-blur-sm bg-background/80 border-border",
        icon: ""
      },
      fastReveal: {
        message: "Revelando resultado",
        color: "text-foreground/80",
        bg: "backdrop-blur-sm bg-background/70 border-border/60",
        icon: ""
      },
      resolving: {
        message: "Processando",
        color: "text-foreground/80",
        bg: "backdrop-blur-sm bg-background/70 border-border/60",
        icon: ""
      },
      success: {
        message: "Parabéns! Você ganhou",
        color: "text-green-600 dark:text-green-400",
        bg: "backdrop-blur-sm bg-green-500/10 border-green-500/30",
        icon: "🎉"
      },
      fail: {
        message: "Tente novamente",
        color: "text-foreground/70",
        bg: "backdrop-blur-sm bg-background/60 border-border/50",
        icon: ""
      },
      loading: {
        message: getRandomLoadingMessage(),
        color: "text-foreground/70",
        bg: "backdrop-blur-sm bg-background/60 border-border/50",
        icon: ""
      },
      locked: {
        message: "Indisponível no momento",
        color: "text-muted-foreground",
        bg: "backdrop-blur-sm bg-muted/30 border-muted/50",
        icon: "🔒"
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
          "px-4 py-3 rounded-xl border",
          "max-w-full text-center",
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
          {(status === 'loading' || status === 'fastReveal' || status === 'resolving') && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBar;