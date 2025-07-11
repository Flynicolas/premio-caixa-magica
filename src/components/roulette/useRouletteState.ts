import { useState, useCallback } from 'react';

export type RouletteState = 'idle' | 'spinning' | 'stopping' | 'winner' | 'complete';

interface UseRouletteStateReturn {
  state: RouletteState;
  setState: (state: RouletteState) => void;
  isAnimating: boolean;
  canSpin: boolean;
  reset: () => void;
}

export const useRouletteState = (): UseRouletteStateReturn => {
  const [state, setState] = useState<RouletteState>('idle');

  const isAnimating = state === 'spinning' || state === 'stopping';
  const canSpin = state === 'idle';

  const reset = useCallback(() => {
    setState('idle');
  }, []);

  return {
    state,
    setState,
    isAnimating,
    canSpin,
    reset
  };
};