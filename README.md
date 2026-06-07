# Bible Quiz Platform - Monorepo

Plataforma completa de Quiz Bíblico com gamificação, contendo um painel administrativo para gerenciamento de perguntas e categorias, e uma API REST estruturada.

---

## 🏗️ Arquitetura do Projeto

O projeto é estruturado como um **Monorepo** gerenciado com **Turborepo** e **npm Workspaces**, garantindo o compartilhamento eficiente de tipos e validações entre o cliente e o servidor.

### Decisões de Engenharia (Backend Layered Architecture)

Para garantir clareza, facilidade de manutenção e desacoplamento no backend (`apps/api`), implementamos uma **arquitetura em camadas**:

- **Rotas (`routes`)**: Mapeiam os endpoints Express, ligam os middlewares e encaminham a requisição.
- **Controladores (`controllers`)**: Tratam exclusivamente do protocolo HTTP, realizam o parse dos payloads brutos via Zod no ponto de entrada e respondem status HTTP semânticos.
- **Serviços (`services`)**: O coração da aplicação. Contêm as regras de negócio de domínio (exclusão lógica, validação de categorias órfãs, controle de XP e unicidade de nomes).
- **Repositórios (`repositories`)**: Camada isolada que executa queries diretas via Prisma Client, protegendo as outras camadas de acoplamento com o banco.
- **Validações (`shared-validation`)**: Centraliza as restrições e regras no pacote Zod compartilhado, prevenindo inconsistências entre frontend e backend.

---

## 🛠️ Linha do Tempo e Funcionalidades Desenvolvidas

### Fase 1: Autenticação de Usuários e Dashboard Base

- **Autenticação Segura**: Implementação de cadastro e login com criptografia de senhas (`bcrypt`) e tokens de sessão (`jsonwebtoken`).
- **Interface do Dashboard**: Conversão das interfaces Stitch para componentes React reativos, com menus retráteis (`Sidebar`) e cabeçalho modular.
- **Menu de Perfil e Avatar**: Dropdown de perfil no `Header` contendo rotas rápidas e formulário integrado (`SettingsForm`) para alteração reativa de senha e upload/visualização de foto de avatar do admin.

### Fase 2: CRUD de Categorias e Perguntas & Seed de Banco

- **Modelagem Estendida**: Alteração do schema físico do Prisma para acomodar o padrão oficial de perguntas do quiz, incluindo campos de estudo e estatísticas.
- **Migração Física**: Execução de migrações estruturadas no Neon PostgreSQL para adicionar campos de gamificação sem perda de consistência.
- **Seeding de Dados**: Criação de um script automático (`seed.ts`) que consome os dados brutos e popula 50 perguntas completas em transações atômicas aninhadas (salvamento de perguntas + alternativas de uma só vez).
- **CRUD Completo de API**: Desenvolvimento de repositórios, serviços, controladores e rotas para controle de Categoria e Pergunta com suporte a paginação nativa e filtros dinâmicos de busca.

---

## 📚 Informações e Padrões Utilizados

As seguintes diretrizes e dados serviram como pilares para a construção do sistema:

1. **Padrão de Pergunta Bíblica Oficial (`.ia/README_QUESTIONS.md`)**:
   - ID único por UUID.
   - Limite estrito de 2 a 5 alternativas com exatamente uma alternativa correta.
   - Presença obrigatória de referência bíblica e explicação contextualizada.
   - Sistema de recompensa de XP (`xpReward`) e score de dificuldade (`difficultyScore`).
   - Tags de pesquisa (`tags`) e contadores de uso (`stats`).
2. **Dados Originais (`data/questions.json` e `category.json`)**:
   - Base inicial contendo as 50 questões históricas e de estudo e as definições de categorias do quiz.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js v20.20.0+
- Conta/Instância PostgreSQL no Neon com `DATABASE_URL` configurada no `.env` de `apps/api`.

### Inicialização Rápida

1. Instalar as dependências do monorepo na raiz:
   ```bash
   npm install
   ```
