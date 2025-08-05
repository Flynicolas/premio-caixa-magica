-- Inserir configurações visuais com imagens existentes do projeto

-- Hero Slider com imagens existentes
INSERT INTO public.visual_configurations (section_type, section_name, config_data, is_active) VALUES
(
  'hero_slider', 
  'main_carousel',
  '{
    "autoPlay": true,
    "autoPlayInterval": 5000,
    "showNavigation": true,
    "showDots": true,
    "slides": [
      {
        "id": "slide1",
        "title": "Bem-vindo ao Casino",
        "subtitle": "Ganhe prêmios incríveis todos os dias",
        "image": "/lovable-uploads/853054fe-7848-4ab3-9499-041705d241d2.png",
        "order": 1
      },
      {
        "id": "slide2", 
        "title": "Baús Premium",
        "subtitle": "Abra baús e ganhe prêmios exclusivos",
        "image": "/lovable-uploads/89653d9d-fdca-406d-920f-7b77e7e0c37c.png",
        "order": 2
      },
      {
        "id": "slide3",
        "title": "Raspadinhas",
        "subtitle": "Raspe e descubra sua sorte",
        "image": "/lovable-uploads/9b899380-8ff3-426f-9b67-9557ab90bf86.png", 
        "order": 3
      }
    ]
  }'::jsonb,
  true
),

-- Banner principal da home
(
  'banner',
  'home_main', 
  '{
    "enabled": true,
    "imageUrlPC": "https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png",
    "imageUrlMobile": "https://jhbafgzfphiizpuoqksj.supabase.co/storage/v1/object/public/head-images//raspadinha-banner-rodape01.png",
    "altText": "Banner principal promocional",
    "position": "before_footer"
  }'::jsonb,
  true
),

-- Banner da página de prêmios
(
  'banner',
  'prizes_banner',
  '{
    "enabled": true, 
    "imageUrlPC": "/lovable-uploads/b32691e3-5eb0-4d76-85c1-f349a2615f80.png",
    "imageUrlMobile": "/lovable-uploads/b32691e3-5eb0-4d76-85c1-f349a2615f80.png",
    "altText": "Banner da página de prêmios",
    "position": "after_header"
  }'::jsonb,
  true
),

-- Banner de raspadinhas
(
  'banner',
  'scratch_banner',
  '{
    "enabled": true,
    "imageUrlPC": "/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png", 
    "imageUrlMobile": "/lovable-uploads/cf3aebd4-9d1a-4349-84b2-b94d234cfb1f.png",
    "altText": "Banner de raspadinhas",
    "position": "custom"
  }'::jsonb,
  true
),

-- Configuração das capas de raspadinhas
(
  'scratch_card',
  'covers',
  '{
    "enabled": true,
    "defaultCover": "/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png",
    "cards": {
      "premium": "/lovable-uploads/afe8c6a0-043b-45e3-a2d2-f0016ed54fac.png",
      "deluxe": "/lovable-uploads/ba84a4b9-15d4-4eea-afe4-518604f4b511.png",
      "standard": "/lovable-uploads/0220327d-3f58-4207-9a07-545072aad33d.png",
      "basic": "/lovable-uploads/262848fe-da75-4887-bb6d-b88247901100.png"
    }
  }'::jsonb,
  true
),

-- Configuração do catálogo premium
(
  'premium_catalog',
  'settings',
  '{
    "enabled": true,
    "cardsPerRow": 2,
    "showMobileOnly": true,
    "animationDuration": 300
  }'::jsonb,
  true
);