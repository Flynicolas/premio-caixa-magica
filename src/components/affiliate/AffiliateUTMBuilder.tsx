import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { AffiliateData } from '@/hooks/useAffiliates';

interface AffiliateUTMBuilderProps {
  affiliateData: AffiliateData | null;
}

export const AffiliateUTMBuilder = ({ affiliateData }: AffiliateUTMBuilderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Construtor de Links UTM
        </CardTitle>
        <CardDescription>
          Crie links personalizados para rastrear suas campanhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Construtor de UTM em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
};