import React from "react";
import RoulettePro from "react-roulette-pro";
import "react-roulette-pro/dist/index.css";

interface PrizeItem {
  id: string;
  image: string;
  text?: string;
}

interface RouletteDisplayProps {
  prizes: PrizeItem[];
  prizeIndex: number;
  start: boolean;
  onPrizeDefined: () => void;
}

const RouletteDisplay: React.FC<RouletteDisplayProps> = ({
  prizes,
  prizeIndex,
  start,
  onPrizeDefined,
}) => {
  return (
    <div className="roulette-frame-container relative mx-auto max-w-xs sm:max-w-5xl p-2 sm:p-6 overflow-hidden border-2 sm:border-4 rounded-xl sm:rounded-3xl">
      <div className="absolute z-50 top-[-10px] sm:top-[-14px] left-1/2 transform -translate-x-1/2">
        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rotate-45 shadow-lg border border-yellow-600" />
      </div>

      <RoulettePro
        key={`roulette-${prizeIndex}-${prizes.length}`}
        prizes={prizes}
        prizeIndex={prizeIndex}
        start={start}
        spinningTime={8}
        soundWhileSpinning="/sounds/roleta.mp3"
        onPrizeDefined={() => {
          setTimeout(() => {
            onPrizeDefined();
          }, 800);
        }}
        options={{ stopInCenter: true }}
      />
    </div>
  );
};

export default RouletteDisplay;
