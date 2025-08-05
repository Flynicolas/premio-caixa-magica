import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ShareTemplate {
  id: string;
  title: string;
  template: string;
  category: 'casual' | 'formal' | 'gaming' | 'benefits';
}

interface ReferralShareTemplatesProps {
  referralCode: string;
  fullReferralLink: string;
  onShare: (platform: 'whatsapp' | 'telegram', message: string) => void;
}

const ReferralShareTemplates = ({ referralCode, fullReferralLink, onShare }: ReferralShareTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  const templates: ShareTemplate[] = [
    {
      id: 'casual_1',
      title: 'Convite Casual',
      template: `🎰 Oi! Descobri uma plataforma de jogos super legal e queria te convidar! Usa meu código ${referralCode} para se cadastrar: ${fullReferralLink}`,
      category: 'casual'
    },
    {
      id: 'gaming_1',
      title: 'Para Gamers',
      template: `🎮 E aí, gamer! Encontrei uma plataforma incrível com jogos e prêmios reais. Cola aqui comigo! Código: ${referralCode} 🎯 ${fullReferralLink}`,
      category: 'gaming'
    },
    {
      id: 'benefits_1',
      title: 'Foco nos Benefícios',
      template: `✨ Te convido para uma plataforma onde você pode ganhar prêmios reais! Use meu código especial ${referralCode} e comece com vantagens: ${fullReferralLink}`,
      category: 'benefits'
    },
    {
      id: 'formal_1',
      title: 'Mais Formal',
      template: `Olá! Gostaria de te convidar para conhecer uma plataforma de entretenimento que estou utilizando. Utilize o código ${referralCode} para se cadastrar: ${fullReferralLink}`,
      category: 'formal'
    }
  ];

  const categoryColors = {
    casual: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    formal: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    gaming: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    benefits: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  };

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    toast.success('Mensagem copiada!');
  };

  const shareTemplate = (platform: 'whatsapp' | 'telegram', message: string) => {
    onShare(platform, message);
  };

  const getCurrentMessage = () => {
    if (customMessage) return customMessage;
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      return template?.template || '';
    }
    return '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Templates de Mensagem</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates Predefinidos */}
        <div className="space-y-4">
          <h4 className="font-medium">Escolha um template:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{template.title}</span>
                  <Badge className={categoryColors[template.category]}>
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.template}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem Personalizada */}
        <div className="space-y-3">
          <h4 className="font-medium">Ou crie sua própria mensagem:</h4>
          <Textarea
            placeholder="Digite sua mensagem personalizada aqui..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* Preview da Mensagem */}
        {getCurrentMessage() && (
          <div className="space-y-3">
            <h4 className="font-medium">Preview:</h4>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{getCurrentMessage()}</p>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {getCurrentMessage() && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => copyTemplate(getCurrentMessage())}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            
            <Button
              onClick={() => shareTemplate('whatsapp', getCurrentMessage())}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              onClick={() => shareTemplate('telegram', getCurrentMessage())}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Telegram
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralShareTemplates;