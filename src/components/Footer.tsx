import { Shield, Lock, Award, Phone, Home, Gift, Info, Trophy, HelpCircle, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActiveUsers } from '@/hooks/useActiveUsers';

const Footer = () => {
  const activeUsers = useActiveUsers();

  return (
    <footer className="bg-gradient-to-t from-card/50 to-card border-t border-primary/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-4 md:py-16 relative">
        {/* Mobile Compact Layout */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-4">
            {/* Logo Section - Mobile */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src="/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png" 
                  alt="Baú Premiado" 
                  className="w-8 h-8 rounded-full ring-1 ring-primary/20"
                />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Baú Premiado
              </h3>
            </div>
            
            {/* Status Indicators - Mobile */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-green-400">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="hidden xs:inline">Online</span>
              </div>
              <div className="text-xs text-muted-foreground hidden xs:block">
                +{activeUsers.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Two Column Mobile Layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Links Section - Mobile */}
            <div>
              <h4 className="text-xs font-bold gold-text mb-2">Links</h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Home className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/premios" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Gift className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/sobre" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Info className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/ranking" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Trophy className="w-3.5 h-3.5 gold-text" />
                </Link>
              </div>
              
              <h4 className="text-xs font-bold gold-text mb-2 mt-3">Suporte</h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/central-ajuda" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Users className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/termos-uso" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <FileText className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/politica-privacidade" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <Lock className="w-3.5 h-3.5 gold-text" />
                </Link>
                <Link to="/faq" className="p-1.5 gold-gradient-subtle rounded gold-hover transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 gold-text" />
                </Link>
              </div>
            </div>
            
            {/* Security Section - Mobile */}
            <div>
              <h4 className="text-xs font-bold gold-text mb-2">Segurança</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 gold-text" />
                  <span className="text-xs gold-text">SSL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-3 h-3 gold-text" />
                  <span className="text-xs gold-text">Criptografia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-3 h-3 gold-text" />
                  <span className="text-xs gold-text">Certificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 gold-text" />
                  <span className="text-xs gold-text">24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Logo and Description */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png" 
                  alt="Baú Premiado" 
                  className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Baú Premiado
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A plataforma mais confiável para sorteios online. 
              Prêmios reais, diversão garantida e transparência total.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              <div className="text-xs text-muted-foreground">
                +{activeUsers.toLocaleString()} usuários ativos
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold gold-gradient-text text-lg relative">
              Links Rápidos
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 gold-gradient rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Home className="w-4 h-4 gold-text" />
                  <span>Página Inicial</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/premios" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Gift className="w-4 h-4 gold-text" />
                  <span>Prêmios</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Info className="w-4 h-4 gold-text" />
                  <span>Sobre</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/ranking" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4 gold-text" />
                  <span>Ranking</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-bold gold-gradient-text text-lg relative">
              Suporte
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 gold-gradient rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/central-ajuda" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 gold-text" />
                  <span>Central de Ajuda</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 gold-text" />
                  <span>Termos de Uso</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/politica-privacidade" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4 gold-text" />
                  <span>Política de Privacidade</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-muted-foreground gold-hover transition-all duration-300 hover:translate-x-1 inline-flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4 gold-text" />
                  <span>FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Contact */}
          <div className="space-y-6">
            <h4 className="font-bold gold-gradient-text text-lg relative">
              Segurança & Contato
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 gold-gradient rounded-full"></div>
            </h4>
            
            {/* Security Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 group">
                <div className="p-2 gold-gradient-subtle rounded-lg group-hover:gold-gradient transition-colors">
                  <Shield className="w-4 h-4 gold-text" />
                </div>
                <div>
                  <div className="text-sm font-bold gold-text">SSL Seguro</div>
                  <div className="text-xs text-muted-foreground">Conexão protegida</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 group">
                <div className="p-2 gold-gradient-subtle rounded-lg group-hover:gold-gradient transition-colors">
                  <Lock className="w-4 h-4 gold-text" />
                </div>
                <div>
                  <div className="text-sm font-bold gold-text">Criptografado</div>
                  <div className="text-xs text-muted-foreground">Dados protegidos</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 group">
                <div className="p-2 gold-gradient-subtle rounded-lg group-hover:gold-gradient transition-colors">
                  <Award className="w-4 h-4 gold-text" />
                </div>
                <div>
                  <div className="text-sm font-bold gold-text">Certificado</div>
                  <div className="text-xs text-muted-foreground">Plataforma verificada</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t gold-border">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 gold-text" />
                <span className="text-sm font-bold gold-text">Suporte 24/7</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sempre disponível para ajudar
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary/20 mt-4 md:mt-12 pt-4 md:pt-8">
          {/* Mobile Bottom */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">© 2024 Baú Premiado</p>
              <div className="flex items-center space-x-1 bg-primary/5 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Sistema OK</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Bottom */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © 2024 Baú Premiado. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Versão 2.0</span>
                <span>•</span>
                <span>Última atualização: Hoje</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">
                  Sistema funcionando
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
