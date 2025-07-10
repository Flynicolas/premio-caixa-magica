import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RouletteControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const RouletteControls = ({ isMuted, onToggleMute }: RouletteControlsProps) => {
  return (
    <div className="absolute top-4 right-4 z-30">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleMute}
        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
    </div>
  );
};