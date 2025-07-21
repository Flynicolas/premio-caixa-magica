import { Shield, Lock, Award, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-card/50 to-card border-t border-primary/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                +1000 usuários ativos
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-primary text-lg relative">
              Links Rápidos
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  🏠 Página Inicial
                </Link>
              </li>
              <li>
                <Link 
                  to="/premios" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  🎁 Prêmios
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  ℹ️ Sobre
                </Link>
              </li>
              <li>
                <Link 
                  to="/ranking" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  🏆 Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="font-semibold text-primary text-lg relative">
              Suporte
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/central-ajuda" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  📞 Central de Ajuda
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  📋 Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/politica-privacidade" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  🔒 Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  ❓ FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Contact */}
          <div className="space-y-6">
            <h4 className="font-semibold text-primary text-lg relative">
              Segurança & Contato
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </h4>
            
            {/* Security Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 group">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-400">SSL Seguro</div>
                  <div className="text-xs text-muted-foreground">Conexão protegida</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 group">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Lock className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-400">Criptografado</div>
                  <div className="text-xs text-muted-foreground">Dados protegidos</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 group">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-purple-400">Certificado</div>
                  <div className="text-xs text-muted-foreground">Plataforma verificada</div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-primary/10">
              <div className="flex items-center space-x-2 text-primary">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Suporte 24/7</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sempre disponível para ajudar
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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
