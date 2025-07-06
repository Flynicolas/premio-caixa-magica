
import React from 'react';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import UserStatsCards from '@/components/UserStatsCards';
import RealtimeWinsCarousel from '@/components/RealtimeWinsCarousel';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <section>
            <HeroSlider />
          </section>

          {/* User Stats - Only for logged users */}
          {user && (
            <section>
              <UserStatsCards />
            </section>
          )}

          {/* Live Wins Section */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Ganhos em Tempo Real
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Veja os prêmios que outros usuários estão ganhando neste momento! 
                Sua próxima vitória pode estar a um clique de distância.
              </p>
            </div>
            <RealtimeWinsCarousel />
          </section>

          {/* Welcome Section for Non-logged Users */}
          {!user && (
            <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Mundo dos Prêmios!
              </h2>
              <p className="text-gray-600 text-lg mb-6 max-w-3xl mx-auto">
                Descubra a emoção de abrir baús misteriosos e ganhar prêmios incríveis! 
                De produtos eletrônicos a vouchers exclusivos, cada baú é uma nova oportunidade de conquistar algo especial.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Prêmios Reais</h3>
                  <p className="text-gray-600">Ganhe produtos, dinheiro e vouchers de verdade</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Tempo Real</h3>
                  <p className="text-gray-600">Veja outros usuários ganhando ao vivo</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Fácil de Jogar</h3>
                  <p className="text-gray-600">Cadastre-se e comece a ganhar hoje mesmo</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
