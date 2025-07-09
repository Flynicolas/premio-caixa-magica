
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Edit, 
  Settings, 
  UserCheck, 
  UserX, 
  DollarSign,
  Calendar,
  ShoppingBag,
  Mail,
  Plus,
  UserPlus,
  Filter
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserEditDialog from './UsersManagement/UserEditDialog';
import UserToolsDialog from './UsersManagement/UserToolsDialog';
import CreateDemoUserModal from './UsersManagement/CreateDemoUserModal';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_active: boolean;
  is_demo: boolean;
  simulate_actions: boolean;
  balance: number;
  total_spent: number;
  chests_opened: number;
  last_login: string | null;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showToolsDialog, setShowToolsDialog] = useState(false);
  const [showCreateDemoModal, setShowCreateDemoModal] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: wallets, error: walletsError } = await supabase
        .from('user_wallets')
        .select('user_id, balance, total_spent');

      if (walletsError) throw walletsError;

      // Combinar dados dos perfis com carteiras
      const usersData = profiles.map(profile => {
        const wallet = wallets.find(w => w.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          is_active: profile.is_active,
          is_demo: profile.is_demo || false,
          simulate_actions: profile.simulate_actions || false,
          balance: wallet?.balance || 0,
          total_spent: wallet?.total_spent || 0,
          chests_opened: profile.chests_opened || 0,
          last_login: profile.last_login
        };
      });

      setUsers(usersData);
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

  const filterUsers = () => {
    let filtered = users;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (statusFilter) {
          case 'active':
            return user.is_active && !user.is_demo;
          case 'inactive':
            return !user.is_active && !user.is_demo;
          case 'demo':
            return user.is_demo;
          default:
            return true;
        }
      });
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUserTools = (user: UserData) => {
    setSelectedUser(user);
    setShowToolsDialog(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (user: UserData) => {
    if (user.is_demo) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">Demo</Badge>;
    }
    return (
      <Badge 
        variant={user.is_active ? "default" : "destructive"}
        className={user.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
      >
        {user.is_active ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3">Carregando usuários...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciar Usuários ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  onClick={() => setShowCreateDemoModal(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar Usuário DEMO
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Nenhum usuário encontrado para os filtros aplicados.' : 'Nenhum usuário cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Baús Abertos</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {user.full_name || 'Nome não informado'}
                            {user.is_demo && (
                              <Badge variant="secondary" className="text-xs">
                                DEMO
                              </Badge>
                            )}
                            {user.simulate_actions && (
                              <Badge variant="outline" className="text-xs">
                                AUTO
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            R$ {user.balance.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span>R$ {user.total_spent.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4 text-purple-600" />
                          <span>{user.chests_opened}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{formatDate(user.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDateTime(user.last_login)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserTools(user)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserEditDialog
        user={selectedUser}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedUser(null);
        }}
        onSave={() => {
          fetchUsers();
          setShowEditDialog(false);
          setSelectedUser(null);
        }}
      />

      <UserToolsDialog
        user={selectedUser}
        isOpen={showToolsDialog}
        onClose={() => {
          setShowToolsDialog(false);
          setSelectedUser(null);
        }}
        onUpdate={() => {
          fetchUsers();
        }}
      />

      <CreateDemoUserModal
        isOpen={showCreateDemoModal}
        onClose={() => setShowCreateDemoModal(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersManagement;
