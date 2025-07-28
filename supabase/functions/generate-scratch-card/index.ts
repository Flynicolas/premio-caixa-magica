import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { scratchType, forcedWin = false } = await req.json()
    console.log('Generating scratch card for type:', scratchType, 'forcedWin:', forcedWin)

    // Mapear scratchType para chestType compatível
    const chestTypeMapping: { [key: string]: string } = {
      'sorte': 'silver',
      'dupla': 'gold', 
      'ouro': 'gold',
      'diamante': 'diamond',
      'premium': 'premium'
    }

    const mappedChestType = chestTypeMapping[scratchType] || 'silver'

    // Buscar probabilidades dos itens para este tipo de raspadinha
    const { data: probabilities, error: probError } = await supabase
      .from('scratch_card_probabilities')
      .select(`
        *,
        item:items(*)
      `)
      .eq('scratch_type', scratchType)
      .eq('is_active', true)

    if (probError) {
      console.error('Error fetching scratch probabilities:', probError)
      // Fallback para chest_item_probabilities se não houver dados específicos
      const { data: chestProbs, error: chestError } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          item:items(*)
        `)
        .eq('chest_type', mappedChestType)
        .eq('is_active', true)

      if (chestError) throw chestError
      
      // Converter para formato de scratch card
      const scratchProbs = chestProbs?.map(p => ({
        ...p,
        scratch_type: scratchType
      })) || []
      
      return generateFromProbabilities(scratchProbs, scratchType, forcedWin)
    }

    return generateFromProbabilities(probabilities || [], scratchType, forcedWin)

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateFromProbabilities(probabilities: any[], scratchType: string, forcedWin: boolean) {
  if (!probabilities.length) {
    return new Response(
      JSON.stringify({ 
        error: 'Nenhum item configurado para este tipo de raspadinha' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Criar lista ponderada de itens
  const weightedItems: any[] = []
  probabilities.forEach(prob => {
    if (prob.item) {
      for (let i = 0; i < prob.probability_weight; i++) {
        weightedItems.push(prob.item)
      }
    }
  })

  if (!weightedItems.length) {
    throw new Error('Nenhum item válido encontrado')
  }

  // Determinar se haverá vitória (30% de chance ou forçada)
  const willWin = forcedWin || Math.random() < 0.30

  // Gerar 9 símbolos para a grade 3x3
  const symbols: any[] = []
  let winningItem: any = null

  if (willWin) {
    // Selecionar item vencedor
    winningItem = weightedItems[Math.floor(Math.random() * weightedItems.length)]
    
    // Posições vencedoras (primeira linha, primeira coluna ou diagonal)
    const winningPositions = [0, 1, 2] // Primeira linha por simplicidade
    
    // Preencher posições vencedoras
    winningPositions.forEach(pos => {
      symbols[pos] = {
        id: `${pos}`,
        symbolId: winningItem.id,
        name: winningItem.name,
        image_url: winningItem.image_url,
        rarity: winningItem.rarity,
        base_value: winningItem.base_value,
        isWinning: true
      }
    })

    // Preencher posições restantes com itens diferentes
    for (let i = 3; i < 9; i++) {
      const availableItems = weightedItems.filter(item => item.id !== winningItem.id)
      const randomItem = availableItems.length > 0 
        ? availableItems[Math.floor(Math.random() * availableItems.length)]
        : weightedItems[Math.floor(Math.random() * weightedItems.length)]
      
      symbols[i] = {
        id: `${i}`,
        symbolId: randomItem.id,
        name: randomItem.name,
        image_url: randomItem.image_url,
        rarity: randomItem.rarity,
        base_value: randomItem.base_value,
        isWinning: false
      }
    }
  } else {
    // Sem vitória - garantir que não há 3 iguais
    for (let i = 0; i < 9; i++) {
      let selectedItem
      let attempts = 0
      
      do {
        selectedItem = weightedItems[Math.floor(Math.random() * weightedItems.length)]
        attempts++
      } while (attempts < 10 && shouldAvoidItem(symbols, selectedItem.id, i))
      
      symbols[i] = {
        id: `${i}`,
        symbolId: selectedItem.id,
        name: selectedItem.name,
        image_url: selectedItem.image_url,
        rarity: selectedItem.rarity,
        base_value: selectedItem.base_value,
        isWinning: false
      }
    }
  }

  const result = {
    symbols,
    winningItem,
    hasWin: willWin,
    scratchType
  }

  return new Response(
    JSON.stringify(result),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Função para evitar criar combinações vencedoras quando não deve haver vitória
function shouldAvoidItem(existingSymbols: any[], itemId: string, currentIndex: number): boolean {
  // Verificar se adicionar este item criaria 3 iguais em linha, coluna ou diagonal
  const tempSymbols = [...existingSymbols]
  tempSymbols[currentIndex] = { symbolId: itemId }
  
  // Verificar linhas
  for (let row = 0; row < 3; row++) {
    const start = row * 3
    const line = [tempSymbols[start], tempSymbols[start + 1], tempSymbols[start + 2]]
    if (line.every(s => s && s.symbolId === itemId)) {
      return true
    }
  }
  
  // Verificar colunas
  for (let col = 0; col < 3; col++) {
    const column = [tempSymbols[col], tempSymbols[col + 3], tempSymbols[col + 6]]
    if (column.every(s => s && s.symbolId === itemId)) {
      return true
    }
  }
  
  // Verificar diagonais
  const diagonal1 = [tempSymbols[0], tempSymbols[4], tempSymbols[8]]
  const diagonal2 = [tempSymbols[2], tempSymbols[4], tempSymbols[6]]
  
  if (diagonal1.every(s => s && s.symbolId === itemId) || 
      diagonal2.every(s => s && s.symbolId === itemId)) {
    return true
  }
  
  return false
}