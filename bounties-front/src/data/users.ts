import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-01'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: '5',
    name: 'Carlos Ferreira',
    email: 'carlos@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    role: 'user',
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-10-20'),
  },
];

export const getCurrentUser = (): User => {
  return mockUsers[0]; // Simulando usuário logado
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUsersByRole = (role: User['role']): User[] => {
  return mockUsers.filter(user => user.role === role);
};
