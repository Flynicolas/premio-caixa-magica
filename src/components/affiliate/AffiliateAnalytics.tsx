import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { AffiliateOverview, AffiliateMetrics, AffiliateCommission } from '@/hooks/useAffiliates';

interface AffiliateAnalyticsProps {
  overview: AffiliateOverview | null;
  metrics: AffiliateMetrics | null;
  commissions: AffiliateCommission[];
}

export const AffiliateAnalytics = ({ overview, metrics, commissions }: AffiliateAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Detalhado
        </CardTitle>
        <CardDescription>
          Análise completa da sua performance como afiliado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Analytics detalhado em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
};