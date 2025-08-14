import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Zap, 
  Loader2, 
  RotateCcw, 
  Lock,
  Wallet,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

// FSM States
export type ScratchGameState = 
  | 'idle' 
  | 'ready' 
  | 'scratching' 
  | 'fastReveal' 
  | 'resolving' 
  | 'success' 
  | 'fail' 
  | 'locked';

interface ScratchActionButtonProps {
  state: ScratchGameState;
  onAction: () => void;
  onAddBalance?: () => void;
  price: number;
  balance?: number;
  disabled?: boolean;
  className?: string;
}

const ScratchActionButton = ({
  state,
  onAction,
  onAddBalance,
  price,
  balance = 0,
  disabled = false,
  className
}: ScratchActionButtonProps) => {

  const getButtonConfig = useCallback(() => {
    const configs = {
      idle: {
        label: `Raspar • R$ ${price.toFixed(2)}`,
        icon: Play,
        variant: 'default' as const,
        disabled: false,
        showSpinner: false
      },
      ready: {
        label: `Raspar • R$ ${price.toFixed(2)}`,
        icon: Play,
        variant: 'default' as const,
        disabled: false,
        showSpinner: false
      },
      scratching: {
        label: 'Revelar tudo',
        icon: Zap,
        variant: 'secondary' as const,
        disabled: false,
        showSpinner: false
      },
      fastReveal: {
        label: 'Revelando…',
        icon: Sparkles,
        variant: 'secondary' as const,
        disabled: true,
        showSpinner: true
      },
      resolving: {
        label: 'Verificando…',
        icon: Loader2,
        variant: 'secondary' as const,
        disabled: true,
        showSpinner: true
      },
      success: {
        label: 'Jogar de novo',
        icon: Sparkles,
        variant: 'default' as const,
        disabled: false,
        showSpinner: false
      },
      fail: {
        label: 'Jogar de novo',
        icon: RotateCcw,
        variant: 'default' as const,
        disabled: false,
        showSpinner: false
      },
      locked: {
        label: balance < price ? 'Adicionar saldo' : 'Indisponível',
        icon: balance < price ? Wallet : Lock,
        variant: 'outline' as const,
        disabled: balance >= price, // Se saldo ok, mas locked por outro motivo, desabilita
        showSpinner: false
      }
    };

    return configs[state];
  }, [state, price, balance]);

  const config = getButtonConfig();
  const IconComponent = config.icon;

  const handleClick = useCallback(() => {
    // Anti-duplo clique em estados críticos
    if (config.disabled || disabled) return;

    // Tratar caso especial de saldo insuficiente
    if (state === 'locked' && balance < price && onAddBalance) {
      onAddBalance();
      return;
    }

    onAction();
  }, [config.disabled, disabled, state, balance, price, onAddBalance, onAction]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileTap={{ scale: config.disabled ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={config.disabled || disabled}
        variant={config.variant}
        size="lg"
        className={cn(
          'w-full min-h-[48px] relative overflow-hidden',
          'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'transition-all duration-300',
          {
            // Estado de sucesso com confete
            'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white': 
              state === 'success',
            // Estado de falha com destaque sutil
            'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white': 
              state === 'fail',
            // Estado principal (ready/idle)
            'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground': 
              state === 'ready' || state === 'idle',
            // Estado de raspagem ativa
            'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white': 
              state === 'scratching',
            // Estados de loading
            'opacity-75 cursor-not-allowed': 
              state === 'fastReveal' || state === 'resolving',
            // Estado locked
            'opacity-60': state === 'locked'
          }
        )}
        aria-live="polite"
        aria-label={config.label}
      >
        <div className="flex items-center justify-center gap-2">
          {config.showSpinner ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <IconComponent className="w-4 h-4" />
          )}
          <span className="font-medium">{config.label}</span>
        </div>

        {/* Efeito de brilho para estados especiais */}
        {(state === 'success' || state === 'fail') && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </Button>

      {/* Feedback de saldo insuficiente */}
      {state === 'locked' && balance < price && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground mt-2 text-center"
        >
          Saldo: R$ {balance.toFixed(2)} | Necessário: R$ {price.toFixed(2)}
        </motion.p>
      )}
    </motion.div>
  );
};

export default ScratchActionButton;