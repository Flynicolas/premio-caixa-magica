import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { scratchType, forcedWin = false } = await req.json()
    
    console.log(`Generating scratch card for type: ${scratchType}, forcedWin: ${forcedWin}`)

    // Check financial control for 90/10 system
    const { data: financialData, error: financialError } = await supabase
      .from('scratch_card_financial_control')
      .select('*')
      .eq('scratch_type', scratchType)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()

    if (financialError && financialError.code !== 'PGRST116') {
      console.error('Error fetching financial data:', financialError)
    }

    // Calculate if we should force a win based on 90/10 rule
    let shouldWin = forcedWin
    if (!forcedWin && financialData) {
      const totalSales = financialData.total_sales || 0
      const totalPrizes = financialData.total_prizes_given || 0
      const currentMargin = totalSales > 0 ? ((totalSales - totalPrizes) / totalSales) * 100 : 100
      
      // If margin is above 95%, increase win chance
      // If margin is below 85%, decrease win chance
      let winProbability = 0.1 // Base 10% for 90/10 system
      
      if (currentMargin > 95) {
        winProbability = 0.25 // Increase to 25%
      } else if (currentMargin < 85) {
        winProbability = 0.05 // Decrease to 5%
      }
      
      shouldWin = Math.random() < winProbability
    }

    console.log(`Win decision: ${shouldWin}`)

    // Fetch probabilities for this scratch type
    const { data: probabilities, error: probError } = await supabase
      .from('scratch_card_probabilities')
      .select(`
        *,
        items (*)
      `)
      .eq('scratch_type', scratchType)
      .eq('is_active', true)

    if (probError) {
      console.error('Error fetching probabilities:', probError)
      throw probError
    }

    if (!probabilities || probabilities.length === 0) {
      console.log('No probabilities found, falling back to chest items')
      
      // Fallback to chest items
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('chest_item_probabilities')
        .select(`
          *,
          items (*)
        `)
        .eq('is_active', true)

      if (fallbackError) throw fallbackError
      
      return new Response(
        JSON.stringify(await generateFromProbabilities(fallbackData || [], scratchType, shouldWin)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await generateFromProbabilities(probabilities, scratchType, shouldWin)
    
    // Update financial control
    if (result.hasWin && result.winningItem) {
      await updateFinancialControl(supabase, scratchType, getScratchPrice(scratchType), result.winningItem.base_value)
    } else {
      await updateFinancialControl(supabase, scratchType, getScratchPrice(scratchType), 0)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-scratch-card-optimized:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateFromProbabilities(probabilities: any[], scratchType: string, shouldWin: boolean) {
  console.log(`Generating with ${probabilities.length} items, shouldWin: ${shouldWin}`)
  
  // Create weighted list
  const weightedItems: any[] = []
  probabilities.forEach(prob => {
    const item = prob.items || prob.item // Support both formats
    if (item) {
      const weight = prob.probability_weight || 1
      for (let i = 0; i < weight; i++) {
        weightedItems.push({
          id: item.id,
          symbolId: item.id,
          name: item.name,
          image_url: item.image_url,
          rarity: item.rarity,
          base_value: item.base_value,
          isWinning: false
        })
      }
    }
  })

  if (weightedItems.length === 0) {
    throw new Error('No valid items found for scratch card generation')
  }

  const symbols: any[] = []
  let winningItem = null

  if (shouldWin) {
    // Select winning item (prioritize higher value items for wins)
    const sortedItems = [...weightedItems].sort((a, b) => b.base_value - a.base_value)
    const winningIndex = Math.floor(Math.random() * Math.min(5, sortedItems.length)) // Top 5 items
    winningItem = { ...sortedItems[winningIndex], isWinning: true }
    
    // Place winning item in 3 positions (ensuring win)
    const winPositions = [0, 1, 2] // First row for simplicity
    winPositions.forEach(pos => {
      symbols[pos] = { ...winningItem }
    })
    
    // Fill remaining positions with different items
    for (let i = 3; i < 9; i++) {
      let attempts = 0
      let selectedItem
      
      do {
        const randomIndex = Math.floor(Math.random() * weightedItems.length)
        selectedItem = { ...weightedItems[randomIndex] }
        attempts++
      } while (selectedItem.id === winningItem.id && attempts < 50)
      
      symbols[i] = selectedItem
    }
  } else {
    // Fill all positions ensuring no 3 matches
    for (let i = 0; i < 9; i++) {
      let attempts = 0
      let selectedItem
      
      do {
        const randomIndex = Math.floor(Math.random() * weightedItems.length)
        selectedItem = { ...weightedItems[randomIndex] }
        attempts++
      } while (shouldAvoidItem(symbols, selectedItem.id, i) && attempts < 100)
      
      symbols[i] = selectedItem
    }
  }

  // Shuffle symbols array to randomize positions
  for (let i = symbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
  }

  return {
    symbols,
    winningItem,
    hasWin: shouldWin,
    scratchType
  }
}

function shouldAvoidItem(existingSymbols: any[], itemId: string, currentIndex: number): boolean {
  if (existingSymbols.length === 0) return false
  
  const symbolsCopy = [...existingSymbols]
  symbolsCopy[currentIndex] = { id: itemId }
  
  // Check rows
  for (let row = 0; row < 3; row++) {
    const start = row * 3
    if (symbolsCopy[start] && symbolsCopy[start + 1] && symbolsCopy[start + 2]) {
      if (symbolsCopy[start].id === symbolsCopy[start + 1].id && 
          symbolsCopy[start + 1].id === symbolsCopy[start + 2].id) {
        return true
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < 3; col++) {
    if (symbolsCopy[col] && symbolsCopy[col + 3] && symbolsCopy[col + 6]) {
      if (symbolsCopy[col].id === symbolsCopy[col + 3].id && 
          symbolsCopy[col + 3].id === symbolsCopy[col + 6].id) {
        return true
      }
    }
  }
  
  // Check diagonals
  if (symbolsCopy[0] && symbolsCopy[4] && symbolsCopy[8]) {
    if (symbolsCopy[0].id === symbolsCopy[4].id && symbolsCopy[4].id === symbolsCopy[8].id) {
      return true
    }
  }
  
  if (symbolsCopy[2] && symbolsCopy[4] && symbolsCopy[6]) {
    if (symbolsCopy[2].id === symbolsCopy[4].id && symbolsCopy[4].id === symbolsCopy[6].id) {
      return true
    }
  }
  
  return false
}

async function updateFinancialControl(supabase: any, scratchType: string, saleAmount: number, prizeAmount: number) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing, error: fetchError } = await supabase
    .from('scratch_card_financial_control')
    .select('*')
    .eq('scratch_type', scratchType)
    .eq('date', today)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching financial control:', fetchError)
    return
  }

  if (existing) {
    // Update existing record
    const newTotalSales = existing.total_sales + saleAmount
    const newTotalPrizes = existing.total_prizes_given + prizeAmount
    const newNetProfit = newTotalSales - newTotalPrizes
    const newCardsPlayed = existing.cards_played + 1
    
    await supabase
      .from('scratch_card_financial_control')
      .update({
        total_sales: newTotalSales,
        total_prizes_given: newTotalPrizes,
        net_profit: newNetProfit,
        cards_played: newCardsPlayed,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    // Create new record
    await supabase
      .from('scratch_card_financial_control')
      .insert({
        scratch_type: scratchType,
        date: today,
        total_sales: saleAmount,
        total_prizes_given: prizeAmount,
        net_profit: saleAmount - prizeAmount,
        cards_played: 1,
        profit_goal: 100,
        goal_reached: false
      })
  }
}

function getScratchPrice(scratchType: string): number {
  const prices: Record<string, number> = {
    'sorte': 1.00,
    'dupla': 2.50,
    'ouro': 5.00,
    'diamante': 10.00,
    'premium': 25.00
  }
  return prices[scratchType] || 1.00
}