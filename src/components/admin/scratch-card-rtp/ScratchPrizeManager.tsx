import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ScratchPrize {
  id: number;
  game_type: string;
  name: string;
  value: number;
  weight: number;
  active: boolean;
}

interface ScratchPrizeManagerProps {
  selectedGameType: string;
  onGameTypeChange: (gameType: string) => void;
}

export function ScratchPrizeManager({ selectedGameType, onGameTypeChange }: ScratchPrizeManagerProps) {
  const [prizes, setPrizes] = useState<ScratchPrize[]>([]);
  const [gameTypes, setGameTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrize, setEditingPrize] = useState<Partial<ScratchPrize>>({});
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGameTypes();
  }, []);

  useEffect(() => {
    if (selectedGameType) {
      loadPrizes();
    }
  }, [selectedGameType]);

  const loadGameTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('rtp_pots')
        .select('game_type')
        .order('game_type');

      if (error) throw error;
      setGameTypes(data?.map(d => d.game_type) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tipos",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadPrizes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scratch_prizes')
        .select('*')
        .eq('game_type', selectedGameType)
        .order('weight', { ascending: false });

      if (error) throw error;
      // Map is_active to active for consistency with interface
      const mappedPrizes = (data || []).map((prize: any) => ({
        ...prize,
        active: prize.active ?? prize.is_active ?? true
      }));
      setPrizes(mappedPrizes);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar prêmios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrize = async () => {
    try {
      if (!editingPrize.name || editingPrize.value === undefined || editingPrize.weight === undefined) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome, valor e peso",
          variant: "destructive"
        });
        return;
      }

      const prizeData = {
        game_type: selectedGameType,
        name: editingPrize.name,
        value: editingPrize.value,
        weight: editingPrize.weight,
        active: editingPrize.active ?? true
      };

      if (editingPrize.id) {
        const { error } = await supabase
          .from('scratch_prizes')
          .update(prizeData)
          .eq('id', editingPrize.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scratch_prizes')
          .insert(prizeData);

        if (error) throw error;
      }

      toast({
        title: "Prêmio salvo",
        description: "Prêmio salvo com sucesso"
      });

      setEditingPrize({});
      setIsAdding(false);
      loadPrizes();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar prêmio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeletePrize = async (id: number) => {
    try {
      const { error } = await supabase
        .from('scratch_prizes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Prêmio removido",
        description: "Prêmio removido com sucesso"
      });

      loadPrizes();
    } catch (error: any) {
      toast({
        title: "Erro ao remover prêmio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePopulateDefaults = async (rtpTarget: number) => {
    try {
      const { error } = await supabase.rpc('populate_default_prizes', {
        p_game_type: selectedGameType,
        p_rtp_target: rtpTarget
      });

      if (error) throw error;

      toast({
        title: "Prêmios padrão criados",
        description: `Prêmios padrão para RTP ${rtpTarget * 100}% criados com sucesso`
      });

      loadPrizes();
    } catch (error: any) {
      toast({
        title: "Erro ao criar prêmios padrão",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculateTotalWeight = () => {
    return prizes.filter(p => p.active).reduce((sum, p) => sum + p.weight, 0);
  };

  const calculateExpectedRTP = () => {
    const totalWeight = calculateTotalWeight();
    if (totalWeight === 0) return 0;
    
    return prizes
      .filter(p => p.active)
      .reduce((sum, p) => sum + (p.value * p.weight / totalWeight), 0);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Prêmios</CardTitle>
          <CardDescription>
            Configure os prêmios e pesos para cada tipo de raspadinha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="gameType">Tipo de Raspadinha</Label>
              <Select value={selectedGameType} onValueChange={onGameTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={loadPrizes}
              disabled={!selectedGameType}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {selectedGameType && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    RTP 50%
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar Prêmios Padrão RTP 50%</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá substituir todos os prêmios existentes para este tipo. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handlePopulateDefaults(0.50)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    RTP 60%
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar Prêmios Padrão RTP 60%</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá substituir todos os prêmios existentes para este tipo. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handlePopulateDefaults(0.60)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    RTP 70%
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar Prêmios Padrão RTP 70%</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá substituir todos os prêmios existentes para este tipo. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handlePopulateDefaults(0.70)}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGameType && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total de Prêmios</Label>
                  <div className="text-2xl font-bold">{prizes.length}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Peso Total</Label>
                  <div className="text-2xl font-bold">{calculateTotalWeight()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">RTP Esperado</Label>
                  <div className="text-2xl font-bold">
                    {(calculateExpectedRTP() * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prêmios Configurados
                <Button
                  onClick={() => {
                    setEditingPrize({ game_type: selectedGameType });
                    setIsAdding(true);
                  }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Prêmio
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(isAdding || editingPrize.id) && (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={editingPrize.name || ''}
                          onChange={(e) => setEditingPrize({ ...editingPrize, name: e.target.value })}
                          placeholder="Nome do prêmio"
                        />
                      </div>
                      <div>
                        <Label htmlFor="value">Valor</Label>
                        <Input
                          id="value"
                          type="number"
                          step="0.01"
                          value={editingPrize.value || ''}
                          onChange={(e) => setEditingPrize({ ...editingPrize, value: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Peso</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={editingPrize.weight || ''}
                          onChange={(e) => setEditingPrize({ ...editingPrize, weight: parseFloat(e.target.value) || 0 })}
                          placeholder="1.0"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="active"
                          checked={editingPrize.active ?? true}
                          onCheckedChange={(checked) => setEditingPrize({ ...editingPrize, active: checked })}
                        />
                        <Label htmlFor="active">Ativo</Label>
                      </div>
                      <div className="flex gap-2 pt-6">
                        <Button onClick={handleSavePrize} size="sm">
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingPrize({});
                            setIsAdding(false);
                          }}
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Probabilidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.map((prize) => {
                    const totalWeight = calculateTotalWeight();
                    const probability = totalWeight > 0 ? (prize.weight / totalWeight * 100) : 0;
                    
                    return (
                      <TableRow key={prize.id}>
                        <TableCell className="font-medium">{prize.name}</TableCell>
                        <TableCell>R$ {prize.value.toFixed(2)}</TableCell>
                        <TableCell>{prize.weight}</TableCell>
                        <TableCell>{probability.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Badge variant={prize.active ? "default" : "secondary"}>
                            {prize.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPrize(prize)}
                            >
                              Editar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover Prêmio</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover o prêmio "{prize.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePrize(prize.id)}>
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}