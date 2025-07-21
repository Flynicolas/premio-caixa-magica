
import { DatabaseItem } from '@/types/database';
import { Badge } from '@/components/ui/badge';

interface ItemCardProps {
  item: {
    name: string;
    image_url?: string | null;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'special';
    description?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  showRarity?: boolean;
  className?: string;
}

const ItemCard = ({ item, size = 'md', showRarity = true, className = '' }: ItemCardProps) => {
  const rarityConfig = {
    common: {
      borderColor: 'border-gray-400',
      bgColor: 'bg-gray-100/10',
      shadowColor: 'shadow-gray-400/20',
      glowColor: 'shadow-gray-400/30',
      gradientBg: '',
      label: 'Comum',
      textColor: 'text-gray-300'
    },
    rare: {
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-100/10',
      shadowColor: 'shadow-blue-400/20',
      glowColor: 'shadow-blue-400/40',
      gradientBg: '',
      label: 'Raro',
      textColor: 'text-blue-300'
    },
    epic: {
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-100/10',
      shadowColor: 'shadow-purple-400/20',
      glowColor: 'shadow-purple-400/40',
      gradientBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
      label: 'Épico',
      textColor: 'text-purple-300'
    },
    legendary: {
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-100/10',
      shadowColor: 'shadow-yellow-400/20',
      glowColor: 'shadow-yellow-400/50',
      gradientBg: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      label: 'Lendário',
      textColor: 'text-yellow-300'
    },
    special: {
      borderColor: 'border-pink-500',
      bgColor: 'bg-pink-100/10',
      shadowColor: 'shadow-pink-500/30',
      glowColor: 'shadow-pink-500/60',
      gradientBg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      label: 'Especial',
      textColor: 'text-pink-300'
    }
  };

  const sizeConfig = {
    sm: {
      container: 'w-20 h-24',
      image: 'w-12 h-12',
      text: 'text-xs',
      padding: 'p-2',
      dot: 'w-2 h-2'
    },
    md: {
      container: 'w-28 h-36',
      image: 'w-16 h-16',
      text: 'text-sm',
      padding: 'p-3',
      dot: 'w-3 h-3'
    },
    lg: {
      container: 'w-36 h-44',
      image: 'w-20 h-20',
      text: 'text-base',
      padding: 'p-4',
      dot: 'w-4 h-4'
    }
  };

  const rarity = rarityConfig[item.rarity];
  const sizing = sizeConfig[size];

  return (
    <div 
      className={`
        ${sizing.container} ${sizing.padding}
        flex flex-col items-center justify-center
        border-3 ${rarity.borderColor}
        ${rarity.bgColor}
        ${rarity.gradientBg}
        backdrop-blur-sm
        rounded-xl
        transition-all duration-200 ease-out
        hover:transform hover:-translate-y-1
        shadow-lg ${rarity.shadowColor}
        hover:${rarity.glowColor}
        hover:shadow-xl
        relative
        ${className}
      `}
      style={{
        background: rarity.gradientBg || `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
      }}
    >
      {/* Animated dot for epic, legendary and special items */}
      {(item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'special') && (
        <div className="absolute -top-1 -right-1">
          <div className={`${sizing.dot} ${rarity.textColor.replace('text-', 'bg-')} rounded-full animate-pulse`} />
        </div>
      )}

      {/* Imagem flutuante do item sem container */}
      <div className={`${sizing.image} rounded-lg overflow-hidden mb-2 flex items-center justify-center`}>
        <img 
          src={item.image_url || '/placeholder.svg'} 
          alt={item.name}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* Item Name */}
      <div className={`${sizing.text} font-semibold text-white text-center truncate w-full px-1 mb-1`}>
        {item.name}
      </div>

      {/* Rarity Badge */}
      {showRarity && (
        <Badge 
          className={`${rarity.bgColor} ${rarity.textColor} border-0 text-xs px-2 py-0`}
          style={{ fontSize: '10px' }}
        >
          {rarity.label}
        </Badge>
      )}
    </div>
  );
};

export default ItemCard;
