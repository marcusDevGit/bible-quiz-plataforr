# 📱 BibleQuest Mobile - React Native App

Aplicativo mobile da plataforma BibleQuest, construído com React Native, Expo, TypeScript, TailwindCSS (NativeWind) e TanStack Query.

---

## 🎨 Decisões de Design e UI/UX

O aplicativo segue o design system **Sacred Wisdom**, focando em uma experiência mobile premium e gamificada:
- **Cores Harmoniosas:** Azul Escuro (`#00236f`) como cor primária de confiança, Ouro (`#fea619`) como container secundário para elementos de recompensa e conquistas, e Emerald Green (`#4edea3`) para XP.
- **Tipografia:** Fonte *Inter* com tamanhos escalonados para melhor contraste e legibilidade em dispositivos móveis.
- **Simulador Web Resiliente:** Adaptado com limites rígidos de contêiner e centralização (`max-w-md mx-auto`) para simular perfeitamente um dispositivo mobile no navegador.

---

## 🛠️ Tecnologias Utilizadas

- **Expo / React Native:** Framework para desenvolvimento mobile multiplataforma.
- **Expo Router:** Navegação baseada em arquivos e pastas (File-system routing) organizada em abas (`(tabs)`).
- **NativeWind (Tailwind CSS):** Estilização baseada em classes utilitárias adaptadas para React Native.
- **TanStack Query (React Query):** Gerenciamento de estado de dados assíncronos, cacheamento de requisições à API e sincronização inteligente.
- **Axios:** Cliente HTTP para comunicação com a API.

---

## 🚀 Como Executar Localmente

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env` no diretório `apps/mobile/` apontando para a sua API local ou de produção:

```env
EXPO_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Iniciar o Servidor de Desenvolvimento do Expo
A partir do diretório raiz do monorepo ou diretamente em `apps/mobile`, execute o comando de desenvolvimento:

```bash
npm run dev
```

### 3. Visualizar o Aplicativo
- **No Navegador (Web):** Pressione `w` no terminal para abrir a simulação web do app em `http://localhost:8081`.
- **No Celular:** Instale o aplicativo **Expo Go** (Android/iOS) no seu aparelho e escaneie o QR Code exibido no terminal.

---

## 📁 Estrutura de Pastas

```
apps/mobile/
├── app/                  # Roteamento baseado em arquivos (Expo Router)
│   ├── (auth)/           # Telas de Login e Cadastro
│   ├── (tabs)/           # Abas principais (Home, Quiz, Arena, Ranking, Perfil)
│   └── _layout.tsx       # Configuração global de layout e simulador web
├── src/
│   ├── features/         # Módulos isolados por funcionalidade (ranking, auth, profile)
│   │   ├── ranking/      # Componentes e serviços de classificação
│   │   └── auth/         # Lógica e hooks de autenticação
│   ├── hooks/            # Hooks customizados globais
│   └── services/         # Configurações de API (Axios client)
├── tsconfig.json
└── app.json
```
