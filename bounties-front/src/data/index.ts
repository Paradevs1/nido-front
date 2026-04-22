// Exportações centralizadas dos dados mockados

export * from './users';
export * from './categories';
export * from './bounties';
export * from './submissions';

// Funções utilitárias para dados
export const getMockData = () => {
  return {
    users: require('./users').mockUsers,
    categories: require('./categories').mockCategories,
    bounties: require('./bounties').mockBounties,
    submissions: require('./submissions').mockSubmissions,
  };
};

// Estatísticas mockadas
export const getMockStats = () => {
  const bounties = require('./bounties').mockBounties;
  const submissions = require('./submissions').mockSubmissions;
  const users = require('./users').mockUsers;

  return {
    totalBounties: bounties.length,
    openBounties: bounties.filter((b: any) => b.status === 'open').length,
    inProgressBounties: bounties.filter((b: any) => b.status === 'in_progress').length,
    completedBounties: bounties.filter((b: any) => b.status === 'completed').length,
    totalSubmissions: submissions.length,
    pendingSubmissions: submissions.filter((s: any) => s.status === 'pending').length,
    approvedSubmissions: submissions.filter((s: any) => s.status === 'approved').length,
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.role !== 'admin').length,
    totalValue: bounties.reduce((sum: number, b: any) => sum + b.value, 0),
  };
};
