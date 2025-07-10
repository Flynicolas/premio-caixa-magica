import { Sparkles } from 'lucide-react';

interface RouletteParticlesProps {
  show: boolean;
}

export const RouletteParticles = ({ show }: RouletteParticlesProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <Sparkles
          key={i}
          className="absolute animate-ping text-yellow-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`
          }}
          size={12 + Math.random() * 8}
        />
      ))}
    </div>
  );
};