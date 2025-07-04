
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const resizeImageToSquare = (file: File, size: number = 400): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        
        // Preencher com fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Calcular dimensões para manter proporção sem cortar
        const scale = Math.min(size / img.width, size / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        
        // Centralizar a imagem
        const x = (size - newWidth) / 2;
        const y = (size - newHeight) / 2;
        
        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: 'image/png',
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, 'image/png', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File, itemId?: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro no upload",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return null;
      }
      
      // Redimensionar para quadrado
      const resizedFile = await resizeImageToSquare(file);
      
      // Gerar nome único para o arquivo
      const fileExt = 'png';
      const fileName = `${itemId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;
      
      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(filePath, resizedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);
      
      toast({
        title: "Upload realizado!",
        description: "Imagem foi redimensionada e carregada com sucesso.",
      });
      
      return urlData.publicUrl;
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
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

  return {
    uploadImage,
    uploading
  };
};
