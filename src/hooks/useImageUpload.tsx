
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, itemId?: string): Promise<string | null> => {
    try {
      setUploading(true);
      console.log('Iniciando upload de imagem:', file.name, 'para item:', itemId);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId || 'item'}_${Date.now()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      console.log('Upload path:', filePath);

      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      console.log('Upload concluído:', data);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', publicUrl);

      toast({
        title: "Upload concluído!",
        description: "Imagem enviada com sucesso.",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload de imagem:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      console.log('Deletando imagem:', imagePath);
      
      const { error } = await supabase.storage
        .from('item-images')
        .remove([imagePath]);

      if (error) throw error;

      console.log('Imagem deletada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "Erro ao deletar imagem",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading
  };
};
