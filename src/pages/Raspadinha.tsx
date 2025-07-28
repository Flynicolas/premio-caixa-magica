import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ScratchCardSection from '@/components/ScratchCardSection';
import AuthModal from '@/components/AuthModal';
import ResponsiveBanner from '@/components/ResponsiveBanner';

const Raspadinha = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Banner Principal */}
      <ResponsiveBanner 
        imageUrlPC="/banners/raspadinha-banner-pc.jpg"
        imageUrlMobile="/banners/raspadinha-banner-mobile.jpg"
        altText="Banner principal da página de raspadinha"
      />
      
      <div className="container mx-auto px-4 py-8">
        <ScratchCardSection onAuthRequired={() => setShowAuthModal(true)} />
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </div>
  );
};

export default Raspadinha;