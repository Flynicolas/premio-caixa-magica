
import { Shield, Lock, Award, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-primary/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/0f37c024-1f08-4216-82c9-1583e7900501.png" 
                alt="Baú Premiado" 
                className="w-8 h-8 rounded-full"
              />
              <h3 className="text-lg font-bold gold-gradient bg-clip-text text-transparent">
                Baú Premiado
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A plataforma mais confiável para sorteios online. 
              Prêmios reais, diversão garantida.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Página Inicial</Link></li>
              <li><Link to="/baus" className="text-muted-foreground hover:text-primary transition-colors">Baús</Link></li>
              <li><Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link to="/ranking" className="text-muted-foreground hover:text-primary transition-colors">Ranking</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/suporte" className="text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Segurança</h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-1 bg-green-900/20 px-2 py-1 rounded">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-900/20 px-2 py-1 rounded">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400">Criptografado</span>
              </div>
              <div className="flex items-center space-x-1 bg-purple-900/20 px-2 py-1 rounded">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400">Certificado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Baú Premiado. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Suporte 24/7 disponível
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
