import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Save, DollarSign, Percent } from 'lucide-react'

interface PaymentConfig {
  id: string
  config_key: string
  config_value: string
  config_type: string
  category: string
  description: string
  is_active: boolean
}

export default function PaymentConfiguration() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setConfigs(data || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações de pagamento.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (id: string, updates: Partial<PaymentConfig>) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('payment_configurations')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setConfigs(prev => prev.map(config => 
        config.id === id ? { ...config, ...updates } : config
      ))

      toast({
        title: "Configuração atualizada",
        description: "A configuração foi atualizada com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'deposit': 'default',
      'withdrawal': 'secondary',
      'commission': 'destructive',
      'bonus': 'outline'
    }
    
    const labels: Record<string, string> = {
      'deposit': 'Depósito',
      'withdrawal': 'Saque',
      'commission': 'Comissão',
      'bonus': 'Bônus'
    }

    return (
      <Badge variant={variants[category] || 'outline'}>
        {labels[category] || category}
      </Badge>
    )
  }

  const getConfigIcon = (key: string) => {
    if (key.includes('percentage') || key.includes('commission')) {
      return <Percent className="h-4 w-4" />
    }
    return <DollarSign className="h-4 w-4" />
  }

  const formatValue = (value: string, type: string) => {
    if (type === 'number') {
      const num = parseFloat(value)
      if (value.includes('percentage') || value.includes('commission')) {
        return `${(num * 100).toFixed(2)}%`
      }
      return `R$ ${num.toFixed(2)}`
    }
    return value
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, PaymentConfig[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações de pagamento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Pagamento</h1>
        <p className="text-muted-foreground">
          Gerencie valores, taxas e comissões do sistema de pagamento
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  Configurações de {category.charAt(0).toUpperCase() + category.slice(1)}
                </CardTitle>
                {getCategoryBadge(category)}
              </div>
              <CardDescription>
                Configurações relacionadas a {category === 'deposit' ? 'depósitos' : 
                                           category === 'withdrawal' ? 'saques' : 
                                           category === 'commission' ? 'comissões' : 'bônus'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categoryConfigs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getConfigIcon(config.config_key)}
                      <div>
                        <div className="font-medium">{config.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.config_key}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Valor atual: {formatValue(config.config_value, config.config_type)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Input
                          type={config.config_type === 'number' ? 'number' : 'text'}
                          step={config.config_type === 'number' ? '0.01' : undefined}
                          value={config.config_value}
                          onChange={(e) => 
                            updateConfig(config.id, { config_value: e.target.value })
                          }
                          disabled={saving}
                          className="text-right"
                        />
                      </div>
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(checked) => 
                          updateConfig(config.id, { is_active: checked })
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma configuração encontrada. As configurações padrão foram carregadas automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li>• Comissões são valores decimais (0.05 = 5%)</li>
            <li>• Alterações são aplicadas imediatamente</li>
            <li>• Configurações inativas não são aplicadas no sistema</li>
            <li>• O sistema PIX SUITPAY permanece como método principal</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}