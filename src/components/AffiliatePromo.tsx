import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AffiliatePromo = () => {
  return (
    <div className="py-12 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            💰 Programa de Afiliados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ganhe dinheiro indicando amigos para nossa plataforma. 
            Comissões automáticas e sistema de 3 níveis!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-green-500/20 bg-green-500/5">
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <CardTitle className="text-green-400">CPA - R$ 50</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Ganhe R$ 50 para cada pessoa que se cadastrar e fizer um depósito através do seu link
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 bg-blue-500/5">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <CardTitle className="text-blue-400">RevShare - 8%</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Receba 8% de todos os gastos dos usuários que você indicou, para sempre
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/20 bg-purple-500/5">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <CardTitle className="text-purple-400">3 Níveis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Ganhe comissões também dos afiliados que seus indicados trouxerem
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/affiliate">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Users className="w-5 h-5 mr-2" />
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4">
            ✨ Aprovação rápida • 💸 Pagamentos automáticos • 📊 Dashboard completo
          </p>
        </div>
      </div>
    </div>
  );
};