
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletReports } from '@/hooks/useWalletReports';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

const WalletReportsPanel = () => {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { 
    generateReport, 
    exportToCSV, 
    exportToPDF, 
    loading 
  } = useWalletReports();

  const handleGenerateReport = async () => {
    const filters = {
      dateRange,
      reportType,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null
    };
    
    await generateReport(filters);
  };

  const handleExportCSV = async () => {
    const filters = {
      dateRange,
      reportType,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null
    };
    
    await exportToCSV(filters);
  };

  const handleExportPDF = async () => {
    const filters = {
      dateRange,
      reportType,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null
    };
    
    await exportToPDF(filters);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerador de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Todas as Transações</SelectItem>
                  <SelectItem value="deposits">Apenas Depósitos</SelectItem>
                  <SelectItem value="purchases">Apenas Compras</SelectItem>
                  <SelectItem value="users">Relatório de Usuários</SelectItem>
                  <SelectItem value="summary">Resumo Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleExportCSV} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              onClick={handleExportPDF} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType('transactions');
          setDateRange('today');
          handleGenerateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Transações de Hoje</p>
                <p className="text-sm text-muted-foreground">Relatório rápido</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType('users');
          setDateRange('month');
          handleGenerateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Usuários do Mês</p>
                <p className="text-sm text-muted-foreground">Relatório de atividade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setReportType('summary');
          setDateRange('month');
          handleGenerateReport();
        }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Resumo Mensal</p>
                <p className="text-sm text-muted-foreground">Análise financeira</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletReportsPanel;
