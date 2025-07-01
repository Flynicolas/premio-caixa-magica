
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Prêmios Incríveis te Esperam",
    subtitle: "Abra baús e ganhe desde iPhones até viagens para Dubai",
    image: "/lovable-uploads/6f83dc9e-58d4-427c-be2a-fb38b0ee66f3.png"
  },
  {
    id: 2,
    title: "Tesouros Extraordinários",
    subtitle: "Cada baú é uma nova oportunidade de realizar seus sonhos",
    image: "/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png"
  },
  {
    id: 3,
    title: "Sua Sorte te Aguarda",
    subtitle: "Milhares de prêmios já foram entregues aos nossos usuários",
    image: "/lovable-uploads/a9a1a1e2-6d02-4df8-a1f7-95f111b30ee1.png"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-96 overflow-hidden rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-2xl px-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">
                {slide.title}
              </h2>
              <p className="text-xl text-white/90">
                {slide.subtitle}
              </p>
            </div>
          </div>
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
