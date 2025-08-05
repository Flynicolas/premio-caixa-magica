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
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AuthModal from '@/components/AuthModal';

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
    generateQRCode
  } = useReferrals();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Afiliados</CardTitle>
            <p className="text-muted-foreground">
              Faça login para acessar seu link de convite e começar a ganhar com indicações!
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
            🤝 Sistema de Afiliados
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convide amigos e ganhe com cada novo usuário que se cadastrar usando seu link!
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
                  <p className="text-sm text-muted-foreground">Comissão Futura</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    R$ {referralData?.total_commission_earned?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="link" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link">Meu Link</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
            <TabsTrigger value="users">Meus Convidados</TabsTrigger>
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
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Como Funciona</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                        <p>Compartilhe seu link único com amigos e familiares</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                        <p>Seus amigos se cadastram usando seu link</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                        <p>Você acompanha as estatísticas em tempo real</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                        <p className="text-yellow-600 font-medium">Em breve: Ganhe comissões por cada amigo ativo!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Estatísticas */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Cliques:</span>
                    <span className="font-bold">{totalStats.clicks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cadastros:</span>
                    <span className="font-bold">{totalStats.registrations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primeiro Depósito:</span>
                    <span className="font-bold">{totalStats.deposits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Total:</span>
                    <span className="font-bold">R$ {totalStats.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  {referralStats.slice(0, 7).length > 0 ? (
                    <div className="space-y-3">
                      {referralStats.slice(0, 7).map((stat) => (
                        <div key={stat.id} className="flex justify-between items-center">
                          <span className="text-sm">
                            {format(new Date(stat.date), 'dd/MM', { locale: ptBR })}
                          </span>
                          <div className="flex space-x-4 text-sm">
                            <span>👆 {stat.clicks}</span>
                            <span>👤 {stat.registrations}</span>
                            <span>💰 {stat.first_deposits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma atividade ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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