import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export const SecurityBanner = () => {
  return (
    <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
      <Shield className="h-4 w-4 text-orange-500" />
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        <strong>Segurança:</strong> Nunca compartilhe comprovantes de pagamento com terceiros. 
        Nossa equipe nunca solicitará senhas ou dados pessoais por telefone ou email.
      </AlertDescription>
    </Alert>
  );
};