import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, TestTube } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';
import { toast } from 'sonner';

export const ScratchCardConfigForm: React.FC = () => {
  const { scratchCards, updateScratchCard, simulateGame } = useAdvancedScratchCard();
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    price_display: 0,
    backend_cost: 0,
    category: 'money',
    sort_order: 0,
    win_probability_global: 12.5,
    win_probability_influencer: null as number | null,
    win_probability_normal: null as number | null,
    is_active: true,
    image_url: ''
  });

  const selectedCardData = scratchCards.find(card => card.scratch_type === selectedCard);

  React.useEffect(() => {
    if (selectedCardData) {
      setFormData({
        name: selectedCardData.name,
        price_display: selectedCardData.price_display,
        backend_cost: selectedCardData.backend_cost,
        category: selectedCardData.category,
        sort_order: selectedCardData.sort_order,
        win_probability_global: selectedCardData.win_probability_global,
        win_probability_influencer: selectedCardData.win_probability_influencer,
        win_probability_normal: selectedCardData.win_probability_normal,
        is_active: selectedCardData.is_active,
        image_url: selectedCardData.image_url || ''
      });
    }
  }, [selectedCardData]);

  const handleSave = async () => {
    if (!selectedCard) {
      toast.error('Selecione uma raspadinha primeiro');
      return;
    }

    await updateScratchCard(selectedCard, formData);
  };

  const handleSimulate = async () => {
    if (!selectedCard) {
      toast.error('Selecione uma raspadinha primeiro');
      return;
    }

    await simulateGame(selectedCard);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Raspadinha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seletor de Raspadinha */}
          <div className="space-y-2">
            <Label>Raspadinha</Label>
            <Select value={selectedCard} onValueChange={setSelectedCard}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma raspadinha" />
              </SelectTrigger>
              <SelectContent>
                {scratchCards.map(card => (
                  <SelectItem key={card.id} value={card.scratch_type}>
                    {card.name} ({card.scratch_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCard && (
            <>
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money">Dinheiro</SelectItem>
                      <SelectItem value="mixed">Misto</SelectItem>
                      <SelectItem value="items">Itens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_display">Preço Vitrine (R$)</Label>
                  <Input
                    id="price_display"
                    type="number"
                    step="0.01"
                    value={formData.price_display}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_display: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backend_cost">Custo Real (R$)</Label>
                  <Input
                    id="backend_cost"
                    type="number"
                    step="0.01"
                    value={formData.backend_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, backend_cost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Probabilidades */}
              <div className="space-y-4">
                <Label>Probabilidades de Vitória (%)</Label>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="prob_global" className="text-sm">Global: {formData.win_probability_global}%</Label>
                    <Slider
                      id="prob_global"
                      value={[formData.win_probability_global]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, win_probability_global: value }))}
                      max={100}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prob_influencer" className="text-sm">
                      Influencer: {formData.win_probability_influencer ? formData.win_probability_influencer + '%' : 'Usar Global'}
                    </Label>
                    <Slider
                      id="prob_influencer"
                      value={[formData.win_probability_influencer || formData.win_probability_global]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, win_probability_influencer: value }))}
                      max={100}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prob_normal" className="text-sm">
                      Normal: {formData.win_probability_normal ? formData.win_probability_normal + '%' : 'Usar Global'}
                    </Label>
                    <Slider
                      id="prob_normal"
                      value={[formData.win_probability_normal || formData.win_probability_global]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, win_probability_normal: value }))}
                      max={100}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Configurações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordem de Exibição</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Ativa</Label>
                </div>
              </div>

              {/* URL da Imagem */}
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Textarea
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="h-20"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </Button>
                <Button variant="outline" onClick={handleSimulate} className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Testar Simulação
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};