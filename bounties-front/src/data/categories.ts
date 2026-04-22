import { Category } from '@/types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Desenvolvimento Web',
    description: 'Projetos de desenvolvimento web, frontend e backend',
    icon: '🌐',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Mobile',
    description: 'Desenvolvimento de aplicativos móveis',
    icon: '📱',
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Design',
    description: 'Design de interfaces, UX/UI e identidade visual',
    icon: '🎨',
    color: '#F59E0B',
  },
  {
    id: '4',
    name: 'DevOps',
    description: 'Infraestrutura, deploy e automação',
    icon: '⚙️',
    color: '#8B5CF6',
  },
  {
    id: '5',
    name: 'Data Science',
    description: 'Análise de dados, machine learning e IA',
    icon: '📊',
    color: '#EF4444',
  },
  {
    id: '6',
    name: 'Blockchain',
    description: 'Desenvolvimento de smart contracts e DApps',
    icon: '⛓️',
    color: '#06B6D4',
  },
  {
    id: '7',
    name: 'Game Development',
    description: 'Desenvolvimento de jogos',
    icon: '🎮',
    color: '#EC4899',
  },
  {
    id: '8',
    name: 'Marketing',
    description: 'Estratégias de marketing digital',
    icon: '📈',
    color: '#84CC16',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(category => category.id === id);
};

export const getCategoriesByName = (name: string): Category[] => {
  return mockCategories.filter(category => 
    category.name.toLowerCase().includes(name.toLowerCase())
  );
};
