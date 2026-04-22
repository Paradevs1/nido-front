import { Submission } from '@/types';

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    bountyId: '2',
    submittedBy: {
      id: '3',
      name: 'João Silva',
      username: 'joao_dev',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    title: 'App Mobile Delivery - Versão Beta',
    description: 'Desenvolvi o aplicativo mobile conforme especificado. Implementei todas as funcionalidades principais: geolocalização, sistema de pagamentos, avaliações e interface intuitiva.',
    files: [
      'https://example.com/files/delivery-app-beta.apk',
      'https://example.com/files/delivery-app-source.zip',
      'https://example.com/files/delivery-app-docs.pdf'
    ],
    attachments: [
      { name: 'APK Android', url: 'https://example.com/files/delivery-app-beta.apk', type: 'application/vnd.android.package-archive' },
      { name: 'Código Fonte', url: 'https://example.com/files/delivery-app-source.zip', type: 'application/zip' },
      { name: 'Documentação', url: 'https://example.com/files/delivery-app-docs.pdf', type: 'application/pdf' }
    ],
    status: 'under_review',
    submittedAt: new Date('2024-10-12'),
    createdAt: new Date('2024-10-12'),
    updatedAt: new Date('2024-10-12'),
    feedback: 'Aguardando revisão técnica dos componentes principais.',
    comments: [
      {
        id: '1',
        author: 'Maria Santos',
        content: 'Excelente trabalho! A interface está muito intuitiva.',
        createdAt: new Date('2024-10-12')
      }
    ]
  },
  {
    id: '2',
    bountyId: '3',
    submittedBy: {
      id: '4',
      name: 'Ana Costa',
      username: 'ana_designer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    title: 'Landing Page Redesign - Finalizado',
    description: 'Completei o redesign da landing page com todas as animações, otimizações para mobile e melhorias de conversão. O design está moderno e alinhado com a identidade da marca.',
    files: [
      'https://example.com/files/landing-page-design.fig',
      'https://example.com/files/landing-page-assets.zip',
      'https://example.com/files/landing-page-prototype.html'
    ],
    attachments: [
      { name: 'Design Figma', url: 'https://example.com/files/landing-page-design.fig', type: 'application/figma' },
      { name: 'Assets', url: 'https://example.com/files/landing-page-assets.zip', type: 'application/zip' },
      { name: 'Protótipo', url: 'https://example.com/files/landing-page-prototype.html', type: 'text/html' }
    ],
    status: 'approved',
    submittedAt: new Date('2024-09-28'),
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-09-30'),
    feedback: 'Excelente trabalho! Design aprovado e implementado com sucesso.',
  },
  {
    id: '3',
    bountyId: '6',
    submittedBy: {
      id: '5',
      name: 'Carlos Blockchain',
      username: 'carlos_web3',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    title: 'Smart Contract NFT Marketplace - Primeira Versão',
    description: 'Desenvolvi o smart contract para o marketplace de NFTs com funcionalidades de mint, trade e sistema de royalties. O contrato foi testado na testnet.',
    files: [
      'https://example.com/files/nft-contract.sol',
      'https://example.com/files/nft-contract-tests.js',
      'https://example.com/files/nft-contract-audit.pdf'
    ],
    attachments: [
      { name: 'Smart Contract', url: 'https://example.com/files/nft-contract.sol', type: 'text/plain' },
      { name: 'Testes', url: 'https://example.com/files/nft-contract-tests.js', type: 'application/javascript' },
      { name: 'Auditoria', url: 'https://example.com/files/nft-contract-audit.pdf', type: 'application/pdf' }
    ],
    status: 'under_review',
    submittedAt: new Date('2024-10-15'),
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
    feedback: 'Contrato em análise de segurança. Aguardando auditoria.',
  },
  {
    id: '4',
    bountyId: '1',
    submittedBy: {
      id: '2',
      name: 'Pedro Analytics',
      username: 'pedro_data',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
    },
    title: 'Dashboard Analytics - Proposta',
    description: 'Criei uma proposta detalhada para o dashboard de analytics com mockups, arquitetura técnica e cronograma de desenvolvimento.',
    files: [
      'https://example.com/files/dashboard-proposal.pdf',
      'https://example.com/files/dashboard-mockups.fig',
      'https://example.com/files/dashboard-architecture.md'
    ],
    attachments: [
      { name: 'Proposta', url: 'https://example.com/files/dashboard-proposal.pdf', type: 'application/pdf' },
      { name: 'Mockups', url: 'https://example.com/files/dashboard-mockups.fig', type: 'application/figma' },
      { name: 'Arquitetura', url: 'https://example.com/files/dashboard-architecture.md', type: 'text/markdown' }
    ],
    status: 'pending',
    submittedAt: new Date('2024-10-16'),
    createdAt: new Date('2024-10-16'),
  },
  {
    id: '5',
    bountyId: '4',
    submittedBy: {
      id: '3',
      name: 'João Silva',
      username: 'joao_dev',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    title: 'Sistema de Autenticação 2FA - Implementação',
    description: 'Implementei o sistema de autenticação com 2FA usando Node.js, JWT e integração com Google Authenticator. Sistema testado e funcionando.',
    files: [
      'https://example.com/files/auth-system.zip',
      'https://example.com/files/auth-api-docs.pdf',
      'https://example.com/files/auth-tests.js'
    ],
    attachments: [
      { name: 'Sistema', url: 'https://example.com/files/auth-system.zip', type: 'application/zip' },
      { name: 'API Docs', url: 'https://example.com/files/auth-api-docs.pdf', type: 'application/pdf' },
      { name: 'Testes', url: 'https://example.com/files/auth-tests.js', type: 'application/javascript' }
    ],
    status: 'under_review',
    submittedAt: new Date('2024-10-14'),
    createdAt: new Date('2024-10-14'),
    updatedAt: new Date('2024-10-14'),
    feedback: 'Sistema em teste de penetração. Resultados em breve.',
  },
  {
    id: '6',
    bountyId: '5',
    submittedBy: {
      id: '4',
      name: 'Ana Costa',
      username: 'ana_designer',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    title: 'Análise de Dados - Primeira Parte',
    description: 'Completei a primeira parte da análise de dados com insights preliminares e visualizações. Trabalhando na segunda parte com machine learning.',
    files: [
      'https://example.com/files/data-analysis-part1.ipynb',
      'https://example.com/files/preliminary-insights.pdf',
      'https://example.com/files/data-visualizations.html'
    ],
    attachments: [
      { name: 'Notebook', url: 'https://example.com/files/data-analysis-part1.ipynb', type: 'application/x-ipynb+json' },
      { name: 'Insights', url: 'https://example.com/files/preliminary-insights.pdf', type: 'application/pdf' },
      { name: 'Visualizações', url: 'https://example.com/files/data-visualizations.html', type: 'text/html' }
    ],
    status: 'pending',
    submittedAt: new Date('2024-10-11'),
    createdAt: new Date('2024-10-11'),
  },
];

export const getSubmissionById = (id: string): Submission | undefined => {
  return mockSubmissions.find(submission => submission.id === id);
};

export const getSubmissionsByBounty = (bountyId: string): Submission[] => {
  return mockSubmissions.filter(submission => submission.bountyId === bountyId);
};

export const getSubmissionsByUser = (userId: string): Submission[] => {
  return mockSubmissions.filter(submission => submission.submittedBy.id === userId);
};

export const getSubmissionsByStatus = (status: Submission['status']): Submission[] => {
  return mockSubmissions.filter(submission => submission.status === status);
};

export const getPendingSubmissions = (): Submission[] => {
  return getSubmissionsByStatus('pending');
};

export const getUnderReviewSubmissions = (): Submission[] => {
  return getSubmissionsByStatus('under_review');
};

export const getApprovedSubmissions = (): Submission[] => {
  return getSubmissionsByStatus('approved');
};

export const getSubmissionsByCampaignId = (campaignId: string): Submission[] => {
  return mockSubmissions.filter(submission => submission.bountyId === campaignId);
};