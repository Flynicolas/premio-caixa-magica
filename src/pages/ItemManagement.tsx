import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useItemManagement } from '@/hooks/useItemManagement';
import ItemsSpreadsheet from '@/components/admin/ItemsSpreadsheet';
import DataMigrationPanel from '@/components/admin/DataMigrationPanel';
import ExcelImporter from '@/components/admin/ExcelImporter';
import ImportGuide from '@/components/admin/ImportGuide';
import TextImporter from '@/components/admin/TextImporter';
import { 
  Database, 
  Grid3X3, 
  Upload, 
  BarChart3,
  Shield,
  TrendingUp,
  Package,
  Image as ImageIcon,
  BookOpen,
  FileText
} from 'lucide-react';
import ImprovedItemsTable from '@/components/admin/ImprovedItemsTable';

const ItemManagement = () => {
  const { user } = useAuth();
  const {
    items,
    stats,
    loading,
    isAdmin,
    migrateChestData,
    updateItem,
    createItem,
    deleteItem,
    bulkUpdateItems,
    refetchItems
  } = useItemManagement();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Você precisa estar logado para acessar o sistema de gestão de itens.</p>
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
            <p>Carregando sistema de gestão...</p>
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
              <p className="text-muted-foreground">Você não tem permissão para acessar o sistema de gestão de itens.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Gestão de Itens</h1>
        <p className="text-muted-foreground">Gerencie todos os itens dos baús de forma visual e intuitiva</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos de Baú</p>
                <p className="text-2xl font-bold">{Object.keys(stats.itemsByChest).length}</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sem Imagem</p>
                <p className="text-2xl font-bold text-red-600">{stats.missingImages}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(stats.itemsByRarity).length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição por Raridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.itemsByRarity).map(([rarity, count]) => (
                <div key={rarity} className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={
                      rarity === 'common' ? 'border-gray-500 text-gray-700' :
                      rarity === 'rare' ? 'border-blue-500 text-blue-700' :
                      rarity === 'epic' ? 'border-purple-500 text-purple-700' :
                      'border-yellow-500 text-yellow-700'
                    }
                  >
                    {rarity}: {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Migração
          </TabsTrigger>
          <TabsTrigger value="text-import" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Texto
          </TabsTrigger>
          <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Planilha
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Excel
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Guia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <ImprovedItemsTable />
        </TabsContent>

        <TabsContent value="migration">
          <DataMigrationPanel
            onMigrateData={migrateChestData}
            loading={loading}
            stats={stats}
            onRefreshData={refetchItems}
          />
        </TabsContent>

        <TabsContent value="text-import">
          <TextImporter />
        </TabsContent>

        <TabsContent value="spreadsheet">
          <ItemsSpreadsheet
            items={items}
            onUpdateItem={updateItem}
            onCreateItem={createItem}
            onDeleteItem={deleteItem}
            onBulkUpdate={bulkUpdateItems}
          />
        </TabsContent>

        <TabsContent value="upload">
          <ExcelImporter />
        </TabsContent>

        <TabsContent value="guide">
          <ImportGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItemManagement;
