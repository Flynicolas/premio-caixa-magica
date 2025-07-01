import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Edit, 
  MapPin, 
  CreditCard, 
  Trophy, 
  Wallet, 
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserLevelDisplay from '@/components/UserLevelDisplay';
import { calculateUserLevel } from '@/utils/levelSystem';

const Perfil = () => {
  const [user, setUser] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    birthDate: '1990-05-15'
  });

  const [address, setAddress] = useState({
    street: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    complement: 'Apto 45'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [balance] = useState(250.00);
  const [totalSpent] = useState(1250.50);
  const [totalPrizes] = useState(15);
  const [totalWithdrawn] = useState(850.00);

  const userLevel = calculateUserLevel(totalSpent, totalPrizes);

  const handleSave = () => {
    setIsEditing(false);
    // Here would be the API call to save user data
  };

  const handleAddBalance = () => {
    console.log('Add balance clicked');
  };

  const prizes = [
    { name: 'iPhone 16 Pro Max', value: 'R$ 8.999,00', date: '2024-12-15', status: 'delivered' },
    { name: 'PlayStation 5', value: 'R$ 3.500,00', date: '2024-12-10', status: 'pending' },
    { name: 'R$ 500 PIX', value: 'R$ 500,00', date: '2024-12-05', status: 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        balance={balance} 
        onAddBalance={handleAddBalance}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gold-gradient bg-clip-text text-transparent mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>

          {/* User Level Display */}
          <div className="mb-8">
            <UserLevelDisplay 
              userLevel={userLevel}
              totalSpent={totalSpent}
              totalPrizes={totalPrizes}
            />
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Pessoal
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamento
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Prêmios
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informações Pessoais
                  </h2>
                  <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="gold-gradient text-black font-bold hover:opacity-90"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Salvar' : 'Editar'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={user.cpf}
                      onChange={(e) => setUser({ ...user, cpf: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={user.birthDate}
                      onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Conta Verificada</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    Sua conta foi verificada com sucesso. Você pode resgatar todos os prêmios.
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* Address Information */}
            <TabsContent value="address">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Endereço de Entrega
                  </h2>
                  <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="gold-gradient text-black font-bold hover:opacity-90"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Salvar' : 'Editar'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Rua e Número</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={address.complement}
                      onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Apartamento, casa, etc."
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Payment Methods */}
            <TabsContent value="payment">
              <Card className="p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Métodos de Pagamento
                </h2>

                <div className="space-y-4">
                  <div className="border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                          PIX
                        </div>
                        <div>
                          <p className="font-medium">PIX</p>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Ativo
                      </Badge>
                    </div>
                  </div>

                  <div className="border border-muted rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-red-700 rounded flex items-center justify-center text-white text-xs font-bold">
                          CARD
                        </div>
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">Em breve</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Em breve
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Prizes */}
            <TabsContent value="prizes">
              <Card className="p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-primary" />
                  Meus Prêmios
                </h2>

                <div className="space-y-4">
                  {prizes.map((prize, index) => (
                    <div key={index} className="border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{prize.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Conquistado em {new Date(prize.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-primary font-bold">{prize.value}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={prize.status === 'delivered' ? 'default' : 'secondary'}
                            className={prize.status === 'delivered' ? 'bg-green-600' : ''}
                          >
                            {prize.status === 'delivered' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Entregue
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Pendente
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="p-6 text-center">
                  <Wallet className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="text-2xl font-bold text-primary">R$ {balance.toFixed(2)}</h3>
                  <p className="text-sm text-muted-foreground">Saldo Atual</p>
                </Card>

                <Card className="p-6 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                  <h3 className="text-2xl font-bold text-primary">R$ {totalSpent.toFixed(2)}</h3>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                </Card>

                <Card className="p-6 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-3 text-green-500" />
                  <h3 className="text-2xl font-bold text-primary">{totalPrizes}</h3>
                  <p className="text-sm text-muted-foreground">Prêmios Conquistados</p>
                </Card>

                <Card className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="text-2xl font-bold text-primary">R$ {totalWithdrawn.toFixed(2)}</h3>
                  <p className="text-sm text-muted-foreground">Total Resgatado</p>
                </Card>
              </div>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Histórico de Atividades</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Prêmio conquistado</p>
                        <p className="text-sm text-muted-foreground">iPhone 16 Pro Max</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">15/12/2024</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Crédito adicionado</p>
                        <p className="text-sm text-muted-foreground">R$ 100,00</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">12/12/2024</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Conta verificada</p>
                        <p className="text-sm text-muted-foreground">Documentos aprovados</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">10/12/2024</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Perfil;
