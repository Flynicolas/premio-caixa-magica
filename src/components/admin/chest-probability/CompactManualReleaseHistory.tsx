import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Clock, CheckCircle, XCircle, Users, Crown, 
  Activity, TrendingUp, Package, Filter, Archive 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManualRelease {
  id: string;
  chest_type: string;
  status: string;
  released_by: string;
  released_at: string;
  expires_at: string;
  winner_user_id?: string;
  drawn_at?: string;
  item_id: string;
  metadata?: any;
  // Dados JOINados
  item_name?: string;
  item_image_url?: string;
  item_base_value?: number;
  item_rarity?: string;
  admin_email?: string;
  winner_name?: string;
  winner_email?: string;
}

const CompactManualReleaseHistory = () => {
  const [releases, setReleases] = useState<ManualRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chestFilter, setChestFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    drawn: 0,
    expired: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchReleases();
    
    const channel = supabase
      .channel('manual-releases-compact-updates')
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
      console.log('🔍 Buscando liberações manuais (corrigido)...');
      
      // Query corrigida sem foreign keys inexistentes
      const { data, error } = await supabase
        .from('manual_item_releases')
        .select(`
          *,
          items!inner(
            name,
            image_url,
            base_value,
            rarity
          )
        `)
        .order('released_at', { ascending: false });

      if (error) {
        console.error('❌ Erro SQL:', error);
        throw error;
      }

      // Buscar dados adicionais separadamente para evitar erros de foreign key
      const releasesWithData = await Promise.all(
        (data || []).map(async (release) => {
          // Buscar admin data
          let adminEmail = 'Admin não encontrado';
          try {
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('email')
              .eq('user_id', release.released_by)
              .single();
            
            if (adminData?.email) {
              adminEmail = adminData.email;
            }
          } catch (e) {
            console.warn('Admin não encontrado para release:', release.id);
          }

          // Buscar winner data se existir
          let winnerName = null;
          let winnerEmail = null;
          if (release.winner_user_id) {
            try {
              const { data: winnerData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', release.winner_user_id)
                .single();
              
              if (winnerData) {
                winnerName = winnerData.full_name;
                winnerEmail = winnerData.email;
              }
            } catch (e) {
              console.warn('Winner profile não encontrado:', release.winner_user_id);
            }
          }

          return {
            ...release,
            item_name: release.items?.name,
            item_image_url: release.items?.image_url,
            item_base_value: release.items?.base_value,
            item_rarity: release.items?.rarity,
            admin_email: adminEmail,
            winner_name: winnerName,
            winner_email: winnerEmail,
          };
        })
      );

      console.log('✅ Liberações encontradas:', releasesWithData.length);
      setReleases(releasesWithData);
      
      // Calcular estatísticas
      setStats({
        total: releasesWithData.length,
        pending: releasesWithData.filter(r => r.status === 'pending').length,
        drawn: releasesWithData.filter(r => r.status === 'drawn').length,
        expired: releasesWithData.filter(r => r.status === 'expired').length
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
    const itemName = release.item_name || '';
    const adminEmail = release.admin_email || '';
    
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.chest_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    const matchesChest = chestFilter === 'all' || release.chest_type === chestFilter;
    
    return matchesSearch && matchesStatus && matchesChest;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'hsl(45 93% 47%)';
      case 'drawn': return 'hsl(142 76% 36%)';
      case 'expired': return 'hsl(0 84% 60%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'drawn': return <CheckCircle className="w-3 h-3" />;
      case 'expired': return <XCircle className="w-3 h-3" />;
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
      case 'silver': return 'hsl(var(--muted-foreground))';
      case 'gold': return 'hsl(45 93% 47%)';
      case 'delas': return 'hsl(142 76% 36%)';
      case 'diamond': return 'hsl(221 83% 53%)';
      case 'ruby': return 'hsl(0 84% 60%)';
      case 'premium': return 'hsl(271 91% 65%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards de Estatísticas Compactas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold" style={{ color: getStatusColor('pending') }}>{stats.pending}</p>
            </div>
            <Clock className="w-5 h-5" style={{ color: getStatusColor('pending') }} />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Sorteados</p>
              <p className="text-xl font-bold" style={{ color: getStatusColor('drawn') }}>{stats.drawn}</p>
            </div>
            <CheckCircle className="w-5 h-5" style={{ color: getStatusColor('drawn') }} />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Expirados</p>
              <p className="text-xl font-bold" style={{ color: getStatusColor('expired') }}>{stats.expired}</p>
            </div>
            <XCircle className="w-5 h-5" style={{ color: getStatusColor('expired') }} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Archive className="w-5 h-5" />
            Histórico de Liberações Manuais
          </CardTitle>
        
          {/* Filtros Compactos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="drawn">Sorteados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chestFilter} onValueChange={setChestFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Baú" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Baús</SelectItem>
                <SelectItem value="silver">Prata</SelectItem>
                <SelectItem value="gold">Ouro</SelectItem>
                <SelectItem value="delas">Delas</SelectItem>
                <SelectItem value="diamond">Diamante</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              {filteredReleases.length} resultados
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredReleases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma liberação manual encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Baú</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Liberado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Vencedor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReleases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell>
                        {release.item_image_url && (
                          <img
                            src={release.item_image_url}
                            alt={release.item_name}
                            className="w-8 h-8 object-cover rounded border"
                          />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{release.item_name || 'Item não encontrado'}</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {release.item_base_value?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ color: getChestTypeColor(release.chest_type) }}
                          className="capitalize text-xs"
                        >
                          {release.chest_type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: `${getStatusColor(release.status)}15`,
                            color: getStatusColor(release.status),
                            border: `1px solid ${getStatusColor(release.status)}30`
                          }}
                          className="text-xs"
                        >
                          {getStatusIcon(release.status)}
                          <span className="ml-1">{getStatusText(release.status)}</span>
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {release.admin_email}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {format(new Date(release.released_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {format(new Date(release.expires_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {release.status === 'drawn' ? (
                          <div>
                            <div className="font-medium">{release.winner_name || 'Usuário'}</div>
                            {release.drawn_at && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(release.drawn_at), 'dd/MM HH:mm', { locale: ptBR })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {release.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => expireRelease(release.id)}
                            className="h-7 text-xs"
                          >
                            Expirar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactManualReleaseHistory;