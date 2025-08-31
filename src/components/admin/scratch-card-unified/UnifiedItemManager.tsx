import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Search, Package, Trash2, TrendingUp, Settings2, Calculator, RefreshCw, Target, Eye, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useItemManagement } from '@/hooks/useItemManagement'
import { useAutoWeightCalculator } from '@/hooks/useAutoWeightCalculator'
import { scratchCardTypes } from '@/types/scratchCard'

interface ScratchCardProbability {
  id: string
  scratch_type: string
  item_id: string
  probability_weight: number
  min_quantity: number
  max_quantity: number
  is_active: boolean
  item: {
    id: string
    name: string
    image_url?: string
    category: string
    rarity: string
    base_value: number
  } | null
}

export const UnifiedItemManager: React.FC = () => {
  const { items } = useItemManagement()
  const [selectedScratchType, setSelectedScratchType] = useState<string>('pix')
  const [scratchTypes, setScratchTypes] = useState<string[]>([])
  const [configuredItems, setConfiguredItems] = useState<ScratchCardProbability[]>([])
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<string>('')

  const { 
    updating, 
    applyAutoWeightsToScratchCards,
    getWeightRecommendation
  } = useAutoWeightCalculator()

  // Carregar tipos de raspadinha
  const loadScratchTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_card_settings')
        .select('scratch_type, name')
        .eq('is_active', true)
        .order('scratch_type')

      if (error) throw error

      const types = data?.map(s => s.scratch_type) || Object.keys(scratchCardTypes)
      setScratchTypes(types)

      if (types.length > 0 && !selectedScratchType) {
        setSelectedScratchType(types[0])
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de raspadinha:', error)
      toast.error('Erro ao carregar tipos de raspadinha')
      // Fallback para tipos hardcoded
      const types = Object.keys(scratchCardTypes)
      setScratchTypes(types)
      setSelectedScratchType(types[0])
    }
  }

  // Carregar itens configurados para a raspadinha selecionada
  const loadConfiguredItems = async () => {
    if (!selectedScratchType) return

    try {
      const { data, error } = await supabase
        .from('scratch_card_probabilities')
        .select('*')
        .eq('scratch_type', selectedScratchType)
        .eq('is_active', true)
        .order('probability_weight', { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map((prob: any) => ({
        ...prob,
        item: items.find((it) => it.id === prob.item_id) || null
      }))

      setConfiguredItems(formattedData)
    } catch (error) {
      console.error('Erro ao carregar itens configurados:', error)
      toast.error('Erro ao carregar itens configurados')
    }
  }

  // Adicionar item à raspadinha
  const addItemToScratch = async (itemId: string) => {
    if (!selectedScratchType) return

    // Verificar se já existe
    const exists = configuredItems.some(config => config.item_id === itemId)
    if (exists) {
      toast.error('Item já está configurado nesta raspadinha')
      return
    }

    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .insert({
          scratch_type: selectedScratchType,
          item_id: itemId,
          probability_weight: 1,
          min_quantity: 1,
          max_quantity: 1,
          is_active: true
        })

      if (error) throw error

      toast.success('Item adicionado à raspadinha')
      await loadConfiguredItems()
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      toast.error('Erro ao adicionar item')
    }
  }

  // Atualizar configuração do item
  const updateItemConfig = async (configId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ [field]: value })
        .eq('id', configId)

      if (error) throw error

      // Atualizar estado local
      setConfiguredItems(prev => prev.map(config => 
        config.id === configId ? { ...config, [field]: value } : config
      ))

      toast.success('Configuração atualizada')
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao atualizar configuração')
    }
  }

  // Lidar com mudanças de peso (versão local/temporária)
  const handleWeightChange = (probId: string, weight: number) => {
    setEditingWeights(prev => ({
      ...prev,
      [probId]: Math.max(0, weight)
    }))
  }

  // Salvar todas as mudanças de peso
  const saveWeightChanges = async () => {
    if (Object.keys(editingWeights).length === 0) return
    
    setSaving(true)
    try {
      const updates = Object.entries(editingWeights).map(([probId, weight]) => 
        supabase
          .from('scratch_card_probabilities')
          .update({ probability_weight: weight })
          .eq('id', probId)
      )

      await Promise.all(updates)

      toast.success('Pesos atualizados com sucesso!')
      setEditingWeights({})
      await loadConfiguredItems()
    } catch (error: any) {
      console.error('Erro ao salvar pesos:', error)
      toast.error('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  // Remover item da raspadinha
  const removeItemFromScratch = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('scratch_card_probabilities')
        .update({ is_active: false })
        .eq('id', configId)

      if (error) throw error

      toast.success('Item removido da raspadinha')
      await loadConfiguredItems()
    } catch (error) {
      console.error('Erro ao remover item:', error)
      toast.error('Erro ao remover item')
    }
  }

  // Aplicar pesos automáticos
  const handleApplyAutoWeights = async () => {
    const success = await applyAutoWeightsToScratchCards()
    if (success) {
      await loadConfiguredItems()
      setEditingWeights({})
    }
  }

  // Filtrar itens disponíveis
  const availableItems = items.filter(item => {
    // Não mostrar itens já configurados
    const isConfigured = configuredItems.some(config => config.item_id === item.id)
    if (isConfigured) return false

    // Filtros de busca
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter

    return matchesSearch && matchesCategory && matchesRarity
  })

  // Estatísticas
  const getStats = () => {
    const drawable = configuredItems.filter(config => {
      const weight = editingWeights[config.id] ?? config.probability_weight
      return weight > 0 && config.is_active
    })
    const visual = configuredItems.filter(config => {
      const weight = editingWeights[config.id] ?? config.probability_weight
      return weight === 0 && config.is_active
    })
    const totalWeight = configuredItems.reduce((sum, config) => {
      const weight = editingWeights[config.id] ?? config.probability_weight
      return sum + (config.is_active ? weight : 0)
    }, 0)

    return {
      total: configuredItems.length,
      drawable: drawable.length,
      visual: visual.length,
      totalWeight,
      hasDrawable: drawable.length > 0
    }
  }

  const stats = getStats()
  const hasWeightChanges = Object.keys(editingWeights).length > 0

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      rare: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      epic: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      legendary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      dinheiro: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      money: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      product: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      electronics: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      gift: 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  useEffect(() => {
    loadScratchTypes()
  }, [])

  useEffect(() => {
    if (selectedScratchType) {
      loadConfiguredItems()
    }
    setLoading(false)
  }, [selectedScratchType, items])

  if (loading && scratchTypes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Gestão Unificada de Itens & Probabilidades
          </h2>
          <p className="text-muted-foreground">
            Interface consolidada para gerenciar itens e suas probabilidades em raspadinhas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleApplyAutoWeights}
            disabled={updating || loading}
            variant="outline"
            className="gap-2"
          >
            {updating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {updating ? 'Aplicando...' : 'Pesos Automáticos (90/10)'}
          </Button>
          
          {hasWeightChanges && (
            <Button 
              onClick={saveWeightChanges}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings2 className="w-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          )}
        </div>
      </div>

      {/* Seletor de tipo de raspadinha */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipo de Raspadinha</CardTitle>
            <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione uma raspadinha" />
              </SelectTrigger>
              <SelectContent>
                {scratchTypes.map(type => {
                  const config = scratchCardTypes[type as keyof typeof scratchCardTypes]
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {config && <span className={`w-3 h-3 rounded-full ${config.bgColor}`} />}
                        {config?.name || type} - R$ {config?.price.toFixed(2) || '0.00'}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {selectedScratchType && (
        <>
          {/* Status e alertas */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Sorteáveis</p>
                    <p className="text-2xl font-bold text-green-600">{stats.drawable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Visuais</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.visual}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Peso Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalWeight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Total Itens</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {!stats.hasDrawable && stats.total > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Todos os itens estão com peso 0 (apenas visuais). Ninguém pode ganhar!
              </AlertDescription>
            </Alert>
          )}

          {updating && (
            <Alert>
              <Calculator className="w-4 h-4" />
              <AlertDescription>
                Aplicando sistema 90/10: pesos automáticos baseados no valor dos itens...
              </AlertDescription>
            </Alert>
          )}

          {/* Layout principal com dois painéis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Painel esquerdo - Catálogo de itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catálogo de Itens Disponíveis</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar itens..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="electronics">Eletrônicos</SelectItem>
                      <SelectItem value="gift">Presentes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="common">Comum</SelectItem>
                      <SelectItem value="rare">Raro</SelectItem>
                      <SelectItem value="epic">Épico</SelectItem>
                      <SelectItem value="legendary">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            <Badge className={getRarityColor(item.rarity)}>
                              {item.rarity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              R$ {item.base_value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addItemToScratch(item.id)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                  {availableItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item disponível</p>
                      <p className="text-sm">Todos os itens já foram adicionados ou não há itens que correspondam aos filtros</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Painel direito - Itens configurados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens Configurados</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {configuredItems.length} itens • {stats.drawable} sorteáveis • {stats.visual} visuais
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {configuredItems.map(config => {
                    const currentWeight = editingWeights[config.id] ?? config.probability_weight
                    const isVisual = currentWeight === 0
                    const probabilityPercent = stats.totalWeight > 0 ? 
                      ((currentWeight / stats.totalWeight) * 100).toFixed(2) : '0.00'
                    
                    return (
                      <div key={config.id} className={`border rounded-lg p-4 space-y-3 ${isVisual ? 'bg-gray-50 dark:bg-gray-900' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {config.item?.image_url && (
                              <img 
                                src={config.item.image_url} 
                                alt={config.item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{config.item?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getCategoryColor(config.item?.category || '')}>
                                  {config.item?.category}
                                </Badge>
                                <Badge variant={isVisual ? "secondary" : "default"}>
                                  {isVisual ? 'Visual' : 'Sorteável'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  R$ {config.item?.base_value.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.is_active}
                              onCheckedChange={(checked) => updateItemConfig(config.id, 'is_active', checked)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItemFromScratch(config.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Peso</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={currentWeight}
                              onChange={(e) => handleWeightChange(config.id, parseFloat(e.target.value) || 0)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Min</label>
                            <Input
                              type="number"
                              value={config.min_quantity}
                              onChange={(e) => updateItemConfig(config.id, 'min_quantity', parseInt(e.target.value) || 0)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Max</label>
                            <Input
                              type="number"
                              value={config.max_quantity}
                              onChange={(e) => updateItemConfig(config.id, 'max_quantity', parseInt(e.target.value) || 0)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="text-xs text-muted-foreground">
                              {probabilityPercent}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {configuredItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum item configurado</p>
                      <p className="text-sm">Adicione itens usando o catálogo à esquerda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}