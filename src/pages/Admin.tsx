
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChestManagementPanel from '@/components/ChestManagementPanel';
import ItemManagement from '@/components/admin/ItemManagement';
import ChestProbabilityManager from '@/components/admin/ChestProbabilityManager';
import CollaboratorManagement from '@/components/admin/CollaboratorManagement';
import WalletControlPanel from '@/components/admin/WalletControlPanel';
import { Shield, BarChart3, Settings, Users, Package, Wallet } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const { items, loading, isAdmin, refreshItems } = useAdminData();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Você precisa estar logado para acessar o painel administrativo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie o sistema de baús, carteira virtual e acompanhe métricas em tempo real</p>
      </div>

      <Tabs defaultValue="wallet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Carteira
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Itens
          </TabsTrigger>
          <TabsTrigger value="chests" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Baús
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <WalletControlPanel />
        </TabsContent>

        <TabsContent value="dashboard">
          <ChestManagementPanel />
        </TabsContent>

        <TabsContent value="items">
          <div className="space-y-6">
            <ItemManagement items={items} onRefresh={refreshItems} />
          </div>
        </TabsContent>

        <TabsContent value="chests">
          <div className="space-y-6">
            <ChestProbabilityManager items={items.filter(item => item.is_active)} onRefresh={refreshItems} />
          </div>
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorManagement />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Sistema de usuários finais será implementado na próxima etapa.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações gerais do sistema serão implementadas em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
