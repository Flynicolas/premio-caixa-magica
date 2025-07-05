
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import { useImageUpload } from '@/hooks/useImageUpload';
import EditableItemField from './EditableItemField';
import { DatabaseItem } from '@/types/database';
import { Trash2, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImprovedItemsTable = () => {
  const { items, loading, updateItemRealtime } = useRealtimeItems();
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  const rarityOptions = [
    { value: 'common', label: 'Comum' },
    { value: 'rare', label: 'Raro' },
    { value: 'epic', label: 'Épico' },
    { value: 'legendary', label: 'Lendário' }
  ];

  const categoryOptions = [
    { value: 'product', label: 'Produto' },
    { value: 'service', label: 'Serviço' },
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Físico' }
  ];

  const deliveryTypeOptions = [
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Físico' }
  ];

  const handleFieldUpdate = async (itemId: string, field: keyof DatabaseItem, value: any) => {
    const result = await updateItemRealtime(itemId, { [field]: value });
    if (!result.success) {
      throw new Error(result.error || 'Erro ao atualizar item');
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      const imageUrl = await uploadImage(file, itemId);
      if (imageUrl) {
        await handleFieldUpdate(itemId, 'image_url', imageUrl);
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive"
      });
    }
  };

  const toggleEditMode = (itemId: string) => {
    setEditMode(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando itens...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gerenciamento de Itens ({items.length})</span>
          <div className="text-sm text-muted-foreground">
            Clique no ícone de edição para modificar campos
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-primary/80">
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(item.id, file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome:</label>
                      <EditableItemField
                        value={item.name}
                        onSave={(value) => handleFieldUpdate(item.id, 'name', value)}
                        type="text"
                        fieldName="Nome"
                        disabled={!editMode[item.id]}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Valor:</label>
                        <EditableItemField
                          value={Number(item.base_value)}
                          onSave={(value) => handleFieldUpdate(item.id, 'base_value', value)}
                          type="number"
                          fieldName="Valor"
                          disabled={!editMode[item.id]}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Raridade:</label>
                        <EditableItemField
                          value={item.rarity}
                          onSave={(value) => handleFieldUpdate(item.id, 'rarity', value)}
                          type="select"
                          selectOptions={rarityOptions}
                          fieldName="Raridade"
                          disabled={!editMode[item.id]}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Categoria:</label>
                        <EditableItemField
                          value={item.category}
                          onSave={(value) => handleFieldUpdate(item.id, 'category', value)}
                          type="select"
                          selectOptions={categoryOptions}
                          fieldName="Categoria"
                          disabled={!editMode[item.id]}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo de Entrega:</label>
                        <EditableItemField
                          value={item.delivery_type}
                          onSave={(value) => handleFieldUpdate(item.id, 'delivery_type', value)}
                          type="select"
                          selectOptions={deliveryTypeOptions}
                          fieldName="Tipo de Entrega"
                          disabled={!editMode[item.id]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={rarityColors[item.rarity]}>
                    {item.rarity}
                  </Badge>
                  
                  <Button
                    variant={editMode[item.id] ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEditMode(item.id)}
                  >
                    {editMode[item.id] ? (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Modo Edição
                      </>
                    ) : (
                      'Editar'
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // TODO: Implementar exclusão com confirmação
                      console.log('Excluir item:', item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {item.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição:</label>
                  <EditableItemField
                    value={item.description}
                    onSave={(value) => handleFieldUpdate(item.id, 'description', value)}
                    type="text"
                    fieldName="Descrição"
                    disabled={!editMode[item.id]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovedItemsTable;
