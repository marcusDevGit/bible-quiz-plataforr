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

### [x] Fase 1: Autenticação de Usuários e Dashboard Base (Admin)

- **Autenticação Segura:** Registro e login administrativos com criptografia de senhas (`bcrypt`) e tokens de sessão (`jsonwebtoken`).
- **Interface do Dashboard:** Painel administrativo responsivo com menu lateral retrátil (`Sidebar`) e cabeçalho modular.
- **Configurações de Perfil:** Atualização reativa de nome, senha e avatar do administrador conectada à API (`GET /users/me` e `PUT /users/profile`).

### [x] Fase 2: CRUD de Categorias e Perguntas & Seed do Banco (Admin/API)

- **Modelagem Prisma & Migrations:** Schema estendido no Neon PostgreSQL para controle de gamificação, streaks e categorias sem perda de consistência.
- **Seeding de Dados:** Script automático (`seed.ts`) que popula 103 perguntas bíblicas completas com 4 alternativas (A, B, C, D), 17 categorias e 27 conquistas.
- **CRUD Completo:** Desenvolvimento de endpoints e modais com paginação nativa, criação, edição e exclusão de Categorias e Perguntas.

### [x] Fase 3: Mobile MVP & Modos de Jogo (App Mobile)

- **Autenticação Mobile:** Interfaces de login, registro e recuperação de senha com o tema _Sacred Wisdom_.
- **Área de Perfil Completa:** Visualização e edição de perfil (`PUT /users/profile`), configurações de preferências/logout, histórico de atividade recente (`recentMatches`), estatísticas reais de precisão/vitórias e barra de XP com badge de nível.
- **Quiz Individual & Modos Especiais:** Mecânica de jogo com cronômetro regressivo, filtro por categoria bíblica, modos especiais (_Desafio Diário_, _Modo Sobrevivência / Morte Súbita_ e _Jornada Bíblica_), feedback imediato com referências bíblicas e revisão expansível de questões.

### [x] Fase 4: Ranking & Leaderboard (App Mobile & API)

- **Pódio dos Líderes:** Exibição gráfica dos três melhores jogadores em formato de pilar dourado/prateado, conforme o design system.
- **Filtros Temporais Consolidados:** Navegação entre classificações Global, Semanal (7 dias) e Mensal (30 dias) contabilizando pontuação individual e multiplayer (`playerOne` e `playerTwo`).
- **Card Fixo "Você":** Rodapé fixo exibindo a posição e pontuação exata do jogador conectado.

### [x] Fase 5: Conquistas & Achievements (App Mobile & API)

- **Catálogo Completo de 27 Medalhas:** Sistema com 27 conquistas categorizadas por raridade (_Common_, _Uncommon_, _Rare_, _Epic_, _Legendary_, _Mythic_) com auto-sincronização no banco e avaliação transacional pós-partida e por ofensiva diária (`streak`).
- **Barra de Progresso Total:** Resumo no topo indicando porcentagem e quantidade de medalhas conquistadas.
- **Filtro por Tipo & Status:** Chips horizontais para filtrar por Bíblico, Consistência, Progressão, Desbloqueadas e Bloqueadas.
- **Modal de Detalhes:** Ao tocar em uma medalha, exibe como desbloquear, o quiz bíblico recomendado, a barra de progresso individual e atalho direto para a partida.

### [x] Fase 6: Arena Multiplayer 1v1 em Tempo Real (Socket.IO)

- **Handshake JWT Autenticado:** Conexão WebSocket segura validando o token JWT do jogador no handshake do Socket.IO.
- **Salas Privadas & Matchmaking Rápido:** Criação de salas privadas com código de 6 dígitos e seleção de categorias bíblicas reais, além de fila de partida rápida.
- **Sincronização & Batalha 1v1:** Sala de espera (Lobby) com status "Pronto", perguntas simultâneas com cronômetro, placar ao vivo, tratamento de vitória por W.O. com persistência em banco, atualização de streaks/conquistas e contador de jogadores online em tempo real (`arena_stats`).

### [x] Fase 7: Painel Admin Completo & Analytics (Admin & API)

- **Dashboard em Tempo Real:** Cards conectados a `GET /users/admin-stats` (Total de Perguntas, Partidas Hoje, Total de Partidas, Usuários Registrados) e tabela de partidas recentes (Solo e Arena 1v1).
- **Gestão de Usuários (`/usuarios`):** Listagem completa de jogadores com busca instantânea, ofensiva atual/recorde, XP acumulado, vitórias e total de partidas.
- **Leaderboard Administrativo (`/ranking`):** Visualização das classificações Global, Semanal e Mensal diretamente no painel web.
- **Relatórios de Desempenho (`/relatorios`):** Análise estatística por questão (`timesPlayed` e taxa de acerto `correctRate` atualizados automaticamente a cada partida).

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
   - Em `apps/admin/`, crie o arquivo `.env`:
     ```env
     VITE_API_URL="http://localhost:3001"
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
