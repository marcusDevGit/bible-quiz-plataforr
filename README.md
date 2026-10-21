# 📖 BibleQuest Platform - Monorepo

Plataforma completa de Quiz Bíblico com gamificação, contendo um painel administrativo para gerenciamento de perguntas e categorias, uma API REST com suporte a WebSockets em tempo real, e um aplicativo móvel gamificado para jogadores.

---

## 🏗️ Arquitetura do Projeto

O projeto é estruturado como um **Monorepo** gerenciado com **Turborepo** e **npm Workspaces**, garantindo o compartilhamento eficiente de tipos e validações entre o cliente e o servidor.

### Divisão do Monorepo

- **`apps/api` (Backend):** Servidor Express construído com TypeScript, Prisma ORM conectado ao Neon PostgreSQL e Socket.IO para partidas multiplayer.
- **`apps/admin` (Frontend Admin):** Painel administrativo React construído com Vite e TailwindCSS para gerenciamento de perguntas e categorias.
- **`apps/mobile` (Frontend App):** Aplicativo móvel construído com React Native (Expo Router) e NativeWind para os jogadores responderem quizes, disputarem rankings e desbloquearem conquistas.
- **`packages/shared-types`:** Definições comuns de tipos TypeScript consumidas pela API, Admin e App Mobile.
- **`packages/shared-validation`:** Validações de esquemas Zod compartilhadas para segurança de dados consistente entre as requisições do app/admin e as respostas do servidor.

---

## 🛠️ Linha do Tempo e Funcionalidades Desenvolvidas

### Fase 1: Autenticação de Usuários e Dashboard Base (Admin)

- **Autenticação Segura:** Registro e login administrativos com criptografia de senhas (`bcrypt`) e tokens de sessão (`jsonwebtoken`).
- **Interface do Dashboard:** Painel administrativo responsivo com menu lateral retrátil (`Sidebar`) e cabeçalho modular.
- **Configurações de Perfil:** Atualização reativa de senha e upload/visualização de avatar do administrador.

### Fase 2: CRUD de Categorias e Perguntas & Seed do Banco (Admin/API)

- **Modelagem Prisma & Migrations:** Schema estendido no Neon PostgreSQL para controle de gamificação e categorias sem perda de consistência.
- **Seeding de Dados:** Script automático (`seed.ts`) que popula 50 perguntas bíblicas em transações atômicas aninhadas.
- **CRUD Completo:** Desenvolvimento de endpoints com paginação nativa e filtros de busca para controle de Categorias e Perguntas.

### Fase 3: Mobile MVP (App Mobile)

- **Autenticação Mobile:** Interfaces de login, registro e recuperação de senha com o tema _Sacred Wisdom_.
- **Área de Perfil:** Visualização de estatísticas de partidas, dados do jogador e barra de XP com badge de nível flutuante sobre o avatar.
- **Quiz Individual Gameplay:** Mecânica de jogo com cronômetro regressivo, 4 alternativas, feedback imediato de acerto/erro com referências bíblicas e tela de resultado com recompensa de XP.

### Fase 4: Ranking & Leaderboard (App Mobile)

- **Pódio dos Líderes:** Exibição gráfica dos três melhores jogadores em formato de pilar dourado/prateado, conforme o design system.
- **Filtros Temporais:** Navegação entre classificações Global, Semanal e Mensal.
- **Card Fixo "Você":** Rodapé fixo exibindo a posição e pontuação exata do jogador conectado.

### Fase 5: Conquistas & Achievements (App Mobile & API)

- **Catálogo de Medalhas:** Sistema com 27 conquistas planejadas e categorizadas por raridade (_Common_, _Uncommon_, _Rare_, _Epic_, _Legendary_, _Mythic_).
- **Barra de Progresso Total:** Resumo no topo indicando porcentagem e quantidade de medalhas conquistadas.
- **Filtro por Tipo & Status:** Chips horizontais para filtrar por Bíblico, Consistência, Progressão, Desbloqueadas e Bloqueadas.
- **Modal de Detalhes:** Ao tocar em uma medalha, exibe como desbloquear, o quiz bíblico recomendado, a barra de progresso individual e atalho direto para a partida.
- **Arquitetura Modular:** Separação limpa em `achievements.constants.ts`, `AchievementCard.tsx`, `AchievementDetailModal.tsx` e `AchievementsScreen.tsx`.

### Fase 6: Arena Multiplayer em Tempo Real (Socket.IO) _(Em Andamento)_

- **Salas Privadas:** Criação de salas com código de convite de 6 dígitos.
- **Sincronização:** Sala de espera (Lobby) com status "Pronto" de cada jogador.
- **Batalha 1v1:** Perguntas simultâneas sincronizadas via WebSocket com placar ao vivo.

---

## 🎨 Design System: Sacred Wisdom

Toda a identidade visual da plataforma mobile foi baseada nas especificações do **Sacred Wisdom**:

- **Primary:** Azul Nobre (`#00236f`) para estabilidade, foco e solenidade.
- **Secondary Container:** Ouro Sagrado (`#fea619`) e Âmbar (`#855300`) para badges de níveis, troféus e pontos.
- **Tertiary Fixed:** Emerald Green (`#4edea3` / `#00311f`) representando crescimento nas estatísticas e acertos.
- **Background & Surfaces:** Tons claros e limpos (`#f7f9fb`, `#ffffff`) com sombras sutis e elevação refinada.
- **Tipografia & Formas:** Bordas suaves (`14px` a `24px` para cartões e modais) para uma experiência moderna e amigável.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js v20+
- Instância PostgreSQL no Neon configurada no `.env` do `apps/api`.
- Expo Go instalado no smartphone (para testar o app móvel).

### Inicialização Rápida

1. **Instalar Dependências:**
   Instale as dependências do monorepo a partir da raiz:
   ```bash
   npm install
   ```
2. **Configurar as Variáveis de Ambiente:**
   - Em `apps/api/`, crie o arquivo `.env`:
     ```env
     PORT=3001
     DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
     JWT_SECRET="seu_jwt_secret_seguro"
     ```
   - Em `apps/mobile/`, crie o arquivo `.env`:
     ```env
     EXPO_PUBLIC_API_URL="http://SEU_IP_LOCAL:3001"
     ```

3. **Configurar o Banco de Dados (API):**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed
   cd ../..
   ```
