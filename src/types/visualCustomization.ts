export interface VisualConfiguration {
  id: string;
  section_type: string;
  section_name: string;
  config_data: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface HeroSliderConfig {
  autoPlay: boolean;
  autoPlayInterval: number;
  showNavigation: boolean;
  showDots: boolean;
  slides: HeroSlide[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  order: number;
}

export interface BannerConfig {
  enabled: boolean;
  imageUrlPC: string;
  imageUrlMobile: string;
  altText: string;
  position: 'before_footer' | 'after_header' | 'custom';
}

export interface ScratchCardConfig {
  enabled: boolean;
  defaultCover: string;
  cards: Record<string, string>; // card_type -> image_url
}

export interface PremiumCatalogConfig {
  enabled: boolean;
  cardsPerRow: number;
  showMobileOnly: boolean;
  animationDuration: number;
}

export interface ImageUploadInfo {
  section: string;
  field: string;
  dimensions: {
    recommended: string;
    ratio: string;
    maxSize: string;
  };
  description: string;
}

export const IMAGE_SPECS: Record<string, ImageUploadInfo> = {
  'hero_slide': {
    section: 'Hero Slider',
    field: 'Slide Image',
    dimensions: {
      recommended: '1200x400px',
      ratio: '3:1',
      maxSize: '2MB'
    },
    description: 'Imagem principal para slides do carrossel hero. Otimizada para desktop e mobile.'
  },
  'banner_pc': {
    section: 'Banner Responsivo',
    field: 'Imagem Desktop',
    dimensions: {
      recommended: '1000x300px',
      ratio: '10:3',
      maxSize: '2MB'
    },
    description: 'Imagem para visualização em desktop e tablets.'
  },
  'banner_mobile': {
    section: 'Banner Responsivo', 
    field: 'Imagem Mobile',
    dimensions: {
      recommended: '600x200px',
      ratio: '3:1',
      maxSize: '1MB'
    },
    description: 'Imagem otimizada para dispositivos móveis.'
  },
  'scratch_cover': {
    section: 'Raspadinha',
    field: 'Capa do Card',
    dimensions: {
      recommended: '400x600px',
      ratio: '2:3',
      maxSize: '1MB'
    },
    description: 'Imagem de fundo para cards de raspadinha.'
  },
  'premium_catalog': {
    section: 'Catálogo Premium',
    field: 'Background Card',
    dimensions: {
      recommended: '400x600px',
      ratio: '2:3',
      maxSize: '1MB'
    },
    description: 'Imagem de fundo para cards do catálogo premium.'
  }
};