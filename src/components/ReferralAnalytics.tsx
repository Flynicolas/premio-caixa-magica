import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, Activity } from 'lucide-react';

interface ReferralAnalyticsProps {
  referralStats: any[];
  totalStats: {
    clicks: number;
    registrations: number;
    deposits: number;
    totalAmount: number;
  };
  conversionRate: string;
}

const ReferralAnalytics = ({ referralStats, totalStats, conversionRate }: ReferralAnalyticsProps) => {
  const last7Days = referralStats.slice(0, 7);
  const previous7Days = referralStats.slice(7, 14);
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100);
  };

  const currentWeekClicks = last7Days.reduce((sum, day) => sum + day.clicks, 0);
  const previousWeekClicks = previous7Days.reduce((sum, day) => sum + day.clicks, 0);
  const clicksGrowth = calculateGrowth(currentWeekClicks, previousWeekClicks);

  const currentWeekRegistrations = last7Days.reduce((sum, day) => sum + day.registrations, 0);
  const previousWeekRegistrations = previous7Days.reduce((sum, day) => sum + day.registrations, 0);
  const registrationsGrowth = calculateGrowth(currentWeekRegistrations, previousWeekRegistrations);

  const getBestPerformingDay = () => {
    if (last7Days.length === 0) return null;
    
    return last7Days.reduce((best, current) => {
      const currentScore = current.clicks + (current.registrations * 2) + (current.first_deposits * 3);
      const bestScore = best.clicks + (best.registrations * 2) + (best.first_deposits * 3);
      return currentScore > bestScore ? current : best;
    });
  };

  const bestDay = getBestPerformingDay();

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Desempenho Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Últimos 7 Dias</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Cliques:</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{currentWeekClicks}</span>
              {getGrowthIcon(clicksGrowth)}
              <span className={`text-xs ${getGrowthColor(clicksGrowth)}`}>
                {Math.abs(clicksGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Cadastros:</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{currentWeekRegistrations}</span>
              {getGrowthIcon(registrationsGrowth)}
              <span className={`text-xs ${getGrowthColor(registrationsGrowth)}`}>
                {Math.abs(registrationsGrowth).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa Conversão:</span>
            <Badge variant="secondary">
              {currentWeekClicks > 0 ? ((currentWeekRegistrations / currentWeekClicks) * 100).toFixed(1) : '0'}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Melhor Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Melhor Desempenho</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestDay ? (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-lg font-bold">
                  {new Date(bestDay.date).toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Melhor dia da semana</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{bestDay.clicks}</p>
                  <p className="text-xs text-muted-foreground">Cliques</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{bestDay.registrations}</p>
                  <p className="text-xs text-muted-foreground">Cadastros</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{bestDay.first_deposits}</p>
                  <p className="text-xs text-muted-foreground">Depósitos</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Resumo Total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{totalStats.clicks}</p>
              <p className="text-xs text-muted-foreground">Total Cliques</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalStats.registrations}</p>
              <p className="text-xs text-muted-foreground">Total Cadastros</p>
            </div>
          </div>

          <div className="text-center pt-2 border-t">
            <p className="text-lg font-bold">{conversionRate}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Conversão Geral</p>
          </div>

          {totalStats.totalAmount > 0 && (
            <div className="text-center pt-2 border-t">
              <p className="text-lg font-bold text-yellow-600">
                R$ {totalStats.totalAmount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Volume Gerado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralAnalytics;