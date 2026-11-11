# 📡 BibleQuest API - Backend Service

Serviço de backend em Node.js construído com Express, TypeScript, Prisma ORM e Neon PostgreSQL, responsável pelas regras de negócio, persistência de dados e autenticação da plataforma BibleQuest.

---

## 🏗️ Arquitetura em Camadas (Layered Architecture)

Para manter o código desacoplado, testável e de fácil manutenção, a API está organizada em quatro camadas lógicas:

1. **Rotas (`src/routes/`)**
   - Responsabilidade: Mapear os endpoints HTTP, acoplar middlewares (como autenticação JWT) e direcionar as chamadas para os controladores.
   
2. **Controladores (`src/controllers/`)**
   - Responsabilidade: Tratar o protocolo HTTP. Faz o parse e a validação do payload de entrada utilizando schemas do Zod (provenientes de `packages/shared-validation`) e responde com os códigos de status HTTP semânticos (ex: 200, 201, 400, 404, 500).

3. **Serviços (`src/services/`)**
   - Responsabilidade: Onde residem as regras de negócio reais da aplicação (exclusão lógica, controle de acúmulo de XP, verificação de categorias órfãs e validação de unicidade). Não conhece detalhes de transporte HTTP nem do banco de dados direto.

4. **Repositórios (`src/repositories/`)**
   - Responsabilidade: Comunicação direta com a persistência de dados usando o Prisma Client. Isola a lógica SQL/ORM das regras de negócio.

---

## 🚀 Como Executar Localmente

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do diretório `apps/api` com as seguintes configurações:

```env
PORT=3001
DATABASE_URL="postgresql://usuario:senha@host/dbname?sslmode=require"
JWT_SECRET="sua_chave_secreta_jwt_aqui"
```

### 2. Configurar o Banco de Dados
Com as dependências instaladas na raiz do monorepo, execute as migrations do Prisma para estruturar o banco no Neon PostgreSQL:

```bash
npx prisma migrate dev
```

### 3. Executar o Seed de Dados
Popule o banco de dados inicial com as 50 perguntas padrão e categorias básicas:

```bash
npx prisma db seed
```

### 4. Executar em Modo de Desenvolvimento
Inicialize o servidor local:

```bash
npm run dev
```
A API estará disponível por padrão em `http://localhost:3001`.

---

## 📁 Estrutura de Pastas

```
apps/api/
├── prisma/               # Schema do Prisma, migrações e scripts de seed
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── controllers/      # Controladores HTTP (Zod Input Parser)
│   ├── routes/           # Rotas Express & Middlewares
│   ├── services/         # Regras de Negócio e Domínio
│   ├── repositories/     # Acesso ao Neon DB via Prisma Client
│   ├── middlewares/      # Validação de JWT e Tratamento de Erros
│   └── server.ts         # Ponto de entrada da API
├── package.json
└── tsconfig.json
```
