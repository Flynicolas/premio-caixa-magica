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
  Filter,
  AlertTriangle
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
import CreateUserModal from './UsersManagement/CreateUserModal';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  cpf: string | null;
  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement?: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  is_active: boolean;
  is_demo: boolean;
  simulate_actions: boolean;
  balance: number;
  total_spent: number;
  chests_opened: number;
  last_login: string | null;
  credito_demo: number;
  ultimo_reset_demo: string;
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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
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
        .select('*, credito_demo, ultimo_reset_demo')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: wallets, error: walletsError } = await supabase
        .from('user_wallets')
        .select('user_id, balance, total_spent');

      if (walletsError) throw walletsError;

      const usersData = profiles.map(profile => {
        const wallet = wallets.find(w => w.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          cpf: profile.cpf,
          zip_code: profile.zip_code,
          street: profile.street,
          number: profile.number,
          complement: profile.complement,
          neighborhood: profile.neighborhood,
          city: profile.city,
          state: profile.state,
          created_at: profile.created_at,
          is_active: profile.is_active,
          is_demo: profile.is_demo || false,
          simulate_actions: profile.simulate_actions || false,
          balance: wallet?.balance || 0,
          total_spent: wallet?.total_spent || 0,
          chests_opened: profile.chests_opened || 0,
          last_login: profile.last_login,
          credito_demo: profile.credito_demo || 0,
          ultimo_reset_demo: profile.ultimo_reset_demo || ''
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

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciar Usuários ({filteredUsers.length})
            </CardTitle>
            <Button
              onClick={() => setShowCreateUserModal(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Criar Usuário
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                <SelectItem value="active">Usuários ativos</SelectItem>
                <SelectItem value="inactive">Usuários inativos</SelectItem>
                <SelectItem value="demo">Usuários demo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>CPF</TableHead>
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
                            {user.is_demo && isAdmin && (
                              <div title="Usuário em modo demo">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              </div>
                            )}
                            {user.full_name || 'Nome não informado'}
                            {user.is_demo && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                DEMO
                              </Badge>
                            )}
                            {user.simulate_actions && (
                              <Badge variant="outline" className="text-xs">
                                AUTO
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                    <TableCell>{user.cpf || '-'}</TableCell>
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
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDateTime(user.last_login)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleUserTools(user)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={fetchUsers}
      />

    </div>
  );
};

export default UsersManagement;
