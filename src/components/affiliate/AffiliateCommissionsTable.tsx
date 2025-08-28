import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { AffiliateCommission } from '@/hooks/useAffiliates';

interface AffiliateCommissionsTableProps {
  commissions: AffiliateCommission[];
}

export const AffiliateCommissionsTable = ({ commissions }: AffiliateCommissionsTableProps) => {
  const formatCurrency = (centavos: number) => {
    return (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Histórico de Comissões
        </CardTitle>
        <CardDescription>
          Acompanhe todas as suas comissões geradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma comissão encontrada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {commissions.slice(0, 10).map((commission) => (
              <div key={commission.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">
                    {formatCurrency(commission.amount_cents)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {commission.kind.toUpperCase()} - Nível {commission.level}
                  </div>
                </div>
                <Badge variant={
                  commission.status === 'paid' ? 'default' :
                  commission.status === 'approved' ? 'secondary' : 'outline'
                }>
                  {commission.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};