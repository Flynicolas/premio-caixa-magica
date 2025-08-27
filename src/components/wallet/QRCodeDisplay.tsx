import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTransactionPolling } from '@/hooks/useTransactionPolling';
import { useNavigate } from 'react-router-dom';
import { Copy, Clock, CheckCircle, XCircle, RefreshCw, Home } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: string;
  pixCode: string;
  amount: number;
  paymentId: string;
  expiresAt: string;
}

export const QRCodeDisplay = ({ 
  qrCode, 
  pixCode, 
  amount, 
  paymentId, 
  expiresAt 
}: QRCodeDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [buttonTimer, setButtonTimer] = useState<number>(40);
  const [canConfirmPayment, setCanConfirmPayment] = useState(false);
  const [confirmationCountdown, setConfirmationCountdown] = useState<number>(60);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { status, isPolling } = useTransactionPolling(paymentId);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const difference = expiry - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // Timer para o botão "Já realizei o pagamento"
  useEffect(() => {
    // Timer de 40 segundos para o botão aparecer
    const buttonTimerInterval = setInterval(() => {
      setButtonTimer((prev) => {
        if (prev <= 1) {
          clearInterval(buttonTimerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Countdown de 60 segundos para liberar a funcionalidade do botão
    const confirmationCountdownInterval = setInterval(() => {
      setConfirmationCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(confirmationCountdownInterval);
          setCanConfirmPayment(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(buttonTimerInterval);
      clearInterval(confirmationCountdownInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no seu aplicativo bancário para pagar",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente",
        variant: "destructive"
      });
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500 text-white">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Processando
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando
          </Badge>
        );
    }
  };

  const handleConfirmPayment = () => {
    toast({
      title: "Redirecionando...",
      description: "Você será direcionado para a tela inicial",
    });
    navigate('/');
  };

  if (status === 'paid') {
    return (
      <Card className="p-6 text-center bg-green-50 border-green-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-700 mb-2">
          Pagamento Confirmado!
        </h3>
        <p className="text-green-600">
          Seu saldo de R$ {amount.toFixed(2)} foi adicionado à carteira
        </p>
      </Card>
    );
  }

  if (status === 'expired' || timeLeft <= 0) {
    return (
      <Card className="p-6 text-center bg-red-50 border-red-200">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700 mb-2">
          PIX Expirado
        </h3>
        <p className="text-red-600 mb-4">
          Este código PIX expirou. Gere um novo para continuar.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Gerar Novo PIX
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status e Timer */}
      <Card className="p-4 bg-secondary/20 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {getStatusDisplay()}
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </Card>

      {/* QR Code */}
      <Card className="p-6 text-center bg-white">
        <h3 className="text-lg font-semibold mb-4">
          Escaneie o QR Code
        </h3>
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg shadow-inner">
            {qrCode.startsWith('data:image') ? (
              <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Abra o aplicativo do seu banco e escaneie o código
        </p>
      </Card>

      {/* PIX Copia e Cola */}
      <Card className="p-4 bg-secondary/20 border-primary/20">
        <h4 className="font-medium mb-3">PIX Copia e Cola</h4>
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-muted rounded border text-xs font-mono break-all">
            {pixCode}
          </div>
          <Button
            onClick={copyPixCode}
            variant="outline"
            size="sm"
            className={copied ? "bg-green-500 text-white" : ""}
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Cole este código no seu aplicativo bancário na opção PIX
        </p>
      </Card>

      {/* Instruções */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Instruções:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pague o valor exato: R$ {amount.toFixed(2)}</li>
          <li>• Não feche esta tela até confirmar o pagamento</li>
          <li>• O saldo será adicionado automaticamente</li>
          <li>• Em caso de dúvidas, entre em contato conosco</li>
        </ul>
      </Card>

      {/* Botão "Já realizei o pagamento" */}
      {buttonTimer <= 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <h4 className="font-medium text-blue-800 mb-3">
              Já realizou o pagamento?
            </h4>
            {!canConfirmPayment ? (
              <div className="space-y-3">
                <p className="text-sm text-blue-600">
                  Aguarde mais alguns segundos para confirmar...
                </p>
                <div className="text-2xl font-mono text-blue-700">
                  {confirmationCountdown}s
                </div>
              </div>
            ) : (
              <Button
                onClick={handleConfirmPayment}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Já realizei o pagamento
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};