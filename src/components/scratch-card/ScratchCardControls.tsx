import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScratchCardType, scratchCardTypes } from "@/types/scratchCard";
import { Loader2, Sparkles, RotateCcw, Eye } from "lucide-react";

interface ScratchCardControlsProps {
  selectedType: ScratchCardType;
  onTypeChange: (type: ScratchCardType) => void;
  onGenerate: (forcedWin?: boolean) => void;
  onReset: () => void;
  onRevealAll: () => void;
  isLoading: boolean;
  hasActiveGame: boolean;
}

const ScratchCardControls = ({
  selectedType,
  onTypeChange,
  onGenerate,
  onReset,
  onRevealAll,
  isLoading,
  hasActiveGame,
}: ScratchCardControlsProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Controles da Raspadinha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção do tipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Raspadinha</label>
          <Select
            value={selectedType}
            onValueChange={(value) => onTypeChange(value as ScratchCardType)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scratchCardTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{value.name}</span>
                    <Badge variant="outline" className="ml-2">
                      R$ {value.price}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botões de controle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onGenerate(false)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Gerar Normal"
            )}
          </Button>

          <Button
            onClick={() => onGenerate(true)}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Forçar Vitória
          </Button>
        </div>

        {/* Controles do jogo ativo */}
        {hasActiveGame && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <Button
              onClick={onRevealAll}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              Revelar Tudo
            </Button>

            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reiniciar
            </Button>
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• Raspe 3 símbolos iguais para ganhar</p>
          <p>• Sistema de teste (sem cobrança)</p>
          <p>• Probabilidades ajustáveis</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScratchCardControls;