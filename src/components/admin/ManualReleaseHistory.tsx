import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Clock, CheckCircle, XCircle, Users, Crown, Activity, TrendingUp } from 'lucide-react';

interface ManualRelease {
  id: string;
  chest_type: string;
  status: string;
  released_by: string;
  released_at: string;
  expires_at: string;
  winner_user_id?: string;
  drawn_at?: string;
  items?: any;
  admin_users?: any;
  profiles?: any;
}

const ManualReleaseHistory = () => {
  const [releases, setReleases] = useState<ManualRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    drawn: 0,
    expired: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReleases();
    
    // Configurar realtime updates
    const channel = supabase
      .channel('manual-releases-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'manual_item_releases' },
        () => fetchReleases()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReleases = async () => {
    try {
      console.log('🔍 Buscando liberações manuais...');
      const { data, error } = await supabase
        .from('manual_item_releases')
        .select(`
          *,
          items!manual_item_releases_item_id_fkey(*),
          admin_users!manual_item_releases_released_by_fkey(email),
          profiles!manual_item_releases_winner_user_id_fkey(full_name, email)
        `)
        .order('released_at', { ascending: false });

      if (error) {
        console.error('❌ Erro SQL:', error);
        throw error;
      }

      console.log('✅ Liberações encontradas:', data?.length || 0);
      setReleases(data || []);
      
      // Calcular estatísticas
      const releaseData = data || [];
      setStats({
        total: releaseData.length,
        pending: releaseData.filter(r => r.status === 'pending').length,
        drawn: releaseData.filter(r => r.status === 'drawn').length,
        expired: releaseData.filter(r => r.status === 'expired').length
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar liberações:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const expireRelease = async (releaseId: string) => {
    try {
      const { error } = await supabase
        .from('manual_item_releases')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Liberação expirada",
        description: "A liberação manual foi marcada como expirada.",
      });

      fetchReleases();
    } catch (error: any) {
      console.error('Erro ao expirar liberação:', error);
      toast({
        title: "Erro ao expirar liberação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredReleases = releases.filter(release => {
    const itemName = release.items?.name || '';
    const adminEmail = release.admin_users?.email || '';
    
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.chest_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'drawn': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'drawn': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'drawn': return 'Sorteado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getChestTypeColor = (chestType: string) => {
    switch (chestType) {
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-400';
      case 'delas': return 'bg-green-400';
      case 'diamond': return 'bg-blue-400';
      case 'ruby': return 'bg-red-400';
      case 'premium': return 'bg-purple-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sorteados</p>
                <p className="text-2xl font-bold text-green-600">{stats.drawn}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Histórico de Liberações Manuais
          </CardTitle>
        
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por item, baú ou admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="drawn">Sorteados</option>
            <option value="expired">Expirados</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredReleases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma liberação manual encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReleases.map((release) => (
              <div
                key={release.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {release.items?.image_url && (
                      <img
                        src={release.items.image_url}
                        alt={release.items.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{release.items?.name || 'Item não encontrado'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getChestTypeColor(release.chest_type)} text-white`}>
                          Baú {release.chest_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {release.items?.rarity || 'N/A'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          R$ {release.items?.base_value?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(release.status)} text-white`}>
                      {getStatusIcon(release.status)}
                      <span className="ml-1">{getStatusText(release.status)}</span>
                    </Badge>
                    
                    {release.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => expireRelease(release.id)}
                      >
                        Expirar
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Liberado por:</span>
                    <p className="font-medium">{release.admin_users?.email || 'Admin não encontrado'}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Data de liberação:</span>
                    <p className="font-medium">
                      {format(new Date(release.released_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Expira em:</span>
                    <p className="font-medium">
                      {format(new Date(release.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  
                  {release.status === 'drawn' && (
                    <div>
                      <span className="text-muted-foreground">Vencedor:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {release.profiles?.full_name || release.profiles?.email || 'Usuário'}
                      </p>
                      {release.drawn_at && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(release.drawn_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ManualReleaseHistory;