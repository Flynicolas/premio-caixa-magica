import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target
} from 'lucide-react';

interface ManualRelease {
  id: string;
  item_id: string;
  chest_type: string;
  released_by: string;
  status: string;
  winner_user_id: string | null;
  expires_at: string;
  drawn_at: string | null;
  metadata: any;
  created_at: string;
  items?: {
    name: string;
    base_value: number;
    image_url: string;
    rarity: string;
  };
}

interface ScratchItem {
  id: string;
  name: string;
  base_value: number;
  image_url: string;
  rarity: string;
  category: string;
}

const ScratchCardManualReleaseSystem = () => {
  const [releases, setReleases] = useState<ManualRelease[]>([]);
  const [items, setItems] = useState<ScratchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('pix');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isCreatingRelease, setIsCreatingRelease] = useState(false);
  const { toast } = useToast();

  const scratchTypes = [
    { id: 'pix', name: 'PIX R$ 1,00', color: 'bg-green-600' },
    { id: 'sorte', name: 'Sorte R$ 5,00', color: 'bg-blue-600' },
    { id: 'dupla', name: 'Dupla R$ 10,00', color: 'bg-purple-600' },
    { id: 'ouro', name: 'Ouro R$ 25,00', color: 'bg-yellow-600' },
    { id: 'diamante', name: 'Diamante R$ 50,00', color: 'bg-pink-600' },
    { id: 'premium', name: 'Premium R$ 100,00', color: 'bg-red-600' }
  ];

  useEffect(() => {
    loadData();
    loadCurrentUser();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadReleases();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadReleases(),
      loadItems()
    ]);
    setLoading(false);
  };

  const loadReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_item_releases')
        .select(`
          *,
          items (
            name,
            base_value,
            image_url,
            rarity
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReleases(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar liberações:', error);
    }
  };

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, base_value, image_url, rarity, category')
        .eq('is_active', true)
        .order('base_value');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const createManualRelease = async () => {
    if (!selectedItem) {
      toast({
        title: "Erro",
        description: "Selecione um item para liberar",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingRelease(true);

      // Buscar probability_id do item para este tipo de raspadinha
      const { data: probData, error: probError } = await supabase
        .from('scratch_card_probabilities')
        .select('id')
        .eq('item_id', selectedItem)
        .eq('scratch_type', selectedType)
        .eq('is_active', true)
        .single();

      if (probError || !probData) {
        toast({
          title: "Erro",
          description: "Item não está configurado para este tipo de raspadinha",
          variant: "destructive"
        });
        return;
      }

      const releaseData = {
        item_id: selectedItem,
        chest_type: selectedType,
        probability_id: probData.id,
        released_by: currentUser,
        metadata: {
          manual_release: true,
          created_by_ui: true,
          scratch_type: selectedType
        }
      };

      const { error } = await supabase
        .from('manual_item_releases')
        .insert(releaseData);

      if (error) throw error;

      toast({
        title: "Liberação criada!",
        description: `Item liberado manualmente para ${scratchTypes.find(t => t.id === selectedType)?.name}`,
      });

      // Reset form
      setSelectedItem('');
      
      // Reload data
      await loadReleases();
    } catch (error: any) {
      console.error('Erro ao criar liberação:', error);
      toast({
        title: "Erro ao criar liberação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreatingRelease(false);
    }
  };

  const updateReleaseStatus = async (releaseId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'cancelled') {
        updateData.metadata = {
          cancelled_at: new Date().toISOString(),
          cancelled_by_admin: true
        };
      }

      const { error } = await supabase
        .from('manual_item_releases')
        .update(updateData)
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Liberação ${newStatus === 'cancelled' ? 'cancelada' : 'atualizada'} com sucesso`,
      });

      await loadReleases();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const expireOldReleases = async () => {
    try {
      const { error } = await supabase.functions.invoke('expire-manual-releases');
      
      if (error) throw error;

      toast({
        title: "Limpeza realizada",
        description: "Liberações expiradas foram removidas",
      });

      await loadReleases();
    } catch (error: any) {
      console.error('Erro na limpeza:', error);
      toast({
        title: "Erro na limpeza",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, drawn_at: string | null) => {
    if (drawn_at) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Sorteado</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredReleases = releases.filter(r => r.chest_type === selectedType);
  const filteredItems = items.filter(item => {
    // Verificar se o item tem probabilidade configurada para este tipo
    return true; // Por enquanto mostrar todos
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando sistema de liberação manual...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Sistema de Liberação Manual de Prêmios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Target className="w-4 h-4" />
            <AlertDescription>
              Use este sistema para garantir que itens específicos sejam sorteados nas próximas jogadas.
              As liberações têm validade de 7 dias e prioridade sobre o sistema automático.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-6">
          {scratchTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id} className="text-xs">
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {scratchTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Criar Nova Liberação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Nova Liberação Manual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Item a ser liberado</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - R$ {item.base_value.toFixed(2)} ({item.rarity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    O item será liberado na próxima jogada deste tipo de raspadinha.
                  </div>

                  <Button 
                    onClick={createManualRelease}
                    disabled={isCreatingRelease || !selectedItem}
                    className="w-full"
                  >
                    {isCreatingRelease ? 'Criando...' : 'Criar Liberação Manual'}
                  </Button>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Estatísticas - {type.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredReleases.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pendentes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredReleases.filter(r => r.drawn_at).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Sorteados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredReleases.filter(r => r.status === 'expired').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Expirados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredReleases.filter(r => r.status === 'cancelled').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Cancelados</div>
                    </div>
                  </div>

                  <Button 
                    onClick={expireOldReleases}
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Limpar Expirados
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Liberações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Liberações Ativas - {type.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredReleases.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhuma liberação encontrada para este tipo
                    </div>
                  ) : (
                    filteredReleases.map((release) => (
                      <div key={release.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {release.items?.name || 'Item não encontrado'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            R$ {release.items?.base_value?.toFixed(2)} • {release.items?.rarity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Criado: {new Date(release.created_at).toLocaleString()}
                          </div>
                          {release.winner_user_id && (
                            <div className="text-xs text-green-600">
                              <User className="w-3 h-3 inline mr-1" />
                              Sorteado em {new Date(release.drawn_at!).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(release.status, release.drawn_at)}
                          
                          {release.status === 'pending' && !release.drawn_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReleaseStatus(release.id, 'cancelled')}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScratchCardManualReleaseSystem;