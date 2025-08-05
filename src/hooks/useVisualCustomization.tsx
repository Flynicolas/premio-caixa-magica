import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VisualConfiguration } from '@/types/visualCustomization';

export const useVisualCustomization = () => {
  const [configurations, setConfigurations] = useState<VisualConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar todas as configurações
  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visual_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações visuais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar configuração específica
  const getConfiguration = (sectionType: string, sectionName: string) => {
    return configurations.find(
      config => config.section_type === sectionType && config.section_name === sectionName
    );
  };

  // Atualizar configuração
  const updateConfiguration = async (
    sectionType: string, 
    sectionName: string, 
    configData: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('visual_configurations')
        .upsert({
          section_type: sectionType,
          section_name: sectionName,
          config_data: configData,
          is_active: true
        }, {
          onConflict: 'section_type,section_name'
        })
        .select();

      if (error) throw error;

      // Atualizar estado local
      setConfigurations(prev => {
        const filtered = prev.filter(
          config => !(config.section_type === sectionType && config.section_name === sectionName)
        );
        return [...filtered, ...(data || [])];
      });

      toast({
        title: "Sucesso",
        description: "Configuração visual atualizada",
      });

      return data?.[0];
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configuração",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Upload de imagem para visual-assets
  const uploadVisualAsset = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('visual-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('visual-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Deletar asset visual
  const deleteVisualAsset = async (url: string): Promise<boolean> => {
    try {
      // Extrair o path do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts[urlParts.length - 2];
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from('visual-assets')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar asset:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    getConfiguration,
    updateConfiguration,
    uploadVisualAsset,
    deleteVisualAsset,
    refetch: fetchConfigurations
  };
};