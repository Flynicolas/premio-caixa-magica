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
import { AdminErrorDashboard } from '@/components/admin/AdminErrorDashboard';
import ScratchCardManager from '@/components/admin/ScratchCardManager';
import DemoItemsManager from '@/components/admin/DemoItemsManager';
import CaixaGeralDashboard from '@/components/admin/CaixaGeralDashboard';
import { Shield, Package, Settings, Users, Wallet, Target, Truck, AlertTriangle, Gamepad2, TestTube, DollarSign } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const { items, loading, isAdmin, refreshItems } = useAdminData();
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Verificando permissões...</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie o sistema de baús, itens, entregas e usuários</p>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Itens
          </TabsTrigger>
          <TabsTrigger value="chests" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Baús
          </TabsTrigger>
          <TabsTrigger value="scratch" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Raspadinha
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="caixa-geral" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Caixa Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Erros
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Demo
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

        <TabsContent value="scratch">
          <ScratchCardManager />
        </TabsContent>

        <TabsContent value="deliveries">
          <DeliveryManagementTab />
        </TabsContent>

        <TabsContent value="caixa-geral">
          <CaixaGeralDashboard />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorManagement />
        </TabsContent>

        <TabsContent value="errors">
          <AdminErrorDashboard />
        </TabsContent>

        <TabsContent value="demo">
          <DemoItemsManager />
        </TabsContent>

      </Tabs>
      </div>
    </div>
  );
};

export default Admin;