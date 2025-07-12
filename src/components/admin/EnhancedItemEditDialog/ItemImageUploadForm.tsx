
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface ItemImageUploadFormProps {
  imageUrl: string;
  uploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ItemImageUploadForm: React.FC<ItemImageUploadFormProps> = ({
  imageUrl,
  uploading,
  onImageChange,
  fileInputRef
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="image">Imagem do Item</Label>
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Enviando...' : 'Upload Imagem'}
        </Button>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-16 h-16 object-cover rounded"
          />
        )}
      </div>
      <p className="text-xs text-gray-500">Imagem que será exibida no item</p>
    </div>
  );
};

export default ItemImageUploadForm;
