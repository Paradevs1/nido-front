import { Bounty } from '@/types';

export const mockBounties: Bounty[] = [
  {
    id: '1',
    title: 'Desenvolvimento de Dashboard Analytics',
    description: 'Precisamos de um dashboard completo para análise de dados com gráficos interativos, filtros avançados e exportação de relatórios. O dashboard deve ser responsivo e ter uma interface moderna.',
    value: 25000,
    currency: 'BRL',
    status: 'open',
    category: '1', // Desenvolvimento Web
    tags: ['React', 'TypeScript', 'Chart.js', 'Dashboard'],
    createdBy: '1',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    deadline: new Date('2024-11-15'),
    requirements: 'Experiência com React e TypeScript, Conhecimento em bibliotecas de gráficos (Chart.js, D3.js ou similar), Experiência com APIs REST, Portfolio com projetos similares',
    deliverables: [
      'Código fonte completo',
      'Documentação técnica',
      'Testes unitários',
      'Deploy em ambiente de produção'
    ],
    participants: [
      { id: '1', name: 'João Silva', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { id: '2', name: 'Maria Santos', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' }
    ],
    rules: [
      'Ganhe recompensas em criptomoedas',
      'Participe de campanhas exclusivas',
      'Conecte-se com a comunidade Web3'
    ],
    evaluation_criteria: 'Qualidade do código, funcionalidade, design, performance e documentação serão avaliados.',
    official_links: [
      'https://example.com/dashboard-docs',
      'https://example.com/api-reference'
    ]
  },
  {
    id: '2',
    title: 'App Mobile para Delivery',
    description: 'Desenvolvimento de aplicativo móvel',
    value: 5000,
    currency: 'USD',
    status: 'in_progress',
    category: '2', // Mobile
    tags: ['React Native', 'Firebase', 'Maps', 'Payment'],
    createdBy: '2',
    assignedTo: '3',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-10-10'),
    deadline: new Date('2024-12-01'),
    requirements: 'Experiência com React Native, Conhecimento em Firebase, Integração com APIs de pagamento, Experiência com mapas e geolocalização',
    deliverables: [
      'APK para Android',
      'IPA para iOS',
      'Código fonte',
      'Documentação de instalação',
      'Guia do usuário'
    ],
  },
  {
    id: '3',
    title: 'Redesign de Landing Page',
    description: 'Redesign completo da landing page',
    value: 1200,
    currency: 'BRL',
    status: 'completed',
    category: '3', // Design
    tags: ['Figma', 'Web Design', 'UI/UX', 'Landing Page'],
    createdBy: '1',
    assignedTo: '4',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-09-30'),
    deadline: new Date('2024-09-30'),
    requirements: 'Portfolio com projetos de design web, Experiência com Figma, Conhecimento em UX/UI, Entendimento de conversão e CRO',
    deliverables: [
      'Arquivos Figma',
      'Assets exportados',
      'Especificações técnicas',
      'Guia de estilo',
      'Protótipo interativo'
    ],
  },
  {
    id: '4',
    title: 'Sistema de Autenticação com 2FA',
    description: 'Implementação de sistema de autenticação robusto',
    value: 1800,
    currency: 'BRL',
    status: 'open',
    category: '1', // Desenvolvimento Web
    tags: ['Node.js', 'JWT', '2FA', 'Security'],
    createdBy: '3',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-05'),
    deadline: new Date('2024-11-20'),
    requirements: 'Experiência com Node.js e Express, Conhecimento em JWT e segurança, Experiência com autenticação 2FA, Conhecimento em criptografia',
    deliverables: [
      'API REST completa',
      'Middleware de autenticação',
      'Sistema de 2FA',
      'Testes de segurança',
      'Documentação da API'
    ],
  },
  {
    id: '5',
    title: 'Análise de Dados de Vendas',
    description: 'Análise completa dos dados de vendas dos últimos 2 anos com insights, previsões e recomendações estratégicas.',
    value: 3200,
    currency: 'USD',
    status: 'open',
    category: '5', // Data Science
    tags: ['Python', 'Pandas', 'Machine Learning', 'Analytics'],
    createdBy: '2',
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-09-28'),
    deadline: new Date('2024-11-10'),
    requirements: 'Experiência com Python e Pandas, Conhecimento em análise estatística, Experiência com machine learning, Habilidades de visualização de dados',
    deliverables: [
      'Jupyter Notebooks com análise',
      'Relatório executivo',
      'Modelos de previsão',
      'Dashboard interativo',
      'Recomendações estratégicas'
    ],
  },
  {
    id: '6',
    title: 'Smart Contract para NFT Marketplace',
    description: 'Desenvolvimento de smart contract para marketplace de NFTs com funcionalidades de mint, trade e royalties.',
    value: 4000,
    currency: 'USD',
    status: 'in_progress',
    category: '6', // Blockchain
    tags: ['Solidity', 'Ethereum', 'NFT', 'Web3'],
    createdBy: '1',
    assignedTo: '5',
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-10-12'),
    deadline: new Date('2024-11-25'),
    requirements: 'Experiência com Solidity, Conhecimento em Ethereum, Experiência com NFTs, Conhecimento em Web3',
    deliverables: [
      'Smart contracts auditados',
      'Testes unitários',
      'Documentação técnica',
      'Interface web para interação',
      'Guia de deploy'
    ],
  },
];

export const getBountyById = (id: string): Bounty | undefined => {
  return mockBounties.find(bounty => bounty.id === id);
};

export const getBountiesByStatus = (status: Bounty['status']): Bounty[] => {
  return mockBounties.filter(bounty => bounty.status === status);
};

export const getBountiesByCategory = (categoryId: string): Bounty[] => {
  return mockBounties.filter(bounty => bounty.category === categoryId);
};

export const getBountiesByUser = (userId: string): Bounty[] => {
  return mockBounties.filter(bounty => 
    bounty.createdBy === userId || bounty.assignedTo === userId
  );
};

export const searchBounties = (query: string): Bounty[] => {
  const lowerQuery = query.toLowerCase();
  return mockBounties.filter(bounty => 
    bounty.title.toLowerCase().includes(lowerQuery) ||
    bounty.description.toLowerCase().includes(lowerQuery) ||
    bounty.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getFeaturedBounties = (limit: number = 6): Bounty[] => {
  return mockBounties
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};
