
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CollaboratorManagement from '@/components/admin/CollaboratorManagement';
import WalletControlPanel from '@/components/admin/WalletControlPanel';
import ItemManagementTab from '@/components/admin/ItemManagementTab';
import EnhancedChestProbabilityManager from '@/components/admin/EnhancedChestProbabilityManager';
import DeliveryManagementTab from '@/components/admin/DeliveryManagementTab';
import UsersManagement from '@/components/admin/UsersManagement';
import ChestGoalsManager from '@/components/admin/ChestGoalsManager';
import { Shield, Package, Settings, Users, Wallet, Target, Truck } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const { items, loading, isAdmin, refreshItems } = useAdminData();
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

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
        <p className="text-muted-foreground">Gerencie o sistema de baús, itens, entregas e usuários</p>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Itens
          </TabsTrigger>
          <TabsTrigger value="chests" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Baús
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Carteira
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Colaboradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <ItemManagementTab />
        </TabsContent>

        <TabsContent value="chests">
          <EnhancedChestProbabilityManager 
            items={items.filter(item => item.is_active)} 
            onRefresh={refreshItems} 
          />
        </TabsContent>

        <TabsContent value="deliveries">
          <DeliveryManagementTab />
        </TabsContent>

        <TabsContent value="wallet">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Editar Metas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Configurar Metas dos Baús</DialogTitle>
                  </DialogHeader>
                  <ChestGoalsManager />
                </DialogContent>
              </Dialog>
            </div>
            <WalletControlPanel />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
