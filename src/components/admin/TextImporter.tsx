
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseItem } from '@/types/database';
import { Upload, FileText, Check, AlertTriangle } from 'lucide-react';

interface ParsedItem {
  name: string;
  base_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  chest_type: string;
  order_in_chest: number;
  probability_weight: number;
}

interface ImportReport {
  totalItems: number;
  itemsByChest: Record<string, number>;
  itemsByRarity: Record<string, number>;
  duplicates: string[];
  errors: string[];
}

const TextImporter = () => {
  const { toast } = useToast();
  const [textInput, setTextInput] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Mapear chances para raridades
  const mapChanceToRarity = (chance: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    const lowerChance = chance.toLowerCase();
    
    if (lowerChance.includes('alta') || lowerChance.includes('35%')) return 'common';
    if (lowerChance.includes('média') || lowerChance.includes('15-30')) return 'rare';
    if (lowerChance.includes('baixa') || lowerChance.includes('5-10')) return 'epic';
    if (lowerChance.includes('muito baixa') || lowerChance.includes('<3')) return 'epic';
    if (lowerChance.includes('raro') || lowerChance.includes('manual')) return 'legendary';
    
    return 'rare'; // default
  };

  // Mapear raridade para peso de probabilidade
  const mapRarityToWeight = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 100;
      case 'rare': return 50;
      case 'epic': return 20;
      case 'legendary': return 5;
      default: return 50;
    }
  };

  // Normalizar nome do baú
  const normalizeChestName = (chestName: string): string => {
    const normalized = chestName.toLowerCase().trim();
    
    if (normalized.includes('prata') || normalized.includes('silver')) return 'silver';
    if (normalized.includes('ouro') || normalized.includes('gold')) return 'gold';
    if (normalized.includes('delas')) return 'delas';
    if (normalized.includes('diamante') || normalized.includes('diamond')) return 'diamond';
    if (normalized.includes('rubi') || normalized.includes('ruby')) return 'ruby';
    if (normalized.includes('premium')) return 'premium';
    
    return 'silver'; // default
  };

  const parseTextInput = () => {
    if (!textInput.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole o texto da planilha",
        variant: "destructive"
      });
      return;
    }

    try {
      const lines = textInput.split('\n').filter(line => line.trim());
      const items: ParsedItem[] = [];
      let currentChest = '';
      const errors: string[] = [];
      const duplicates: string[] = [];
      const seenNames = new Set<string>();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detectar cabeçalho de baú
        if (line.toLowerCase().includes('bau') || line.toLowerCase().includes('baú')) {
          currentChest = normalizeChestName(line);
          continue;
        }

        // Pular linhas de cabeçalho da tabela
        if (line.toLowerCase().includes('ordem') || 
            line.toLowerCase().includes('item') || 
            line.toLowerCase().includes('chance')) {
          continue;
        }

        // Processar linha de item
        // Padrões possíveis: "1\tKit 3 garrafas\t15\tMédia (15-30%)"
        const parts = line.split('\t');
        if (parts.length >= 3) {
          try {
            const order = parseInt(parts[0]) || 0;
            const name = parts[1]?.trim();
            const valueStr = parts[2]?.replace(/[^\d,.-]/g, '').replace(',', '.');
            const value = parseFloat(valueStr) || 0;
            const chance = parts[3] || 'média';

            if (name && value > 0) {
              // Verificar duplicatas
              if (seenNames.has(name.toLowerCase())) {
                duplicates.push(name);
              } else {
                seenNames.add(name.toLowerCase());
              }

              const rarity = mapChanceToRarity(chance);
              const item: ParsedItem = {
                name,
                base_value: value,
                rarity,
                chest_type: currentChest,
                order_in_chest: order,
                probability_weight: mapRarityToWeight(rarity)
              };

              items.push(item);
            }
          } catch (error) {
            errors.push(`Linha ${i + 1}: ${line} - ${error}`);
          }
        }
      }

      if (items.length === 0) {
        toast({
          title: "Nenhum item encontrado",
          description: "Verifique se o formato está correto",
          variant: "destructive"
        });
        return;
      }

      // Gerar relatório
      const itemsByChest: Record<string, number> = {};
      const itemsByRarity: Record<string, number> = {};

      items.forEach(item => {
        itemsByChest[item.chest_type] = (itemsByChest[item.chest_type] || 0) + 1;
        itemsByRarity[item.rarity] = (itemsByRarity[item.rarity] || 0) + 1;
      });

      const newReport: ImportReport = {
        totalItems: items.length,
        itemsByChest,
        itemsByRarity,
        duplicates,
        errors
      };

      setParsedItems(items);
      setReport(newReport);
      setShowPreview(true);

      toast({
        title: "Texto processado!",
        description: `${items.length} itens encontrados`,
      });

    } catch (error) {
      console.error('Erro ao processar texto:', error);
      toast({
        title: "Erro no processamento",
        description: "Verifique o formato da planilha",
        variant: "destructive"
      });
    }
  };

  const importItems = async () => {
    if (parsedItems.length === 0) return;

    setLoading(true);
    try {
      const itemsData = parsedItems.map(item => ({
        name: item.name,
        base_value: item.base_value,
        rarity: item.rarity,
        category: 'product',
        delivery_type: 'digital' as const,
        requires_address: false,
        requires_document: false,
        is_active: true,
        chest_types: [item.chest_type],
        order_in_chest: item.order_in_chest,
        probability_weight: item.probability_weight,
        import_source: 'text_import'
      }));

      const { data, error } = await supabase
        .from('items')
        .insert(itemsData)
        .select();

      if (error) throw error;

      toast({
        title: "Importação concluída!",
        description: `${data?.length || 0} itens importados com sucesso`,
      });

      // Limpar dados
      setTextInput('');
      setParsedItems([]);
      setReport(null);
      setShowPreview(false);

    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Importação via Texto da Planilha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Cole aqui o texto da sua planilha (pode copiar direto do Excel):
            </label>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Exemplo:
Bau de prata
1	Kit 3 garrafas pequena, média e grande	15	Média (15-30%)
2	Fone estilo AirPods	18	Média (15-30%)
...

Bau de ouro
1	Smartwatch simples	25	Média (15-30%)
...`}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={parseTextInput} disabled={!textInput.trim()}>
              <Upload className="w-4 h-4 mr-2" />
              Processar Texto
            </Button>
            
            {showPreview && (
              <Button 
                onClick={importItems} 
                disabled={loading || parsedItems.length === 0}
                variant="default"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Importando...' : 'Importar Itens'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview e Relatório */}
      {report && showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview da Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600">{report.totalItems}</div>
                <div className="text-sm text-blue-800">Total de Itens</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">{Object.keys(report.itemsByChest).length}</div>
                <div className="text-sm text-green-800">Tipos de Baú</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(report.itemsByRarity).length}</div>
                <div className="text-sm text-purple-800">Raridades</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">{report.duplicates.length}</div>
                <div className="text-sm text-red-800">Duplicatas</div>
              </div>
            </div>

            {/* Distribuição por Baú */}
            <div>
              <h4 className="font-semibold mb-2">Itens por Baú:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.itemsByChest).map(([chest, count]) => (
                  <Badge key={chest} variant="outline">
                    {chest}: {count} itens
                  </Badge>
                ))}
              </div>
            </div>

            {/* Distribuição por Raridade */}
            <div>
              <h4 className="font-semibold mb-2">Itens por Raridade:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.itemsByRarity).map(([rarity, count]) => (
                  <Badge key={rarity} className={`text-white ${getRarityColor(rarity)}`}>
                    {rarity}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Alertas */}
            {report.duplicates.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Duplicatas encontradas:</strong> {report.duplicates.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {report.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erros encontrados:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {report.errors.map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview dos primeiros itens */}
            <div>
              <h4 className="font-semibold mb-2">Preview dos Primeiros 10 Itens:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {parsedItems.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        R$ {item.base_value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.chest_type}</Badge>
                      <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {parsedItems.length > 10 && (
                  <div className="text-center text-sm text-gray-500">
                    ... e mais {parsedItems.length - 10} itens
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextImporter;
