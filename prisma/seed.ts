import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'carol123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@agendadacarol.com' },
    update: {},
    create: {
      email: 'admin@agendadacarol.com',
      password: hashedPassword,
      name: 'Carol Admin',
    },
  });
  console.log('✅ Admin user created');

  // Create services
  const boxBraids = await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Box Braids',
      description: 'Tranças individuais em formato de caixa, versáteis e duradouras',
      imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
      order: 1,
      active: true,
    },
  });

  const nagô = await prisma.service.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Nagô',
      description: 'Tranças tradicionais rentes ao couro cabeludo, elegantes e práticas',
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
      order: 2,
      active: true,
    },
  });

  const twists = await prisma.service.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Twists',
      description: 'Tranças retorcidas, leves e naturais',
      imageUrl: 'https://images.unsplash.com/photo-1616683693971-12d344ab4efc?w=800&q=80',
      order: 3,
      active: true,
    },
  });

  const crochet = await prisma.service.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: 'Crochet Braids',
      description: 'Técnica com crochê para aplicação rápida de cabelos sintéticos',
      imageUrl: 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800&q=80',
      order: 4,
      active: true,
    },
  });
  console.log('✅ Services created');

  // Create service variants
  await prisma.serviceVariant.createMany({
    data: [
      // Box Braids variants
      { serviceId: boxBraids.id, name: 'Curta (até ombros)', description: 'Ideal para quem busca praticidade', durationMin: 240, price: 180.00, order: 1 },
      { serviceId: boxBraids.id, name: 'Média (até meio das costas)', description: 'Comprimento versátil', durationMin: 300, price: 230.00, order: 2 },
      { serviceId: boxBraids.id, name: 'Longa (até cintura)', description: 'Visual impactante', durationMin: 360, price: 280.00, order: 3 },
      { serviceId: boxBraids.id, name: 'Extra Longa (abaixo da cintura)', description: 'Máximo comprimento', durationMin: 420, price: 350.00, order: 4 },
      
      // Nagô variants
      { serviceId: nagô.id, name: 'Simples (até 10 tranças)', description: 'Visual clean e discreto', durationMin: 120, price: 80.00, order: 1 },
      { serviceId: nagô.id, name: 'Médio (10-20 tranças)', description: 'Equilíbrio perfeito', durationMin: 180, price: 120.00, order: 2 },
      { serviceId: nagô.id, name: 'Complexo (mais de 20 tranças)', description: 'Design elaborado', durationMin: 240, price: 160.00, order: 3 },
      
      // Twists variants
      { serviceId: twists.id, name: 'Twists Curtos', description: 'Rápido e prático', durationMin: 180, price: 130.00, order: 1 },
      { serviceId: twists.id, name: 'Twists Médios', description: 'Estilo intermediário', durationMin: 240, price: 170.00, order: 2 },
      { serviceId: twists.id, name: 'Twists Longos', description: 'Visual completo', durationMin: 300, price: 220.00, order: 3 },
      
      // Crochet variants
      { serviceId: crochet.id, name: 'Crochet Curto', description: 'Aplicação rápida', durationMin: 120, price: 150.00, order: 1 },
      { serviceId: crochet.id, name: 'Crochet Médio', description: 'Tamanho ideal', durationMin: 150, price: 190.00, order: 2 },
      { serviceId: crochet.id, name: 'Crochet Longo', description: 'Volumoso e completo', durationMin: 180, price: 240.00, order: 3 },
    ],
  });
  console.log('✅ Service variants created');

  // Create materials
  await prisma.material.createMany({
    data: [
      { id: 1, name: 'Jumbo Kanecalon Preto', description: 'Cabelo sintético premium', stockQuantity: 50, unit: 'pacote', minStock: 10 },
      { id: 2, name: 'Jumbo Kanecalon Castanho', description: 'Cabelo sintético premium', stockQuantity: 30, unit: 'pacote', minStock: 10 },
      { id: 3, name: 'Jumbo Kanecalon Loiro', description: 'Cabelo sintético premium', stockQuantity: 20, unit: 'pacote', minStock: 8 },
      { id: 4, name: 'Gel Finalizador', description: 'Para acabamento perfeito', stockQuantity: 15, unit: 'un', minStock: 5 },
      { id: 5, name: 'Mousse Fixador', description: 'Fixação duradoura', stockQuantity: 12, unit: 'un', minStock: 5 },
      { id: 6, name: 'Óleo de Umectação', description: 'Hidratação profunda', stockQuantity: 10, unit: 'un', minStock: 3 },
      { id: 7, name: 'Presilhas e Elásticos', description: 'Diversos tamanhos', stockQuantity: 100, unit: 'un', minStock: 20 },
      { id: 8, name: 'Agulha de Crochê', description: 'Para técnica crochet', stockQuantity: 5, unit: 'un', minStock: 2 },
    ],
  });
  console.log('✅ Materials created');

  // Link materials to services
  await prisma.serviceMaterial.createMany({
    data: [
      // Box Braids needs synthetic hair and gel
      { serviceId: 1, materialId: 1, quantity: 6 },
      { serviceId: 1, materialId: 4, quantity: 1 },
      { serviceId: 1, materialId: 7, quantity: 10 },
      
      // Nagô needs gel and mousse
      { serviceId: 2, materialId: 4, quantity: 1 },
      { serviceId: 2, materialId: 5, quantity: 1 },
      { serviceId: 2, materialId: 7, quantity: 15 },
      
      // Twists needs synthetic hair and oil
      { serviceId: 3, materialId: 1, quantity: 4 },
      { serviceId: 3, materialId: 6, quantity: 1 },
      { serviceId: 3, materialId: 7, quantity: 8 },
      
      // Crochet needs crochet needle and synthetic hair
      { serviceId: 4, materialId: 8, quantity: 1 },
      { serviceId: 4, materialId: 1, quantity: 5 },
      { serviceId: 4, materialId: 4, quantity: 1 },
    ],
  });
  console.log('✅ Service materials linked');

  // Create policies
  await prisma.policy.createMany({
    data: [
      {
        type: 'cancellation',
        title: 'Política de Cancelamento',
        content: `# Política de Cancelamento

Entendemos que imprevistos acontecem, mas para manter nossa agenda organizada, solicitamos:

- **Até 24h antes**: Cancelamento gratuito
- **Menos de 24h**: Taxa de 50% do valor do serviço
- **No-show (não comparecimento)**: Taxa de 100% do valor

Para cancelar, use o link enviado no WhatsApp ou entre em contato.`,
        hoursBeforeLimit: 24,
        active: true,
        order: 1,
      },
      {
        type: 'rescheduling',
        title: 'Política de Reagendamento',
        content: `# Política de Reagendamento

Reagendamentos são bem-vindos com antecedência:

- **Até 12h antes**: Reagendamento gratuito (até 2 vezes)
- **Menos de 12h**: Taxa de R$ 30,00
- **Após 2 reagendamentos**: Necessário pagamento de sinal

Use o link de gerenciamento ou WhatsApp para reagendar.`,
        hoursBeforeLimit: 12,
        active: true,
        order: 2,
      },
      {
        type: 'payment',
        title: 'Formas de Pagamento',
        content: `# Formas de Pagamento

Aceitamos:

- 💳 **Cartão** (crédito/débito)
- 💰 **Dinheiro**
- 📱 **PIX** (desconto de 5%)
- 💵 **Transferência bancária**

**Importante**: 
- Sinal de 30% pode ser solicitado para serviços longos
- Pagamento realizado após conclusão do serviço`,
        active: true,
        order: 3,
      },
      {
        type: 'lgpd',
        title: 'Política de Privacidade (LGPD)',
        content: `# Política de Privacidade

De acordo com a Lei Geral de Proteção de Dados (LGPD), seus dados são tratados com segurança:

## Dados Coletados
- Nome, telefone e e-mail para agendamento
- Histórico de serviços para melhor atendimento
- Preferências de comunicação

## Como Usamos
- Confirmação e lembretes de agendamento
- Ofertas personalizadas (com seu consentimento)
- Melhoria dos nossos serviços

## Seus Direitos
- Acessar seus dados
- Solicitar correção ou exclusão
- Revogar consentimentos

**Seus dados nunca são compartilhados com terceiros sem autorização.**

Dúvidas? Entre em contato: ${process.env.BUSINESS_EMAIL}`,
        active: true,
        order: 4,
      },
    ],
  });
  console.log('✅ Policies created');

  // Create availability rules (Monday to Saturday, 9am-7pm)
  await prisma.availabilityRule.createMany({
    data: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', active: true }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', active: true }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', active: true }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', active: true }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', active: true }, // Friday
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', active: true }, // Saturday
    ],
  });
  console.log('✅ Availability rules created');

  // Create message templates
  await prisma.messageTemplate.createMany({
    data: [
      {
        type: 'confirmation',
        name: 'Confirmação de Agendamento',
        content: `Olá {{clientName}}! 🌟

Seu agendamento foi confirmado:

📅 *{{serviceName}}*
🕐 {{date}} às {{time}}
💰 Valor: {{price}}

📍 Endereço: [seu endereço]

Gerencie seu agendamento:
🔄 Reagendar: {{rescheduleLink}}
❌ Cancelar: {{cancelLink}}

Nos vemos em breve! 💜`,
        active: true,
      },
      {
        type: 'reminder',
        name: 'Lembrete de Agendamento',
        content: `Oi {{clientName}}! 👋

Lembrete: seu horário é amanhã!

📅 *{{serviceName}}*
🕐 {{date}} às {{time}}

Nos vemos em breve! Se precisar reagendar:
{{rescheduleLink}}`,
        active: true,
      },
      {
        type: 'cancellation',
        name: 'Confirmação de Cancelamento',
        content: `Olá {{clientName}},

Seu agendamento foi cancelado:

📅 *{{serviceName}}*
🕐 {{date}} às {{time}}

Quando quiser agendar novamente, será um prazer te atender! 💜

Agende aqui: ${process.env.APP_URL}/agendar`,
        active: true,
      },
      {
        type: 'rescheduling',
        name: 'Confirmação de Reagendamento',
        content: `Olá {{clientName}}! ✅

Reagendamento confirmado:

📅 *{{serviceName}}*
🕐 NOVO horário: {{date}} às {{time}}
💰 Valor: {{price}}

Gerencie: {{rescheduleLink}}

Obrigada pela compreensão! 💜`,
        active: true,
      },
      {
        type: 'thank_you',
        name: 'Agradecimento Pós-Atendimento',
        content: `Oi {{clientName}}! ✨

Obrigada por confiar no meu trabalho!

Como foi sua experiência? Sua opinião é muito importante! 

Até o próximo agendamento! 💜

📅 Agende aqui: ${process.env.APP_URL}/agendar`,
        active: true,
      },
      {
        type: 'no_show_followup',
        name: 'Acompanhamento No-Show',
        content: `Oi {{clientName}},

Percebi que você não compareceu ao seu horário de {{date}} às {{time}}.

Está tudo bem? Se aconteceu algum imprevisto, podemos reagendar! 

Entre em contato quando puder. 💜`,
        active: true,
      },
    ],
  });
  console.log('✅ Message templates created');

  // Create settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'business_info',
        value: JSON.stringify({
          name: process.env.BUSINESS_NAME || 'Agenda da Carol',
          phone: process.env.BUSINESS_PHONE || '5511999999999',
          email: process.env.BUSINESS_EMAIL || 'carol@exemplo.com',
          address: 'Rua das Tranças, 123 - São Paulo/SP',
          instagram: '@caroltrancista',
          description: 'Especialista em tranças afro, box braids, nagô e muito mais!',
        }),
        description: 'Business contact and information',
      },
      {
        key: 'booking_settings',
        value: JSON.stringify({
          bufferBetweenAppointments: 15, // minutes
          maxAdvanceDays: 60, // max days in advance to book
          minAdvanceHours: 2, // minimum hours in advance to book
          autoConfirm: false,
          requireDeposit: false,
          depositPercentage: 30,
        }),
        description: 'Booking and scheduling settings',
      },
      {
        key: 'pix_settings',
        value: JSON.stringify({
          pixKey: process.env.PIX_KEY || 'suachavepix@email.com',
          pixKeyType: process.env.PIX_KEY_TYPE || 'email',
          merchantName: process.env.PIX_MERCHANT_NAME || 'Carol Trancista',
          merchantCity: process.env.PIX_MERCHANT_CITY || 'Sao Paulo',
          txId: 'AGENDACAROL',
        }),
        description: 'PIX payment configuration',
      },
      {
        key: 'notification_settings',
        value: JSON.stringify({
          sendConfirmation: true,
          sendReminder: true,
          reminderHoursBefore: 24,
          sendThankYou: true,
          sendNoShowFollowup: true,
        }),
        description: 'Notification preferences',
      },
    ],
  });
  console.log('✅ Settings created');

  // Create sample clients and appointments
  const client1 = await prisma.client.create({
    data: {
      name: 'Maria Silva',
      phone: '5511987654321',
      email: 'maria.silva@email.com',
      lgpdConsent: true,
      lgpdConsentDate: new Date(),
      marketingConsent: true,
      firstVisit: new Date('2024-01-15'),
      lastVisit: new Date('2024-02-20'),
      totalVisits: 3,
      totalSpent: 650.00,
      averageRating: 5,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Ana Costa',
      phone: '5511976543210',
      email: 'ana.costa@email.com',
      lgpdConsent: true,
      lgpdConsentDate: new Date(),
      marketingConsent: false,
      firstVisit: new Date('2024-02-10'),
      lastVisit: new Date('2024-02-10'),
      totalVisits: 1,
      totalSpent: 180.00,
      averageRating: 5,
    },
  });

  console.log('✅ Sample clients created');

  // Helper to generate management token
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Create sample appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      serviceId: 1,
      variantId: 1,
      scheduledStart: tomorrow,
      scheduledEnd: new Date(tomorrow.getTime() + 240 * 60000), // 4 hours
      status: 'confirmed',
      price: 180.00,
      paymentStatus: 'pending',
      managementToken: generateToken(),
      confirmedAt: new Date(),
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client2.id,
      serviceId: 2,
      variantId: 5,
      scheduledStart: nextWeek,
      scheduledEnd: new Date(nextWeek.getTime() + 120 * 60000), // 2 hours
      status: 'pending',
      price: 80.00,
      paymentStatus: 'pending',
      managementToken: generateToken(),
    },
  });

  console.log('✅ Sample appointments created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
