import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  QrCode, 
  Share2, 
  ExternalLink,
  MessageCircle,
  Send
} from 'lucide-react';
import { AffiliateData } from '@/hooks/useAffiliates';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';

interface AffiliateReferralLinkProps {
  affiliateData: AffiliateData | null;
}

export const AffiliateReferralLink = ({ affiliateData }: AffiliateReferralLinkProps) => {
  const { copyReferralLink, shareOnWhatsApp, shareOnTelegram, generateReferralLink } = useAffiliates();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);

  if (!affiliateData) return null;

  const baseLink = generateReferralLink();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseLink)}`;

  const handleCopyLink = () => {
    copyReferralLink();
  };

  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const message = `🎯 Venha jogar no Baú Premiado e ganhe prêmios incríveis!\n\n💰 Raspadinhas, baús e muito mais esperando por você!\n\n🎁 Use meu link especial: ${baseLink}`;
    
    if (platform === 'whatsapp') {
      shareOnWhatsApp(message);
    } else {
      shareOnTelegram(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Link Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Seu Link de Afiliado
          </CardTitle>
          <CardDescription>
            Compartilhe este link para ganhar comissões com cada jogador que se cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={baseLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} size="sm">
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="text-green-600 hover:text-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleShare('telegram')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Telegram
            </Button>
          </div>

          {showQR && (
            <div className="text-center py-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Code do link de afiliado"
                className="mx-auto border rounded-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Escaneie para acessar seu link de afiliado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Código */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código de Referência</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                  {affiliateData.ref_code}
                </code>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge 
                  variant={
                    affiliateData.status === 'approved' ? 'default' :
                    affiliateData.status === 'pending' ? 'secondary' : 'destructive'
                  }
                >
                  {affiliateData.status === 'approved' ? '✅ Aprovado' :
                   affiliateData.status === 'pending' ? '⏳ Pendente' : '❌ Bloqueado'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Como Funciona</label>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-0.5">1</div>
                <p>Compartilhe seu link único em redes sociais, grupos ou com amigos</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-0.5">2</div>
                <p>Quando alguém se cadastrar pelo seu link, você ganha uma comissão</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-0.5">3</div>
                <p>Continue ganhando conforme seus indicados jogam e depositam</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates para Compartilhar</CardTitle>
          <CardDescription>
            Use essas mensagens prontas para compartilhar seu link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="p-3 bg-muted/50 rounded border-l-4 border-primary">
              <p className="text-sm font-medium mb-2">🎲 Mensagem Casual</p>
              <p className="text-sm italic">
                "Pessoal, descobri um site incrível de jogos onde já ganhei vários prêmios! 
                Quem quiser se divertir também: {baseLink} 🎁"
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => copyReferralLink()}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded border-l-4 border-green-500">
              <p className="text-sm font-medium mb-2">💰 Mensagem com Benefícios</p>
              <p className="text-sm italic">
                "🚀 Venha jogar no Baú Premiado! Raspadinhas, baús misteriosos e prêmios reais te esperando! 
                Cadastre-se pelo meu link: {baseLink} 🎯"
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => copyReferralLink()}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded border-l-4 border-blue-500">
              <p className="text-sm font-medium mb-2">🎁 Mensagem de Convite</p>
              <p className="text-sm italic">
                "Te convido para um site de jogos super legal! Já saquei alguns prêmios e é bem confiável 😄 
                Vem comigo: {baseLink}"
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => copyReferralLink()}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};