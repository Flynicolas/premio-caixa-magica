
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "PIX na Conta",
    subtitle: "Ache 3 iguais e ganha na hora. Concorra até 10 mil em prêmios!",
    image: "/lovable-uploads/81f74e08-b67f-4422-9b2b-5df3a043726c.png"
  },
  {
    id: 2,
    title: "Novos Prêmios",
    subtitle: "Descubra as novas oportunidades de ganhar prêmios incríveis!",
    image: "/user-uploads/aace1fc2-962f-43a1-bcc6-fcb5c7213837.png"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-48 md:h-80 lg:h-96 overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0 opacity-100 scale-100' : 
            index < currentSlide ? '-translate-x-full opacity-0 scale-95' : 'translate-x-full opacity-0 scale-95'
          }`}
        >
          <img 
            src={slide.image} 
            alt={slide.title}
            className={`w-full h-full object-contain object-center transition-all duration-700 ${
              index === currentSlide ? 'animate-fade-in hover-scale' : ''
            }`}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
