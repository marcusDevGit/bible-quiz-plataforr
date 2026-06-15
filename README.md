# 📖 BibleQuest Platform - Monorepo

Plataforma completa de Quiz Bíblico com gamificação, contendo um painel administrativo para gerenciamento de perguntas e categorias, uma API REST robusta e estruturada, e um aplicativo móvel gamificado para jogadores.

---

## 🏗️ Arquitetura do Projeto

O projeto é estruturado como um **Monorepo** gerenciado com **Turborepo** e **npm Workspaces**, garantindo o compartilhamento eficiente de tipos e validações entre o cliente e o servidor.

### Divisão do Monorepo

- **`apps/api` (Backend):** Servidor Express construído com TypeScript e Prisma ORM conectado ao Neon PostgreSQL.
- **`apps/admin` (Frontend Admin):** Painel administrativo React construído com Vite e TailwindCSS para gerenciamento de perguntas e categorias.
- **`apps/mobile` (Frontend App):** Aplicativo móvel construído com React Native (Expo Router) e NativeWind para os jogadores responderem quizes e subirem no ranking.
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
- **Autenticação Mobile:** Interfaces de login e registro mobile com persistência de token.
- **Área de Perfil:** Visualização de conquistas, estatísticas de partidas e barra de XP com badge de nível flutuante sobre o avatar do jogador.
- **Quiz Individual:** Mecânica de jogo rápida com tempo limite, alternativas e tela de resultado mostrando pontuação e XP acumulado.

### Fase 4: Ranking & Leaderboard (App Mobile)
- **Pódio do Top 3:** Exibição gráfica destacada para os três melhores jogadores em formato de pilar dourado/prateado, conforme o design system.
- **Seletor de Abas:** Navegação simplificada entre classificações Global, Semanal e Mensal.
- **Card Flutuante "Você":** Rodapé fixo exibindo a posição exata do jogador conectado.
- **Responsividade e Rolagem:** Altura de viewport delimitada dinamicamente via `useWindowDimensions` para impedir sobreposição do rodapé na exibição simulada em navegadores web.

---

## 🎨 Design System: Sacred Wisdom

Toda a identidade visual da plataforma mobile foi baseada nas especificações do **Sacred Wisdom** (localizadas em `bible-quest-Design/sacred_wisdom/DESIGN.md`), focando em:
- **Primary:** Azul Escuro (`#00236f`) para estabilidade e confiança.
- **Secondary Container:** Ouro (`#fea619`) e Ouro Escuro (`#855300`) para badges de níveis, troféus e pontos.
- **Tertiary Fixed Dim:** Emerald Green (`#4edea3`) representando crescimento nas estatísticas e acúmulo de XP.
- **Shapes:** Radii suaves (`8px` para botões/entradas, `24px` para cartões) para uma estética moderna e amigável.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js v20.20.0+
- Instância PostgreSQL no Neon com `DATABASE_URL` configurada no `.env` do `apps/api`.

### Inicialização Rápida

1. **Instalar Dependências:**
   Instale as dependências do monorepo a partir do diretório raiz:
   ```bash
   npm install
   ```

2. **Configurar o Banco de Dados (API):**
   Crie o arquivo `.env` em `apps/api/` e execute as migrações:
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed
   cd ../..
   ```

3. **Executar a Plataforma Completa:**
   Inicie todos os projetos (API, Admin e App Mobile) simultaneamente a partir da raiz usando o comando Turbo:
   ```bash
   npm run dev
   ```

Aplicações locais ativas por padrão:
- **API Backend:** `http://localhost:3000`
- **Painel Administrativo:** `http://localhost:5173`
- **App Mobile Simulator (Expo Web):** `http://localhost:8081`
