
-- Criar tabela para gestão de uploads de imagens
CREATE TABLE IF NOT EXISTS public.item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de mudanças nos itens
CREATE TABLE IF NOT EXISTS public.item_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  admin_user_id UUID,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'bulk_update'
  old_data JSONB,
  new_data JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para imports de Excel/CSV
CREATE TABLE IF NOT EXISTS public.data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID,
  import_type TEXT NOT NULL, -- 'excel', 'csv', 'manual'
  filename TEXT,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_log JSONB,
  preview_data JSONB,
  mapping_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Atualizar tabela items para suportar mais campos
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS chest_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS probability_weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para item_images
CREATE POLICY "Admins can manage item images" ON public.item_images
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Anyone can view item images" ON public.item_images
  FOR SELECT USING (true);

-- Políticas RLS para item_change_log
CREATE POLICY "Admins can view change logs" ON public.item_change_log
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

CREATE POLICY "Admins can create change logs" ON public.item_change_log
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

-- Políticas RLS para data_imports
CREATE POLICY "Admins can manage imports" ON public.data_imports
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users WHERE is_active = true));

-- Função para migrar dados do chestData.ts para o banco
CREATE OR REPLACE FUNCTION public.migrate_chest_data(items_data JSONB)
RETURNS TABLE(
  migrated_count INTEGER,
  updated_count INTEGER,
  error_count INTEGER,
  errors TEXT[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  item_record JSONB;
  item_id UUID;
  migrated INTEGER := 0;
  updated INTEGER := 0;
  errors INTEGER := 0;
  error_list TEXT[] := '{}';
BEGIN
  -- Processar cada item do JSON
  FOR item_record IN SELECT * FROM jsonb_array_elements(items_data)
  LOOP
    BEGIN
      -- Verificar se item já existe (por nome)
      SELECT id INTO item_id 
      FROM public.items 
      WHERE name = (item_record->>'name');
      
      IF item_id IS NULL THEN
        -- Inserir novo item
        INSERT INTO public.items (
          name, description, image_url, category, rarity, 
          base_value, delivery_type, requires_address, 
          requires_document, is_active, chest_types,
          import_source
        ) VALUES (
          item_record->>'name',
          item_record->>'description',
          item_record->>'image',
          COALESCE(item_record->>'category', 'product'),
          item_record->>'rarity',
          (item_record->>'value')::DECIMAL,
          COALESCE(item_record->>'delivery_type', 'digital'),
          COALESCE((item_record->>'requires_address')::BOOLEAN, false),
          COALESCE((item_record->>'requires_document')::BOOLEAN, false),
          true,
          ARRAY[item_record->>'chest_type'],
          'migration'
        );
        migrated := migrated + 1;
      ELSE
        -- Atualizar item existente
        UPDATE public.items SET
          description = COALESCE(item_record->>'description', description),
          image_url = COALESCE(item_record->>'image', image_url),
          category = COALESCE(item_record->>'category', category),
          rarity = COALESCE(item_record->>'rarity', rarity),
          base_value = COALESCE((item_record->>'value')::DECIMAL, base_value),
          chest_types = CASE 
            WHEN item_record->>'chest_type' = ANY(chest_types) THEN chest_types
            ELSE array_append(chest_types, item_record->>'chest_type')
          END,
          import_source = 'migration',
          updated_at = NOW()
        WHERE id = item_id;
        updated := updated + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      error_list := array_append(error_list, 
        'Item: ' || (item_record->>'name') || ' - Error: ' || SQLERRM);
    END;
  END LOOP;
  
  RETURN QUERY SELECT migrated, updated, errors, error_list;
END;
$$;

-- Função para processar uploads de Excel/CSV
CREATE OR REPLACE FUNCTION public.process_excel_import(
  import_id UUID,
  excel_data JSONB,
  column_mapping JSONB
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  row_data JSONB;
  processed INTEGER := 0;
  failed INTEGER := 0;
  error_messages JSONB := '[]'::JSONB;
BEGIN
  -- Atualizar status para processando
  UPDATE public.data_imports 
  SET status = 'processing', total_records = jsonb_array_length(excel_data)
  WHERE id = import_id;
  
  -- Processar cada linha do Excel
  FOR row_data IN SELECT * FROM jsonb_array_elements(excel_data)
  LOOP
    BEGIN
      INSERT INTO public.items (
        name, base_value, rarity, category, image_url,
        delivery_type, requires_address, import_source
      ) VALUES (
        row_data->>column_mapping->>'name',
        (row_data->>column_mapping->>'value')::DECIMAL,
        LOWER(row_data->>column_mapping->>'rarity'),
        COALESCE(row_data->>column_mapping->>'category', 'product'),
        row_data->>column_mapping->>'image_url',
        COALESCE(row_data->>column_mapping->>'delivery_type', 'digital'),
        COALESCE((row_data->>column_mapping->>'requires_address')::BOOLEAN, false),
        'excel_import'
      );
      processed := processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      failed := failed + 1;
      error_messages := error_messages || jsonb_build_object(
        'row', processed + failed,
        'error', SQLERRM,
        'data', row_data
      );
    END;
  END LOOP;
  
  -- Atualizar status final
  UPDATE public.data_imports SET
    status = CASE WHEN failed = 0 THEN 'completed' ELSE 'completed_with_errors' END,
    processed_records = processed,
    failed_records = failed,
    error_log = error_messages,
    completed_at = NOW()
  WHERE id = import_id;
  
  RETURN failed = 0;
END;
$$;
