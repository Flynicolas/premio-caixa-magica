import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { AffiliateAsset } from '@/hooks/useAffiliates';

interface AffiliateMarketingMaterialsProps {
  assets: AffiliateAsset[];
}

export const AffiliateMarketingMaterials = ({ assets }: AffiliateMarketingMaterialsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Materiais de Marketing
        </CardTitle>
        <CardDescription>
          Banners, imagens e materiais para suas campanhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Materiais de marketing em breve...
        </p>
      </CardContent>
    </Card>
  );
};