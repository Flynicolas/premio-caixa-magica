import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Zap, CreditCard, Building2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface PaymentGateway {
  id: string
  gateway_name: string
  gateway_type: string
  is_active: boolean
  is_primary: boolean
  priority: number
  configuration: any
  api_credentials: any
}

export default function GatewayManager() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('priority', { ascending: true })

      if (error) throw error
      setGateways(data || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar gateways",
        description: "Não foi possível carregar os gateways de pagamento.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateGateway = async (id: string, updates: Partial<PaymentGateway>) => {
    setUpdating(true)
    try {
      // Se estamos definindo como primário, remover primário dos outros
      if (updates.is_primary === true) {
        await supabase
          .from('payment_gateways')
          .update({ is_primary: false })
          .neq('id', id)
      }

      const { error } = await supabase
        .from('payment_gateways')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Recarregar para garantir consistência
      await loadGateways()

      toast({
        title: "Gateway atualizado",
        description: "As configurações do gateway foram atualizadas com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar gateway",
        description: "Não foi possível atualizar o gateway de pagamento.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const getGatewayIcon = (gatewayName: string, gatewayType: string) => {
    if (gatewayName === 'suitpay' || gatewayType === 'pix') {
      return <Zap className="h-5 w-5" />
    }
    if (gatewayName === 'mercadopago' || gatewayType === 'card') {
      return <CreditCard className="h-5 w-5" />
    }
    return <Building2 className="h-5 w-5" />
  }

  const getStatusBadge = (gateway: PaymentGateway) => {
    if (gateway.is_active && gateway.is_primary) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo (Principal)
        </Badge>
      )
    }
    if (gateway.is_active) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  const getGatewayDescription = (gateway: PaymentGateway) => {
    if (gateway.gateway_name === 'suitpay') {
      return {
        name: 'SUITPAY PIX',
        description: 'Gateway principal para pagamentos PIX via SUITPAY',
        status: 'Funcionando normalmente',
        statusColor: 'text-green-600'
      }
    }
    if (gateway.gateway_name === 'mercadopago') {
      return {
        name: 'MercadoPago',
        description: 'Gateway de backup para cartões de crédito/débito',
        status: 'Standby para emergência',
        statusColor: 'text-yellow-600'
      }
    }
    return {
      name: gateway.gateway_name.toUpperCase(),
      description: `Gateway do tipo ${gateway.gateway_type}`,
      status: gateway.is_active ? 'Ativo' : 'Inativo',
      statusColor: gateway.is_active ? 'text-green-600' : 'text-red-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando gateways de pagamento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Gateways</h1>
        <p className="text-muted-foreground">
          Configure e monitore os provedores de pagamento do sistema
        </p>
      </div>

      <div className="grid gap-4">
        {gateways.map((gateway) => {
          const info = getGatewayDescription(gateway)
          return (
            <Card key={gateway.id} className={gateway.is_primary ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getGatewayIcon(gateway.gateway_name, gateway.gateway_type)}
                    <div>
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(gateway)}
                    {gateway.is_primary && (
                      <Badge variant="default">Principal</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`text-sm font-medium ${info.statusColor}`}>
                        {info.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Prioridade:</span>
                      <span className="text-sm font-medium">#{gateway.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <Badge variant="outline">{gateway.gateway_type.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Principal:</span>
                      <Switch
                        checked={gateway.is_primary}
                        onCheckedChange={(checked) => 
                          updateGateway(gateway.id, { is_primary: checked })
                        }
                        disabled={updating}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Ativo:</span>
                      <Switch
                        checked={gateway.is_active}
                        onCheckedChange={(checked) => 
                          updateGateway(gateway.id, { is_active: checked })
                        }
                        disabled={updating}
                      />
                    </div>
                    <Select
                      value={gateway.priority.toString()}
                      onValueChange={(value) => 
                        updateGateway(gateway.id, { priority: parseInt(value) })
                      }
                      disabled={updating}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-sm text-yellow-800">Aviso Importante</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700">
          <ul className="space-y-1">
            <li>• SUITPAY PIX é o gateway principal e deve permanecer ativo</li>
            <li>• MercadoPago está configurado como backup para emergências</li>
            <li>• Apenas um gateway pode ser definido como principal</li>
            <li>• Alterações são aplicadas imediatamente no sistema</li>
            <li>• Desativar o gateway principal pode interromper os pagamentos</li>
          </ul>
        </CardContent>
      </Card>

      {gateways.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum gateway configurado. Os gateways padrão foram inseridos automaticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}