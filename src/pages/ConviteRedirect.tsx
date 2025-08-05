import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReferralTracking } from '@/hooks/useReferralTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ConviteRedirect = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackReferralClick } = useReferralTracking();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (codigo) {
      // Rastrear o clique imediatamente
      trackReferralClick(codigo, 'direct');
      
      if (user) {
        // Se já está logado, redirecionar para página principal
        toast.success('Você foi convidado! Explore nossa plataforma.');
        setTimeout(() => navigate('/'), 1500);
      }
    }
  }, [codigo, user, trackReferralClick, navigate]);

  const handleContinue = () => {
    setProcessing(true);
    
    if (user) {
      navigate('/');
    } else {
      navigate('/', { state: { showAuth: true } });
    }
  };

  if (!codigo) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <CardTitle className="text-2xl mb-2">🎉 Você foi convidado!</CardTitle>
            <p className="text-muted-foreground">
              Um amigo compartilhou nossa plataforma com você
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Acesso exclusivo a jogos e prêmios</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Bônus especiais para novos usuários</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sistema de recompensas exclusivo</span>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-primary">
              Código de Convite: <span className="font-mono">{codigo}</span>
            </p>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={processing}
          >
            {processing ? (
              "Processando..."
            ) : user ? (
              <>
                Explorar Plataforma
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Começar Agora
                <Users className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              Você será direcionado para criar sua conta ou fazer login
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConviteRedirect;