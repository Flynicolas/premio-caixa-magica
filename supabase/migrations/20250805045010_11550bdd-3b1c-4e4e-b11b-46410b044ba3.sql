-- Criar tabela para configurações visuais
CREATE TABLE public.visual_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL, -- 'hero', 'banner', 'scratch_card', 'premium_catalog'
  section_name TEXT NOT NULL, -- nome específico da seção
  config_data JSONB NOT NULL DEFAULT '{}', -- dados de configuração
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(section_type, section_name)
);

-- Criar bucket para assets visuais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visual-assets', 
  'visual-assets', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Políticas RLS para visual_configurations
ALTER TABLE public.visual_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage visual configurations" 
ON public.visual_configurations 
FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

CREATE POLICY "Anyone can view active visual configurations" 
ON public.visual_configurations 
FOR SELECT 
USING (is_active = true);

-- Políticas para storage visual-assets
CREATE POLICY "Admins can upload visual assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'visual-assets' AND is_admin_user());

CREATE POLICY "Admins can update visual assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'visual-assets' AND is_admin_user());

CREATE POLICY "Admins can delete visual assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'visual-assets' AND is_admin_user());

CREATE POLICY "Visual assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'visual-assets');

-- Trigger para updated_at
CREATE TRIGGER update_visual_configurations_updated_at
BEFORE UPDATE ON public.visual_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.visual_configurations (section_type, section_name, config_data) VALUES
('hero', 'main_slider', '{
  "autoPlay": true,
  "autoPlayInterval": 4000,
  "showNavigation": true,
  "showDots": true,
  "slides": []
}'),
('banner', 'home_main', '{
  "enabled": true,
  "imageUrlPC": "",
  "imageUrlMobile": "",
  "altText": "Banner principal da página inicial",
  "position": "before_footer"
}'),
('scratch_card', 'covers', '{
  "enabled": true,
  "defaultCover": "",
  "cards": {}
}'),
('premium_catalog', 'settings', '{
  "enabled": true,
  "cardsPerRow": 2,
  "showMobileOnly": true,
  "animationDuration": 300
}');