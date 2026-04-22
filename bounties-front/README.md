# 🎯 Bounties - Plataforma de Projetos

Uma plataforma moderna para conectar desenvolvedores talentosos com projetos incríveis. Construído com Next.js 15, TypeScript e Tailwind CSS.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Performance Otimizada**: Bundle otimizado e carregamento rápido
- **TypeScript**: Tipagem estática para melhor desenvolvimento
- **Componentes Reutilizáveis**: Arquitetura escalável e maintível
- **Dados Mockados**: Sistema completo de dados simulados
- **Responsivo**: Funciona perfeitamente em todos os dispositivos

## 🛠️ Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Framework de CSS utilitário
- **React 19** - Biblioteca de interface
- **ESLint** - Linting e formatação de código

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Button, Input, Modal, etc.)
│   ├── layout/           # Componentes de layout (Header, Footer)
│   └── features/         # Componentes específicos de features
├── data/                 # Dados mockados
│   ├── users.ts          # Usuários simulados
│   ├── bounties.ts       # Bounties simulados
│   ├── categories.ts     # Categorias
│   └── submissions.ts    # Submissões
├── hooks/                # Hooks customizados
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── useAsync.ts
├── lib/                  # Utilitários e configurações
│   └── utils.ts          # Funções utilitárias
└── types/                # Definições de tipos TypeScript
    └── index.ts          # Tipos globais
```

## 🎨 Componentes UI

### Componentes Base
- **Button**: Botão com múltiplas variantes e tamanhos
- **Input**: Campo de entrada com validação
- **Modal**: Modal responsivo com backdrop
- **Card**: Card com header, content e footer
- **Badge**: Badge com diferentes cores e tamanhos

### Layout
- **Header**: Cabeçalho com navegação e perfil do usuário
- **Footer**: Rodapé com links e informações

## 📊 Dados Mockados

O projeto inclui um sistema completo de dados simulados:

- **Usuários**: 5 usuários com diferentes roles
- **Bounties**: 6 bounties com diferentes status e categorias
- **Categorias**: 8 categorias de projetos
- **Submissões**: 6 submissões com diferentes status

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd bounties-front
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:3000
   ```

## 📝 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento com Turbopack
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Executa o ESLint

## 🎯 Funcionalidades Implementadas

### ✅ Página Inicial
- Hero section com call-to-action
- Estatísticas da plataforma
- Bounties em destaque
- Seção "Como Funciona"

### ✅ Layout Responsivo
- Header com navegação
- Footer com links úteis
- Design mobile-first

### ✅ Componentes UI
- Sistema de design consistente
- Componentes acessíveis
- Variantes e temas

### ✅ Dados Mockados
- Sistema completo de dados simulados
- Funções utilitárias para manipulação
- Tipagem TypeScript completa

## 🔄 Próximos Passos

- [ ] Página de listagem de bounties
- [ ] Página de detalhes do bounty
- [ ] Sistema de filtros e busca
- [ ] Página de perfil do usuário
- [ ] Sistema de criação de bounties
- [ ] Sistema de submissões
- [ ] Dashboard administrativo

## 🎨 Design System

### Cores
- **Primária**: Blue-600 (#2563EB)
- **Secundária**: Gray-600 (#4B5563)
- **Sucesso**: Green-600 (#059669)
- **Aviso**: Yellow-600 (#D97706)
- **Erro**: Red-600 (#DC2626)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Tamanhos**: text-sm, text-base, text-lg, text-xl, text-2xl, etc.

### Espaçamento
- **Padding**: p-4, p-6, p-8
- **Margin**: m-4, m-6, m-8
- **Gap**: gap-4, gap-6, gap-8

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

- **Email**: contato@bounties.com
- **Website**: https://bounties.com
- **LinkedIn**: [Bounties Platform](https://linkedin.com/company/bounties)

---

Desenvolvido com ❤️ pela equipe Bounties