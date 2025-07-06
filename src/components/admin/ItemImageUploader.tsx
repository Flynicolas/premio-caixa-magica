
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ItemImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => Promise<void>;
  itemId: string;
  itemName: string;
}

const ItemImageUploader: React.FC<ItemImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  itemId,
  itemName
}) => {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const imageUrl = await uploadImage(selectedFile, itemId);
      
      if (imageUrl) {
        console.log('Upload concluído, salvando no banco:', imageUrl);
        await onImageUploaded(imageUrl);
        
        toast({
          title: "Imagem atualizada!",
          description: `Imagem do item "${itemName}" foi atualizada com sucesso.`,
        });
        
        setOpen(false);
        setPreview(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar a imagem.",
        variant: "destructive"
      });
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          {currentImageUrl ? 'Alterar' : 'Upload'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Imagem - {itemName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Imagem atual */}
          {currentImageUrl && (
            <div>
              <label className="text-sm font-medium">Imagem Atual:</label>
              <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                <img 
                  src={currentImageUrl} 
                  alt="Atual" 
                  className="w-24 h-24 object-contain mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Área de upload */}
          <div>
            <label className="text-sm font-medium">Nova Imagem:</label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full max-h-32 mx-auto rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={clearPreview}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <p>Arraste uma imagem aqui ou</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      clique para selecionar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
              )}
            </div>
            
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Imagem
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemImageUploader;
