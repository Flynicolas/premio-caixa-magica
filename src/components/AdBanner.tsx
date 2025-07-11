
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, Zap } from 'lucide-react';

const AdBanner = () => {
  return (
    <div className="w-full py-8 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border-y border-primary/20">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold animate-pulse">
                  <Star className="w-3 h-3 mr-1" />
                  DESTAQUE
                </Badge>
                <Badge variant="outline" className="border-primary text-primary animate-bounce">
                  <Zap className="w-3 h-3 mr-1" />
                  NOVO
                </Badge>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                🎯 Espaço Publicitário Premium
              </h3>
              
              <p className="text-lg text-muted-foreground mb-4">
                Seu anúncio aqui! Alcance milhares de jogadores ativos diariamente.
                Máxima visibilidade para sua marca ou produto.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Alto Engajamento
                </Badge>
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  Público Qualificado
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                  ROI Garantido
                </Badge>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button className="group bg-gradient-to-r from-primary to-accent text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                <span>Anuncie Aqui</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Contato: anuncios@exemplo.com
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        </Card>
      </div>
    </div>
  );
};

export default AdBanner;
