import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

export function ScratchCardAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          Análises & Relatórios
        </h2>
        <p className="text-muted-foreground">
          Métricas de performance, lucratividade e relatórios avançados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lucratividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Análise de Lucratividade
            </CardTitle>
            <CardDescription>
              Métricas de rentabilidade por tipo de raspadinha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Sistema de análise de lucratividade em desenvolvimento. 
                Use as "Configurações" para simular cenários.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
            <CardDescription>
              Estatísticas de uso e eficiência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                Dashboard de métricas em desenvolvimento. 
                Relatórios detalhados serão disponibilizados em breve.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Avançados</CardTitle>
          <CardDescription>
            Análises detalhadas e insights do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            Sistema avançado de analytics será implementado nas próximas versões.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}