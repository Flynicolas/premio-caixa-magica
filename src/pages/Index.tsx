
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="text-center py-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Baú Premiado
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Descubra a emoção de abrir baús misteriosos e ganhar prêmios incríveis! 
              De produtos eletrônicos a vouchers exclusivos, cada baú é uma nova oportunidade.
            </p>
          </section>

          {/* User Stats - Only for logged users */}
          {user && (
            <section className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">R$ 0,00</div>
                  <div className="text-sm text-gray-400">Total Investido</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-sm text-gray-400">Prêmios Ganhos</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-sm text-gray-400">Baús Abertos</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">Nível 1</div>
                  <div className="text-sm text-gray-400">Experiência</div>
                </div>
              </div>
            </section>
          )}

          {/* Chest Cards Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎁 Escolha seu Baú
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Cada baú contém prêmios únicos e valiosos. Quanto mais raro o baú, maiores as chances de grandes prêmios!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Silver Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 rounded-xl p-6 hover:border-gray-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/8f503764-12ee-4e00-8148-76b279be343f.png" alt="Baú Prata" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Baú de Prata</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 5,00</div>
                  <button className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:from-gray-400 hover:to-gray-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>

              {/* Gold Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-600 rounded-xl p-6 hover:border-yellow-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/8c5dedca-ad61-4b14-a649-8b854950a875.png" alt="Baú Ouro" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Baú de Ouro</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 15,00</div>
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-6 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>

              {/* Diamond Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-600 rounded-xl p-6 hover:border-blue-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/0ec6f6c5-203f-4fca-855d-59171f78adf3.png" alt="Baú Diamante" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Baú de Diamante</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 35,00</div>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:from-blue-400 hover:to-blue-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>

              {/* Ruby Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-600 rounded-xl p-6 hover:border-red-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/a7b012cc-0fae-4b69-b2f4-690740a0ba92.png" alt="Baú Rubi" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Baú de Rubi</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 75,00</div>
                  <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-bold hover:from-red-400 hover:to-red-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>

              {/* Premium Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-600 rounded-xl p-6 hover:border-purple-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/d43f06a5-1532-42ba-8362-5aefb160b408.png" alt="Baú Premium" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Baú Premium</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 150,00</div>
                  <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-400 hover:to-purple-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>

              {/* Delas Chest */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-pink-600 rounded-xl p-6 hover:border-pink-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                    <img src="/lovable-uploads/85b1ecea-b443-4391-9986-fb77979cf6ea.png" alt="Baú Delas" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-400 mb-2">Baú Delas</h3>
                  <div className="text-2xl font-bold text-yellow-400 mb-4">R$ 25,00</div>
                  <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:from-pink-400 hover:to-pink-500 transition-all duration-300 group-hover:scale-105">
                    Abrir Baú
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Live Wins Section */}
          <section className="mt-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 Ganhos em Tempo Real
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Veja os prêmios que outros usuários estão ganhando neste momento! 
                Sua próxima vitória pode estar a um clique de distância.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-500/20 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg mr-4 flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">João ganhou um <span className="text-yellow-400">iPhone 15 Pro</span></p>
                    <p className="text-gray-400 text-sm">Há 2 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg mr-4 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Maria ganhou <span className="text-yellow-400">R$ 500,00 em dinheiro</span></p>
                    <p className="text-gray-400 text-sm">Há 5 minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Welcome Section for Non-logged Users */}
          {!user && (
            <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center mt-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Bem-vindo ao Mundo dos Prêmios!
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
                Descubra a emoção de abrir baús misteriosos e ganhar prêmios incríveis! 
                De produtos eletrônicos a vouchers exclusivos, cada baú é uma nova oportunidade de conquistar algo especial.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-400">Prêmios Reais</h3>
                  <p className="text-gray-400">Ganhe produtos, dinheiro e vouchers de verdade</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-green-400">Tempo Real</h3>
                  <p className="text-gray-400">Veja outros usuários ganhando ao vivo</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-purple-400">Fácil de Jogar</h3>
                  <p className="text-gray-400">Cadastre-se e comece a ganhar hoje mesmo</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
