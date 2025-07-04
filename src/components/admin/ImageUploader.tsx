
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  itemId?: string;
  itemName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  itemId,
  itemName
}) => {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    const file = fileInputRef.current.files[0];
    const imageUrl = await uploadImage(file, itemId);
    
    if (imageUrl) {
      onImageUploaded(imageUrl);
      setOpen(false);
      setPreview(null);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Imagem{itemName && ` - ${itemName}`}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Imagem atual */}
          {currentImageUrl && (
            <div>
              <Label className="text-sm font-medium">Imagem Atual:</Label>
              <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                <img 
                  src={currentImageUrl} 
                  alt="Atual" 
                  className="w-20 h-20 object-contain mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Área de upload */}
          <div>
            <Label className="text-sm font-medium">Nova Imagem:</Label>
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
                      onClick={() => fileInputRef.current?.click()}
                    >
                      clique para selecionar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    A imagem será redimensionada automaticamente<br />
                    para formato quadrado sem cortar
                  </p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
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
              disabled={!preview || uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Imagem'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploader;
