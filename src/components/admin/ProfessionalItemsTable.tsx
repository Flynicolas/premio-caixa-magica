
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import ItemImageUploader from './ItemImageUploader';
import { DatabaseItem } from '@/types/database';
import { Edit3, Save, X, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProfessionalItemsTable = () => {
  const { items, loading, updateItemRealtime } = useRealtimeItems();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  
  const [editingItems, setEditingItems] = useState<Record<string, Partial<DatabaseItem>>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<DatabaseItem> | null>(null);

  const rarityOptions = [
    { value: 'common', label: 'Comum' },
    { value: 'rare', label: 'Raro' },
    { value: 'epic', label: 'Épico' },
    { value: 'legendary', label: 'Lendário' }
  ];

  const categoryOptions = [
    { value: 'product', label: 'Produto' },
    { value: 'money', label: 'Dinheiro' },
    { value: 'voucher', label: 'Voucher' }
  ];

  const deliveryTypeOptions = [
    { value: 'digital', label: 'Digital' },
    { value: 'physical', label: 'Físico' }
  ];

  const startEditing = (itemId: string, item: DatabaseItem) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: { ...item }
    }));
  };

  const cancelEditing = (itemId: string) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const updateEditingItem = (itemId: string, field: keyof DatabaseItem, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const confirmSave = (itemId: string) => {
    const changes = editingItems[itemId];
    if (!changes) return;

    setPendingChanges(changes);
    setShowConfirmDialog(itemId);
  };

  const handleSave = async () => {
    if (!showConfirmDialog || !pendingChanges) return;

    try {
      console.log('Salvando alterações no item:', showConfirmDialog, pendingChanges);
      
      const result = await updateItemRealtime(showConfirmDialog, pendingChanges);
      
      if (result.success) {
        cancelEditing(showConfirmDialog);
        toast({
          title: "Item atualizado!",
          description: "Alterações salvas com sucesso no banco de dados.",
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setShowConfirmDialog(null);
      setPendingChanges(null);
    }
  };

  const handleImageUpload = async (itemId: string, imageUrl: string) => {
    try {
      console.log('Atualizando imagem do item:', itemId, 'URL:', imageUrl);
      
      const result = await updateItemRealtime(itemId, { image_url: imageUrl });
      
      if (result.success) {
        console.log('Imagem atualizada com sucesso no banco');
      } else {
        throw new Error(result.error || 'Erro ao atualizar imagem');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar imagem no banco:', error);
      throw error;
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores podem acessar esta área.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando sistema de gestão...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dashboard Profissional de Itens ({items.length})</span>
            <div className="text-sm text-muted-foreground">
              Sistema integrado com banco de dados em tempo real
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.map((item) => {
              const isEditing = editingItems[item.id];
              const editData = isEditing || item;
              
              return (
                <div key={item.id} className="border rounded-lg p-6 bg-gradient-to-r from-white to-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getRarityColor(item.rarity)}>
                            {item.rarity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ID: {item.id.slice(0, 8)}...
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.name}
                        </h3>
                        
                        <div className="text-lg font-semibold text-green-600 mt-1">
                          R$ {Number(item.base_value).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ItemImageUploader
                        currentImageUrl={item.image_url || undefined}
                        onImageUploaded={(url) => handleImageUpload(item.id, url)}
                        itemId={item.id}
                        itemName={item.name}
                      />
                      
                      {isEditing ? (
                        <>
                          <Button
                            onClick={() => confirmSave(item.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => cancelEditing(item.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => startEditing(item.id, item)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Item
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => updateEditingItem(item.id, 'name', e.target.value)}
                          className="font-medium"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {item.name}
                        </div>
                      )}
                    </div>
                    
                    {/* Valor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor (R$)
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.base_value}
                          onChange={(e) => updateEditingItem(item.id, 'base_value', parseFloat(e.target.value) || 0)}
                          className="font-medium"
                        />
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border font-semibold text-green-600">
                          R$ {Number(item.base_value).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    {/* Raridade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Raridade
                      </label>
                      {isEditing ? (
                        <Select
                          value={editData.rarity}
                          onValueChange={(value) => updateEditingItem(item.id, 'rarity', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {rarityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          <Badge className={getRarityColor(item.rarity)}>
                            {rarityOptions.find(r => r.value === item.rarity)?.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria
                      </label>
                      {isEditing ? (
                        <Select
                          value={editData.category}
                          onValueChange={(value) => updateEditingItem(item.id, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {categoryOptions.find(c => c.value === item.category)?.label}
                        </div>
                      )}
                    </div>
                    
                    {/* Tipo de Entrega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Entrega
                      </label>
                      {isEditing ? (
                        <Select
                          value={editData.delivery_type}
                          onValueChange={(value) => updateEditingItem(item.id, 'delivery_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          {deliveryTypeOptions.find(d => d.value === item.delivery_type)?.label}
                        </div>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="p-2 bg-gray-50 rounded border">
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  {item.description && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <div className="p-3 bg-gray-50 rounded border text-sm">
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={!!showConfirmDialog} onOpenChange={() => setShowConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmar Alterações
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja salvar todas as alterações feitas neste item?
              <br />
              <strong>As mudanças serão aplicadas imediatamente no banco de dados e em todo o sistema.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(null)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Sim, Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfessionalItemsTable;
