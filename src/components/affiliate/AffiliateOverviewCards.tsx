import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  MousePointer, 
  TrendingUp,
  CheckCircle,
  Clock,
  Banknote
} from 'lucide-react';
import { AffiliateOverview, AffiliateMetrics } from '@/hooks/useAffiliates';
import { cn } from '@/lib/utils';

interface AffiliateOverviewCardsProps {
  overview: AffiliateOverview | null;
  metrics: AffiliateMetrics | null;
  className?: string;
}

export const AffiliateOverviewCards = ({ 
  overview, 
  metrics, 
  className 
}: AffiliateOverviewCardsProps) => {
  const formatCurrency = (centavos: number) => {
    return (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6", className)}>
      {/* Ganhos Totais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {overview ? formatCurrency(overview.total_gerado_cents) : 'R$ 0,00'}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Pago: {overview ? formatCurrency(overview.pago_cents) : 'R$ 0,00'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Comissões Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendente Aprovação</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {overview ? formatCurrency(overview.pendente_cents) : 'R$ 0,00'}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Banknote className="w-3 h-3 mr-1" />
              Aprovado: {overview ? formatCurrency(overview.aprovado_cents) : 'R$ 0,00'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Indicados Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Indicados</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {overview?.total_indicados || 0}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              💰 {metrics?.usuarios_depositaram || 0} depositaram
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance de Conversão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {metrics ? formatPercentage(metrics.taxa_conversao_cadastro) : '0%'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics?.cliques || 0} cliques → {metrics?.cadastros || 0} cadastros
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <MousePointer className="w-3 h-3 mr-1" />
              {metrics ? formatPercentage(metrics.taxa_conversao_deposito) : '0%'} para depósito
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards Expandidos em Mobile - Estatísticas Extras */}
      <div className="md:hidden col-span-1 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{metrics?.cliques || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {metrics ? formatCurrency(metrics.total_depositos * 100) : 'R$ 0,00'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};