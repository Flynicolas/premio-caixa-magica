import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Database, CheckCircle, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BackfillResult {
  game_type: string;
  games_processed: number;
  total_bet: number;
  total_paid: number;
  status: string;
}

interface PrizeResult {
  game_type: string;
  prizes_created: number;
  status: string;
}

export function RTPMigrationPanel() {
  const [backfillResults, setBackfillResults] = useState<BackfillResult[]>([]);
  const [prizeResults, setPrizeResults] = useState<PrizeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  const runBackfillMigration = async () => {
    try {
      setLoading(true);
      setMigrationStatus('running');
      
      toast({
        title: "Iniciando migração",
        description: "Executando backfill dos dados históricos..."
      });

      const { data, error } = await supabase.rpc('backfill_rtp_data');

      if (error) {
        throw error;
      }

      setBackfillResults(data || []);
      setMigrationStatus('completed');
      
      toast({
        title: "Backfill concluído",
        description: `Migração de ${data?.length || 0} tipos de jogo concluída`
      });

    } catch (error: any) {
      console.error('Backfill error:', error);
      setMigrationStatus('error');
      toast({
        title: "Erro no backfill",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const populateAllPrizes = async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Criando prêmios",
        description: "Populando prêmios padrão para todos os tipos..."
      });

      const { data, error } = await supabase.rpc('populate_all_game_types_prizes');

      if (error) {
        throw error;
      }

      setPrizeResults(data || []);
      
      toast({
        title: "Prêmios criados",
        description: `Configuração de prêmios para ${data?.length || 0} tipos concluída`
      });

    } catch (error: any) {
      console.error('Prize population error:', error);
      toast({
        title: "Erro ao criar prêmios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testPlayEndpoint = async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Testando endpoint",
        description: "Executando teste do endpoint /play..."
      });

      // Test with mock data
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // Mock UUID
        game_type: 'test',
        bet: 1.0
      };

      const { data, error } = await supabase.functions.invoke('play', {
        body: testData
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Endpoint funcionando",
        description: `Teste realizado: ${JSON.stringify(data)}`
      });

    } catch (error: any) {
      console.error('Endpoint test error:', error);
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMigrationProgress = () => {
    if (migrationStatus === 'idle') return 0;
    if (migrationStatus === 'running') return 50;
    if (migrationStatus === 'completed') return 100;
    return 25; // error state
  };

  const getMigrationStatusColor = () => {
    switch (migrationStatus) {
      case 'idle': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sistema de Migração RTP
          </CardTitle>
          <CardDescription>
            Migre dados históricos para o novo sistema RTP por pote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-medium ${getMigrationStatusColor()}`}>
                    Status da Migração
                  </span>
                  <Badge variant={migrationStatus === 'completed' ? 'default' : 'secondary'}>
                    {migrationStatus === 'idle' && 'Aguardando'}
                    {migrationStatus === 'running' && 'Executando'}
                    {migrationStatus === 'completed' && 'Concluída'}
                    {migrationStatus === 'error' && 'Com Erro'}
                  </Badge>
                </div>
                <Progress value={getMigrationProgress()} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="default" 
                    className="w-full"
                    disabled={loading}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    1. Executar Backfill
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Confirmar Migração de Dados
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá migrar todos os dados históricos de jogos para o novo sistema RTP. 
                      Isso inclui:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Migração de dados de <code>scratch_card_games</code> para <code>game_rounds</code></li>
                        <li>Cálculo e atualização dos totais em <code>rtp_pots</code></li>
                        <li>Criação de entradas para novos tipos de jogo</li>
                      </ul>
                      <p className="mt-2 font-medium text-yellow-600">
                        Esta operação pode demorar alguns minutos dependendo do volume de dados.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={runBackfillMigration}>
                      Executar Migração
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                variant="secondary" 
                className="w-full"
                onClick={populateAllPrizes}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                2. Popular Prêmios
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={testPlayEndpoint}
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2" />
                3. Testar Endpoint
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {backfillResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Backfill</CardTitle>
            <CardDescription>
              Dados migrados do sistema antigo para o novo sistema RTP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Jogo</TableHead>
                  <TableHead className="text-right">Jogos Processados</TableHead>
                  <TableHead className="text-right">Total Apostado</TableHead>
                  <TableHead className="text-right">Total Pago</TableHead>
                  <TableHead className="text-right">RTP Histórico</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backfillResults.map((result, index) => {
                  const historicalRTP = result.total_bet > 0 ? (result.total_paid / result.total_bet) * 100 : 0;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.game_type}</TableCell>
                      <TableCell className="text-right font-mono">{result.games_processed}</TableCell>
                      <TableCell className="text-right font-mono">
                        R$ {result.total_bet.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        R$ {result.total_paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {historicalRTP.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {result.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {prizeResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Criação de Prêmios</CardTitle>
            <CardDescription>
              Prêmios padrão configurados para cada tipo de jogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Jogo</TableHead>
                  <TableHead className="text-right">Prêmios Criados</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizeResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.game_type}</TableCell>
                    <TableCell className="text-right font-mono">{result.prizes_created}</TableCell>
                    <TableCell>
                      <Badge variant={result.status === 'created' ? 'default' : 'secondary'}>
                        {result.status === 'created' ? 'Criados' : 'Já Existiam'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Migração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Como funciona o sistema RTP por pote:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Cada tipo de jogo mantém um "pote" com totais acumulados</li>
                <li>O sistema decide prêmios baseado no RTP alvo configurado</li>
                <li>Garante margem da casa e controle financeiro</li>
                <li>Permite ativação/desativação por tipo sem afetar outros</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Processo de migração:</h4>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                <li><strong>Backfill:</strong> Migra dados históricos para o novo sistema</li>
                <li><strong>Prêmios:</strong> Cria configurações padrão (RTP 50%)</li>
                <li><strong>Teste:</strong> Valida o funcionamento do endpoint unificado</li>
                <li><strong>Ativação:</strong> Use as configurações RTP para ativar por tipo</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Pós migração:</h4>
              <ul className="list-disc list-inside space-y-1 text-green-800">
                <li>Configure RTP alvo e CAP para cada tipo nas <strong>Configurações</strong></li>
                <li>Ajuste prêmios e pesos na aba <strong>Prêmios</strong></li>
                <li>Monitore performance na aba <strong>Observabilidade</strong></li>
                <li>Ative gradualmente usando o sistema de canário</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}