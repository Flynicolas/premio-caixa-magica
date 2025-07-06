
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shield, Eye, Settings, Search } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  balance: number;
  total_spent: number;
  chests_opened: number;
}

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AccountTypeManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Buscar usuários normais com suas carteiras
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, created_at, last_login, is_active,
          user_wallets (balance, total_spent, total_deposited)
        `);

      if (profilesError) throw profilesError;

      // Buscar usuários admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*');

      if (adminError) throw adminError;

      // Buscar estatísticas de uso dos usuários
      const { data: activityData, error: activityError } = await supabase
        .from('user_activities')
        .select('user_id, activity_type');

      if (activityError) throw activityError;

      // Processar dados dos usuários
      const processedUsers = (profilesData || []).map(profile => {
        const wallet = Array.isArray(profile.user_wallets) ? profile.user_wallets[0] : profile.user_wallets;
        const userActivities = activityData?.filter(a => a.user_id === profile.id) || [];
        const chestsOpened = userActivities.filter(a => a.activity_type === 'chest_opened').length;

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          last_login: profile.last_login,
          is_active: profile.is_active,
          balance: wallet?.balance || 0,
          total_spent: wallet?.total_spent || 0,
          chests_opened: chestsOpened
        };
      });

      setUsers(processedUsers);
      setAdminUsers(adminData || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Usuário desativado" : "Usuário ativado",
        description: "Status do usuário foi alterado com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const promoteToAdmin = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([{
          user_id: userId,
          email: email,
          role: 'collaborator',
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Usuário promovido",
        description: "Usuário foi promovido a colaborador com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro ao promover usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const revokeAdminAccess = async (adminUserId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUserId);

      if (error) throw error;

      toast({
        title: "Acesso revogado",
        description: "Acesso administrativo foi revogado com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao revogar acesso:', error);
      toast({
        title: "Erro ao revogar acesso",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserAdmin = (userId: string) => {
    return adminUsers.some(admin => admin.user_id === userId && admin.is_active);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Contas</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-xl font-bold">{adminUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-xl font-bold">{users.filter(u => u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contas Demo</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const isAdmin = isUserAdmin(user.id);
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {isAdmin && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Administrador
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <p className="font-medium text-green-600">R$ {user.balance.toFixed(2)}</p>
                      <p className="text-muted-foreground">{user.chests_opened} baús abertos</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      
                      {!isAdmin ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promoteToAdmin(user.id, user.email)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Promover
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const adminUser = adminUsers.find(a => a.user_id === user.id);
                            if (adminUser) revokeAdminAccess(adminUser.id);
                          }}
                        >
                          Revogar Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Nome Completo</label>
                  <p className="text-sm">{selectedUser.full_name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Saldo Atual</label>
                  <p className="text-sm font-medium text-green-600">R$ {selectedUser.balance.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Total Gasto</label>
                  <p className="text-sm">R$ {selectedUser.total_spent.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Baús Abertos</label>
                  <p className="text-sm">{selectedUser.chests_opened}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Data de Cadastro</label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetails(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountTypeManager;
