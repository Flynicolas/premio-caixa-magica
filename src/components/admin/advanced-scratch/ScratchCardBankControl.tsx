import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Save } from 'lucide-react';
import { useAdvancedScratchCard } from '@/hooks/useAdvancedScratchCard';

export const ScratchCardBankControl: React.FC = () => {
  const { scratchCards, bankControls, updateBankControl } = useAdvancedScratchCard();
  const [selectedScratchType, setSelectedScratchType] = useState<string>('');
  const [formData, setFormData] = useState<{
    payout_mode: 'percentage' | 'balance_min';
    pay_upto_percentage: number;
    min_bank_balance: number;
    bank_balance: number;
  }>({
    payout_mode: 'percentage',
    pay_upto_percentage: 35,
    min_bank_balance: 0,
    bank_balance: 0
  });

  const selectedBankControl = bankControls.find(bc => bc.scratch_type === selectedScratchType);

  React.useEffect(() => {
    if (selectedBankControl) {
      setFormData({
        payout_mode: (selectedBankControl.payout_mode as 'percentage' | 'balance_min') || 'percentage',
        pay_upto_percentage: selectedBankControl.pay_upto_percentage || 35,
        min_bank_balance: selectedBankControl.min_bank_balance || 0,
        bank_balance: selectedBankControl.bank_balance
      });
    }
  }, [selectedBankControl]);

  const handleSave = async () => {
    if (!selectedScratchType) return;
    
    await updateBankControl(selectedScratchType, formData);
  };

  const calculateMaxPayout = () => {
    if (formData.payout_mode === 'percentage') {
      return (formData.bank_balance * formData.pay_upto_percentage) / 100;
    } else {
      return formData.bank_balance - formData.min_bank_balance;
    }
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 50) return { level: 'Alto', color: 'bg-red-500', variant: 'destructive' as const };
    if (percentage >= 30) return { level: 'Médio', color: 'bg-yellow-500', variant: 'secondary' as const };
    return { level: 'Baixo', color: 'bg-green-500', variant: 'default' as const };
  };

  const profitMargin = selectedBankControl ? 
    ((selectedBankControl.net_profit / Math.max(selectedBankControl.total_sales, 1)) * 100) : 0;

  const riskLevel = getRiskLevel(formData.pay_upto_percentage);

  return (
    <div className="space-y-6">
      {/* Seletor de Raspadinha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Controle da Banca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Raspadinha</Label>
            <Select value={selectedScratchType} onValueChange={setSelectedScratchType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma raspadinha" />
              </SelectTrigger>
              <SelectContent>
                {scratchCards.map(card => (
                  <SelectItem key={card.id} value={card.scratch_type}>
                    {card.name} ({card.scratch_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedScratchType && selectedBankControl && (
        <>
          {/* Visão Geral Financeira */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo da Banca</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {selectedBankControl.bank_balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Max Payout: R$ {calculateMaxPayout().toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {selectedBankControl.net_profit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem: {profitMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nível de Risco</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={riskLevel.variant}>{riskLevel.level}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formData.pay_upto_percentage}%
                  </span>
                </div>
                <Progress 
                  value={formData.pay_upto_percentage} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Configurações da Banca */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo de Payout */}
              <div className="space-y-3">
                <Label>Modo de Controle</Label>
                <Select 
                  value={formData.payout_mode} 
                  onValueChange={(value: 'percentage' | 'balance_min') => 
                    setFormData(prev => ({ ...prev, payout_mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem do Saldo</SelectItem>
                    <SelectItem value="balance_min">Saldo Mínimo Protegido</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.payout_mode === 'percentage' 
                    ? 'Permite pagar até X% do saldo total da banca'
                    : 'Protege um valor mínimo e permite pagar o restante'
                  }
                </p>
              </div>

              {/* Configuração por Modo */}
              {formData.payout_mode === 'percentage' ? (
                <div className="space-y-3">
                  <Label>
                    Pagar até {formData.pay_upto_percentage}% do saldo 
                    (R$ {calculateMaxPayout().toFixed(2)})
                  </Label>
                  <Slider
                    value={[formData.pay_upto_percentage]}
                    onValueChange={([value]) => 
                      setFormData(prev => ({ ...prev, pay_upto_percentage: value }))
                    }
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservador (1%)</span>
                    <span>Equilibrado (35%)</span>
                    <span>Agressivo (100%)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="min_balance">Saldo Mínimo Protegido (R$)</Label>
                  <Input
                    id="min_balance"
                    type="number"
                    step="0.01"
                    value={formData.min_bank_balance}
                    onChange={(e) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        min_bank_balance: parseFloat(e.target.value) || 0 
                      }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Máximo disponível para payout: R$ {calculateMaxPayout().toFixed(2)}
                  </p>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Vendas Totais</p>
                  <p className="text-lg">R$ {selectedBankControl.total_sales.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Prêmios Pagos</p>
                  <p className="text-lg">R$ {selectedBankControl.total_prizes_given.toFixed(2)}</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </Button>
                <Button variant="outline">
                  Testar Validação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alertas de Segurança */}
          {formData.pay_upto_percentage > 50 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Configuração de Alto Risco: Mais de 50% do saldo pode ser pago em prêmios.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};