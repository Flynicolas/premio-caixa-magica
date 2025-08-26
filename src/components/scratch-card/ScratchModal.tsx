import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScratchCardType } from '@/types/scratchCard';
import ScratchGameCanvas from './ScratchGameCanvas';
import ScratchActionButton, { ScratchGameState } from './ScratchActionButton';
import SimpleScratchWinModal from './SimpleScratchWinModal';
import ScratchLossToast from './ScratchLossToast';
import StatusBar from './StatusBar';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWalletProvider';
import { useScratchCard } from '@/hooks/useScratchCard';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ScratchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scratchType: ScratchCardType;
  price: number;
}

const ScratchModal = ({ isOpen, onClose, scratchType, price }: ScratchModalProps) => {
  const { user } = useAuth();
  const { walletData } = useWallet();
  const {
    scratchCard,
    gameState,
    setGameState,
    gameComplete,
    isLoading,
    startGame,
    triggerFastReveal,
    processGameResult,
    checkWinningCombination,
    resetGame
  } = useScratchCard();

  const [winModal, setWinModal] = useState<{ open: boolean; type: "item" | "money"; data: any }>({ 
    open: false, type: "item", data: null 
  });
  const [showLossToast, setShowLossToast] = useState(false);
  const canvasRef = useRef<{ revealAll: () => void }>(null);

  // Balance check
  const hasBalance = !!walletData && walletData.balance >= price;
  const isAuthenticated = !!user;

  // Determine button state based on authentication, balance, and game state
  const getButtonState = useCallback((): ScratchGameState => {
    console.log(`🎯 [SCRATCH] Button state check:`, {
      isAuthenticated,
      hasBalance,
      balance: walletData?.balance,
      price,
      isLoading,
      gameState
    });
    
    if (!isAuthenticated) {
      console.log(`🔒 [SCRATCH] Usuário não autenticado`);
      return 'locked';
    }
    
    if (isLoading) {
      console.log(`⏳ [SCRATCH] Carregando...`);
      return 'locked';
    }
    
    if (!hasBalance) {
      console.log(`💰 [SCRATCH] Saldo insuficiente: ${walletData?.balance} < ${price}`);
      return 'locked';
    }

    console.log(`✅ [SCRATCH] Estado do botão: ${gameState}`);
    return gameState;
  }, [isAuthenticated, hasBalance, isLoading, gameState, walletData?.balance, price]);

  const buttonState = getButtonState();

  // Handle main button action based on current state
  const handleButtonAction = useCallback(async () => {
    console.log(`🎯 [SCRATCH] Ação do botão - Estado: ${buttonState}`);
    
    // Verificação adicional de saldo antes de qualquer ação
    if ((buttonState === 'idle' || buttonState === 'ready') && !hasBalance) {
      console.warn(`💰 [SCRATCH] Bloqueado: saldo insuficiente`);
      return;
    }
    
    switch (buttonState) {
      case 'idle':
      case 'ready':
        console.log(`🎯 [SCRATCH] Iniciando jogo...`);
        await startGame(scratchType);
        break;
      
      case 'scratching':
        console.log(`⚡ [SCRATCH] Revelação rápida ativada`);
        triggerFastReveal();
        if (canvasRef.current) {
          canvasRef.current.revealAll();
        }
        break;
      
      case 'success':
      case 'fail':
        console.log(`🔄 [SCRATCH] Jogando novamente...`);
        resetGame();
        setGameState('ready');
        setTimeout(() => startGame(scratchType), 150);
        break;
      
      default:
        console.log(`🔒 [SCRATCH] Ação bloqueada para estado: ${buttonState}`);
        break;
    }
  }, [buttonState, scratchType, startGame, triggerFastReveal, resetGame, setGameState, hasBalance]);

  // Handle game completion
  useEffect(() => {
    if (!gameComplete || !scratchType) return;
    
    const combo = checkWinningCombination();
    const hasWin = !!combo;
    
    // Process game result
    processGameResult(scratchType, hasWin, combo?.winningSymbol);
    
    if (hasWin && combo?.winningSymbol) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Determine if it's money or item win
      const sym: any = combo.winningSymbol;
      const isMoney = (sym.category === 'dinheiro') || /dinheiro|real/i.test(sym.name || '');
      
      // Show win modal after 2.5s (after golden highlight)
      setTimeout(() => {
        setWinModal({ 
          open: true, 
          type: isMoney ? 'money' : 'item', 
          data: isMoney ? { amount: sym.base_value } : sym 
        });
      }, 2500);
    } else {
      // Show loss toast
      setShowLossToast(true);
      setTimeout(() => setShowLossToast(false), 3500);
    }
  }, [gameComplete, checkWinningCombination, processGameResult, scratchType]);

  // Initialize game state when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && hasBalance) {
      setGameState('ready');
    } else if (isOpen) {
      setGameState('locked');
    }
  }, [isOpen, isAuthenticated, hasBalance, setGameState]);

  // Reset game when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetGame();
      setWinModal({ open: false, type: "item", data: null });
      setShowLossToast(false);
    }
  }, [isOpen, resetGame]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg w-[95vw] p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Raspadinha {scratchType.toUpperCase()}</h2>
            <p className="text-sm text-muted-foreground">
              Encontre 3 símbolos iguais para ganhar!
            </p>
          </div>

          {/* Game Canvas */}
          <AnimatePresence mode="wait">
            {scratchCard?.symbols && gameState === 'scratching' ? (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[400px] mx-auto"
              >
                <ScratchGameCanvas
                  ref={canvasRef}
                  symbols={scratchCard.symbols}
                  onWin={() => {}}
                  onComplete={() => {}}
                  gameStarted={gameState === 'scratching'}
                  scratchType={scratchType}
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-[400px] mx-auto h-[400px] bg-muted rounded-lg flex items-center justify-center"
              >
                <p className="text-muted-foreground">
                  {gameState === 'locked' ? 'Clique em "Raspar" para começar' : 'Preparando jogo...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <ScratchActionButton
            state={buttonState}
            onAction={handleButtonAction}
            price={price}
            balance={walletData?.balance || 0}
          />

          {/* Status messages integrated below button */}
          <StatusBar 
            status={buttonState as any}
            className="static"
          />
        </DialogContent>
      </Dialog>

      {/* Win Modal */}
      <SimpleScratchWinModal
        isOpen={winModal.open}
        onClose={() => setWinModal(prev => ({ ...prev, open: false }))}
        winType={winModal.type}
        winData={winModal.data}
      />

      {/* Loss Toast */}
      <ScratchLossToast
        isVisible={showLossToast}
        onClose={() => setShowLossToast(false)}
        onPlayAgain={() => {
          setShowLossToast(false);
          handleButtonAction();
        }}
      />
    </>
  );
};

export default ScratchModal;