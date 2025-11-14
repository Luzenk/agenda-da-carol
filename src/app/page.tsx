'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Heart, Sparkles, Shield, MessageCircle, Loader2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

interface BusinessInfo {
  businessName: string;
  whatsappNumber: string;
  instagramHandle: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, businessRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/settings/business_info')
      ]);

      const servicesData = await servicesRes.json();
      const businessData = await businessRes.json();

      setServices(servicesData.filter((s: Service) => s.imageUrl));
      setBusinessInfo(businessData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = businessInfo?.whatsappNumber 
    ? `https://wa.me/${businessInfo.whatsappNumber}`
    : 'https://wa.me/5511999999999';

  const instagramLink = businessInfo?.instagramHandle
    ? `https://instagram.com/${businessInfo.instagramHandle.replace('@', '')}`
    : 'https://instagram.com/caroltrancista';

  const displayName = businessInfo?.businessName || 'Agenda da Carol';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-purple-900 mb-6">
            {displayName}
          </h1>
          <p className="text-xl md:text-2xl text-purple-700 mb-8">
            Especialista em tranças afro ✨
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Agende seu horário de forma rápida e prática. Box braids, nagô, twists e muito mais!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/agendar">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Agora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Agendamento Online</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema intuitivo em 3 passos. Escolha seu serviço, data e horário em minutos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle>Confirmação via WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receba confirmação instantânea e lembretes do seu agendamento.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Gerenciamento Fácil</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Reagende ou cancele quando precisar, direto pelo seu link pessoal.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-900 mb-4">
            Nossos Serviços
          </h2>
          <p className="text-lg text-muted-foreground">
            Especializada em tranças afro com excelência e carinho
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {services.slice(0, 4).map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${service.imageUrl})`,
                      backgroundColor: '#f3f4f6'
                    }}
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description || 'Serviço de qualidade'}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg" variant="outline">
                <Link href="/agendar">
                  Ver Todos os Serviços
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum serviço disponível no momento</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Pronta para Transformar Seu Visual?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Agende agora e garanta seu horário com a Carol!
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/agendar">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Meu Horário
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="mb-2">
            <Heart className="w-4 h-4 inline text-pink-500" /> Feito com carinho por Carol
          </p>
          <p className="text-sm">
            © 2024 {displayName}. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-x-4 text-sm">
            <Link href="/agendar" className="hover:text-purple-600">
              Agendar
            </Link>
            <span>•</span>
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
              Instagram
            </a>
            <span>•</span>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}