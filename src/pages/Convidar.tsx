import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferrals } from '@/hooks/useReferrals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Share2, 
  Users, 
  TrendingUp, 
  Gift, 
  Calendar,
  ExternalLink,
  QrCode,
  Activity,
  DollarSign,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuthModal from '@/components/AuthModal';
import ReferralLevelBadge from '@/components/ReferralLevelBadge';
import ReferralShareTemplates from '@/components/ReferralShareTemplates';
import ReferralAnalytics from '@/components/ReferralAnalytics';

const Convidar = () => {
  const { user } = useAuth();
  const { 
    referralData, 
    referralStats, 
    activities, 
    referredUsers, 
    loading,
    copyReferralLink,
    shareOnWhatsApp,
    shareOnTelegram,
    generateQRCode,
    trackClick
  } = useReferrals();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Convidar Amigos</CardTitle>
            <p className="text-muted-foreground">
              Faça login para acessar seu link de convite e construir sua rede de amigos!
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullReferralLink = referralData 
    ? `${window.location.origin}/convite/${referralData.referral_code}`
    : '';

  const totalStats = referralStats.reduce((acc, stat) => ({
    clicks: acc.clicks + stat.clicks,
    registrations: acc.registrations + stat.registrations,
    deposits: acc.deposits + stat.first_deposits,
    totalAmount: acc.totalAmount + stat.total_spent_amount
  }), { clicks: 0, registrations: 0, deposits: 0, totalAmount: 0 });

  const conversionRate = totalStats.clicks > 0 
    ? ((totalStats.registrations / totalStats.clicks) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            🤝 Convidar Amigos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convide amigos para nossa plataforma e acompanhe o crescimento da sua rede!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Convites</p>
                  <p className="text-2xl font-bold text-primary">
                    {referralData?.successful_referrals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-green-400">{conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/20 to-blue-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {referralData?.active_referrals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rede Construída</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {referralData?.successful_referrals || 0} pessoas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Badge */}
        <div className="text-center mb-6">
          <ReferralLevelBadge 
            totalReferrals={referralData?.successful_referrals || 0}
            className="justify-center"
          />
        </div>

        <Tabs defaultValue="link" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="link">Meu Link</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
            <TabsTrigger value="users">Convidados</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          {/* Aba do Link */}
          <TabsContent value="link" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="w-5 h-5" />
                  <span>Seu Link de Convite</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Link Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">Seu código:</p>
                      <p className="text-2xl font-mono font-bold text-primary">
                        {referralData?.referral_code}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowQRCode(!showQRCode)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-background rounded border">
                    <p className="text-sm break-all font-mono">{fullReferralLink}</p>
                  </div>
                </div>

                {/* QR Code */}
                {showQRCode && (
                  <div className="text-center">
                    <img 
                      src={generateQRCode()} 
                      alt="QR Code do link de convite"
                      className="mx-auto border rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Escaneie para acessar seu link de convite
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={copyReferralLink}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  
                  <Button 
                    onClick={shareOnWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    onClick={shareOnTelegram}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Telegram
                  </Button>
                </div>

                {/* How it works */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6 text-center">🚀 Como Funciona o Sistema de Convites</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-primary">📋 Agora (Gratuito)</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                            <p>Compartilhe seu link único com amigos</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                            <p>Amigos se cadastram usando seu código</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                            <p>Acompanhe estatísticas em tempo real</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                            <p>Construa sua rede de indicações</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-yellow-600">💰 Em Breve (Sistema Remunerado)</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">💸</div>
                            <p>Ganhe comissões por cada amigo ativo</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">📈</div>
                            <p>Comissão sobre gastos dos indicados</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">🎯</div>
                            <p>Bônus por metas de indicações</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">🏆</div>
                            <p>Sistema de níveis e recompensas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gift className="w-5 h-5 text-yellow-600" />
                        <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">Prepare-se para o Futuro!</h5>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Quem começar a construir sua rede agora terá vantagem quando o sistema de comissões for lançado. 
                        Seus dados e estatísticas serão preservados!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Templates */}
          <TabsContent value="templates" className="space-y-6">
            <ReferralShareTemplates
              referralCode={referralData?.referral_code || ''}
              fullReferralLink={fullReferralLink}
              onShare={(platform, message) => {
                if (platform === 'whatsapp') {
                  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                } else if (platform === 'telegram') {
                  const telegramUrl = `https://telegram.me/share/url?url=${encodeURIComponent(fullReferralLink)}&text=${encodeURIComponent(message)}`;
                  window.open(telegramUrl, '_blank');
                }
                
                if (referralData) {
                  trackClick(referralData.referral_code, platform);
                }
              }}
            />
          </TabsContent>

          {/* Aba de Estatísticas */}
          <TabsContent value="statistics" className="space-y-6">
            <ReferralAnalytics
              referralStats={referralStats}
              totalStats={totalStats}
              conversionRate={conversionRate}
            />
            
            {/* Histórico Detalhado */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico Detalhado (Últimos 30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                {referralStats.length > 0 ? (
                  <div className="space-y-3">
                    {referralStats.map((stat) => (
                      <div key={stat.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">
                            {format(new Date(stat.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(stat.date), 'EEEE', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex space-x-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-blue-600">{stat.clicks}</p>
                            <p className="text-xs text-muted-foreground">Cliques</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">{stat.registrations}</p>
                            <p className="text-xs text-muted-foreground">Cadastros</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-purple-600">{stat.first_deposits}</p>
                            <p className="text-xs text-muted-foreground">Depósitos</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold">
                              {stat.clicks > 0 ? ((stat.registrations / stat.clicks) * 100).toFixed(1) : '0'}%
                            </p>
                            <p className="text-xs text-muted-foreground">Taxa</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma atividade ainda
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compartilhe seu link para começar a gerar estatísticas!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Usuários */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Meus Convidados ({referredUsers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {referredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{user.full_name || 'Usuário'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Cadastrado em {format(new Date(user.referral_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            R$ {user.total_spent.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum usuário convidado ainda
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compartilhe seu link para começar a construir sua rede!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Atividades */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 20).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            {activity.activity_type === 'click' && '👆 Clique no link'}
                            {activity.activity_type === 'registration' && '👤 Novo cadastro'}
                            {activity.activity_type === 'first_deposit' && '💰 Primeiro depósito'}
                            {activity.activity_type === 'purchase' && '🛒 Compra realizada'}
                          </p>
                          {activity.referred_user && (
                            <p className="text-xs text-muted-foreground">
                              {activity.referred_user.full_name} ({activity.referred_user.email})
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        {activity.referral_source && (
                          <Badge variant="outline" className="text-xs">
                            {activity.referral_source}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma atividade registrada
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Convidar;