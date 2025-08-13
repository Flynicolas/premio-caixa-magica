import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DepositTab } from './DepositTab';
import { WithdrawTab } from './WithdrawTab';
import { TransactionHistoryTab } from './TransactionHistoryTab';
import { SecurityBanner } from './SecurityBanner';
import { Wallet, Download, Upload, History } from 'lucide-react';

export const WalletTabs = () => {
  const [activeTab, setActiveTab] = useState('deposit');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <SecurityBanner />
      
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/30">
            <TabsTrigger 
              value="deposit" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Download className="w-4 h-4" />
              Depositar
            </TabsTrigger>
            <TabsTrigger 
              value="withdraw"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="w-4 h-4" />
              Sacar
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            <DepositTab />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            <WithdrawTab />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistoryTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};