import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, MousePointer, Calendar, Download } from 'lucide-react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AffiliateReports = () => {
  const { loading } = useAffiliateAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Dados mock para demonstração
  const mockData = {
    overview: {
      total_clicks: 1250,
      total_registrations: 85,
      total_commissions_paid: 12500,
      conversion_rate: 6.8,
      avg_commission_per_affiliate: 147.06
    },
    daily_stats: [
      { date: '2024-01-20', clicks: 45, registrations: 3, commissions: 250 },
      { date: '2024-01-21', clicks: 52, registrations: 4, commissions: 320 },
      { date: '2024-01-22', clicks: 38, registrations: 2, commissions: 180 },
      { date: '2024-01-23', clicks: 61, registrations: 5, commissions: 410 },
      { date: '2024-01-24', clicks: 48, registrations: 3, commissions: 290 },
      { date: '2024-01-25', clicks: 55, registrations: 4, commissions: 360 },
      { date: '2024-01-26', clicks: 42, registrations: 3, commissions: 240 }
    ],
    top_affiliates: [
      { ref_code: 'ABC123', clicks: 125, registrations: 12, commissions: 1250, email: 'afiliado1@email.com' },
      { ref_code: 'DEF456', clicks: 98, registrations: 8, commissions: 980, email: 'afiliado2@email.com' },
      { ref_code: 'GHI789', clicks: 87, registrations: 7, commissions: 870, email: 'afiliado3@email.com' },
      { ref_code: 'JKL012', clicks: 76, registrations: 6, commissions: 760, email: 'afiliado4@email.com' },
      { ref_code: 'MNO345', clicks: 65, registrations: 5, commissions: 650, email: 'afiliado5@email.com' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Relatórios de Afiliados</h2>
            <p className="text-sm text-muted-foreground">Analytics e performance do programa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cliques</p>
                <p className="text-2xl font-bold">{mockData.overview.total_clicks.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cadastros</p>
                <p className="text-2xl font-bold">{mockData.overview.total_registrations}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Comissões Pagas</p>
                <p className="text-2xl font-bold">R$ {(mockData.overview.total_commissions_paid / 100).toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+15.8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold">{mockData.overview.conversion_rate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Média por Afiliado</p>
                <p className="text-2xl font-bold">R$ {mockData.overview.avg_commission_per_affiliate.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+5.4%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Performance Diária */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value, name) => [
                    name === 'commissions' ? `R$ ${(value as number / 100).toFixed(2)}` : value,
                    name === 'clicks' ? 'Cliques' : name === 'registrations' ? 'Cadastros' : 'Comissões'
                  ]}
                />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Comissões por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Comissões por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value) => [`R$ ${(value as number / 100).toFixed(2)}`, 'Comissões']}
                />
                <Bar dataKey="commissions" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top 5 Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.top_affiliates.map((affiliate, index) => (
              <div key={affiliate.ref_code} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{affiliate.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Código: <code className="bg-gray-100 px-1 rounded">{affiliate.ref_code}</code>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{affiliate.clicks}</div>
                    <div className="text-muted-foreground">Cliques</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{affiliate.registrations}</div>
                    <div className="text-muted-foreground">Cadastros</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">R$ {(affiliate.commissions / 100).toFixed(2)}</div>
                    <div className="text-muted-foreground">Comissões</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {((affiliate.registrations / affiliate.clicks) * 100).toFixed(1)}%
                    </Badge>
                    <div className="text-muted-foreground text-xs">Conversão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};