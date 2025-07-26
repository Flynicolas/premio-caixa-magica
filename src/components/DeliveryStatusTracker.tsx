import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

interface DeliveryStatusTrackerProps {
  status: string;
  description?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const DeliveryStatusTracker = ({ 
  status, 
  description, 
  showIcon = true, 
  size = 'default' 
}: DeliveryStatusTrackerProps) => {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aguardando_envio':
        return {
          label: 'Aguardando Envio',
          description: description || 'Item resgatado, aguardando envio',
          color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
          icon: <Clock className="w-4 h-4" />
        };
      case 'a_caminho':
        return {
          label: 'A Caminho',
          description: description || 'Item enviado, a caminho do destino',
          color: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
          icon: <Truck className="w-4 h-4" />
        };
      case 'entregue':
        return {
          label: 'Entregue',
          description: description || 'Item entregue com sucesso',
          color: 'bg-green-500/20 text-green-700 border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          description: description || 'Entrega cancelada',
          color: 'bg-red-500/20 text-red-700 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'pending':
        return {
          label: 'Pagamento Pendente',
          description: description || 'Aguardando confirmação do pagamento',
          color: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
          icon: <Clock className="w-4 h-4" />
        };
      case 'paid':
        return {
          label: 'Pago',
          description: description || 'Pagamento confirmado, aguardando aprovação',
          color: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
          icon: <Package className="w-4 h-4" />
        };
      case 'aprovado':
        return {
          label: 'Aprovado',
          description: description || 'Pedido aprovado, preparando envio',
          color: 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30',
          icon: <Package className="w-4 h-4" />
        };
      case 'enviado':
        return {
          label: 'Enviado',
          description: description || 'Item despachado para entrega',
          color: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
          icon: <Truck className="w-4 h-4" />
        };
      default:
        return {
          label: status,
          description: description || 'Status indeterminado',
          color: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
          icon: <Package className="w-4 h-4" />
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        className={`${config.color} ${sizeClasses[size]} flex items-center gap-2 w-fit`}
      >
        {showIcon && config.icon}
        {config.label}
      </Badge>
      {description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  );
};

export default DeliveryStatusTracker;