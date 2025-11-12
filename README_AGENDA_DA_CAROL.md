# 🎨 Agenda da Carol - Sistema de Agendamento para Trancista

Sistema web completo de agendamento desenvolvido em Next.js 15 com TypeScript, Tailwind CSS, Prisma e SQLite.

## ✨ Funcionalidades

### 📱 Área Pública
- **Agendamento em 3 Passos**
  - Seleção de serviço e variante (Box Braids, Nagô, Twists, Crochet)
  - Escolha de data e horário disponível
  - Formulário de cliente com máscara de telefone e consentimento LGPD
  
- **Gestão de Agendamento pelo Cliente**
  - Link único de gerenciamento
  - Reagendamento com política de taxas
  - Cancelamento com regras de política
  - Download de evento para calendário (ICS)
  - Confirmação via WhatsApp

### 🔐 Área Administrativa
- **Autenticação**
  - Login com senha (padrão: carol123)
  - Middleware de proteção de rotas
  
- **Dashboard**
  - Cards com métricas do dia, semana e mês
  - Agendamentos de hoje
  - Pendentes de confirmação
  - Receita do mês

- **Gestão de Clientes (CRM)**
  - Lista completa de clientes
  - Busca por nome, telefone ou email
  - Histórico de visitas e gastos
  - Conformidade LGPD

- **Agenda**
  - Visualização semanal (placeholder para desenvolvimento futuro)
  - Gestão de bloqueios de horário

- **Serviços**
  - 4 serviços principais pré-cadastrados
  - Variantes por tamanho/complexidade
  - Materiais vinculados
  
- **Relatórios**
  - Taxa de ocupação
  - Receita por período
  - Serviços mais populares
  - No-show e cancelamentos

- **Configurações**
  - Horários de funcionamento
  - Configurações PIX
  - Templates de mensagem WhatsApp
  - Políticas (cancelamento, reagendamento, pagamento, LGPD)

### 💳 Sistema PIX
- Geração de payload EMV completo
- Cálculo CRC16-CCITT
- QR Code para pagamento
- Envio via WhatsApp

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
bun install
# ou
npm install
```

### 2. Configurar Banco de Dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Criar/atualizar o banco de dados
npx prisma db push

# Popular com dados de exemplo
npx tsx prisma/seed.ts
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="carol123"
TZ="America/Sao_Paulo"
APP_URL="http://localhost:3000"

# Informações do Negócio
BUSINESS_NAME="Agenda da Carol"
BUSINESS_PHONE="5511999999999"
BUSINESS_EMAIL="carol@exemplo.com"

# Configurações PIX
PIX_KEY="suachavepix@email.com"
PIX_KEY_TYPE="email"
PIX_MERCHANT_NAME="Carol Trancista"
PIX_MERCHANT_CITY="Sao Paulo"
```

### 4. Iniciar o Servidor
```bash
bun dev
# ou
npm run dev
```

Acesse: http://localhost:3000

## 📍 Rotas Principais

### Público
- `/` - Página inicial
- `/agendar` - Fluxo de agendamento (3 passos)
- `/agendar/sucesso` - Confirmação de agendamento
- `/m/[token]/remarcar` - Reagendamento
- `/m/[token]/cancelar` - Cancelamento

### Admin
- `/admin/login` - Login (senha padrão: carol123)
- `/admin` - Dashboard
- `/admin/agenda` - Visualização de agenda
- `/admin/clientes` - Gestão de clientes
- `/admin/servicos` - Gestão de serviços
- `/admin/relatorios` - Relatórios e métricas
- `/admin/config` - Configurações

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas
- **User** - Usuários admin
- **Service** - Serviços oferecidos
- **ServiceVariant** - Variações de serviço (tamanhos, complexidades)
- **Material** - Materiais utilizados
- **ServiceMaterial** - Relação serviço-material
- **Client** - Clientes cadastrados
- **Appointment** - Agendamentos
- **Policy** - Políticas (cancelamento, LGPD, etc)
- **AvailabilityRule** - Regras de disponibilidade
- **Block** - Bloqueios de horário
- **MessageTemplate** - Templates de mensagem WhatsApp
- **Settings** - Configurações do sistema

## 🎨 Design

- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Navegação Bottom Tab** (mobile): Acesso rápido às principais funcionalidades
- **Sidebar** (desktop): Navegação completa
- **Tema Purple/Pink**: Identidade visual moderna e feminina
- **Componentes Shadcn/UI**: Design system consistente

## 🔒 Segurança & Conformidade

### LGPD
- Consentimento explícito no cadastro
- Política de privacidade clara
- Opção de marketing consent separada
- Registro de data de consentimento

### Autenticação
- Middleware de proteção de rotas admin
- Sessão com cookie httpOnly
- Senha configurável via env

## 📊 Dados de Exemplo

O seed popula o banco com:
- 4 serviços principais (Box Braids, Nagô, Twists, Crochet)
- 13 variantes de serviço
- 8 materiais
- Políticas de cancelamento, reagendamento, pagamento e LGPD
- Regras de disponibilidade (Seg-Sáb, 9h-19h)
- 6 templates de mensagem WhatsApp
- 2 clientes de exemplo
- 2 agendamentos de exemplo

## 🚧 Funcionalidades Implementadas

✅ Sistema de agendamento público completo (3 passos)
✅ APIs de disponibilidade com bloqueios e durações
✅ Gestão de agendamento pelo cliente (reagendar/cancelar)
✅ Autenticação admin com middleware
✅ Dashboard com métricas em tempo real
✅ CRM de clientes com busca
✅ Geração de PIX (payload EMV + QR Code)
✅ Templates de mensagem WhatsApp
✅ Políticas de cancelamento e reagendamento
✅ Conformidade LGPD
✅ Download de eventos ICS para calendário
✅ Interface mobile-first responsiva

## 🔧 Próximas Melhorias Sugeridas

- [ ] Calendário visual interativo com drag-and-drop
- [ ] Upload de fotos de trabalhos realizados
- [ ] Galeria pública de trabalhos
- [ ] Sistema de avaliações e feedback
- [ ] Notificações push
- [ ] Integração com gateway de pagamento
- [ ] Relatórios avançados com gráficos
- [ ] Envio automático de mensagens WhatsApp via API
- [ ] Sistema de fidelidade/pontos
- [ ] Bloqueio de horários recorrentes

## 📝 Licença

Este projeto foi desenvolvido como um sistema completo de agendamento para trancistas.

## 🤝 Suporte

Para dúvidas sobre o sistema:
- Documentação do código está nos comentários
- Estrutura de pastas segue o padrão Next.js 15 App Router
- Components seguem o padrão Shadcn/UI

---

**Desenvolvido com 💜 para Carol Trancista**
