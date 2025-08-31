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
import { Loader2, Save, Trash2, Plus } from 'lucide-react'

interface SystemLimit {
  id: string
  limit_type: string
  limit_value: number
  user_type: string
  is_active: boolean
}

export default function LimitsConfiguration() {
  const [limits, setLimits] = useState<SystemLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLimits()
  }, [])

  const loadLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('system_limits')
        .select('*')
        .order('limit_type', { ascending: true })

      if (error) throw error
      setLimits(data || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar limites",
        description: "Não foi possível carregar os limites do sistema.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLimit = async (id: string, updates: Partial<SystemLimit>) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('system_limits')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setLimits(prev => prev.map(limit => 
        limit.id === id ? { ...limit, ...updates } : limit
      ))

      toast({
        title: "Limite atualizado",
        description: "O limite foi atualizado com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o limite.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteLimit = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este limite?')) return

    try {
      const { error } = await supabase
        .from('system_limits')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLimits(prev => prev.filter(limit => limit.id !== id))
      
      toast({
        title: "Limite removido",
        description: "O limite foi removido com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o limite.",
        variant: "destructive"
      })
    }
  }

  const addNewLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('system_limits')
        .insert({
          limit_type: 'custom_limit',
          limit_value: 0,
          user_type: 'normal',
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setLimits(prev => [...prev, data])
      
      toast({
        title: "Novo limite criado",
        description: "Um novo limite foi adicionado à lista."
      })
    } catch (error) {
      toast({
        title: "Erro ao criar limite",
        description: "Não foi possível criar o novo limite.",
        variant: "destructive"
      })
    }
  }

  const getLimitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'daily_withdrawal': 'Saque Diário',
      'weekly_withdrawal': 'Saque Semanal',
      'monthly_withdrawal': 'Saque Mensal',
      'min_deposit': 'Depósito Mínimo',
      'max_deposit': 'Depósito Máximo',
      'custom_limit': 'Limite Personalizado'
    }
    return labels[type] || type
  }

  const getUserTypeBadge = (userType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'normal': 'default',
      'vip': 'secondary', 
      'admin': 'destructive'
    }
    
    return <Badge variant={variants[userType] || 'outline'}>{userType.toUpperCase()}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações de limites...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Limites</h1>
          <p className="text-muted-foreground">
            Gerencie limites de saque, depósitos e valores por tipo de usuário
          </p>
        </div>
        <Button onClick={addNewLimit} disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Limite
        </Button>
      </div>

      <div className="grid gap-4">
        {limits.map((limit) => (
          <Card key={limit.id}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {getLimitTypeLabel(limit.limit_type)}
                  </CardTitle>
                  <CardDescription>
                    Limite para usuários {getUserTypeBadge(limit.user_type)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={limit.is_active}
                    onCheckedChange={(checked) => 
                      updateLimit(limit.id, { is_active: checked })
                    }
                    disabled={saving}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteLimit(limit.id)}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo do Limite</Label>
                  <Select
                    value={limit.limit_type}
                    onValueChange={(value) => 
                      updateLimit(limit.id, { limit_type: value })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily_withdrawal">Saque Diário</SelectItem>
                      <SelectItem value="weekly_withdrawal">Saque Semanal</SelectItem>
                      <SelectItem value="monthly_withdrawal">Saque Mensal</SelectItem>
                      <SelectItem value="min_deposit">Depósito Mínimo</SelectItem>
                      <SelectItem value="max_deposit">Depósito Máximo</SelectItem>
                      <SelectItem value="custom_limit">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={limit.limit_value}
                    onChange={(e) => 
                      updateLimit(limit.id, { limit_value: parseFloat(e.target.value) || 0 })
                    }
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label>Tipo de Usuário</Label>
                  <Select
                    value={limit.user_type}
                    onValueChange={(value) => 
                      updateLimit(limit.id, { user_type: value })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {limits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum limite configurado. Clique em "Novo Limite" para adicionar o primeiro.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}