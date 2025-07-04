
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportFilters {
  dateRange: string;
  reportType: string;
  startDate?: string | null;
  endDate?: string | null;
}

export const useWalletReports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getDateRange = (range: string, startDate?: string | null, endDate?: string | null) => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (range) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        start = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        }
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    }

    return { start: start.toISOString(), end: end.toISOString() };
  };

  const generateReport = async (filters: ReportFilters) => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(filters.dateRange, filters.startDate, filters.endDate);
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles!inner(email, full_name),
          user_wallets!inner(balance)
        `)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });

      // Aplicar filtros específicos
      if (filters.reportType === 'deposits') {
        query = query.eq('type', 'deposit');
      } else if (filters.reportType === 'purchases') {
        query = query.eq('type', 'purchase');
      }

      const { data, error } = await query;

      if (error) throw error;

      toast({
        title: "Relatório gerado!",
        description: `${data?.length || 0} registros encontrados`,
        variant: "default"
      });

      return data;

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (filters: ReportFilters) => {
    try {
      const data = await generateReport(filters);
      if (!data || data.length === 0) return;

      // Preparar dados para CSV
      const csvData = data.map(transaction => ({
        'ID': transaction.id,
        'Data': new Date(transaction.created_at).toLocaleString('pt-BR'),
        'Usuario': transaction.profiles?.email || 'N/A',
        'Tipo': transaction.type,
        'Valor': `R$ ${Number(transaction.amount).toFixed(2)}`,
        'Descricao': transaction.description || '',
        'Status': transaction.status,
        'Saldo_Atual': `R$ ${Number(transaction.user_wallets?.balance || 0).toFixed(2)}`
      }));

      // Converter para CSV
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_carteira_${filters.reportType}_${filters.dateRange}.csv`;
      link.click();

      toast({
        title: "CSV exportado!",
        description: "O arquivo foi baixado com sucesso",
        variant: "default"
      });

    } catch (error: any) {
      toast({
        title: "Erro ao exportar CSV",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async (filters: ReportFilters) => {
    try {
      const data = await generateReport(filters);
      if (!data || data.length === 0) return;

      // Aqui você pode implementar a geração de PDF
      // Por enquanto, vamos criar um relatório simples em HTML
      const reportContent = `
        <html>
          <head>
            <title>Relatório de Carteira</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Relatório de Carteira - ${filters.reportType}</h1>
            <p>Período: ${filters.dateRange}</p>
            <p>Total de registros: ${data.length}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(transaction => `
                  <tr>
                    <td>${new Date(transaction.created_at).toLocaleString('pt-BR')}</td>
                    <td>${transaction.profiles?.email || 'N/A'}</td>
                    <td>${transaction.type}</td>
                    <td>R$ ${Number(transaction.amount).toFixed(2)}</td>
                    <td>${transaction.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(reportContent);
        newWindow.document.close();
        newWindow.print();
      }

      toast({
        title: "PDF gerado!",
        description: "O relatório foi aberto em uma nova janela",
        variant: "default"
      });

    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    generateReport,
    exportToCSV,
    exportToPDF,
    loading
  };
};
