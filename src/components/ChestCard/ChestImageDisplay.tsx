
import { Eye } from 'lucide-react';
import { ChestType } from '@/data/chestData';

interface ChestImageDisplayProps {
  chestType: ChestType;
  chestName: string;
  onViewItems: () => void;
}

const chestImages = {
  silver: '/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png',
  gold: '/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png',
  delas: '/lovable-uploads/85b1ecea-b443-4391-9986-fb77979cf6ea.png',
  diamond: '/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png',
  ruby: '/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png',
  premium: '/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png'
};

const chestColors = {
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  delas: 'from-pink-400 to-rose-500',
  diamond: 'from-blue-400 to-cyan-400',
  ruby: 'from-red-400 to-pink-500',
  premium: 'from-purple-500 to-pink-600'
};

const ChestImageDisplay = ({ chestType, chestName, onViewItems }: ChestImageDisplayProps) => {
  const chestImage = chestImages[chestType] || chestImages.silver;
  const chestColor = chestColors[chestType] || chestColors.silver;

  return (
    <div className="relative mb-8 flex justify-center">
      {/* Imagem flutuante do baú sem container */}
      <img 
        src={chestImage} 
        alt={chestName}
        className="w-40 h-40 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
      />
      
      <button
        onClick={onViewItems}
        className={`absolute top-2 right-2 bg-gradient-to-r ${chestColor} text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 hover:rotate-12 shadow-xl backdrop-blur-sm border border-white/20 group/btn`}
      >
        <Eye className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" />
      </button>
    </div>
  );
};

export default ChestImageDisplay;
