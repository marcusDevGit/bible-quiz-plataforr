# 🖥️ BibleQuest Admin - Painel Administrativo

Interface web administrativa construída com React, TypeScript, Vite e TailwindCSS, responsável pelo gerenciamento de conteúdo da plataforma BibleQuest.

---

## 🔑 Funcionalidades Principais

- **Autenticação de Administradores:** Login restrito com validação de credenciais administrativas.
- **Gerenciamento de Categorias (CRUD):** Criação, listagem, edição e exclusão (com proteção contra órfãos) de categorias do quiz.
- **Gerenciamento de Perguntas (CRUD):** Criação e edição de perguntas detalhadas contendo alternativas, indicação de resposta correta, campo de estudos (referência bíblica) e explicação pós-resposta.
- **Configurações de Perfil:** Atualização rápida de senha e alteração do avatar do administrador.

---

## 🛠️ Tecnologias Utilizadas

- **React & TypeScript:** Biblioteca de UI e tipagem estática.
- **Vite:** Ferramenta de build extremamente rápida para desenvolvimento frontend moderno.
- **Tailwind CSS:** Framework de estilização baseado em classes utilitárias.
- **React Hook Form & Zod:** Gerenciamento eficiente de estados de formulários e validação robusta de entradas do usuário.
- **Axios:** Cliente HTTP para comunicação integrada com a API.

---

## 🚀 Como Executar Localmente

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do diretório `apps/admin` apontando para a sua API local ou de produção:

```env
VITE_API_URL="http://localhost:3001"
```

### 2. Inicializar o Servidor Local
Com as dependências instaladas na raiz do monorepo, inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```
O painel administrativo estará disponível em `http://localhost:5173`.

---

## 📁 Estrutura de Pastas

```
apps/admin/
├── src/
│   ├── components/       # Componentes de UI, tabelas, modais e layout (Sidebar, Header, QuestionTable, CategoryTable)
│   ├── pages/            # Páginas da aplicação (Dashboard, Login, Questions, Categories)
│   ├── service/          # Serviços HTTP e integração com a API (auth, question, category)
│   ├── App.tsx           # Layout principal protegido e barra superior
│   └── main.tsx          # Ponto de entrada do React e definição de rotas
├── package.json
└── vite.config.ts
```
